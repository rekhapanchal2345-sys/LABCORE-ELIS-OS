const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Generating Prisma client...');
  const prismaPath = path.join(__dirname, '../node_modules/.bin/prisma');
  execSync(`node ${prismaPath} generate`, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  process.exit(1);
}