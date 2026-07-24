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
  .catch((error) => {
    console.warn('');
    console.warn('⚠️  WARNING: Database connection failed (DATABASE_URL may be missing or invalid).');
    console.warn('   The template API routes (/api/auth, /api/users) will NOT work.');
    console.warn('   However, the Generator endpoints (/api/download/generate) WILL still work!');
    console.warn('');
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════');
      console.log('  🛡️  Griffion Generator & API Service Started  🛡️');
      console.log('═══════════════════════════════════════════════════');
      console.log('');
      console.log(`  Server running on: http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV}`);
      console.log('');
      console.log('  Generator Endpoints (No DB Required):');
      console.log('  - POST /api/download/generate-fullstack');
      console.log('');
      console.log('  API Endpoints (DB Required):');
      console.log('  - POST /api/auth/register');
      console.log('  - POST /api/auth/login');
      console.log('');
      console.log('═══════════════════════════════════════════════════');
    });
  });

module.exports = app;
