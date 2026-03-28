// ─── Optimized API service layer for EduAlert ────────────────────────────────

const API_BASE = '/api';

// ─── Response cache with TTL ─────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 10_000; // 10 seconds

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

/**
 * Fetch students list with optional filters — cached
 */
export async function fetchStudents({ program, semester, riskLevel, search } = {}) {
  const params = new URLSearchParams();
  if (program && program !== 'Todos') params.append('program', program);
  if (semester && semester !== 'Todos') params.append('semester', semester);
  if (riskLevel && riskLevel !== 'Todos') params.append('riskLevel', riskLevel);
  if (search) params.append('search', search);

  const url = `${API_BASE}/students${params.toString() ? `?${params}` : ''}`;

  // Check cache first
  const cached = getCached(url);
  if (cached) return cached;

  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Error al obtener estudiantes');
  const json = await res.json();

  setCache(url, json.data);
  return json.data;
}

/**
 * Fetch a single student by ID — cached
 */
export async function fetchStudent(id) {
  const url = `${API_BASE}/students/${id}`;

  const cached = getCached(url);
  if (cached) return cached;

  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Error al obtener estudiante ${id}`);
  const json = await res.json();

  setCache(url, json.data);
  return json.data;
}

/**
 * Fetch aggregated student statistics — cached
 */
export async function fetchStudentStats() {
  const url = `${API_BASE}/students/stats`;

  const cached = getCached(url);
  if (cached) return cached;

  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Error al obtener estadísticas');
  const json = await res.json();

  setCache(url, json.data);
  return json.data;
}

/**
 * Fetch risk history data — cached
 */
export async function fetchRiskHistory(months = 6) {
  const url = `${API_BASE}/students/risk-history?months=${months}`;

  const cached = getCached(url);
  if (cached) return cached;

  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Error al obtener historial de riesgo');
  const json = await res.json();

  setCache(url, json.data);
  return json.data;
}

/**
 * Fetch students with advanced combined filters — cached
 * Supports: program, semester, riskLevel, search, gpaMin, gpaMax,
 * absencesMin, absencesMax, riskMin, riskMax, hasAlerts,
 * sortBy, sortOrder, page, limit
 */
export async function fetchStudentsFiltered(params = {}) {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'Todos') {
      qp.append(key, value);
    }
  });

  const url = `${API_BASE}/students/filter${qp.toString() ? `?${qp}` : ''}`;

  const cached = getCached(url);
  if (cached) return cached;

  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Error al obtener estudiantes filtrados');
  const json = await res.json();

  const result = { data: json.data, pagination: json.pagination, appliedFilters: json.appliedFilters };
  setCache(url, result);
  return result;
}

/**
 * Fetch available filter options (programs, semesters, risk levels, ranges)
 */
export async function fetchFilterOptions() {
  const url = `${API_BASE}/students/filters/options`;

  const cached = getCached(url);
  if (cached) return cached;

  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Error al obtener opciones de filtros');
  const json = await res.json();

  setCache(url, json.data);
  return json.data;
}

/**
 * Fetch AI recommendations for a specific student
 */
export async function fetchAIRecommendations(id) {
  const url = `${API_BASE}/students/${id}/recommendations`;

  const cached = getCached(url);
  if (cached) return cached;

  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Error al obtener recomendaciones de IA');
  const json = await res.json();

  setCache(url, json.data);
  return json.data;
}

// ─── User Management API (Admin only) ────────────────────────────────────────

/**
 * Fetch all users — Admins only
 */
export async function fetchUsers() {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

  const res = await fetch(`${API_BASE}/users`, { headers });
  if (!res.ok) throw new Error('No tienes permisos para ver usuarios');
  const json = await res.json();
  return json.data;
}

/**
 * Create or Update a user
 */
export async function saveUserAPI(userData, id = null) {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/users/${id}` : `${API_BASE}/users`;

  const res = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(userData),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al guardar usuario');
  return json.data;
}

/**
 * Update user status (active/inactive)
 */
export async function updateUserStatusAPI(id, status) {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`
  };

  const res = await fetch(`${API_BASE}/users/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error('Error al actualizar estado');
  return await res.json();
}

/**
 * Deactivate user definitely
 */
export async function deleteUserAPI(id) {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = { 'Authorization': `Bearer ${user.token}` };

  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) throw new Error('Error al desactivar usuario');
  return await res.json();
}

/**
 * Fetch available tutors
 */
export async function fetchTutors() {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

  const res = await fetch(`${API_BASE}/users/tutors`, { headers });
  if (!res.ok) throw new Error('Error al obtener tutores');
  const json = await res.json();
  return json.data;
}

/**
 * Assign a tutor to a student
 */
export async function assignTutorAPI(studentId, tutorId) {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`
  };

  const res = await fetch(`${API_BASE}/students/${studentId}/tutor`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ tutorId }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al asignar tutor');
  return json.data;
}

/**
 * Fetch a student's assigned factors
 */
export async function fetchStudentFactors(studentId) {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

  const res = await fetch(`${API_BASE}/students/${studentId}/factors`, { headers });
  if (!res.ok) throw new Error('Error al obtener factores asignados');
  const json = await res.json();
  return json.data;
}

/**
 * Save (replace) a student's assigned factors
 */
export async function saveStudentFactors(studentId, factorIds) {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`
  };

  const res = await fetch(`${API_BASE}/students/${studentId}/factors`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ factorIds }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error('Error al guardar factores');
  return json.data;
}

// ─── Factors Management API ──────────────────────────────────────────────────

export async function fetchFactors() {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = user.token ? { 'Authorization': `Bearer ${user.token}` } : {};

  const res = await fetch(`${API_BASE}/factors`, { headers });
  if (!res.ok) throw new Error('Error al obtener factores');
  return await res.json();
}

export async function createFactorAPI(factorData) {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`
  };

  const res = await fetch(`${API_BASE}/factors`, {
    method: 'POST',
    headers,
    body: JSON.stringify(factorData),
  });

  const json = await res.json();
  if (!res.ok) throw new Error('Error al crear factor');
  return json;
}

export async function updateFactorAPI(id, factorData) {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`
  };

  const res = await fetch(`${API_BASE}/factors/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(factorData),
  });

  const json = await res.json();
  if (!res.ok) throw new Error('Error al actualizar factor');
  return json;
}

export async function deleteFactorAPI(id) {
  const user = JSON.parse(localStorage.getItem('edualert_user') || '{}');
  const headers = { 'Authorization': `Bearer ${user.token}` };

  const res = await fetch(`${API_BASE}/factors/${id}`, {
    method: 'DELETE',
    headers,
  });

  const json = await res.json();
  if (!res.ok) throw new Error('Error al eliminar factor');
  return json;
}

