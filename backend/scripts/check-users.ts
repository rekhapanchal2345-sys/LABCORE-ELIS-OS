import prisma from "../api/config/database";

async function checkUsers() {
  try {
    console.log("Checking users in database...");

    const userCount = await prisma.user.count();
    console.log(`Total users: ${userCount}`);

    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          employeeCode: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      console.log("\nUser details:");
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Employee Code: ${user.employeeCode}`);
        console.log(`   Created: ${user.createdAt.toISOString()}`);
        console.log("");
      });
    } else {
      console.log("No users found in database.");
    }

  } catch (error) {
    console.error("Error checking users:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers()
  .then(() => {
    console.log("User check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("User check failed:", error);
    process.exit(1);
  });
