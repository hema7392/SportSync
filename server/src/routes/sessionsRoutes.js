const express = require('express');
const {
  createSession,
  getAvailableSessions,
  getCreatedSessions,
  getJoinedSessions,
  getSessionById,
  joinSession,
  cancelSession,
} = require('../controllers/sessionsController');
const {
  createSessionValidator,
  sessionIdValidator,
  cancelSessionValidator,
} = require('../validators/sessionValidators');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// All session routes require authentication
router.use(requireAuth);

router.get('/', getAvailableSessions);
router.post('/', createSessionValidator, validate, createSession);
router.get('/created', getCreatedSessions);
router.get('/joined', getJoinedSessions);
router.get('/:id', sessionIdValidator, validate, getSessionById);
router.post('/:id/join', sessionIdValidator, validate, joinSession);
router.post('/:id/cancel', cancelSessionValidator, validate, cancelSession);

module.exports = router;
