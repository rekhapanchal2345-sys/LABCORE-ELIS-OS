const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
    return prisma.user.findFirst();
  })
  .then(user => {
    console.log('✅ Can query users:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Found user:', user.email);
    }
  })
  .catch(error => {
    console.error('❌ Database error:', error.message);
  })
  .finally(() => {
    prisma.$disconnect();
  });