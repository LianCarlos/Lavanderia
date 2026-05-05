import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Inventario } from '@/types/index';

export function useInventario() {
  return useQuery<Inventario[]>({
    queryKey: ['inventario'],
    queryFn: async () => {
      const res = await fetch('/api/inventario');
      if (!res.ok) throw new Error('Error al cargar inventario');
      return res.json();
    },
  });
}

export function useCreateInventario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Inventario, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const res = await fetch('/api/inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear item');
      return res.json() as Promise<Inventario>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventario'] }),
  });
}

export function useUpdateInventario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Inventario> & { id: number }) => {
      const res = await fetch(`/api/inventario/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar item');
      return res.json() as Promise<Inventario>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventario'] }),
  });
}

export function useAjustarStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, delta }: { id: number; delta: number }) => {
      const res = await fetch(`/api/inventario/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Error'); }
      return res.json() as Promise<Inventario>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventario'] }),
  });
}

export function useDeleteInventario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/inventario/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar item');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventario'] }),
  });
}
