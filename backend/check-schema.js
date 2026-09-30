const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });

async function checkSchema() {
  try {
    const client = await pool.connect();
    
    // Check patients table structure
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'patients' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Current patients table structure:');
    console.table(result.rows);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error checking schema:', error);
    await pool.end();
    process.exit(1);
  }
}

checkSchema();