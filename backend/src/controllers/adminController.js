const { prisma } = require('../database/init');
const { createAuditLog } = require('../utils/auditLog');
const { sendAccountCreatedEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');

/**
 * Get all users with pagination and filtering
 */
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = { name: role };
    }

    // Get users with role information
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          isActive: true,
          isLocked: true,
          failedLoginAttempts: true,
          lastLogin: true,
          createdAt: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isLocked: true,
        failedLoginAttempts: true,
        mfaEnabled: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, username, firstName, lastName, roleId, isActive } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Build update data
    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (roleId !== undefined) updateData.roleId = roleId;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'USER_UPDATED',
      resource: 'User',
      resourceId: id,
      details: updateData
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or username already exists' 
      });
    }

    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

/**
 * Delete user (soft delete - deactivate)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Soft delete - deactivate user
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'USER_DELETED',
      resource: 'User',
      resourceId: id,
      details: { email: user.email }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

/**
 * Unlock user account
 */
const unlockUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Unlock user
    await prisma.user.update({
      where: { id },
      data: {
        isLocked: false,
        failedLoginAttempts: 0
      }
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'USER_UNLOCKED',
      resource: 'User',
      resourceId: id,
      details: { email: user.email }
    });

    res.json({
      success: true,
      message: 'User unlocked successfully'
    });

  } catch (error) {
    console.error('Unlock user error:', error);
    res.status(500).json({ success: false, message: 'Failed to unlock user' });
  }
};

/**
 * Get audit logs with pagination and filtering
 */
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const userId = req.query.userId || '';
    const action = req.query.action || '';
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    // Get logs with user information
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
};

/**
 * Get system statistics
 */
const getStats = async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      lockedUsers,
      loginsLast24Hours
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isLocked: true } }),
      prisma.auditLog.count({
        where: {
          action: 'USER_LOGIN',
          createdAt: { gte: last24Hours }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        lockedUsers,
        loginsLast24Hours
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};

/**
 * Create single user (admin only)
 */
const createUser = async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, phone, roleId } = req.body;

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Determine primary identifier
    const primaryIdentifier = process.env.PRIMARY_IDENTIFIER || 'email';
    const identifierValue = primaryIdentifier === 'username' ? username : email;

    if (!identifierValue) {
      return res.status(400).json({ 
        success: false, 
        message: `${primaryIdentifier} is required` 
      });
    }

    // Check if user already exists
    const whereClause = primaryIdentifier === 'username'
      ? { username: identifierValue }
      : { email: identifierValue };

    const existingUser = await prisma.user.findUnique({ where: whereClause });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: `User with this ${primaryIdentifier} already exists` 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get role
    let role;
    if (roleId) {
      role = await prisma.role.findUnique({ where: { id: roleId } });
      if (!role) {
        return res.status(404).json({ success: false, message: 'Role not found' });
      }
    } else {
      role = await prisma.role.findFirst({
        where: { name: 'User' }
      });
      if (!role) {
        return res.status(500).json({ success: false, message: 'Default role not found' });
      }
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: email || null,
        username: username || null,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        roleId: role.id,
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0
      },
      include: {
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'USER_CREATED',
      resource: 'User',
      resourceId: newUser.id,
      details: { [primaryIdentifier]: identifierValue }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or username already exists' 
      });
    }

    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};

/**
 * Bulk create users
 */
const bulkCreateUsers = async (req, res) => {
  try {
    const { users } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Users array is required and must not be empty'
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const userData of users) {
      try {
        const { email, username, password, firstName, lastName, roleId } = userData;

        // Validate required fields
        if (!password) {
          results.failed.push({
            data: userData,
            error: 'Password is required'
          });
          continue;
        }

        // Check primary identifier
        const primaryIdentifier = process.env.PRIMARY_IDENTIFIER || 'email';
        const identifierValue = primaryIdentifier === 'username' ? username : email;

        if (!identifierValue) {
          results.failed.push({
            data: userData,
            error: `${primaryIdentifier} is required`
          });
          continue;
        }

        // Check if user already exists
        const whereClause = primaryIdentifier === 'username'
          ? { username: identifierValue }
          : { email: identifierValue };

        const existingUser = await prisma.user.findUnique({ where: whereClause });

        if (existingUser) {
          results.failed.push({
            data: userData,
            error: `User with this ${primaryIdentifier} already exists`
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get role
        let role;
        if (roleId) {
          role = await prisma.role.findUnique({ where: { id: roleId } });
        } else {
          role = await prisma.role.findFirst({
            where: { name: 'User' }
          });
        }

        if (!role) {
          results.failed.push({
            data: userData,
            error: 'Role not found'
          });
          continue;
        }

        // Create user
        const newUser = await prisma.user.create({
          data: {
            email: email || null,
            username: username || null,
            password: hashedPassword,
            firstName: firstName || null,
            lastName: lastName || null,
            roleId: role.id,
            isActive: true,
            isLocked: false,
            failedLoginAttempts: 0
          }
        });

        // Audit log
        await createAuditLog({
          userId: req.user.id,
          action: 'USER_BULK_CREATED',
          resource: 'User',
          resourceId: newUser.id,
          details: { [primaryIdentifier]: identifierValue }
        });

        results.success.push({
          id: newUser.id,
          email: newUser.email,
          username: newUser.username
        });

      } catch (error) {
        results.failed.push({
          data: userData,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${results.success.length} users, failed ${results.failed.length}`,
      data: results
    });

  } catch (error) {
    console.error('Bulk create users error:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk create users' });
  }
};

/**
 * Force password change for a user
 */
const forcePasswordChange = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'PASSWORD_FORCE_CHANGED',
      resource: 'User',
      resourceId: id,
      details: { targetUser: user.email || user.username }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Force password change error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

/**
 * Get all available roles
 */
const getAllRoles = async (req, res) => {
  try {
    // ADMIN API: Fetch ALL roles (no user context filtering)
    const roles = await prisma.role.findMany({
      include: {
        navigationNodes: {
          select: {
            id: true,
            name: true,
            type: true,
            path: true,
            icon: true,
            isPublic: true,
            order: true,
            parentId: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Fetch ALL navigation pages with ALL role assignments
    const allNavigation = await prisma.navigationNode.findMany({
      include: {
        accessRoles: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: {
        roles: roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          registrationType: role.registrationType,
          isSystemRole: role.isSystemRole,
          permissions: role.permissions,
          createdAt: role.createdAt,
          navigationPages: role.navigationNodes
        })),
        allNavigationPages: allNavigation.map(nav => ({
          id: nav.id,
          name: nav.name,
          type: nav.type,
          path: nav.path,
          icon: nav.icon,
          isPublic: nav.isPublic,
          order: nav.order,
          parentId: nav.parentId,
          assignedToRoles: nav.accessRoles
        }))
      }
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch roles' });
  }
};

/**
 * Bulk create users
 */
const createBulkUsers = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Users array is required and must not be empty'
      });
    }

    if (users.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 users can be created at once'
      });
    }

    const primaryIdentifier = process.env.PRIMARY_IDENTIFIER || 'email';
    const results = {
      created: [],
      failed: []
    };

    for (const userData of users) {
      try {
        const { email, username, password, firstName, lastName, role } = userData;
        const identifierValue = primaryIdentifier === 'username' ? username : email;

        if (!identifierValue || !password) {
          results.failed.push({
            user: email || username,
            error: `${primaryIdentifier} and password are required`
          });
          continue;
        }

        // Find role
        const userRole = await prisma.role.findUnique({
          where: { name: role || 'User' }
        });

        if (!userRole) {
          results.failed.push({
            user: identifierValue,
            error: `Role "${role || 'User'}" not found`
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
          data: {
            email: email || null,
            username: username || null,
            password: hashedPassword,
            firstName: firstName || null,
            lastName: lastName || null,
            roleId: userRole.id,
            isActive: true,
            isLocked: false,
            failedLoginAttempts: 0
          },
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            role: { select: { name: true } }
          }
        });

        results.created.push(newUser);

        // Send welcome email with login details
        if (email && process.env.ENABLE_PASSWORD_RECOVERY !== 'false') {
          try {
            await sendAccountCreatedEmail(email, password, userRole.name, firstName || 'User');
          } catch (emailError) {
            console.error(`⚠️  Failed to send welcome email to ${email}:`, emailError.message);
            // Don't fail the entire operation if email fails
          }
        }
      } catch (error) {
        const user = userData.email || userData.username;
        results.failed.push({
          user,
          error: error.message
        });
      }
    }

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'BULK_USER_CREATION',
      resource: 'User',
      resourceId: 'bulk',
      details: { created: results.created.length, failed: results.failed.length }
    });

    res.status(201).json({
      success: results.failed.length === 0,
      data: results,
      summary: {
        totalRequested: users.length,
        created: results.created.length,
        failed: results.failed.length
      }
    });
  } catch (error) {
    console.error('Bulk create users error:', error);
    res.status(500).json({ success: false, message: 'Failed to create users' });
  }
};

/**
 * Create a new role with navigation assignments
 */
const createRole = async (req, res) => {
  try {
    const { name, description, registrationType, permissions, navigationPageIds } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      return res.status(400).json({ success: false, message: 'Role with this name already exists' });
    }

    // Create role with navigation assignments
    const roleData = {
      name,
      description: description || '',
      registrationType: registrationType || 'admin',
      isSystemRole: false,
      permissions: permissions || []
    };

    // Add navigation connections if provided
    if (navigationPageIds && Array.isArray(navigationPageIds) && navigationPageIds.length > 0) {
      roleData.navigationNodes = {
        connect: navigationPageIds.map(id => ({ id }))
      };
    }

    const newRole = await prisma.role.create({
      data: roleData,
      include: {
        navigationNodes: {
          select: {
            id: true,
            name: true,
            type: true,
            path: true
          }
        }
      }
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE_ROLE',
      resource: 'Role',
      resourceId: newRole.id,
      details: { name: newRole.name, navigationPages: navigationPageIds?.length || 0 }
    });

    res.status(201).json({
      success: true,
      data: newRole,
      message: 'Role created successfully'
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ success: false, message: 'Failed to create role' });
  }
};

/**
 * Update an existing role and its navigation assignments
 */
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, registrationType, permissions, navigationPageIds } = req.body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id }
    });

    if (!existingRole) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    // Prevent updating system roles' core properties
    if (existingRole.isSystemRole && (name || registrationType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify name or registration type of system roles' 
      });
    }

    // Check for name conflicts if name is being changed
    if (name && name !== existingRole.name) {
      const nameConflict = await prisma.role.findUnique({
        where: { name }
      });
      if (nameConflict) {
        return res.status(400).json({ 
          success: false, 
          message: 'Another role with this name already exists' 
        });
      }
    }

    // Build update data
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (registrationType) updateData.registrationType = registrationType;
    if (permissions) updateData.permissions = permissions;

    // Handle navigation pages update
    if (navigationPageIds !== undefined) {
      // First, disconnect all existing navigation nodes
      await prisma.role.update({
        where: { id },
        data: {
          navigationNodes: {
            set: [] // Clear all connections
          }
        }
      });

      // Then connect the new ones
      if (Array.isArray(navigationPageIds) && navigationPageIds.length > 0) {
        updateData.navigationNodes = {
          connect: navigationPageIds.map(nodeId => ({ id: nodeId }))
        };
      }
    }

    // Update role
    const updatedRole = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        navigationNodes: {
          select: {
            id: true,
            name: true,
            type: true,
            path: true
          }
        }
      }
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'UPDATE_ROLE',
      resource: 'Role',
      resourceId: id,
      details: { 
        updates: Object.keys(updateData),
        navigationPages: navigationPageIds?.length || 0
      }
    });

    res.json({
      success: true,
      data: updatedRole,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
};

/**
 * Delete a role and remove all navigation assignments
 */
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        users: true
      }
    });

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    // Prevent deleting system roles
    if (role.isSystemRole) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete system roles' 
      });
    }

    // Check if role has users
    if (role.users.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete role. ${role.users.length} user(s) still assigned to this role.` 
      });
    }

    // Delete role (navigation assignments are automatically removed due to Prisma relation)
    await prisma.role.delete({
      where: { id }
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'DELETE_ROLE',
      resource: 'Role',
      resourceId: id,
      details: { name: role.name }
    });

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete role' });
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  unlockUser,
  getAuditLogs,
  getStats,
  bulkCreateUsers,
  forcePasswordChange,
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  createBulkUsers
};
