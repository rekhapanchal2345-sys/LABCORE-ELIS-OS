require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString, pool: new pg.Pool({ connectionString }) });
const prisma = new PrismaClient({ adapter });

async function testOrderAnalytics() {
  try {
    console.log('Testing order analytics query...');
    
    // First test if orders table exists
    try {
      const orders = await prisma.order.findMany();
      console.log('✅ Orders table exists, count:', orders.length);
    } catch (error) {
      console.error('❌ Orders table error:', error.message);
    }
    
    // Test the groupBy query
    try {
      const ordersByStatus = await prisma.order.groupBy({
        by: ['orderStatus'],
        _count: true,
      });
      console.log('✅ Group by status works:', ordersByStatus);
    } catch (error) {
      console.error('❌ Group by status error:', error.message);
    }
    
    // Test the raw SQL query
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyOrders = await prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM orders
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `;
      console.log('✅ Raw SQL query works:', dailyOrders);
    } catch (error) {
      console.error('❌ Raw SQL query error:', error.message);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderAnalytics();