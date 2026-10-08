import 'dotenv/config';
import prisma from '../api/config/database';
import bcrypt from 'bcryptjs';

async function resetAdminPassword() {
  try {
    const newPassword = process.env.NEW_ADMIN_PASSWORD || 'default_secure_pwd';
    const email = process.env.ADMIN_EMAIL || 'admin@labcore.local';

    console.log('🔐 Resetting admin password...');
    console.log(`Email: ${email}`);
    console.log(`New password: ${newPassword}`);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Admin user not found!');
      console.log('Please run create-admin.ts script first to create the admin user.');
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    console.log('✅ Admin password reset successfully!');
    console.log('========================================');
    console.log('Login Credentials:');
    console.log('========================================');
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
    console.log('========================================');

  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
