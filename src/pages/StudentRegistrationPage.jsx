import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  User,
  Mail,
  GraduationCap,
  Hash,
  ChevronRight,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react';

// ─── Constantes del wizard ────────────────────────────────────────────────────
const TOTAL_STEPS = 3;

const PROGRAMS = [
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Ingeniería Electrónica',
  'Administración de Empresas',
  'Contaduría Pública',
  'Derecho',
  'Psicología',
  'Trabajo Social',
  'Medicina',
  'Enfermería',
];

// ─── Validaciones individuales ────────────────────────────────────────────────
const validators = {
  nombre: (v) =>
    v.trim().length >= 3 ? '' : 'Ingresa tu nombre completo (mín. 3 caracteres).',
  codigo: (v) =>
    /^\d{6,10}$/.test(v.trim()) ? '' : 'El código debe tener entre 6 y 10 dígitos.',
  correo: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Ingresa un correo electrónico válido.',
  programa: (v) => (v ? '' : 'Selecciona tu programa académico.'),
  semestre: (v) => (v ? '' : 'Selecciona tu semestre actual.'),
};

function validateAll(form) {
  return Object.fromEntries(
    Object.entries(validators).map(([k, fn]) => [k, fn(form[k])])
  );
}

function isFormValid(errors) {
  return Object.values(errors).every((e) => e === '');
}

// ─── Barra de progreso del wizard ────────────────────────────────────────────
function WizardProgressBar({ currentStep, totalSteps }) {
  const pct = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100) || 0;

  return (
    <div className="mb-8">
      {/* Etiqueta */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-uceva-400 uppercase tracking-widest">
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="text-xs text-gray-500 font-medium">{pct}% completado</span>
      </div>

      {/* Barra principal */}
      <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-uceva-700 to-uceva-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct + (100 / (totalSteps - 1))}%` }}
        />
      </div>

      {/* Indicadores de paso */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <div key={step} className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                  ${isCompleted
                    ? 'bg-uceva-600 border-uceva-500 text-white shadow-[0_0_12px_rgba(var(--color-uceva-600),0.5)]'
                    : isCurrent
                    ? 'bg-gray-900 border-uceva-500 text-uceva-400'
                    : 'bg-gray-900 border-gray-700 text-gray-600'
                  }
                `}
              >
                {isCompleted ? <CheckCircle size={14} /> : step}
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  isCurrent ? 'text-uceva-400' : isCompleted ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {step === 1 ? 'Personal' : step === 2 ? 'Socioeconóm.' : 'Confirmación'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Campo de formulario reutilizable ─────────────────────────────────────────
function FormField({ id, label, icon: Icon, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon
              size={16}
              className={`transition-colors ${error ? 'text-red-500' : 'text-gray-500'}`}
            />
          </div>
        )}
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Paso 1: Datos personales ─────────────────────────────────────────────────
function Step1PersonalData({ data, onNext }) {
  const [form, setForm] = useState({
    nombre: data.nombre || '',
    codigo: data.codigo || '',
    correo: data.correo || '',
    programa: data.programa || '',
    semestre: data.semestre || '',
  });

  const [errors, setErrors] = useState({
    nombre: '',
    codigo: '',
    correo: '',
    programa: '',
    semestre: '',
  });

  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validators[field](value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validators[field](form[field]) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Marcar todos como tocados y validar
    const allErrors = validateAll(form);
    setErrors(allErrors);
    setTouched({ nombre: true, codigo: true, correo: true, programa: true, semestre: true });

    if (!isFormValid(allErrors)) return;

    // ✓ Criterio: datos se conservan en memoria para el envío final
    onNext(form);
  };

  const inputBase =
    'block w-full pl-10 pr-3 py-2.5 border rounded-xl bg-gray-950 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all duration-200';

  const inputClass = (field) =>
    errors[field] && touched[field]
      ? `${inputBase} border-red-500/60 focus:ring-red-500/40`
      : `${inputBase} border-gray-800 focus:ring-uceva-600`;

  const selectBase =
    'block w-full pl-10 pr-3 py-2.5 border rounded-xl bg-gray-950 text-white focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all duration-200 appearance-none';

  const selectClass = (field) =>
    errors[field] && touched[field]
      ? `${selectBase} border-red-500/60 focus:ring-red-500/40`
      : `${selectBase} border-gray-800 focus:ring-uceva-600`;

  const valid = isFormValid(validateAll(form));

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Título del paso */}
      <div className="mb-1">
        <h3 className="text-lg font-bold text-white">Datos Personales</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Completa tu información académica para continuar.
        </p>
      </div>

      {/* Nombre completo */}
      <FormField
        id="nombre"
        label="Nombre Completo"
        icon={User}
        error={touched.nombre ? errors.nombre : ''}
      >
        <input
          id="nombre"
          type="text"
          autoComplete="name"
          placeholder="Ej: Juan Pérez Gómez"
          className={inputClass('nombre')}
          value={form.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          onBlur={() => handleBlur('nombre')}
        />
      </FormField>

      {/* Código estudiantil */}
      <FormField
        id="codigo"
        label="Código Estudiantil"
        icon={Hash}
        error={touched.codigo ? errors.codigo : ''}
      >
        <input
          id="codigo"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Ej: 2024001234"
          className={inputClass('codigo')}
          value={form.codigo}
          onChange={(e) => handleChange('codigo', e.target.value.replace(/\D/g, ''))}
          onBlur={() => handleBlur('codigo')}
          maxLength={10}
        />
      </FormField>

      {/* Correo electrónico */}
      <FormField
        id="correo"
        label="Correo Electrónico"
        icon={Mail}
        error={touched.correo ? errors.correo : ''}
      >
        <input
          id="correo"
          type="email"
          autoComplete="email"
          placeholder="ejemplo@uceva.edu.co"
          className={inputClass('correo')}
          value={form.correo}
          onChange={(e) => handleChange('correo', e.target.value)}
          onBlur={() => handleBlur('correo')}
        />
      </FormField>

      {/* Programa académico */}
      <FormField
        id="programa"
        label="Programa Académico"
        icon={GraduationCap}
        error={touched.programa ? errors.programa : ''}
      >
        <select
          id="programa"
          className={selectClass('programa')}
          value={form.programa}
          onChange={(e) => handleChange('programa', e.target.value)}
          onBlur={() => handleBlur('programa')}
        >
          <option value="" disabled>Selecciona tu programa</option>
          {PROGRAMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </FormField>

      {/* Semestre */}
      <FormField
        id="semestre"
        label="Semestre Actual"
        icon={BookOpen}
        error={touched.semestre ? errors.semestre : ''}
      >
        <select
          id="semestre"
          className={selectClass('semestre')}
          value={form.semestre}
          onChange={(e) => handleChange('semestre', e.target.value)}
          onBlur={() => handleBlur('semestre')}
        >
          <option value="" disabled>Selecciona tu semestre</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>Semestre {n}</option>
          ))}
        </select>
      </FormField>

      {/* Aviso de privacidad */}
      <div className="bg-gray-800/40 p-3.5 rounded-xl border border-gray-800 flex items-start gap-3">
        <ShieldAlert className="text-uceva-400 flex-shrink-0 mt-0.5" size={16} />
        <p className="text-xs text-gray-400 leading-relaxed">
          La información proporcionada será tratada bajo las políticas de privacidad
          de la institución para fines de acompañamiento y bienestar universitario.
        </p>
      </div>

      {/* Botón Siguiente — ✓ Criterio: solo avanza si todos los campos son válidos */}
      <button
        type="submit"
        id="btn-siguiente-paso1"
        className={`
          w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl
          text-sm font-bold uppercase tracking-widest transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-uceva-600 focus:ring-offset-gray-900
          ${valid
            ? 'bg-uceva-600 hover:bg-uceva-500 text-white shadow-lg shadow-uceva-900/40 hover:shadow-uceva-800/50 hover:-translate-y-0.5 active:translate-y-0'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
          }
        `}
      >
        Siguiente
        <ChevronRight size={16} />
      </button>
    </form>
  );
}

// ─── Placeholders para los pasos 2 y 3 ───────────────────────────────────────
function Step2Placeholder({ onBack }) {
  return (
    <div className="text-center py-8 space-y-4">
      <p className="text-gray-400 text-sm">Paso 2: Encuesta socioeconómica (próximamente)</p>
      <button
        onClick={onBack}
        className="text-uceva-400 hover:text-uceva-300 text-sm underline"
      >
        ← Volver al Paso 1
      </button>
    </div>
  );
}

function Step3Placeholder({ onBack }) {
  return (
    <div className="text-center py-8 space-y-4">
      <p className="text-gray-400 text-sm">Paso 3: Confirmación (próximamente)</p>
      <button
        onClick={onBack}
        className="text-uceva-400 hover:text-uceva-300 text-sm underline"
      >
        ← Volver al Paso 2
      </button>
    </div>
  );
}

// ─── Página principal del wizard ──────────────────────────────────────────────
export default function StudentRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // ✓ Criterio: datos del paso 1 se conservan en memoria para el envío final
  const [wizardData, setWizardData] = useState({
    step1: {},
    step2: {},
  });

  const handleStep1Next = (step1Data) => {
    setWizardData((prev) => ({ ...prev, step1: step1Data }));
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Fondos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-uceva-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-uceva-800/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-uceva-950/20 rounded-full blur-3xl" />
      </div>

      {/* Header de la app */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10 text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-uceva-700 to-uceva-900 shadow-2xl shadow-uceva-950/60 mb-4 border border-uceva-700/30">
          <BookOpen size={24} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase">
          Edu<span className="text-uceva-500">Alert</span>
        </h1>
        <p className="mt-1 text-xs text-gray-400 uppercase tracking-widest font-bold">
          Auto-Registro Estudiantil
        </p>
      </div>

      {/* Tarjeta principal del wizard */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-gray-900/70 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-800">
          {/* ✓ Criterio: barra de progreso muestra 'Paso X de 3' */}
          <WizardProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          {/* Contenido dinámico por paso */}
          {currentStep === 1 && (
            <Step1PersonalData data={wizardData.step1} onNext={handleStep1Next} />
          )}
          {currentStep === 2 && (
            <Step2Placeholder onBack={() => setCurrentStep(1)} />
          )}
          {currentStep === 3 && (
            <Step3Placeholder onBack={() => setCurrentStep(2)} />
          )}
        </div>

        {/* Link de vuelta al login */}
        <p className="mt-6 text-center text-xs text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-uceva-400 hover:text-uceva-300 font-semibold transition-colors">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
