// User Management Controller for CampusFix
const prisma = require('../prisma');

/**
 * List all users with filtering and search (ADMIN only)
 */
const getUsers = async (req, res, next) => {
  try {
    const { search, role, isActive } = req.query;
    const where = {};

    if (role) {
      where.role = role.toUpperCase();
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { department: { contains: q } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            reportedIssues: true,
            assignedIssues: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

/**
 * Get active technicians (accessible to ADMIN and authenticated users for info)
 */
const getTechnicians = async (req, res, next) => {
  try {
    const technicians = await prisma.user.findMany({
      where: {
        role: 'TECHNICIAN',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        phone: true,
        _count: {
          select: {
            assignedIssues: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ technicians });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single user by ID (ADMIN only)
 */
const getUserById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            reportedIssues: true,
            assignedIssues: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user status (Activate/Deactivate) or details (ADMIN only)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { isActive, role, department, phone } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Safety rule: Admin cannot deactivate themselves or remove their own admin role
    if (req.user.id === id) {
      if (isActive === false) {
        return res.status(400).json({ message: 'You cannot deactivate your own administrative account.' });
      }
      if (role && role !== 'ADMIN') {
        return res.status(400).json({ message: 'You cannot revoke your own administrator role.' });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(role !== undefined ? { role: role.toUpperCase() } : {}),
        ...(department !== undefined ? { department: department?.trim() || null } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: 'User updated successfully',
      user: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  getTechnicians,
  getUserById,
  updateUserStatus,
};
