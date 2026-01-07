// Griffion Backend Template - Server Entry Point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
__ADMIN_ROUTES_IMPORT__
__NAVIGATION_ROUTES_IMPORT__
__USER_ROUTES_IMPORT__
__GROUP_ROUTES_IMPORT__
const { errorHandler } = require('./src/middleware/errorHandler');
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || __PORT__;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '__FRONTEND_URL__',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
__ADMIN_ROUTES_USE__
__NAVIGATION_ROUTES_USE__
__USER_ROUTES_USE__
__GROUP_ROUTES_USE__

// Health check & Config endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: '__PROJECT_NAME__'
  });
});

app.get('/api/config/auth', (req, res) => {
  res.json({
    authStrategy: '__PRIMARY_IDENTIFIER__', // 'email' or 'username'
    mfaEnabled: __ENABLE_2FA__,
    passwordRecovery: __ENABLE_PASSWORD_RECOVERY__,
    registrationOpen: true,
    projectName: '__PROJECT_NAME__',
    features: {
      '2fa': __ENABLE_2FA__,
      'groups': __ENABLE_GROUPS__,
      'navigation': __ENABLE_NAVIGATION__,
      'adminPanel': __ENABLE_ADMIN_PANEL__
    }
  });
});

// Error handling
app.use(errorHandler);

// Database initialization and server start
async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 __PROJECT_NAME__ Backend running on port ${PORT}`);
      console.log(`🔒 2FA: ${__ENABLE_2FA__ ? 'Enabled' : 'Disabled'}`);
      console.log(`👤 Primary Identifier: __PRIMARY_IDENTIFIER__`);
      __ADMIN_LOG__
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
