// Token Replacement Engine for Griffion Templates
const crypto = require('crypto');

/**
 * Generate JWT secrets
 */
function generateSecrets() {
  return {
    jwtSecret: crypto.randomBytes(64).toString('hex'),
    jwtRefreshSecret: crypto.randomBytes(64).toString('hex')
  };
}

/**
 * Build database URL based on provider
 */
function buildDatabaseUrl(config) {
  const { dbProvider } = config;
  
  if (dbProvider === 'mysql') {
    const { dbHost, dbPort, dbName, dbUser, dbPassword } = config;
    return `mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort || 3306}/${dbName}`;
  }
  
  if (dbProvider === 'postgresql' || dbProvider === 'postgres') {
    const { dbHost, dbPort, dbName, dbUser, dbPassword } = config;
    return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort || 5432}/${dbName}`;
  }
  
  if (dbProvider === 'mongodb') {
    const { dbHost, dbPort, dbName, dbUser, dbPassword } = config;
    if (dbUser && dbPassword) {
      return `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort || 27017}/${dbName}?authSource=admin`;
    }
    return `mongodb://${dbHost}:${dbPort || 27017}/${dbName}`;
  }
  
  throw new Error(`Unsupported database provider: ${dbProvider}`);
}

/**
 * Create slug from project name
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Build token map from configuration
 */
function buildTokenMap(config) {
  const secrets = generateSecrets();
  const databaseUrl = buildDatabaseUrl(config);
  const projectSlug = slugify(config.projectName || 'griffion-backend');
  
  // Base tokens
  const tokens = {
    // Project Info
    '__PROJECT_NAME__': config.projectName || 'Griffion Backend',
    '__PROJECT_NAME_SLUG__': projectSlug,
    '__PROJECT_DESCRIPTION__': config.projectDescription || 'Production-ready authentication backend',
    '__AUTHOR__': config.author || '',
    '__PORT__': config.port || 5000,
    '__FRONTEND_URL__': config.frontendUrl || 'http://localhost:3000',
    
    // Database
    '__DB_PROVIDER__': config.dbProvider || 'mysql',
    '__DATABASE_URL__': databaseUrl,
  
  // JSON field type
  '__JSON_TYPE__': 'Json',
    
    // JWT Secrets
    '__JWT_SECRET__': secrets.jwtSecret,
    '__JWT_REFRESH_SECRET__': secrets.jwtRefreshSecret,
    
    // Authentication
    '__PRIMARY_IDENTIFIER__': config.primaryIdentifier || 'email',
    '__ENABLE_2FA__': config.enable2FA ? 'true' : 'false',
    '__ENABLE_PASSWORD_RECOVERY__': config.enablePasswordRecovery ? 'true' : 'false',
    '__ENABLE_GROUPS__': config.enableGroups ? 'true' : 'false',
    '__ENABLE_NAVIGATION__': config.enableNavigation !== false ? 'true' : 'false',
    '__ENABLE_ADMIN_PANEL__': config.enableAdminPanel ? 'true' : 'false',
    
    // Admin User
    '__ADMIN_EMAIL__': config.adminEmail || 'admin@griffion.local',
    '__ADMIN_PASSWORD__': config.adminPassword || 'Admin123!',
    '__ADMIN_FIRST_NAME__': config.adminFirstName || 'System',
    '__ADMIN_LAST_NAME__': config.adminLastName || 'Administrator',
    '__DEFAULT_ADMIN_ROLE__': config.roles && config.roles.length > 0 ? config.roles[0].name : 'Admin'
  };

  // MongoDB-specific tokens removed as we now use separate schema templates

  // Conditional imports and route registrations
  if (config.enableAdminPanel) {
    tokens['__ADMIN_ROUTES_IMPORT__'] = "const adminRoutes = require('./src/routes/admin');";
    tokens['__ADMIN_ROUTES_USE__'] = "app.use('/api/admin', adminRoutes);";
    tokens['__ADMIN_LOG__'] = "console.log('🔧 Admin Panel: Enabled');";
  } else {
    tokens['__ADMIN_ROUTES_IMPORT__'] = '';
    tokens['__ADMIN_ROUTES_USE__'] = '';
    tokens['__ADMIN_LOG__'] = '';
  }

  // Navigation routes
  if (config.enableNavigation !== false) {
    tokens['__NAVIGATION_ROUTES_IMPORT__'] = "const navigationRoutes = require('./src/routes/navigation');";
    tokens['__NAVIGATION_ROUTES_USE__'] = "app.use('/api/navigation', navigationRoutes);";
  } else {
    tokens['__NAVIGATION_ROUTES_IMPORT__'] = '';
    tokens['__NAVIGATION_ROUTES_USE__'] = '';
  }

  // User routes
  tokens['__USER_ROUTES_IMPORT__'] = "const userRoutes = require('./src/routes/users');";
  tokens['__USER_ROUTES_USE__'] = "app.use('/api/users', userRoutes);";

  // Groups routes
  if (config.enableGroups) {
    tokens['__GROUP_ROUTES_IMPORT__'] = "const groupRoutes = require('./src/routes/groups');";
    tokens['__GROUP_ROUTES_USE__'] = "app.use('/api/groups', groupRoutes);";
  } else {
    tokens['__GROUP_ROUTES_IMPORT__'] = '';
    tokens['__GROUP_ROUTES_USE__'] = '';
  }

  // Username field
  if (config.primaryIdentifier === 'username' || config.primaryIdentifier === 'both') {
    tokens['__USERNAME_FIELD_ASSIGN__'] = "adminData.username = '__ADMIN_USERNAME__';";
    tokens['__ADMIN_USERNAME__'] = config.adminUsername || 'admin';
  } else {
    tokens['__USERNAME_FIELD_ASSIGN__'] = '// Username not used';
  }

  // Email dependency
  if (config.enablePasswordRecovery) {
    tokens['__EMAIL_DEPENDENCY__'] = ',\n    "nodemailer": "^6.9.13"';
    tokens['__EMAIL_CONFIG__'] = `
# Email Configuration (Required for Password Recovery)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=${projectSlug}@yourapp.com`;
  } else {
    tokens['__EMAIL_DEPENDENCY__'] = '';
    tokens['__EMAIL_CONFIG__'] = '';
  }

  // 2FA dependency
  if (config.enable2FA) {
    tokens['__SPEAKEASY_DEPENDENCY__'] = ',\n    "speakeasy": "^2.0.0",\n    "qrcode": "^1.5.3"';
  } else {
    tokens['__SPEAKEASY_DEPENDENCY__'] = '';
  }

  // README dynamic sections
  tokens['__DB_PROVIDER_NAME__'] = config.dbProvider === 'mysql' ? 'MySQL' :
                                    config.dbProvider === 'postgresql' ? 'PostgreSQL' :
                                    config.dbProvider === 'postgres' ? 'PostgreSQL' :
                                    config.dbProvider === 'mongodb' ? 'MongoDB' : 'MySQL';

  if (config.enablePasswordRecovery) {
    tokens['__PASSWORD_RECOVERY_ENDPOINTS__'] = `- \`POST /api/auth/forgot-password\` - Request password reset
- \`POST /api/auth/reset-password\` - Reset password with token`;
  } else {
    tokens['__PASSWORD_RECOVERY_ENDPOINTS__'] = '';
  }

  if (config.enable2FA) {
    tokens['__2FA_ENDPOINTS__'] = `- \`POST /api/auth/2fa/enable\` - Enable 2FA
- \`POST /api/auth/2fa/verify\` - Verify 2FA code
- \`POST /api/auth/2fa/disable\` - Disable 2FA`;
    tokens['__2FA_SECURITY__'] = '- ✅ Time-based One-Time Password (TOTP) 2FA';
  } else {
    tokens['__2FA_ENDPOINTS__'] = '';
    tokens['__2FA_SECURITY__'] = '';
  }

  if (config.enableAdminPanel) {
    tokens['__ADMIN_ENDPOINTS__'] = `
#### Admin Panel (Admin Only)
- \`GET /api/admin/users\` - List all users
- \`POST /api/admin/users\` - Create user manually
- \`PUT /api/admin/users/:id\` - Update user
- \`DELETE /api/admin/users/:id\` - Delete user
- \`GET /api/admin/audit-logs\` - View audit logs`;
    tokens['__RBAC_SECURITY__'] = '- ✅ Role-Based Access Control (RBAC)';
  } else {
    tokens['__ADMIN_ENDPOINTS__'] = '';
    tokens['__RBAC_SECURITY__'] = '';
  }

  if (config.enableNavigation !== false) {
    tokens['__NAVIGATION_ENDPOINTS__'] = `
#### Navigation
- \`GET /api/navigation/menu\` - Get role-based navigation tree
- \`GET /api/navigation/public\` - Get public navigation nodes`;
  } else {
    tokens['__NAVIGATION_ENDPOINTS__'] = '';
  }

  if (config.enableGroups) {
    tokens['__GROUP_SCHEMA__'] = '- **Groups** - User group management\n- **GroupMemberships** - Group membership tracking';
    tokens['__GROUP_ENDPOINTS__'] = `
#### Groups
- \`GET /api/groups\` - List all groups (admin)
- \`POST /api/groups\` - Create group (admin)
- \`GET /api/groups/:id\` - Get group details
- \`PUT /api/groups/:id\` - Update group (admin)
- \`DELETE /api/groups/:id\` - Delete group (admin)
- \`POST /api/groups/:id/members\` - Add member (admin)
- \`DELETE /api/groups/:id/members/:userId\` - Remove member (admin)
- \`GET /api/groups/:id/members\` - List group members`;
  } else {
    tokens['__GROUP_SCHEMA__'] = '';
    tokens['__GROUP_ENDPOINTS__'] = '';
  }

  if (config.enablePasswordRecovery) {
    tokens['__EMAIL_SECTION__'] = `
### Email Configuration (Required)

Since password recovery is enabled, email must be configured:

- \`EMAIL_HOST\` - SMTP server hostname
- \`EMAIL_PORT\` - SMTP port (587 for TLS, 465 for SSL)
- \`EMAIL_SECURE\` - Use SSL (true for port 465)
- \`EMAIL_USER\` - SMTP username
- \`EMAIL_PASSWORD\` - SMTP password (use app-specific password for Gmail)
- \`EMAIL_FROM\` - From address`;
  } else {
    tokens['__EMAIL_SECTION__'] = '';
  }

  // Roles seed
  tokens['__ROLES_SEED__'] = generateRolesSeed(config.roles);

  // Navigation seed - pass roles for ID mapping
  tokens['__NAVIGATION_SEED__'] = generateNavigationSeed(config.navigationTree, config.roles);

  // Groups model and relation
  if (config.enableGroups) {
    tokens['__GROUP_RELATION__'] = `groupMemberships GroupMembership[]`;
    if (config.dbProvider === 'mongodb') {
      tokens['__GROUP_MODEL__'] = `
// Group Model
model Group {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     GroupMembership[]

  @@map("groups")
}

// Group Membership (Many-to-Many)
model GroupMembership {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  groupId   String   @db.ObjectId
  role      String?  @default("member") // "admin", "member"
  joinedAt  DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([userId, groupId])
  @@map("group_memberships")
}`;
    } else {
      tokens['__GROUP_MODEL__'] = `
// Group Model
model Group {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     GroupMembership[]

  @@map("groups")
}

// Group Membership (Many-to-Many)
model GroupMembership {
  id        String   @id @default(uuid())
  userId    String   
  groupId   String   
  role      String?  @default("member") // "admin", "member"
  joinedAt  DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([userId, groupId])
  @@map("group_memberships")
}`;
    }
  } else {
    tokens['__GROUP_RELATION__'] = '';
    tokens['__GROUP_MODEL__'] = '';
  }

  return tokens;
}

/**
 * Generate roles seed code
 */
function generateRolesSeed(roles) {
  if (!roles || roles.length === 0) {
    return `const adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        description: 'System Administrator',
        registrationType: 'admin',
        isSystemRole: true,
        permissions: JSON.stringify(['*'])
      }
    });`;
  }

  const roleCreations = roles.map((role) => {
    // Remove spaces and special chars from role name for variable name
    const varName = `${role.name.toLowerCase().replace(/\s+/g, '')}Role`;
    return `
    const ${varName} = await prisma.role.create({
      data: {
        name: '${role.name}',
        description: '${role.description || ''}',
        registrationType: '${role.registrationType || 'admin'}',
        isSystemRole: ${role.isSystemRole || false},
        permissions: JSON.stringify(${JSON.stringify(role.permissions || [])})
      }
    });`;
  }).join('\n');

  return roleCreations;
}

/**
 * Generate navigation seed code
 * @param {Array} navigationTree - Navigation tree structure
 * @param {Array} roles - Array of role objects with id and name
 */
function generateNavigationSeed(navigationTree, roles = []) {
  if (!navigationTree || navigationTree.length === 0) {
    return `console.log('  🗺️  No navigation nodes to seed');`;
  }

  // Create a map from role names to role variable names
  const roleNameMap = {};
  const roleIdMap = {};
  roles.forEach(role => {
    const varName = `${role.name.toLowerCase().replace(/\s+/g, '')}Role`;
    roleNameMap[role.name] = varName; // Maps 'Admin' -> 'adminRole'
    roleIdMap[role.id] = varName; // Maps 'role_1' -> 'adminRole', 'role_y1aiy' -> 'teacherRole'
  });

  let code = `console.log('  🗺️  Creating navigation nodes...');\n`;
  
  const generateNodeCode = (nodes, parentVar = 'null', indent = '    ') => {
    return nodes.map((node, index) => {
      const varName = node.id || `node_${Date.now()}_${index}`;
      let nodeCode = `${indent}const ${varName} = await prisma.navigationNode.create({\n`;
      nodeCode += `${indent}  data: {\n`;
      nodeCode += `${indent}    name: '${node.name}',\n`;
      nodeCode += `${indent}    type: '${node.type || 'page'}',\n`;
      if (node.path) nodeCode += `${indent}    path: '${node.path}',\n`;
      if (node.icon) nodeCode += `${indent}    icon: '${node.icon}',\n`;
      nodeCode += `${indent}    isPublic: ${node.isPublic || false},\n`;
      nodeCode += `${indent}    order: ${node.order || index},\n`;
      if (parentVar !== 'null') nodeCode += `${indent}    parentId: ${parentVar}.id,\n`;
      
      // Add role connections if accessRoles is specified
      if (node.accessRoles && Array.isArray(node.accessRoles) && node.accessRoles.length > 0) {
        nodeCode += `${indent}    accessRoles: {\n`;
        nodeCode += `${indent}      connect: [\n`;
        node.accessRoles.forEach(roleIdentifier => {
          // Try to match by role name first (for test-generator), then by ID (for frontend)
          let roleVarName = roleNameMap[roleIdentifier] || roleIdMap[roleIdentifier];
          if (!roleVarName) {
            // Fallback: create variable name from identifier
            roleVarName = `${roleIdentifier.toLowerCase().replace(/\s+/g, '')}Role`;
          }
          nodeCode += `${indent}        { id: ${roleVarName}.id },\n`;
        });
        nodeCode += `${indent}      ]\n`;
        nodeCode += `${indent}    },\n`;
      }
      
      nodeCode += `${indent}  }\n`;
      nodeCode += `${indent}});\n`;
      
      if (node.children && node.children.length > 0) {
        nodeCode += generateNodeCode(node.children, varName, indent);
      }
      
      return nodeCode;
    }).join('\n');
  };
  
  code += generateNodeCode(navigationTree);
  return code;
}

/**
 * Replace tokens in a string
 */
function replaceTokens(content, tokenMap) {
  let result = content;
  
  for (const [token, value] of Object.entries(tokenMap)) {
    const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, String(value));
  }
  
  return result;
}

/**
 * Process a file and replace all tokens
 */
async function processTemplateFile(filePath, tokenMap) {
  const fs = require('fs').promises;
  
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    content = replaceTokens(content, tokenMap);
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    console.error(`Error processing template file ${filePath}:`, error);
    throw error;
  }
}

module.exports = {
  buildTokenMap,
  replaceTokens,
  processTemplateFile,
  generateSecrets,
  buildDatabaseUrl
};
