import type { OrdenEstado } from '@/types/index';
import { clsx } from 'clsx';

const COLORS: Record<OrdenEstado, string> = {
  Pendiente:   'bg-yellow-500/15  text-yellow-400  border-yellow-500/30',
  'En Proceso': 'bg-blue-500/15   text-blue-400    border-blue-500/30',
  Terminada:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Cobrada:     'bg-gray-500/15   text-gray-400    border-gray-500/30',
};

export function StatusBadge({ estado }: { estado: OrdenEstado }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        COLORS[estado],
      )}
    >
      {estado}
    </span>
  );
}
