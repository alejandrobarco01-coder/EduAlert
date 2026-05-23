import { createRiesgoEstudiante, getAllRiesgoEstudiante } from './server/data/riesgoEstudiante.js';
import { getAllUsers } from './server/data/users.js';

async function runManualTest() {
  console.log('\n🔍 INICIANDO PRUEBA MANUAL DE RIESGO_ESTUDIANTE 🔍\n');

  // 1. Verificar usuarios disponibles
  const users = getAllUsers();
  const testUser = users[0];
  console.log(`👤 Usuario de prueba: ${testUser.name} (ID: ${testUser.id})`);

  // 2. Crear un registro de riesgo válido
  console.log('\n--- Escenario 1: Creación Válida ---');
  try {
    const newRisk = await createRiesgoEstudiante({
      usuario_id: testUser.id,
      valor_riesgo: 82,
      factores_detectados: ["Bajo rendimiento académico", "Inasistencias reiteradas"],
      trigger_source: 'manual_test_antigravity'
    });
    console.log('✅ Registro creado exitosamente:');
    console.log(JSON.stringify(newRisk, null, 2));
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }

  // 3. Probar validación de usuario inexistente
  console.log('\n--- Escenario 2: Validación Usuario Inexistente ---');
  try {
    const invalidId = 999999;
    console.log(`Intentando crear registro para usuario ID: ${invalidId}...`);
    await createRiesgoEstudiante({
      usuario_id: invalidId,
      valor_riesgo: 50
    });
  } catch (error) {
    console.log(`✅ Validación correcta: ${error.message}`);
  }

  // 4. Ver historial total
  console.log('\n--- Historial Total en riesgoEstudiante.json ---');
  const allRecords = getAllRiesgoEstudiante();
  console.log(`Total de registros en la colección: ${allRecords.length}`);
  console.log('Último registro guardado:');
  console.log(JSON.stringify(allRecords[0], null, 2));
  
  console.log('\n--- PRUEBA FINALIZADA ---');
}

runManualTest().catch(err => {
  console.error('Error fatal en la prueba:', err);
  process.exit(1);
});
