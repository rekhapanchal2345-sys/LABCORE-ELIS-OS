import "dotenv/config";
import { PrismaClient, ParameterType, Gender } from '@prisma/client';
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

async function addCBC001Parameters() {
  try {
    console.log('Adding parameters to CBC001 test...');

    // Find CBC001 test
    const cbcTest = await prisma.test.findUnique({
      where: {
        testCode: 'CBC001'
      }
    });

    if (!cbcTest) {
      console.log('CBC001 test not found');
      return;
    }

    console.log('Found CBC001 test:', cbcTest.testName);

    // Standard CBC parameters
    const cbcParameters = [
      { parameterName: 'Hemoglobin', unit: 'g/dL', dataType: ParameterType.NUMERIC, referenceRanges: [{ gender: Gender.MALE, minAge: 18, maxAge: 120, normalLow: 13.5, normalHigh: 17.5 }, { gender: Gender.FEMALE, minAge: 18, maxAge: 120, normalLow: 12.0, normalHigh: 15.5 }], displayOrder: 1 },
      { parameterName: 'RBC Count', unit: 'million cells/µL', dataType: ParameterType.NUMERIC, referenceRanges: [{ gender: Gender.MALE, minAge: 18, maxAge: 120, normalLow: 4.5, normalHigh: 5.9 }, { gender: Gender.FEMALE, minAge: 18, maxAge: 120, normalLow: 4.0, normalHigh: 5.2 }], displayOrder: 2 },
      { parameterName: 'WBC Count', unit: 'cells/µL', dataType: ParameterType.NUMERIC, referenceRanges: [{ minAge: 0, maxAge: 120, normalLow: 4000, normalHigh: 11000 }], displayOrder: 3 },
      { parameterName: 'Platelet Count', unit: 'cells/µL', dataType: ParameterType.NUMERIC, referenceRanges: [{ minAge: 0, maxAge: 120, normalLow: 150000, normalHigh: 450000 }], displayOrder: 4 },
      { parameterName: 'Hematocrit', unit: '%', dataType: ParameterType.NUMERIC, referenceRanges: [{ gender: Gender.MALE, minAge: 18, maxAge: 120, normalLow: 41, normalHigh: 50 }, { gender: Gender.FEMALE, minAge: 18, maxAge: 120, normalLow: 36, normalHigh: 44 }], displayOrder: 5 },
      { parameterName: 'MCV', unit: 'fL', dataType: ParameterType.NUMERIC, referenceRanges: [{ minAge: 0, maxAge: 120, normalLow: 80, normalHigh: 100 }], displayOrder: 6 },
      { parameterName: 'MCH', unit: 'pg', dataType: ParameterType.NUMERIC, referenceRanges: [{ minAge: 0, maxAge: 120, normalLow: 27, normalHigh: 31 }], displayOrder: 7 },
      { parameterName: 'MCHC', unit: 'g/dL', dataType: ParameterType.NUMERIC, referenceRanges: [{ minAge: 0, maxAge: 120, normalLow: 32, normalHigh: 36 }], displayOrder: 8 },
      { parameterName: 'Neutrophils', unit: '%', dataType: ParameterType.NUMERIC, referenceRanges: [{ minAge: 0, maxAge: 120, normalLow: 40, normalHigh: 74 }], displayOrder: 9 },
      { parameterName: 'Lymphocytes', unit: '%', dataType: ParameterType.NUMERIC, referenceRanges: [{ minAge: 0, maxAge: 120, normalLow: 20, normalHigh: 44 }], displayOrder: 10 },
      { parameterName: 'Monocytes', unit: '%', dataType: ParameterType.NUMERIC, referenceRanges: [{ minAge: 0, maxAge: 120, normalLow: 2, normalHigh: 8 }], displayOrder: 11 },
      { parameterName: 'Eosinophils', unit: '%', dataType: ParameterType.NUMERIC, referenceRanges: [{ minAge: 0, maxAge: 120, normalLow: 0, normalHigh: 6 }], displayOrder: 12 },
      { parameterName: 'Basophils', unit: '%', dataType: ParameterType.NUMERIC, referenceRanges: [{ minAge: 0, maxAge: 120, normalLow: 0, normalHigh: 1 }], displayOrder: 13 },
    ];

    // Add parameters to CBC001 test
    for (const param of cbcParameters) {
      const existingParam = await prisma.testParameter.findFirst({
        where: {
          testId: cbcTest.id,
          parameterName: param.parameterName
        }
      });

      if (!existingParam) {
        const createdParam = await prisma.testParameter.create({
          data: {
            testId: cbcTest.id,
            parameterName: param.parameterName,
            unit: param.unit,
            dataType: param.dataType,
            displayOrder: param.displayOrder,
            referenceRanges: {
              create: param.referenceRanges
            }
          }
        });
        console.log(`✓ Created parameter: ${param.parameterName}`);
      } else {
        console.log(`- Parameter already exists: ${param.parameterName}`);
      }
    }

    console.log('\n✅ CBC001 parameters added successfully');

  } catch (error) {
    console.error('Error adding CBC001 parameters:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCBC001Parameters()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });