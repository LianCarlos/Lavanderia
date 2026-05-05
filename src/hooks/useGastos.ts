import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Gasto, CreateGastoPayload, UpdateGastoPayload } from '@/types/index';

export function useGastos(filters?: { categoria?: string; fecha_desde?: string }) {
  const params = new URLSearchParams();
  if (filters?.categoria)   params.set('categoria',   filters.categoria);
  if (filters?.fecha_desde) params.set('fecha_desde', filters.fecha_desde);
  const qs = params.toString();
  return useQuery<Gasto[]>({
    queryKey: ['gastos', filters],
    queryFn: async () => {
      const res = await fetch(`/api/gastos${qs ? '?' + qs : ''}`);
      if (!res.ok) throw new Error('Error al cargar gastos');
      return res.json();
    },
  });
}

export function useCreateGasto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGastoPayload) => {
      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear gasto');
      return res.json() as Promise<Gasto>;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gastos'] }); qc.invalidateQueries({ queryKey: ['balance'] }); },
  });
}

export function useUpdateGasto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateGastoPayload & { id: number }) => {
      const res = await fetch(`/api/gastos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar gasto');
      return res.json() as Promise<Gasto>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gastos'] });
      qc.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}

export function useDeleteGasto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/gastos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar gasto');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gastos'] }); qc.invalidateQueries({ queryKey: ['balance'] }); },
  });
}
