import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Entrega,
  CreateEntregaPayload,
  UpdateEntregaPayload,
} from '@/types/index';

export function useEntregas() {
  return useQuery<Entrega[]>({
    queryKey: ['entregas'],
    queryFn: async () => {
      const res = await fetch('/api/entregas');
      if (!res.ok) throw new Error('Error al cargar entregas');
      return res.json();
    },
  });
}

export function useCreateEntrega() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEntregaPayload) => {
      const res = await fetch('/api/entregas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear entrega');
      return res.json() as Promise<Entrega>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entregas'] }),
  });
}

export function useUpdateEntrega() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateEntregaPayload & { id: number }) => {
      const res = await fetch(`/api/entregas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar entrega');
      return res.json() as Promise<Entrega>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entregas'] }),
  });
}

export function useDeleteEntrega() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/entregas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar entrega');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entregas'] }),
  });
}
