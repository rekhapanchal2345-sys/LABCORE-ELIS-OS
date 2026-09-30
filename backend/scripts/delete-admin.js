require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function deleteAdminUser() {
  try {
    console.log('🔍 Looking for existing admin user...');
    
    // Find and delete existing admin user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@labcore.local' },
          { employeeCode: 'ADMIN001' }
        ]
      }
    });

    if (existingUser) {
      console.log(`🗑️ Deleting existing admin user: ${existingUser.email}`);
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
      console.log('✅ Existing admin user deleted successfully!');
    } else {
      console.log('ℹ️ No existing admin user found.');
    }

  } catch (error) {
    console.error('❌ Error deleting admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteAdminUser();