// Issue Validators for CampusFix
const { body } = require('express-validator');
const { validateResult } = require('./authValidators');

const validateCreateIssue = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid positive integer')
    .toInt(),
  body('locationId')
    .notEmpty()
    .withMessage('Location ID is required')
    .isInt({ min: 1 })
    .withMessage('Location ID must be a valid positive integer')
    .toInt(),
  body('specificArea')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Specific area description must not exceed 150 characters'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Priority must be one of: LOW, MEDIUM, HIGH, CRITICAL'),
  body('imageUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  validateResult,
];

const validateAssignTechnician = [
  body('technicianId')
    .notEmpty()
    .withMessage('Technician ID is required')
    .isInt({ min: 1 })
    .withMessage('Technician ID must be a valid positive integer')
    .toInt(),
  validateResult,
];

const validateResolveIssue = [
  body('resolutionNote')
    .trim()
    .notEmpty()
    .withMessage('Resolution note is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Resolution note must be between 5 and 1000 characters'),
  validateResult,
];

const validateReopenIssue = [
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('A reason for reopening is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Reopening reason must be between 5 and 1000 characters'),
  validateResult,
];

const validateAddComment = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Comment message is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment cannot exceed 2000 characters'),
  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal must be boolean')
    .toBoolean(),
  validateResult,
];

module.exports = {
  validateCreateIssue,
  validateAssignTechnician,
  validateResolveIssue,
  validateReopenIssue,
  validateAddComment,
};
