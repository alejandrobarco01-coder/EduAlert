import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, AlertTriangle, TrendingUp, LogOut, Bell,
  LayoutDashboard, Shield, ChevronRight, X, GraduationCap,
  BarChart2, Search, Menu, Calendar, Loader2, Sparkles,
  PhoneCall, Handshake, Award, ClipboardCheck, Sliders
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
  fetchRiskHistory
} from '../services/api';

import StudentCard from '../components/StudentCard';
import FilterPanel from '../components/FilterPanel';
import UserManagement from '../components/UserManagement';
import FactorsManagement from '../components/FactorsManagement';
import FactorsChecklist from '../components/FactorsChecklist';

import InterventionForm from '../components/InterventionForm';
import InterventionHistory from '../components/InterventionHistory';
import StudentInterventions from '../components/StudentInterventions';
import StudentRiskHistory from '../components/StudentRiskHistory';
import RiskHistoryChart from '../components/RiskHistoryChart';
import RiskRulesManagement from '../components/RiskRulesManagement';

const DEFAULT_FILTERS = { program: 'Todos', semester: 'Todos', riskLevel: 'Todos' };
const roleLabel = { admin: 'Administrador', tutor: 'Tutor', coordinator: 'Coordinador' };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('students');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
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

  const [interventions, setInterventions] = useState([]);
  const [loadingInterventions, setLoadingInterventions] = useState(false);

  const [riskHistory, setRiskHistory] = useState([]);
  const [riskHistoryLoading, setRiskHistoryLoading] = useState(true);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'coordinator') {
      fetchTutors().then(setTutors).catch(console.error);
    }

    fetchFactors().then(setAllFactors).catch(console.error);

    setRiskHistoryLoading(true);
    fetchRiskHistory(6)
      .then(setRiskHistory)
      .catch(console.error)
      .finally(() => setRiskHistoryLoading(false));
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      setLoadingInterventions(true);

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
    }
  }, [selectedStudent]);

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
      alert('Tutor asignado');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyzeAI = async (id) => {
    setAnalyzing(true);
    setRecommendations([]);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const data = await fetchAIRecommendations(id);
      setRecommendations(data);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveIntervention = async (data) => {
    const newI = await saveIntervention(selectedStudent.id, data);
    setInterventions(prev => [newI, ...prev]);
  };

  const { students, stats, loading, refetch } = useStudents(filters, globalSearch);

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-4">
        <h2 className="text-white font-bold mb-4">EduAlert</h2>

        <button onClick={() => setActiveView('students')} className="text-white block mb-2">Estudiantes</button>
        <button onClick={() => setActiveView('analytics')} className="text-white block mb-2">Analíticas</button>

        {['admin','coordinator'].includes(user?.role) && (
          <button onClick={() => setActiveView('rules')} className="text-white block mb-2">Reglas</button>
        )}

        <button onClick={handleLogout} className="text-red-400 mt-4">Salir</button>
      </aside>

      {/* Main */}
      <div className="flex-1 p-6">

        <RiskHistoryChart data={riskHistory} loading={riskHistoryLoading} />

        {students.map(s => (
          <div key={s.id} onClick={() => setSelectedStudent(s)} className="p-3 bg-gray-800 text-white mb-2 cursor-pointer">
            {s.name} - {s.riskIndex}%
          </div>
        ))}

        {/* Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
            <div className="bg-gray-900 p-6 w-[500px]">

              <h2 className="text-white">{selectedStudent.name}</h2>

              {/* Tutor */}
              <select onChange={e => setPendingTutorId(e.target.value)}>
                <option value="">Sin tutor</option>
                {tutors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <button onClick={handleAssignTutor}>Asignar</button>

              {/* Factores */}
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

              {/* Intervenciones */}
              <InterventionForm
                studentId={selectedStudent.id}
                onSave={handleSaveIntervention}
              />

              {loadingInterventions
                ? <Loader2 className="animate-spin" />
                : <InterventionHistory interventions={interventions} />
              }

              {/* Sistema nuevo */}
              <StudentInterventions
                studentId={selectedStudent.id}
                onInterventionAdded={() => {
                  setHistoryRefreshKey(k => k + 1);
                  refetch();
                }}
              />

              <StudentRiskHistory
                studentId={selectedStudent.id}
                refreshTrigger={historyRefreshKey}
              />

              {/* IA */}
              <button onClick={() => handleAnalyzeAI(selectedStudent.id)}>
                Generar IA
              </button>

              {recommendations.map(r => (
                <div key={r.id} className="text-white">{r.text}</div>
              ))}

              <button onClick={() => setSelectedStudent(null)}>Cerrar</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}