import { useState } from 'react';
import { Calendar, MessageSquare, Plus, Loader2, AlertCircle } from 'lucide-react';

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = 'El tipo de acción es obligatorio.';
    if (!formData.date) newErrors.date = 'La fecha es obligatoria.';
    if (!formData.description) {
      newErrors.description = 'La descripción es obligatoria.';
    } else if (formData.description.trim().length < 30) {
      newErrors.description = `La descripción debe tener al menos 30 caracteres (actual: ${formData.description.trim().length}).`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      await onSave(formData);
      setFormData({
        type: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    } catch (error) {
      setErrors({ form: 'Error al guardar la intervención. Intente nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for the field being edited
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-800/60 mt-6">
      <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Plus size={16} className="text-uceva-400" />
        Registrar Nueva Intervención
      </h4>
      
      {errors.form && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle size={16} />
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5 ml-1">Tipo de Acción</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className={`input-field w-full text-sm py-2.5 ${errors.type ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            >
              <option value="">Seleccionar tipo...</option>
              {INTERVENTION_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-xs text-red-400 ml-1">{errors.type}</p>}
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5 ml-1">Fecha</label>
            <div className="relative">
              <Calendar size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.date ? 'text-red-400' : 'text-gray-500'}`} />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`input-field w-full text-sm py-2.5 pl-9 ${errors.date ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
            </div>
            {errors.date && <p className="mt-1 text-xs text-red-400 ml-1">{errors.date}</p>}
          </div>
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5 ml-1">Descripción</label>
          <div className="relative">
            <MessageSquare size={14} className={`absolute left-3 top-3 ${errors.description ? 'text-red-400' : 'text-gray-500'}`} />
            <textarea
              placeholder="Detalles de la acción realizada (mínimo 30 caracteres)..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="3"
              className={`input-field w-full text-sm py-2.5 pl-9 resize-none ${errors.description ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            />
          </div>
          {errors.description && <p className="mt-1 text-xs text-red-400 ml-1">{errors.description}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? <Loader2 size={18} className="animate-spin text-white" /> : <Plus size={18} className="group-hover:scale-110 transition-transform" />}
          Guardar Intervención
        </button>
      </form>
    </div>
  );
}
