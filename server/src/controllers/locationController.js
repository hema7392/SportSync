// Buildings and Locations Controller for CampusFix
const prisma = require('../prisma');

/**
 * List buildings
 */
const getBuildings = async (req, res, next) => {
  try {
    const { all } = req.query;
    const where = all === 'true' ? {} : { isActive: true };

    const buildings = await prisma.building.findMany({
      where,
      include: {
        locations: {
          where: all === 'true' ? {} : { isActive: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { locations: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ buildings });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new building (ADMIN only)
 */
const createBuilding = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Building name is required' });
    }

    const existing = await prisma.building.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return res.status(409).json({ message: 'A building with this name already exists' });
    }

    const building = await prisma.building.create({
      data: {
        name: name.trim(),
        code: code?.trim() || null,
        description: description?.trim() || null,
        isActive: true,
      },
    });

    return res.status(201).json({ message: 'Building created successfully', building });
  } catch (err) {
    next(err);
  }
};

/**
 * Update building (ADMIN only)
 */
const updateBuilding = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, code, description, isActive } = req.body;

    const existing = await prisma.building.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Building not found' });
    }

    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.building.findUnique({ where: { name: name.trim() } });
      if (duplicate) {
        return res.status(409).json({ message: 'A building with this name already exists' });
      }
    }

    const updated = await prisma.building.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(code !== undefined ? { code: code?.trim() || null } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return res.status(200).json({ message: 'Building updated successfully', building: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * List locations
 */
const getLocations = async (req, res, next) => {
  try {
    const { buildingId, all } = req.query;
    const where = {};

    if (buildingId) {
      where.buildingId = parseInt(buildingId, 10);
    }

    if (all !== 'true') {
      where.isActive = true;
    }

    const locations = await prisma.location.findMany({
      where,
      include: {
        building: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { issues: true },
        },
      },
      orderBy: [{ building: { name: 'asc' } }, { name: 'asc' }],
    });

    return res.status(200).json({ locations });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new location (ADMIN only)
 */
const createLocation = async (req, res, next) => {
  try {
    const { buildingId, name, floor } = req.body;

    if (!buildingId || !name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Building ID and Location name are required' });
    }

    const building = await prisma.building.findUnique({
      where: { id: parseInt(buildingId, 10) },
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    const location = await prisma.location.create({
      data: {
        buildingId: parseInt(buildingId, 10),
        name: name.trim(),
        floor: floor?.trim() || null,
        isActive: true,
      },
      include: {
        building: true,
      },
    });

    return res.status(201).json({ message: 'Location created successfully', location });
  } catch (err) {
    next(err);
  }
};

/**
 * Update location (ADMIN only)
 */
const updateLocation = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, floor, isActive, buildingId } = req.body;

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const updated = await prisma.location.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(floor !== undefined ? { floor: floor?.trim() || null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(buildingId !== undefined ? { buildingId: parseInt(buildingId, 10) } : {}),
      },
      include: {
        building: true,
      },
    });

    return res.status(200).json({ message: 'Location updated successfully', location: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBuildings,
  createBuilding,
  updateBuilding,
  getLocations,
  createLocation,
  updateLocation,
};
