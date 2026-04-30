import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, User, Mail, GraduationCap, Hash,
  ChevronRight, CheckCircle, ShieldAlert,
  ChevronLeft, AlertTriangle, TrendingUp,
  Home, Briefcase, Wifi, Users, Loader2,
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
            ? 'bg-uceva-600 hover:bg-uceva-500 text-white shadow-lg shadow-uceva-900/40 hover:-translate-y-0.5 active:translate-y-0'
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

// ─── Paso 2: Área Socioeconómica ─────────────────────────────────────────────

// Componente de grupo de opciones estilo card (radio)
function OptionGroup({ id, options, value, onChange, submitted, errorMsg }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map(({ v, label }) => (
          <button
            key={String(v)}
            type="button"
            id={`${id}-${String(v).replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => onChange(v)}
            className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 focus:outline-none
              ${value === v
                ? 'bg-uceva-600 border-uceva-500 text-white shadow-lg shadow-uceva-900/40 scale-[1.03]'
                : 'bg-gray-950 border-gray-700 text-gray-400 hover:border-uceva-700 hover:text-gray-200'
              }`}
          >
            {label}
          </button>
        ))}
      </div>
      {submitted && (value === null || value === '' || value === undefined) && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
          {errorMsg || 'Por favor selecciona una opción.'}
        </p>
      )}
    </div>
  );
}

// Validadores del paso 2
const step2Validators = {
  estrato:      (v) => (v !== null && v !== '' && v !== undefined ? '' : 'Selecciona tu estrato socioeconómico.'),
  situacionLaboral: (v) => (v ? '' : 'Indica tu situación laboral.'),
  accesoInternet:   (v) => (v ? '' : 'Indica tu acceso a internet.'),
  dependientes:     (v) => (v !== null && v !== '' && v !== undefined ? '' : 'Indica la cantidad de dependientes económicos.'),
};

function isStep2Valid(form) {
  return Object.values(step2Validators).every((fn, i) => {
    const keys = ['estrato', 'situacionLaboral', 'accesoInternet', 'dependientes'];
    return fn(form[keys[i]]) === '';
  });
}

function Step2SocioeconomicSurvey({ data, onNext, onBack }) {
  const [form, setForm] = useState({
    estrato:          data.estrato ?? null,
    situacionLaboral: data.situacionLaboral ?? '',
    accesoInternet:   data.accesoInternet ?? '',
    dependientes:     data.dependientes ?? null,
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const allValid = isStep2Valid(form);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!allValid) return;
    onNext(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="mb-1">
        <h3 className="text-lg font-bold text-white">Área Socioeconómica</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Tus respuestas son confidenciales y nos permiten brindarte el apoyo adecuado.
        </p>
      </div>

      {/* ── 1. Estrato socioeconómico ───────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Home size={15} className="text-uceva-400 flex-shrink-0" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Estrato Socioeconómico
          </span>
        </div>
        <OptionGroup
          id="estrato"
          value={form.estrato}
          onChange={(v) => set('estrato', v)}
          submitted={submitted}
          errorMsg="Selecciona tu estrato (1 = más bajo, 6 = más alto)."
          options={[1, 2, 3, 4, 5, 6].map(n => ({ v: n, label: String(n) }))}
        />
      </div>

      {/* ── 2. Situación laboral ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Briefcase size={15} className="text-uceva-400 flex-shrink-0" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Situación Laboral
          </span>
        </div>
        <OptionGroup
          id="situacion-laboral"
          value={form.situacionLaboral}
          onChange={(v) => set('situacionLaboral', v)}
          submitted={submitted}
          errorMsg="Indica tu situación laboral actual."
          options={[
            { v: 'trabaja',    label: 'Trabaja' },
            { v: 'no_trabaja', label: 'No trabaja' },
          ]}
        />
      </div>

      {/* ── 3. Acceso a internet ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Wifi size={15} className="text-uceva-400 flex-shrink-0" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Acceso a Internet
          </span>
        </div>
        <OptionGroup
          id="acceso-internet"
          value={form.accesoInternet}
          onChange={(v) => set('accesoInternet', v)}
          submitted={submitted}
          errorMsg="Indica tu tipo de acceso a internet."
          options={[
            { v: 'si',           label: 'Sí' },
            { v: 'no',           label: 'No' },
            { v: 'intermitente', label: 'Intermitente' },
          ]}
        />
      </div>

      {/* ── 4. Dependientes económicos ──────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Users size={15} className="text-uceva-400 flex-shrink-0" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Dependientes Económicos
          </span>
        </div>
        <OptionGroup
          id="dependientes"
          value={form.dependientes}
          onChange={(v) => set('dependientes', v)}
          submitted={submitted}
          errorMsg="Selecciona cuántas personas dependen económicamente de ti."
          options={[
            { v: 0, label: '0' },
            { v: 1, label: '1' },
            { v: 2, label: '2' },
            { v: 3, label: '3' },
            { v: 4, label: '4+' },
          ]}
        />
      </div>

      {/* Aviso de privacidad */}
      <div className="bg-gray-800/40 p-3.5 rounded-xl border border-gray-800 flex items-start gap-3">
        <ShieldAlert className="text-uceva-400 flex-shrink-0 mt-0.5" size={16} />
        <p className="text-xs text-gray-400 leading-relaxed">
          Esta información es estrictamente confidencial y solo la utilizará el equipo de
          Bienestar Universitario para ofrecerte apoyos pertinentes.
        </p>
      </div>

      {/* Botones de navegación */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          id="btn-atras-paso2"
          className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl border border-gray-700 bg-gray-800 text-gray-300 text-sm font-bold hover:bg-gray-700 transition-all duration-200"
        >
          <ChevronLeft size={16} /> Atrás
        </button>
        <button
          type="submit"
          id="btn-siguiente-paso2"
          className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300
            ${allValid
              ? 'bg-uceva-600 hover:bg-uceva-500 text-white shadow-lg shadow-uceva-900/40 hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}
        >
          Siguiente <ChevronRight size={16} />
        </button>
      </div>
    </form>
  );
}

// ─── Badges de nivel de riesgo ────────────────────────────────────────────────
const RISK_CONFIG = {
  bajo:    { bg: 'bg-emerald-900/40', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Riesgo Bajo' },
  medio:   { bg: 'bg-yellow-900/40',  border: 'border-yellow-500/40',  text: 'text-yellow-400',  dot: 'bg-yellow-400',  label: 'Riesgo Medio' },
  alto:    { bg: 'bg-orange-900/40',  border: 'border-orange-500/40',  text: 'text-orange-400',  dot: 'bg-orange-400',  label: 'Riesgo Alto' },
  crítico: { bg: 'bg-red-900/40',     border: 'border-red-500/40',     text: 'text-red-400',     dot: 'bg-red-400',     label: 'Riesgo Crítico' },
};

// ─── Paso 3: Confirmación y resultado del motor ───────────────────────────────
function Step3Confirmation({ wizardData, onBack }) {
  const [status, setStatus]   = useState('idle'); // idle | loading | success | error
  const [result, setResult]   = useState(null);
  const [errMsg, setErrMsg]   = useState('');

  const { step1, step2 } = wizardData;

  const handleFinish = async () => {
    setStatus('loading');
    setErrMsg('');
    try {
      const payload = {
        name:       step1.nombre,
        email:      step1.correo,
        password:   step1.codigo,   // código como contraseña provisional
        role:       'estudiante',
        department: step1.programa,
        wizardStep1: {
          codigo:   step1.codigo,
          semestre: step1.semestre,
          gpa:      0,
          absences: 0,
        },
        wizardStep2: step2,
      };

      const res = await fetch('http://127.0.0.1:3001/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.message || 'Error en el registro');

      // ✓ Criterio: nivel calculado se guarda y se retorna con fecha de evaluación
      setResult(json.data?.initialRisk ?? null);
      setStatus('success');
    } catch (err) {
      setErrMsg(err.message);
      setStatus('error');
    }
  };

  // ── Estado: éxito ──────────────────────────────────────────────────────────
  if (status === 'success') {
    const nivel   = result?.riskLevelEs ?? 'bajo';
    const cfg     = RISK_CONFIG[nivel] ?? RISK_CONFIG.bajo;
    const pct     = result?.riskValue ?? 0;
    const evalAt  = result?.evaluatedAt
      ? new Date(result.evaluatedAt).toLocaleDateString('es-CO', { dateStyle: 'medium' })
      : '—';

    return (
      <div className="space-y-5 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-uceva-600/20 border-2 border-uceva-500 flex items-center justify-center animate-pulse">
            <CheckCircle size={32} className="text-uceva-400" />
          </div>
          <h3 className="text-lg font-bold text-white">¡Registro Exitoso!</h3>
          <p className="text-xs text-gray-500">Tu perfil ha sido creado y tu nivel de riesgo inicial fue calculado.</p>
        </div>

        {/* Badge de nivel de riesgo — ✓ Criterio: motor retorna nivel */}
        <div className={`${cfg.bg} border ${cfg.border} rounded-2xl p-5 space-y-3`}>
          <div className="flex items-center justify-center gap-2">
            <TrendingUp size={18} className={cfg.text} />
            <span className={`text-sm font-bold uppercase tracking-widest ${cfg.text}`}>
              {cfg.label}
            </span>
          </div>
          <div className="text-4xl font-black text-white">{pct}%</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${cfg.dot}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">Fecha de evaluación: {evalAt}</p>
        </div>

        <Link
          to="/login"
          className="block w-full py-3 px-4 rounded-xl bg-uceva-600 hover:bg-uceva-500 text-white text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5"
        >
          Ir al Inicio de Sesión
        </Link>
      </div>
    );
  }

  // ── Estado: formulario de confirmación ────────────────────────────────────
  const summaryItems = [
    { label: 'Nombre',   value: step1.nombre },
    { label: 'Correo',   value: step1.correo },
    { label: 'Código',   value: step1.codigo },
    { label: 'Programa', value: step1.programa },
    { label: 'Semestre', value: `Semestre ${step1.semestre}` },
  ];

  return (
    <div className="space-y-5">
      <div className="mb-1">
        <h3 className="text-lg font-bold text-white">Confirmación</h3>
        <p className="text-xs text-gray-500 mt-0.5">Revisa tus datos antes de finalizar el registro.</p>
      </div>

      <div className="bg-gray-800/40 border border-gray-800 rounded-xl divide-y divide-gray-800/60">
        {summaryItems.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center px-4 py-2.5">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</span>
            <span className="text-xs text-gray-200 font-medium max-w-[55%] text-right truncate">{value}</span>
          </div>
        ))}
      </div>

      {status === 'error' && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{errMsg}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={status === 'loading'}
          className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl border border-gray-700 bg-gray-800 text-gray-300 text-sm font-bold hover:bg-gray-700 transition-all duration-200 disabled:opacity-50">
          <ChevronLeft size={16} /> Atrás
        </button>
        <button
          id="btn-finalizar-registro"
          onClick={handleFinish}
          disabled={status === 'loading'}
          className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl bg-uceva-600 hover:bg-uceva-500 text-white text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {status === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Calculando...</> : <>Finalizar Registro <CheckCircle size={16} /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Página principal del wizard ──────────────────────────────────────────────
export default function StudentRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({ step1: {}, step2: {} });

  const handleStep1Next = (step1Data) => {
    setWizardData((prev) => ({ ...prev, step1: step1Data }));
    setCurrentStep(2);
  };

  const handleStep2Next = (step2Data) => {
    setWizardData((prev) => ({ ...prev, step2: step2Data }));
    setCurrentStep(3);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Fondos animados / Decoración */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-uceva-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-uceva-800/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-uceva-950/20 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-uceva-600 p-3 rounded-2xl shadow-xl shadow-uceva-900/20 ring-4 ring-uceva-900/30">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-white tracking-tight">
          Edu<span className="text-uceva-500">Alert</span>
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-gray-400">
          Formulario de Caracterización Estudiantil
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-gray-900/50 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-gray-800 ring-1 ring-white/5">
          <WizardProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          <div className="transition-all duration-500 ease-in-out">
            {currentStep === 1 && (
              <Step1PersonalData data={wizardData.step1} onNext={handleStep1Next} />
            )}
            {currentStep === 2 && (
              <Step2SocioeconomicSurvey
                data={wizardData.step2}
                onNext={handleStep2Next}
                onBack={handleStep2Back}
              />
            )}
            {currentStep === 3 && (
              <Step3Confirmation
                wizardData={wizardData}
                onBack={handleStep3Back}
              />
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 font-medium">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-uceva-500 hover:text-uceva-400 font-bold transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
