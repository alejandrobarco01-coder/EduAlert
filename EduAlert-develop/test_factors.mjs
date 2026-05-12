import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'edualert-secret-key-2024';

const token = jwt.sign(
  { id: 1, email: 'admin@uceva.edu.co', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '1d' }
);

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

async function test() {
  console.log('\n--- 1. Asignar factores [1, 3] al estudiante 2 ---');
  let res = await fetch('http://127.0.0.1:3001/api/students/2/factors', {
    method: 'POST',
    headers,
    body: JSON.stringify({ factorIds: [1, 3] })
  });
  console.log(await res.json());

  console.log('\n--- 2. Consultar factores del estudiante 2 ---');
  res = await fetch('http://127.0.0.1:3001/api/students/2/factors', {
    headers
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));

  console.log('\n--- 3. Intentar asignar factores duplicados [1, 1, 3, 2] ---');
  res = await fetch('http://127.0.0.1:3001/api/students/2/factors', {
    method: 'POST',
    headers,
    body: JSON.stringify({ factorIds: [1, 1, 3, 2] })
  });
  console.log(await res.json());

  console.log('\n--- 4. Consultar de nuevo para verificar no-duplicidad ---');
  res = await fetch('http://127.0.0.1:3001/api/students/2/factors', {
    headers
  });
  const finalData = await res.json();
  console.log(JSON.stringify(finalData, null, 2));
}

test();
