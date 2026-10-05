// Building Routes for CampusFix
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', locationController.getBuildings);
router.post('/', authenticate, authorize('ADMIN'), locationController.createBuilding);
router.patch('/:id', authenticate, authorize('ADMIN'), locationController.updateBuilding);

module.exports = router;
