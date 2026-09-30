require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function createSampleParameters() {
  try {
    console.log('🔍 Fetching existing tests...');
    
    const tests = await prisma.test.findMany({
      where: { isActive: true }
    });

    if (tests.length === 0) {
      console.log('❌ No active tests found. Please run create-sample-tests.js first.');
      return;
    }

    console.log(`✅ Found ${tests.length} active tests`);

    const parameterData = [
      {
        testCode: 'CBC',
        parameters: [
          { parameterName: 'Hemoglobin', shortName: 'Hb', unit: 'g/dL', dataType: 'NUMERIC', displayOrder: 1, isRequired: true },
          { parameterName: 'WBC Count', shortName: 'WBC', unit: 'x10^9/L', dataType: 'NUMERIC', displayOrder: 2, isRequired: true },
          { parameterName: 'RBC Count', shortName: 'RBC', unit: 'x10^12/L', dataType: 'NUMERIC', displayOrder: 3, isRequired: true },
          { parameterName: 'Platelet Count', shortName: 'Platelets', unit: 'x10^9/L', dataType: 'NUMERIC', displayOrder: 4, isRequired: true },
          { parameterName: 'Hematocrit', shortName: 'Hct', unit: '%', dataType: 'NUMERIC', displayOrder: 5, isRequired: true }
        ]
      },
      {
        testCode: 'RBS',
        parameters: [
          { parameterName: 'Blood Sugar', shortName: 'Glucose', unit: 'mg/dL', dataType: 'NUMERIC', displayOrder: 1, isRequired: true }
        ]
      },
      {
        testCode: 'HBA1C',
        parameters: [
          { parameterName: 'HbA1c', shortName: 'A1c', unit: '%', dataType: 'NUMERIC', displayOrder: 1, isRequired: true }
        ]
      },
      {
        testCode: 'LIPID',
        parameters: [
          { parameterName: 'Total Cholesterol', shortName: 'TC', unit: 'mg/dL', dataType: 'NUMERIC', displayOrder: 1, isRequired: true },
          { parameterName: 'HDL Cholesterol', shortName: 'HDL', unit: 'mg/dL', dataType: 'NUMERIC', displayOrder: 2, isRequired: true },
          { parameterName: 'LDL Cholesterol', shortName: 'LDL', unit: 'mg/dL', dataType: 'NUMERIC', displayOrder: 3, isRequired: true },
          { parameterName: 'Triglycerides', shortName: 'TG', unit: 'mg/dL', dataType: 'NUMERIC', displayOrder: 4, isRequired: true }
        ]
      },
      {
        testCode: 'TSH',
        parameters: [
          { parameterName: 'TSH', shortName: 'TSH', unit: 'mIU/L', dataType: 'NUMERIC', displayOrder: 1, isRequired: true }
        ]
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const testData of parameterData) {
      const test = tests.find(t => t.testCode === testData.testCode);
      
      if (!test) {
        console.log(`⏭️  Test not found: ${testData.testCode}`);
        continue;
      }

      for (const param of testData.parameters) {
        const existing = await prisma.testParameter.findFirst({
          where: {
            testId: test.id,
            parameterName: param.parameterName
          }
        });

        if (existing) {
          console.log(`⏭️  Parameter already exists: ${param.parameterName} for ${testData.testCode}`);
          skippedCount++;
        } else {
          const created = await prisma.testParameter.create({
            data: {
              testId: test.id,
              ...param
            }
          });
          console.log(`✅ Parameter created: ${created.parameterName} for ${testData.testCode}`);
          createdCount++;
        }
      }
    }

    console.log('========================================');
    console.log('📊 Summary:');
    console.log('========================================');
    console.log(`✅ Created: ${createdCount} parameters`);
    console.log(`⏭️  Skipped: ${skippedCount} parameters`);
    console.log(`📝 Total: ${createdCount + skippedCount} parameters`);
    console.log('========================================');

  } catch (error) {
    console.error('❌ Error creating sample parameters:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSampleParameters();
