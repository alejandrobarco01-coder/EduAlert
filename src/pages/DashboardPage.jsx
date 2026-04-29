import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, AlertTriangle, TrendingUp, LogOut, Bell,
  LayoutDashboard, Shield, ChevronRight, X, GraduationCap,
  BarChart2, Search, Menu, Calendar, Loader2, Sparkles,
  PhoneCall, Handshake, Award, ClipboardCheck, Sliders,
  UserCheck, History, BrainCircuit, Settings, Mail, UserPlus,
  Download,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useStudents } from '../hooks/useStudents';

import {
  fetchAIRecommendations,
  fetchTutors,
  assignTutorAPI,
  fetchFactors,
  fetchStudentFactors,
  saveStudentFactors,
  fetchInterventions,
  saveIntervention,
  fetchRiskHistory,
  previewNotification,
  sendNotificationAPI
} from '../services/api';

import { exportStudentsToCSV } from '../utils/csvExport';

import StudentCard from '../components/StudentCard';
import FilterPanel from '../components/FilterPanel';
import UserManagement from '../components/UserManagement';
import FactorsManagement from '../components/FactorsManagement';
import FactorsChecklist from '../components/FactorsChecklist';

import InterventionForm from '../components/InterventionForm';
import InterventionHistory from '../components/InterventionHistory';
import StudentInterventions from '../components/StudentInterventions';
import NotificationPreview from '../components/NotificationPreview';
import StudentRiskHistory from '../components/StudentRiskHistory';
import RiskHistoryChart from '../components/RiskHistoryChart';
import RiskRulesManagement from '../components/RiskRulesManagement';
import AddStudentModal from '../components/AddStudentModal';

const DEFAULT_FILTERS = { program: 'Todos', semester: 'Todos', riskLevel: 'Todos' };
const roleLabel = { admin: 'Administrador', tutor: 'Tutor', coordinator: 'Coordinador' };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('students');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [globalSearch, setGlobalSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const [tutors, setTutors] = useState([]);
  const [pendingTutorId, setPendingTutorId] = useState(null);

  const [allFactors, setAllFactors] = useState([]);
  const [studentFactorsIds, setStudentFactorsIds] = useState([]);

  const [interventions, setInterventions] = useState([]);
  const [loadingInterventions, setLoadingInterventions] = useState(false);

  const [riskHistory, setRiskHistory] = useState([]);
  const [riskHistoryLoading, setRiskHistoryLoading] = useState(true);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [activeModalTab, setActiveModalTab] = useState('factors');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    // 1. Fetch data only if user role allows it
    if (['admin', 'coordinator'].includes(user?.role)) {
      fetchTutors().then(setTutors).catch(err => console.error('  ❌ Tutors fetch error (403?):', err));

      setRiskHistoryLoading(true);
      fetchRiskHistory(6)
        .then(records => {
          if (!Array.isArray(records) || records.length === 0) {
            setRiskHistory([]);
            return;
          }

          // The backend already returns an array of aggregated month objects:
          // [{ month: "Mar 2026", avgRisk: 45, highCount: 2, ... }]
          // We just need to ensure the format is consistent.
          setRiskHistory(records);
        })
        .catch(err => {
          console.error('  ❌ Global Risk History fetch error:', err);
          setRiskHistory([]);
        })
        .finally(() => setRiskHistoryLoading(false));
    } else {
      setRiskHistoryLoading(false);
      setRiskHistory([]);
    }

    fetchFactors()
      .then(setAllFactors)
      .catch(err => console.error('  ❌ Factors fetch error:', err));
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      setLoadingInterventions(true);
      setActiveModalTab('factors');
      setPendingTutorId(null);

      fetchStudentFactors(selectedStudent.id)
        .then(f => setStudentFactorsIds(f.map(x => x.id)))
        .catch(console.error);

      fetchInterventions(selectedStudent.id)
        .then(setInterventions)
        .catch(console.error)
        .finally(() => setLoadingInterventions(false));
    } else {
      setStudentFactorsIds([]);
      setInterventions([]);
      setRecommendations([]);
    }
  }, [selectedStudent]);

  const { students, stats, loading, refetch } = useStudents(filters, globalSearch);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAssignTutor = async () => {
    try {
      const tutorToAssign = pendingTutorId ?? selectedStudent.tutorId;
      await assignTutorAPI(selectedStudent.id, tutorToAssign);
      setSelectedStudent(prev => ({ ...prev, tutorId: tutorToAssign }));
      setPendingTutorId(null);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyzeAI = async (id) => {
    setAnalyzing(true);
    setRecommendations([]);
    try {
      const data = await fetchAIRecommendations(id);
      setRecommendations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveIntervention = async (data) => {
    const newI = await saveIntervention(selectedStudent.id, data);
    setInterventions(prev => [newI, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex font-sans text-gray-200 selection:bg-uceva-700/40">
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Brand/Logo */}
          <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-uceva-600 to-uceva-800 rounded-2xl flex items-center justify-center shadow-lg shadow-uceva-900/40 flex-shrink-0 animate-pulse-slow">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase">EduAlert</h1>
              <p className="text-[10px] text-uceva-500 font-bold tracking-widest uppercase">UCEVA · Bienestar</p>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 scrollbar-hide overflow-y-auto">
            <div className="px-4 mb-4">
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-2">Principales</p>
            </div>

            <SidebarItem
              icon={<LayoutDashboard size={20} />}
              label="Tablero"
              active={activeView === 'students'}
              onClick={() => { setActiveView('students'); setSidebarOpen(false); }}
            />
            {['admin', 'coordinator'].includes(user?.role) && (
              <SidebarItem
                icon={<BarChart2 size={20} />}
                label="Analíticas"
                active={activeView === 'analytics'}
                onClick={() => { setActiveView('analytics'); setSidebarOpen(false); }}
              />
            )}

            <div className="px-4 mt-8 mb-4">
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-2">Administración</p>
            </div>

            {['admin', 'coordinator'].includes(user?.role) && (
              <SidebarItem
                icon={<Shield size={20} />}
                label="Gestión Usuarios"
                active={activeView === 'users'}
                onClick={() => { setActiveView('users'); setSidebarOpen(false); }}
              />
            )}
            {['admin', 'coordinator'].includes(user?.role) && (
              <SidebarItem
                icon={<Sliders size={20} />}
                label="Reglas de Riesgo"
                active={activeView === 'rules'}
                onClick={() => { setActiveView('rules'); setSidebarOpen(false); }}
              />
            )}
            <SidebarItem
              icon={<Settings size={20} />}
              label="Configuración"
              active={activeView === 'settings'}
              onClick={() => { setActiveView('settings'); setSidebarOpen(false); }}
            />
          </nav>

          {/* User Profile Mini Button */}
          <div className="p-6 mt-auto border-t border-gray-800">
            <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-2xl border border-gray-800 group hover:border-gray-700 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-uceva-900/60 border border-uceva-800/50 flex items-center justify-center text-uceva-400 font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Usuario'}</p>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">{roleLabel[user?.role] || 'Bienestar'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                title="Cerrar Sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Header/Top Bar */}
        <header className="sticky top-0 z-40 h-20 bg-gray-950/80 backdrop-blur-xl border-b border-gray-900 px-6 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {activeView === 'students' && 'Gestión de Estudiantes'}
              {activeView === 'analytics' && 'Métricas e Historial'}
              {activeView === 'users' && 'Gestión de Usuarios'}
              {activeView === 'rules' && 'Parámetros de Riesgo'}
              {activeView === 'settings' && 'Centro de Configuración'}
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-uceva-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Buscar estudiante..."
                className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-uceva-600 focus:border-transparent transition-all w-64"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>

            <div className="h-8 w-px bg-gray-800 mx-2"></div>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 transition-colors ${showNotifications ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Bell size={20} />
                {hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-950 animate-pulse"></span>}
              </button>

              {showNotifications && (
                <div className="absolute top-full mt-4 right-0 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in origin-top-right">
                  <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bell size={16} className="text-transparent bg-clip-text bg-gradient-to-r from-uceva-400 to-red-500" />
                      Notificaciones
                    </h3>
                    {hasUnread && <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold shadow-sm">Nuevas</span>}
                  </div>
                  <div className="divide-y divide-gray-800 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <div className={`p-4 hover:bg-gray-800/80 transition-colors cursor-pointer group ${hasUnread ? 'bg-gray-900/40' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${hasUnread ? 'bg-red-500' : 'bg-gray-600'}`}></div>
                        <div>
                          <p className={`text-xs font-medium leading-relaxed ${hasUnread ? 'text-gray-300 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                            Alerta del sistema: <span className={`${hasUnread ? 'text-red-400' : 'text-gray-400'} font-bold`}>1 estudiante</span> elevó su nivel de riesgo a crítico tras la última evaluación.
                          </p>
                          <p className="text-[10px] text-gray-500 mt-2 font-semibold">Hace 5 minutos</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-gray-800/80 transition-colors cursor-pointer group">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-gray-600 flex-shrink-0"></div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium group-hover:text-gray-300 leading-relaxed">
                            Las reglas del motor de riesgo fueron actualizadas correctamente por un administrador.
                          </p>
                          <p className="text-[10px] text-gray-600 mt-2 font-semibold">Hace 2 horas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-800 bg-gray-950/50 text-center flex justify-between px-4">
                    <button
                      onClick={() => setHasUnread(false)}
                      disabled={!hasUnread}
                      className={`text-[10px] font-bold transition-colors ${hasUnread ? 'text-uceva-400 hover:text-white' : 'text-gray-600 cursor-default'}`}
                    >
                      {hasUnread ? 'Marcar leídas' : 'Todo leído'}
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-gray-500 hover:text-gray-300 font-bold transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-10">

            {/* Dynamic Content Views */}
            {activeView === 'students' && (
              <>
                {/* Stats Dashboard Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in">
                  <StatBox
                    icon={<Users className="text-uceva-400" size={20} />}
                    label="Población Total"
                    value={stats.total}
                    subLabel="Estudiantes en sistema"
                  />
                  <StatBox
                    icon={<AlertTriangle className="text-red-400" size={20} />}
                    label="Riesgo Crítico"
                    value={stats.high}
                    subLabel={`${((stats.high / (stats.total || 1)) * 100).toFixed(1)}% de la población`}
                    trend="high"
                  />
                  <StatBox
                    icon={<TrendingUp className="text-orange-400" size={20} />}
                    label="Riesgo Moderado"
                    value={stats.medium}
                    subLabel="Seguimiento preventivo"
                  />
                  <StatBox
                    icon={<UserCheck className="text-blue-400" size={20} />}
                    label="Bajo Riesgo"
                    value={stats.low}
                    subLabel="Rendimiento óptimo"
                  />
                </div>

                {/* Unified Filter Dashboard */}
                <div className="space-y-6 animate-fade-in delay-100">
                  <div className="card p-1 bg-gray-900/40 backdrop-blur-md border border-gray-800 shadow-2xl relative overflow-hidden group">
                    {/* Decorative background element */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-uceva-600/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8 border-b border-gray-800/50 pb-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-gradient-to-br from-uceva-600 to-uceva-700 rounded-2xl flex items-center justify-center shadow-lg shadow-uceva-900/40">
                            <Sliders size={24} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Filtros Inteligentes</h2>
                            <p className="text-sm text-gray-500 font-medium max-w-sm">Segmentación avanzada de la población estudiantil basada en factores académicos y de riesgo.</p>
                          </div>
                        </div>

                        <div className="bg-gray-950 p-2 rounded-2xl border border-gray-800 shadow-inner flex items-center gap-2 flex-wrap">
                          {['admin', 'coordinator'].includes(user?.role) && (
                            <button
                              onClick={() => setIsAddModalOpen(true)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-uceva-600 to-uceva-700 hover:from-uceva-500 hover:to-uceva-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-uceva-900/20 active:scale-95 group"
                            >
                              <UserPlus size={16} className="group-hover:rotate-12 transition-transform" />
                              Agregar Estudiante
                            </button>
                          )}

                          {/* ✓ Criterio: CSV generado en cliente, sin llamadas adicionales al backend */}
                          <button
                            id="btn-exportar-csv"
                            onClick={() => exportStudentsToCSV(students, tutors)}
                            disabled={!students || students.length === 0}
                            title={`Exportar ${students?.length ?? 0} estudiantes a CSV`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-emerald-900/40 text-gray-400 hover:text-emerald-300 rounded-xl text-sm font-bold transition-all shadow-sm border border-gray-800/50 hover:border-emerald-700/50 group disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                            Exportar CSV
                          </button>

                          <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl text-sm font-bold transition-all shadow-sm border border-gray-800/50 group"
                          >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} className="group-hover:scale-110 transition-transform" />}
                            Actualizar Datos
                          </button>
                        </div>
                      </div>

                      <FilterPanel
                        filters={filters}
                        onChange={(field, value) => setFilters(prev => ({ ...prev, [field]: value }))}
                        onReset={() => setFilters(DEFAULT_FILTERS)}
                        resultCount={students?.length || 0}
                      />
                    </div>
                  </div>
                </div>

                {/* Section Divider */}
                <div className="flex items-center justify-between mb-8 mt-12">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-1 bg-gradient-to-r from-uceva-600 to-transparent rounded-full font-black"></div>
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Listado General de Expedientes</h3>
                  </div>
                  <div className="px-4 py-1.5 bg-gray-900/50 rounded-full border border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {(students?.length || 0)} Resultados encontrados
                  </div>
                </div>

                {/* Students Grid */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 bg-gray-950/50 rounded-3xl border border-gray-900 border-dashed animate-pulse">
                    <Loader2 className="animate-spin text-uceva-500 mb-4" size={40} />
                    <p className="text-gray-500 font-medium tracking-wide">Analizando índices de deserción...</p>
                  </div>
                ) : (students && students.length > 0) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-result-in">
                    {students.map(student => (
                      <StudentCard
                        key={student.id}
                        student={student}
                        onClick={setSelectedStudent}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-950/50 rounded-3xl border border-gray-900 border-dashed">
                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-700">
                      <Search size={32} />
                    </div>
                    <h4 className="text-white font-bold mb-1">Sin coincidencias</h4>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">No hay estudiantes que cumplan con los criterios actuales. Intenta ajustar los filtros.</p>
                    <button
                      onClick={() => { setFilters(DEFAULT_FILTERS); setGlobalSearch(''); }}
                      className="mt-6 px-6 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-uceva-400 text-xs font-bold rounded-xl transition-all"
                    >
                      Limpiar Panel de Filtros
                    </button>
                  </div>
                )}
              </>
            )}

            {activeView === 'analytics' && (
              <div className="space-y-10 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 card p-8 border-l-4 border-l-uceva-500 bg-gray-900/20">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BarChart2 size={24} className="text-uceva-400" />
                        Histórico Institucional de Riesgo
                      </h2>
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-widest bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-900">Actualizado hace 2m</div>
                    </div>
                    <RiskHistoryChart data={riskHistory} loading={riskHistoryLoading} />
                  </div>

                  <div className="space-y-8">
                    <div className="card p-8 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Shield size={120} />
                      </div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 relative z-10">Distribución de Alarmas</h3>
                      <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center bg-red-900/10 p-4 rounded-2xl border border-red-900/20 hover:bg-red-900/20 transition-colors">
                          <span className="text-sm text-red-300 font-bold">Riesgo Crítico</span>
                          <span className="text-2xl font-black text-red-400">{stats.high}</span>
                        </div>
                        <div className="flex justify-between items-center bg-orange-900/10 p-4 rounded-2xl border border-orange-900/20 hover:bg-orange-900/20 transition-colors">
                          <span className="text-sm text-orange-300 font-bold">Riesgo Moderado</span>
                          <span className="text-2xl font-black text-orange-400">{stats.medium}</span>
                        </div>
                        <div className="flex justify-between items-center bg-uceva-900/10 p-4 rounded-2xl border border-uceva-900/20 hover:bg-uceva-900/20 transition-colors">
                          <span className="text-sm text-uceva-300 font-bold">Zonas de Control</span>
                          <span className="text-2xl font-black text-uceva-400">{stats.low}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card p-8 border-l-4 border-l-blue-600 bg-gray-950">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Censo de Bienestar</h3>
                      <p className="text-4xl font-black text-white">{stats.total}</p>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed mt-2 italic">Representa el 100% de la población estudiantil bajo supervisión activa.</p>
                    </div>
                  </div>
                </div>

                {/* Simulated future metrics section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card p-5 bg-gray-900/50 border-dashed border-gray-800">
                    <p className="text-xs text-gray-600 italic">Próximamente: Mapa de calor por facultades y alertas tempranas predictivas...</p>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'settings' && (
              <div className="space-y-8 animate-fade-in p-2">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Profile Card */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="card p-8 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 shadow-2xl relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-uceva-600/10 rounded-full blur-2xl group-hover:bg-uceva-600/20 transition-all duration-700"></div>

                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-6">
                          <div className="w-24 h-24 rounded-full bg-uceva-600/20 border-2 border-uceva-600/30 flex items-center justify-center p-1.5 shadow-[0_0_40px_rgba(202,0,52,0.15)] group-hover:shadow-[0_0_60px_rgba(202,0,52,0.25)] transition-all">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                              alt="Profile"
                              className="w-full h-full rounded-full bg-gray-900 shadow-inner"
                            />
                          </div>
                          <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-gray-900 rounded-full shadow-lg"></div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-uceva-400 transition-colors uppercase tracking-tight">{user?.name}</h3>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 px-4 py-1.5 bg-gray-950 rounded-full border border-gray-800">{roleLabel[user?.role] || 'Bienestar'}</p>

                        <div className="w-full space-y-3 pt-6 border-t border-gray-800/50">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500 font-bold uppercase">Email</span>
                            <span className="text-gray-300">{user?.email}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500 font-bold uppercase">Estado Cuenta</span>
                            <span className="text-emerald-400 font-bold">Activa</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card p-6 bg-gray-900/40 border border-gray-800 space-y-4">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Seguridad</h4>
                      <button className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white rounded-xl transition-all">Cambiar Contraseña</button>
                    </div>
                  </div>

                  {/* Settings Main */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="card p-8 bg-gray-900/40 border border-gray-800">
                      <h3 className="text-lg font-bold text-white mb-6">Preferencias de Notificaciones</h3>
                      <div className="space-y-6">
                        {[
                          { label: 'Alertas por Email', desc: 'Recibe resúmenes semanales de riesgo.' },
                          { label: 'Notificaciones Críticas', desc: 'Alertas inmediatas cuando un estudiante entra en riesgo alto.' },
                          { label: 'Reportes de Tutoría', desc: 'Notificaciones sobre nuevas respuestas de tutores.' }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-gray-200">{item.label}</p>
                              <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <div className="w-10 h-5 bg-uceva-600 rounded-full relative">
                              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card p-8 border border-red-900/20 bg-red-900/5">
                      <h3 className="text-sm font-bold text-red-500 mb-2">Zona de Peligro</h3>
                      <button onClick={logout} className="px-6 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 text-xs font-bold rounded-xl transition-all">Cerrar Sesión Educativa</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'users' && (
              <UserManagement
                onUpdate={(newUser) => {
                  refetch();
                  if (newUser?.role === 'student') {
                    setActiveView('students');
                  }
                }}
              />
            )}
            {activeView === 'rules' && <RiskRulesManagement />}

          </div>
        </div>
      </main>

      {/* Detail Modal / Slideover */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedStudent(null)}></div>

          <div
            className="relative w-full max-w-2xl bg-gray-950 h-full shadow-2xl flex flex-col animate-slide-left border-l border-gray-800"
            id="student-detail-modal"
          >
            {/* Modal Header */}
            <header className="p-8 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-uceva-600 to-uceva-800 flex items-center justify-center text-white font-black text-2xl shadow-2xl ring-4 ring-gray-900 group">
                  {selectedStudent.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{selectedStudent.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-gray-500 font-medium">{selectedStudent.email}</p>
                    <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                    <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-gray-400 font-bold uppercase tracking-widest">{selectedStudent.program}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-3 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-2xl text-gray-400 hover:text-white transition-all shadow-xl active:scale-95"
                id="close-modal-btn"
              >
                <X size={24} />
              </button>
            </header>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-800 bg-gray-900/50 overflow-x-auto no-scrollbar">
              <ModalTab
                active={activeModalTab === 'factors'}
                onClick={() => setActiveModalTab('factors')}
                icon={<Shield size={16} />}
                label="Factores"
              />
              <ModalTab
                active={activeModalTab === 'interventions'}
                onClick={() => setActiveModalTab('interventions')}
                icon={<PhoneCall size={16} />}
                label="Intervenciones"
              />
              <ModalTab
                active={activeModalTab === 'history'}
                onClick={() => setActiveModalTab('history')}
                icon={<History size={16} />}
                label="Historial"
              />
              <ModalTab
                active={activeModalTab === 'ai'}
                onClick={() => setActiveModalTab('ai')}
                icon={<BrainCircuit size={16} />}
                label="IA"
              />
              <ModalTab
                active={activeModalTab === 'notification'}
                onClick={() => setActiveModalTab('notification')}
                icon={<Mail size={16} />}
                label="Notificación"
              />
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">

              {activeModalTab === 'factors' && (
                <div className="space-y-6">
                  {/* Tutor Assignment section if Admin */}
                  {(user?.role === 'admin' || user?.role === 'coordinator') && (
                    <div className="bg-gray-800/40 p-4 rounded-2xl border border-gray-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <UserCheck size={20} className="text-uceva-400" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Docente Tutor</p>
                          <select
                            value={pendingTutorId || selectedStudent.tutorId || ''}
                            onChange={(e) => setPendingTutorId(e.target.value)}
                            className="bg-transparent border-none p-0 text-sm font-semibold text-white focus:ring-0 cursor-pointer"
                          >
                            <option value="" className="bg-gray-900">Sin asignar</option>
                            {tutors.map(t => (
                              <option key={t.id} value={t.id} className="bg-gray-900">{t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {pendingTutorId && pendingTutorId !== selectedStudent.tutorId && (
                        <button
                          onClick={handleAssignTutor}
                          className="bg-uceva-700 hover:bg-uceva-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-semibold"
                        >
                          Actualizar
                        </button>
                      )}
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Shield size={16} /> Factores de Riesgo Activos
                    </h3>
                    <FactorsChecklist
                      factors={allFactors}
                      studentFactorIds={studentFactorsIds}
                      onSave={async (ids) => {
                        const res = await saveStudentFactors(selectedStudent.id, ids);
                        setStudentFactorsIds(ids);
                        if (res?.riskUpdate) {
                          setSelectedStudent(prev => ({
                            ...prev,
                            riskIndex: res.riskUpdate.riskValue,
                            riskLevel: res.riskUpdate.riskLevel
                          }));
                        }
                        setHistoryRefreshKey(k => k + 1);
                        refetch();
                      }}
                    />
                  </div>
                </div>
              )}

              {activeModalTab === 'interventions' && (
                <div className="space-y-4 animate-fade-in">
                  <StudentInterventions
                    studentId={selectedStudent.id}
                    onInterventionAdded={() => {
                      setHistoryRefreshKey(k => k + 1);
                      refetch();
                    }}
                  />
                </div>
              )}

              {activeModalTab === 'history' && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BrainCircuit size={16} /> Evolución del Índice de Riesgo
                  </h3>
                  <StudentRiskHistory
                    studentId={selectedStudent.id}
                    refreshTrigger={historyRefreshKey}
                  />
                  <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 italic">
                      Este historial registra cada cambio en los factores o intervenciones del estudiante, proporcionando una trazabilidad completa del impacto de las acciones institucionales.
                    </p>
                  </div>
                </div>
              )}

              {activeModalTab === 'ai' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-gradient-to-br from-violet-900/20 to-fuchsia-900/10 border border-violet-800/20 p-6 rounded-22 shadow-xl flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-violet-600 rounded-3xl flex items-center justify-center shadow-lg shadow-violet-900/50 mb-4 animate-pulse-slow">
                      <BrainCircuit size={36} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Recomendaciones de IA</h3>
                    <p className="text-sm text-gray-400 mb-6 max-w-sm">Genera una estrategia de mitigación personalizada basada en el perfil actual del estudiante.</p>

                    <button
                      onClick={() => handleAnalyzeAI(selectedStudent.id)}
                      disabled={analyzing}
                      className="btn-primary w-auto px-8 bg-violet-600 hover:bg-violet-500"
                    >
                      {analyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      {analyzing ? 'Procesando factores...' : 'Generar Recomendaciones'}
                    </button>
                  </div>

                  {recommendations.length > 0 && (
                    <div className="space-y-3 animate-result-in">
                      {recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3 bg-gray-900/60 p-4 rounded-xl border border-gray-800 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="w-6 h-6 rounded-lg bg-violet-900/40 flex items-center justify-center text-violet-400 flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{rec.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeModalTab === 'notification' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-uceva-900/40 border border-uceva-800/30 flex items-center justify-center">
                      <Mail size={16} className="text-uceva-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Plantilla de Notificación</h3>
                      <p className="text-[11px] text-gray-500">Correo generado dinámicamente con datos actuales del estudiante</p>
                    </div>
                  </div>
                  <NotificationPreview student={selectedStudent} />
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      {/* Add Student Modal */}
      {isAddModalOpen && (
        <AddStudentModal 
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`sidebar-item w-full ${active ? 'active' : ''}`}
    >
      {icon}
      <span>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-uceva-500 shadow-[0_0_8px_#10b981]"></div>}
    </button>
  );
}

function StatBox({ icon, label, value, subLabel, trend }) {
  return (
    <div className="card p-4 hover:border-gray-700 transition-colors group">
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {trend === 'high' && (
          <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full border border-red-800/30">Acción Requerida</span>
        )}
      </div>
      <h4 className="text-2xl font-bold text-white leading-none">{value}</h4>
      <p className="text-xs text-gray-300 font-medium mt-1">{label}</p>
      <p className="text-[10px] text-gray-500 mt-1">{subLabel}</p>
    </div>
  );
}

function ModalTab({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${active
        ? 'border-uceva-600 text-white bg-uceva-900/20'
        : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/40'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}