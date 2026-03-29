import { useState } from 'react';
import { Calendar } from 'lucide-react';

const PRESETS = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: 'Mês atual', value: 'month' },
  { label: 'Ano atual', value: 'year' },
] as const;

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function DateFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Calendar className="w-4 h-4 text-muted-foreground mr-1" />
      {PRESETS.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`text-xs px-3 py-1.5 rounded-md transition-all ${
            value === p.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
