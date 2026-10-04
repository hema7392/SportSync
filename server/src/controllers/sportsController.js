const prisma = require('../prisma');

// GET /api/sports - View all available sports
async function getAllSports(req, res, next) {
  try {
    const sports = await prisma.sport.findMany({
      orderBy: { name: 'asc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { sessions: true },
        },
      },
    });

    return res.status(200).json({ sports });
  } catch (error) {
    next(error);
  }
}

// GET /api/sports/created - View sports created by the current admin
async function getMyCreatedSports(req, res, next) {
  try {
    const sports = await prisma.sport.findMany({
      where: { createdById: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { sessions: true },
        },
      },
    });

    return res.status(200).json({ sports });
  } catch (error) {
    next(error);
  }
}

// GET /api/sports/:id - View single sport details
async function getSportById(req, res, next) {
  try {
    const sportId = parseInt(req.params.id, 10);
    const sport = await prisma.sport.findUnique({
      where: { id: sportId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        sessions: {
          orderBy: { startDateTime: 'desc' },
          take: 10,
        },
      },
    });

    if (!sport) {
      return res.status(404).json({ message: 'Sport not found.' });
    }

    return res.status(200).json({ sport });
  } catch (error) {
    next(error);
  }
}

// POST /api/sports - Create a new sport (Admin only)
async function createSport(req, res, next) {
  try {
    const { name } = req.body;
    const trimmedName = name.trim();

    // Check for duplicate sport (case-insensitive)
    const existingSport = await prisma.sport.findFirst({
      where: {
        name: {
          equals: trimmedName,
        },
      },
    });

    if (existingSport) {
      return res.status(400).json({
        message: `Sport "${trimmedName}" already exists.`,
      });
    }

    const sport = await prisma.sport.create({
      data: {
        name: trimmedName,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return res.status(201).json({
      message: 'Sport created successfully.',
      sport,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/sports/:id - Delete a sport (Admin only)
async function deleteSport(req, res, next) {
  try {
    const sportId = parseInt(req.params.id, 10);

    const sport = await prisma.sport.findUnique({
      where: { id: sportId },
      include: {
        _count: { select: { sessions: true } },
      },
    });

    if (!sport) {
      return res.status(404).json({ message: 'Sport not found.' });
    }

    await prisma.sport.delete({
      where: { id: sportId },
    });

    return res.status(200).json({
      message: `Sport "${sport.name}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllSports,
  getMyCreatedSports,
  getSportById,
  createSport,
  deleteSport,
};
