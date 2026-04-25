// ─── Optimized API service layer for EduAlert ────────────────────────────────

const API_BASE = '/api';

// ─── Cache ───────────────────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 10_000;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && (Date.now() - entry.timestamp) < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

function getAuthHeaders() {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  return user.token ? { 'Authorization': `Bearer ${user.token}` } : {};
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────

export async function fetchStudents(params = {}) {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v !== 'Todos') qp.append(k, v);
  });

  const url = `${API_BASE}/students${qp.toString() ? `?${qp}` : ''}`;

  const cached = getCached(url);
  if (cached) return cached;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error al obtener estudiantes');

  const json = await res.json();
  setCache(url, json.data);
  return json.data;
}

export async function fetchStudent(id) {
  const url = `${API_BASE}/students/${id}`;
  const cached = getCached(url);
  if (cached) return cached;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error al obtener estudiante');

  const json = await res.json();
  setCache(url, json.data);
  return json.data;
}

export async function fetchStudentStats() {
  const url = `${API_BASE}/students/stats`;
  const cached = getCached(url);
  if (cached) return cached;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error al obtener estadísticas');

  const json = await res.json();
  setCache(url, json.data);
  return json.data;
}

/**
 * fetchRiskHistory (Institutional)
 * @param {number} months 
 */
export async function fetchRiskHistory(months = 6) {
  const url = `${API_BASE}/students/risk-history?months=${months}`;
  const cached = getCached(url);
  if (cached) return cached;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error al obtener historial global');

  const json = await res.json();
  const data = json.data || json;
  setCache(url, data);
  return data;
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error usuarios');
  return (await res.json()).data;
}

export async function createStudentAPI(data) {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error creando estudiante');
  const json = await res.json();
  invalidateStudentCaches(null);
  return json.data;
}

export async function fetchTutors() {
  const res = await fetch(`${API_BASE}/users/tutors`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error tutores');
  return (await res.json()).data;
}

export async function assignTutorAPI(studentId, tutorId) {
  const res = await fetch(`${API_BASE}/students/${studentId}/tutor`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ tutorId })
  });

  if (!res.ok) throw new Error('Error asignando tutor');
  const json = await res.json();
  invalidateStudentCaches(studentId);
  return json.data;
}

// ─── FACTORS ─────────────────────────────────────────────────────────────────

export async function fetchFactors() {
  const res = await fetch(`${API_BASE}/factors`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error factores');
  const json = await res.json();
  return json.data || json;
}

export async function fetchStudentFactors(studentId) {
  const res = await fetch(`${API_BASE}/students/${studentId}/factors`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error factores estudiante');
  return (await res.json()).data;
}

export async function saveStudentFactors(studentId, factorIds) {
  const res = await fetch(`${API_BASE}/students/${studentId}/factors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ factorIds })
  });

  const json = await res.json();
  if (!res.ok) throw new Error('Error guardando factores');

  invalidateStudentCaches(studentId);
  return json;
}

// ─── RISK RULES ──────────────────────────────────────────────────────────────

export async function fetchRiskRules() {
  const res = await fetch(`${API_BASE}/rules/risk`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Error reglas');
  return (await res.json()).data;
}

export async function updateRiskRulesAPI(data) {
  const res = await fetch(`${API_BASE}/rules/risk`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error('Error actualizando reglas');
  return (await res.json()).data;
}

// ─── INTERVENTIONS ───────────────────────────────────────────────────────────

export async function fetchInterventions(studentId) {
  const res = await fetch(`${API_BASE}/students/${studentId}/interventions`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) throw new Error('Error intervenciones');
  return (await res.json()).data;
}

export async function saveIntervention(studentId, data) {
  const res = await fetch(`${API_BASE}/students/${studentId}/interventions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok) throw new Error('Error guardando intervención');

  invalidateStudentCaches(studentId);
  return json;
}

// ─── CACHE INVALIDATION ──────────────────────────────────────────────────────

function invalidateStudentCaches(studentId) {
  for (const key of cache.keys()) {
    if (key.includes('/students')) {
      cache.delete(key);
    }
  }
}

// ─── ALIASES & MISSING FUNCS ─────────────────────────────────────────────────

export { fetchStudents as fetchStudentsFiltered };

export async function fetchAIRecommendations(studentId) {
  const res = await fetch(`${API_BASE}/students/${studentId}/recommendations`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error obteniendo recomendaciones IA');
  return (await res.json()).data;
}

export async function saveUserAPI(data, id = null) {
  const url = id ? `${API_BASE}/users/${id}` : `${API_BASE}/users`;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error guardando usuario');
  const json = await res.json();
  return json.data || data;
}

export async function updateUserStatusAPI(id, status) {
  const res = await fetch(`${API_BASE}/users/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Error actualizando estado');
  return (await res.json()).data;
}

export async function deleteUserAPI(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error eliminando usuario');
  return true;
}

export async function createFactorAPI(data) {
  const res = await fetch(`${API_BASE}/factors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error creando factor');
  return (await res.json()).data;
}

export async function deleteFactorAPI(id) {
  const res = await fetch(`${API_BASE}/factors/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error eliminando factor');
  return true;
}

export async function fetchStudentRiskHistory(studentId) {
  const res = await fetch(`${API_BASE}/riesgo-estudiante/usuario/${studentId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error obteniendo historial de riesgo del estudiante');
  return (await res.json()).data;
}

export async function testRiskCalculationAPI(selectedFactors) {
  const res = await fetch(`${API_BASE}/rules/risk/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ student: selectedFactors })
  });
  if (!res.ok) throw new Error('Error en la simulación');
  return (await res.json()).data;
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

/**
 * Preview the dynamic email template for a student (no email is sent).
 * @param {number} studentId
 * @returns {{ subject, text, html, student, factors }}
 */
export async function previewNotification(studentId) {
  const res = await fetch(`${API_BASE}/notifications/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ studentId })
  });
  if (!res.ok) throw new Error('Error generando vista previa');
  return (await res.json()).data;
}

/**
 * Manually sends an alert email to a student.
 * @param {number} studentId
 * @returns {{ timestamp, subject, recipient, studentName, factorsCount }}
 */
export async function sendNotificationAPI(studentId) {
  const res = await fetch(`${API_BASE}/notifications/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ studentId })
  });
  if (!res.ok) throw new Error('Error enviando notificación');
  return (await res.json()).data;
}