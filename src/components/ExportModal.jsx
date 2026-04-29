/**
 * ExportModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal de selección de filtros y formato para exportar datos de estudiantes.
 * Solo accesible para roles admin y coordinator.
 *
 * Criterios de aceptación:
 *  ✓ El botón no aparece si el usuario tiene rol tutor o estudiante.
 *  ✓ El botón está en la barra de acciones de la lista, no dentro de la tabla.
 *  ✓ El botón está deshabilitado con tooltip si no hay estudiantes registrados.
 */

import { useState } from 'react';
import {
  X, Download, FileText, Users, Filter,
  CheckCircle,
} from 'lucide-react';
import { exportStudentsToCSV } from '../utils/csvExport';

// ─── Opciones de formato disponibles ─────────────────────────────────────────
const FORMATS = [
  {
    id: 'csv',
    label: 'CSV',
    desc: 'Compatible con Excel, Google Sheets y cualquier hoja de cálculo.',
    icon: FileText,
    available: true,
  },
  {
    id: 'xlsx',
    label: 'Excel (XLSX)',
    desc: 'Próximamente disponible.',
    icon: FileText,
    available: false,
  },
];

/**
 * @param {Object}   props
 * @param {boolean}  props.isOpen          - Controla visibilidad del modal
 * @param {Function} props.onClose         - Cierra el modal
 * @param {Object[]} props.allStudents     - Todos los estudiantes sin filtro
 * @param {Object[]} props.filteredStudents- Estudiantes ya filtrados en el dashboard
 * @param {Object[]} props.tutors          - Lista de tutores para resolución de nombres
 * @param {Object}   props.activeFilters   - Filtros activos actuales (para mostrar en UI)
 */
export default function ExportModal({
  isOpen,
  onClose,
  allStudents = [],
  filteredStudents = [],
  tutors = [],
  activeFilters = {},
}) {
  const [scope, setScope]   = useState('filtered'); // 'filtered' | 'all'
  const [format, setFormat] = useState('csv');
  const [exported, setExported] = useState(false);

  if (!isOpen) return null;

  const studentsToExport = scope === 'all' ? allStudents : filteredStudents;
  const hasFilters = Object.values(activeFilters).some(v => v && v !== 'Todos');

  const handleExport = () => {
    if (format === 'csv') {
      exportStudentsToCSV(studentsToExport, tutors);
      setExported(true);
      setTimeout(() => {
        setExported(false);
        onClose();
      }, 1200);
    }
  };

  const handleClose = () => {
    setExported(false);
    setScope('filtered');
    setFormat('csv');
    onClose();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl animate-fade-in overflow-hidden">

        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-gray-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-900/40 flex-shrink-0">
              <Download size={22} className="text-white" />
            </div>
            <div>
              <h2 id="export-modal-title" className="text-lg font-black text-white tracking-tight">
                Exportar Datos
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Selecciona el alcance y el formato de exportación.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            id="export-modal-close"
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-6">

          {/* ── Sección: Alcance ──────────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users size={12} /> Estudiantes a exportar
            </p>
            <div className="grid grid-cols-2 gap-3">

              {/* Filtrados */}
              <button
                id="export-scope-filtered"
                type="button"
                onClick={() => setScope('filtered')}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  scope === 'filtered'
                    ? 'bg-emerald-900/30 border-emerald-500/60 shadow-[0_0_16px_rgba(16,185,129,0.15)]'
                    : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Filter size={14} className={scope === 'filtered' ? 'text-emerald-400' : 'text-gray-600'} />
                  {scope === 'filtered' && <CheckCircle size={14} className="text-emerald-400" />}
                </div>
                <p className={`text-sm font-bold ${scope === 'filtered' ? 'text-white' : 'text-gray-400'}`}>
                  Vista filtrada
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {filteredStudents.length} estudiante{filteredStudents.length !== 1 ? 's' : ''}
                  {hasFilters ? ' (con filtros)' : ''}
                </p>
              </button>

              {/* Todos */}
              <button
                id="export-scope-all"
                type="button"
                onClick={() => setScope('all')}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  scope === 'all'
                    ? 'bg-emerald-900/30 border-emerald-500/60 shadow-[0_0_16px_rgba(16,185,129,0.15)]'
                    : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Users size={14} className={scope === 'all' ? 'text-emerald-400' : 'text-gray-600'} />
                  {scope === 'all' && <CheckCircle size={14} className="text-emerald-400" />}
                </div>
                <p className={`text-sm font-bold ${scope === 'all' ? 'text-white' : 'text-gray-400'}`}>
                  Todos
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {allStudents.length} estudiante{allStudents.length !== 1 ? 's' : ''} en total
                </p>
              </button>

            </div>
          </div>

          {/* ── Sección: Formato ──────────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FileText size={12} /> Formato de archivo
            </p>
            <div className="space-y-2">
              {FORMATS.map(f => (
                <button
                  key={f.id}
                  id={`export-format-${f.id}`}
                  type="button"
                  disabled={!f.available}
                  onClick={() => f.available && setFormat(f.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all duration-200 text-left
                    ${!f.available
                      ? 'opacity-40 cursor-not-allowed bg-gray-950/40 border-gray-800'
                      : format === f.id
                        ? 'bg-emerald-900/20 border-emerald-500/50'
                        : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <f.icon size={16} className={format === f.id && f.available ? 'text-emerald-400' : 'text-gray-600'} />
                    <div>
                      <p className={`text-sm font-bold ${format === f.id && f.available ? 'text-white' : 'text-gray-400'}`}>
                        {f.label}
                        {!f.available && <span className="ml-2 text-[10px] text-gray-600 font-medium normal-case">Próximamente</span>}
                      </p>
                      <p className="text-[11px] text-gray-600">{f.desc}</p>
                    </div>
                  </div>
                  {format === f.id && f.available && <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* ── Info de columnas ─────────────────────────────────────────── */}
          <div className="bg-gray-800/30 border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              Columnas incluidas
            </p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Nombre · Código · Programa · Semestre · Nivel de riesgo ·
              Factores activos · Tutor asignado · Última intervención · Fecha de registro
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-800 flex items-center justify-between gap-3 bg-gray-950/40">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            id="btn-confirmar-exportar"
            onClick={handleExport}
            disabled={studentsToExport.length === 0 || exported}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300
              ${exported
                ? 'bg-emerald-700 text-white cursor-default'
                : studentsToExport.length === 0
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 hover:-translate-y-0.5 active:translate-y-0'
              }`}
          >
            {exported
              ? <><CheckCircle size={16} /> ¡Descargado!</>
              : <><Download size={16} /> Descargar {studentsToExport.length > 0 ? `(${studentsToExport.length})` : ''}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
