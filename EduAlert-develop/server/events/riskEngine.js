import { EventEmitter } from 'events';
import { updateAndRecordRisk } from '../data/students.js';

class RiskEngineEvents extends EventEmitter {}

export const riskEngine = new RiskEngineEvents();

// Escuchamos el evento de actualización de datos relevantes del estudiante
riskEngine.on('studentDataUpdated', async ({ studentId, source }) => {
  try {
    const startTime = Date.now();
    console.log(`[RISK ENGINE EVENT] Triggered by '${source}' for student ${studentId}. Executing risk calculation...`);
    
    // El cálculo se ejecuta automáticamente aquí en menos de 2 segundos
    const result = await updateAndRecordRisk(studentId, source);
    
    const duration = Date.now() - startTime;
    console.log(`[RISK ENGINE EVENT] Risk calculation completed in ${duration}ms. New risk: ${result?.riskValue}%`);
    
    // Emitimos evento de finalización
    riskEngine.emit(`riskCalculated:${studentId}`, result);
  } catch (error) {
    console.error(`[RISK ENGINE EVENT] Error calculating risk for student ${studentId}:`, error);
    riskEngine.emit(`riskCalculated:${studentId}`, { error });
  }
});

/**
 * Función helper para disparar el evento y esperar su resolución (para mantener compatibilidad con el UI)
 */
export function triggerRiskCalculation(studentId, source) {
  return new Promise((resolve, reject) => {
    // Escuchamos la respuesta de la ejecución automática
    riskEngine.once(`riskCalculated:${studentId}`, (result) => {
      if (result && result.error) {
        reject(result.error);
      } else {
        resolve(result);
      }
    });
    
    // Disparamos el trigger/evento
    riskEngine.emit('studentDataUpdated', { studentId, source });
  });
}
