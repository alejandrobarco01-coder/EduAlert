import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function FactorsChecklist({ factors, studentFactorIds, onSave }) {
  const [selectedIds, setSelectedIds] = useState(new Set(studentFactorIds || []));
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setSelectedIds(new Set(studentFactorIds || []));
  }, [studentFactorIds]);

  const toggleFactor = async (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    
    // Auto-save immediately
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onSave(Array.from(newSelected));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error('Error auto-saving factor:', e);
      // Revert state if the API call fails
      setSelectedIds(new Set(studentFactorIds || []));
    } finally {
      setSaving(false);
    }
  };

  if (!factors || factors.length === 0) {
    return <p className="text-sm text-gray-500 my-4">No hay factores de riesgo configurados en el sistema.</p>;
  }

  // Group by category
  const grouped = factors.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  return (
    <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-800/60 mt-5">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-medium text-gray-300">Checklist de Factores de Riesgo</label>
        <div className="text-xs font-medium h-5 flex items-center">
          {saving ? (
            <span className="text-uceva-400 flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Guardando...</span>
          ) : saveSuccess ? (
            <span className="text-green-400">✓ Guardado</span>
          ) : (
            <span className="text-gray-500">Autoguardado activado</span>
          )}
        </div>
      </div>

      <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {Object.entries(grouped).map(([category, catFactors]) => (
          <div key={category}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{category}</p>
            <div className="space-y-2">
              {catFactors.map(f => (
                <label key={f.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-900/40 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer group">
                  <div className="relative flex items-start pt-0.5">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={selectedIds.has(f.id)}
                      onChange={() => toggleFactor(f.id)}
                      disabled={saving}
                    />
                    <div className="w-5 h-5 rounded border border-gray-600 bg-gray-800 peer-checked:bg-uceva-600 peer-checked:border-uceva-500 transition-colors flex items-center justify-center">
                      {selectedIds.has(f.id) && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${selectedIds.has(f.id) ? 'text-white font-semibold' : 'text-gray-300 group-hover:text-gray-200'}`}>{f.name}</p>
                    <p className="text-[10px] text-gray-500">Impacto en riesgo: Nivel {f.weight}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
