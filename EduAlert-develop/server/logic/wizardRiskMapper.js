/**
 * wizardRiskMapper.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Mapea las respuestas del wizard de auto-registro al conjunto de factores de
 * riesgo definidos en factors.json.  Este módulo es puro (sin efectos
 * secundarios) y no importa ningún módulo de persistencia.
 *
 * Factores disponibles (factors.json):
 *   ID 1 → Bajo rendimiento académico   (Académico,      weight 5)
 *   ID 2 → Inasistencias reiteradas     (Académico,      weight 3)
 *   ID 3 → Problemas financieros        (Socioeconómico, weight 4)
 *   ID 4 → Falta de apoyo familiar      (Familiar,       weight 2)
 */

/**
 * @typedef {Object} WizardStep1
 * @property {string|number} gpa       - Promedio académico (0–5)
 * @property {string|number} absences  - Número de inasistencias
 * @property {string}        semestre  - Semestre actual (1–10)
 */

/**
 * @typedef {Object} WizardStep2
 * @property {boolean|string} hasDificultadEconomica - ¿Tiene dificultades económicas?
 * @property {boolean|string} tieneApoyoFamiliar      - ¿Tiene apoyo familiar?
 * @property {boolean|string} tieneEmpleo             - ¿Está empleado actualmente?
 * @property {boolean|string} tieneBecaSubsidio       - ¿Tiene beca o subsidio?
 */

/**
 * Normaliza un valor booleano que puede llegar como string ('true'/'false'),
 * boolean real, o string 'si'/'no'.
 * @param {*} value
 * @returns {boolean}
 */
function toBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === 'si' || v === 'sí' || v === '1' || v === 'yes';
  }
  return Boolean(value);
}

/**
 * Mapea las respuestas del wizard al array de factorIds que corresponden.
 *
 * Criterios de aceptación (SCRUM-XX):
 *  ✓ El sistema mapea cada respuesta del wizard al factor de riesgo correspondiente.
 *  ✓ Retorna un array de IDs numéricos listos para ser pasados a setFactorsForStudent.
 *
 * @param {WizardStep1} step1 - Datos personales/académicos del paso 1
 * @param {WizardStep2} step2 - Respuestas socioeconómicas del paso 2
 * @returns {number[]} Array de factorIds detectados
 */
export function mapWizardToFactorIds(step1, step2) {
  const detectedFactors = [];

  // ── Factor 1: Bajo rendimiento académico ──────────────────────────────────
  // Se activa cuando el GPA declarado es menor a 3.0 sobre 5.0
  const gpa = parseFloat(step1?.gpa ?? 0);
  if (!isNaN(gpa) && gpa < 3.0) {
    detectedFactors.push(1);
  }

  // ── Factor 2: Inasistencias reiteradas ────────────────────────────────────
  // Se activa cuando declara más de 5 faltas
  const absences = parseInt(step1?.absences ?? 0, 10);
  if (!isNaN(absences) && absences > 5) {
    detectedFactors.push(2);
  }

  // ── Factor 3: Problemas financieros ───────────────────────────────────────
  // Se activa si reporta dificultad económica Y no tiene beca/subsidio
  const hasDificultadEconomica = toBool(step2?.hasDificultadEconomica);
  const tieneBecaSubsidio      = toBool(step2?.tieneBecaSubsidio);
  if (hasDificultadEconomica && !tieneBecaSubsidio) {
    detectedFactors.push(3);
  }

  // ── Factor 4: Falta de apoyo familiar ────────────────────────────────────
  // Se activa cuando el estudiante declara no tener apoyo familiar
  const tieneApoyoFamiliar = toBool(step2?.tieneApoyoFamiliar);
  if (!tieneApoyoFamiliar) {
    detectedFactors.push(4);
  }

  return detectedFactors;
}

/**
 * Convierte un valor numérico de riesgo (0-100) al nivel textual del sistema.
 * Refleja la misma lógica de getRiskLevel() en students.js (SCRUM-40).
 *
 * @param {number} riskValue - Valor numérico de riesgo (0-100)
 * @returns {'low'|'medium'|'high'|'critical'} Nivel de riesgo
 */
export function riskValueToLevel(riskValue) {
  if (riskValue >= 70) return 'critical';
  if (riskValue >= 60) return 'high';
  if (riskValue >= 35) return 'medium';
  return 'low';
}

/**
 * Traduce el nivel interno al texto español para mostrar al estudiante.
 * @param {'low'|'medium'|'high'|'critical'} level
 * @returns {string}
 */
export function riskLevelToSpanish(level) {
  const map = { low: 'bajo', medium: 'medio', high: 'alto', critical: 'crítico' };
  return map[level] ?? 'sin evaluar';
}
