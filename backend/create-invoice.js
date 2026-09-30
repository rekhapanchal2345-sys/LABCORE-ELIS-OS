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

async function createInvoiceForExistingOrder() {
  try {
    // Get the existing order
    const order = await prisma.order.findFirst({
      where: {
        invoice: null
      },
      include: {
        items: true,
        patient: true
      }
    });

    if (!order) {
      console.log('No order found without invoice');
      return;
    }

    console.log('Found order:', order.orderNumber);
    console.log('Patient:', order.patient);

    // Calculate invoice data
    const subtotal = order.items.reduce((sum, item) => sum + Number(item.finalPrice), 0);
    const discount = Number(order.discount);
    const taxableAmount = subtotal - discount;
    const gstPercent = 18;
    const gstAmount = (taxableAmount * gstPercent) / 100;
    const grandTotal = taxableAmount + gstAmount;

    // Generate invoice number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const invoiceNumber = `INV-${timestamp}-${random}`;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        subtotal,
        discount,
        taxableAmount,
        gstPercent,
        cgstAmount: gstAmount / 2,
        sgstAmount: gstAmount / 2,
        igstAmount: 0,
        gstAmount,
        grandTotal,
        paymentStatus: 'PENDING',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: {
        order: {
          include: {
            patient: true
          }
        }
      }
    });

    console.log('Invoice created successfully:', invoice);
    console.log('Patient in invoice:', invoice.order.patient);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createInvoiceForExistingOrder();