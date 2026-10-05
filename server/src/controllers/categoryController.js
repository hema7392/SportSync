// Category Controller for CampusFix
const prisma = require('../prisma');

/**
 * List categories
 * By default returns only active categories unless ?all=true is specified (for admin management)
 */
const getCategories = async (req, res, next) => {
  try {
    const { all } = req.query;
    const where = all === 'true' ? {} : { isActive: true };

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new category (ADMIN only)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existing = await prisma.category.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return res.status(409).json({ message: 'A category with this name already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || 'Wrench',
        isActive: true,
      },
    });

    return res.status(201).json({ message: 'Category created successfully', category });
  } catch (err) {
    next(err);
  }
};

/**
 * Update category (ADMIN only)
 */
const updateCategory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, icon, isActive } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.category.findUnique({ where: { name: name.trim() } });
      if (duplicate) {
        return res.status(409).json({ message: 'A category with this name already exists' });
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(icon !== undefined ? { icon: icon?.trim() || 'Wrench' } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return res.status(200).json({ message: 'Category updated successfully', category: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete category (ADMIN only) - safely prevented if issues exist
 */
const deleteCategory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { issues: true } } },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (existing._count.issues > 0) {
      return res.status(400).json({
        message: `Cannot delete category with ${existing._count.issues} associated issues. Deactivate it instead.`,
      });
    }

    await prisma.category.delete({ where: { id } });
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
