const express = require('express');
const { getSessionReports } = require('../controllers/reportsController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// Reports are accessible only by administrators
router.use(requireAuth);
router.use(requireAdmin);

router.get('/sessions', getSessionReports);

module.exports = router;
