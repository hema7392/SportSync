const { body, param } = require('express-validator');

const createSportValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Sport name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Sport name must be between 2 and 60 characters'),
];

const sportIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid sport ID format'),
];

module.exports = {
  createSportValidator,
  sportIdValidator,
};
