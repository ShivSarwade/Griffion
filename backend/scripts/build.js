const fs = require('fs').promises;
const path = require('path');

/**
 * Build script for Griffion Backend
 * Creates a production-ready build folder with all necessary files
 */
async function build() {
  const buildDir = path.join(__dirname, '../build');
  
  console.log('🔨 Building Griffion Backend...\n');

  // Clean build directory
  try {
    await fs.rm(buildDir, { recursive: true, force: true });
    console.log('✓ Cleaned build directory');
  } catch (error) {
    // Directory doesn't exist, that's fine
  }

  // Create build structure
  await fs.mkdir(buildDir, { recursive: true });
  await fs.mkdir(path.join(buildDir, 'routes'), { recursive: true });
  await fs.mkdir(path.join(buildDir, 'controllers'), { recursive: true });
  await fs.mkdir(path.join(buildDir, 'middleware'), { recursive: true });
  await fs.mkdir(path.join(buildDir, 'database'), { recursive: true });
  await fs.mkdir(path.join(buildDir, 'utils'), { recursive: true });
  console.log('✓ Created build structure');

  // Files to copy
  const filesToCopy = [
    { src: 'src/server.js', dest: 'server.js' },
    { src: 'src/routes/auth.js', dest: 'routes/auth.js' },
    { src: 'src/routes/admin.js', dest: 'routes/admin.js' },
    { src: 'src/controllers/authController.js', dest: 'controllers/authController.js' },
    { src: 'src/controllers/adminController.js', dest: 'controllers/adminController.js' },
    { src: 'src/middleware/auth.js', dest: 'middleware/auth.js' },
    { src: 'src/middleware/errorHandler.js', dest: 'middleware/errorHandler.js' },
    { src: 'src/middleware/rateLimiter.js', dest: 'middleware/rateLimiter.js' },
    { src: 'src/database/init.js', dest: 'database/init.js' },
    { src: 'src/utils/auditLog.js', dest: 'utils/auditLog.js' },
    { src: 'src/utils/email.js', dest: 'utils/email.js' }
  ];

  // Copy files
  let copiedCount = 0;
  for (const file of filesToCopy) {
    const srcPath = path.join(__dirname, '..', file.src);
    const destPath = path.join(buildDir, file.dest);
    
    try {
      await fs.copyFile(srcPath, destPath);
      copiedCount++;
    } catch (error) {
      console.warn(`⚠ Warning: Could not copy ${file.src} (${error.message})`);
    }
  }
  console.log(`✓ Copied ${copiedCount} source files`);

  // Create production package.json
  const packageJson = {
    name: 'griffion-backend',
    version: '1.0.0',
    description: 'Griffion Authentication Backend - Production Build',
    main: 'server.js',
    scripts: {
      start: 'node server.js'
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
    path.join(buildDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  console.log('✓ Created production package.json');

  // Create .env.example
  const envExample = `# Griffion Backend Configuration

# Server
PORT=5000
NODE_ENV=production

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Database
DATABASE_PATH=./griffion.db

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@yourapp.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=15
`;

  await fs.writeFile(path.join(buildDir, '.env.example'), envExample);
  console.log('✓ Created .env.example');

  // Create README.md
  const readme = `# Griffion Authentication Backend - Production Build

This is a production-ready build of the Griffion authentication backend.

## 🚀 Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Configure environment:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your settings
   \`\`\`

3. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

## 🔐 Default Admin

- Email: admin@griffion.local
- Password: Admin123!

**⚠️ Change this immediately after first login!**

## 📚 API Endpoints

### Authentication
- POST \`/api/auth/register\` - Register new user
- POST \`/api/auth/login\` - Login
- POST \`/api/auth/logout\` - Logout
- POST \`/api/auth/refresh\` - Refresh token
- POST \`/api/auth/forgot-password\` - Request password reset
- POST \`/api/auth/reset-password\` - Reset password

### Admin (requires admin role)
- GET \`/api/admin/users\` - List users
- PUT \`/api/admin/users/:id\` - Update user
- DELETE \`/api/admin/users/:id\` - Delete user
- GET \`/api/admin/audit-logs\` - View audit logs
- GET \`/api/admin/stats\` - System statistics

## 🛡️ Security Features

- JWT authentication
- Password hashing with bcrypt
- Account lockout protection
- Rate limiting
- Helmet.js security headers
- CORS protection

---

**Powered by Griffion** - Production-ready authentication
`;

  await fs.writeFile(path.join(buildDir, 'README.md'), readme);
  console.log('✓ Created README.md');

  // Create .gitignore
  const gitignore = `node_modules/
.env
*.db
*.sqlite
*.log
.DS_Store
Thumbs.db
`;

  await fs.writeFile(path.join(buildDir, '.gitignore'), gitignore);
  console.log('✓ Created .gitignore');

  console.log('\n✅ Build completed successfully!');
  console.log(`📦 Build output: ${buildDir}\n`);
}

// Run build
build().catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
