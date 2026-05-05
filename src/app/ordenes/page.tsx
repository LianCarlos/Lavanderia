'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  useOrdenes,
  useOrden,
  useCreateOrden,
  useUpdateOrden,
  useUpdateOrdenEstado,
  useAddItemOrden,
  useDeleteItemOrden,
  useDeleteOrden,
} from '@/hooks/useOrdenes';
import { useClientes } from '@/hooks/useClientes';
import type { ItemOrden, Orden, OrdenEstado } from '@/types/index';

const ESTADOS: OrdenEstado[] = ['Pendiente', 'En Proceso', 'Terminada', 'Cobrada'];
const NEXT_ESTADO: Record<OrdenEstado, OrdenEstado | null> = {
  Pendiente:    'En Proceso',
  'En Proceso': 'Terminada',
  Terminada:    'Cobrada',
  Cobrada:      null,
};

function OrdenForm({
  clientes,
  onSubmit,
  loading,
}: {
  clientes: { id: number; nombre: string }[];
  onSubmit: (d: { cliente_id: number; observaciones?: string; fecha_entrega?: string }) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({ cliente_id: clientes[0]?.id ?? 0, observaciones: '', fecha_entrega: '' });
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-4"
    >
      <div>
        <label className="block text-xs text-white/50 mb-1">Cliente</label>
        <select
          value={form.cliente_id}
          onChange={(e) => setForm((p) => ({ ...p, cliente_id: Number(e.target.value) }))}
          required
          className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-white/50 mb-1">Fecha de entrega</label>
        <input
          type="date"
          value={form.fecha_entrega}
          onChange={(e) => setForm((p) => ({ ...p, fecha_entrega: e.target.value }))}
          className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-xs text-white/50 mb-1">Observaciones</label>
        <textarea
          value={form.observaciones}
          onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
          rows={2}
          className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>Crear Orden</Button>
      </div>
    </form>
  );
}

export default function OrdenesPage() {
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [showCreate, setShowCreate]     = useState(false);
  const [showEdit, setShowEdit]         = useState(false);
  const [showItems, setShowItems]       = useState(false);
  const [editing, setEditing]           = useState<Orden | null>(null);
  const [itemsOrdenId, setItemsOrdenId] = useState<number | null>(null);

  const { data: ordenes = [], isLoading } = useOrdenes(filtroEstado ? { estado: filtroEstado } : undefined);
  const { data: clientes = [] }           = useClientes();
  const { data: ordenDetalle }            = useOrden(itemsOrdenId ?? 0);
  const createMutation     = useCreateOrden();
  const updateMutation     = useUpdateOrden();
  const estadoMutation     = useUpdateOrdenEstado();
  const addItemMutation    = useAddItemOrden();
  const deleteItemMutation = useDeleteItemOrden();
  const deleteMutation     = useDeleteOrden();

  const handleCreate = async (d: Parameters<typeof createMutation.mutateAsync>[0]) => {
    await createMutation.mutateAsync(d);
    setShowCreate(false);
  };

  const handleUpdate = async (d: Parameters<typeof updateMutation.mutateAsync>[0]) => {
    await updateMutation.mutateAsync(d);
    setShowEdit(false);
    setEditing(null);
  };

  const avanzarEstado = async (o: Orden) => {
    const next = NEXT_ESTADO[o.estado];
    if (!next) return;
    if (confirm(`¿Cambiar estado a "${next}"?`)) {
      await estadoMutation.mutateAsync({ id: o.id, estado: next });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltroEstado('')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !filtroEstado ? 'bg-emerald-500 text-white' : 'bg-surface-100 text-white/50 hover:text-white'
            }`}
          >
            Todos
          </button>
          {ESTADOS.map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filtroEstado === e ? 'bg-emerald-500 text-white' : 'bg-surface-100 text-white/50 hover:text-white'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Nueva Orden
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-surface-100">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-white/40">Cargando…</p>
        ) : ordenes.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/40">No hay órdenes</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Número</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Fecha Entrega</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(ordenes as (Orden & { cliente_nombre?: string })[]).map((o) => (
                <tr key={o.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-mono text-emerald-400">{o.numero}</td>
                  <td className="px-4 py-3 text-white/80">{o.cliente_nombre ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge estado={o.estado} /></td>
                  <td className="px-4 py-3 text-white/60">{o.fecha_entrega ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-white/80">${(o.total ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {NEXT_ESTADO[o.estado] && (
                        <Button variant="secondary" size="sm" loading={estadoMutation.isPending} onClick={() => avanzarEstado(o)}>
                          <ChevronRight className="h-3.5 w-3.5" />
                          {NEXT_ESTADO[o.estado]}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(o); setShowEdit(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setItemsOrdenId(o.id); setShowItems(true); }}>
                        <PackagePlus className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="danger" size="sm" loading={deleteMutation.isPending} onClick={() => confirm('¿Eliminar?') && deleteMutation.mutate(o.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nueva Orden">
        <OrdenForm clientes={clientes} onSubmit={handleCreate} loading={createMutation.isPending} />
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Editar Orden">
        {editing && (
          <OrdenEditForm
            orden={editing}
            clientes={clientes}
            onSubmit={handleUpdate}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      <Modal open={showItems} onClose={() => setShowItems(false)} title={`Items — ${ordenDetalle?.numero ?? ''}`} size="lg">
        {itemsOrdenId && (
          <OrdenItemsPanel
            ordenId={itemsOrdenId}
            items={(ordenDetalle?.items as ItemOrden[] | undefined) ?? []}
            loading={addItemMutation.isPending || deleteItemMutation.isPending}
            total={ordenDetalle?.total ?? 0}
            onAddItem={async (payload) => {
              await addItemMutation.mutateAsync({ orden_id: itemsOrdenId, ...payload });
            }}
            onDeleteItem={async (itemId) => {
              await deleteItemMutation.mutateAsync({ orden_id: itemsOrdenId, item_id: itemId });
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function OrdenEditForm({
  orden,
  clientes,
  onSubmit,
  loading,
}: {
  orden: Orden;
  clientes: { id: number; nombre: string }[];
  onSubmit: (data: { id: number; cliente_id?: number; observaciones?: string; fecha_entrega?: string }) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    cliente_id: orden.cliente_id,
    observaciones: orden.observaciones ?? '',
    fecha_entrega: orden.fecha_entrega ?? '',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ id: orden.id, ...form }); }} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs text-white/50">Cliente</label>
        <select value={form.cliente_id} onChange={(e) => setForm((prev) => ({ ...prev, cliente_id: Number(e.target.value) }))} className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-white/50">Fecha de entrega</label>
        <input type="date" value={form.fecha_entrega} onChange={(e) => setForm((prev) => ({ ...prev, fecha_entrega: e.target.value }))} className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-white/50">Observaciones</label>
        <textarea rows={3} value={form.observaciones} onChange={(e) => setForm((prev) => ({ ...prev, observaciones: e.target.value }))} className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div className="flex justify-end"><Button type="submit" loading={loading}>Guardar cambios</Button></div>
    </form>
  );
}

function OrdenItemsPanel({
  ordenId,
  items,
  total,
  loading,
  onAddItem,
  onDeleteItem,
}: {
  ordenId: number;
  items: ItemOrden[];
  total: number;
  loading: boolean;
  onAddItem: (payload: { descripcion: string; cantidad: number; precio_unitario: number }) => void;
  onDeleteItem: (itemId: number) => void;
}) {
  const [form, setForm] = useState({ descripcion: '', cantidad: 1, precio_unitario: 0 });

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAddItem(form);
          setForm({ descripcion: '', cantidad: 1, precio_unitario: 0 });
        }}
        className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px_140px_auto]"
      >
        <input value={form.descripcion} onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))} required placeholder="Descripción" className="rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <input type="number" min="1" value={form.cantidad} onChange={(e) => setForm((prev) => ({ ...prev, cantidad: Number(e.target.value) }))} className="rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <input type="number" min="0" step="0.01" value={form.precio_unitario} onChange={(e) => setForm((prev) => ({ ...prev, precio_unitario: Number(e.target.value) }))} className="rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <Button type="submit" loading={loading}>Agregar</Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-surface">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/40">La orden {ordenId} aún no tiene items</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-white/40">Descripción</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-white/40">Cantidad</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-white/40">P. Unitario</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-white/40">Subtotal</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-white/40">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-white">{item.descripcion}</td>
                  <td className="px-4 py-3 text-right text-white/70">{item.cantidad}</td>
                  <td className="px-4 py-3 text-right text-white/70">${item.precio_unitario.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-emerald-400">${item.subtotal.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="danger" size="sm" loading={loading} onClick={() => onDeleteItem(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-end text-sm text-white/70">
        Total calculado por SQLite:&nbsp;<strong className="text-white">${total.toFixed(2)}</strong>
      </div>
    </div>
  );
}
