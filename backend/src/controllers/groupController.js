const { prisma } = require('../database/init');
const { createAuditLog } = require('../utils/auditLog');

/**
 * Get all groups
 */
const getGroups = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { members: true }
          }
        }
      }),
      prisma.group.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        groups: groups.map(g => ({
          ...g,
          memberCount: g._count.members
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get group by ID
 */
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    res.json({
      success: true,
      data: {
        ...group,
        memberCount: group._count.members
      }
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Create new group
 */
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    const group = await prisma.group.create({
      data: {
        name,
        description: description || null
      }
    });

    await createAuditLog(req.user.id, 'group_created', req.ip, req.get('user-agent'), 'success', {
      groupId: group.id,
      groupName: name
    });

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update group
 */
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    const group = await prisma.group.update({
      where: { id },
      data: {
        name,
        description: description || null
      }
    });

    await createAuditLog(req.user.id, 'group_updated', req.ip, req.get('user-agent'), 'success', {
      groupId: id,
      groupName: name
    });

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: group
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    console.error('Update group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Delete group
 */
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.group.delete({
      where: { id }
    });

    await createAuditLog(req.user.id, 'group_deleted', req.ip, req.get('user-agent'), 'success', {
      groupId: id
    });

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    console.error('Delete group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Add member to group
 */
const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if group exists
    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Add member
    await prisma.groupMembership.create({
      data: {
        userId,
        groupId: id
      }
    });

    await createAuditLog(req.user.id, 'group_member_added', req.ip, req.get('user-agent'), 'success', {
      groupId: id,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Member added successfully'
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }
    console.error('Add member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Remove member from group
 */
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    await prisma.groupMembership.delete({
      where: {
        userId_groupId: {
          userId,
          groupId: id
        }
      }
    });

    await createAuditLog(req.user.id, 'group_member_removed', req.ip, req.get('user-agent'), 'success', {
      groupId: id,
      userId
    });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Member not found in group' });
    }
    console.error('Remove member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get group members
 */
const getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const members = await prisma.groupMembership.findMany({
      where: { groupId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            createdAt: true
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    res.json({
      success: true,
      data: members.map(m => ({
        ...m.user,
        joinedAt: m.joinedAt
      }))
    });
  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  getGroupMembers
};
