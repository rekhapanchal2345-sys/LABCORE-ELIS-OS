require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString, pool: new pg.Pool({ connectionString }) });
const prisma = new PrismaClient({ adapter });

async function testTables() {
  try {
    console.log('Testing database tables...');
    
    // Test approvals table
    try {
      const approvals = await prisma.approval.findMany();
      console.log('✅ Approvals count:', approvals.length);
    } catch (error) {
      console.error('❌ Approvals error:', error.message);
    }
    
    // Test results table
    try {
      const results = await prisma.result.findMany();
      console.log('✅ Results count:', results.length);
    } catch (error) {
      console.error('❌ Results error:', error.message);
    }
    
    // Test orders table
    try {
      const orders = await prisma.order.findMany();
      console.log('✅ Orders count:', orders.length);
    } catch (error) {
      console.error('❌ Orders error:', error.message);
    }
    
    // Test tests table
    try {
      const tests = await prisma.test.findMany();
      console.log('✅ Tests count:', tests.length);
    } catch (error) {
      console.error('❌ Tests error:', error.message);
    }
    
    // Test samples table
    try {
      const samples = await prisma.sample.findMany();
      console.log('✅ Samples count:', samples.length);
    } catch (error) {
      console.error('❌ Samples error:', error.message);
    }
    
  } catch (error) {
    console.error('Database connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTables();