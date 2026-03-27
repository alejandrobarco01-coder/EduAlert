import { SlidersHorizontal, X } from 'lucide-react';
import { programs, semesters, riskLevels } from '../data/mockData';

const riskLabels = { Todos: 'Todos', low: 'Bajo', medium: 'Medio', high: 'Alto' };

export default function FilterPanel({ filters, onChange, onReset, resultCount }) {
  const hasActive = filters.program !== 'Todos' || filters.semester !== 'Todos' || filters.riskLevel !== 'Todos';

  return (
    <div className="card p-5 mb-6" id="filter-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-uceva-400" />
          <span className="text-sm font-semibold text-white">Filtros Pro</span>
          {hasActive && (
            <span className="text-xs bg-uceva-800/50 text-uceva-300 px-2 py-0.5 rounded-full border border-uceva-700/40">
              Activos
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{resultCount} estudiante{resultCount !== 1 ? 's' : ''}</span>
          {hasActive && (
            <button
              onClick={onReset}
              id="reset-filters-btn"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors duration-200"
            >
              <X size={13} /> Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Program */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Carrera</label>
          <select
            id="filter-program"
            value={filters.program}
            onChange={e => onChange('program', e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-uceva-600 cursor-pointer transition-all"
          >
            {programs.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Semestre</label>
          <select
            id="filter-semester"
            value={filters.semester}
            onChange={e => onChange('semester', e.target.value === 'Todos' ? 'Todos' : Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-uceva-600 cursor-pointer transition-all"
          >
            {semesters.map(s => <option key={s} value={s}>{s === 'Todos' ? 'Todos' : `${s}° Semestre`}</option>)}
          </select>
        </div>

        {/* Risk */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Nivel de Riesgo</label>
          <select
            id="filter-risk"
            value={filters.riskLevel}
            onChange={e => onChange('riskLevel', e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-uceva-600 cursor-pointer transition-all"
          >
            {riskLevels.map(r => (
              <option key={r} value={r}>{riskLabels[r]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {hasActive && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-800">
          {filters.program !== 'Todos' && (
            <span className="text-xs bg-uceva-900/50 text-uceva-300 border border-uceva-800/40 px-3 py-1 rounded-full flex items-center gap-1.5">
              {filters.program}
              <button onClick={() => onChange('program', 'Todos')} className="hover:text-red-400 transition-colors"><X size={11}/></button>
            </span>
          )}
          {filters.semester !== 'Todos' && (
            <span className="text-xs bg-uceva-900/50 text-uceva-300 border border-uceva-800/40 px-3 py-1 rounded-full flex items-center gap-1.5">
              Semestre {filters.semester}
              <button onClick={() => onChange('semester', 'Todos')} className="hover:text-red-400 transition-colors"><X size={11}/></button>
            </span>
          )}
          {filters.riskLevel !== 'Todos' && (
            <span className="text-xs bg-uceva-900/50 text-uceva-300 border border-uceva-800/40 px-3 py-1 rounded-full flex items-center gap-1.5">
              Riesgo {riskLabels[filters.riskLevel]}
              <button onClick={() => onChange('riskLevel', 'Todos')} className="hover:text-red-400 transition-colors"><X size={11}/></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
