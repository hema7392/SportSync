const prisma = require('../prisma');

// GET /api/reports/sessions - Generate played sessions & sport popularity report (Admin only)
async function getSessionReports(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    const now = new Date();

    // Default to last 30 days if no date range is provided
    let rangeStart;
    let rangeEnd;

    if (startDate) {
      rangeStart = new Date(`${startDate}T00:00:00.000Z`);
    } else {
      rangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      rangeStart.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      rangeEnd = new Date(`${endDate}T23:59:59.999Z`);
    } else {
      rangeEnd = new Date(now);
      rangeEnd.setHours(23, 59, 59, 999);
    }

    if (isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime())) {
      return res.status(400).json({ message: 'Invalid start date or end date format.' });
    }

    if (rangeStart > rangeEnd) {
      return res.status(400).json({ message: 'Start date cannot be after end date.' });
    }

    // A session is considered "played" if:
    // 1. startDateTime is in the past (<= now)
    // 2. session was not cancelled (status !== 'CANCELLED')
    // 3. startDateTime falls within [rangeStart, rangeEnd]
    const effectiveCutoff = rangeEnd < now ? rangeEnd : now;

    const playedSessions = await prisma.sportSession.findMany({
      where: {
        status: { not: 'CANCELLED' },
        startDateTime: {
          gte: rangeStart,
          lte: effectiveCutoff,
        },
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
      orderBy: { startDateTime: 'asc' },
    });

    const totalSessionsPlayed = playedSessions.length;

    // Calculate popularity per sport
    const sportCounts = {};
    for (const session of playedSessions) {
      const sportName = session.sport.name;
      if (!sportCounts[sportName]) {
        sportCounts[sportName] = {
          sportId: session.sportId,
          sportName: sportName,
          count: 0,
        };
      }
      sportCounts[sportName].count += 1;
    }

    const sportPopularity = Object.values(sportCounts)
      .map((item) => ({
        ...item,
        percentage:
          totalSessionsPlayed > 0
            ? Math.round((item.count / totalSessionsPlayed) * 100)
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Group by date for trends
    const trendMap = {};
    for (const session of playedSessions) {
      const dateKey = session.sessionDate;
      trendMap[dateKey] = (trendMap[dateKey] || 0) + 1;
    }

    const dailyTrend = Object.keys(trendMap)
      .sort()
      .map((date) => ({
        date,
        count: trendMap[date],
      }));

    return res.status(200).json({
      startDate: rangeStart.toISOString().split('T')[0],
      endDate: rangeEnd.toISOString().split('T')[0],
      totalSessionsPlayed,
      sportPopularity,
      dailyTrend,
      sessions: playedSessions.map((s) => ({
        id: s.id,
        sportName: s.sport.name,
        sessionDate: s.sessionDate,
        sessionTime: s.sessionTime,
        venue: s.venue,
        creatorName: s.creator.name,
        playersCount: s.participants.length,
      })),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSessionReports,
};
