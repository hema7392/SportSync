const express = require('express');
const {
  getAllSports,
  getMyCreatedSports,
  getSportById,
  createSport,
  deleteSport,
} = require('../controllers/sportsController');
const {
  createSportValidator,
  sportIdValidator,
} = require('../validators/sportValidators');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// All sports routes require authentication
router.use(requireAuth);

router.get('/', getAllSports);
router.get('/created', requireAdmin, getMyCreatedSports);
router.get('/:id', sportIdValidator, validate, getSportById);
router.post('/', requireAdmin, createSportValidator, validate, createSport);
router.delete('/:id', requireAdmin, sportIdValidator, validate, deleteSport);

module.exports = router;
