import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: 1, role: 'admin' }, 'edualert-secret-key-2024', { expiresIn: '1h' });

async function testEndpoint() {
  console.log('Testing /api/ai/recommendations without valid OPENAI_API_KEY...');
  
  const res = await fetch('http://127.0.0.1:3001/api/ai/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ studentId: 1 })
  });
  
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', data);
  
  console.log('\nTesting with non-existent student...');
  const res2 = await fetch('http://127.0.0.1:3001/api/ai/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ studentId: 9999 })
  });
  
  const data2 = await res2.json();
  console.log('Status:', res2.status);
  console.log('Response:', data2);
}

testEndpoint().catch(console.error);
