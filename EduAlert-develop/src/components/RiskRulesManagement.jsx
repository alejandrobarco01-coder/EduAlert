import { useState, useEffect } from 'react';
import { fetchRiskRules, updateRiskRulesAPI, testRiskCalculationAPI, fetchFactors } from '../services/api';
import { Save, Loader2, Play, AlertTriangle, Percent, Search, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function RiskRulesManagement() {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Test states
  const [testData, setTestData] = useState({ gpa: 3.5, absences: 5, factorsTotalWeight: 0, alertsCount: 0 });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  // Helper dictionary loaded from DB
  const [factors, setFactors] = useState([]);
  const [selectedFactorIds, setSelectedFactorIds] = useState([]);

  useEffect(() => {
    Promise.all([fetchRiskRules(), fetchFactors()]).then(([rData, fData]) => {
      setRules(rData);
      setFactors(fData.data || fData); // depends on API envelope
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError('Error al cargar la configuración.');
      setLoading(false);
    });
  }, []);

  // Update testData when factors selection change
  useEffect(() => {
    let totalWeight = 0;
    selectedFactorIds.forEach(id => {
      const f = factors.find(fact => fact.id === id);
      if (f) totalWeight += Number(f.weight || 0);
    });
    setTestData(prev => ({ ...prev, factorsTotalWeight: totalWeight }));
  }, [selectedFactorIds, factors]);

  const handleRuleChange = (key, value) => {
    setRules(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleTestChange = (key, value) => {
    setTestData(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg('');
    try {
      // Validate percentages sum to 100
      const totalPct = rules.gpaWeight + rules.absencesWeight + rules.factorsWeight + rules.interventionsWeight;
      if (totalPct !== 100) {
        throw new Error(`Los porcentajes suman ${totalPct}%. Deben sumar exactamente 100%.`);
      }
      
      const newRules = await updateRiskRulesAPI(rules);
      setRules(newRules);
      setSuccessMsg('Reglas guardadas correctamente. El sistema usará esto para próximos recálculos.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testRiskCalculationAPI(testData);
      setTestResult(res);
    } catch (err) {
      console.error(err);
      alert('Error en la prueba: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  const currentTotal = rules ? (rules.gpaWeight || 0) + (rules.absencesWeight || 0) + (rules.factorsWeight || 0) + (rules.interventionsWeight || 0) : 0;

  if (loading) {
    return (
      <div className="card p-16 text-center">
        <Loader2 size={32} className="text-uceva-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Cargando motor de reglas...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in grid gap-6 lg:grid-cols-2">
      
      <div className="space-y-6">
        <div className="card p-6 border-l-4 border-l-uceva-500">
          <h2 className="text-xl font-bold text-white mb-2">Motor Lógico de Riesgo</h2>
          <p className="text-sm text-gray-400 mb-6">
            Configure los pesos que determinarán cómo se calcula el Índice de Riesgo de un estudiante (rango 0-100).
          </p>

          <div className="space-y-5">
            {[
              { id: 'gpaWeight', label: 'Peso del Promedio (GPA)', color: 'text-blue-400', desc: 'Impacto del promedio acumulado' },
              { id: 'absencesWeight', label: 'Peso de Inasistencias', color: 'text-orange-400', desc: 'Impacto del número de ausencias' },
              { id: 'factorsWeight', label: 'Peso del Checklist (Factores)', color: 'text-purple-400', desc: 'Impacto de factores de riesgo asignados' },
              { id: 'interventionsWeight', label: 'Peso de Intervenciones (Alertas)', color: 'text-red-400', desc: 'Impacto de alertas o intervenciones previas' }
            ].map(item => (
              <div key={item.id} className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-gray-200">
                    {item.label}
                  </label>
                  <span className={`text-lg font-bold ${item.color}`}>{rules?.[item.id]}%</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{item.desc}</p>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={rules?.[item.id] || 0} 
                  onChange={(e) => handleRuleChange(item.id, e.target.value)}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-uceva-500"
                />
              </div>
            ))}
          </div>

          <div className={`mt-6 p-4 rounded-xl flex items-center justify-between border ${currentTotal === 100 ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'}`}>
            <span className="text-sm font-semibold flex items-center gap-2">
              <Percent size={16} /> Suma Total
            </span>
            <span className="text-lg font-bold">{currentTotal}%</span>
          </div>
          {currentTotal !== 100 && (
             <p className="text-xs text-red-400 mt-2 ml-1 flex items-start gap-1">
               <AlertTriangle size={14} className="mt-0.5 shrink-0" />
               La suma debe ser exactamente 100%. Por favor, ajuste los controles deslizantes.
             </p>
          )}

          <div className="mt-8 pt-6 border-t border-gray-800 space-y-4">
             <h3 className="text-md font-bold text-white">Parámetros Máximos</h3>
             <p className="text-xs text-gray-400 mb-4">Ajuste los topes para calcular de manera proporcional el puntaje interno antes de aplicar los porcentajes anteriores.</p>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1">Total de Puntos Factor Máximo</label>
                   <input 
                      type="number" 
                      className="input-field w-full"
                      value={rules?.maxFactorsTotalWeight || 0} 
                      onChange={(e) => handleRuleChange('maxFactorsTotalWeight', e.target.value)}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1">Máximo de Alertas/Intervenciones</label>
                   <input 
                      type="number" 
                      className="input-field w-full"
                      value={rules?.maxInterventionsCount || 0} 
                      onChange={(e) => handleRuleChange('maxInterventionsCount', e.target.value)}
                   />
                </div>
             </div>
          </div>

          {error && <p className="text-sm text-red-400 mt-4 bg-red-900/20 p-3 rounded-lg border border-red-800/30">{error}</p>}
          {successMsg && <p className="text-sm text-green-400 mt-4 bg-green-900/20 p-3 rounded-lg border border-green-800/30 flex items-center gap-2"><CheckCircle2 size={16} /> {successMsg}</p>}

          <button 
            onClick={handleSave} 
            disabled={currentTotal !== 100 || saving}
            className="w-full mt-6 flex justify-center items-center gap-2 py-3 bg-uceva-600 hover:bg-uceva-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Guardando...' : 'Guardar y Aplicar Reglas'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-6 border-l-4 border-l-orange-500 bg-gray-900/80">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
             <Play size={20} className="text-orange-400" /> Simulador de Riesgo
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Pruebe el cálculo ingresando datos hipotéticos antes de mandar las reglas a producción. Funciona en tiempo real conectándose al motor lógico de prueba del servidor.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Promedio (GPA) (0-5.0)</label>
              <input type="number" step="0.1" min="0" max="5.0" className="input-field w-full" value={testData.gpa} onChange={e => handleTestChange('gpa', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Inasistencias (0-25+)</label>
              <input type="number" min="0" className="input-field w-full" value={testData.absences} onChange={e => handleTestChange('absences', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Factores Seleccionados</label>
              <div className="text-sm p-2 bg-gray-800 rounded font-bold text-purple-400 border border-gray-700">
                {selectedFactorIds.length} ref(s) — Peso: {testData.factorsTotalWeight}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Cant. Intervenciones/Alertas</label>
              <input type="number" min="0" className="input-field w-full" value={testData.alertsCount} onChange={e => handleTestChange('alertsCount', e.target.value)} />
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700 max-h-48 overflow-y-auto custom-scrollbar">
             <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Simulación de Factores</p>
             <div className="space-y-2">
                {factors.map(f => (
                   <label key={f.id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                         type="checkbox" 
                         className="checkbox-custom" 
                         checked={selectedFactorIds.includes(f.id)}
                         onChange={(e) => {
                            if (e.target.checked) setSelectedFactorIds(p => [...p, f.id]);
                            else setSelectedFactorIds(p => p.filter(id => id !== f.id));
                         }}
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">{f.name}</span>
                      <span className="text-xs text-purple-400 font-bold bg-purple-900/20 px-2 py-0.5 rounded">Peso {f.weight}</span>
                   </label>
                ))}
             </div>
          </div>

          <button 
            onClick={handleTest} 
            disabled={testing}
            className="w-full flex justify-center items-center gap-2 py-3 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-600/50 font-bold rounded-xl disabled:opacity-50 transition-all"
          >
            {testing ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Calcular Riesgo Simulado
          </button>

          {testResult && (
             <div className="mt-6 p-5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-xl animate-scale-in">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-2">Resultado Lógico</p>
                <div className="flex flex-col items-center justify-center mb-6">
                   <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 p-1">
                      {testResult.riskIndex}%
                   </span>
                   <p className="text-sm text-gray-400 mt-1">Índice de Riesgo Final</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   {/* Sub-scores representation */}
                   <div className="bg-gray-800/50 p-2 rounded justify-between flex items-center border border-gray-700">
                      <span className="text-xs text-gray-400">Score GPA</span>
                      <span className="text-xs font-bold text-blue-400">{Math.round(testResult.scores.gpaScore)}%</span>
                   </div>
                   <div className="bg-gray-800/50 p-2 rounded justify-between flex items-center border border-gray-700">
                      <span className="text-xs text-gray-400">Score Ausencias</span>
                      <span className="text-xs font-bold text-orange-400">{Math.round(testResult.scores.absencesScore)}%</span>
                   </div>
                   <div className="bg-gray-800/50 p-2 rounded justify-between flex items-center border border-gray-700">
                      <span className="text-xs text-gray-400">Score Factores</span>
                      <span className="text-xs font-bold text-purple-400">{Math.round(testResult.scores.checklistScore)}%</span>
                   </div>
                   <div className="bg-gray-800/50 p-2 rounded justify-between flex items-center border border-gray-700">
                      <span className="text-xs text-gray-400">Score Alertas</span>
                      <span className="text-xs font-bold text-red-400">{Math.round(testResult.scores.interventionsScore)}%</span>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>

    </div>
  );
}
