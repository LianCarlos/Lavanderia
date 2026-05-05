'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  useInventario,
  useCreateInventario,
  useUpdateInventario,
  useAjustarStock,
  useDeleteInventario,
} from '@/hooks/useInventario';
import type { Inventario } from '@/types/index';

function InventarioForm({
  initial,
  onSubmit,
  loading,
}: {
  initial?: Partial<Inventario>;
  onSubmit: (d: Partial<Inventario>) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<Partial<Inventario>>(initial ?? { stock: 0, precio_unitario: 0, unidad: 'unidad' });
  const fStr  = (k: keyof Inventario) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  const fNum  = (k: keyof Inventario) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: Number(e.target.value) }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      {(['nombre', 'descripcion', 'unidad'] as const).map((f) => (
        <div key={f}>
          <label className="block text-xs text-white/50 mb-1 capitalize">{f}</label>
          <input
            value={(form[f] as string) ?? ''}
            onChange={fStr(f)}
            required={f === 'nombre'}
            className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      ))}
      {(['stock', 'precio_unitario'] as const).map((f) => (
        <div key={f}>
          <label className="block text-xs text-white/50 mb-1">{f === 'stock' ? 'Stock' : 'Precio Unitario'}</label>
          <input
            type="number"
            min="0"
            step={f === 'precio_unitario' ? '0.01' : '1'}
            value={(form[f] as number) ?? 0}
            onChange={fNum(f)}
            className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>Guardar</Button>
      </div>
    </form>
  );
}

export default function InventarioPage() {
  const [modal, setModal]         = useState<'create' | 'edit' | 'stock' | null>(null);
  const [editing, setEditing]     = useState<Inventario | null>(null);
  const [delta, setDelta]         = useState(0);

  const { data = [], isLoading }  = useInventario();
  const createMutation = useCreateInventario();
  const updateMutation = useUpdateInventario();
  const stockMutation  = useAjustarStock();
  const deleteMutation = useDeleteInventario();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setModal('create')}>
          <Plus className="h-4 w-4" /> Nuevo Item
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-surface-100">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-white/40">Cargando…</p>
        ) : data.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/40">Inventario vacío</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Unidad</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Precio</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{item.nombre}</td>
                  <td className="px-4 py-3 text-white/60">{item.unidad}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${item.stock < 5 ? 'text-red-400' : 'text-white/80'}`}>{item.stock}</td>
                  <td className="px-4 py-3 text-right text-white/80">${item.precio_unitario.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(item); setDelta(1); setModal('stock'); }} title="Entrada">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(item); setDelta(-1); setModal('stock'); }} title="Salida">
                        <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(item); setModal('edit'); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="danger" size="sm" loading={deleteMutation.isPending} onClick={() => confirm('¿Eliminar?') && deleteMutation.mutate(item.id)}>
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

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Nuevo Item">
        <InventarioForm
          onSubmit={async (d) => {
            await createMutation.mutateAsync(d as Parameters<typeof createMutation.mutateAsync>[0]);
            setModal(null);
          }}
          loading={createMutation.isPending}
        />
      </Modal>

      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title="Editar Item">
        {editing && (
          <InventarioForm
            initial={editing}
            onSubmit={async (d) => {
              await updateMutation.mutateAsync({ id: editing.id, ...d });
              setModal(null);
            }}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      <Modal open={modal === 'stock'} onClose={() => setModal(null)} title={`Ajustar Stock — ${editing?.nombre}`} size="sm">
        {editing && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await stockMutation.mutateAsync({ id: editing.id, delta });
              setModal(null);
            }}
            className="space-y-4"
          >
            <p className="text-sm text-white/60">Stock actual: <strong className="text-white">{editing.stock}</strong></p>
            <div>
              <label className="block text-xs text-white/50 mb-1">Cantidad (positivo = entrada, negativo = salida)</label>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
                className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={stockMutation.isPending}>Ajustar</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
