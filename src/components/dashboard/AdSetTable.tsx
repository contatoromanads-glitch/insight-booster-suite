import { Circle } from 'lucide-react';
import type { AdSetPerformance } from '@/data/mockData';

interface Props {
  data: AdSetPerformance[];
}

export function AdSetTable({ data }: Props) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Conjuntos de Anúncios</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">Nome</th>
              <th className="text-center py-2 font-medium">Status</th>
              <th className="text-right py-2 font-medium">CTR</th>
              <th className="text-right py-2 font-medium">Conv.</th>
              <th className="text-right py-2 font-medium">CPA</th>
              <th className="text-right py-2 font-medium">ROAS</th>
              <th className="text-right py-2 font-medium">Gasto</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="py-2.5 text-foreground font-medium">{row.name}</td>
                <td className="text-center py-2.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    row.status === 'active'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}>
                    <Circle className="w-1.5 h-1.5 fill-current" />
                    {row.status === 'active' ? 'Ativo' : 'Pausado'}
                  </span>
                </td>
                <td className="text-right py-2.5 text-muted-foreground">{row.ctr.toFixed(1)}%</td>
                <td className="text-right py-2.5 text-primary font-medium">{row.conversions}</td>
                <td className="text-right py-2.5 text-muted-foreground">R$ {row.cpa.toFixed(2)}</td>
                <td className="text-right py-2.5 text-success font-medium">{row.roas.toFixed(1)}x</td>
                <td className="text-right py-2.5 text-muted-foreground">R$ {row.spend.toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
