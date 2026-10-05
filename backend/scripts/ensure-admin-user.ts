import dotenv from "dotenv";
dotenv.config();

import prisma from "../api/config/database";
import { hashPassword } from "../api/src/utils/password";

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL || "nikilpanchal0@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "mns98754321";
  const employeeCode = process.env.ADMIN_EMPLOYEE_CODE || "ADMIN001";
  const fullName = process.env.ADMIN_FULL_NAME || "Nikil Panchal";

  console.log(`Ensuring Admin User Exists...`);
  console.log(`Email: ${email}`);
  console.log(`Employee Code: ${employeeCode}`);

  const passwordHash = await hashPassword(password);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { employeeCode }] },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        status: "ACTIVE",
        failedLoginCount: 0,
        lockedUntil: null,
        emailVerified: true,
      },
    });
    console.log(`✅ Updated existing admin user (${email}) with password and ACTIVE status.`);
  } else {
    const user = await prisma.user.create({
      data: {
        employeeCode,
        fullName,
        email,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
      },
    });
    console.log(`✅ Created new admin user (${user.email}).`);
  }

  await prisma.$disconnect();
}

ensureAdminUser().catch((err) => {
  console.error("Failed to ensure admin user:", err);
  process.exit(1);
});
