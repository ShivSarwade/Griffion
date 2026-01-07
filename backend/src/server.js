const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const navigationRoutes = require('./routes/navigation');
const usersRoutes = require('./routes/users');
const groupsRoutes = require('./routes/groups');
const downloadRoutes = require('./routes/download');
const { errorHandler } = require('./middleware/errorHandler');
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/download', downloadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    features: {
      '2fa': process.env.ENABLE_2FA === 'true',
      'admin_panel': process.env.ENABLE_ADMIN_PANEL === 'true',
      'navigation': process.env.ENABLE_NAVIGATION === 'true',
      'groups': process.env.ENABLE_GROUPS === 'true',
      'password_recovery': process.env.ENABLE_PASSWORD_RECOVERY === 'true'
    }
  });
});

// Error handling
app.use(errorHandler);

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════');
      console.log('  🛡️  Griffion Authentication Service Started  🛡️');
      console.log('═══════════════════════════════════════════════════');
      console.log('');
      console.log(`  Server running on: http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV}`);
      console.log('');
      console.log('  API Endpoints:');
      console.log('  - POST /api/auth/register');
      console.log('  - POST /api/auth/login');
      console.log('  - POST /api/auth/logout');
      console.log('  - GET  /api/health');
      console.log('');
      console.log('  Admin Credentials:');
      console.log('  Email: admin@griffion.local');
      console.log('  Password: Admin123!');
      console.log('');
      console.log('═══════════════════════════════════════════════════');
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

module.exports = app;
