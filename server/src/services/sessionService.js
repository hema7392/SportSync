const prisma = require('../prisma');

/**
 * Checks whether a user already has an active session scheduled at a specific startDateTime.
 * An active session is one where the user is either the creator or a joined participant,
 * and the session is NOT cancelled.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} startDateTime - The session start date & time.
 * @param {object} tx - Prisma client or transaction instance.
 * @returns {Promise<boolean>} True if a conflict exists, false otherwise.
 */
async function hasSchedulingConflict(userId, startDateTime, tx = prisma) {
  const conflictingCreated = await tx.sportSession.findFirst({
    where: {
      creatorId: userId,
      startDateTime: startDateTime,
      status: { not: 'CANCELLED' },
    },
  });

  if (conflictingCreated) {
    return true;
  }

  const conflictingJoined = await tx.sessionParticipant.findFirst({
    where: {
      userId: userId,
      session: {
        startDateTime: startDateTime,
        status: { not: 'CANCELLED' },
      },
    },
  });

  return !!conflictingJoined;
}

/**
 * Verifies if a session is joinable:
 * - Session must exist
 * - Session must not be cancelled
 * - Session startDateTime must not be in the past
 * - User must not already be joined
 * - User must not be the creator
 * - There must be available slots left
 * - User must have no scheduling conflict
 */
async function validateJoinEligibility(session, userId, tx = prisma) {
  if (!session) {
    const error = new Error('Session not found.');
    error.statusCode = 404;
    throw error;
  }

  if (session.status === 'CANCELLED') {
    const error = new Error('Cannot join a cancelled session.');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  if (new Date(session.startDateTime) <= now) {
    const error = new Error('This session has already started or ended and can no longer be joined.');
    error.statusCode = 400;
    throw error;
  }

  if (session.creatorId === userId) {
    const error = new Error('You cannot join a session you created as a participant slot.');
    error.statusCode = 400;
    throw error;
  }

  const alreadyJoined = session.participants.some((p) => p.userId === userId);
  if (alreadyJoined) {
    const error = new Error('You have already joined this session.');
    error.statusCode = 400;
    throw error;
  }

  if (session.participants.length >= session.additionalPlayersRequired) {
    const error = new Error('This session is full. No available slots remaining.');
    error.statusCode = 400;
    throw error;
  }

  const conflict = await hasSchedulingConflict(userId, session.startDateTime, tx);
  if (conflict) {
    const error = new Error('You already have a session scheduled at this date and time.');
    error.statusCode = 400;
    throw error;
  }

  return true;
}

module.exports = {
  hasSchedulingConflict,
  validateJoinEligibility,
};
