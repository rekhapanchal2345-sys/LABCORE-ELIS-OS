import 'dotenv/config';
import prisma from '../api/config/database';
import bcrypt from 'bcryptjs';
import { UserRole, AccountStatus } from '@prisma/client';

async function recreateAdminUser() {
  try {
    console.log('🔄 Deleting all existing users...');

    // Delete all users
    const deleteResult = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.count} existing users`);

    console.log('🔐 Creating new admin user...');

    // New admin user configuration using environment variables
    const newAdminUser = {
      employeeCode: process.env.ADMIN_EMPLOYEE_CODE || 'ADMIN001',
      fullName: process.env.ADMIN_FULL_NAME || 'Nikil Panchal',
      email: process.env.ADMIN_EMAIL || 'nikilpanchal0@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'mns98754321',
      role: UserRole.ADMIN,
      phone: '',
      status: AccountStatus.ACTIVE,
      specialization: 'System Administration'
    };

    console.log('Creating admin user with:');
    console.log(`Email: ${newAdminUser.email}`);
    console.log(`Password: [HIDDEN - Check your environment variables]`);

    // Hash password
    const passwordHash = await bcrypt.hash(newAdminUser.password, 12);

    // Create new admin user
    const user = await prisma.user.create({
      data: {
        employeeCode: newAdminUser.employeeCode,
        fullName: newAdminUser.fullName,
        email: newAdminUser.email,
        phone: newAdminUser.phone || null,
        passwordHash,
        role: newAdminUser.role as UserRole,
        status: newAdminUser.status as AccountStatus,
        specialization: newAdminUser.specialization
      },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    console.log('✅ New admin user created successfully!');
    console.log('User details:', user);
    console.log('\n🎉 Admin user created successfully!');
    console.log('Please use the credentials from your environment variables to login.');

  } catch (error) {
    console.error('❌ Error recreating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

recreateAdminUser();
