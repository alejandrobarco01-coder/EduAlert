import { useState, useEffect } from 'react';
import { Loader2, Send, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { fetchInterventions, saveIntervention } from '../services/api';

export default function StudentInterventions({ studentId, onInterventionAdded }) {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [text, setText] = useState('');
  const [type, setType] = useState('cita');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    if (!studentId) return;
    loadInterventions();
  }, [studentId]);

  const loadInterventions = async () => {
    setLoading(true);
    try {
      const data = await fetchInterventions(studentId);
      setInterventions(data.reverse()); // Show newest first
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setSaving(true);
    try {
      const response = await saveIntervention(studentId, { text, type, priority });
      setInterventions([response.data, ...interventions]); // Prepend new intervention
      setText(''); // clear input
      
      // Notify parent to fetch new stats/history/risk value if needed
      if (onInterventionAdded) {
        onInterventionAdded(response.riskUpdate);
      }
    } catch (err) {
      console.error(err);
      alert('Error guardando intervención');
    } finally {
      setSaving(false);
    }
  };

  const getPriorityClass = (pri) => {
    if (pri === 'high') return 'text-red-400 bg-red-900/30 border-red-800/50';
    if (pri === 'medium') return 'text-orange-400 bg-orange-900/30 border-orange-800/50';
    return 'text-uceva-400 bg-uceva-900/30 border-uceva-800/50';
  };

  const getTypeIcon = (t) => {
    if (t === 'cita') return <BookOpen size={14} className="mt-0.5 opacity-70" />;
    return <AlertTriangle size={14} className="mt-0.5 opacity-70" />;
  };

  return (
    <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-800/60 mt-5">
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-300">Registro de Intervenciones</label>
        <p className="text-[10px] text-gray-500 mt-0.5">Las acciones registradas aquí reducirán el nivel de riesgo del estudiante automáticamente (-5% por evento).</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-5 bg-gray-900/40 p-3 rounded-xl border border-gray-800 focus-within:border-gray-600 transition-colors">
        <div className="flex flex-col gap-2">
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Escribe los detalles de la intervención (ej. Cita con psicología completada)..."
            className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none min-h-[60px]"
          />
          <div className="flex items-center justify-between border-t border-gray-800 pt-2 mt-1">
            <div className="flex items-center gap-2">
              <select 
                value={type} 
                onChange={e => setType(e.target.value)}
                className="bg-gray-800 text-xs text-gray-300 border border-gray-700 rounded-lg px-2 py-1 outline-none"
              >
                <option value="cita">Cita / Tutoría</option>
                <option value="llamada">Llamada Familiar</option>
                <option value="revision">Revisión Académica</option>
                <option value="otro">Otro</option>
              </select>
              
              <select 
                value={priority} 
                onChange={e => setPriority(e.target.value)}
                className="bg-gray-800 text-xs text-gray-300 border border-gray-700 rounded-lg px-2 py-1 outline-none"
              >
                <option value="low">Prioridad Baja</option>
                <option value="medium">Prioridad Media</option>
                <option value="high">Prioridad Alta</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              disabled={saving || !text.trim()}
              className="btn-primary !w-auto !py-1.5 !px-4 text-xs h-8 flex items-center"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <><Send size={12} /><span>Registrar</span></>}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-3 max-h-52 overflow-y-auto custom-scrollbar pr-1">
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 size={20} className="animate-spin text-gray-500" /></div>
        ) : interventions.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-2">Sin intervenciones previas registradas.</p>
        ) : (
          interventions.map(int => (
            <div key={int.id} className="bg-gray-900/40 border border-gray-800/80 rounded-lg p-3 flex gap-3">
              <div className="flex-shrink-0">
                {getTypeIcon(int.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-sm whitespace-pre-wrap">{int.text}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock size={10} /> 
                    {new Date(int.date).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border ${getPriorityClass(int.priority)}`}>
                    {int.priority === 'high' ? 'Crítica' : int.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
