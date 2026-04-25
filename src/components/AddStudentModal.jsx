import React, { useState } from 'react';
import { X, UserPlus, Loader2, GraduationCap, Mail, Hash, Book, Building2 } from 'lucide-react';
import { programs, semesters, faculties } from '../data/mockData';
import { createStudentAPI } from '../services/api';

export default function AddStudentModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    studentCode: '',
    email: '',
    faculty: faculties[0],
    program: programs[0] === 'Todos' ? programs[1] : programs[0],
    semester: 1,
    gpa: 0,
    absences: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.name || !form.studentCode || !form.email || !form.faculty || !form.program || !form.semester) {
      setError('Por favor complete todos los campos marcados con (*).');
      return;
    }

    if (form.semester < 1 || form.semester > 10) {
      setError('El semestre debe estar entre 1 y 10.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createStudentAPI(form);
      onSuccess();
    } catch (err) {
      console.error(err);
      // Show the descriptive server message when available
      if (err.code === 'DUPLICATE_CODE') {
        setError(`⚠️ Código duplicado: ${err.message}`);
      } else if (err.code === 'VALIDATION_ERROR') {
        setError(`Datos inválidos: ${err.message}`);
      } else {
        setError(err.message || 'Error al crear el estudiante. Intente nuevamente.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-uceva-600/20 rounded-xl flex items-center justify-center text-uceva-500">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Agregar Nuevo Estudiante</h2>
              <p className="text-xs text-gray-500">Complete la información académica requerida</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2">
              <X size={16} />
              {error}
            </div>
          )}

          <form id="add-student-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-uceva-500 transition-colors" size={18} />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-uceva-600 focus:ring-1 focus:ring-uceva-600 transition-all"
                  placeholder="Nombre y apellidos"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Student Code */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Código Estudiantil <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-uceva-500 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={form.studentCode}
                    onChange={e => setForm({ ...form, studentCode: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-uceva-600 focus:ring-1 focus:ring-uceva-600 transition-all"
                    placeholder="Ej. 202410123"
                  />
                </div>
              </div>

              {/* Institutional Email */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Correo Institucional <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-uceva-500 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-uceva-600 focus:ring-1 focus:ring-uceva-600 transition-all"
                    placeholder="estudiante@uceva.edu.co"
                  />
                </div>
              </div>
            </div>

            {/* Faculty */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Facultad <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-uceva-500 transition-colors" size={18} />
                <select
                  required
                  value={form.faculty}
                  onChange={e => setForm({ ...form, faculty: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-uceva-600 focus:ring-1 focus:ring-uceva-600 transition-all appearance-none"
                >
                  {faculties.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Program */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Programa Académico <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Book className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-uceva-500 transition-colors" size={18} />
                  <select
                    required
                    value={form.program}
                    onChange={e => setForm({ ...form, program: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-uceva-600 focus:ring-1 focus:ring-uceva-600 transition-all appearance-none"
                  >
                    {programs.filter(p => p !== 'Todos').map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Semestre (1-10) <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-uceva-500 transition-colors" size={18} />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={form.semester}
                    onChange={e => setForm({ ...form, semester: Number(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-uceva-600 focus:ring-1 focus:ring-uceva-600 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Promedio Inicial (Opcional)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.gpa}
                  onChange={e => setForm({ ...form, gpa: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-uceva-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Inasistencias (Opcional)</label>
                <input
                  type="number"
                  min="0"
                  value={form.absences}
                  onChange={e => setForm({ ...form, absences: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-uceva-600 transition-all"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="add-student-form"
            className="px-6 py-2.5 bg-gradient-to-r from-uceva-600 to-uceva-500 hover:from-uceva-500 hover:to-uceva-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-uceva-900/50 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Registrar Estudiante
          </button>
        </div>
      </div>
    </div>
  );
}
