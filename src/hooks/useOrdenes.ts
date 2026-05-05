import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Orden,
  OrdenEstado,
  ItemOrden,
  CreateOrdenPayload,
  UpdateOrdenPayload,
} from '@/types/index';

export function useOrdenes(filters?: { estado?: string; cliente_id?: number }) {
  const params = new URLSearchParams();
  if (filters?.estado)     params.set('estado',     filters.estado);
  if (filters?.cliente_id) params.set('cliente_id', String(filters.cliente_id));
  const qs = params.toString();
  return useQuery<Orden[]>({
    queryKey: ['ordenes', filters],
    queryFn: async () => {
      const res = await fetch(`/api/ordenes${qs ? '?' + qs : ''}`);
      if (!res.ok) throw new Error('Error al cargar órdenes');
      return res.json();
    },
  });
}

export function useOrden(id: number) {
  return useQuery({
    queryKey: ['ordenes', id],
    queryFn: async () => {
      const res = await fetch(`/api/ordenes/${id}`);
      if (!res.ok) throw new Error('Error al cargar orden');
      return res.json() as Promise<Orden & { items: unknown[] }>;
    },
    enabled: id > 0,
  });
}

export function useCreateOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrdenPayload) => {
      const res = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear orden');
      return res.json() as Promise<Orden>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ordenes'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateOrdenPayload & { id: number }) => {
      const res = await fetch(`/api/ordenes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar orden');
      return res.json() as Promise<Orden>;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['ordenes'] });
      qc.invalidateQueries({ queryKey: ['ordenes', variables.id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateOrdenEstado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: OrdenEstado }) => {
      const res = await fetch(`/api/ordenes/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Error'); }
      return res.json() as Promise<Orden>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ordenes'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}

export function useDeleteOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/ordenes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar orden');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes'] }),
  });
}

export function useAddItemOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      orden_id: number;
      descripcion: string;
      cantidad: number;
      precio_unitario: number;
    }) => {
      const { orden_id, ...payload } = data;
      const res = await fetch(`/api/ordenes/${orden_id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al agregar item');
      return res.json() as Promise<ItemOrden>;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['ordenes'] });
      qc.invalidateQueries({ queryKey: ['ordenes', variables.orden_id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}

export function useDeleteItemOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orden_id, item_id }: { orden_id: number; item_id: number }) => {
      const res = await fetch(`/api/ordenes/${orden_id}/items/${item_id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar item');
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['ordenes'] });
      qc.invalidateQueries({ queryKey: ['ordenes', variables.orden_id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}
