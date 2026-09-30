const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString, pool: new pg.Pool({ connectionString }) });
const prisma = new PrismaClient({ adapter });

async function testPatients() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Test patient count
    const patientCount = await prisma.patient.count();
    console.log('Patient count:', patientCount);
    
    // Test fetching patients
    const patients = await prisma.patient.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('Sample patients:', JSON.stringify(patients, null, 2));
    
    await prisma.$disconnect();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Database connection error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testPatients();