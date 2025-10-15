const { getDatabase } = require('../database/init');

const createAuditLog = (userId, action, ipAddress, userAgent, status) => {
  const db = getDatabase();

  db.run(
    'INSERT INTO audit_log (user_id, action, ip_address, user_agent, status) VALUES (?, ?, ?, ?, ?)',
    [userId, action, ipAddress, userAgent, status],
    (err) => {
      if (err) {
        console.error('Error creating audit log:', err);
      }
    }
  );
};

module.exports = {
  createAuditLog
};
