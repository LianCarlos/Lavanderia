import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'yellow' | 'blue' | 'emerald' | 'gray' | 'green';
}

const COLOR_MAP = {
  yellow:  { bg: 'bg-yellow-500/10',  text: 'text-yellow-400'  },
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400'    },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  gray:    { bg: 'bg-gray-500/10',    text: 'text-gray-400'    },
  green:   { bg: 'bg-green-500/10',   text: 'text-green-400'   },
};

export function StatCard({ title, value, icon: Icon, color = 'emerald' }: StatCardProps) {
  const { bg, text } = COLOR_MAP[color];
  return (
    <div className="rounded-xl border border-white/5 bg-surface-100 p-5 flex items-center gap-4">
      <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl shrink-0', bg)}>
        <Icon className={clsx('h-6 w-6', text)} />
      </div>
      <div>
        <p className="text-sm text-white/50">{title}</p>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
      </div>
    </div>
  );
}
