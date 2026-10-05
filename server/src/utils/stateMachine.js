// Issue Status State Machine for CampusFix
// Enforces valid lifecycle transitions and role-based permissions

const ISSUE_STATUSES = {
  REPORTED: 'REPORTED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
  CANCELLED: 'CANCELLED',
};

const ISSUE_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

const USER_ROLES = {
  ADMIN: 'ADMIN',
  REPORTER: 'REPORTER',
  TECHNICIAN: 'TECHNICIAN',
};

// Allowed transitions mapping: fromStatus -> array of allowed toStatus
const ALLOWED_TRANSITIONS = {
  REPORTED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'ASSIGNED', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  REOPENED: ['ASSIGNED', 'IN_PROGRESS'],
  CLOSED: [],
  CANCELLED: [],
};

/**
 * Validates whether a state transition is permitted based on:
 * - Current and target status
 * - User role
 * - Ownership (reporter)
 * - Assignment (technician)
 */
function validateStatusTransition({
  currentStatus,
  targetStatus,
  userRole,
  isReporter = false,
  isAssignedTech = false,
  resolutionNote = null,
}) {
  if (!ISSUE_STATUSES[targetStatus]) {
    return { valid: false, error: `Invalid target status: '${targetStatus}'` };
  }

  if (currentStatus === targetStatus && targetStatus !== 'ASSIGNED') {
    return { valid: false, error: `Issue is already in status '${currentStatus}'` };
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(targetStatus)) {
    return {
      valid: false,
      error: `Invalid transition from '${currentStatus}' to '${targetStatus}'. Allowed transitions: [${allowedNext.join(', ')}]`,
    };
  }

  // Role & authority checks
  switch (targetStatus) {
    case 'ASSIGNED':
      if (userRole !== USER_ROLES.ADMIN) {
        return { valid: false, error: 'Only administrators can assign technicians' };
      }
      break;

    case 'IN_PROGRESS':
      if (userRole !== USER_ROLES.ADMIN && !isAssignedTech) {
        return { valid: false, error: 'Only the assigned technician or an admin can start work on this issue' };
      }
      break;

    case 'RESOLVED':
      if (userRole !== USER_ROLES.ADMIN && !isAssignedTech) {
        return { valid: false, error: 'Only the assigned technician or an admin can resolve this issue' };
      }
      if (!resolutionNote || typeof resolutionNote !== 'string' || resolutionNote.trim().length < 5) {
        return { valid: false, error: 'A meaningful resolution note (at least 5 characters) is required to resolve an issue' };
      }
      break;

    case 'CLOSED':
      if (userRole !== USER_ROLES.ADMIN && !isReporter) {
        return { valid: false, error: 'Only the reporting user or an admin can close a resolved issue' };
      }
      break;

    case 'REOPENED':
      if (userRole !== USER_ROLES.ADMIN && !isReporter) {
        return { valid: false, error: 'Only the reporting user or an admin can reopen a resolved issue' };
      }
      break;

    case 'CANCELLED':
      if (userRole !== USER_ROLES.ADMIN) {
        if (!isReporter) {
          return { valid: false, error: 'Only the reporter or an admin can cancel this issue' };
        }
        if (currentStatus !== 'REPORTED') {
          return { valid: false, error: 'Reporters can only cancel issues that are still in REPORTED status' };
        }
      }
      break;
  }

  return { valid: true };
}

module.exports = {
  ISSUE_STATUSES,
  ISSUE_PRIORITIES,
  USER_ROLES,
  ALLOWED_TRANSITIONS,
  validateStatusTransition,
};
