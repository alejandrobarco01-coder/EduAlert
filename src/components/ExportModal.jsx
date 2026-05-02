import { useState, useMemo } from 'react';
import { X, Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { exportStudentsToCSV, exportStudentsToXLSX } from '../utils/csvExport';

export default function ExportModal({ isOpen, onClose, students, tutors }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [riskLevel, setRiskLevel] = useState('Todos');
  const [program, setProgram] = useState('Todos');
  const [format, setFormat] = useState('CSV');

  // Extract unique programs dynamically from the student list
  const programs = useMemo(() => {
    const progs = new Set(students.map(s => s.program).filter(Boolean));
    return ['Todos', ...Array.from(progs)];
  }, [students]);

  const riskLevels = [
    { value: 'Todos', label: 'Todos' },
    { value: 'low', label: 'Bajo' },
    { value: 'medium', label: 'Medio' },
    { value: 'high', label: 'Alto' },
    { value: 'critical', label: 'Crítico' }
  ];

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Risk filter
      if (riskLevel !== 'Todos' && s.riskLevel !== riskLevel) return false;

      // Program filter
      if (program !== 'Todos' && s.program !== program) return false;

      // Date range filter
      if (startDate || endDate) {
        if (!s.createdAt) return false;
        const sDate = new Date(s.createdAt).getTime();
        
        if (startDate) {
          const start = new Date(startDate).getTime();
          if (sDate < start) return false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (sDate > end.getTime()) return false;
        }
      }

      return true;
    });
  }, [students, riskLevel, program, startDate, endDate]);

  if (!isOpen) return null;

  const handleExport = () => {
    if (format === 'CSV') {
      exportStudentsToCSV(filteredStudents, tutors);
    } else {
      exportStudentsToXLSX(filteredStudents, tutors);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl animate-scale-up overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-uceva-400">
              <Download size={20} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Exportar Reporte</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-400">
            Los filtros son opcionales. Si no seleccionas ninguno, se exportará la lista completa.
          </p>

          <div className="space-y-4">
            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha Desde</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-uceva-500 focus:border-transparent transition-all [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha Hasta</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-uceva-500 focus:border-transparent transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Nivel de riesgo */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nivel de Riesgo</label>
              <div className="relative">
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:ring-2 focus:ring-uceva-500 transition-all appearance-none cursor-pointer"
                >
                  {riskLevels.map(rl => (
                    <option key={rl.value} value={rl.value} className="bg-gray-900">{rl.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Programa académico */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Programa Académico</label>
              <div className="relative">
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:ring-2 focus:ring-uceva-500 transition-all appearance-none cursor-pointer"
                >
                  {programs.map(p => (
                    <option key={p} value={p} className="bg-gray-900">{p}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Formato */}
            <div className="pt-4 border-t border-gray-800">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-4">Formato de Exportación</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormat('CSV')}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                    format === 'CSV' 
                      ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400' 
                      : 'border-gray-800 bg-gray-950 text-gray-500 hover:border-gray-700'
                  }`}
                >
                  <FileText size={28} className="mb-2" />
                  <span className="text-sm font-bold">CSV</span>
                </button>
                <button
                  onClick={() => setFormat('XLSX')}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                    format === 'XLSX' 
                      ? 'border-blue-500 bg-blue-900/20 text-blue-400' 
                      : 'border-gray-800 bg-gray-950 text-gray-500 hover:border-gray-700'
                  }`}
                >
                  <FileSpreadsheet size={28} className="mb-2" />
                  <span className="text-sm font-bold">Excel (XLSX)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-bold uppercase">A exportar</span>
            <span className="text-lg font-black text-white">{filteredStudents.length} estudiantes</span>
          </div>
          
          <button
            onClick={handleExport}
            disabled={filteredStudents.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-uceva-600 to-uceva-700 hover:from-uceva-500 hover:to-uceva-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Exportar Ahora
          </button>
        </div>
      </div>
    </div>
  );
}
