// Auth Routes for CampusFix
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  validateSignup,
  validateLogin,
  validateChangePassword,
} = require('../validators/authValidators');

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/change-password', authenticate, validateChangePassword, authController.changePassword);

module.exports = router;
