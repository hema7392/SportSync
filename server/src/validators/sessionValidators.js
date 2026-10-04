const { body, param, query } = require('express-validator');

const createSessionValidator = [
  body('sportId')
    .notEmpty()
    .withMessage('Sport is required')
    .isInt({ min: 1 })
    .withMessage('Valid sport ID is required'),
  body('sessionDate')
    .trim()
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('sessionTime')
    .trim()
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Time must be in HH:mm format (e.g. 18:30)'),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Venue is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Venue must be between 2 and 150 characters'),
  body('additionalPlayersRequired')
    .notEmpty()
    .withMessage('Additional players required is required')
    .isInt({ min: 1, max: 100 })
    .withMessage('Additional players required must be at least 1'),
  body('teamA')
    .optional()
    .custom((val) => {
      if (val && !Array.isArray(val) && typeof val !== 'string') {
        throw new Error('Team A must be an array of player names or a string');
      }
      return true;
    }),
  body('teamB')
    .optional()
    .custom((val) => {
      if (val && !Array.isArray(val) && typeof val !== 'string') {
        throw new Error('Team B must be an array of player names or a string');
      }
      return true;
    }),
];

const sessionIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid session ID'),
];

const cancelSessionValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid session ID'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isLength({ min: 3, max: 250 })
    .withMessage('Cancellation reason must be between 3 and 250 characters'),
];

module.exports = {
  createSessionValidator,
  sessionIdValidator,
  cancelSessionValidator,
};
