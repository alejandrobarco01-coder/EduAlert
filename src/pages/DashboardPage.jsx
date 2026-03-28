import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, AlertTriangle, TrendingUp, LogOut, Bell,
  LayoutDashboard, Shield, ChevronRight, X, GraduationCap,
  BarChart2, Search, Menu, Calendar, Loader2, Sparkles,
  PhoneCall, Handshake, Award, ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudents } from '../hooks/useStudents';
import { fetchAIRecommendations, fetchTutors, assignTutorAPI, fetchFactors, fetchStudentFactors, saveStudentFactors } from '../services/api';
import StudentCard from '../components/StudentCard';
import FilterPanel from '../components/FilterPanel';
import UserManagement from '../components/UserManagement';
import FactorsManagement from '../components/FactorsManagement';
import FactorsChecklist from '../components/FactorsChecklist';

const DEFAULT_FILTERS = { program: 'Todos', semester: 'Todos', riskLevel: 'Todos' };

const roleLabel = { admin: 'Administrador', tutor: 'Tutor', coordinator: 'Coordinador' };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('students');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);  // Global search & UI
  const [globalSearch, setGlobalSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [pendingTutorId, setPendingTutorId] = useState(null);
  const [allFactors, setAllFactors] = useState([]);
  const [studentFactorsIds, setStudentFactorsIds] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'coordinator') {
      fetchTutors().then(setTutors).catch(console.error);
    }
    fetchFactors().then(setAllFactors).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentFactors(selectedStudent.id)
        .then(factors => setStudentFactorsIds(factors.map(f => f.id)))
        .catch(console.error);
    } else {
      setStudentFactorsIds([]);
    }
  }, [selectedStudent]);

  const handleAssignTutor = async () => {
    try {
      const tutorToAssign = pendingTutorId !== null ? pendingTutorId : selectedStudent.tutorId;
      await assignTutorAPI(selectedStudent.id, tutorToAssign);
      setSelectedStudent(prev => ({ ...prev, tutorId: tutorToAssign }));
      setPendingTutorId(null);
      refetch();
      alert('Tutor asignado con éxito a ' + selectedStudent.name);
    } catch (e) {
      console.error(e);
      alert('Error al asignar el tutor');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const handleAnalyzeAI = async (id) => {
    setAnalyzing(true);
    setRecommendations([]);
    try {
      // Small artificial delay for "AI simulation" feel
      await new Promise(r => setTimeout(r, 1200));
      const data = await fetchAIRecommendations(id);
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const closeStudentModal = () => {
    setSelectedStudent(null);
    setRecommendations([]);
    setAnalyzing(false);
    setPendingTutorId(null);
  };

  // Fetch students and stats from API (falls back to mock data)
  const { students: filteredStudents, stats, loading, isFetching, refetch } = useStudents(filters, globalSearch);

  const navItems = [
    { id: 'students', label: 'Estudiantes', icon: GraduationCap },
    { id: 'analytics', label: 'Analíticas', icon: BarChart2 },
    ...(['admin', 'coordinator'].includes(user?.role) ? [{ id: 'factors', label: 'Factores', icon: ClipboardCheck }] : []),
    ...(user?.role === 'admin' ? [{ id: 'users', label: 'Usuarios', icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex" id="dashboard">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Brand */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-uceva-700 to-uceva-900 rounded-xl flex items-center justify-center shadow-lg border border-uceva-700/30">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Edu<span className="text-uceva-400">Alert</span></span>
              <p className="text-[10px] text-gray-600 leading-none mt-0.5">UCEVA · IA Educativa</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-uceva-800 to-gray-800 flex items-center justify-center text-uceva-300 font-bold text-sm border border-gray-700">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-uceva-500">{roleLabel[user?.role]}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1" id="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
                className={`sidebar-item w-full ${activeView === item.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                {item.label}
                {activeView === item.id && <ChevronRight size={14} className="ml-auto text-uceva-500" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-800">
          <button id="logout-btn" onClick={handleLogout} className="sidebar-item w-full text-red-500 hover:text-red-400 hover:bg-red-900/20">
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 lg:px-6 py-4 flex items-center gap-4">
          <button id="menu-btn" onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white p-1">
            <Menu size={22} />
          </button>

          <div className="flex-1 relative max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              id="global-search"
              type="text"
              placeholder="Buscar estudiante..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto relative">
            <button 
              id="notifications-btn" 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors border border-gray-700"
            >
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {stats.high}
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-12 right-0 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 p-3 animate-fade-in origin-top-right">
                <p className="text-sm font-bold text-white mb-2">Notificaciones</p>
                {stats.high > 0 ? (
                  <div className="p-3 bg-red-900/20 border border-red-900/40 rounded-lg">
                    <p className="text-xs text-red-200">
                      Hay <strong>{stats.high} estudiantes</strong> evaluados en riesgo alto que requieren atención inmediata.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">No hay notificaciones</p>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto relative">
          {/* Subtle top progress bar during background refetch */}
          {isFetching && !loading && (
            <div className="absolute top-0 left-0 right-0 h-0.5 z-10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-uceva-600 via-uceva-400 to-uceva-600 animate-progress-bar" />
            </div>
          )}
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <div className="w-11 h-11 rounded-xl bg-uceva-900/50 border border-uceva-800/40 flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-uceva-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Estudiantes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="w-11 h-11 rounded-xl bg-red-900/30 border border-red-800/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.high}</p>
                <p className="text-xs text-gray-500 mt-0.5">Riesgo Alto</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="w-11 h-11 rounded-xl bg-orange-900/30 border border-orange-800/30 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={20} className="text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.medium}</p>
                <p className="text-xs text-gray-500 mt-0.5">Riesgo Medio</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="w-11 h-11 rounded-xl bg-uceva-900/30 border border-uceva-800/30 flex items-center justify-center flex-shrink-0">
                <LayoutDashboard size={20} className="text-uceva-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.low}</p>
                <p className="text-xs text-gray-500 mt-0.5">Riesgo Bajo</p>
              </div>
            </div>
          </div>

          {/* Views */}
          {activeView === 'students' && (
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Monitor Estudiantil</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Índices de riesgo calculados por IA en tiempo real</p>
                </div>

                {/* Indicador de fecha */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl shadow-sm self-start md:self-center">
                  <Calendar size={14} className="text-uceva-400" />
                  <span className="text-xs text-gray-400">Último cálculo: </span>
                  <span className="text-xs font-semibold text-white">
                    {new Date().toLocaleString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              
              {user?.role === 'tutor' && (
                <div className="mb-4">
                  <button 
                    onClick={() => handleFilterChange('tutorId', filters.tutorId ? '' : user.id)}
                    className={`btn-secondary text-xs px-4 py-2 !w-auto ${filters.tutorId ? 'bg-uceva-800/80 text-white border-uceva-700/50' : ''}`}
                  >
                    <Users size={14} className="mr-1.5" />
                    {filters.tutorId ? 'Ver todos los estudiantes' : 'Ver mis estudiantes asignados'}
                  </button>
                </div>
              )}

              <FilterPanel filters={filters} onChange={handleFilterChange} onReset={resetFilters} resultCount={filteredStudents.length} />
              {loading ? (
                <div className="card p-16 text-center">
                  <Loader2 size={32} className="text-uceva-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Cargando estudiantes...</p>
                  <p className="text-gray-600 text-sm mt-1">Conectando con el servidor</p>
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                  {filteredStudents.map((s, i) => (
                    <div key={s.id} className="animate-result-in" style={{ animationDelay: `${i * 30}ms` }}>
                      <StudentCard student={s} onClick={setSelectedStudent} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Search size={28} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-medium">Sin resultados</p>
                  <p className="text-gray-600 text-sm mt-1">Ajusta los filtros para encontrar estudiantes</p>
                  <button onClick={resetFilters} className="btn-secondary mx-auto mt-4 !w-auto">Limpiar filtros</button>
                </div>
              )}
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="animate-fade-in">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">Analíticas del Sistema</h2>
                <p className="text-sm text-gray-500 mt-0.5">Distribución de riesgo por programa académico</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Risk distribution */}
                <div className="card p-5">
                  <h3 className="font-semibold text-white mb-4 text-sm flex items-center gap-2"><BarChart2 size={16} className="text-uceva-400" /> Distribución de Riesgo</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Riesgo Alto', count: stats.high, color: 'bg-red-500', pct: (stats.high / stats.total * 100).toFixed(0) },
                      { label: 'Riesgo Medio', count: stats.medium, color: 'bg-orange-500', pct: (stats.medium / stats.total * 100).toFixed(0) },
                      { label: 'Riesgo Bajo', count: stats.low, color: 'bg-uceva-500', pct: (stats.low / stats.total * 100).toFixed(0) },
                    ].map(row => (
                      <div key={row.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{row.label}</span>
                          <span className="text-gray-300 font-medium">{row.count} ({row.pct}%)</span>
                        </div>
                        <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${row.color} transition-all duration-700`} style={{ width: `${row.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Top risk programs */}
                <div className="card p-5">
                  <h3 className="font-semibold text-white mb-4 text-sm flex items-center gap-2"><AlertTriangle size={16} className="text-red-400" /> Estudiantes de Alto Riesgo</h3>
                  <div className="space-y-2">
                    {filteredStudents.filter(s => s.riskLevel === 'high').map(s => (
                      <div key={s.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-3 py-2.5 hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => { setSelectedStudent(s); }}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-uceva-800 to-uceva-950 flex items-center justify-center text-uceva-300 text-xs font-bold">{s.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-200 font-medium truncate">{s.name}</p>
                          <p className="text-xs text-gray-500 truncate">{s.program}</p>
                        </div>
                        <span className="text-sm font-bold text-red-400">{s.riskIndex}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Average risk by program */}
                <div className="card p-5 lg:col-span-2">
                  <h3 className="font-semibold text-white mb-4 text-sm flex items-center gap-2"><TrendingUp size={16} className="text-orange-400" /> Riesgo Promedio por Programa</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(
                      filteredStudents.reduce((acc, s) => {
                        if (!acc[s.program]) acc[s.program] = [];
                        acc[s.program].push(s.riskIndex);
                        return acc;
                      }, {})
                    ).map(([prog, indices]) => {
                      const avg = Math.round(indices.reduce((a, b) => a + b, 0) / indices.length);
                      const color = avg >= 60 ? 'bg-red-500' : avg >= 35 ? 'bg-orange-500' : 'bg-uceva-500';
                      return (
                        <div key={prog} className="bg-gray-800/40 rounded-xl px-4 py-3">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-gray-300 font-medium truncate pr-2">{prog}</span>
                            <span className="text-gray-400 flex-shrink-0">{avg}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${avg}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'users' && user?.role === 'admin' && <UserManagement />}
          {activeView === 'factors' && ['admin', 'coordinator'].includes(user?.role) && <FactorsManagement />}
        </main>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeStudentModal}
          id="student-modal-overlay"
        >
          <div
            className="glass-card w-full max-w-lg max-h-[95vh] overflow-y-auto custom-scrollbar animate-slide-up"
            onClick={e => e.stopPropagation()}
            id="student-modal"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-uceva-700 to-uceva-900 flex items-center justify-center text-white font-bold shadow-xl border border-uceva-700/30">
                    {selectedStudent.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedStudent.name}</h3>
                    <p className="text-uceva-400 text-sm">{selectedStudent.program}</p>
                    <p className="text-gray-500 text-xs">{selectedStudent.email}</p>
                  </div>
                </div>
                <button id="close-modal" onClick={closeStudentModal} className="p-2 rounded-xl hover:bg-gray-800 text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Semestre', value: `${selectedStudent.semester}°` },
                  { label: 'Promedio', value: selectedStudent.gpa.toFixed(1) },
                  { label: 'Ausencias', value: selectedStudent.absences },
                ].map(item => (
                  <div key={item.label} className="bg-gray-800/60 rounded-xl px-4 py-3 text-center">
                    <p className="text-xl font-bold text-white">{item.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Asignación de Tutor */}
              <div className="mb-5 bg-gray-800/40 rounded-xl p-4 border border-gray-800/60">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Shield size={16} className="text-uceva-400" />
                    Tutor Designado
                  </label>
                </div>
                {['admin', 'coordinator'].includes(user?.role) ? (
                  <div className="flex gap-2">
                    <select 
                      value={pendingTutorId !== null ? pendingTutorId : (selectedStudent.tutorId || '')} 
                      onChange={e => setPendingTutorId(e.target.value)}
                      className="input-field w-full text-sm py-2"
                    >
                      <option value="">-- Sin asignar --</option>
                      {tutors.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (Tutor)</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleAssignTutor}
                      className="btn-primary whitespace-nowrap !w-auto px-5"
                    >
                      Asignar
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-900/50 rounded-lg p-2.5 border border-gray-800">
                    <p className="text-sm text-gray-300">
                      {selectedStudent.tutorId 
                        ? (tutors.find(t => t.id === selectedStudent.tutorId)?.name || 'Tutor ID: ' + selectedStudent.tutorId)
                        : <span className="text-gray-500 italic">No tiene un tutor asignado actualmente</span>}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400 font-medium">Índice de Riesgo IA</span>
                  <span className="font-bold text-white">{selectedStudent.riskIndex}%</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${selectedStudent.riskLevel === 'high' ? 'bg-gradient-to-r from-red-600 to-red-400' : selectedStudent.riskLevel === 'medium' ? 'bg-gradient-to-r from-orange-600 to-orange-400' : 'bg-gradient-to-r from-uceva-700 to-uceva-400'}`}
                    style={{ width: `${selectedStudent.riskIndex}%` }}
                  />
                </div>
              </div>

              {selectedStudent.alerts.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Alertas detectadas</p>
                  <div className="space-y-2">
                    {selectedStudent.alerts.map((alert, i) => (
                      <div key={i} className="flex items-start gap-2.5 bg-red-900/15 border border-red-800/30 rounded-xl px-3 py-2.5">
                        <AlertTriangle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{alert}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedStudent.alerts.length === 0 && (
                <div className="flex items-center gap-2.5 bg-uceva-900/20 border border-uceva-800/30 rounded-xl px-3 py-3">
                  <div className="w-5 h-5 rounded-full bg-uceva-500/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-uceva-400" />
                  </div>
                  <p className="text-sm text-uceva-300">Sin alertas activas — Estudiante estable</p>
                </div>
              )}

              {/* Checklist de Factores */}
              <FactorsChecklist 
                factors={allFactors} 
                studentFactorIds={studentFactorsIds} 
                onSave={async (ids) => {
                  try {
                    await saveStudentFactors(selectedStudent.id, ids);
                    setStudentFactorsIds(ids);
                  } catch (e) {
                    console.error('Error al guardar factores:', e);
                    throw e; // Rethrow so the component can revert the UI state
                  }
                }} 
              />

              {/* AI Recommendations Section */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                {!recommendations.length && !analyzing && (
                  <button
                    onClick={() => handleAnalyzeAI(selectedStudent.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-uceva-700 to-uceva-800 hover:from-uceva-600 hover:to-uceva-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-uceva-900/30 group"
                  >
                    <Sparkles size={18} className="group-hover:animate-pulse" />
                    Generar Recomendaciones IA
                  </button>
                )}

                {analyzing && (
                  <div className="py-8 text-center bg-gray-800/20 rounded-2xl border border-dashed border-uceva-800/40">
                    <div className="relative w-12 h-12 mx-auto mb-3">
                      <div className="absolute inset-0 rounded-full border-2 border-uceva-500/20 border-t-uceva-500 animate-spin" />
                      <Sparkles size={20} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-uceva-400 animate-pulse" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">Analizando factores de riesgo...</p>
                    <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">Motor EduAlert v2.0</p>
                  </div>
                )}

                {recommendations.length > 0 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1 px-2 rounded-md bg-uceva-900/50 text-uceva-400 border border-uceva-800/40 text-[10px] font-bold uppercase tracking-wider">
                        Estrategia IA
                      </div>
                      <h4 className="text-sm font-bold text-white">Intervenciones Sugeridas</h4>
                    </div>
                    <div className="space-y-3">
                      {recommendations.map((rec) => {
                        const IconMap = {
                          BookOpen, PhoneCall, Handshake, Users, AlertTriangle, Award, ClipboardCheck
                        };
                        const Icon = IconMap[rec.icon] || Sparkles;
                        return (
                          <div key={rec.id} className="flex gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-800">
                            <div className={`p-2 rounded-lg bg-gray-900 flex-shrink-0 ${rec.priority === 'high' ? 'text-red-400' : rec.priority === 'medium' ? 'text-orange-400' : 'text-uceva-400'}`}>
                              <Icon size={16} />
                            </div>
                            <div>
                              <p className="text-sm text-gray-200 leading-snug">{rec.text}</p>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${rec.priority === 'high' ? 'bg-red-500' : rec.priority === 'medium' ? 'bg-orange-500' : 'bg-uceva-500'}`} />
                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Prioridad {rec.priority === 'high' ? 'Crítica' : rec.priority === 'medium' ? 'Media' : 'Estándar'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
