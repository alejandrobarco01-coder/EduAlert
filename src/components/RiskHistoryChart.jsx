import { useState, useEffect, useRef, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, Loader2 } from 'lucide-react';

/**
 * RiskHistoryChart — Gráfica SVG interactiva de historial de riesgo.
 * Muestra la evolución del índice de riesgo promedio a lo largo de los últimos meses.
 * Se adapta automáticamente a diferentes tamaños de pantalla.
 */
export default function RiskHistoryChart({ data = [], loading = false }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 280 });
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [animated, setAnimated] = useState(false);

  // ─── Responsive resize ──────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setDimensions({ width: w, height: Math.max(200, Math.min(300, w * 0.45)) });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // ─── Trigger animation on mount ────────────────────────────────────────────
  useEffect(() => {
    if (data.length > 0 && !loading) {
      const timer = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [data, loading]);

  // ─── Chart geometry ─────────────────────────────────────────────────────────
  const padding = { top: 20, right: 20, bottom: 40, left: 45 };
  const chartW = dimensions.width - padding.left - padding.right;
  const chartH = dimensions.height - padding.top - padding.bottom;

  // ─── Computed chart data ────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (!data.length) return { points: [], path: '', areaPath: '', yTicks: [], trend: 0 };

    const maxVal = Math.max(...data.map(d => d.avgRisk), 80);
    const minVal = Math.min(...data.map(d => d.avgRisk), 0);
    const range = maxVal - minVal || 1;

    const points = data.map((d, i) => ({
      x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
      y: padding.top + chartH - ((d.avgRisk - minVal) / range) * chartH,
      ...d,
    }));

    // SVG path for the line
    const path = points.map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      // Smooth curve using cubic bezier
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
    }).join(' ');

    // Area fill path
    const areaPath = `${path} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    // Y-axis ticks
    const tickCount = 5;
    const yTicks = Array.from({ length: tickCount }, (_, i) => {
      const val = minVal + (range / (tickCount - 1)) * i;
      const y = padding.top + chartH - ((val - minVal) / range) * chartH;
      return { val: Math.round(val), y };
    });

    // Trend calculation
    const trend = data.length >= 2
      ? data[data.length - 1].avgRisk - data[data.length - 2].avgRisk
      : 0;

    return { points, path, areaPath, yTicks, trend, maxVal, minVal };
  }, [data, chartW, chartH, padding.left, padding.top]);

  // ─── Risk zone thresholds (horizontal bands) ───────────────────────────────
  const riskZones = useMemo(() => {
    if (!data.length) return [];
    const { maxVal, minVal } = chartData;
    const range = (maxVal - minVal) || 1;

    const zones = [
      { label: 'Alto', threshold: 60, color: 'rgba(248, 113, 113, 0.06)', border: 'rgba(248, 113, 113, 0.15)' },
      { label: 'Medio', threshold: 35, color: 'rgba(251, 146, 60, 0.04)', border: 'rgba(251, 146, 60, 0.1)' },
    ];

    return zones.map(z => {
      const y = padding.top + chartH - ((z.threshold - minVal) / range) * chartH;
      return { ...z, y: Math.max(padding.top, Math.min(padding.top + chartH, y)) };
    }).filter(z => z.y >= padding.top && z.y <= padding.top + chartH);
  }, [chartData, data, padding, chartH]);

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-900/50 to-violet-800/30 border border-violet-700/30 flex items-center justify-center">
            <TrendingUp size={16} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Historial de Riesgo</h3>
            <p className="text-[11px] text-gray-500">Cargando datos históricos...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="text-violet-400 animate-spin" />
        </div>
      </div>
    );
  }

  // ─── Empty State ────────────────────────────────────────────────────────────
  if (!data.length) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-900/50 to-violet-800/30 border border-violet-700/30 flex items-center justify-center">
            <TrendingUp size={16} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Historial de Riesgo</h3>
            <p className="text-[11px] text-gray-500">No hay datos disponibles</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12 text-gray-600 text-sm">
          Sin datos de historial para mostrar
        </div>
      </div>
    );
  }

  const TrendIcon = chartData.trend > 2 ? TrendingUp : chartData.trend < -2 ? TrendingDown : Minus;
  const trendColor = chartData.trend > 2 ? 'text-red-400' : chartData.trend < -2 ? 'text-emerald-400' : 'text-gray-400';
  const trendBg = chartData.trend > 2 ? 'bg-red-900/30 border-red-800/30' : chartData.trend < -2 ? 'bg-emerald-900/30 border-emerald-800/30' : 'bg-gray-800/50 border-gray-700/30';
  const trendLabel = chartData.trend > 2 ? 'Tendencia al alza' : chartData.trend < -2 ? 'Tendencia a la baja' : 'Estable';

  return (
    <div className="card p-5 lg:p-6" id="risk-history-chart">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-900/50 to-violet-800/30 border border-violet-700/30 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Historial de Riesgo Institucional</h3>
            <p className="text-[11px] text-gray-500">Evolución del índice promedio de riesgo · Últimos {data.length} meses</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${trendBg} ${trendColor} self-start sm:self-center`}>
          <TrendIcon size={13} />
          <span>{trendLabel}</span>
          {chartData.trend !== 0 && (
            <span className="font-bold">{chartData.trend > 0 ? '+' : ''}{chartData.trend.toFixed(1)}%</span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="w-full">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="overflow-visible"
        >
          <defs>
            {/* Gradient for line */}
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>
            {/* Gradient for area fill */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Clip for animation */}
            <clipPath id="chartClip">
              <rect
                x={padding.left}
                y={padding.top}
                width={animated ? chartW : 0}
                height={chartH}
                style={{ transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </clipPath>
          </defs>

          {/* Risk zone bands */}
          {riskZones.map((zone, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={zone.y}
                x2={padding.left + chartW}
                y2={zone.y}
                stroke={zone.border}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={padding.left + chartW + 4}
                y={zone.y + 3}
                fill={zone.border}
                fontSize={9}
                fontWeight="600"
              >
                {zone.label}
              </text>
            </g>
          ))}

          {/* Grid lines (horizontal) */}
          {chartData.yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={padding.left + chartW}
                y2={tick.y}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={tick.y + 4}
                fill="#6b7280"
                fontSize={10}
                textAnchor="end"
                fontFamily="'Inter', system-ui, sans-serif"
              >
                {tick.val}%
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path
            d={chartData.areaPath}
            fill="url(#areaGradient)"
            clipPath="url(#chartClip)"
          />

          {/* Main line */}
          <path
            d={chartData.path}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            clipPath="url(#chartClip)"
          />

          {/* Data points */}
          {chartData.points.map((p, i) => (
            <g key={i}>
              {/* Invisible hit area */}
              <circle
                cx={p.x}
                cy={p.y}
                r={16}
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              />
              {/* Visible dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint === i ? 6 : 3.5}
                fill={p.avgRisk >= 60 ? '#f87171' : p.avgRisk >= 35 ? '#fb923c' : '#34d399'}
                stroke="#1f2937"
                strokeWidth={2}
                style={{
                  transition: 'r 0.2s ease, opacity 0.3s ease',
                  opacity: animated ? 1 : 0,
                  transitionDelay: `${i * 0.1}s`,
                }}
              />
              {/* Hover tooltip */}
              {hoveredPoint === i && (
                <g>
                  <rect
                    x={p.x - 55}
                    y={p.y - 58}
                    width={110}
                    height={44}
                    rx={8}
                    fill="#111827"
                    stroke="#374151"
                    strokeWidth={1}
                  />
                  <text x={p.x} y={p.y - 39} fill="#e5e7eb" fontSize={11} textAnchor="middle" fontWeight="600"
                    fontFamily="'Inter', system-ui, sans-serif">
                    {p.month}
                  </text>
                  <text x={p.x} y={p.y - 22} fill={p.avgRisk >= 60 ? '#f87171' : p.avgRisk >= 35 ? '#fb923c' : '#34d399'}
                    fontSize={13} textAnchor="middle" fontWeight="700"
                    fontFamily="'Inter', system-ui, sans-serif">
                    {p.avgRisk.toFixed(1)}% · {p.totalStudents} est.
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* X-axis labels */}
          {chartData.points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={padding.top + chartH + 20}
              fill="#6b7280"
              fontSize={10}
              textAnchor="middle"
              fontFamily="'Inter', system-ui, sans-serif"
            >
              {p.month.split(' ')[0].slice(0, 3)}
            </text>
          ))}
        </svg>
      </div>

      {/* Summary cards beneath chart */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {data.length > 0 && (() => {
          const latest = data[data.length - 1];
          return (
            <>
              <div className="bg-gray-800/40 rounded-xl px-3 py-2.5 text-center border border-gray-800/60">
                <p className="text-lg font-bold text-white">{latest.avgRisk.toFixed(1)}%</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Riesgo Actual</p>
              </div>
              <div className="bg-gray-800/40 rounded-xl px-3 py-2.5 text-center border border-gray-800/60">
                <p className="text-lg font-bold text-red-400">{latest.highCount}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">En Alto Riesgo</p>
              </div>
              <div className="bg-gray-800/40 rounded-xl px-3 py-2.5 text-center border border-gray-800/60">
                <p className="text-lg font-bold text-emerald-400">{latest.lowCount}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">En Bajo Riesgo</p>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
