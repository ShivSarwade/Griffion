const { prisma } = require('../database/init');

/**
 * Create an audit log entry
 * Accepts both object parameter and individual parameters for backwards compatibility
 */
const createAuditLog = async (param1, action, resource, resourceId, details) => {
  try {
    let logData;

    // Check if called with object parameter (new style) or individual parameters (old style)
    if (typeof param1 === 'object' && !action) {
      // New style: { userId, action, resource, resourceId, details }
      logData = {
        userId: param1.userId,
        action: param1.action,
        resource: param1.resource || null,
        resourceId: param1.resourceId || null,
        details: param1.details ? JSON.stringify(param1.details) : null,
        ipAddress: param1.ipAddress || null,
        userAgent: param1.userAgent || null
      };
    } else {
      // Old style: (userId, action, resource, resourceId, details)
      logData = {
        userId: param1,
        action,
        resource: resource || null,
        resourceId: resourceId || null,
        details: details ? JSON.stringify(details) : null
      };
    }
    
    await prisma.auditLog.create({
      data: logData
    });
  } catch (err) {
    console.error('Error creating audit log:', err);
  }
};

module.exports = {
  createAuditLog
};
