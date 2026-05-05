import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Proveedor } from '@/types/index';

export function useProveedores() {
  return useQuery<Proveedor[]>({
    queryKey: ['proveedores'],
    queryFn: async () => {
      const res = await fetch('/api/proveedores');
      if (!res.ok) throw new Error('Error al cargar proveedores');
      return res.json();
    },
  });
}

export function useCreateProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Proveedor, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const res = await fetch('/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear proveedor');
      return res.json() as Promise<Proveedor>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }),
  });
}

export function useUpdateProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Proveedor> & { id: number }) => {
      const res = await fetch(`/api/proveedores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar proveedor');
      return res.json() as Promise<Proveedor>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }),
  });
}

export function useDeleteProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar proveedor');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }),
  });
}
