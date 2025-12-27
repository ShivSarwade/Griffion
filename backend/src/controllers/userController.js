const { prisma } = require('../database/init');
const bcrypt = require('bcryptjs');

/**
 * User Controller
 * Handles user profile management
 */

/**
 * Get current user profile
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        preferences: true,
        emailVerified: true,
        mfaEnabled: true,
        createdAt: true,
        lastLogin: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, username } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        preferences: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

/**
 * Update user preferences
 */
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid preferences format'
      });
    }

    // Get current preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { preferences: true }
    });

    // Parse existing preferences if stored as string
    let existingPreferences = {};
    if (currentUser.preferences) {
      existingPreferences = typeof currentUser.preferences === 'string' 
        ? JSON.parse(currentUser.preferences)
        : currentUser.preferences;
    }

    // Merge preferences
    const mergedPreferences = {
      ...existingPreferences,
      ...preferences
    };

    // Stringify preferences
    const preferencesData = JSON.stringify(mergedPreferences);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { preferences: preferencesData },
      select: {
        id: true,
        preferences: true
      }
    });

    // Parse preferences for response
    const responsePreferences = typeof updatedUser.preferences === 'string'
      ? JSON.parse(updatedUser.preferences)
      : updatedUser.preferences;

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        preferences: responsePreferences
      },
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences'
    });
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    // Log the password change
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'password_change',
        details: JSON.stringify({ method: 'user_initiated' }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};
