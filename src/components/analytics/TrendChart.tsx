'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface TrendDataPoint {
  date: string;
  score: number;
  sessions?: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  title?: string;
  height?: number;
  showLabels?: boolean;
}

export function TrendChart({
  data,
  title = 'Health Trend',
  height = 200,
  showLabels = true,
}: TrendChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return { linePath: '', areaPath: '', points: [] as (TrendDataPoint & { x: number; y: number })[] };

    const maxScore = Math.max(...data.map((d) => d.score), 100);
    const minScore = Math.min(...data.map((d) => d.score), 0);
    const range = maxScore - minScore || 1;

    const padding = 40;
    const chartWidth = 100; // percentage based
    const chartHeight = height - padding * 2;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * 100;
      const y = padding + ((maxScore - d.score) / range) * chartHeight;
      return { x, y, ...d };
    });

    // SVG path for line
    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    // SVG path for area fill
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { linePath, areaPath, points };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          {title}
        </h3>
        <div
          className="flex items-center justify-center"
          style={{ height, color: 'var(--color-calm-400)' }}
        >
          <p className="text-sm">No data yet. Start a conversation to see your trends.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={40 + ((100 - y) / 100) * (height - 80)}
              x2="100"
              y2={40 + ((100 - y) / 100) * (height - 80)}
              stroke="var(--color-calm-100)"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Area fill */}
          <motion.path
            d={chartData.areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 0.5 }}
          />

          {/* Line */}
          <motion.path
            d={chartData.linePath}
            fill="none"
            stroke="var(--color-calm-600)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Data points */}
          {chartData.points.map((point, i) => (
            <motion.circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="var(--color-calm-700)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-calm-400)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-calm-400)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Y-axis labels */}
        {showLabels && (
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-10 text-xs" style={{ color: 'var(--color-calm-400)' }}>
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>
        )}

        {/* X-axis labels */}
        {showLabels && data.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs px-2" style={{ color: 'var(--color-calm-400)' }}>
            <span>{data[0].date}</span>
            {data.length > 2 && <span>{data[Math.floor(data.length / 2)].date}</span>}
            <span>{data[data.length - 1].date}</span>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center justify-between text-sm" style={{ color: 'var(--color-calm-500)' }}>
        <span>
          {data.length} session{data.length !== 1 ? 's' : ''} tracked
        </span>
        <span>
          Avg: {Math.round(data.reduce((a, b) => a + b.score, 0) / data.length)}
        </span>
      </div>
    </div>
  );
}

// Mini sparkline version
export function TrendSparkline({
  data,
  width = 80,
  height = 24,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  const path = useMemo(() => {
    if (data.length < 2) return '';

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [data, width, height]);

  if (data.length < 2) {
    return <div style={{ width, height }} />;
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={path}
        fill="none"
        stroke="var(--color-calm-500)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
