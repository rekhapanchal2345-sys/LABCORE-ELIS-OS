import prisma from "../api/config/database";
import { hashPassword } from "../api/src/utils/password";

async function createUsers() {
  try {
    console.log("Starting user creation...");

    // Create Jayaashapurama user
    const userPassword = await hashPassword("nikil1234");
    const user = await prisma.user.create({
      data: {
        employeeCode: "JAY001",
        fullName: "Jaya Ashapurama",
        email: "jayaashapurama89@gmail.com",
        passwordHash: userPassword,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        passwordChangedAt: new Date(),
      },
    });

    console.log("Created user:", {
      email: user.email,
      employeeCode: user.employeeCode,
      role: user.role,
    });

    console.log("✅ User creation completed successfully!");
    console.log("\nLogin credentials:");
    console.log("Email: jayaashapurama89@gmail.com");
    console.log("Password: nikil1234");

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
