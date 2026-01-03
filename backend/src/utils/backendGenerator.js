const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { exec } = require('child_process');
const { promisify } = require('util');
const { buildTokenMap, processTemplateFile } = require('./tokenReplacer');

const execAsync = promisify(exec);

/**
 * Main backend generation function following the "Static-First" approach
 * 
 * Process:
 * 1. Copy template directory (tokenized reference app)
 * 2. Replace all tokens with customer configuration
 * 3. Generate Prisma client
 * 4. Initialize and seed database
 * 5. Package and return
 */
async function generateBackend(config) {
  console.log('📦 Starting Griffion backend generation...');
  console.log('📋 Configuration:', JSON.stringify(config, null, 2));
  
  const backendRoot = path.join(__dirname, '../..');
  const templateDir = path.join(backendRoot, 'templates');
  const projectDir = path.join(backendRoot, 'temp', `project-${Date.now()}`);
  
  try {
    // Step 1: Copy template to project directory
    console.log('📁 Step 1: Copying template files...');
    await copyDirectory(templateDir, projectDir);
    console.log(`   ✓ Template copied to ${projectDir}`);
    
    // Step 2: Build token map and replace tokens
    console.log('🔧 Step 2: Building token map...');
    const tokenMap = buildTokenMap(config);
    console.log(`   ✓ Generated ${Object.keys(tokenMap).length} tokens`);
    
    // Step 3: Process all template files
    console.log('📝 Step 3: Replacing tokens in files...');
    await processAllTemplateFiles(projectDir, tokenMap);
    console.log('   ✓ All tokens replaced');
    
    // Step 4: Copy additional source files
    console.log('📋 Step 4: Copying source files...');
    await copySourceFiles(backendRoot, projectDir, config);
    console.log('   ✓ Source files copied');
    
    // Step 5: Create Prisma directory and move schema
    console.log('🗄️  Step 5: Setting up Prisma...');
    const prismaDir = path.join(projectDir, 'prisma');
    await fs.mkdir(prismaDir, { recursive: true });
    
    const schemaPath = path.join(projectDir, 'schema.prisma');
    const prismaSchemaPath = path.join(prismaDir, 'schema.prisma');
    
    if (await fileExists(schemaPath)) {
      await fs.rename(schemaPath, prismaSchemaPath);
      console.log('   ✓ Prisma schema moved to prisma/');
    }
    
    // Step 6: Create .gitignore and other meta files
    console.log('📄 Step 6: Creating meta files...');
    await createMetaFiles(projectDir);
    console.log('   ✓ Meta files created');
    
    // Step 7: Copy documentation and Postman collection
    console.log('📚 Step 7: Copying documentation and API collection...');
    await copyDocumentation(backendRoot, projectDir);
    console.log('   ✓ Documentation copied');
    
    console.log('✅ Backend generation completed successfully!');
    console.log(`📦 Project location: ${projectDir}`);
    console.log('💡 Customer will run: npm install && npm run prisma:push && npm start');
    
    return projectDir;
    
  } catch (error) {
    console.error('❌ Backend generation failed:', error);
    
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
 * Process all template files in a directory recursively
 */
async function processAllTemplateFiles(dir, tokenMap, processed = new Set()) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip node_modules and other directories
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }
    
    if (entry.isDirectory()) {
      await processAllTemplateFiles(fullPath, tokenMap, processed);
    } else {
      // Process text files only
      const textExtensions = ['.js', '.json', '.prisma', '.md', '.env', '.template', '.html', '.css'];
      const ext = path.extname(entry.name);
      
      if (textExtensions.includes(ext) || entry.name === '.env' || entry.name.includes('template')) {
        if (!processed.has(fullPath)) {
          await processTemplateFile(fullPath, tokenMap);
          processed.add(fullPath);
        }
      }
    }
  }
}

/**
 * Copy source files from backend/src to project
 */
async function copySourceFiles(backendRoot, projectDir, config) {
  const srcDir = path.join(backendRoot, 'src');
  const destDir = path.join(projectDir, 'src');
  
  // Ensure src directory exists in project
  await fs.mkdir(destDir, { recursive: true });
  
  // Core files to copy (always included)
  const coreFiles = [
    'routes/auth.js',
    'controllers/authController.js',
    'middleware/auth.js',
    'middleware/errorHandler.js',
    'middleware/rateLimiter.js',
    'utils/email.js',
    'utils/auditLog.js',
    'config.json'
  ];
  
  // Conditional files based on config
  const conditionalFiles = [];
  
  if (config.enableAdminPanel) {
    conditionalFiles.push('routes/admin.js');
    conditionalFiles.push('controllers/adminController.js');
  }
  
  if (config.enableNavigation !== false) {
    conditionalFiles.push('routes/navigation.js');
    conditionalFiles.push('controllers/navigationController.js');
  }
  
  // Include groups if enabled
  if (config.enableGroups) {
    conditionalFiles.push('routes/groups.js');
    conditionalFiles.push('controllers/groupController.js');
  }
  
  // Always include user routes
  conditionalFiles.push('routes/users.js');
  conditionalFiles.push('controllers/userController.js');
  
  const allFiles = [...coreFiles, ...conditionalFiles];
  
  for (const file of allFiles) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    
    // Create directory if needed
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    
    try {
      if (await fileExists(srcPath)) {
        // Read file content
        let content = await fs.readFile(srcPath, 'utf8');
        
        // Fix import paths: ../database/init -> ../../database/init
        // This is needed because in generated projects, database/ is at root level
        // but in main backend it's at src/database/
        content = content.replace(/require\(['"]\.\.\/database\/init['"]\)/g, "require('../../database/init')");
        
        // Fix config.json import paths - stays at ../config.json since it's in src/config.json
        // Controllers in src/controllers/ need ../config.json
        content = content.replace(/require\(['"]\.\.\/\.\.\/config\.json['"]\)/g, "require('../config.json')");
        
        // Write to destination
        await fs.writeFile(destPath, content, 'utf8');
        console.log(`   ✓ Copied ${file}`);
      } else {
        console.warn(`   ⚠️  File not found: ${file}`);
      }
    } catch (error) {
      console.warn(`   ⚠️  Could not copy ${file}: ${error.message}`);
    }
  }
}

/**
 * Copy documentation and API collection to generated project
 */
async function copyDocumentation(backendRoot, projectDir) {
  const docsDir = path.join(projectDir, 'docs');
  await fs.mkdir(docsDir, { recursive: true });
  
  // Files to copy to docs/ directory
  const docsFiles = [
    { src: path.join(backendRoot, '..', 'docs', 'COMPLETE-API-GUIDE.md'), dest: path.join(docsDir, 'API-GUIDE.md') },
    { src: path.join(backendRoot, '..', 'docs', 'CONFIG-JSON-GUIDE.md'), dest: path.join(docsDir, 'CONFIG-GUIDE.md') },
    { src: path.join(backendRoot, '..', 'docs', 'PUBLIC-REGISTRATION-GUIDE.md'), dest: path.join(docsDir, 'REGISTRATION-GUIDE.md') },
    { src: path.join(backendRoot, '..', 'GRIFFION_COMPLETE_API.postman_collection.json'), dest: path.join(projectDir, 'GRIFFION_API.postman_collection.json') }
  ];
  
  for (const file of docsFiles) {
    try {
      if (await fileExists(file.src)) {
        await fs.copyFile(file.src, file.dest);
        console.log(`   ✓ Copied ${path.basename(file.src)}`);
      } else {
        console.warn(`   ⚠️  Documentation file not found: ${path.basename(file.src)}`);
      }
    } catch (error) {
      console.warn(`   ⚠️  Could not copy ${path.basename(file.src)}: ${error.message}`);
    }
  }
  
  // Create README for documentation
  const readmeContent = `# Griffion Generated Backend - Documentation

## Quick Start

1. **Install Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Setup Database:**
   \`\`\`bash
   npx prisma db push
   \`\`\`

3. **Start Server:**
   \`\`\`bash
   npm start
   \`\`\`

4. **Auto-Generated Admin User:**
   - Email: \`admin@test.local\`
   - Password: \`TestAdmin123!\`
   - Change these credentials immediately in production!

## Documentation Files

### API Reference
- **GRIFFION_API.postman_collection.json** - Import into Postman for API testing
  - 35 complete API endpoints
  - Authentication, Users, Admin, Roles, Groups
  - Real request/response examples

### Guides
- **docs/API-GUIDE.md** - Complete API documentation
  - All 35 endpoints explained
  - Request/response examples
  - Authentication & authorization
  - Testing procedures

- **docs/CONFIG-GUIDE.md** - Configuration options
  - config.json settings
  - Default role selection
  - Feature flags
  - Customization options

- **docs/REGISTRATION-GUIDE.md** - Registration flows
  - Default role registration
  - Public role selection
  - Frontend integration examples
  - Security considerations

## Configuration

Edit \`src/config.json\` to customize:
- Default registration role
- Password policy
- Token expiry times
- Email settings

## Environment Variables

Check \`.env\` file for:
- Database connection
- JWT secrets
- Email configuration
- Feature flags

## Testing

1. **Import Postman Collection:**
   - Open Postman
   - Click "Import"
   - Select \`GRIFFION_API.postman_collection.json\`

2. **Login Test:**
   - POST /api/auth/login
   - Email: admin@test.local
   - Password: TestAdmin123!

3. **Create Users:**
   - POST /api/admin/users/bulk
   - Bulk create with email notifications

## Deployment

### Docker
\`\`\`bash
docker build -t griffion-backend .
docker run -p 5000:3000 griffion-backend
\`\`\`

### Changing Admin Credentials
1. Login with admin@test.local
2. Create new admin user via API
3. Delete original admin

### Database
- Change DATABASE_URL in .env for production database
- Run: \`npx prisma db push\`

## Features

✅ User registration (with role selection)
✅ 2FA (TOTP-based)
✅ Admin panel
✅ Role-based access control (RBAC)
✅ Audit logging
✅ Email notifications
✅ Password recovery
✅ User groups
✅ Dynamic navigation

## Support

For issues or questions, refer to:
1. API Guide (docs/API-GUIDE.md)
2. Configuration Guide (docs/CONFIG-GUIDE.md)
3. Postman Collection (GRIFFION_API.postman_collection.json)
`;
  
  await fs.writeFile(path.join(projectDir, 'DOCUMENTATION.md'), readmeContent);
  console.log('   ✓ Created DOCUMENTATION.md');
}

/**
 * Create meta files (.gitignore, Dockerfile, etc.)
 */
async function createMetaFiles(projectDir) {
  // .gitignore
  const gitignore = `# Dependencies
node_modules/
package-lock.json
npm-debug.log*

# Environment
.env
.env.local
.env.*.local

# Database
*.db
*.sqlite
data/
prisma/migrations/

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db
.DS_Store?

# IDE
.vscode/
.idea/
*.swp
*.swo
*.iml

# Build
dist/
build/
temp/

# Prisma
.prisma/
`;
  
  await fs.writeFile(path.join(projectDir, '.gitignore'), gitignore);
  
  // Dockerfile
  const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
`;
  
  await fs.writeFile(path.join(projectDir, 'Dockerfile'), dockerfile);
  
  // .dockerignore
  const dockerignore = `node_modules
npm-debug.log
.env
.env.local
*.db
data/
temp/
.git
.gitignore
`;
  
  await fs.writeFile(path.join(projectDir, '.dockerignore'), dockerignore);
  
  // Rename .env.template to .env
  const envTemplatePath = path.join(projectDir, '.env.template');
  const envPath = path.join(projectDir, '.env');
  
  if (await fileExists(envTemplatePath)) {
    await fs.rename(envTemplatePath, envPath);
  }
}

/**
 * Recursively copy directory
 * Excludes: my-nextjs-app folder from templates
 */
async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    // Skip my-nextjs-app folder in templates
    if (entry.name === 'my-nextjs-app') {
      console.log(`   ⏭️  Skipping: ${entry.name}`);
      continue;
    }

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
  generateBackend,
  createZip,
  cleanup
};
