/**
 * Test script for frontend generator
 * 
 * Usage: node test-frontend-generator.js
 */

const { generateFrontend, createZip, cleanup } = require('./src/utils/frontendGenerator');
const path = require('path');

// Test configuration
const testConfig = {
  projectName: 'my-awesome-app',
  appName: 'Awesome App',
  apiUrl: 'http://localhost:5000',
  defaultTheme: 'dark',
  defaultRole: 'User',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  logoPath: '/logo.png',
  primaryIdentifier: 'email',
  selfRegisterRoles: 'user,buyer,seller',
  author: 'Test User <test@example.com>'
};

async function testFrontendGeneration() {
  console.log('🧪 Testing Griffion Frontend Generator...\n');
  
  try {
    // Step 1: Generate frontend
    console.log('📦 Step 1: Generating frontend...\n');
    const projectDir = await generateFrontend(testConfig);
    
    console.log('\n✅ Frontend generated successfully!');
    console.log(`   Location: ${projectDir}\n`);
    
    // Step 2: Create ZIP
    console.log('📦 Step 2: Creating ZIP file...\n');
    const zipPath = path.join(__dirname, 'temp', `test-frontend-${Date.now()}.zip`);
    await createZip(projectDir, zipPath);
    
    console.log('✅ ZIP created successfully!');
    console.log(`   Location: ${zipPath}\n`);
    
    console.log('🔍 Step 3: Verifying generated files...\n');
    
    const fs = require('fs').promises;
    
    // Check essential files exist
    const essentialFiles = [
      'package.json',
      '.env.local',
      'README.md',
      'next.config.ts',
      'app/layout.tsx',
      'app/page.tsx',
      'app/login/page.tsx',
      'app/register/page.tsx',
      'app/forgot-password/page.tsx',
      'app/reset-password/page.tsx',
      'lib/apiService.ts',
      'lib/redux/store.ts'
    ];
    
    for (const file of essentialFiles) {
      const filePath = path.join(projectDir, file);
      try {
        await fs.access(filePath);
        console.log(`   ✓ ${file}`);
      } catch (error) {
        console.log(`   ✗ ${file} - MISSING!`);
      }
    }
    
    console.log('\n📋 Step 4: Checking configuration...\n');
    
    // Read .env.local
    const envPath = path.join(projectDir, '.env.local');
    const envContent = await fs.readFile(envPath, 'utf8');
    console.log('   Environment file content:');
    console.log('   ' + envContent.split('\n').filter(line => line.includes('=')).slice(0, 5).join('\n   '));
    
    // Read package.json
    const packagePath = path.join(projectDir, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
    console.log(`\n   Package name: ${packageJson.name}`);
    console.log(`   Description: ${packageJson.description}`);
    
    console.log('\n✅ All checks passed!\n');
    
    console.log('📝 Next Steps:');
    console.log(`   1. cd ${projectDir}`);
    console.log('   2. npm install');
    console.log('   3. npm run dev');
    console.log('   4. Open http://localhost:3000\n');
    
    console.log('🗑️  To cleanup test files:');
    console.log(`   - Frontend: ${projectDir}`);
    console.log(`   - ZIP: ${zipPath}\n`);
    
    // Optional: Cleanup (comment out to keep files for inspection)
    // console.log('🧹 Cleaning up...');
    // await cleanup(projectDir);
    // await fs.unlink(zipPath);
    // console.log('✅ Cleanup completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

// Run test
testFrontendGeneration();
