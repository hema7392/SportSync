// Location Routes for CampusFix
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', locationController.getLocations);
router.post('/', authenticate, authorize('ADMIN'), locationController.createLocation);
router.patch('/:id', authenticate, authorize('ADMIN'), locationController.updateLocation);

module.exports = router;
