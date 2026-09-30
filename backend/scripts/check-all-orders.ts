import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function checkAllOrders() {
  try {
    console.log('Checking all orders in the system...');

    // Find all orders
    const orders = await prisma.order.findMany({
      include: {
        patient: true,
        items: {
          include: {
            test: true,
            package: true
          }
        }
      }
    });

    console.log(`Total orders: ${orders.length}`);

    if (orders.length > 0) {
      console.log('Orders:', JSON.stringify(orders, null, 2));
    } else {
      console.log('No orders found in the system');
    }

    // Check all available tests
    const tests = await prisma.test.findMany({
      where: {
        isActive: true
      }
    });

    console.log(`\nTotal active tests: ${tests.length}`);
    console.log('Available tests:', tests.map(t => ({ code: t.testCode, name: t.testName })));

  } catch (error) {
    console.error('Error checking orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllOrders()
  .then(() => {
    console.log('Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });