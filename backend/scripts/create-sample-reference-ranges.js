require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function createSampleReferenceRanges() {
  try {
    console.log('🔍 Fetching existing parameters...');
    
    const parameters = await prisma.testParameter.findMany({
      where: { isActive: true },
      include: { test: true }
    });

    if (parameters.length === 0) {
      console.log('❌ No active parameters found. Please run create-sample-parameters.js first.');
      return;
    }

    console.log(`✅ Found ${parameters.length} active parameters`);

    const referenceRangeData = [
      {
        parameterName: 'Hemoglobin',
        ranges: [
          { gender: 'MALE', minAge: 18, maxAge: 60, normalLow: 13.5, normalHigh: 17.5, criticalLow: 10.0, criticalHigh: 18.5, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' },
          { gender: 'FEMALE', minAge: 18, maxAge: 60, normalLow: 12.0, normalHigh: 15.5, criticalLow: 9.0, criticalHigh: 16.5, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' }
        ]
      },
      {
        parameterName: 'WBC Count',
        ranges: [
          { gender: 'OTHER', minAge: 0, maxAge: 100, normalLow: 4.0, normalHigh: 11.0, criticalLow: 2.0, criticalHigh: 15.0, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' }
        ]
      },
      {
        parameterName: 'RBC Count',
        ranges: [
          { gender: 'MALE', minAge: 18, maxAge: 60, normalLow: 4.5, normalHigh: 5.9, criticalLow: 3.5, criticalHigh: 6.5, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' },
          { gender: 'FEMALE', minAge: 18, maxAge: 60, normalLow: 4.0, normalHigh: 5.4, criticalLow: 3.0, criticalHigh: 6.0, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' }
        ]
      },
      {
        parameterName: 'Platelet Count',
        ranges: [
          { gender: 'OTHER', minAge: 0, maxAge: 100, normalLow: 150, normalHigh: 450, criticalLow: 50, criticalHigh: 600, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' }
        ]
      },
      {
        parameterName: 'Hematocrit',
        ranges: [
          { gender: 'MALE', minAge: 18, maxAge: 60, normalLow: 40, normalHigh: 52, criticalLow: 30, criticalHigh: 55, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' },
          { gender: 'FEMALE', minAge: 18, maxAge: 60, normalLow: 36, normalHigh: 48, criticalLow: 28, criticalHigh: 50, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' }
        ]
      },
      {
        parameterName: 'Blood Sugar',
        ranges: [
          { gender: 'OTHER', minAge: 0, maxAge: 100, normalLow: 70, normalHigh: 100, criticalLow: 40, criticalHigh: 180, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' }
        ]
      },
      {
        parameterName: 'HbA1c',
        ranges: [
          { gender: 'OTHER', minAge: 0, maxAge: 100, normalLow: 4.0, normalHigh: 5.7, criticalLow: 3.0, criticalHigh: 6.5, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' }
        ]
      },
      {
        parameterName: 'Total Cholesterol',
        ranges: [
          { gender: 'OTHER', minAge: 0, maxAge: 100, normalLow: 150, normalHigh: 200, criticalLow: 100, criticalHigh: 240, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' }
        ]
      },
      {
        parameterName: 'HDL Cholesterol',
        ranges: [
          { gender: 'MALE', minAge: 18, maxAge: 60, normalLow: 40, normalHigh: 60, criticalLow: 30, criticalHigh: 80, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' },
          { gender: 'FEMALE', minAge: 18, maxAge: 60, normalLow: 50, normalHigh: 70, criticalLow: 40, criticalHigh: 90, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' }
        ]
      },
      {
        parameterName: 'LDL Cholesterol',
        ranges: [
          { gender: 'OTHER', minAge: 0, maxAge: 100, normalLow: 0, normalHigh: 100, criticalLow: 0, criticalHigh: 130, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' }
        ]
      },
      {
        parameterName: 'Triglycerides',
        ranges: [
          { gender: 'OTHER', minAge: 0, maxAge: 100, normalLow: 50, normalHigh: 150, criticalLow: 30, criticalHigh: 200, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' }
        ]
      },
      {
        parameterName: 'TSH',
        ranges: [
          { gender: 'OTHER', minAge: 0, maxAge: 100, normalLow: 0.4, normalHigh: 4.0, criticalLow: 0.1, criticalHigh: 10.0, minAgeUnit: 'YEARS', maxAgeUnit: 'YEARS' }
        ]
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const paramData of referenceRangeData) {
      const parameter = parameters.find(p => p.parameterName === paramData.parameterName);
      
      if (!parameter) {
        console.log(`⏭️  Parameter not found: ${paramData.parameterName}`);
        continue;
      }

      for (const range of paramData.ranges) {
        const existing = await prisma.referenceRange.findFirst({
          where: {
            parameterId: parameter.id,
            gender: range.gender,
            minAge: range.minAge,
            maxAge: range.maxAge
          }
        });

        if (existing) {
          console.log(`⏭️  Reference range already exists: ${paramData.parameterName} for ${range.gender}`);
          skippedCount++;
        } else {
          const created = await prisma.referenceRange.create({
            data: {
              parameterId: parameter.id,
              ...range
            }
          });
          console.log(`✅ Reference range created: ${paramData.parameterName} for ${range.gender}`);
          createdCount++;
        }
      }
    }

    console.log('========================================');
    console.log('📊 Summary:');
    console.log('========================================');
    console.log(`✅ Created: ${createdCount} reference ranges`);
    console.log(`⏭️  Skipped: ${skippedCount} reference ranges`);
    console.log(`📝 Total: ${createdCount + skippedCount} reference ranges`);
    console.log('========================================');

  } catch (error) {
    console.error('❌ Error creating sample reference ranges:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSampleReferenceRanges();