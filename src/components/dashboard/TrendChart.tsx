import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TrendPoint } from '@/data/mockData';

const METRICS = [
  { key: 'spend', label: 'Investimento', color: 'hsl(187, 72%, 50%)' },
  { key: 'impressions', label: 'Impressões', color: 'hsl(160, 60%, 45%)' },
  { key: 'clicks', label: 'Cliques', color: 'hsl(38, 92%, 50%)' },
  { key: 'conversions', label: 'Conversões', color: 'hsl(280, 60%, 55%)' },
] as const;

interface TrendChartProps {
  data: TrendPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  const [activeMetrics, setActiveMetrics] = useState<string[]>(['spend', 'conversions']);

  const toggle = (key: string) => {
    setActiveMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const formatted = data.map(d => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
  }));

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Tendência de Performance</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => toggle(m.key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              activeMetrics.includes(m.key)
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: m.color }} />
            {m.label}
          </button>
        ))}
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
            <XAxis dataKey="dateLabel" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 44%, 9%)',
                border: '1px solid hsl(222, 30%, 16%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 92%)',
                fontSize: 12,
              }}
            />
            {METRICS.filter(m => activeMetrics.includes(m.key)).map(m => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                stroke={m.color}
                strokeWidth={2}
                dot={false}
                name={m.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
