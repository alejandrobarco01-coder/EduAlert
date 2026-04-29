/**
 * csvExport.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Utilidad cliente para generar y descargar un archivo CSV con los datos
 * actuales de estudiantes. No realiza llamadas adicionales al backend.
 */

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function riskLevelEs(level) {
  const map = {
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
    critical: 'Crítico',
    unevaluated: 'Sin evaluar',
  };
  return map[level] ?? (level ?? 'Sin evaluar');
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-CO', { dateStyle: 'short' });
  } catch {
    return iso;
  }
}

export function exportStudentsToCSV(students, tutors = [], interventionsByStudent = {}) {
  if (!Array.isArray(students) || students.length === 0) {
    console.warn('[CSV Export] No hay estudiantes para exportar.');
    return;
  }

  const tutorMap = {};
  tutors.forEach(t => { tutorMap[String(t.id)] = t.name; });

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

  const rows = students.map(s => {
    const factoresActivos = Array.isArray(s.alerts) && s.alerts.length > 0
      ? s.alerts.join(' | ')
      : 'Ninguno';

    const tutorNombre = s.tutorId
      ? (tutorMap[String(s.tutorId)] ?? `ID ${s.tutorId}`)
      : 'Sin asignar';

    const lastIntervention = interventionsByStudent[s.id];
    const ultimaIntervencion = lastIntervention
      ? `${formatDate(lastIntervention.createdAt)} — ${lastIntervention.type ?? 'General'}`
      : 'Sin registro';

    return [
      s.name ?? '—',
      s.studentCode ?? s.codigo ?? '—',
      s.program ?? '—',
      s.semester ?? '—',
      riskLevelEs(s.riskLevel),
      factoresActivos,
      tutorNombre,
      ultimaIntervencion,
      formatDate(s.createdAt),
    ].map(escapeCell).join(',');
  });

  const BOM = '\uFEFF';
  const csvContent = BOM + [HEADERS.join(','), ...rows].join('\r\n');

  const today = new Date().toISOString().slice(0, 10);
  const filename = `edualert-export-${today}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
