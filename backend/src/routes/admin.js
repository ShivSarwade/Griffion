const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Users management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.post('/users/bulk', adminController.createBulkUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id', adminController.updateUser); // Alias for PATCH support
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/unlock', adminController.unlockUser);
router.post('/users/:id/force-password', adminController.forcePasswordChange);

// Roles management
router.get('/roles', adminController.getAllRoles);
router.post('/roles', adminController.createRole);
router.put('/roles/:id', adminController.updateRole);
router.patch('/roles/:id', adminController.updateRole); // Alias for PATCH support
router.delete('/roles/:id', adminController.deleteRole);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

// Statistics
router.get('/stats', adminController.getStats);

module.exports = router;
