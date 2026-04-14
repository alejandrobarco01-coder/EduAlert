import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Send, RefreshCw, Loader2, CheckCircle2,
  AlertTriangle, ShieldAlert, Info, User, BookOpen,
  Eye, FileText
} from 'lucide-react';
import { previewNotification, sendNotificationAPI } from '../services/api';

// ─── Risk level config ────────────────────────────────────────────────────────
const RISK_CONFIG = {
  critical: { label: 'CRÍTICO',  color: '#dc2626', bg: 'bg-red-900/20',    border: 'border-red-800/40',    icon: <ShieldAlert size={14} className="text-red-400" /> },
  high:     { label: 'ALTO',     color: '#ea580c', bg: 'bg-orange-900/20', border: 'border-orange-800/40', icon: <AlertTriangle size={14} className="text-orange-400" /> },
  medium:   { label: 'MODERADO', color: '#d97706', bg: 'bg-amber-900/20',  border: 'border-amber-800/40',  icon: <Info size={14} className="text-amber-400" /> },
  low:      { label: 'BAJO',     color: '#16a34a', bg: 'bg-green-900/20',  border: 'border-green-800/40',  icon: <CheckCircle2 size={14} className="text-green-400" /> },
};

/**
 * NotificationPreview
 * Renders a live preview of the dynamic email alert for a student,
 * with an option to send it manually.
 */
export default function NotificationPreview({ student }) {
  const [preview, setPreview]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [sending, setSending]       = useState(false);
  const [sent, setSent]             = useState(null);   // { timestamp, subject }
  const [error, setError]           = useState(null);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSent(null);
    try {
      const data = await previewNotification(student.id);
      setPreview(data);
    } catch (err) {
      setError(err.message || 'Error cargando la vista previa');
    } finally {
      setLoading(false);
    }
  }, [student.id]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      const result = await sendNotificationAPI(student.id);
      setSent(result);
    } catch (err) {
      setError(err.message || 'Error al enviar la notificación');
    } finally {
      setSending(false);
    }
  };

  const cfg = RISK_CONFIG[student.riskLevel] || RISK_CONFIG.low;

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 size={36} className="animate-spin text-uceva-500" />
        <p className="text-sm text-gray-500">Generando vista previa del correo...</p>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="w-14 h-14 bg-red-900/20 border border-red-800/30 rounded-2xl flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div>
          <p className="text-red-400 font-bold text-sm mb-1">Error al generar la vista previa</p>
          <p className="text-gray-500 text-xs max-w-xs">{error}</p>
        </div>
        <button
          onClick={loadPreview}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-bold rounded-xl transition-all"
        >
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header info bar ─────────────────────────────────────────────── */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Mail size={14} className="text-uceva-400" />
            Vista Previa del Correo
          </div>
          <button
            onClick={loadPreview}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
            title="Regenerar con datos actuales"
          >
            <RefreshCw size={12} /> Actualizar
          </button>
        </div>

        {/* Recipient & subject */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs">
            <span className="text-gray-600 font-bold uppercase w-14 flex-shrink-0 pt-0.5">Para:</span>
            <span className="text-gray-300">{preview.student.email}</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <span className="text-gray-600 font-bold uppercase w-14 flex-shrink-0 pt-0.5">Asunto:</span>
            <span className="text-gray-200 font-medium leading-relaxed">{preview.subject}</span>
          </div>
        </div>
      </div>

      {/* ── Risk summary pills ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <User size={14} className="text-uceva-400 mx-auto mb-1" />
          <p className="text-[10px] text-gray-600 uppercase font-bold mb-1">Estudiante</p>
          <p className="text-xs text-white font-semibold truncate">{preview.student.name.split(' ').slice(0,2).join(' ')}</p>
        </div>
        <div className={`${cfg.bg} border ${cfg.border} rounded-xl p-3 text-center`}>
          <div className="flex justify-center mb-1">{cfg.icon}</div>
          <p className="text-[10px] text-gray-600 uppercase font-bold mb-1">Índice de Riesgo</p>
          <p className="text-lg font-black" style={{ color: cfg.color }}>{preview.student.riskIndex}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <BookOpen size={14} className="text-blue-400 mx-auto mb-1" />
          <p className="text-[10px] text-gray-600 uppercase font-bold mb-1">Factores</p>
          <p className="text-lg font-black text-blue-400">{preview.factors.length}</p>
        </div>
      </div>

      {/* ── Preview body ────────────────────────────────────────────────── */}
      <div className="border border-gray-800 rounded-2xl overflow-hidden bg-gray-950">
        <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <span className="text-[10px] text-gray-600 ml-2 font-mono">correo simulado · EduAlert</span>
        </div>
        <div className="overflow-auto max-h-96 custom-scrollbar">
          <iframe
            srcDoc={preview.html}
            title="Email preview"
            className="w-full border-none"
            style={{ minHeight: '480px', background: '#030712' }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* ── Active factors list ─────────────────────────────────────────── */}
      {preview.factors.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">
            Factores incluidos en el correo ({preview.factors.length})
          </p>
          <div className="space-y-1.5">
            {preview.factors.map((f, i) => (
              <div
                key={f.id || i}
                className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-2"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                <span className="text-xs text-gray-300 font-medium">{f.name}</span>
                {f.weight && (
                  <span className="ml-auto text-[10px] text-gray-600 font-mono">
                    peso: {f.weight}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Success confirmation ────────────────────────────────────────── */}
      {sent && (
        <div className="flex items-start gap-3 bg-green-900/20 border border-green-800/40 rounded-2xl p-4 animate-fade-in">
          <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-green-300">¡Notificación enviada exitosamente!</p>
            <p className="text-xs text-gray-500 mt-1">
              Destinatario: <span className="text-gray-400">{sent.recipient}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Fecha: <span className="text-gray-400">{sent.timestamp}</span>
            </p>
          </div>
        </div>
      )}

      {/* ── Send button ──────────────────────────────────────────────────── */}
      {!sent && (
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-uceva-700 to-uceva-600 hover:from-uceva-600 hover:to-uceva-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-uceva-900/30 active:scale-[0.98]"
          id="send-notification-btn"
        >
          {sending
            ? <><Loader2 size={18} className="animate-spin" /> Enviando alerta...</>
            : <><Send size={18} /> Enviar Alerta por Correo</>
          }
        </button>
      )}

      {sent && (
        <button
          onClick={() => { setSent(null); loadPreview(); }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 font-bold rounded-2xl transition-all text-sm"
        >
          <RefreshCw size={15} /> Enviar otra notificación
        </button>
      )}
    </div>
  );
}
