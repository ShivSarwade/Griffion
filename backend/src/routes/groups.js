const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All group routes require authentication
router.use(authMiddleware);

// Get all groups (admin only)
router.get('/', adminMiddleware, groupController.getGroups);

// Get group by ID
router.get('/:id', groupController.getGroupById);

// Create group (admin only)
router.post('/', adminMiddleware, groupController.createGroup);

// Update group (admin only)
router.put('/:id', adminMiddleware, groupController.updateGroup);

// Delete group (admin only)
router.delete('/:id', adminMiddleware, groupController.deleteGroup);

// Group membership management
router.post('/:id/members', adminMiddleware, groupController.addMember);
router.delete('/:id/members/:userId', adminMiddleware, groupController.removeMember);
router.get('/:id/members', groupController.getGroupMembers);

module.exports = router;
