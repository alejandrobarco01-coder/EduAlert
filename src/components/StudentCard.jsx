import { AlertTriangle, TrendingDown, CheckCircle } from 'lucide-react';

const riskConfig = {
  low: {
    label: 'Riesgo Bajo',
    className: 'badge-low',
    icon: CheckCircle,
    bar: 'bg-uceva-500',
  },
  medium: {
    label: 'Riesgo Medio',
    className: 'badge-medium',
    icon: AlertTriangle,
    bar: 'bg-orange-500',
  },
  high: {
    label: 'Riesgo Alto',
    className: 'badge-high',
    icon: TrendingDown,
    bar: 'bg-red-500',
  },
};

export default function StudentCard({ student, onClick }) {
  const cfg = riskConfig[student.riskLevel] || riskConfig.low;
  const Icon = cfg.icon;

  return (
    <div
      onClick={() => onClick && onClick(student)}
      className="card p-5 cursor-pointer hover:border-gray-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in group"
      id={`student-card-${student.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-uceva-700 to-uceva-900 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-uceva-950/50 group-hover:scale-105 transition-transform duration-200">
            {student.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm leading-tight">{student.name}</h3>
            <p className="text-gray-500 text-xs mt-0.5">{student.email}</p>
          </div>
        </div>
        <span className={cfg.className}>
          <Icon size={11} />
          {cfg.label}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-gray-800/60 rounded-lg px-3 py-2">
          <p className="text-gray-500 mb-0.5">Programa</p>
          <p className="text-gray-200 font-medium truncate">{student.program}</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg px-3 py-2">
          <p className="text-gray-500 mb-0.5">Semestre</p>
          <p className="text-gray-200 font-medium">{student.semester}°</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg px-3 py-2">
          <p className="text-gray-500 mb-0.5">Promedio</p>
          <p className="text-gray-200 font-medium">{student.gpa.toFixed(1)}</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg px-3 py-2">
          <p className="text-gray-500 mb-0.5">Ausencias</p>
          <p className="text-gray-200 font-medium">{student.absences}</p>
        </div>
      </div>

      {/* Risk bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-500">Índice de Riesgo IA</span>
          <span className="text-xs font-bold text-gray-200">{student.riskIndex}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
            style={{ width: `${student.riskIndex}%` }}
          />
        </div>
      </div>

      {/* Alerts */}
      {student.alerts.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {student.alerts.slice(0, 2).map((alert, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
              {alert}
            </span>
          ))}
          {student.alerts.length > 2 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">
              +{student.alerts.length - 2} más
            </span>
          )}
        </div>
      )}
    </div>
  );
}
