// Issue Controller for CampusFix
const prisma = require('../prisma');
const { validateStatusTransition, ISSUE_PRIORITIES } = require('../utils/stateMachine');
const notificationService = require('../services/notificationService');

/**
 * List issues with multi-criteria server-side filtering, search, and sorting
 */
const getIssues = async (req, res, next) => {
  try {
    const {
      status,
      categoryId,
      priority,
      buildingId,
      locationId,
      technicianId,
      reporterId,
      search,
      startDate,
      endDate,
      sortBy = 'newest',
    } = req.query;

    const where = {};

    // Role-based visibility scoping: Technicians only see their assigned issues
    if (req.user && req.user.role === 'TECHNICIAN') {
      where.assignments = {
        some: {
          technicianId: req.user.id,
        },
      };
    }

    // Explicit technician filter
    if (technicianId) {
      where.assignments = {
        some: {
          technicianId: parseInt(technicianId, 10),
          status: 'ACTIVE',
        },
      };
    }

    // Reporter filter
    if (reporterId) {
      where.reporterId = parseInt(reporterId, 10);
    }

    // Status filter
    if (status) {
      where.status = status.toUpperCase();
    }

    // Priority filter
    if (priority) {
      where.priority = priority.toUpperCase();
    }

    // Category filter
    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    }

    // Location / Building filter
    if (locationId) {
      where.locationId = parseInt(locationId, 10);
    } else if (buildingId) {
      where.location = {
        buildingId: parseInt(buildingId, 10),
      };
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Full-text & ID search
    if (search && search.trim()) {
      const q = search.trim();
      const numId = parseInt(q, 10);
      const orConditions = [
        { title: { contains: q } },
        { description: { contains: q } },
        { specificArea: { contains: q } },
      ];
      if (!isNaN(numId)) {
        orConditions.push({ id: numId });
      }
      where.OR = orConditions;
    }

    // Sorting
    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sortBy === 'updated') {
      orderBy = { updatedAt: 'desc' };
    } else if (sortBy === 'priority') {
      // Prioritize CRITICAL -> HIGH -> MEDIUM -> LOW
      // In Prisma SQLite/Postgres we can order by priority or sort in application
      orderBy = [{ priority: 'asc' }, { createdAt: 'desc' }];
    }

    const issues = await prisma.issue.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, icon: true } },
        location: {
          select: {
            id: true,
            name: true,
            floor: true,
            building: { select: { id: true, name: true, code: true } },
          },
        },
        reporter: { select: { id: true, name: true, email: true, department: true } },
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            technician: { select: { id: true, name: true, email: true, phone: true } },
          },
          take: 1,
        },
        _count: {
          select: { comments: true, history: true },
        },
      },
      orderBy,
    });

    return res.status(200).json({ issues, count: issues.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single issue by ID with full timeline, comments, and assignment history
 */
const getIssueById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        category: true,
        location: {
          include: { building: true },
        },
        reporter: {
          select: { id: true, name: true, email: true, department: true, phone: true },
        },
        assignments: {
          include: {
            technician: { select: { id: true, name: true, email: true, phone: true } },
            assignedBy: { select: { id: true, name: true, email: true } },
          },
          orderBy: { assignedAt: 'desc' },
        },
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        history: {
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Role-based visibility check: Technicians can only view assigned issues
    if (req.user && req.user.role === 'TECHNICIAN') {
      const isAssigned = issue.assignments.some(
        (a) => a.technicianId === req.user.id
      );
      if (!isAssigned) {
        return res.status(403).json({ message: 'You are not assigned to view this issue.' });
      }
    }

    return res.status(200).json({ issue });
  } catch (err) {
    next(err);
  }
};

/**
 * Report a new issue
 */
const createIssue = async (req, res, next) => {
  try {
    const { title, description, categoryId, locationId, specificArea, priority, imageUrl } = req.body;
    const userId = req.user.id;

    // Rule: Technicians cannot submit normal complaints
    if (req.user.role === 'TECHNICIAN') {
      return res.status(403).json({
        message: 'Technicians cannot report issues. Please use a Reporter or Admin account.',
      });
    }

    // Validate Category exists and is active
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category || !category.isActive) {
      return res.status(400).json({ message: 'The selected category is inactive or does not exist.' });
    }

    // Validate Location exists and is active
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: { building: true },
    });
    if (!location || !location.isActive || !location.building.isActive) {
      return res.status(400).json({ message: 'The selected location or building is inactive or does not exist.' });
    }

    // Create Issue and initial history entry
    const issue = await prisma.issue.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        reporterId: userId,
        categoryId,
        locationId,
        specificArea: specificArea?.trim() || null,
        priority: priority ? priority.toUpperCase() : 'MEDIUM',
        status: 'REPORTED',
        imageUrl: imageUrl?.trim() || null,
        history: {
          create: {
            userId,
            action: 'CREATED',
            fromStatus: null,
            toStatus: 'REPORTED',
            description: `Issue reported by ${req.user.name}`,
          },
        },
      },
      include: {
        category: true,
        location: { include: { building: true } },
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(201).json({
      message: 'Issue reported successfully',
      issue,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update issue fields (Admin or Reporter before work starts)
 */
const updateIssue = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, priority, categoryId, locationId, specificArea, imageUrl } = req.body;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: { assignments: { where: { status: 'ACTIVE' } } },
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = req.user.id === issue.reporterId;

    if (!isAdmin) {
      if (!isOwner) {
        return res.status(403).json({ message: 'Unauthorized to modify this issue' });
      }
      if (issue.status !== 'REPORTED') {
        return res.status(400).json({
          message: 'Issues can only be edited while still in REPORTED status.',
        });
      }
    }

    // If category changing, validate
    if (categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: parseInt(categoryId, 10) } });
      if (!cat || !cat.isActive) {
        return res.status(400).json({ message: 'Selected category is inactive or does not exist' });
      }
    }

    // If location changing, validate
    if (locationId) {
      const loc = await prisma.location.findUnique({
        where: { id: parseInt(locationId, 10) },
        include: { building: true },
      });
      if (!loc || !loc.isActive || !loc.building.isActive) {
        return res.status(400).json({ message: 'Selected location is inactive or does not exist' });
      }
    }

    // Check if priority changed to record audit
    const priorityChanged = priority && priority.toUpperCase() !== issue.priority;

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(priority !== undefined ? { priority: priority.toUpperCase() } : {}),
        ...(categoryId !== undefined ? { categoryId: parseInt(categoryId, 10) } : {}),
        ...(locationId !== undefined ? { locationId: parseInt(locationId, 10) } : {}),
        ...(specificArea !== undefined ? { specificArea: specificArea?.trim() || null } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl?.trim() || null } : {}),
        ...(priorityChanged
          ? {
              history: {
                create: {
                  userId: req.user.id,
                  action: 'PRIORITY_CHANGED',
                  fromStatus: issue.status,
                  toStatus: issue.status,
                  description: `Priority changed from ${issue.priority} to ${priority.toUpperCase()} by ${req.user.name}`,
                },
              },
            }
          : {}),
      },
      include: {
        category: true,
        location: { include: { building: true } },
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(200).json({ message: 'Issue updated successfully', issue: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * Reopen a resolved issue
 */
const reopenIssue = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reason } = req.body;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        assignments: { where: { status: 'ACTIVE' } },
      },
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = req.user.id === issue.reporterId;

    const validation = validateStatusTransition({
      currentStatus: issue.status,
      targetStatus: 'REOPENED',
      userRole: req.user.role,
      isReporter: isOwner,
    });

    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        status: 'REOPENED',
        reopenedAt: new Date(),
        history: {
          create: {
            userId: req.user.id,
            action: 'REOPENED',
            fromStatus: issue.status,
            toStatus: 'REOPENED',
            description: `Issue reopened by ${req.user.name}: "${reason}"`,
          },
        },
      },
    });

    // Notify assigned technician if there was one
    const lastAssignment = await prisma.issueAssignment.findFirst({
      where: { issueId: id },
      orderBy: { assignedAt: 'desc' },
    });
    if (lastAssignment) {
      await notificationService.notifyIssueReopened(
        lastAssignment.technicianId,
        id,
        issue.title,
        reason
      );
    }

    return res.status(200).json({ message: 'Issue reopened successfully', issue: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel an issue (Reporter if still REPORTED, or Admin)
 */
const cancelIssue = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reason } = req.body;

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = req.user.id === issue.reporterId;

    const validation = validateStatusTransition({
      currentStatus: issue.status,
      targetStatus: 'CANCELLED',
      userRole: req.user.role,
      isReporter: isOwner,
    });

    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        history: {
          create: {
            userId: req.user.id,
            action: 'CANCELLED',
            fromStatus: issue.status,
            toStatus: 'CANCELLED',
            description: `Issue cancelled by ${req.user.name}${reason ? ': ' + reason : ''}`,
          },
        },
      },
    });

    return res.status(200).json({ message: 'Issue cancelled successfully', issue: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * Close a resolved issue (Reporter or Admin)
 */
const closeIssue = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = req.user.id === issue.reporterId;

    const validation = validateStatusTransition({
      currentStatus: issue.status,
      targetStatus: 'CLOSED',
      userRole: req.user.role,
      isReporter: isOwner,
    });

    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        history: {
          create: {
            userId: req.user.id,
            action: 'CLOSED',
            fromStatus: issue.status,
            toStatus: 'CLOSED',
            description: `Issue confirmed and closed by ${req.user.name}`,
          },
        },
      },
    });

    return res.status(200).json({ message: 'Issue closed successfully', issue: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * Add a comment or work note to an issue
 */
const addComment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { message, isInternal } = req.body;
    const userId = req.user.id;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        assignments: { where: { status: 'ACTIVE' } },
      },
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Role check: Technicians can only comment on assigned issues
    if (req.user.role === 'TECHNICIAN') {
      const isAssigned = issue.assignments.some((a) => a.technicianId === userId);
      if (!isAssigned) {
        return res.status(403).json({ message: 'Technicians can only comment on assigned issues.' });
      }
    }

    const comment = await prisma.issueComment.create({
      data: {
        issueId: id,
        userId,
        message: message.trim(),
        isInternal: req.user.role === 'REPORTER' ? false : Boolean(isInternal),
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    // Record in history
    await prisma.issueHistory.create({
      data: {
        issueId: id,
        userId,
        action: 'COMMENT_ADDED',
        fromStatus: issue.status,
        toStatus: issue.status,
        description: `${isInternal ? 'Internal work note' : 'Comment'} added by ${req.user.name}`,
      },
    });

    return res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  reopenIssue,
  cancelIssue,
  closeIssue,
  addComment,
};
