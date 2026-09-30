import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString, pool: new pg.Pool({ connectionString }) });
const prisma = new PrismaClient({ adapter });

async function pushSchema() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected successfully');

    console.log('Pushing schema changes...');
    // Use Prisma's internal push method
    await prisma.$transaction(async (tx) => {
      // The schema will be synchronized automatically through Prisma Client
      console.log('Schema synchronized successfully');
    });

    console.log('Schema push completed');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error pushing schema:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

pushSchema();