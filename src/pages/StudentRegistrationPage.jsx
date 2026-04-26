import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Mail, ShieldAlert, GraduationCap, CheckCircle, Loader2 } from 'lucide-react';

export default function StudentRegistrationPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    program: '',
    semester: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Registro Completado!</h2>
          <p className="text-gray-400 mb-8 text-sm">Tus datos han sido registrados exitosamente en el sistema de Bienestar Universitario.</p>
          <Link to="/login" className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold rounded-xl transition-colors border border-gray-700">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-uceva-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-uceva-800/10 rounded-full blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-uceva-700 to-uceva-900 shadow-2xl shadow-uceva-950/60 mb-4 border border-uceva-700/30">
          <BookOpen size={28} className="text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">
          Edu<span className="text-uceva-500">Alert</span>
        </h2>
        <p className="mt-2 text-sm text-gray-400 uppercase tracking-widest font-bold">
          Portal de Estudiantes
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-gray-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Nombre Completo
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-500" size={18} />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-800 bg-gray-950 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-uceva-600 focus:border-transparent text-sm transition-colors"
                  placeholder="Ej: Juan Pérez"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-500" size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-800 bg-gray-950 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-uceva-600 focus:border-transparent text-sm transition-colors"
                  placeholder="ejemplo@uceva.edu.co"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="program" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Programa Académico
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GraduationCap className="text-gray-500" size={18} />
                </div>
                <input
                  id="program"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-800 bg-gray-950 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-uceva-600 focus:border-transparent text-sm transition-colors"
                  placeholder="Ej: Ingeniería de Sistemas"
                  value={form.program}
                  onChange={(e) => handleChange('program', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="semester" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Semestre Actual
              </label>
              <div className="mt-2">
                <select
                  id="semester"
                  required
                  className="block w-full px-3 py-2.5 border border-gray-800 bg-gray-950 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-uceva-600 focus:border-transparent text-sm transition-colors"
                  value={form.semester}
                  onChange={(e) => handleChange('semester', e.target.value)}
                >
                  <option value="" disabled className="text-gray-500">Selecciona tu semestre</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>Semestre {num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-800 flex items-start gap-3 mt-4">
               <ShieldAlert className="text-uceva-400 flex-shrink-0 mt-0.5" size={18} />
               <p className="text-xs text-gray-400 leading-relaxed">
                 La información proporcionada será tratada bajo las políticas de privacidad de la institución para fines de acompañamiento y bienestar.
               </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-uceva-600 hover:bg-uceva-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-uceva-600 focus:ring-offset-gray-900 transition-colors uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Registrarse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
