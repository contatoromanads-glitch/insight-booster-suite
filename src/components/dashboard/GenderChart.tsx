import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { GenderPerformance } from '@/data/mockData';

const COLORS = ['hsl(187, 72%, 50%)', 'hsl(280, 60%, 55%)', 'hsl(38, 92%, 50%)'];

interface Props {
  data: GenderPerformance[];
}

export function GenderChart({ data }: Props) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Insights de Público (Gênero)</h3>
      <div className="flex items-center gap-6">
        <div className="w-36 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="gender" cx="50%" cy="50%" innerRadius={35} outerRadius={60} strokeWidth={0}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 44%, 9%)', border: '1px solid hsl(222, 30%, 16%)', borderRadius: '8px', color: 'hsl(210, 40%, 92%)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2.5">
          {data.map((g, i) => (
            <div key={g.gender} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-xs text-muted-foreground w-20">{g.gender}</span>
              <span className="text-xs font-semibold text-foreground">{g.value}%</span>
              <span className="text-[10px] text-muted-foreground">({g.conversions} conv.)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
