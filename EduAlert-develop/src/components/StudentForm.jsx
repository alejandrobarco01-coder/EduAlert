import { useState } from 'react';
import { Plus, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export default function StudentForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentCode: '',
    semester: '',
    program: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (field, value) => {
    let error = null;
    
    switch (field) {
      case 'name':
        if (!value.trim()) error = 'El nombre es obligatorio.';
        break;
      case 'email':
        if (!value.trim()) {
          error = 'El correo es obligatorio.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Formato de correo inválido.';
        } else if (!value.includes('@uceva.edu.co') && !value.includes('@institucional.')) {
           // Asumiendo requerimiento genérico de "@ institucional", validamos dominio de la universidad usual o la palabra clave
           error = 'Debe ser un correo institucional válido.';
        }
        break;
      case 'studentCode':
        if (!value.trim()) {
          error = 'El código es obligatorio.';
        } else if (value.length !== 9) {
          error = 'El código debe tener exactamente 9 dígitos.';
        }
        break;
      case 'semester':
        if (!value) {
          error = 'El semestre es obligatorio.';
        } else {
          const sem = parseInt(value, 10);
          if (sem < 1 || sem > 10) {
            error = 'El semestre debe estar entre 1 y 10.';
          }
        }
        break;
      case 'program':
        if (!value.trim()) error = 'El programa es obligatorio.';
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleBlur = (field) => {
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    let finalValue = value;
    
    // El código estudiantil rechaza letras
    if (field === 'studentCode') {
      finalValue = value.replace(/\D/g, '').slice(0, 9); // solo dígitos, máximo 9
    }
    
    // Semestre rechaza valores no numéricos
    if (field === 'semester') {
      finalValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
    
    // Clear error inline as user types correct values (optional, but good UX)
    if (errors[field]) {
      const error = validateField(field, finalValue);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormEmpty = !formData.name || !formData.email || !formData.studentCode || !formData.semester || !formData.program;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    
    setLoading(true);
    try {
      if (onSave) {
        await onSave(formData);
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: 'Error al enviar el formulario.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl relative w-full max-w-lg mx-auto">
      <div className="mb-6 border-b border-gray-800 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <UserPlus size={20} className="text-uceva-400" />
          Registrar Nuevo Estudiante
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Complete los datos del estudiante con formato institucional validado.
        </p>
      </div>

      {errors.submit && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle size={16} />
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Nombre Completo</label>
          <input
            type="text"
            className={`input-field w-full ${errors.name ? 'border-red-500/50 focus:border-red-500' : ''}`}
            placeholder="Ej. María Sánchez"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1 absolute">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Correo Institucional</label>
          <input
            type="email"
            className={`input-field w-full ${errors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
            placeholder="estudiante@uceva.edu.co o @institucional.edu.co"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1 absolute">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Código Estudiantil</label>
            <input
              type="text"
              className={`input-field w-full ${errors.studentCode ? 'border-red-500/50 focus:border-red-500' : ''}`}
              placeholder="9 dígitos exactos"
              value={formData.studentCode}
              onChange={e => handleChange('studentCode', e.target.value)}
              onBlur={() => handleBlur('studentCode')}
            />
            {errors.studentCode && <p className="text-red-400 text-xs mt-1 absolute">{errors.studentCode}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Semestre</label>
            <input
              type="text"
              className={`input-field w-full ${errors.semester ? 'border-red-500/50 focus:border-red-500' : ''}`}
              placeholder="1 al 10"
              value={formData.semester}
              onChange={e => handleChange('semester', e.target.value)}
              onBlur={() => handleBlur('semester')}
            />
            {errors.semester && <p className="text-red-400 text-xs mt-1 absolute">{errors.semester}</p>}
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Programa / Facultad</label>
          <input
            type="text"
            className={`input-field w-full ${errors.program ? 'border-red-500/50 focus:border-red-500' : ''}`}
            placeholder="Ej. Ingeniería de Sistemas"
            value={formData.program}
            onChange={e => handleChange('program', e.target.value)}
            onBlur={() => handleBlur('program')}
          />
          {errors.program && <p className="text-red-400 text-xs mt-1 absolute">{errors.program}</p>}
        </div>

        <div className="flex gap-3 pt-6 mt-4 border-t border-gray-800">
          <button
            type="submit"
            // El formulario no se puede enviar si hay campos obligatorios vacíos (deshabilitado si form is empty)
            disabled={loading || isFormEmpty}
            className="btn-primary flex-1 py-2.5 flex justify-center items-center gap-2 font-bold disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin text-white" /> : <Plus size={18} />}
            Registrar Estudiante
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary px-6"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
