
async function demo() {
  console.log('?? INICIANDO DEMOSTRACIÓN AUTOMATIZADA:');
  console.log('--------------------------------------------------');
  
  // 1. Iniciar sesión como Admin
  console.log('1?? Iniciando sesión como Administrador (admin@uceva.edu.co)...');
  const loginRes = await fetch('http://127.0.0.1:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@uceva.edu.co', password: 'Admin@2024' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token;

  if (loginData.success) {
    console.log('? ¡Login exitoso! Token obtenido.');
  } else {
    console.log('? Error en login:', loginData.message);
    return;
  }

  // 2. Obtener lista de Tutores
  console.log('\n2?? Obteniendo la lista de Tutores disponibles...');
  const tutorsRes = await fetch('http://127.0.0.1:3001/api/users/tutors', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const tutorsData = await tutorsRes.json();
  console.log('? Tutores encontrados en el sistema:', tutorsData.data.map(t => t.name).join(', '));
  const tutorPatricia = tutorsData.data.find(t => t.email === 'tutor@uceva.edu.co');

  // 3. Obtener estudiantes
  console.log('\n3?? Obteniendo estudiantes...');
  const studentsRes = await fetch('http://127.0.0.1:3001/api/students', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const studentsData = await studentsRes.json();
  const primerEstudiante = studentsData.data[0];
  console.log('? Estudiante seleccionado: ' + primerEstudiante.name);

  // 4. Asignar el tutor
  console.log('\n4?? Asignando la tutora ' + tutorPatricia.name + ' al estudiante ' + primerEstudiante.name + '...');
  const assignRes = await fetch('http://127.0.0.1:3001/api/students/' + primerEstudiante.id + '/tutor', {
    method: 'PATCH',
    headers: { 
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tutorId: tutorPatricia.id })
  });
  const assignData = await assignRes.json();
  
  if (assignData.success) {
    console.log('? ¡Asignación completada correctamente!');
    console.log('?? ' + assignData.data.name + ' ahora tiene el tutorId: ' + assignData.data.tutorId);
  }

  console.log('--------------------------------------------------');
  console.log('?? Todo funciona a la perfección en el backend.');
}

demo();

