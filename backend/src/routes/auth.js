const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to auth routes
router.use(rateLimiter);

// Register - Dynamic validation based on PRIMARY_IDENTIFIER
router.post(
  '/register',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('username').optional().isLength({ min: 3 }),
    body('password').isLength({ min: 8 })
  ],
  authController.register
);

// Login - Dynamic validation based on PRIMARY_IDENTIFIER
router.post(
  '/login',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('username').optional().isLength({ min: 3 }),
    body('password').exists()
  ],
  authController.login
);

// Logout
router.post('/logout', authMiddleware, authController.logout);

// Refresh token
router.post('/refresh', authController.refreshAccessToken);

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

// Forgot password - Dynamic validation
router.post(
  '/forgot-password',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('username').optional().isLength({ min: 3 })
  ],
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

// 2FA endpoints
router.post('/2fa/enable', authMiddleware, authController.enable2FA);
router.post(
  '/2fa/verify',
  authMiddleware,
  [body('token').isLength({ min: 6, max: 6 })],
  authController.verify2FA
);
// Alias for manual specification compatibility
router.post(
  '/verify-2fa',
  authMiddleware,
  [body('token').isLength({ min: 6, max: 6 })],
  authController.verify2FA
);
router.post('/2fa/disable', authMiddleware, authController.disable2FA);

module.exports = router;
