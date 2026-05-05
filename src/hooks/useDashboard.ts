import { useQuery } from '@tanstack/react-query';
import type { DashboardStats, BalanceStats } from '@/types/index';

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Error al cargar estadísticas');
      return res.json();
    },
  });
}

export function useBalanceStats() {
  return useQuery<BalanceStats>({
    queryKey: ['balance'],
    queryFn: async () => {
      const res = await fetch('/api/balance');
      if (!res.ok) throw new Error('Error al cargar balance');
      return res.json();
    },
  });
}
