import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { fetchStudentRiskHistory } from '../services/api';
import { Loader2 } from 'lucide-react';

export default function StudentRiskHistory({ studentId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    
    setLoading(true);
    fetchStudentRiskHistory(studentId)
      .then(history => {
        // Reverse array because DB returns newest first, but chart should show oldest to newest (left to right)
        const sorted = [...history].reverse();
        const chartData = sorted.map(record => ({
          ...record,
          dateFormatted: new Date(record.timestamp).toLocaleDateString('es-ES', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }));
        setData(chartData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-gray-800/40 rounded-xl border border-gray-800/60 mt-5">
        <Loader2 className="animate-spin text-uceva-400" size={24} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-800/60 mt-5 text-center">
        <p className="text-gray-400 text-sm">No hay histórico de riesgos registrado para este estudiante todavía.</p>
        <p className="text-gray-500 text-xs mt-1">El histórico se comenzará a generar al actualizar el checklist de factores o intervenciones.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const colorClass = val >= 60 ? 'text-red-400' : val >= 35 ? 'text-orange-400' : 'text-uceva-400';
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 text-xs mb-1">{label}</p>
          <p className={`font-bold ${colorClass}`}>Riesgo: {val}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-800/60 mt-5">
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-300">Evolución del Índice de Riesgo</label>
        <p className="text-[10px] text-gray-500 mt-0.5">Muestra cómo varía el riesgo con cada factor o intervención evaluada</p>
      </div>
      
      <div className="h-56 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="dateFormatted" 
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#4B5563' }}
              minTickGap={30}
            />
            <YAxis 
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              ticks={[0, 35, 60, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Threshold lines visually indicating risk levels */}
            <ReferenceLine y={60} stroke="#EF4444" strokeOpacity={0.2} strokeDasharray="3 3" />
            <ReferenceLine y={35} stroke="#F97316" strokeOpacity={0.2} strokeDasharray="3 3" />

            <Line 
              type="monotone" 
              dataKey="riskValue" 
              stroke="#0ea5e9" /* uceva-500 equivalent */
              strokeWidth={3}
              dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#38bdf8', stroke: '#0369a1', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
