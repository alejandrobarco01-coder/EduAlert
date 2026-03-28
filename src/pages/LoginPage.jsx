import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'El correo es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Formato de correo inválido.';
    if (!form.password) errs.password = 'La contraseña es obligatoria.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    const res = await login(form.email, form.password);
    if (res.success) navigate(from, { replace: true });
  };

  const handleChange = (f, v) => {
    setForm(prev => ({ ...prev, [f]: v }));
    if (fieldErrors[f]) setFieldErrors(prev => ({ ...prev, [f]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-uceva-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-uceva-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-uceva-950/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Logo card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-uceva-700 to-uceva-900 shadow-2xl shadow-uceva-950/60 mb-4 border border-uceva-700/30">
            <BookOpen size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Edu<span className="text-uceva-400">Alert</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sistema IA – UCEVA · Detección de Deserción</p>
        </div>

        <div className="glass-card p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Iniciar Sesión</h2>
            <p className="text-gray-500 text-sm mt-1">Accede con tus credenciales institucionales</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="text-xs font-medium text-gray-400 mb-1.5 block">
                Correo institucional
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="usuario@uceva.edu.co"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className={`input-field ${fieldErrors.email ? 'border-red-600 focus:ring-red-600' : ''}`}
              />
              {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="login-password" className="text-xs font-medium text-gray-400 mb-1.5 block">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className={`input-field pr-11 ${fieldErrors.password ? 'border-red-600 focus:ring-red-600' : ''}`}
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
            </div>

            <button id="login-submit" type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link to="/register" id="go-register" className="text-uceva-400 hover:text-uceva-300 font-medium transition-colors">
                Solicitar acceso
              </Link>
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-4 card p-4 text-center">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-2">Credenciales de demo</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
            {[
              { label: 'Admin', email: 'admin@uceva.edu.co', pass: 'Admin@2024' },
              { label: 'Tutor', email: 'tutor@uceva.edu.co', pass: 'Tutor@2024' },
              { label: 'Coord', email: 'coord@uceva.edu.co', pass: 'Coord@2024' },
              { label: 'Bienestar', email: 'bienestar@uceva.edu.co', pass: 'Bienestar@2024' },
            ].map(d => (
              <button
                key={d.label}
                id={`demo-${d.label.toLowerCase()}`}
                onClick={() => { setForm({ email: d.email, password: d.pass }); setFieldErrors({}); setError(''); }}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-2 text-gray-400 hover:text-uceva-300 transition-all"
              >
                <span className="block font-semibold">{d.label}</span>
                <span className="text-gray-600">{d.pass}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
