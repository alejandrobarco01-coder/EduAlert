
import { addIntervention, getInterventionsForStudent } from './server/data/interventions.js';
import { readFile, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'server', 'data', 'studentInterventions.json');

async function testRelationalInterventions() {
  console.log('--- TEST: ESTRUCTURA RELACIONAL DE INTERVENCIONES ---');
  
  const studentId = 42;
  const tutorId = 7;
  const interventionData = { text: 'Sesión de prueba relacional', type: 'social', priority: 'high' };

  console.log(`\n1. Registrando intervención (Estudiante: ${studentId}, Tutor: ${tutorId})...`);
  const result = await addIntervention(studentId, tutorId, interventionData);
  
  console.log('Objeto retornado:', JSON.stringify(result, null, 2));

  // Verificación de campos
  const hasStudentId = result.studentId === studentId;
  const hasTutorId = result.tutorId === tutorId;
  console.log(`-> Posee studentId correcto: ${hasStudentId ? '✅' : '❌'}`);
  console.log(`-> Posee tutorId correcto: ${hasTutorId ? '✅' : '❌'}`);

  console.log('\n2. Verificando persistencia en disco...');
  const diskData = JSON.parse(await readFile(DB_PATH, 'utf-8'));
  const isArray = Array.isArray(diskData);
  console.log(`-> El archivo es un array: ${isArray ? '✅' : '❌'}`);
  
  const savedRecord = diskData.find(i => i.id === result.id);
  console.log(`-> Registro encontrado en disco: ${savedRecord ? '✅' : '❌'}`);
  if (savedRecord) {
    console.log(`   Relaciones en disco: S:${savedRecord.studentId}, T:${savedRecord.tutorId}`);
  }

  console.log('\n3. Verificando recuperación filtrada...');
  const studentInterventions = getInterventionsForStudent(studentId);
  const found = studentInterventions.some(i => i.id === result.id);
  console.log(`-> Recuperado correctamente para estudiante ${studentId}: ${found ? '✅' : '❌'}`);

  const otherStudentInterventions = getInterventionsForStudent(999);
  console.log(`-> No recuperado para estudiante ajeno: ${otherStudentInterventions.length === 0 ? '✅' : '❌'}`);

  console.log('\n--- FIN DEL TEST ---');
  
  // Cleanup for test clean state (optional, keeping it for evidence)
}

testRelationalInterventions().catch(err => {
  console.error('Error en el test:', err);
  process.exit(1);
});
