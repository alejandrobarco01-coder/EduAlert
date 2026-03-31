// ─── In-memory student database with CACHED risk index calculation ───────────
import { getFactorsForStudent } from './studentFactors.js';
import { getAllFactors } from './factors.js';
import { saveRiskRecord } from './riskHistory.js';
import { getInterventionsForStudent } from './interventions.js';

const studentsDB = [
  {
    id: 1,
    name: 'Valentina Ospina Reyes',
    program: 'Ingeniería de Sistemas',
    semester: 4,
    email: 'v.ospina@uceva.edu.co',
    avatar: 'VO',
    absences: 14,
    gpa: 2.8,
    alerts: ['Inasistencias reiteradas', 'Bajo promedio académico'],
  },
  {
    id: 2,
    name: 'Santiago Muñoz García',
    program: 'Derecho',
    semester: 6,
    email: 's.munoz@uceva.edu.co',
    avatar: 'SM',
    absences: 6,
    gpa: 3.5,
    alerts: ['Dificultades socioeconómicas reportadas'],
  },
  {
    id: 3,
    name: 'Camila Herrera Pinto',
    program: 'Medicina',
    semester: 2,
    email: 'c.herrera@uceva.edu.co',
    avatar: 'CH',
    absences: 1,
    gpa: 4.2,
    alerts: [],
  },
  {
    id: 4,
    name: 'Andrés Castaño López',
    program: 'Administración de Empresas',
    semester: 5,
    email: 'a.castano@uceva.edu.co',
    avatar: 'AC',
    absences: 18,
    gpa: 2.4,
    alerts: ['Sin contacto con tutor', 'Pagos pendientes', 'Bajo rendimiento'],
  },
  {
    id: 5,
    name: 'Mariana Salcedo Vargas',
    program: 'Psicología',
    semester: 3,
    email: 'm.salcedo@uceva.edu.co',
    avatar: 'MS',
    absences: 2,
    gpa: 4.0,
    alerts: [],
  },
  {
    id: 6,
    name: 'Felipe Torres Ríos',
    program: 'Ingeniería de Sistemas',
    semester: 7,
    email: 'f.torres@uceva.edu.co',
    avatar: 'FT',
    absences: 9,
    gpa: 3.1,
    alerts: ['Carga laboral elevada detectada'],
  },
  {
    id: 7,
    name: 'Laura Jiménez Bermúdez',
    program: 'Contaduría Pública',
    semester: 1,
    email: 'l.jimenez@uceva.edu.co',
    avatar: 'LJ',
    absences: 11,
    gpa: 2.6,
    alerts: ['Primera semana sin asistencia', 'Riesgo de abandono temprano'],
  },
  {
    id: 8,
    name: 'Julián Cardona Mejía',
    program: 'Ingeniería Industrial',
    semester: 4,
    email: 'j.cardona@uceva.edu.co',
    avatar: 'JC',
    absences: 3,
    gpa: 3.9,
    alerts: [],
  },
  {
    id: 9,
    name: 'Sofía Rendón Agudelo',
    program: 'Medicina',
    semester: 8,
    email: 's.rendon@uceva.edu.co',
    avatar: 'SR',
    absences: 7,
    gpa: 3.4,
    alerts: ['Reportó dificultades familiares'],
  },
  {
    id: 10,
    name: 'Camilo Ávila Toro',
    program: 'Ingeniería Eléctrica',
    semester: 3,
    email: 'c.avila@uceva.edu.co',
    avatar: 'CA',
    absences: 22,
    gpa: 1.9,
    alerts: ['Repitente', 'Sin matrícula financiera', 'Inasistencias críticas'],
  },
  {
    id: 11,
    name: 'Isabella Mora Castaño',
    program: 'Derecho',
    semester: 9,
    email: 'i.mora@uceva.edu.co',
    avatar: 'IM',
    absences: 1,
    gpa: 4.5,
    alerts: [],
  },
  {
    id: 12,
    name: 'David Quintero Serna',
    program: 'Administración de Empresas',
    semester: 2,
    email: 'd.quintero@uceva.edu.co',
    avatar: 'DQ',
    absences: 10,
    gpa: 3.0,
    alerts: ['Bajo promedio en materias clave'],
    tutorId: null,
  },
];

// ─── Pre-computed search fields (lowercase) for fast filtering ───────────────
const searchIndex = new Map();

function buildSearchIndex(students) {
  students.forEach(s => {
    searchIndex.set(s.id, {
      name: s.name.toLowerCase(),
      program: s.program.toLowerCase(),
      email: s.email.toLowerCase(),
    });
  });
}

// ─── Risk index cache ────────────────────────────────────────────────────────
let cachedStudents = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30 seconds in ms

export function calculateRiskIndex(student) {
  const maxGPA = 5.0;
  const gpaRisk = ((maxGPA - student.gpa) / maxGPA) * 100;

  const maxAbsences = 25;
  const absenceRisk = Math.min(100, (student.absences / maxAbsences) * 100);

  // ─── Dynamic Factor Risk Calculation ──────────────────────────────────────
  // Fetch factors assigned via checklist
  const studentFactorIds = getFactorsForStudent(student.id);
  const allFactors = getAllFactors();
  const studentFactors = allFactors.filter(f => studentFactorIds.includes(f.id));
  
  // Calculate risk based on sum of weights (Max hypothetical weights set to 20 for scaling)
  const maxFactorWeightSum = 20; 
  const factorWeightSum = studentFactors.reduce((sum, f) => sum + (f.weight || 0), 0);
  
  // Merge traditional alerts with checklist factors for total impact
  const totalAlertPoints = Math.max(student.alerts.length, studentFactors.length);
  const maxAlertPoints = 5;
  
  const alertRisk = Math.min(100, (totalAlertPoints / maxAlertPoints) * 100);
  const factorRiskValue = Math.min(100, (factorWeightSum / maxFactorWeightSum) * 100);

  // ─── Interventions Benefit (Mitigating risk) ──────────────────────────────
  // Each intervention reduces risk (-5 points each, max -20)
  const studentInterventions = getInterventionsForStudent(student.id);
  const interventionBenefit = Math.min(20, studentInterventions.length * 5);

  // Combined score (Weights: GPA 35%, Absences 30%, Factors/Checklist 35%)
  return Math.round(
    Math.max(0, Math.min(100, (gpaRisk * 0.35 + absenceRisk * 0.30 + factorRiskValue * 0.35) - interventionBenefit))
  );
}

/**
 * Triggered when checklist or intervention is modified.
 * Acceptance criteria: Registers new value in risk_estudiante, maintains history.
 */
export async function updateAndRecordRisk(studentId) {
  const student = getStudentById(Number(studentId));
  if (!student) return null;

  // Recalculate with latest data
  const newRiskValue = calculateRiskIndex(student);
  
  // Record in history
  await saveRiskRecord(studentId, newRiskValue);
  
  // Invalidate cache
  cacheTimestamp = 0;
  statsCacheTimestamp = 0;
  
  return {
    studentId,
    riskValue: newRiskValue,
    timestamp: new Date().toISOString()
  };
}

export function getRiskLevel(riskIndex) {
  if (riskIndex >= 60) return 'high';
  if (riskIndex >= 35) return 'medium';
  return 'low';
}

/**
 * Returns all students with cached riskIndex/riskLevel.
 * Cache is invalidated after CACHE_TTL (30s).
 */
export function getAllStudents() {
  const now = Date.now();
  if (cachedStudents && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedStudents;
  }

  cachedStudents = studentsDB.map(student => {
    const riskIndex = calculateRiskIndex(student);
    return { ...student, riskIndex, riskLevel: getRiskLevel(riskIndex) };
  });
  cacheTimestamp = now;

  // Build search index alongside
  buildSearchIndex(cachedStudents);

  return cachedStudents;
}

/**
 * Fast filtered query — uses pre-computed search index
 */
export function queryStudents({ program, semester, riskLevel, search, tutorId } = {}) {
  let students = getAllStudents();

  if (program && program !== 'Todos') {
    students = students.filter(s => s.program === program);
  }

  if (semester && semester !== 'Todos') {
    const sem = Number(semester);
    students = students.filter(s => s.semester === sem);
  }

  if (tutorId) {
    const tId = Number(tutorId);
    if (!isNaN(tId)) students = students.filter(s => s.tutorId === tId);
  }

  if (riskLevel && riskLevel !== 'Todos') {
    students = students.filter(s => s.riskLevel === riskLevel);
  }

  if (search) {
    const q = search.toLowerCase();
    students = students.filter(s => {
      const idx = searchIndex.get(s.id);
      return idx && (
        idx.name.includes(q) ||
        idx.program.includes(q) ||
        idx.email.includes(q)
      );
    });
  }

  return students;
}

/**
 * Pre-computed stats — calculated once per cache cycle
 */
let cachedStats = null;
let statsCacheTimestamp = 0;

export function getStats() {
  const now = Date.now();
  if (cachedStats && (now - statsCacheTimestamp) < CACHE_TTL) {
    return cachedStats;
  }

  const students = getAllStudents();
  const total = students.length;

  let high = 0, medium = 0, low = 0, totalRisk = 0;
  const byProgram = {};

  // Single pass for all stats
  for (const s of students) {
    if (s.riskLevel === 'high') high++;
    else if (s.riskLevel === 'medium') medium++;
    else low++;

    totalRisk += s.riskIndex;

    if (!byProgram[s.program]) {
      byProgram[s.program] = { totalRisk: 0, count: 0 };
    }
    byProgram[s.program].totalRisk += s.riskIndex;
    byProgram[s.program].count++;
  }

  const programAverages = Object.entries(byProgram).map(([program, data]) => ({
    program,
    averageRisk: Math.round(data.totalRisk / data.count),
    studentCount: data.count,
  }));

  cachedStats = {
    total,
    high,
    medium,
    low,
    averageRisk: Math.round(totalRisk / total),
    programAverages,
  };
  statsCacheTimestamp = now;

  return cachedStats;
}

/**
 * Advanced combined filter query with dynamic parameters.
 * Supports: text search, exact matches, range filters, sorting, and pagination.
 */
export function queryStudentsAdvanced({
  program, semester, riskLevel, search, tutorId,
  gpaMin, gpaMax,
  absencesMin, absencesMax,
  riskMin, riskMax,
  hasAlerts,
  sortBy = 'riskIndex', sortOrder = 'desc',
  page, limit,
} = {}) {
  let students = getAllStudents();

  // ─── Exact-match filters ────────────────────────────────────────────────────
  if (program && program !== 'Todos') {
    students = students.filter(s => s.program === program);
  }

  if (semester && semester !== 'Todos') {
    const sem = Number(semester);
    if (!isNaN(sem)) students = students.filter(s => s.semester === sem);
  }

  // ─── Tutor filter ──────────────────────────────────────────────────────────
  if (tutorId) {
    const tId = Number(tutorId);
    if (!isNaN(tId)) students = students.filter(s => s.tutorId === tId);
  }

  if (riskLevel && riskLevel !== 'Todos') {
    students = students.filter(s => s.riskLevel === riskLevel);
  }

  // ─── Range filters ─────────────────────────────────────────────────────────
  if (gpaMin !== undefined) {
    const min = Number(gpaMin);
    if (!isNaN(min)) students = students.filter(s => s.gpa >= min);
  }
  if (gpaMax !== undefined) {
    const max = Number(gpaMax);
    if (!isNaN(max)) students = students.filter(s => s.gpa <= max);
  }

  if (absencesMin !== undefined) {
    const min = Number(absencesMin);
    if (!isNaN(min)) students = students.filter(s => s.absences >= min);
  }
  if (absencesMax !== undefined) {
    const max = Number(absencesMax);
    if (!isNaN(max)) students = students.filter(s => s.absences <= max);
  }

  if (riskMin !== undefined) {
    const min = Number(riskMin);
    if (!isNaN(min)) students = students.filter(s => s.riskIndex >= min);
  }
  if (riskMax !== undefined) {
    const max = Number(riskMax);
    if (!isNaN(max)) students = students.filter(s => s.riskIndex <= max);
  }

  // ─── Alerts filter ─────────────────────────────────────────────────────────
  if (hasAlerts !== undefined) {
    const wantAlerts = hasAlerts === 'true' || hasAlerts === true;
    students = students.filter(s => wantAlerts ? s.alerts.length > 0 : s.alerts.length === 0);
  }

  // ─── Text search (uses pre-computed index) ─────────────────────────────────
  if (search) {
    const q = search.toLowerCase();
    students = students.filter(s => {
      const idx = searchIndex.get(s.id);
      return idx && (
        idx.name.includes(q) ||
        idx.program.includes(q) ||
        idx.email.includes(q)
      );
    });
  }

  // ─── Sorting ───────────────────────────────────────────────────────────────
  const validSortFields = ['name', 'gpa', 'absences', 'riskIndex', 'semester'];
  const field = validSortFields.includes(sortBy) ? sortBy : 'riskIndex';
  const order = sortOrder === 'asc' ? 1 : -1;

  students.sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (typeof aVal === 'string') return aVal.localeCompare(bVal) * order;
    return (aVal - bVal) * order;
  });

  // ─── Pagination ────────────────────────────────────────────────────────────
  const totalFiltered = students.length;
  let currentPage = 1;
  let pageSize = totalFiltered; // default: return all

  if (limit !== undefined) {
    pageSize = Math.max(1, Number(limit) || 10);
    currentPage = Math.max(1, Number(page) || 1);
    const start = (currentPage - 1) * pageSize;
    students = students.slice(start, start + pageSize);
  }

  return {
    data: students,
    pagination: {
      total: totalFiltered,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(totalFiltered / pageSize),
    },
  };
}

/**
 * Returns available filter option values for building dynamic UIs.
 */
export function getAvailableFilters() {
  const students = getAllStudents();
  const programs = [...new Set(students.map(s => s.program))].sort();
  const semesters = [...new Set(students.map(s => s.semester))].sort((a, b) => a - b);
  const riskLevels = ['low', 'medium', 'high'];

  const gpaRange = { min: Math.min(...students.map(s => s.gpa)), max: Math.max(...students.map(s => s.gpa)) };
  const absencesRange = { min: Math.min(...students.map(s => s.absences)), max: Math.max(...students.map(s => s.absences)) };
  const riskRange = { min: Math.min(...students.map(s => s.riskIndex)), max: Math.max(...students.map(s => s.riskIndex)) };

  return {
    programs,
    semesters,
    riskLevels,
    ranges: { gpa: gpaRange, absences: absencesRange, riskIndex: riskRange },
    totalStudents: students.length,
  };
}

/**
 * Generates AI-powered intervention recommendations based on student risk factors.
 */
export function generateAIRecommendations(student) {
  const recommendations = [];

  // ─── GPA Logic ─────────────────────────────────────────────────────────────
  if (student.gpa < 3.0) {
    recommendations.push({
      id: 'gpa-1',
      icon: 'BookOpen',
      text: 'Remisión prioritaria a tutorías académicas en materias núcleo.',
      priority: 'high'
    });
    recommendations.push({
      id: 'gpa-2',
      icon: 'ClipboardCheck',
      text: 'Inclusión en programa de nivelación de competencias básicas.',
      priority: 'medium'
    });
  }

  // ─── Absence Logic ─────────────────────────────────────────────────────────
  if (student.absences > 10) {
    recommendations.push({
      id: 'abs-1',
      icon: 'PhoneCall',
      text: 'Entrevista de seguimiento con tutor para identificar causas de inasistencia.',
      priority: 'high'
    });
  }

  // ─── Alerts Analysis ───────────────────────────────────────────────────────
  const alertStr = (student.alerts || []).join(' ').toLowerCase();

  if (alertStr.includes('socioeconómicas') || alertStr.includes('pagos')) {
    recommendations.push({
      id: 'socio-1',
      icon: 'Handshake',
      text: 'Evaluación por Bienestar Universitario para posibles apoyos financieros o becas.',
      priority: 'high'
    });
  }

  if (alertStr.includes('tutor') || alertStr.includes('laboral')) {
    recommendations.push({
      id: 'tutor-1',
      icon: 'Users',
      text: 'Ajuste de cronograma académico personalizado para equilibrio vida-estudio.',
      priority: 'medium'
    });
  }

  // ─── High Risk Catch-all ───────────────────────────────────────────────────
  if (student.riskLevel === 'high' && recommendations.length < 3) {
    recommendations.push({
      id: 'risk-1',
      icon: 'AlertTriangle',
      text: 'Activación de protocolo de retención inmediata con acompañamiento psicológico.',
      priority: 'high'
    });
  }

  // Default if stable
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'stable-1',
      icon: 'Award',
      text: 'Mantener monitoreo estándar. Estudiante presenta indicadores de estabilidad.',
      priority: 'low'
    });
  }

  return recommendations;
}

export function getStudentById(id) {
  const students = getAllStudents();
  return students.find(s => s.id === id) || null;
}

export function assignTutor(studentId, tutorId) {
  const sId = Number(studentId);
  const tId = tutorId ? Number(tutorId) : null;
  const student = studentsDB.find(s => s.id === sId);
  
  if (student) {
    student.tutorId = tId;
    // Invalidamos el cache
    cacheTimestamp = 0;
    statsCacheTimestamp = 0;
    return student;
  }
  return null;
}

// ─── Warm up cache on module load ────────────────────────────────────────────
getAllStudents();
