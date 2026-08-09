const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

/**
 * Frontend Generator for Griffion
 * 
 * Generates a customized Next.js frontend with:
 * - Authentication (Login, Register, Forgot Password, Reset Password)
 * - Role-based navigation
 * - Theme system (light/dark)
 * - Redux state management
 * - Dynamic catch-all routes
 * - API integration
 */

/**
 * Main frontend generation function
 */
async function generateFrontend(config) {
  console.log('🎨 Starting Griffion frontend generation...');
  console.log('📋 Configuration:', JSON.stringify(config, null, 2));
  
  const backendRoot = path.join(__dirname, '../..');
  const templateDir = path.join(backendRoot, 'templates', 'my-nextjs-app'); // Use the working my-nextjs-app
  const projectDir = path.join(backendRoot, 'temp', `frontend-${Date.now()}`);
  
  try {
    // Step 1: Copy template to project directory
    console.log('📁 Step 1: Copying template files...');
    await copyDirectory(templateDir, projectDir, [
      'node_modules',
      '.next',
      '.git',
      'temp',
      '.env.local.backup'
    ]);
    console.log(`   ✓ Template copied to ${projectDir}`);
    
    // Step 2: Create custom .env.local based on config
    console.log('🔧 Step 2: Creating environment configuration...');
    await createEnvFile(projectDir, config);
    console.log('   ✓ Environment file created');
    
    // Step 3: Update package.json with custom project name
    console.log('📦 Step 3: Updating package.json...');
    await updatePackageJson(projectDir, config);
    console.log('   ✓ Package.json updated');
    
    // Step 4: Create README with instructions
    console.log('📚 Step 4: Creating README...');
    await createReadme(projectDir, config);
    console.log('   ✓ README created');
    
    // Step 5: Clean up unnecessary files
    console.log('🧹 Step 5: Cleaning up...');
    await cleanupUnnecessaryFiles(projectDir);
    console.log('   ✓ Cleanup completed');
    
    console.log('✅ Frontend generation completed successfully!');
    console.log(`📦 Project location: ${projectDir}`);
    console.log('💡 Customer will run: npm install && npm run dev');
    
    return projectDir;
    
  } catch (error) {
    console.error('❌ Frontend generation failed:', error);
    
    // Cleanup on failure
    try {
      await fs.rm(projectDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Failed to cleanup:', cleanupError);
    }
    
    throw error;
  }
}

/**
 * Create .env.local file with custom configuration
 */
async function createEnvFile(projectDir, config) {
  const apiUrl = config.apiUrl || 'http://localhost:5000';
  const appName = config.appName || 'Griffion';
  const defaultTheme = config.defaultTheme || 'dark';
  const defaultRole = config.defaultRole || 'User';
  const primaryColor = config.primaryColor || '#6366f1';
  const secondaryColor = config.secondaryColor || '#8b5cf6';
  const logoPath = config.logoPath || '/logo.png';
  const primaryIdentifier = config.primaryIdentifier || 'email';
  const selfRegisterRoles = config.selfRegisterRoles || 'user,buyer,seller';
  
  const envContent = `# ================================================
# ${appName.toUpperCase()} FRONTEND CONFIGURATION
# ================================================

# Backend API URL - Required
NEXT_PUBLIC_API_URL=${apiUrl}

# ================================================
# AUTHENTICATION CONFIGURATION
# ================================================

# Primary identifier for authentication (defaults to email)
# Options: email, username, both
# Leave empty to default to email
NEXT_PUBLIC_PRIMARY_IDENTIFIER=${primaryIdentifier}

# Default theme: 'light' or 'dark'
NEXT_PUBLIC_DEFAULT_THEME=${defaultTheme}

# Default public role for registration (if not specified by user)
# This should match a role name with registrationType='public' in your backend config
NEXT_PUBLIC_DEFAULT_ROLE=${defaultRole}

# Self-registration roles (comma-separated)
# These roles will have dynamic registration routes created
# Example: user,customer,vendor creates /user/register, /customer/register, /vendor/register
NEXT_PUBLIC_SELF_REGISTER_ROLES=${selfRegisterRoles}

# ================================================
# BRANDING & UI CONFIGURATION
# ================================================

# Application name
NEXT_PUBLIC_APP_NAME=${appName}

# Primary brand color (hex)
NEXT_PUBLIC_PRIMARY_COLOR=${primaryColor}

# Secondary brand color (hex)
NEXT_PUBLIC_SECONDARY_COLOR=${secondaryColor}

# Logo path (relative to public folder)
NEXT_PUBLIC_LOGO_PATH=${logoPath}
`;
  
  await fs.writeFile(path.join(projectDir, '.env.local'), envContent);
}

/**
 * Update package.json with custom project name
 */
async function updatePackageJson(projectDir, config) {
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  
  const projectName = config.projectName || 'griffion-frontend';
  const appName = config.appName || 'Griffion';
  
  packageJson.name = projectName.toLowerCase().replace(/\s+/g, '-');
  packageJson.description = `${appName} - Next.js Frontend Application`;
  packageJson.version = '1.0.0';
  
  // Update author if provided
  if (config.author) {
    packageJson.author = config.author;
  }
  
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

/**
 * Create comprehensive README for the frontend
 */
async function createReadme(projectDir, config) {
  const appName = config.appName || 'Griffion';
  const apiUrl = config.apiUrl || 'http://localhost:5000';
  
  const readmeContent = `# ${appName} - Frontend Application

Modern Next.js frontend application with authentication, role-based access control, and dynamic navigation.

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment

Edit \`.env.local\` to set your backend API URL and other settings:

\`\`\`env
NEXT_PUBLIC_API_URL=${apiUrl}
NEXT_PUBLIC_DEFAULT_THEME=dark
NEXT_PUBLIC_APP_NAME=${appName}
\`\`\`

### 3. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 📚 Features

### ✅ Authentication
- **Login** - Email/username and password authentication
- **Register** - User registration with role selection
- **Forgot Password** - Password recovery flow
- **Reset Password** - Token-based password reset
- **2FA Support** - Two-factor authentication with TOTP

### ✅ User Interface
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - Automatic theme switching
- **Dynamic Navigation** - Role-based menu structure
- **Protected Routes** - Automatic authentication checks

### ✅ State Management
- **Redux Toolkit** - Centralized state management
- **Persistent Auth** - Token storage with auto-refresh
- **Navigation State** - Dynamic menu caching

### ✅ Developer Experience
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Hot Reload** - Instant feedback during development
- **ESLint** - Code quality checks

## 🎨 Customization

### Branding

Update these environment variables in \`.env.local\`:

\`\`\`env
NEXT_PUBLIC_APP_NAME=Your App Name
NEXT_PUBLIC_PRIMARY_COLOR=#6366f1
NEXT_PUBLIC_SECONDARY_COLOR=#8b5cf6
NEXT_PUBLIC_LOGO_PATH=/logo.png
\`\`\`

### Theme

Default theme can be set to light or dark:

\`\`\`env
NEXT_PUBLIC_DEFAULT_THEME=dark
\`\`\`

Users can switch themes using the theme toggle in the navbar.

### Authentication

Configure primary identifier (email or username):

\`\`\`env
NEXT_PUBLIC_PRIMARY_IDENTIFIER=email  # Options: email, username, both
\`\`\`

### Role-Based Registration

Define which roles allow self-registration:

\`\`\`env
NEXT_PUBLIC_SELF_REGISTER_ROLES=user,buyer,seller
\`\`\`

This creates dynamic routes:
- \`/user/register\`
- \`/buyer/register\`
- \`/seller/register\`

## 📁 Project Structure

\`\`\`
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth layout group
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/         # Dashboard layout group
│   │   └── [...slug]/       # Dynamic catch-all routes
│   ├── [role]/              # Dynamic role-based registration
│   │   └── register/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
│
├── components/              # React components
│   ├── layout/
│   │   ├── ConditionalDashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navbar.tsx
│   └── ThemeInitializer.tsx
│
├── lib/                     # Utilities and logic
│   ├── apiService.ts        # API methods
│   ├── apiClient.ts         # Axios instance
│   ├── theme.ts             # Theme utilities
│   └── redux/               # Redux setup
│       ├── store.ts
│       ├── slices/
│       └── thunks.ts
│
└── public/                  # Static assets

\`\`\`

## 🔐 Authentication Flow

### Login
1. User enters credentials (email/username + password)
2. Optional 2FA code if enabled
3. Receives JWT access token + refresh token
4. Tokens stored in Redux (persisted to localStorage)
5. Redirected to dashboard

### Token Refresh
- Access tokens automatically refreshed before expiration
- Refresh tokens used to obtain new access tokens
- Expired tokens trigger automatic logout

### Protected Routes
- All routes under \`/dashboard\` require authentication
- Automatic redirect to login if unauthenticated
- Token expiration checked every 30 seconds

## 🌐 API Integration

### API Service

Located in \`lib/apiService.ts\`, provides methods for:

\`\`\`typescript
// Authentication
api.login(identifier, password, totpToken)
api.register(data)
api.forgotPassword(email)
api.resetPassword(token, newPassword)

// User management
api.getProfile()
api.updateProfile(data)
api.changePassword(currentPassword, newPassword)

// Navigation
api.getNavigation()

// Admin (if role permits)
api.getUsers(params)
api.createUser(data)
api.getRoles()
\`\`\`

### API Client

Axios instance with:
- Automatic token injection
- Request/response interceptors
- Error handling
- Token refresh logic

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

\`\`\`bash
docker build -t ${appName.toLowerCase()}-frontend .
docker run -p 3000:3000 ${appName.toLowerCase()}-frontend
\`\`\`

### Environment Variables

Required for production:
- \`NEXT_PUBLIC_API_URL\` - Backend API endpoint
- \`NEXT_PUBLIC_APP_NAME\` - Application name
- \`NEXT_PUBLIC_DEFAULT_THEME\` - Default theme

## 📖 Documentation

Additional documentation available in the project:

- \`API_INTEGRATION_GUIDE.md\` - Backend API integration
- \`REDUX_IMPLEMENTATION.md\` - State management details
- \`NAVIGATION_GUIDE.md\` - Navigation system
- \`QUICK_START.md\` - Getting started guide

## 🐛 Troubleshooting

### Cannot connect to backend
- Verify \`NEXT_PUBLIC_API_URL\` in \`.env.local\`
- Ensure backend server is running
- Check CORS configuration on backend

### Authentication not working
- Clear browser localStorage
- Check token expiration times
- Verify backend JWT secrets

### Navigation not loading
- Verify user has assigned role
- Check backend navigation tree configuration
- Review browser console for errors

## 🤝 Support

For issues or questions:
1. Check the documentation files
2. Review browser console for errors
3. Verify environment configuration
4. Test API endpoints with Postman

## 📝 License

This project is generated by Griffion and is ready for production use.
`;
  
  await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent);
}

/**
 * Clean up unnecessary files from the generated project
 */
async function cleanupUnnecessaryFiles(projectDir) {
  const filesToRemove = [
    '.env.local.backup',
    'UPDATE_SUMMARY.md',
    'IMPLEMENTATION_SUMMARY.md',
    'NAVIGATION_CHANGELOG.md'
  ];
  
  for (const file of filesToRemove) {
    const filePath = path.join(projectDir, file);
    try {
      if (await fileExists(filePath)) {
        await fs.unlink(filePath);
        console.log(`   ✓ Removed ${file}`);
      }
    } catch (error) {
      // Ignore errors for files that don't exist
    }
  }
}

/**
 * Recursively copy directory with exclusions
 */
async function copyDirectory(src, dest, exclude = []) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    // Skip excluded directories/files
    if (exclude.includes(entry.name)) {
      continue;
    }
    
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, exclude);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
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
  generateFrontend,
  createZip,
  cleanup
};
