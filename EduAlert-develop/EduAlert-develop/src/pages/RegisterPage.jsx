import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle, Loader2, BookOpen, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UCEVA_FACULTIES = [
  '',
  'Facultad de Ciencias Administrativas, Económicas y Contables',
  'Facultad de Ciencias Básicas y Salud',
  'Facultad de Ciencias de la Educación',
  'Facultad de Ciencias Jurídicas y Sociales',
  'Facultad de Ingeniería',
  'Facultad de Humanidades',
  'Vicerrectoría Académica',
  'Vicerrectoría Administrativa y Financiera',
  'Rectoría',
  'Bienestar Universitario',
];

const PASSWORD_RULES = [
  { label: 'Mínimo 6 caracteres', test: p => p.length >= 6 },
  { label: 'Al menos una mayúscula', test: p => /[A-Z]/.test(p) },
  { label: 'Al menos un número', test: p => /[0-9]/.test(p) },
  { label: 'Al menos un carácter especial', test: p => /[^A-Za-z0-9]/.test(p) },
];

function PasswordStrengthBar({ password }) {
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  const levels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-uceva-500'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= passed ? colors[passed] : 'bg-gray-700'}`}
          />
        ))}
      </div>
      {password && (
        <div className="space-y-0.5">
          {PASSWORD_RULES.map(rule => (
            <div key={rule.label} className={`flex items-center gap-1.5 text-[11px] transition-colors ${rule.test(password) ? 'text-uceva-400' : 'text-gray-600'}`}>
              <CheckCircle size={10} className={rule.test(password) ? 'text-uceva-500' : 'text-gray-700'} />
              {rule.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const { register, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'tutor', department: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const passStrength = PASSWORD_RULES.filter(r => r.test(form.password)).length;
  const isWeakPassword = form.password && passStrength < 3;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'El nombre completo es obligatorio.';
    if (!form.email) errs.email = 'El correo es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Formato de correo inválido.';
    if (!form.password) errs.password = 'La contraseña es obligatoria.';
    else if (isWeakPassword) errs.password = 'La contraseña no cumple los requisitos mínimos de seguridad.';
    if (!form.confirmPassword) errs.confirmPassword = 'Debe confirmar la contraseña.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden.';
    if (!form.department.trim()) errs.department = 'El departamento es obligatorio.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    const res = await register(form);
    if (res.success) {
      setSuccessMsg('Registro exitoso. Creando cuenta...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    }
  };

  const handleChange = (f, v) => {
    setForm(prev => ({ ...prev, [f]: v }));
    if (fieldErrors[f]) setFieldErrors(prev => ({ ...prev, [f]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-uceva-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-uceva-800/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-uceva-700 to-uceva-900 shadow-2xl shadow-uceva-950/60 mb-4 border border-uceva-700/30">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Edu<span className="text-uceva-400">Alert</span> <span className="text-gray-400 font-normal">UCEVA</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Solicitud de Acceso al Sistema</p>
        </div>

        <div className="glass-card p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Crear Cuenta</h2>
            <p className="text-gray-500 text-sm mt-0.5">Solo para personal autorizado de la institución</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 bg-green-900/20 border border-green-700/40 rounded-xl px-4 py-3 mb-5 text-left">
              <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-green-300 text-sm">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reg-name" className="text-xs font-medium text-gray-400 mb-1.5 block">Nombre completo</label>
              <input id="reg-name" type="text" placeholder="Dr. Ejemplo Apellido" className={`input-field ${fieldErrors.name ? 'border-red-600' : ''}`} value={form.name} onChange={e => handleChange('name', e.target.value)} />
              {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="text-xs font-medium text-gray-400 mb-1.5 block">Correo institucional</label>
              <input id="reg-email" type="email" placeholder="usuario@uceva.edu.co" className={`input-field ${fieldErrors.email ? 'border-red-600' : ''}`} value={form.email} onChange={e => handleChange('email', e.target.value)} />
              {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="reg-role" className="text-xs font-medium text-gray-400 mb-1.5 block">Rol</label>
              <select id="reg-role" className="input-field" value={form.role} onChange={e => handleChange('role', e.target.value)}>
                <option value="tutor">Tutor</option>
                <option value="student">Estudiante</option>
                <option value="coordinator">Coordinador</option>
                <option value="welfare">Bienestar</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <label htmlFor="reg-dept" className="text-xs font-medium text-gray-400 mb-1.5 block">
                Facultad / Dependencia
              </label>
              <select
                id="reg-dept"
                className={`input-field ${fieldErrors.department ? 'border-red-600 focus:ring-red-600' : ''}`}
                value={form.department}
                onChange={e => handleChange('department', e.target.value)}
              >
                {UCEVA_FACULTIES.map((f, i) => (
                  <option key={i} value={f} disabled={f === ''}>
                    {f === '' ? '— Selecciona una facultad —' : f}
                  </option>
                ))}
              </select>
              {fieldErrors.department && <p className="text-red-400 text-xs mt-1">{fieldErrors.department}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="text-xs font-medium text-gray-400 mb-1.5 block">Contraseña</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Contraseña segura"
                  className={`input-field pr-11 ${fieldErrors.password ? 'border-red-600' : ''}`}
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                />
                <button type="button" id="toggle-reg-password" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
              <PasswordStrengthBar password={form.password} />
            </div>

            <div>
              <label htmlFor="reg-confirm" className="text-xs font-medium text-gray-400 mb-1.5 block">Confirmar contraseña</label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  className={`input-field pr-11 ${fieldErrors.confirmPassword ? 'border-red-600' : ''}`}
                  value={form.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                />
                <button type="button" id="toggle-confirm-password" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
            </div>

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" id="go-login" className="text-uceva-400 hover:text-uceva-300 font-medium transition-colors">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
