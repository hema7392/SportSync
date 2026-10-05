// User Routes for CampusFix
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('ADMIN'), userController.getUsers);
router.get('/technicians', authenticate, userController.getTechnicians);
router.get('/:id', authenticate, authorize('ADMIN'), userController.getUserById);
router.patch('/:id/status', authenticate, authorize('ADMIN'), userController.updateUserStatus);

module.exports = router;
