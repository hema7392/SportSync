// Reports and Analytics Controller for CampusFix
const prisma = require('../prisma');

/**
 * Helper to build date range filter
 */
const buildDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate) {
    filter.gte = new Date(startDate);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.lte = end;
  }
  return Object.keys(filter).length > 0 ? filter : undefined;
};

/**
 * Overview statistics and KPIs
 */
const getOverview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const issueWhere = dateFilter ? { createdAt: dateFilter } : {};

    const [
      totalIssues,
      resolvedCount,
      closedCount,
      inProgressCount,
      assignedCount,
      reportedCount,
      reopenedCount,
      criticalCount,
      highCount,
      activeTechniciansCount,
      resolvedIssuesWithTime,
    ] = await Promise.all([
      prisma.issue.count({ where: issueWhere }),
      prisma.issue.count({ where: { ...issueWhere, status: 'RESOLVED' } }),
      prisma.issue.count({ where: { ...issueWhere, status: 'CLOSED' } }),
      prisma.issue.count({ where: { ...issueWhere, status: 'IN_PROGRESS' } }),
      prisma.issue.count({ where: { ...issueWhere, status: 'ASSIGNED' } }),
      prisma.issue.count({ where: { ...issueWhere, status: 'REPORTED' } }),
      prisma.issue.count({ where: { ...issueWhere, status: 'REOPENED' } }),
      prisma.issue.count({ where: { ...issueWhere, priority: 'CRITICAL' } }),
      prisma.issue.count({ where: { ...issueWhere, priority: 'HIGH' } }),
      prisma.user.count({ where: { role: 'TECHNICIAN', isActive: true } }),
      prisma.issue.findMany({
        where: {
          ...issueWhere,
          status: { in: ['RESOLVED', 'CLOSED'] },
          resolvedAt: { not: null },
        },
        select: {
          createdAt: true,
          resolvedAt: true,
        },
      }),
    ]);

    const openIssues = reportedCount + assignedCount + inProgressCount + reopenedCount;
    const totalResolved = resolvedCount + closedCount;

    // Calculate Average Resolution Time in hours
    let avgResolutionHours = 0;
    if (resolvedIssuesWithTime.length > 0) {
      const totalMs = resolvedIssuesWithTime.reduce((acc, issue) => {
        const diff = new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime();
        return acc + Math.max(0, diff);
      }, 0);
      avgResolutionHours = parseFloat((totalMs / (resolvedIssuesWithTime.length * 1000 * 60 * 60)).toFixed(1));
    }

    return res.status(200).json({
      totalIssues,
      openIssues,
      resolvedIssues: totalResolved,
      inProgressIssues: inProgressCount,
      reportedIssues: reportedCount,
      assignedIssues: assignedCount,
      reopenedIssues: reopenedCount,
      criticalIssues: criticalCount,
      highPriorityIssues: highCount,
      activeTechnicians: activeTechniciansCount,
      avgResolutionHours,
      avgResolutionDays: parseFloat((avgResolutionHours / 24).toFixed(1)),
      resolutionRate: totalIssues > 0 ? Math.round((totalResolved / totalIssues) * 100) : 0,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Issues breakdown by Category
 */
const getCategoryReports = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const categories = await prisma.category.findMany({
      include: {
        issues: {
          where: dateFilter ? { createdAt: dateFilter } : {},
          select: { status: true, priority: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const data = categories.map((cat) => {
      const total = cat.issues.length;
      const resolved = cat.issues.filter((i) => ['RESOLVED', 'CLOSED'].includes(i.status)).length;
      const open = total - resolved;
      const critical = cat.issues.filter((i) => i.priority === 'CRITICAL').length;

      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        total,
        open,
        resolved,
        critical,
      };
    });

    return res.status(200).json({ categories: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Issues breakdown by Building / Location
 */
const getLocationReports = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const buildings = await prisma.building.findMany({
      include: {
        locations: {
          include: {
            issues: {
              where: dateFilter ? { createdAt: dateFilter } : {},
              select: { status: true, priority: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const data = buildings.map((b) => {
      let total = 0;
      let open = 0;
      let resolved = 0;

      b.locations.forEach((loc) => {
        loc.issues.forEach((iss) => {
          total++;
          if (['RESOLVED', 'CLOSED'].includes(iss.status)) {
            resolved++;
          } else {
            open++;
          }
        });
      });

      return {
        id: b.id,
        name: b.name,
        code: b.code,
        total,
        open,
        resolved,
      };
    });

    return res.status(200).json({ buildings: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Technician workload and performance stats
 */
const getTechnicianReports = async (req, res, next) => {
  try {
    const technicians = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      select: {
        id: true,
        name: true,
        department: true,
        phone: true,
        isActive: true,
        assignedIssues: {
          select: {
            status: true,
            assignedAt: true,
            completedAt: true,
            issue: {
              select: { status: true, priority: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const data = technicians.map((tech) => {
      const totalAssigned = tech.assignedIssues.length;
      const activeAssignments = tech.assignedIssues.filter((a) => a.status === 'ACTIVE').length;
      const completedAssignments = tech.assignedIssues.filter((a) => a.status === 'COMPLETED').length;

      return {
        id: tech.id,
        name: tech.name,
        department: tech.department || 'Maintenance',
        isActive: tech.isActive,
        totalAssigned,
        activeAssignments,
        completedAssignments,
      };
    });

    return res.status(200).json({ technicians: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Monthly / Daily resolution trend
 */
const getTrends = async (req, res, next) => {
  try {
    const issues = await prisma.issue.findMany({
      select: {
        createdAt: true,
        resolvedAt: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by Month or Recent 7 Days
    const trendMap = {};

    issues.forEach((issue) => {
      const monthYear = new Date(issue.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      if (!trendMap[monthYear]) {
        trendMap[monthYear] = { period: monthYear, reported: 0, resolved: 0 };
      }
      trendMap[monthYear].reported++;

      if (issue.resolvedAt) {
        const resolvedMonth = new Date(issue.resolvedAt).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
        if (!trendMap[resolvedMonth]) {
          trendMap[resolvedMonth] = { period: resolvedMonth, reported: 0, resolved: 0 };
        }
        trendMap[resolvedMonth].resolved++;
      }
    });

    const trends = Object.values(trendMap);

    return res.status(200).json({ trends });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOverview,
  getCategoryReports,
  getLocationReports,
  getTechnicianReports,
  getTrends,
};
