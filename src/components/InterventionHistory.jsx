import { Calendar, MessageSquare, Phone, User, Mail, Shield, Smartphone, HeartPulse } from 'lucide-react';

const ICON_MAP = {
  'Llamada telefónica': Phone,
  'Entrevista presencial': User,
  'Correo electrónico': Mail,
  'Remisión a Bienestar': Shield,
  'Tutoría académica': MessageSquare,
  'Seguimiento por WhatsApp': Smartphone,
  'Intervención psicosocial': HeartPulse
};

export default function InterventionHistory({ interventions }) {
  if (!interventions || interventions.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-800/20 rounded-xl border border-dashed border-gray-800 mt-6">
        <p className="text-sm text-gray-500">No hay intervenciones registradas para este estudiante.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-uceva-400" />
        Historial de Intervenciones
      </h4>
      <div className="space-y-4 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-800">
        {interventions.map((item) => {
          const Icon = ICON_MAP[item.type] || MessageSquare;
          return (
            <div key={item.id} className="relative pl-12 group">
              {/* Timeline circle */}
              <div className="absolute left-3 top-0 w-4 h-4 rounded-full bg-gray-900 border-2 border-uceva-600 z-10 group-hover:scale-110 transition-transform" />
              
              <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-800 hover:border-uceva-800/40 transition-colors shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-uceva-900/40 text-uceva-400 border border-uceva-800/50 text-[10px] font-bold uppercase tracking-wider">
                    <Icon size={10} />
                    {item.type}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                    <Calendar size={12} />
                    {new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-medium">{item.description}</p>
                <div className="mt-2.5 pt-2.5 border-t border-gray-800/50 flex items-center justify-end">
                  <span className="text-[10px] text-gray-600 font-mono">ID: {item.id}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
