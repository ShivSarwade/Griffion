// Griffion Backend Template - Database Initialization
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
    __ROLES_SEED__

    // Seed Admin User
    console.log('  👤 Creating admin user...');
    const adminRole = await prisma.role.findUnique({
      where: { name: '__DEFAULT_ADMIN_ROLE__' }
    });

    if (!adminRole) {
      throw new Error('Admin role not found. Cannot create admin user.');
    }

    const hashedPassword = await bcrypt.hash('__ADMIN_PASSWORD__', 12);
    
    const adminData = {
      email: '__ADMIN_EMAIL__',
      password: hashedPassword,
      firstName: '__ADMIN_FIRST_NAME__',
      lastName: '__ADMIN_LAST_NAME__',
      emailVerified: true,
      mfaEnabled: false,
      roleId: adminRole.id
    };
    
    __USERNAME_FIELD_ASSIGN__
    
    await prisma.user.create({ data: adminData });

    // Seed Navigation Nodes
    __NAVIGATION_SEED__

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Helper function to handle JSON fields (SQLite stores as string)
function jsonField(value) {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

async function closeDatabase() {
  await prisma.$disconnect();
}

module.exports = {
  prisma,
  initializeDatabase,
  closeDatabase
};
