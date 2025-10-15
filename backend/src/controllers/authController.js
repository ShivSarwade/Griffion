const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { createAuditLog } = require('../utils/auditLog');
const { sendPasswordResetEmail } = require('../utils/email');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const db = getDatabase();

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (user) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

      // Create user
      db.run(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, hashedPassword, 'user'],
        function(err) {
          if (err) {
            return res.status(500).json({ success: false, message: 'Error creating user' });
          }

          createAuditLog(this.lastID, 'register', req.ip, req.get('user-agent'), 'success');

          res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
              id: this.lastID,
              email
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const db = getDatabase();

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (!user) {
        createAuditLog(null, 'login', req.ip, req.get('user-agent'), 'failed');
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Check if account is locked
      if (user.is_locked) {
        createAuditLog(user.id, 'login', req.ip, req.get('user-agent'), 'locked');
        return res.status(403).json({ success: false, message: 'Account is locked' });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(403).json({ success: false, message: 'Account is inactive' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        // Increment failed login attempts
        const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
        const newFailedAttempts = user.failed_login_attempts + 1;

        if (newFailedAttempts >= maxAttempts) {
          db.run('UPDATE users SET is_locked = 1, failed_login_attempts = ? WHERE id = ?', 
            [newFailedAttempts, user.id]);
          createAuditLog(user.id, 'login', req.ip, req.get('user-agent'), 'locked');
          return res.status(403).json({ success: false, message: 'Account locked due to too many failed attempts' });
        }

        db.run('UPDATE users SET failed_login_attempts = ? WHERE id = ?', [newFailedAttempts, user.id]);
        createAuditLog(user.id, 'login', req.ip, req.get('user-agent'), 'failed');
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Reset failed login attempts and update last login
      db.run(
        'UPDATE users SET failed_login_attempts = 0, last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Generate JWT tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '24h' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
      );

      createAuditLog(user.id, 'login', req.ip, req.get('user-agent'), 'success');

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          accessToken,
          refreshToken
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const logout = (req, res) => {
  createAuditLog(req.user.id, 'logout', req.ip, req.get('user-agent'), 'success');
  res.json({ success: true, message: 'Logged out successfully' });
};

const refreshToken = (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
      }

      const db = getDatabase();
      db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
        if (err || !user) {
          return res.status(401).json({ success: false, message: 'User not found' });
        }

        const newAccessToken = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRY || '24h' }
        );

        res.json({
          success: true,
          data: {
            accessToken: newAccessToken
          }
        });
      });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getCurrentUser = (req, res) => {
  const db = getDatabase();
  
  db.get(
    'SELECT id, email, role, is_active, last_login, created_at FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        data: user
      });
    }
  );
};

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;
    const db = getDatabase();

    db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, user) => {
      if (err || !user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);

      db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, req.user.id],
        (err) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Error updating password' });
          }

          createAuditLog(req.user.id, 'change_password', req.ip, req.get('user-agent'), 'success');
          res.json({ success: true, message: 'Password changed successfully' });
        }
      );
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const db = getDatabase();

    db.get('SELECT id, email FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user.id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Send email (if SMTP configured)
      if (process.env.SMTP_HOST) {
        await sendPasswordResetEmail(user.email, resetToken);
      }

      createAuditLog(user.id, 'password_reset_request', req.ip, req.get('user-agent'), 'success');

      res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
        // In development, include token
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      });
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err || decoded.type !== 'password_reset') {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);
      const db = getDatabase();

      db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, decoded.id],
        (err) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Error resetting password' });
          }

          createAuditLog(decoded.id, 'password_reset', req.ip, req.get('user-agent'), 'success');
          res.json({ success: true, message: 'Password reset successfully' });
        }
      );
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword
};
