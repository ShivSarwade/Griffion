const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * CORRECT FLOW:
 * 1. Generate a CUSTOMIZED backend project for customer (based on their config)
 * 2. Build THAT customized project (creates production code)
 * 3. Return the BUILD folder (production-ready, no source)
 * 
 * Customer gets: Customized production build (only features they selected)
 */
async function generateBackend(config) {
  console.log('📦 Generating custom backend for customer...');
  console.log('📋 Configuration:', JSON.stringify(config, null, 2));
  
  const backendRoot = path.join(__dirname, '../..');
  
  // Step 1: Create a customized backend project
  const projectDir = path.join(backendRoot, 'temp', `project-${Date.now()}`);
  await fs.mkdir(projectDir, { recursive: true });
  
  console.log('📁 Step 1: Creating customized backend project...');
  await createCustomBackendProject(projectDir, config);
  
  // Step 2: Install dependencies in the custom project
  console.log('📦 Step 2: Installing dependencies...');
  try {
    await execAsync('npm install --production', { cwd: projectDir });
    console.log('✅ Dependencies installed');
  } catch (error) {
    console.error('❌ Dependency installation failed:', error);
    throw new Error('Failed to install dependencies: ' + error.message);
  }
  
  // Step 3: Build the customized project
  console.log('🔨 Step 3: Building customized backend...');
  try {
    await execAsync('npm run build', { cwd: projectDir });
    console.log('✅ Build completed');
  } catch (error) {
    console.error('❌ Build failed:', error);
    throw new Error('Build process failed: ' + error.message);
  }

  // Step 4: Move the BUILD folder to final location (discard source)
  const buildDir = path.join(projectDir, 'build');
  const finalDir = path.join(backendRoot, 'temp', `backend-${Date.now()}`);
  await fs.mkdir(finalDir, { recursive: true });
  
  console.log('📋 Step 4: Extracting build folder...');
  await copyDirectory(buildDir, finalDir);
  
  // Step 5: Cleanup the project source (we only keep the build)
  console.log('🧹 Step 5: Cleaning up temporary files...');
  await fs.rm(projectDir, { recursive: true, force: true });
  
  console.log('✅ Customer package ready (customized build only)');
  console.log(`📦 Location: ${finalDir}`);
  
  return finalDir;
}

/**
 * Create a customized backend project based on customer's config
 * This generates SOURCE CODE with ONLY the features they selected
 */
async function createCustomBackendProject(projectDir, config) {
  const backendRoot = path.join(__dirname, '../..');
  
  // Create project structure
  await fs.mkdir(path.join(projectDir, 'src'), { recursive: true });
  await fs.mkdir(path.join(projectDir, 'src/routes'), { recursive: true });
  await fs.mkdir(path.join(projectDir, 'src/controllers'), { recursive: true });
  await fs.mkdir(path.join(projectDir, 'src/middleware'), { recursive: true });
  await fs.mkdir(path.join(projectDir, 'src/database'), { recursive: true });
  await fs.mkdir(path.join(projectDir, 'src/utils'), { recursive: true });
  await fs.mkdir(path.join(projectDir, 'scripts'), { recursive: true });

  // Core files (always included)
  const coreFiles = [
    'src/server.js',
    'src/routes/auth.js',
    'src/controllers/authController.js',
    'src/middleware/auth.js',
    'src/middleware/errorHandler.js',
    'src/middleware/rateLimiter.js',
    'src/database/init.js',
    'src/utils/email.js',
    'src/utils/auditLog.js',
    'scripts/build.js'
  ];

  // Optional files (based on config)
  const optionalFiles = [];
  
  if (config.enableAdminPanel) {
    optionalFiles.push('src/routes/admin.js');
    optionalFiles.push('src/controllers/adminController.js');
  }
  
  // Copy files
  const filesToCopy = [...coreFiles, ...optionalFiles];
  
  console.log(`   📝 Copying ${filesToCopy.length} files...`);
  for (const file of filesToCopy) {
    const srcPath = path.join(backendRoot, file);
    const destPath = path.join(projectDir, file);
    
    try {
      await fs.copyFile(srcPath, destPath);
    } catch (error) {
      console.warn(`⚠ Warning: Could not copy ${file} (${error.message})`);
    }
  }

  // Create package.json
  const packageJson = {
    name: config.projectName ? config.projectName.toLowerCase().replace(/\s+/g, '-') : 'griffion-backend',
    version: '1.0.0',
    description: `${config.projectName || 'Griffion'} - Authentication Backend`,
    main: 'server.js',
    scripts: {
      start: 'node server.js',
      build: 'node scripts/build.js'
    },
    dependencies: {
      express: '^4.18.2',
      sqlite3: '^5.1.7',
      bcryptjs: '^2.4.3',
      jsonwebtoken: '^9.0.2',
      helmet: '^7.1.0',
      cors: '^2.8.5',
      'express-rate-limit': '^7.2.0',
      'express-validator': '^7.0.1',
      morgan: '^1.10.0',
      dotenv: '^16.4.5',
      nodemailer: '^6.9.13'
    }
  };

  await fs.writeFile(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create .env.example
  await createCustomEnvFile(projectDir, config);

  console.log(`   ✓ Created customized project with ${filesToCopy.length} files`);
}

/**
 * Create customized .env.example
 */
async function createCustomEnvFile(projectDir, config) {
  let envContent = `# ${config.projectName || 'Griffion'} Backend Configuration

# Server
PORT=${config.port || 5000}
NODE_ENV=production

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this-immediately

# Database
DATABASE_PATH=./data/auth.db
DATABASE_TYPE=${config.database || 'sqlite'}

# Configuration
PRIMARY_IDENTIFIER=${config.primaryIdentifier || 'email'}
ENABLE_2FA=${config.enable2FA ? 'true' : 'false'}
ENABLE_PASSWORD_RECOVERY=${config.enablePasswordRecovery ? 'true' : 'false'}
ENABLE_REMEMBER_ME=${config.enableRememberMe ? 'true' : 'false'}
ENABLE_ACCOUNT_LOCKOUT=${config.enableAccountLockout ? 'true' : 'false'}
MAX_LOGIN_ATTEMPTS=${config.maxLoginAttempts || 5}
PASSWORD_MIN_LENGTH=${config.passwordMinLength || 8}
ENABLE_ADMIN_PANEL=${config.enableAdminPanel ? 'true' : 'false'}
ENABLE_RBAC=${config.enableRBAC ? 'true' : 'false'}
ENABLE_GROUPS=${config.enableGroups ? 'true' : 'false'}

# Email (${config.enablePasswordRecovery ? 'Required for password recovery' : 'Optional'})
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=${config.projectName ? config.projectName.toLowerCase().replace(/\s+/g, '') : 'noreply'}@yourapp.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=15
`;

  await fs.writeFile(path.join(projectDir, '.env.example'), envContent);
}

/**
 * Recursively copy directory
 */
async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Customize README with customer's configuration
 */
async function customizeReadme(dir, config) {
  const readmePath = path.join(dir, 'README.md');
  
  const features = [];
  if (config.enable2FA) features.push('Two-Factor Authentication (2FA)');
  if (config.enablePasswordRecovery) features.push('Password Recovery');
  if (config.enableAdminPanel) features.push('Admin Panel');
  if (config.enableRBAC) features.push('Role-Based Access Control (RBAC)');
  if (config.enableGroups) features.push('User Groups');

  const readme = `# ${config.projectName || 'Griffion'} Authentication Backend

${config.description || 'A production-ready authentication backend powered by Griffion.'}

## 🎯 Features

${features.map(f => `- ✅ ${f}`).join('\n')}

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment

\`\`\`bash
cp .env.example .env
\`\`\`

Edit the \`.env\` file with your settings:
- **JWT_SECRET**: Generate a strong secret key
- **DATABASE_PATH**: Path to your SQLite database
${config.enablePasswordRecovery ? '- **EMAIL_***: Configure your email service (required for password recovery)' : '- **EMAIL_***: Configure your email service (optional)'}

### 3. Start the Server

\`\`\`bash
npm start
\`\`\`

The server will start on http://localhost:${config.port || 5000}

## 🔐 Default Admin Account

- **Email**: admin@griffion.local
- **Password**: Admin123!

**⚠️ IMPORTANT**: Change this password immediately after first login!

## 📡 API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/logout\` - User logout
- \`POST /api/auth/refresh\` - Refresh JWT token
${config.enablePasswordRecovery ? '- `POST /api/auth/forgot-password` - Request password reset\n- `POST /api/auth/reset-password` - Reset password with token' : ''}
${config.enable2FA ? '- `POST /api/auth/2fa/enable` - Enable 2FA\n- `POST /api/auth/2fa/verify` - Verify 2FA token' : ''}

${config.enableAdminPanel ? `### Admin Panel
- \`GET /api/admin/users\` - List all users
- \`PUT /api/admin/users/:id\` - Update user
- \`DELETE /api/admin/users/:id\` - Delete user
- \`GET /api/admin/audit-logs\` - View audit logs
` : ''}

## 🗄️ Database

This backend uses **${config.database === 'postgresql' ? 'PostgreSQL' : config.database === 'mysql' ? 'MySQL' : 'SQLite'}** as the database.

${config.database === 'sqlite' ? 'The database file will be automatically created on first run.' : 'Configure your database connection in the `.env` file.'}

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Helmet.js security headers
- SQL injection protection
- XSS protection
${config.enable2FA ? '- Two-factor authentication (2FA)' : ''}
- Account lockout after failed login attempts
- Audit logging of security events

## 📧 Email Configuration

${config.enablePasswordRecovery ? 'Email is **required** for password recovery functionality.' : 'Email configuration is optional but recommended.'}

Supported providers:
- Gmail (use app-specific password)
- SendGrid
- AWS SES
- Any SMTP server

## 📝 License

This backend is generated by **Griffion** - Backend-as-a-Service platform.
`;

  await fs.writeFile(readmePath, readme);
  console.log('  ✓ Customized README.md');
}

/**
 * Create .gitignore file
 */
async function createGitignore(dir) {
  const gitignore = `# Dependencies
node_modules/
package-lock.json

# Environment
.env

# Database
*.db
*.sqlite
data/

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
`;

  await fs.writeFile(path.join(dir, '.gitignore'), gitignore);
  console.log('  ✓ Created .gitignore');
}

/**
 * Create a ZIP archive
 */
async function createZip(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = require('fs').createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`📦 ZIP created: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });
    
    output.on('error', (err) => reject(err));
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

/**
 * Clean up temporary directories
 */
async function cleanup(dirPath) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
    console.log(`🧹 Cleaned up: ${dirPath}`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

module.exports = {
  generateBackend,
  createZip,
  cleanup
};
