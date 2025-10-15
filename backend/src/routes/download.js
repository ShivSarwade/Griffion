const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const backendGeneratorModule = require('../utils/backendGenerator');

console.log('🔍 DEBUG: backendGenerator module loaded:', backendGeneratorModule);
console.log('🔍 DEBUG: Available exports:', Object.keys(backendGeneratorModule));
console.log('🔍 DEBUG: generateBackend type:', typeof backendGeneratorModule.generateBackend);

const { generateBackend, createZip, cleanup } = backendGeneratorModule;

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
      setTimeout(async () => {
        try {
          await cleanup(backendDir);
          fs.unlinkSync(zipPath);
        } catch (cleanupErr) {
          console.error('Cleanup error:', cleanupErr);
        }
      }, 5000);
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

module.exports = router;
