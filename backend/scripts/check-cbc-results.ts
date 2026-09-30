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

async function checkCBCResults() {
  try {
    console.log('Checking CBC test and results...');

    // Find CBC test
    const cbcTests = await prisma.test.findMany({
      where: {
        testCode: 'CBC'
      },
      include: {
        parameters: true
      }
    });

    console.log(`Found ${cbcTests.length} CBC tests`);
    if (cbcTests.length > 0) {
      console.log('CBC Test details:', JSON.stringify(cbcTests[0], null, 2));
    }

    // Find all results
    const allResults = await prisma.result.findMany({
      include: {
        test: true,
        order: {
          include: {
            patient: true
          }
        }
      }
    });

    console.log(`Total results in database: ${allResults.length}`);

    // Filter for CBC results
    const cbcResults = allResults.filter(r => r.test.testCode === 'CBC');
    console.log(`CBC results found: ${cbcResults.length}`);

    if (cbcResults.length > 0) {
      console.log('CBC Results details:', JSON.stringify(cbcResults, null, 2));
    } else {
      console.log('No CBC results found. Checking orders with CBC tests...');

      // Find orders with CBC tests
      const orderItemsWithCBC = await prisma.orderItem.findMany({
        where: {
          test: {
            testCode: 'CBC'
          }
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
      }
    }

  } catch (error) {
    console.error('Error checking CBC results:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCBCResults()
  .then(() => {
    console.log('Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });