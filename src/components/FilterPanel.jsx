import { SlidersHorizontal, X } from 'lucide-react';
import { programs, semesters, riskLevels } from '../data/mockData';

const riskLabels = { Todos: 'Todos', low: 'Bajo', medium: 'Medio', high: 'Alto' };

export default function FilterPanel({ filters, onChange, onReset, resultCount }) {
  const hasActive = filters.program !== 'Todos' || filters.semester !== 'Todos' || filters.riskLevel !== 'Todos';

  return (
    <div id="filter-panel">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Program */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-uceva-500"></div>
            Carrera
          </label>
          <select
            id="filter-program"
            value={filters.program}
            onChange={e => onChange('program', e.target.value)}
            className="w-full px-4 py-3 bg-gray-950 border border-gray-800 focus:border-uceva-600/50 rounded-xl text-gray-300 text-sm focus:outline-none focus:ring-4 focus:ring-uceva-600/10 cursor-pointer transition-all hover:bg-gray-900"
          >
            {programs.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Semester */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            Semestre
          </label>
          <select
            id="filter-semester"
            value={filters.semester}
            onChange={e => onChange('semester', e.target.value === 'Todos' ? 'Todos' : Number(e.target.value))}
            className="w-full px-4 py-3 bg-gray-950 border border-gray-800 focus:border-blue-600/50 rounded-xl text-gray-300 text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 cursor-pointer transition-all hover:bg-gray-900"
          >
            {semesters.map(s => <option key={s} value={s}>{s === 'Todos' ? 'Todos' : `${s}° Semestre`}</option>)}
          </select>
        </div>

        {/* Risk */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            Nivel de Riesgo
          </label>
          <select
            id="filter-risk"
            value={filters.riskLevel}
            onChange={e => onChange('riskLevel', e.target.value)}
            className="w-full px-4 py-3 bg-gray-950 border border-gray-800 focus:border-red-600/50 rounded-xl text-gray-300 text-sm focus:outline-none focus:ring-4 focus:ring-red-600/10 cursor-pointer transition-all hover:bg-gray-900"
          >
            {riskLevels.map(r => (
              <option key={r} value={r}>{riskLabels[r]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Footer Info / Reset */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800/50">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 font-medium italic">
            Mostrando <span className="text-white not-italic font-bold">{resultCount}</span> perfiles activos
          </span>
          {hasActive && (
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-uceva-600/10 text-uceva-400 border border-uceva-600/20">Filtros Activos</span>
            </div>
          )}
        </div>
        
        {hasActive && (
          <button
            onClick={onReset}
            className="group flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-400 transition-all uppercase tracking-wider"
          >
            <X size={14} className="group-hover:rotate-90 transition-transform" />
            Limpiar Filtros
          </button>
        )}
      </div>
    </div>
  );
}
