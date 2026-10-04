const express = require('express');
const {
  signup,
  login,
  logout,
  getMe,
  changePassword,
} = require('../controllers/authController');
const {
  signupValidator,
  loginValidator,
  changePasswordValidator,
} = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.post('/change-password', requireAuth, changePasswordValidator, validate, changePassword);

module.exports = router;
