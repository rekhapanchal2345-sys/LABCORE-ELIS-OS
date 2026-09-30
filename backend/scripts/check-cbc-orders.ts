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

async function checkCBCOrders() {
  try {
    console.log('Checking orders with CBC test...');

    // Find CBC test
    const cbcTest = await prisma.test.findUnique({
      where: {
        testCode: 'CBC'
      }
    });

    if (!cbcTest) {
      console.log('CBC test not found');
      return;
    }

    console.log('Found CBC test:', cbcTest.testName, 'ID:', cbcTest.id);

    // Find orders with CBC test
    const orderItemsWithCBC = await prisma.orderItem.findMany({
      where: {
        testId: cbcTest.id
      },
      include: {
        test: true,
        order: {
          include: {
            patient: true
          }
        }
      }
    });

    console.log(`Order items with CBC test: ${orderItemsWithCBC.length}`);

    if (orderItemsWithCBC.length > 0) {
      console.log('CBC Order items:', JSON.stringify(orderItemsWithCBC, null, 2));

      // Check if there are samples for these orders
      for (const item of orderItemsWithCBC) {
        const samples = await prisma.sample.findMany({
          where: {
            orderId: item.orderId,
            testId: cbcTest.id
          },
          include: {
            order: {
              include: {
                patient: true
              }
            }
          }
        });

        console.log(`Samples for order ${item.order.orderNumber}:`, samples.length);
        if (samples.length > 0) {
          console.log('Sample details:', JSON.stringify(samples, null, 2));
        }
      }
    } else {
      console.log('No orders found with CBC test');
    }

  } catch (error) {
    console.error('Error checking CBC orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCBCOrders()
  .then(() => {
    console.log('Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });