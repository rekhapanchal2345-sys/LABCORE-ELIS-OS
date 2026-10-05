const bcrypt = require('bcryptjs');

// Get the password from a command line argument or the environment.
// There is deliberately no fallback: a built-in default would be a published
// password, and echoing it below would write it into shell history and logs.
const password = process.argv[2] || process.env.ADMIN_PASSWORD;
const rounds = 12;

if (!password) {
  console.error('Usage: node generate-hash.js <your-password>');
  console.error('   or: set ADMIN_PASSWORD in backend/.env');
  process.exit(1);
}

bcrypt.hash(password, rounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('Rounds:', rounds);
  console.log('Hash:', hash);
  
  // Verify the hash
  bcrypt.compare(password, hash, (err, result) => {
    if (err) {
      console.error('Error verifying hash:', err);
      process.exit(1);
    }
    
    console.log('Verification:', result ? 'SUCCESS' : 'FAILED');
  });
});