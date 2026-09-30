// Node 24+ has native fetch

async function testLogin() {
  try {
    // First login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@labcore.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('Login failed. Trying to find admin user...');
      return null;
    }

    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData.success);
    
    if (loginData.success && loginData.data && loginData.data.token) {
      return loginData.data.token;
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
}

async function testPatientsApi() {
  try {
    const token = await testLogin();
    
    if (!token) {
      console.log('Could not get auth token. Testing without auth...');
    }

    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://localhost:5000/api/patients?page=1&limit=10', {
      method: 'GET',
      headers
    });

    const data = await response.json();
    console.log('API Response Status:', response.status);
    console.log('API Response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('API test error:', error.message);
  }
}

testPatientsApi();