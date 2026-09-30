import 'dotenv/config';
import prisma from '../api/config/database';
import bcrypt from 'bcryptjs';
import { UserRole, AccountStatus } from '@prisma/client';

async function resetAdminUser() {
  try {
    console.log('🔄 Resetting admin user...');

    // Delete old admin users
    const oldAdmins = await prisma.user.findMany({
      where: {
        role: UserRole.ADMIN
      }
    });

    if (oldAdmins.length > 0) {
      console.log(`Found ${oldAdmins.length} existing admin users, deleting them...`);
      await prisma.user.deleteMany({
        where: {
          role: UserRole.ADMIN
        }
      });
      console.log('✅ Old admin users deleted');
    }

    // New admin user configuration
    const newAdminUser = {
      employeeCode: process.env.ADMIN_EMPLOYEE_CODE || 'ADMIN001',
      fullName: process.env.ADMIN_FULL_NAME || 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@labcore.local',
      password: process.env.ADMIN_PASSWORD || 'CHANGE_ME_IN_PRODUCTION',
      role: UserRole.ADMIN,
      phone: '',
      status: AccountStatus.ACTIVE,
      specialization: 'System Administration'
    };

    console.log('Creating new admin user...');
    console.log(`Email: ${newAdminUser.email}`);
    console.log(`Password: ${newAdminUser.password}`);

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
    console.log('\n🎉 Admin user created. Please check your environment variables for login credentials.');

  } catch (error) {
    console.error('❌ Error resetting admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminUser();