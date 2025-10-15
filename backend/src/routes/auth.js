const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to auth routes
router.use(rateLimiter);

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  authController.login
);

// Logout
router.post('/logout', authMiddleware, authController.logout);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Get current user
router.get('/me', authMiddleware, authController.getCurrentUser);

// Change password
router.post(
  '/change-password',
  authMiddleware,
  [
    body('oldPassword').exists(),
    body('newPassword').isLength({ min: 8 })
  ],
  authController.changePassword
);

// Forgot password
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').exists(),
    body('newPassword').isLength({ min: 8 })
  ],
  authController.resetPassword
);

module.exports = router;
