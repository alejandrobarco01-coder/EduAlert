import { useState } from 'react';
import { Calendar, MessageSquare, Plus, Loader2 } from 'lucide-react';

const INTERVENTION_TYPES = [
  'Llamada telefónica',
  'Entrevista presencial',
  'Correo electrónico',
  'Remisión a Bienestar',
  'Tutoría académica',
  'Seguimiento por WhatsApp',
  'Intervención psicosocial'
];

export default function InterventionForm({ studentId, onSave }) {
  const [formData, setFormData] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type || !formData.description) return;

    setLoading(true);
    try {
      await onSave(formData);
      setFormData({
        type: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    } catch (error) {
      alert('Error al guardar la intervención');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-800/60 mt-6">
      <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Plus size={16} className="text-uceva-400" />
        Registrar Nueva Intervención
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5 ml-1">Tipo de Acción</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-field w-full text-sm py-2.5"
            >
              <option value="">Seleccionar tipo...</option>
              {INTERVENTION_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5 ml-1">Fecha</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field w-full text-sm py-2.5 pl-9"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5 ml-1">Descripción</label>
          <div className="relative">
            <MessageSquare size={14} className="absolute left-3 top-3 text-gray-500" />
            <textarea
              required
              placeholder="Detalles de la acción realizada..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="input-field w-full text-sm py-2.5 pl-9 resize-none"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !formData.type || !formData.description}
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? <Loader2 size={18} className="animate-spin text-white" /> : <Plus size={18} className="group-hover:scale-110 transition-transform" />}
          Guardar Intervención
        </button>
      </form>
    </div>
  );
}
