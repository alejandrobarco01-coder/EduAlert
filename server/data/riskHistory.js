import { 
  createRiesgoEstudiante, 
  getRiesgoByUsuarioId, 
  getLatestRiesgoPerUsuario,
  getAllRiesgoEstudiante
} from './riesgoEstudiante.js';

/**
 * Wrapper for backward compatibility. 
 * Maps studentId -> usuario_id and riskValue -> valor_riesgo.
 */
export async function saveRiskRecord(studentId, riskValue, metadata = {}) {
  // Mapping the old field names to the new ones required by the user
  return await createRiesgoEstudiante({
    usuario_id: studentId,
    valor_riesgo: riskValue,
    factores_detectados: metadata.factores_detectados || [], // Now supported
    trigger_source: metadata.triggerSource,
    valor_riesgo_anterior: metadata.previousRiskValue,
    nivel_riesgo: metadata.riskLevel,
    delta: metadata.delta
  });
}

/**
 * Wrapper for backward compatibility
 */
export function getRiskHistoryByStudent(studentId) {
  const records = getRiesgoByUsuarioId(studentId);
  return records.map(r => ({
    ...r,
    studentId: r.usuario_id,
    timestamp: r.fecha_calculo,
    riskValue: r.valor_riesgo,
    triggerSource: r.trigger_source,
    previousRiskValue: r.valor_riesgo_anterior,
    riskLevel: r.nivel_riesgo
  }));
}

/**
 * Wrapper for backward compatibility
 */
export function getLatestRiskRecords() {
  const latest = getLatestRiesgoPerUsuario();
  const legacyLatest = {};
  
  for (const [sId, record] of Object.entries(latest)) {
    legacyLatest[sId] = {
      ...record,
      studentId: record.usuario_id,
      timestamp: record.fecha_calculo,
      riskValue: record.valor_riesgo
    };
  }
  return legacyLatest;
}
