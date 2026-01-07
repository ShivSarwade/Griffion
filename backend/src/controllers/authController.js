const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { prisma } = require('../database/init');
const { createAuditLog } = require('../utils/auditLog');
const { sendPasswordResetEmail } = require('../utils/email');
const config = require('../config.json');

// Conditional 2FA imports
let speakeasy, QRCode;
if (process.env.ENABLE_2FA === 'true') {
  speakeasy = require('speakeasy');
  QRCode = require('qrcode');
}

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, username, password, firstName, lastName, role } = req.body;

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

    // Get available public roles
    let defaultRole;
    
    if (role) {
      // User specified a role - check if it's public
      defaultRole = await prisma.role.findFirst({
        where: { 
          name: role,
          registrationType: 'public'
        }
      });

      if (!defaultRole) {
        return res.status(400).json({
          success: false,
          message: `Role "${role}" is not available for self-registration. Use role parameter to select from available public roles.`
        });
      }
    } else {
      // No role specified - check config for default role
      const configDefaultRole = config.registration.defaultPublicRole;
      
      if (configDefaultRole) {
        // Try to use role from config
        defaultRole = await prisma.role.findFirst({
          where: { 
            name: configDefaultRole,
            registrationType: 'public'
          }
        });

        if (!defaultRole) {
          // Config role not found, fallback to first available
          defaultRole = await prisma.role.findFirst({
            where: { 
              registrationType: 'public'
            },
            orderBy: { name: 'asc' }
          });
        }
      } else {
        // No config role - use first available public role
        defaultRole = await prisma.role.findFirst({
          where: { 
            registrationType: 'public'
          },
          orderBy: { name: 'asc' }
        });
      }

      if (!defaultRole) {
        return res.status(403).json({
          success: false,
          message: 'Self-registration is not available. Please contact an administrator.'
        });
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email || null,
        username: username || null,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        roleId: defaultRole.id,
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0
      }
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'USER_REGISTERED',
      resource: 'User',
      resourceId: user.id,
      details: { [primaryIdentifier]: identifierValue, role: defaultRole.name }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, username, password, totpToken } = req.body;

    // Determine primary identifier
    const primaryIdentifier = process.env.PRIMARY_IDENTIFIER || 'email';
    const identifierValue = primaryIdentifier === 'username' ? username : email;

    if (!identifierValue) {
      return res.status(400).json({ 
        success: false, 
        message: `${primaryIdentifier} is required` 
      });
    }

    // Find user with role
    const whereClause = primaryIdentifier === 'username'
      ? { username: identifierValue }
      : { email: identifierValue };

    const user = await prisma.user.findUnique({
      where: whereClause,
      include: { role: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user is locked
    if (user.isLocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is locked due to too many failed login attempts' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed attempts
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
      const newFailedAttempts = user.failedLoginAttempts + 1;

      if (newFailedAttempts >= maxAttempts) {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            isLocked: true, 
            failedLoginAttempts: newFailedAttempts 
          }
        });
        return res.status(403).json({ 
          success: false, 
          message: 'Account locked due to too many failed attempts' 
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: newFailedAttempts }
      });

      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check 2FA if enabled
    if (process.env.ENABLE_2FA === 'true' && user.mfaEnabled) {
      if (!totpToken) {
        return res.status(200).json({
          success: true,
          requires2FA: true,
          message: 'Please provide 2FA token'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: totpToken,
        window: 2
      });

      if (!verified) {
        return res.status(401).json({ success: false, message: 'Invalid 2FA token' });
      }
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lastLogin: new Date() }
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user.id,
      details: { [primaryIdentifier]: identifierValue }
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name,
          mfaEnabled: user.mfaEnabled
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

/**
 * Logout user (invalidate refresh token)
 */
const logout = async (req, res) => {
  try {
    const refreshToken = req.body?.refreshToken;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'USER_LOGOUT',
      resource: 'User',
      resourceId: req.user.id
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.id,
        expiresAt: { gt: new Date() }
      },
      include: { user: { include: { role: true } } }
    });

    if (!storedToken) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { 
        id: storedToken.user.id, 
        email: storedToken.user.email, 
        role: storedToken.user.role.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '15m' }
    );

    res.json({
      success: true,
      data: { accessToken }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

/**
 * Get current user
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isActive: true,
        mfaEnabled: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user' });
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;

    // Get current user with password (fetch all fields to ensure password is included)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    console.log('🔍 User fetch result:', {
      userExists: !!user,
      userId: user?.id,
      hasPassword: !!user?.password,
      passwordValue: user?.password,
      allKeys: user ? Object.keys(user) : []
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'PASSWORD_CHANGED',
      resource: 'User',
      resourceId: req.user.id
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

/**
 * Forgot password - send reset email
 */
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, username } = req.body;

    // Determine primary identifier
    const primaryIdentifier = process.env.PRIMARY_IDENTIFIER || 'email';
    const identifierValue = primaryIdentifier === 'username' ? username : email;

    if (!identifierValue) {
      return res.status(400).json({ 
        success: false, 
        message: `${primaryIdentifier} is required` 
      });
    }

    // Find user
    const whereClause = primaryIdentifier === 'username'
      ? { username: identifierValue }
      : { email: identifierValue };

    const user = await prisma.user.findUnique({
      where: whereClause
    });

    if (!user) {
      // Don't reveal if user exists
      return res.json({ 
        success: true, 
        message: `If an account with that ${primaryIdentifier} exists, a password reset link has been sent` 
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      }
    });

    // Send email
    if (process.env.ENABLE_PASSWORD_RECOVERY === 'true') {
      try {
        await sendPasswordResetEmail(user.email, resetToken);
        console.log('✅ Password reset email sent successfully');
      } catch (emailError) {
        console.error('⚠️  Failed to send password reset email:', emailError.message);
        // Don't fail the request, just log the error
      }
    }

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      resource: 'User',
      resourceId: user.id
    });

    res.json({ 
      success: true, 
      message: 'If an account with that email exists, a password reset link has been sent' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token exists and is valid
    const storedToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        userId: decoded.id,
        expiresAt: { gt: new Date() },
        usedAt: null
      }
    });

    if (!storedToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() }
    });

    // Audit log
    await createAuditLog({
      userId: decoded.id,
      action: 'PASSWORD_RESET_COMPLETED',
      resource: 'User',
      resourceId: decoded.id
    });

    res.json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

/**
 * Enable 2FA for user
 */
const enable2FA = async (req, res) => {
  try {
    if (process.env.ENABLE_2FA !== 'true') {
      return res.status(400).json({ success: false, message: '2FA is not enabled on this server' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${process.env.PROJECT_NAME || 'Griffion'} (${req.user.email || req.user.username})`
    });

    // Store secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { mfaSecret: secret.base32 }
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl
      }
    });

  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ success: false, message: 'Failed to enable 2FA' });
  }
};

/**
 * Verify and activate 2FA
 */
const verify2FA = async (req, res) => {
  try {
    if (process.env.ENABLE_2FA !== 'true') {
      return res.status(400).json({ success: false, message: '2FA is not enabled on this server' });
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    // Get user's secret
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || !user.mfaSecret) {
      return res.status(400).json({ success: false, message: '2FA not initialized' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: req.user.id },
      data: { mfaEnabled: true }
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: '2FA_ENABLED',
      resource: 'User',
      resourceId: req.user.id
    });

    res.json({ success: true, message: '2FA enabled successfully' });

  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify 2FA' });
  }
};

/**
 * Disable 2FA
 */
const disable2FA = async (req, res) => {
  try {
    if (process.env.ENABLE_2FA !== 'true') {
      return res.status(400).json({ success: false, message: '2FA is not enabled on this server' });
    }

    const password = req.body?.password;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        mfaEnabled: false,
        mfaSecret: null
      }
    });

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      action: '2FA_DISABLED',
      resource: 'User',
      resourceId: req.user.id
    });

    res.json({ success: true, message: '2FA disabled successfully' });

  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ success: false, message: 'Failed to disable 2FA' });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
  enable2FA,
  verify2FA,
  disable2FA
};
