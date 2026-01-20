'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { PieChartDataPoint } from '@/lib/reportsApi';

interface CategoryPieChartProps {
  title: string;
  data: PieChartDataPoint[];
  colors?: string[];
}

const DEFAULT_COLORS = [
  'var(--color-calm-500)',
  'var(--color-calm-400)',
  'var(--color-calm-600)',
  'var(--color-safe-green)',
  'var(--color-safe-amber)',
  'var(--color-safe-rose)',
];

export function CategoryPieChart({
  title,
  data,
  colors = DEFAULT_COLORS,
}: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          {title}
        </h3>
        <div
          className="flex items-center justify-center"
          style={{ height: 300, color: 'var(--color-calm-400)' }}
        >
          <p className="text-sm">No data available</p>
        </div>
      </motion.div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.label.charAt(0).toUpperCase() + item.label.slice(1),
    value: item.count,
    percentage: item.percentage,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="p-3 rounded-lg shadow-lg"
          style={{
            backgroundColor: 'var(--card-background)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {data.name}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-calm-600)' }}>
            Count: {data.value}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-calm-600)' }}>
            Percentage: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="var(--foreground)"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: 'var(--foreground)' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
