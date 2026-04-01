
import { calculateRiskIndex, getRiskLevel } from './server/data/students.js';
import { setFactorsForStudent } from './server/data/studentFactors.js';
import { addIntervention } from './server/data/interventions.js';
import { CRITICAL_RISK_THRESHOLD } from './server/logic/rules.js';

async function runTests() {
  console.log('--- VALIDACIÓN DE CÁLCULO DE RIESGO - EduAlert ---');
  console.log(`Umbral Crítico: ${CRITICAL_RISK_THRESHOLD}%`);
  console.log('--------------------------------------------------\n');

  const testStudentId = 999;
  
  // ESCENARIO 1: Riesgo Mínimo
  // GPA: 5.0, Inasistencias: 0, Factores: 0
  const scenario1 = {
    id: testStudentId,
    name: 'Estudiante Test (Riesgo Bajo)',
    gpa: 5.0,
    absences: 0,
    alerts: []
  };
  
  // Limpiar posibles datos previos del testId
  await setFactorsForStudent(testStudentId, []);
  
  const risk1 = calculateRiskIndex(scenario1);
  const level1 = getRiskLevel(risk1);
  
  console.log('ESCENARIO 1: Riesgo Mínimo');
  console.log(`-> GPA: 5.0, Inasistencias: 0, Factores: 0`);
  console.log(`-> Resultado: ${risk1}%, Nivel: ${level1}`);
  console.log(`-> Validación: ${risk1 === 0 ? '✅ PASÓ' : '❌ FALLÓ'}\n`);

  // ESCENARIO 2: Riesgo Crítico Escalado
  // GPA: 1.0, Inasistencias: 25 (max), Factores: Varios (alto peso)
  await setFactorsForStudent(testStudentId, [1, 2, 3, 1774657452866]); // Bajo rendimiento(5), Inasistencias(3), Financieros(4), Depresion(5) = 17 sum weight
  
  const scenario2 = {
    id: testStudentId,
    name: 'Estudiante Test (Riesgo Crítico)',
    gpa: 1.0,
    absences: 25,
    alerts: ['Alerta 1', 'Alerta 2', 'Alerta 3', 'Alerta 4', 'Alerta 5'] // Max score hits here too
  };
  
  const risk2 = calculateRiskIndex(scenario2);
  const level2 = getRiskLevel(risk2);
  
  console.log('ESCENARIO 2: Riesgo Crítico');
  console.log(`-> GPA: 1.0, Inasistencias: 25, Factores (ID: 1,2,3,1774657452866)`);
  console.log(`-> Resultado: ${risk2}%, Nivel: ${level2}`);
  console.log(`-> Validación: ${risk2 >= CRITICAL_RISK_THRESHOLD ? '✅ PASÓ (Crítico)' : '❌ FALLÓ'}\n`);

  // ESCENARIO 3: Mitigación vía Intervenciones
  // Mismos datos que Escenario 2, pero agregando 4 intervenciones (-20 puntos)
  await addIntervention(testStudentId, { text: 'Tutoría académica', type: 'académica' });
  await addIntervention(testStudentId, { text: 'Apoyo psicológico', type: 'bienestar' });
  await addIntervention(testStudentId, { text: 'Acuerdo financiero', type: 'socioeconómico' });
  await addIntervention(testStudentId, { text: 'Seguimiento familiar', type: 'familiar' });

  const risk3 = calculateRiskIndex(scenario2); // Usamos el mismo objeto student (y mismo ID)
  const level3 = getRiskLevel(risk3);

  console.log('ESCENARIO 3: Riesgo Mitigado');
  console.log(`-> Mismos datos que Esc. 2 + 4 Intervenciones (-20 puntos)`);
  console.log(`-> Resultado: ${risk3}%, Nivel: ${level3}`);
  console.log(`-> Reducción: ${risk2 - risk3} puntos`);
  console.log(`-> Validación: ${risk3 < risk2 ? '✅ PASÓ (Reducción detectada)' : '❌ FALLÓ'}\n`);

  console.log('--------------------------------------------------');
  console.log('Resumen:');
  const allPassed = (risk1 === 0 && risk2 >= 70 && risk3 < risk2);
  console.log(`Estado General: ${allPassed ? '✅ TODOS LOS ESCENARIOS VALIDADOS' : '❌ ALGUN ESCENARIO FALLÓ'}`);
  
  // Cleanup test data from persistence
  await setFactorsForStudent(testStudentId, []);
  // We can't easily delete interventions from studentInterventions.json via exported API,
  // but for a test script it's okay because we use ID 999.
}

runTests().catch(err => {
  console.error('Error durante la validación:', err);
  process.exit(1);
});
