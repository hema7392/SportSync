// Reports and Analytics Routes for CampusFix
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

// All reports are accessible to ADMIN (and general overview can be accessible to all authenticated users)
router.get('/overview', authenticate, reportController.getOverview);
router.get('/categories', authenticate, authorize('ADMIN'), reportController.getCategoryReports);
router.get('/locations', authenticate, authorize('ADMIN'), reportController.getLocationReports);
router.get('/technicians', authenticate, authorize('ADMIN'), reportController.getTechnicianReports);
router.get('/trends', authenticate, authorize('ADMIN'), reportController.getTrends);

module.exports = router;
