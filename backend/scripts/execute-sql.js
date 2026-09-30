const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const fs = require('fs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString, pool: new pg.Pool({ connectionString }) });
const prisma = new PrismaClient({ adapter });

async function executeSQL() {
  try {
    await prisma.$connect();
    console.log('Connected to database');

    const sql = fs.readFileSync('./scripts/add-communication-tables.sql', 'utf8');
    console.log('Executing SQL script...');
    
    await prisma.$executeRawUnsafe(sql);
    console.log('SQL executed successfully');
    
    await prisma.$disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error('Error executing SQL:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

executeSQL();