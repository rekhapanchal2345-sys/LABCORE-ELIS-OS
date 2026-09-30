import prisma from "../api/config/database";

async function deleteUser() {
  try {
    console.log("Deleting user account...");

    // Delete the user with email jayaashapurama89@gmail.com
    const deletedUser = await prisma.user.deleteMany({
      where: {
        email: "jayaashapurama89@gmail.com"
      }
    });

    console.log(`Deleted ${deletedUser.count} user(s)`);

    if (deletedUser.count > 0) {
      console.log("✅ User account deleted successfully");
    } else {
      console.log("❌ User not found");
    }

  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser()
  .then(() => {
    console.log("User deletion completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("User deletion failed:", error);
    process.exit(1);
  });
