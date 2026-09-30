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

async function createMissingResults() {
  try {
    console.log('Starting to create missing result records...');

    // Find all completed samples without corresponding results
    const completedSamples = await prisma.sample.findMany({
      where: { 
        status: "COMPLETED" 
      },
      include: { 
        order: { 
          include: { 
            items: true 
          } 
        },
        test: { 
          include: { 
            parameters: {
              orderBy: {
                displayOrder: 'asc',
              },
            } 
          } 
        } 
      }
    });

    console.log(`Found ${completedSamples.length} completed samples`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const sample of completedSamples) {
      // Check if result already exists for this order-test combination
      const existingResult = await prisma.result.findUnique({
        where: {
          orderId_testId: {
            orderId: sample.orderId,
            testId: sample.testId,
          },
        },
      });

      if (existingResult) {
        console.log(`Skipping sample ${sample.sampleNumber} - result already exists`);
        skippedCount++;
        continue;
      }

      // Check if test has parameters
      if (!sample.test.parameters || sample.test.parameters.length === 0) {
        console.log(`Skipping sample ${sample.sampleNumber} - test has no parameters`);
        skippedCount++;
        continue;
      }

      // Create result with empty values
      const result = await prisma.result.create({
        data: {
          orderId: sample.orderId,
          testId: sample.testId,
          status: "PENDING",
          enteredAt: new Date(),
          values: {
            create: sample.test.parameters.map(param => ({
              parameterId: param.id,
              value: "", // Empty value to be filled later
              flag: "NORMAL",
            })),
          },
        },
      });

      console.log(`✓ Created result for sample ${sample.sampleNumber} (Result ID: ${result.id})`);
      createdCount++;
    }

    console.log('\n=== Summary ===');
    console.log(`Total completed samples: ${completedSamples.length}`);
    console.log(`Results created: ${createdCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);
    console.log('\n✅ Script completed successfully');

  } catch (error) {
    console.error('❌ Error creating missing results:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createMissingResults()
  .then(() => {
    console.log('Script execution completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });