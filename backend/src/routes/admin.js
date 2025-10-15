const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Users management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/unlock', adminController.unlockUser);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

// Statistics
router.get('/stats', adminController.getStats);

module.exports = router;
