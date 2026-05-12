import { useState, useEffect } from 'react';
import { fetchFactors, createFactorAPI, deleteFactorAPI } from '../services/api';
import { Plus, Trash2, Loader2, X, AlertCircle } from 'lucide-react';

export default function FactorsManagement() {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Forms
  const [isAdding, setIsAdding] = useState(false);
  const [newFactor, setNewFactor] = useState({ name: '', category: 'Académico', weight: 1 });

  const categories = ['Académico', 'Socioeconómico', 'Familiar', 'Salud', 'Personal'];

  useEffect(() => {
    loadFactors();
  }, []);

  const loadFactors = async () => {
    try {
      setLoading(true);
      const data = await fetchFactors();
      setFactors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newFactor.name.trim()) return;
    try {
      const created = await createFactorAPI(newFactor);
      setFactors([...factors, created]);
      setIsAdding(false);
      setNewFactor({ name: '', category: 'Académico', weight: 1 });
    } catch (err) {
      alert('Error al crear factor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar factor?')) return;
    try {
      await deleteFactorAPI(id);
      setFactors(factors.filter(f => f.id !== id));
    } catch (err) {
      alert('Error al eliminar factor');
    }
  };

  // Grouping
  const groupedFactors = factors.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-uceva-500" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Factores de Riesgo</h2>
          <p className="text-sm text-gray-500 mt-0.5">Configuración de checklist y pesos</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="btn-primary !w-auto">
          {isAdding ? <X size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
          {isAdding ? 'Cancelar' : 'Nuevo Factor'}
        </button>
      </div>

      {error && <div className="bg-red-900/40 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3 border border-red-800"><AlertCircle size={20} />{error}</div>}

      {isAdding && (
        <div className="card p-5 mb-6 border border-uceva-800/50">
          <h3 className="font-semibold text-white mb-4">Añadir Factor</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre</label>
              <input type="text" value={newFactor.name} onChange={e => setNewFactor({...newFactor, name: e.target.value})} className="input-field" placeholder="Ej: Inasistencias reiteradas" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Categoría</label>
              <select value={newFactor.category} onChange={e => setNewFactor({...newFactor, category: e.target.value})} className="input-field">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Peso (1-10)</label>
              <input type="number" min="1" max="10" value={newFactor.weight} onChange={e => setNewFactor({...newFactor, weight: Number(e.target.value)})} className="input-field" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleCreate} className="btn-primary !w-auto">Guardar Factor</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {categories.map(cat => {
          const catsFactors = groupedFactors[cat];
          if (!catsFactors || catsFactors.length === 0) return null;
          return (
            <div key={cat} className="card p-5">
              <h3 className="font-semibold text-white mb-4 border-b border-gray-800 pb-2">{cat}</h3>
              <div className="space-y-3">
                {catsFactors.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-3 bg-gray-900/50 border border-gray-800 rounded-lg group hover:bg-gray-800 transition-colors">
                    <div>
                      <p className="text-gray-200 font-medium text-sm">{f.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">Peso: {f.weight}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(f.id)} className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-gray-900">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {factors.length === 0 && <p className="text-gray-500 text-center py-10">No hay factores registrados.</p>}
      </div>
    </div>
  );
}
