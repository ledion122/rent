const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
