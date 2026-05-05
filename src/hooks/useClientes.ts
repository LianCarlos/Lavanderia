import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Cliente } from '@/types/index';

const fetchClientes = async (q?: string): Promise<Cliente[]> => {
  const url = q ? `/api/clientes?q=${encodeURIComponent(q)}` : '/api/clientes';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar clientes');
  return res.json();
};

export function useClientes(q?: string) {
  return useQuery({ queryKey: ['clientes', q], queryFn: () => fetchClientes(q) });
}

export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear cliente');
      return res.json() as Promise<Cliente>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useUpdateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Cliente> & { id: number }) => {
      const res = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar cliente');
      return res.json() as Promise<Cliente>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar cliente');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}
