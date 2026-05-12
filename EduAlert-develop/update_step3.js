const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/JuanFer/OneDrive/Documentos/EduAlert-develop/EduAlert-develop/src/pages/StudentRegistrationPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Rename step in progress bar
content = content.replace("step === 2 ? 'Socioeconóm.' : 'Confirmación'", "step === 2 ? 'Socioeconóm.' : 'Académica'");

// 2. Change <Step3Confirmation> to <Step3AcademicArea>
content = content.replace("<Step3Confirmation", "<Step3AcademicArea");

// 3. Replace the Step3Confirmation function definition
const step3component = `// ─── Paso 3: Área Académica y resultado del motor ───────────────────────────────
function Step3AcademicArea({ wizardData, onBack }) {
  const [status, setStatus]   = useState('idle');
  const [result, setResult]   = useState(null);
  const [errMsg, setErrMsg]   = useState('');

  const [form, setForm] = useState({
    promedio: '',
    materiasCursando: '',
    materiasReprobadas: '',
    inasistencias: ''
  });
  const [touched, setTouched] = useState({});

  const { step1, step2 } = wizardData;

  const validators = {
    promedio: (v) => {
      if(v === '') return 'Requerido';
      const num = parseFloat(v);
      if(isNaN(num) || num < 0.0 || num > 5.0) return 'Debe ser un número entre 0.0 y 5.0';
      return '';
    },
    materiasCursando: (v) => v === '' ? 'Requerido' : '',
    materiasReprobadas: (v) => v === '' ? 'Requerido' : '',
    inasistencias: (v) => {
      if(v === '') return 'Requerido';
      const num = parseInt(v, 10);
      if(isNaN(num) || num < 0 || num.toString() !== v.trim()) return 'Solo enteros positivos';
      return '';
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isValid = Object.keys(validators).every(k => validators[k](form[k]) === '');

  const getErrors = () => {
    const errs = {};
    for (let k in validators) {
      if (touched[k]) errs[k] = validators[k](form[k]);
    }
    return errs;
  };
  const currentErrors = getErrors();

  const handleFinish = async (e) => {
    e?.preventDefault();
    if (!isValid) return;

    setStatus('loading');
    setErrMsg('');
    try {
      const payload = {
        name:       step1.nombre,
        email:      step1.correo,
        password:   step1.codigo,
        role:       'estudiante',
        department: step1.programa,
        wizardStep1: {
          codigo:   step1.codigo,
          semestre: step1.semestre,
          gpa:      parseFloat(form.promedio) || 0,
          absences: parseInt(form.inasistencias, 10) || 0,
          materiasCursando: parseInt(form.materiasCursando, 10) || 0,
          materiasReprobadas: parseInt(form.materiasReprobadas, 10) || 0,
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

      setResult(json.data?.initialRisk ?? null);
      setStatus('success');
    } catch (err) {
      setErrMsg(err.message);
      setStatus('error');
    }
  };

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

        <div className={\`\${cfg.bg} border \${cfg.border} rounded-2xl p-5 space-y-3\`}>
          <div className="flex items-center justify-center gap-2">
            <TrendingUp size={18} className={cfg.text} />
            <span className={\`text-sm font-bold uppercase tracking-widest \${cfg.text}\`}>
              {cfg.label}
            </span>
          </div>
          <div className="text-4xl font-black text-white">{pct}%</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className={\`h-2 rounded-full transition-all duration-1000 \${cfg.dot}\`}
              style={{ width: \`\${pct}%\` }}
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

  const inputClass = (err) => 
    err
      ? "block w-full pl-3 pr-3 py-2.5 border rounded-xl bg-gray-950 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all duration-200 border-red-500/60 focus:ring-red-500/40"
      : "block w-full pl-3 pr-3 py-2.5 border rounded-xl bg-gray-950 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all duration-200 border-gray-800 focus:ring-uceva-600";

  return (
    <form onSubmit={handleFinish} noValidate className="space-y-5">
      <div className="mb-1">
        <h3 className="text-lg font-bold text-white">Área Académica</h3>
        <p className="text-xs text-gray-500 mt-0.5">Detalla tu situación académica actual.</p>
      </div>

      <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Promedio Académico Actual (0.0 - 5.0)</label>
          <input type="text" className={inputClass(currentErrors.promedio)} value={form.promedio} onChange={(e) => handleChange('promedio', e.target.value)} onBlur={() => handleBlur('promedio')} placeholder="Ej: 3.8" />
          {currentErrors.promedio && <p className="mt-1.5 text-xs text-red-400">{currentErrors.promedio}</p>}
      </div>

      <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Número de Materias Cursando</label>
          <input type="number" className={inputClass(currentErrors.materiasCursando)} value={form.materiasCursando} onChange={(e) => handleChange('materiasCursando', e.target.value)} onBlur={() => handleBlur('materiasCursando')} placeholder="Ej: 5" min="0" />
          {currentErrors.materiasCursando && <p className="mt-1.5 text-xs text-red-400">{currentErrors.materiasCursando}</p>}
      </div>

      <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Materias Reprobadas Históricas</label>
          <input type="number" className={inputClass(currentErrors.materiasReprobadas)} value={form.materiasReprobadas} onChange={(e) => handleChange('materiasReprobadas', e.target.value)} onBlur={() => handleBlur('materiasReprobadas')} placeholder="Ej: 1" min="0" />
          {currentErrors.materiasReprobadas && <p className="mt-1.5 text-xs text-red-400">{currentErrors.materiasReprobadas}</p>}
      </div>

      <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Inasistencias en el último mes</label>
          <input type="text" className={inputClass(currentErrors.inasistencias)} value={form.inasistencias} onChange={(e) => handleChange('inasistencias', e.target.value.replace(/\\D/g, ''))} onBlur={() => handleBlur('inasistencias')} placeholder="Solo enteros positivos. Ej: 2" />
          {currentErrors.inasistencias && <p className="mt-1.5 text-xs text-red-400">{currentErrors.inasistencias}</p>}
      </div>

      {status === 'error' && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{errMsg}</p>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button type="button" onClick={onBack} disabled={status === 'loading'}
          className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl border border-gray-700 bg-gray-800 text-gray-300 text-sm font-bold hover:bg-gray-700 transition-all duration-200 disabled:opacity-50">
          <ChevronLeft size={16} /> Atrás
        </button>
        <button
          id="btn-finalizar-registro"
          type="submit"
          disabled={status === 'loading' || !isValid}
          className={\`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 \${isValid ? 'bg-uceva-600 hover:bg-uceva-500 text-white shadow-lg shadow-uceva-900/40 hover:-translate-y-0.5 active:translate-y-0' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}\`}
        >
          {status === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Calculando...</> : (isValid ? <>Finalizar registro <CheckCircle size={16} /></> : <>Siguiente <ChevronRight size={16} /></>)}
        </button>
      </div>
    </form>
  );
}`;

const startIndex = content.indexOf('// ─── Paso 3: Confirmación y resultado del motor ───────────────────────────────');
const endIndexStr = '// ─── Página principal del wizard ──────────────────────────────────────────────';
const endIndex = content.indexOf(endIndexStr);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + step3component + '\\n\\n' + content.substring(endIndex);
  fs.writeFileSync(filePath, content);
  console.log('Wizard modificado correctamente con el script');
} else {
  console.log('No se pudo encontrar el bloque a reemplazar');
}
