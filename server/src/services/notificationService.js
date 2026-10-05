// Notification service for CampusFix
const prisma = require('../prisma');

/**
 * Create a single in-app notification
 */
async function createNotification({ userId, issueId = null, title, message }) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        issueId,
        title,
        message,
        isRead: false,
      },
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
}

/**
 * Notify technician when assigned to an issue
 */
async function notifyTechnicianAssigned(technicianId, issueId, issueTitle) {
  return createNotification({
    userId: technicianId,
    issueId,
    title: 'New Issue Assignment',
    message: `You have been assigned to issue #${issueId}: "${issueTitle}".`,
  });
}

/**
 * Notify reporter when their issue status changes
 */
async function notifyReporterStatusChanged(reporterId, issueId, issueTitle, newStatus) {
  return createNotification({
    userId: reporterId,
    issueId,
    title: 'Issue Status Updated',
    message: `Your report #${issueId} ("${issueTitle}") is now marked as ${newStatus}.`,
  });
}

/**
 * Notify reporter when issue is resolved
 */
async function notifyReporterResolved(reporterId, issueId, issueTitle, resolutionNote) {
  return createNotification({
    userId: reporterId,
    issueId,
    title: 'Issue Resolved',
    message: `Your issue #${issueId} ("${issueTitle}") has been resolved. Note: "${resolutionNote}". Please review and close or reopen if needed.`,
  });
}

/**
 * Notify technician or admins when an issue is reopened
 */
async function notifyIssueReopened(technicianId, issueId, issueTitle, reason) {
  if (technicianId) {
    await createNotification({
      userId: technicianId,
      issueId,
      title: 'Issue Reopened',
      message: `Issue #${issueId} ("${issueTitle}") has been reopened by the reporter. Reason: "${reason}".`,
    });
  }
}

module.exports = {
  createNotification,
  notifyTechnicianAssigned,
  notifyReporterStatusChanged,
  notifyReporterResolved,
  notifyIssueReopened,
};
