import { execSync } from 'child_process';
import path from 'path';

try {
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error);
  process.exit(1);
}