import prisma from "../api/config/database";

async function checkAllData() {
  try {
    console.log("Checking all data in database...\n");

    const users = await prisma.user.count();
    const patients = await prisma.patient.count();
    const doctors = await prisma.doctor.count();
    const tests = await prisma.test.count();
    const orders = await prisma.order.count();
    const samples = await prisma.sample.count();
    const results = await prisma.result.count();
    const invoices = await prisma.invoice.count();
    const payments = await prisma.payment.count();

    console.log("📊 Database Data Summary:");
    console.log("================================");
    console.log(`Users:      ${users}`);
    console.log(`Patients:   ${patients}`);
    console.log(`Doctors:    ${doctors}`);
    console.log(`Tests:      ${tests}`);
    console.log(`Orders:     ${orders}`);
    console.log(`Samples:    ${samples}`);
    console.log(`Results:    ${results}`);
    console.log(`Invoices:   ${invoices}`);
    console.log(`Payments:   ${payments}`);
    console.log("================================");

    if (users === 1 && patients === 0 && doctors === 0 && tests === 0 && orders === 0 && samples === 0 && results === 0) {
      console.log("\n✅ Database is completely fresh - only your user account exists");
    } else {
      console.log("\n⚠️  Database still has some data");
    }

  } catch (error) {
    console.error("Error checking data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData()
  .then(() => {
    console.log("\nData check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Data check failed:", error);
    process.exit(1);
  });
