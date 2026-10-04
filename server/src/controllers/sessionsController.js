const prisma = require('../prisma');
const {
  hasSchedulingConflict,
  validateJoinEligibility,
} = require('../services/sessionService');

// Helper to auto-update past upcoming sessions to COMPLETED
async function refreshSessionStatuses() {
  const now = new Date();
  await prisma.sportSession.updateMany({
    where: {
      status: 'UPCOMING',
      startDateTime: { lt: now },
    },
    data: {
      status: 'COMPLETED',
    },
  });
}

// POST /api/sessions - Create a new sport session
async function createSession(req, res, next) {
  try {
    const {
      sportId,
      sessionDate,
      sessionTime,
      venue,
      teamA,
      teamB,
      additionalPlayersRequired,
    } = req.body;

    const parsedSportId = parseInt(sportId, 10);
    const parsedSlots = parseInt(additionalPlayersRequired, 10);

    // Verify sport exists
    const sport = await prisma.sport.findUnique({
      where: { id: parsedSportId },
    });
    if (!sport) {
      return res.status(404).json({ message: 'Selected sport does not exist.' });
    }

    // Verify date and time is in the future
    const startDateTime = new Date(`${sessionDate}T${sessionTime}:00`);
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({ message: 'Invalid session date or time.' });
    }

    const now = new Date();
    if (startDateTime <= now) {
      return res.status(400).json({
        message: 'Session date and time must be in the future. Past sessions cannot be scheduled.',
      });
    }

    // Optional Feature 2: Conflict check for creator
    // Check if creator already has a session at this date & time
    const conflictingSession = await prisma.sportSession.findFirst({
      where: {
        creatorId: req.user.id,
        startDateTime: startDateTime,
        status: { not: 'CANCELLED' },
      },
    });

    const conflictingJoined = await prisma.sessionParticipant.findFirst({
      where: {
        userId: req.user.id,
        session: {
          startDateTime: startDateTime,
          status: { not: 'CANCELLED' },
        },
      },
    });

    if (conflictingSession || conflictingJoined) {
      return res.status(400).json({
        message: 'You already have a session scheduled at this date and time.',
      });
    }

    const formattedTeamA = Array.isArray(teamA)
      ? JSON.stringify(teamA.filter((p) => p && p.trim().length > 0))
      : typeof teamA === 'string' && teamA.trim().length > 0
      ? JSON.stringify(teamA.split(',').map((s) => s.trim()).filter(Boolean))
      : JSON.stringify([]);

    const formattedTeamB = Array.isArray(teamB)
      ? JSON.stringify(teamB.filter((p) => p && p.trim().length > 0))
      : typeof teamB === 'string' && teamB.trim().length > 0
      ? JSON.stringify(teamB.split(',').map((s) => s.trim()).filter(Boolean))
      : JSON.stringify([]);

    const session = await prisma.sportSession.create({
      data: {
        sportId: parsedSportId,
        creatorId: req.user.id,
        sessionDate,
        sessionTime,
        startDateTime,
        venue: venue.trim(),
        teamA: formattedTeamA,
        teamB: formattedTeamB,
        additionalPlayersRequired: parsedSlots,
        status: 'UPCOMING',
      },
      include: {
        sport: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Sport session created successfully.',
      session,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/sessions - Browse available sessions (upcoming, not cancelled, slots available)
async function getAvailableSessions(req, res, next) {
  try {
    await refreshSessionStatuses();

    const now = new Date();
    const { sportId } = req.query;

    const whereClause = {
      status: 'UPCOMING',
      startDateTime: { gt: now },
    };

    if (sportId) {
      whereClause.sportId = parseInt(sportId, 10);
    }

    const sessions = await prisma.sportSession.findMany({
      where: whereClause,
      include: {
        sport: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { startDateTime: 'asc' },
    });

    // Only return sessions with remaining available slots
    const availableSessions = sessions
      .map((session) => {
        const slotsFilled = session.participants.length;
        const slotsTotal = session.additionalPlayersRequired;
        const slotsAvailable = Math.max(0, slotsTotal - slotsFilled);
        const hasJoined = session.participants.some((p) => p.userId === req.user.id);
        const isCreator = session.creatorId === req.user.id;

        return {
          ...session,
          slotsTotal,
          slotsFilled,
          slotsAvailable,
          hasJoined,
          isCreator,
        };
      })
      .filter((s) => s.slotsAvailable > 0);

    return res.status(200).json({ sessions: availableSessions });
  } catch (error) {
    next(error);
  }
}

// GET /api/sessions/created - View sessions created by current user
async function getCreatedSessions(req, res, next) {
  try {
    await refreshSessionStatuses();

    const sessions = await prisma.sportSession.findMany({
      where: { creatorId: req.user.id },
      include: {
        sport: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { startDateTime: 'desc' },
    });

    const formattedSessions = sessions.map((session) => {
      const slotsFilled = session.participants.length;
      const slotsTotal = session.additionalPlayersRequired;
      const slotsAvailable = Math.max(0, slotsTotal - slotsFilled);

      return {
        ...session,
        slotsTotal,
        slotsFilled,
        slotsAvailable,
        isCreator: true,
      };
    });

    return res.status(200).json({ sessions: formattedSessions });
  } catch (error) {
    next(error);
  }
}

// GET /api/sessions/joined - View sessions joined by current user
async function getJoinedSessions(req, res, next) {
  try {
    await refreshSessionStatuses();

    const participations = await prisma.sessionParticipant.findMany({
      where: { userId: req.user.id },
      include: {
        session: {
          include: {
            sport: true,
            creator: {
              select: { id: true, name: true, email: true },
            },
            participants: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: {
        session: {
          startDateTime: 'desc',
        },
      },
    });

    const sessions = participations.map((p) => {
      const s = p.session;
      const slotsFilled = s.participants.length;
      const slotsTotal = s.additionalPlayersRequired;
      const slotsAvailable = Math.max(0, slotsTotal - slotsFilled);

      return {
        ...s,
        joinedAt: p.joinedAt,
        playerTeam: p.team,
        slotsTotal,
        slotsFilled,
        slotsAvailable,
        isCreator: s.creatorId === req.user.id,
        hasJoined: true,
      };
    });

    return res.status(200).json({ sessions });
  } catch (error) {
    next(error);
  }
}

// GET /api/sessions/:id - View session details
async function getSessionById(req, res, next) {
  try {
    await refreshSessionStatuses();

    const sessionId = parseInt(req.params.id, 10);
    const session = await prisma.sportSession.findUnique({
      where: { id: sessionId },
      include: {
        sport: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const slotsFilled = session.participants.length;
    const slotsTotal = session.additionalPlayersRequired;
    const slotsAvailable = Math.max(0, slotsTotal - slotsFilled);
    const hasJoined = session.participants.some((p) => p.userId === req.user.id);
    const isCreator = session.creatorId === req.user.id;

    return res.status(200).json({
      session: {
        ...session,
        slotsTotal,
        slotsFilled,
        slotsAvailable,
        hasJoined,
        isCreator,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/sessions/:id/join - Join a sport session
async function joinSession(req, res, next) {
  try {
    const sessionId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { team } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch session with current participants
      const session = await tx.sportSession.findUnique({
        where: { id: sessionId },
        include: {
          participants: true,
          sport: true,
        },
      });

      // 2. Validate all join eligibility rules (exists, not cancelled, not past, not duplicate, not full, no conflict)
      await validateJoinEligibility(session, userId, tx);

      // 3. Add participant
      const participant = await tx.sessionParticipant.create({
        data: {
          sessionId,
          userId,
          team: team || null,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      // 4. Fetch updated session details
      const updatedSession = await tx.sportSession.findUnique({
        where: { id: sessionId },
        include: {
          sport: true,
          creator: { select: { id: true, name: true, email: true } },
          participants: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      return { participant, updatedSession };
    });

    const slotsFilled = result.updatedSession.participants.length;
    const slotsTotal = result.updatedSession.additionalPlayersRequired;
    const slotsAvailable = Math.max(0, slotsTotal - slotsFilled);

    return res.status(200).json({
      message: 'Successfully joined the sport session!',
      session: {
        ...result.updatedSession,
        slotsTotal,
        slotsFilled,
        slotsAvailable,
        hasJoined: true,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/sessions/:id/cancel - Cancel a created session
async function cancelSession(req, res, next) {
  try {
    const sessionId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { reason } = req.body;

    const session = await prisma.sportSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    // Only the creator can cancel
    if (session.creatorId !== userId) {
      return res.status(403).json({
        message: 'Only the creator of this session is authorized to cancel it.',
      });
    }

    if (session.status === 'CANCELLED') {
      return res.status(400).json({
        message: 'This session is already cancelled.',
        cancellationReason: session.cancellationReason,
        cancelledAt: session.cancelledAt,
      });
    }

    const updatedSession = await prisma.sportSession.update({
      where: { id: sessionId },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason.trim(),
        cancelledAt: new Date(),
      },
      include: {
        sport: true,
        creator: { select: { id: true, name: true, email: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return res.status(200).json({
      message: 'Session has been cancelled successfully.',
      session: updatedSession,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSession,
  getAvailableSessions,
  getCreatedSessions,
  getJoinedSessions,
  getSessionById,
  joinSession,
  cancelSession,
};
