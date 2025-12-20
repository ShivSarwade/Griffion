/**
 * Example Configuration for Griffion Backend Generation
 * 
 * This file demonstrates the complete configuration object
 * that can be sent to the backend generator API.
 */

const exampleConfig = {
  // ========== Project Information ==========
  projectName: 'My Enterprise App',
  projectDescription: 'Production-ready enterprise authentication backend',
  author: 'Your Company Name',
  port: 5000,
  frontendUrl: 'http://localhost:3000',

  // ========== Database Configuration ==========
  // Options: 'sqlite', 'postgresql', 'mysql', 'mongodb'
  dbProvider: 'postgresql',
  
  // Database connection details (not needed for SQLite)
  dbHost: 'localhost',
  dbPort: 5432,
  dbName: 'myapp',
  dbUser: 'myapp_user',
  dbPassword: 'secure_password_123',

  // ========== Authentication Settings ==========
  // Options: 'email', 'username', 'both'
  primaryIdentifier: 'email',
  
  // Feature flags
  enable2FA: true,
  enablePasswordRecovery: true,
  enableRememberMe: true,
  enableAccountLockout: true,

  // ========== Admin Configuration ==========
  enableAdminPanel: true,
  enableRBAC: true,
  enableGroups: false,
  
  // Admin user (created during seeding)
  adminEmail: 'admin@myapp.com',
  adminUsername: 'admin', // Only if primaryIdentifier is 'username' or 'both'
  adminPassword: 'Admin123!',
  adminFirstName: 'System',
  adminLastName: 'Administrator',

  // ========== Role Configuration ==========
  roles: [
    {
      name: 'Admin',
      description: 'Full system access',
      registrationType: 'admin', // Users cannot self-register as admin
      isSystemRole: true,
      permissions: ['*'] // All permissions
    },
    {
      name: 'Manager',
      description: 'Department manager',
      registrationType: 'admin',
      isSystemRole: false,
      permissions: ['users.read', 'reports.read', 'reports.create']
    },
    {
      name: 'User',
      description: 'Standard user',
      registrationType: 'public', // Users can self-register with this role
      isSystemRole: false,
      permissions: ['profile.read', 'profile.update']
    }
  ],

  // ========== Navigation Structure ==========
  enableNavigation: true,
  navigationTree: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      type: 'page',
      path: '/dashboard',
      icon: 'dashboard',
      isPublic: false,
      order: 0,
      accessRoles: ['Admin', 'Manager', 'User']
    },
    {
      id: 'users_section',
      name: 'User Management',
      type: 'section',
      icon: 'users',
      isPublic: false,
      order: 1,
      accessRoles: ['Admin', 'Manager'],
      children: [
        {
          id: 'users_list',
          name: 'All Users',
          type: 'page',
          path: '/users',
          icon: 'list',
          isPublic: false,
          order: 0
        },
        {
          id: 'users_create',
          name: 'Create User',
          type: 'page',
          path: '/users/create',
          icon: 'plus',
          isPublic: false,
          order: 1
        }
      ]
    },
    {
      id: 'reports',
      name: 'Reports',
      type: 'page',
      path: '/reports',
      icon: 'chart',
      isPublic: false,
      order: 2,
      accessRoles: ['Admin', 'Manager']
    },
    {
      id: 'settings',
      name: 'Settings',
      type: 'page',
      path: '/settings',
      icon: 'settings',
      isPublic: false,
      order: 3,
      accessRoles: ['Admin', 'Manager', 'User']
    }
  ],

  // ========== Security Settings ==========
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecial: false,

  // ========== Rate Limiting ==========
  rateLimitWindowMinutes: 15,
  rateLimitMaxRequests: 100
};

// ========== Minimal Configuration Example ==========
const minimalConfig = {
  projectName: 'Simple App',
  dbProvider: 'sqlite', // SQLite needs no additional DB config
  primaryIdentifier: 'email',
  enable2FA: false,
  enablePasswordRecovery: false,
  enableAdminPanel: true,
  adminEmail: 'admin@example.com',
  adminPassword: 'Admin123!',
  roles: [
    {
      name: 'Admin',
      description: 'Administrator',
      registrationType: 'admin',
      permissions: ['*']
    },
    {
      name: 'User',
      description: 'Standard User',
      registrationType: 'public',
      permissions: ['profile.read', 'profile.update']
    }
  ]
};

// ========== MongoDB Configuration Example ==========
const mongoConfig = {
  projectName: 'MongoDB App',
  dbProvider: 'mongodb',
  dbHost: 'localhost',
  dbPort: 27017,
  dbName: 'myapp',
  dbUser: 'mongouser',
  dbPassword: 'mongopass',
  primaryIdentifier: 'email',
  enable2FA: true,
  enablePasswordRecovery: true,
  enableAdminPanel: true,
  enableRBAC: true,
  enableGroups: true,
  adminEmail: 'admin@mongoapp.com',
  adminPassword: 'MongoAdmin123!',
  roles: [
    {
      name: 'Admin',
      description: 'System Administrator',
      registrationType: 'admin',
      permissions: ['*']
    }
  ]
};

module.exports = {
  exampleConfig,
  minimalConfig,
  mongoConfig
};
