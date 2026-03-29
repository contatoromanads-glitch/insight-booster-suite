import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  previousValue?: number;
  currentValue?: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  delay?: number;
}

export function KPICard({ title, value, previousValue, currentValue, prefix, suffix, icon, delay = 0 }: KPICardProps) {
  const change = previousValue && currentValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : undefined;

  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className="glass-card p-4 kpi-glow animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className="text-primary/60">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-foreground">
        {prefix}{value}{suffix}
      </div>
      {change !== undefined && (
        <div className={cn(
          'flex items-center gap-1 mt-2 text-xs font-medium',
          isPositive ? 'text-success' : 'text-destructive'
        )}>
          {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(change).toFixed(1)}% vs período anterior
        </div>
      )}
    </div>
  );
}
