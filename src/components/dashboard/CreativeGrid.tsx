import { Image, Video } from 'lucide-react';
import type { CreativePerformance } from '@/data/mockData';

interface Props {
  data: CreativePerformance[];
}

export function CreativeGrid({ data }: Props) {
  const best = data.reduce((a, b) => a.ctr > b.ctr ? a : b);

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Performance por Criativo</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.map(c => (
          <div
            key={c.id}
            className={`p-3 rounded-lg border transition-all ${
              c.id === best.id
                ? 'border-primary/40 bg-primary/5'
                : 'border-border/50 bg-secondary/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center">
                {c.type === 'video' ? (
                  <Video className="w-5 h-5 text-chart-3" />
                ) : (
                  <Image className="w-5 h-5 text-chart-2" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{c.name}</p>
                {c.id === best.id && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                    Melhor CTR
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <p className="text-muted-foreground">CTR</p>
                <p className="font-semibold text-foreground">{c.ctr.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Conv.</p>
                <p className="font-semibold text-foreground">{c.conversions}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gasto</p>
                <p className="font-semibold text-foreground">R${c.spend.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
