import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { AgePerformance } from '@/data/mockData';

interface Props {
  data: AgePerformance[];
}

export function AgeChart({ data }: Props) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Performance por Idade</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="ageGroup" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 44%, 9%)', border: '1px solid hsl(222, 30%, 16%)', borderRadius: '8px', color: 'hsl(210, 40%, 92%)', fontSize: 12 }} />
            <Bar dataKey="conversions" fill="hsl(160, 60%, 45%)" radius={[4, 4, 0, 0]} name="Conversões" />
            <Bar dataKey="clicks" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Cliques" opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
