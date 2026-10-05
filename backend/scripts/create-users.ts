import 'dotenv/config';
import prisma from '../api/config/database';
import { hashPassword } from '../api/src/utils/password';
import { assertStrongPassword } from '../api/src/utils/password-policy';

/**
 * Seed staff accounts.
 *
 * The password is never hardcoded: it is read from SEED_USER_PASSWORD and
 * must satisfy the same policy as a user-chosen password. Nothing is printed
 * to the console, so secrets never end up in CI logs or terminal history.
 */
async function createUsers() {
  try {
    const rawPassword = process.env.SEED_USER_PASSWORD;

    if (!rawPassword) {
      throw new Error(
        'SEED_USER_PASSWORD is not set. Add it to backend/.env before running this script.'
      );
    }

    assertStrongPassword(rawPassword);

    console.log("Starting user creation...");

    // Create Jayaashapurama user
    const userPassword = await hashPassword(rawPassword);
    const user = await prisma.user.create({
      data: {
        employeeCode: process.env.SEED_USER_EMPLOYEE_CODE || 'JAY001',
        fullName: process.env.SEED_USER_FULL_NAME || 'Jaya Ashapurama',
        email: (
          process.env.SEED_USER_EMAIL || 'jayaashapurama89@gmail.com'
        ).toLowerCase(),
        passwordHash: userPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        passwordChangedAt: new Date(),
      },
    });

    console.log('Created user:', {
      email: user.email,
      employeeCode: user.employeeCode,
      role: user.role,
    });

    console.log('✅ User creation completed successfully!');
    console.log(
      '\nSign-in email: ' + user.email + ' (password stays in SEED_USER_PASSWORD)'
    );

  } catch (error) {
    console.error("Error creating users:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createUsers()
  .then(() => {
    console.log("User creation process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("User creation process failed:", error);
    process.exit(1);
  });
