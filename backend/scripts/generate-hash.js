const bcrypt = require('bcryptjs');

// Get password from command line argument or environment variable
const password = process.argv[2] || process.env.ADMIN_PASSWORD || 'CHANGE_ME_IN_PRODUCTION';
const rounds = 12;

bcrypt.hash(password, rounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('Password:', password);
  console.log('Rounds:', rounds);
  console.log('Hash:', hash);
  console.log('\nUsage: node generate-hash.js <your-password>');
  console.log('Or set ADMIN_PASSWORD environment variable');
  
  // Verify the hash
  bcrypt.compare(password, hash, (err, result) => {
    if (err) {
      console.error('Error verifying hash:', err);
      process.exit(1);
    }
    
    console.log('Verification:', result ? 'SUCCESS' : 'FAILED');
  });
});