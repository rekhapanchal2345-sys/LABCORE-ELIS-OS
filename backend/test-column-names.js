require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString, pool: new pg.Pool({ connectionString }) });
const prisma = new PrismaClient({ adapter });

async function testColumnNames() {
  try {
    console.log('Testing column names in orders table...');
    
    // Test raw query to check actual column names
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'orders'
        ORDER BY ordinal_position
      `;
      console.log('✅ Orders table columns:', columns);
    } catch (error) {
      console.error('❌ Column names error:', error.message);
    }
    
    // Try with camelCase
    try {
      const dailyOrders = await prisma.$queryRaw`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as count
        FROM orders
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
        LIMIT 30
      `;
      console.log('✅ Raw SQL query with camelCase works:', dailyOrders);
    } catch (error) {
      console.error('❌ Raw SQL query with camelCase error:', error.message);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testColumnNames();