require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function testTestsQuery() {
  try {
    console.log('Testing basic test query...');
    
    // Test 1: Simple query without filters
    console.log('\n1. Testing simple query without filters:');
    const simpleTests = await prisma.test.findMany({
      take: 5,
      include: {
        category: true,
      },
    });
    console.log(`Found ${simpleTests.length} tests`);
    if (simpleTests.length > 0) {
      console.log('Sample test:', simpleTests[0]);
    }

    // Test 2: Query with category relation
    console.log('\n2. Testing query with category relation:');
    const testsWithCategory = await prisma.test.findMany({
      take: 5,
      where: {
        category: {
          isActive: true,
        },
      },
      include: {
        category: true,
      },
    });
    console.log(`Found ${testsWithCategory.length} tests with active categories`);

    // Test 3: Query with department filter (the problematic one)
    console.log('\n3. Testing query with department filter:');
    try {
      const testsWithDepartment = await prisma.test.findMany({
        take: 5,
        where: {
          category: {
            department: {
              contains: 'test',
              mode: 'insensitive',
            },
          },
        },
        include: {
          category: true,
        },
      });
      console.log(`Found ${testsWithDepartment.length} tests with department filter`);
    } catch (deptError) {
      console.error('Department filter error:', deptError.message);
    }

    // Test 4: Full query like the getTests function
    console.log('\n4. Testing full query like getTests function:');
    const where = {};
    
    try {
      const [tests, total] = await Promise.all([
        prisma.test.findMany({
          where,
          skip: 0,
          take: 20,
          include: {
            category: true,
            parameters: {
              where: {
                isActive: true,
              },
              include: {
                referenceRanges: {
                  where: {
                    isActive: true,
                  },
                },
              },
              orderBy: {
                displayOrder: 'asc',
              },
            },
          },
          orderBy: {
            displayOrder: 'asc',
            testName: 'asc',
          },
        }),
        prisma.test.count({
          where,
        }),
      ]);
      
      console.log(`Found ${tests.length} tests, total: ${total}`);
    } catch (fullQueryError) {
      console.error('Full query error:', fullQueryError.message);
      console.error('Error details:', fullQueryError);
    }

    // Test 5: Check if tables exist
    console.log('\n5. Checking table existence:');
    const testCount = await prisma.test.count();
    const categoryCount = await prisma.testCategory.count();
    const parameterCount = await prisma.testParameter.count();
    
    console.log(`Tests: ${testCount}`);
    console.log(`Categories: ${categoryCount}`);
    console.log(`Parameters: ${parameterCount}`);

  } catch (error) {
    console.error('Test error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
  } finally {
    await prisma.$disconnect();
  }
}

testTestsQuery();