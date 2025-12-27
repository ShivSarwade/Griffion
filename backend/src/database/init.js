// Griffion Backend - Database Initialization
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function initializeDatabase() {
  try {
    console.log('📦 Initializing database...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Check if seeding is needed
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('🌱 Running initial seed...');
      await seedDatabase();
    } else {
      console.log(`📊 Database already seeded (${userCount} users found)`);
    }

    return prisma;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    // Seed Roles
    console.log('  📝 Creating roles...');
    
    const adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        description: 'System Administrator',
        registrationType: 'admin',
        isSystemRole: true,
        permissions: JSON.stringify(['*'])
      }
    });

    const managerRole = await prisma.role.create({
      data: {
        name: 'Manager',
        description: 'Department Manager',
        registrationType: 'admin',
        isSystemRole: false,
        permissions: JSON.stringify(['users.read', 'reports.read'])
      }
    });

    const userRole = await prisma.role.create({
      data: {
        name: 'User',
        description: 'Standard User',
        registrationType: 'public',
        isSystemRole: false,
        permissions: JSON.stringify(['profile.read', 'profile.update'])
      }
    });

    const buyerRole = await prisma.role.create({
      data: {
        name: 'Buyer',
        description: 'Marketplace Buyer',
        registrationType: 'public',
        isSystemRole: false,
        permissions: JSON.stringify(['products.read', 'orders.create', 'orders.read'])
      }
    });

    const sellerRole = await prisma.role.create({
      data: {
        name: 'Seller',
        description: 'Marketplace Seller',
        registrationType: 'public',
        isSystemRole: false,
        permissions: JSON.stringify(['products.create', 'products.update', 'orders.read'])
      }
    });

    // Seed Navigation Nodes
    console.log('  🗺️  Creating navigation nodes...');

    const dashboard = await prisma.navigationNode.create({
      data: {
        name: 'Dashboard',
        type: 'page',
        path: '/dashboard',
        icon: 'dashboard',
        isPublic: false,
        order: 0,
        accessRoles: {
          connect: [
            { id: adminRole.id },
            { id: managerRole.id },
            { id: userRole.id }
          ]
        }
      }
    });

    const adminSection = await prisma.navigationNode.create({
      data: {
        name: 'Administration',
        type: 'section',
        icon: 'settings',
        isPublic: false,
        order: 1,
        accessRoles: {
          connect: [
            { id: adminRole.id },
            { id: managerRole.id }
          ]
        }
      }
    });

    const usersPage = await prisma.navigationNode.create({
      data: {
        name: 'Users',
        type: 'page',
        path: '/admin/users',
        icon: 'users',
        isPublic: false,
        order: 0,
        parentId: adminSection.id,
        accessRoles: {
          connect: [
            { id: adminRole.id },
            { id: managerRole.id }
          ]
        }
      }
    });

    const auditLogs = await prisma.navigationNode.create({
      data: {
        name: 'Audit Logs',
        type: 'page',
        path: '/admin/logs',
        icon: 'file-text',
        isPublic: false,
        order: 1,
        parentId: adminSection.id,
        accessRoles: {
          connect: [
            { id: adminRole.id }
          ]
        }
      }
    });

    // Seed Admin User
    console.log('  👤 Creating admin user...');
    
    // Use the first admin role created (adminRole) or find by name as fallback
    let selectedAdminRole = adminRole;
    if (!selectedAdminRole) {
      selectedAdminRole = await prisma.role.findFirst({
        where: { 
          OR: [
            { name: 'Admin' },
            { registrationType: 'admin' }
          ]
        }
      });
    }

    if (!selectedAdminRole) {
      throw new Error('No admin role available. Cannot create admin user.');
    }

    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    const adminData = {
      email: 'admin@griffion.local',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      emailVerified: true,
      mfaEnabled: false,
      roleId: selectedAdminRole.id
    };
    
    await prisma.user.create({ data: adminData });

    console.log('✅ Database seeded successfully');
    console.log('   - 5 Roles created');
    console.log('   - 4 Navigation nodes created with role assignments');
    console.log('   - 1 Admin user created');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function closeDatabase() {
  await prisma.$disconnect();
}

module.exports = {
  prisma,
  initializeDatabase,
  closeDatabase
};
