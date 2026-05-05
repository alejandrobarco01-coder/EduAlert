/**
 * csvExport.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Utilidad cliente para generar y descargar un archivo CSV con los datos
 * actuales de estudiantes.  No realiza llamadas adicionales al backend.
 *
 * Criterios de aceptación (SCRUM-90):
 *  ✓ Generado en el cliente con datos del estado actual.
 *  ✓ Las comas dentro de celdas se encierran en comillas.
 *  ✓ El nombre del archivo incluye la fecha de exportación.
 */

/**
 * Escapa una celda CSV:
 *  - Si el valor contiene comas, comillas o saltos de línea → lo encierra en ""
 *  - Las comillas internas se duplican ("" → """)
 *
 * @param {*} value - Valor crudo de la celda
 * @returns {string} Celda segura para CSV
 */
function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  // Needs quoting if it contains comma, double-quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convierte el riskLevel interno al texto en español.
 * @param {string} level
 * @returns {string}
 */
function riskLevelEs(level) {
  const map = {
    low:       'Bajo',
    medium:    'Medio',
    high:      'Alto',
    critical:  'Crítico',
    unevaluated: 'Sin evaluar',
  };
  return map[level] ?? (level ?? 'Sin evaluar');
}

/**
 * Formatea una fecha ISO a formato legible.
 * @param {string|null} iso
 * @returns {string}
 */
function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-CO', { dateStyle: 'short' });
  } catch {
    return iso;
  }
}

/**
 * Genera y descarga el archivo CSV.
 *
 * Columnas: Nombre | Código | Programa | Semestre | Nivel de riesgo |
 *           Factores activos | Tutor asignado | Última intervención |
 *           Fecha de registro
 *
 * @param {Object[]} students     - Array de estudiantes del estado del dashboard
 * @param {Object[]} [tutors=[]]  - Array de tutores para resolver tutorId → nombre
 * @param {Object[]} [interventionsByStudent={}] - Mapa studentId → última intervención (opcional)
 */
export function exportStudentsToCSV(students, tutors = [], interventionsByStudent = {}) {
  if (!Array.isArray(students) || students.length === 0) {
    console.warn('[CSV Export] No hay estudiantes para exportar.');
    return;
  }

  // ── Build tutor lookup map ────────────────────────────────────────────────
  const tutorMap = {};
  tutors.forEach(t => { tutorMap[String(t.id)] = t.name; });

  // ── CSV Header ────────────────────────────────────────────────────────────
  const HEADERS = [
    'Nombre',
    'Código',
    'Programa',
    'Semestre',
    'Nivel de riesgo',
    'Factores activos',
    'Tutor asignado',
    'Última intervención',
    'Fecha de registro',
  ];

  // ── Build rows ────────────────────────────────────────────────────────────
  const rows = students.map(s => {
    // Factores activos: usamos el array de alertas que ya trae el estudiante
    const factoresActivos = Array.isArray(s.alerts) && s.alerts.length > 0
      ? s.alerts.join(' | ')
      : 'Ninguno';

    // Tutor asignado
    const tutorNombre = s.tutorId
      ? (tutorMap[String(s.tutorId)] ?? `ID ${s.tutorId}`)
      : 'Sin asignar';

    // Última intervención (si se pasó el mapa; si no, "Sin registro")
    const lastIntervention = interventionsByStudent[s.id];
    const ultimaIntervencion = lastIntervention
      ? `${formatDate(lastIntervention.createdAt)} — ${lastIntervention.type ?? 'General'}`
      : 'Sin registro';

    return [
      s.name         ?? '—',
      s.studentCode  ?? s.codigo ?? '—',
      s.program      ?? '—',
      s.semester     ?? '—',
      riskLevelEs(s.riskLevel),
      factoresActivos,
      tutorNombre,
      ultimaIntervencion,
      formatDate(s.createdAt),
    ].map(escapeCell).join(',');
  });

  // ── Assemble CSV content (UTF-8 BOM for Excel compatibility) ─────────────
  const BOM = '\uFEFF';
  const csvContent = BOM + [HEADERS.join(','), ...rows].join('\r\n');

  // ── Build filename with export date ───────────────────────────────────────
  // ✓ Criterio: nombre incluye fecha de exportación (ej: edualert-export-2025-07-01.csv)
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filename = `edualert-export-${today}.csv`;

  // ── Trigger browser download ──────────────────────────────────────────────
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`[CSV Export] Exported ${students.length} students → ${filename}`);
}
