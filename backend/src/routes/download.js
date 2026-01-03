const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const backendGeneratorModule = require('../utils/backendGenerator');
const frontendGeneratorModule = require('../utils/frontendGenerator');
const fullstackGeneratorModule = require('../utils/fullstackGenerator');

console.log('🔍 DEBUG: backendGenerator module loaded:', backendGeneratorModule);
console.log('🔍 DEBUG: Available exports:', Object.keys(backendGeneratorModule));
console.log('🔍 DEBUG: generateBackend type:', typeof backendGeneratorModule.generateBackend);

const { generateBackend, createZip, cleanup } = backendGeneratorModule;
const { generateFrontend } = frontendGeneratorModule;
const { generateFullStack } = fullstackGeneratorModule;

// Generate and download custom backend
router.post('/generate', async (req, res) => {
  try {
    const config = req.body;

    console.log('Generating backend with config:', config);

    // Generate backend files
    const backendDir = await generateBackend(config);
    
    // Create ZIP file
    const zipPath = path.join(__dirname, '../../temp', `griffion-backend-${Date.now()}.zip`);
    await createZip(backendDir, zipPath);

    // Send ZIP file
    res.download(zipPath, 'griffion-backend.zip', async (err) => {
      if (err) {
        console.error('Download error:', err);
      }

      // Cleanup: Delete temp files after download
      // COMMENTED OUT FOR DEBUGGING - uncomment in production
      // setTimeout(async () => {
      //   try {
      //     await cleanup(backendDir);
      //     fs.unlinkSync(zipPath);
      //   } catch (cleanupErr) {
      //     console.error('Cleanup error:', cleanupErr);
      //   }
      // }, 5000);
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating backend',
      error: error.message
    });
  }
});

// Generate and download full-stack project (Backend + Frontend)
router.post('/generate-fullstack', async (req, res) => {
  try {
    const config = req.body;

    console.log('🚀 [FULLSTACK] Starting generation with config:', JSON.stringify(config, null, 2));

    // Generate complete project (backend + frontend)
    const projectDir = await generateFullStack(config);
    console.log('✅ [FULLSTACK] Project generated at:', projectDir);
    
    // Create ZIP file
    const zipFilename = `griffion-fullstack-${Date.now()}.zip`;
    const zipPath = path.join(__dirname, '../../temp', zipFilename);
    console.log('📦 [FULLSTACK] Creating ZIP at:', zipPath);
    
    await fullstackGeneratorModule.createZip(projectDir, zipPath);
    console.log('✅ [FULLSTACK] ZIP created successfully');

    // Return JSON with download URL instead of sending file
    const responseData = {
      success: true,
      message: 'Full-stack project generated successfully',
      data: {
        projectDir: projectDir,
        zipPath: zipPath,
        zipFilename: zipFilename,
        downloadUrl: `/api/download/file/${zipFilename}`
      }
    };
    
    console.log('📤 [FULLSTACK] Sending response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);

  } catch (error) {
    console.error('❌ [FULLSTACK] Generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating full-stack project',
      error: error.message
    });
  }
});

// Generate and download custom frontend
router.post('/generate-frontend', async (req, res) => {
  try {
    const config = req.body;

    console.log('Generating frontend with config:', config);

    // Generate frontend files
    const frontendDir = await generateFrontend(config);
    
    // Create ZIP file
    const zipPath = path.join(__dirname, '../../temp', `griffion-frontend-${Date.now()}.zip`);
    await frontendGeneratorModule.createZip(frontendDir, zipPath);

    // Send ZIP file
    res.download(zipPath, 'griffion-frontend.zip', async (err) => {
      if (err) {
        console.error('Download error:', err);
      }

      // Cleanup: Delete temp files after download
      // COMMENTED OUT FOR DEBUGGING - uncomment in production
      // setTimeout(async () => {
      //   try {
      //     await frontendGeneratorModule.cleanup(frontendDir);
      //     fs.unlinkSync(zipPath);
      //   } catch (cleanupErr) {
      //     console.error('Cleanup error:', cleanupErr);
      //   }
      // }, 5000);
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating frontend',
      error: error.message
    });
  }
});

// Preview configuration (without downloading)
router.post('/preview', async (req, res) => {
  try {
    const config = req.body;

    res.json({
      success: true,
      data: {
        features: {
          '2fa': config.enable2FA,
          'password_recovery': config.enablePasswordRecovery,
          'admin_panel': config.enableAdminPanel,
          'rbac': config.enableRBAC,
          'groups': config.enableGroups
        },
        database: config.database,
        estimatedSize: '~2-5 MB',
        filesIncluded: [
          'package.json',
          '.env',
          'README.md',
          'src/server.js',
          'src/routes/',
          'src/controllers/',
          'src/middleware/',
          'src/database/',
          'src/utils/'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error previewing configuration'
    });
  }
});

// Download generated ZIP file by filename
router.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../temp', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
  
  // Send file
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    }
  });
});

module.exports = router;
