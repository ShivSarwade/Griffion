const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let db = null;

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DB_PATH || './data/auth.db';
    const dbDir = path.dirname(dbPath);

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      console.log('Connected to SQLite database');

      // Create tables
      db.serialize(() => {
        // Users table
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            is_active INTEGER DEFAULT 1,
            is_locked INTEGER DEFAULT 0,
            failed_login_attempts INTEGER DEFAULT 0,
            last_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Tokens table
        db.run(`
          CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token_hash TEXT NOT NULL,
            type TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        // Audit log table
        db.run(`
          CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            status TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        // Roles table (if RBAC enabled)
        if (process.env.ENABLE_RBAC === 'true') {
          db.run(`
            CREATE TABLE IF NOT EXISTS roles (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT UNIQUE NOT NULL,
              permissions TEXT,
              description TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);
        }

        // Groups table (if groups enabled)
        if (process.env.ENABLE_GROUPS === 'true') {
          db.run(`
            CREATE TABLE IF NOT EXISTS groups (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT UNIQUE NOT NULL,
              description TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);

          db.run(`
            CREATE TABLE IF NOT EXISTS user_groups (
              user_id INTEGER NOT NULL,
              group_id INTEGER NOT NULL,
              PRIMARY KEY (user_id, group_id),
              FOREIGN KEY (user_id) REFERENCES users (id),
              FOREIGN KEY (group_id) REFERENCES groups (id)
            )
          `);
        }

        // Create default admin user
        const adminPassword = bcrypt.hashSync('Admin123!', parseInt(process.env.BCRYPT_ROUNDS) || 10);
        
        db.run(`
          INSERT OR IGNORE INTO users (email, password, role)
          VALUES (?, ?, ?)
        `, ['admin@griffion.local', adminPassword, 'admin'], (err) => {
          if (err) {
            console.error('Error creating admin user:', err);
          } else {
            console.log('✓ Default admin user created');
          }
          resolve();
        });
      });
    });
  });
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

module.exports = {
  initializeDatabase,
  getDatabase
};
