import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Personal } from '@/types/index';

export function usePersonal() {
  return useQuery<Personal[]>({
    queryKey: ['personal'],
    queryFn: async () => {
      const res = await fetch('/api/personal');
      if (!res.ok) throw new Error('Error al cargar personal');
      return res.json();
    },
  });
}

export function useCreatePersonal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Personal, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const res = await fetch('/api/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear personal');
      return res.json() as Promise<Personal>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personal'] }),
  });
}

export function useUpdatePersonal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Personal> & { id: number }) => {
      const res = await fetch(`/api/personal/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar personal');
      return res.json() as Promise<Personal>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personal'] }),
  });
}

export function useDeletePersonal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/personal/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar personal');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personal'] }),
  });
}
