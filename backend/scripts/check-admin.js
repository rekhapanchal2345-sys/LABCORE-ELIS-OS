require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function checkAndCreateAdmin() {
  try {
    console.log('Checking for admin users...');
    
    // Check if any users exist
    const users = await prisma.user.findMany();
    console.log(`Total users in database: ${users.length}`);
    
    if (users.length > 0) {
      console.log('Existing users:');
      users.forEach(user => {
        console.log(`- ${user.email} (${user.employeeCode}) - Role: ${user.role} - Status: ${user.status}`);
      });
    }
    
    // Check for specific admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@labcore.local';
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (adminUser) {
      console.log('\n✅ Admin user exists:', adminUser.email);
      
      // Test password verification
      const testPassword = process.env.ADMIN_PASSWORD || 'CHANGE_ME_IN_PRODUCTION';
      const isValid = await bcrypt.compare(testPassword, adminUser.passwordHash);
      console.log('Password verification check completed:', isValid ? '✅ Valid' : '❌ Invalid');
      
    } else {
      console.log('\n❌ Admin user does not exist. Updating existing user...');
      
      // Update the existing ADMIN001 user to have their actual email
      const existingAdmin = await prisma.user.findUnique({
        where: { employeeCode: 'ADMIN001' }
      });
      
      if (existingAdmin) {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@labcore.local';
        const adminPassword = process.env.ADMIN_PASSWORD || 'CHANGE_ME_IN_PRODUCTION';
        const adminFullName = process.env.ADMIN_FULL_NAME || 'System Administrator';
        const passwordHash = await bcrypt.hash(adminPassword, 12);
        
        const updatedAdmin = await prisma.user.update({
          where: { employeeCode: 'ADMIN001' },
          data: {
            email: adminEmail,
            passwordHash,
            fullName: adminFullName,
            role: 'ADMIN',
            status: 'ACTIVE',
            specialization: 'System Administration'
          }
        });
        
        console.log('✅ Admin user updated successfully!');
        console.log('Please check your environment variables for login credentials.');
      } else {
        // Create new admin with different employee code
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@labcore.local';
        const adminPassword = process.env.ADMIN_PASSWORD || 'CHANGE_ME_IN_PRODUCTION';
        const adminFullName = process.env.ADMIN_FULL_NAME || 'System Administrator';
        const passwordHash = await bcrypt.hash(adminPassword, 12);
        
        const newAdmin = await prisma.user.create({
          data: {
            employeeCode: 'ADMIN002',
            fullName: adminFullName,
            email: adminEmail,
            passwordHash,
            role: 'ADMIN',
            status: 'ACTIVE',
            specialization: 'System Administration'
          }
        });
        
        console.log('✅ Admin user created successfully!');
        console.log('Please check your environment variables for login credentials.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdmin();