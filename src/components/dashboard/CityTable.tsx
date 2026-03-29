import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { CityPerformance } from '@/data/mockData';

interface Props {
  data: CityPerformance[];
}

export function CityTable({ data }: Props) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Performance por Cidade</h3>
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="city" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 44%, 9%)', border: '1px solid hsl(222, 30%, 16%)', borderRadius: '8px', color: 'hsl(210, 40%, 92%)', fontSize: 12 }} />
            <Bar dataKey="conversions" fill="hsl(187, 72%, 50%)" radius={[0, 4, 4, 0]} name="Conversões" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">Cidade</th>
              <th className="text-right py-2 font-medium">Impressões</th>
              <th className="text-right py-2 font-medium">Cliques</th>
              <th className="text-right py-2 font-medium">Conversões</th>
              <th className="text-right py-2 font-medium">Gasto</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.city} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="py-2 text-foreground">{row.city}</td>
                <td className="text-right py-2 text-muted-foreground">{row.impressions.toLocaleString('pt-BR')}</td>
                <td className="text-right py-2 text-muted-foreground">{row.clicks.toLocaleString('pt-BR')}</td>
                <td className="text-right py-2 text-primary font-medium">{row.conversions.toLocaleString('pt-BR')}</td>
                <td className="text-right py-2 text-muted-foreground">R$ {row.spend.toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
