require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function createSampleTests() {
  try {
    console.log('🔍 Checking for existing test categories...');
    
    // Create test category if not exists
    let category = await prisma.testCategory.findFirst({
      where: { code: 'HEMATOLOGY' }
    });

    if (!category) {
      console.log('📝 Creating Hematology category...');
      category = await prisma.testCategory.create({
        data: {
          code: 'HEMATOLOGY',
          name: 'Hematology',
          description: 'Blood tests and blood-related examinations',
          isActive: true
        }
      });
      console.log('✅ Category created:', category.name);
    } else {
      console.log('ℹ️ Category already exists:', category.name);
    }

    console.log('🔍 Checking for existing tests...');
    
    // Sample tests data
    const sampleTests = [
      {
        testCode: 'CBC',
        testName: 'Complete Blood Count',
        categoryId: category.id,
        sampleType: 'BLOOD',
        sampleContainer: 'EDTA Purple',
        sampleVolume: '3ml',
        processingDepartment: 'Hematology',
        method: 'Automated Analyzer',
        price: 350.00,
        gstPercentage: 18,
        tatHours: 24,
        tatDisplay: '24 hours',
        displayOrder: 1,
        isActive: true
      },
      {
        testCode: 'RBS',
        testName: 'Random Blood Sugar',
        categoryId: category.id,
        sampleType: 'BLOOD',
        sampleContainer: 'Fluoride Oxalate',
        sampleVolume: '2ml',
        processingDepartment: 'Biochemistry',
        method: 'Enzymatic Method',
        price: 80.00,
        gstPercentage: 18,
        tatHours: 2,
        tatDisplay: '2 hours',
        displayOrder: 2,
        isActive: true
      },
      {
        testCode: 'HBA1C',
        testName: 'Hemoglobin A1C',
        categoryId: category.id,
        sampleType: 'BLOOD',
        sampleContainer: 'EDTA Purple',
        sampleVolume: '3ml',
        processingDepartment: 'Biochemistry',
        method: 'HPLC',
        price: 450.00,
        gstPercentage: 18,
        tatHours: 24,
        tatDisplay: '24 hours',
        displayOrder: 3,
        isActive: true
      },
      {
        testCode: 'LIPID',
        testName: 'Lipid Profile',
        categoryId: category.id,
        sampleType: 'SERUM',
        sampleContainer: 'SST Red',
        sampleVolume: '5ml',
        processingDepartment: 'Biochemistry',
        method: 'Chemical Analyzer',
        price: 600.00,
        gstPercentage: 18,
        tatHours: 24,
        tatDisplay: '24 hours',
        displayOrder: 4,
        isActive: true
      },
      {
        testCode: 'TSH',
        testName: 'Thyroid Stimulating Hormone',
        categoryId: category.id,
        sampleType: 'SERUM',
        sampleContainer: 'SST Red',
        sampleVolume: '3ml',
        processingDepartment: 'Biochemistry',
        method: 'Chemiluminescence',
        price: 350.00,
        gstPercentage: 18,
        tatHours: 24,
        tatDisplay: '24 hours',
        displayOrder: 5,
        isActive: true
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const test of sampleTests) {
      const existing = await prisma.test.findUnique({
        where: { testCode: test.testCode }
      });

      if (existing) {
        console.log(`⏭️  Test already exists: ${test.testCode} - ${test.testName}`);
        skippedCount++;
      } else {
        const created = await prisma.test.create({
          data: test
        });
        console.log(`✅ Test created: ${created.testCode} - ${created.testName} (₹${created.price})`);
        createdCount++;
      }
    }

    console.log('========================================');
    console.log('📊 Summary:');
    console.log('========================================');
    console.log(`✅ Created: ${createdCount} tests`);
    console.log(`⏭️  Skipped: ${skippedCount} tests`);
    console.log(`📝 Total: ${createdCount + skippedCount} tests`);
    console.log('========================================');

  } catch (error) {
    console.error('❌ Error creating sample tests:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSampleTests();