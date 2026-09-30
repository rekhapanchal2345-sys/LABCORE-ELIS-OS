require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function checkInvoices() {
  try {
    const patientCount = await prisma.patient.count();
    console.log('Total patients:', patientCount);
    
    const orderCount = await prisma.order.count();
    console.log('Total orders:', orderCount);
    
    const invoiceCount = await prisma.invoice.count();
    console.log('Total invoices:', invoiceCount);
    
    if (orderCount > 0) {
      const orders = await prisma.order.findMany({
        take: 3,
        include: {
          invoice: true,
          patient: true
        }
      });
      console.log('Sample orders with invoices and patients:', JSON.stringify(orders, null, 2));
    }
    
    if (invoiceCount > 0) {
      const invoices = await prisma.invoice.findMany({
        take: 3,
        include: {
          order: {
            include: {
              patient: true
            }
          }
        }
      });
      console.log('Sample invoices with patient data:', JSON.stringify(invoices, null, 2));
    } else {
      console.log('No invoices found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInvoices();