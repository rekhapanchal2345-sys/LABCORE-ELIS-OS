require('dotenv').config();

async function testLogin() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      // No defaults: a fallback password would be published in this repo.
      throw new Error(
        'ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env first.'
      );
    }

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ Login successful!');
      console.log('User:', data.data.user);
      console.log('Token:', data.data.token.substring(0, 20) + '...');
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();