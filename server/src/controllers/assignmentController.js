// Assignment and Technician Workflow Controller for CampusFix
const prisma = require('../prisma');
const { validateStatusTransition } = require('../utils/stateMachine');
const notificationService = require('../services/notificationService');

/**
 * Assign issue to a technician (ADMIN only)
 */
const assignTechnician = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { technicianId } = req.body;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: { assignments: { where: { status: 'ACTIVE' } } },
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (['CLOSED', 'CANCELLED'].includes(issue.status)) {
      return res.status(400).json({
        message: `Cannot assign technician to an issue that is already ${issue.status}.`,
      });
    }

    // Verify technician
    const technician = await prisma.user.findUnique({
      where: { id: parseInt(technicianId, 10) },
    });

    if (!technician || technician.role !== 'TECHNICIAN') {
      return res.status(400).json({ message: 'Selected user is not a valid technician.' });
    }

    if (!technician.isActive) {
      return res.status(400).json({ message: 'Selected technician is currently deactivated and cannot be assigned.' });
    }

    // Mark previous active assignments as REASSIGNED
    await prisma.issueAssignment.updateMany({
      where: { issueId: id, status: 'ACTIVE' },
      data: { status: 'REASSIGNED' },
    });

    // Create new active assignment
    const assignment = await prisma.issueAssignment.create({
      data: {
        issueId: id,
        technicianId: technician.id,
        assignedById: req.user.id,
        status: 'ACTIVE',
      },
      include: {
        technician: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    const prevStatus = issue.status;
    const newStatus = 'ASSIGNED';

    // Update issue status to ASSIGNED if needed
    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        status: newStatus,
        history: {
          create: {
            userId: req.user.id,
            action: 'ASSIGNED',
            fromStatus: prevStatus,
            toStatus: newStatus,
            description: `Assigned to technician ${technician.name} by ${req.user.name}`,
          },
        },
      },
      include: {
        category: true,
        location: { include: { building: true } },
        reporter: { select: { id: true, name: true, email: true } },
        assignments: {
          where: { status: 'ACTIVE' },
          include: { technician: true },
        },
      },
    });

    // Send notifications
    await notificationService.notifyTechnicianAssigned(technician.id, id, issue.title);
    await notificationService.notifyReporterStatusChanged(issue.reporterId, id, issue.title, newStatus);

    return res.status(200).json({
      message: `Issue assigned to ${technician.name}`,
      assignment,
      issue: updatedIssue,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Accept assignment and start work (Technician or Admin)
 */
const acceptAndStartWork = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        assignments: { where: { status: 'ACTIVE' } },
      },
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const activeAssignment = issue.assignments[0];
    const isAssignedTech = activeAssignment && activeAssignment.technicianId === userId;

    if (!isAdmin && !isAssignedTech) {
      return res.status(403).json({
        message: 'Only the assigned technician or an administrator can accept or start work on this issue.',
      });
    }

    const validation = validateStatusTransition({
      currentStatus: issue.status,
      targetStatus: 'IN_PROGRESS',
      userRole: req.user.role,
      isAssignedTech,
    });

    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        history: {
          create: {
            userId,
            action: 'STATUS_CHANGED',
            fromStatus: issue.status,
            toStatus: 'IN_PROGRESS',
            description: `Work started by ${req.user.name}`,
          },
        },
      },
    });

    await notificationService.notifyReporterStatusChanged(
      issue.reporterId,
      id,
      issue.title,
      'IN_PROGRESS'
    );

    return res.status(200).json({
      message: 'Work started on issue',
      issue: updatedIssue,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark issue as resolved (Technician or Admin)
 * Requires resolutionNote
 */
const resolveIssue = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { resolutionNote } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!resolutionNote || typeof resolutionNote !== 'string' || resolutionNote.trim().length < 5) {
      return res.status(400).json({
        message: 'A detailed resolution note (at least 5 characters) is required to resolve this issue.',
      });
    }

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        assignments: { where: { status: 'ACTIVE' } },
      },
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const activeAssignment = issue.assignments[0];
    const isAssignedTech = activeAssignment && activeAssignment.technicianId === userId;

    if (!isAdmin && !isAssignedTech) {
      return res.status(403).json({
        message: 'Only the assigned technician or an administrator can resolve this issue.',
      });
    }

    const validation = validateStatusTransition({
      currentStatus: issue.status,
      targetStatus: 'RESOLVED',
      userRole: req.user.role,
      isAssignedTech,
      resolutionNote,
    });

    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    const now = new Date();

    // Mark active assignment completed
    if (activeAssignment) {
      await prisma.issueAssignment.update({
        where: { id: activeAssignment.id },
        data: {
          status: 'COMPLETED',
          completedAt: now,
        },
      });
    }

    // Update issue
    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNote: resolutionNote.trim(),
        resolvedAt: now,
        history: {
          create: {
            userId,
            action: 'RESOLVED',
            fromStatus: issue.status,
            toStatus: 'RESOLVED',
            description: `Resolved by ${req.user.name}: "${resolutionNote.trim()}"`,
          },
        },
      },
      include: {
        category: true,
        location: { include: { building: true } },
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify reporter
    await notificationService.notifyReporterResolved(
      issue.reporterId,
      id,
      issue.title,
      resolutionNote.trim()
    );

    return res.status(200).json({
      message: 'Issue resolved successfully',
      issue: updatedIssue,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  assignTechnician,
  acceptAndStartWork,
  resolveIssue,
};
