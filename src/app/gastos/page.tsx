'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useGastos, useCreateGasto, useUpdateGasto, useDeleteGasto } from '@/hooks/useGastos';
import type { Gasto, CreateGastoPayload } from '@/types/index';

const CATEGORIAS = ['Insumos', 'Servicios', 'Personal', 'Mantenimiento', 'Otros'] as const;

function GastoForm({
  initial,
  onSubmit,
  loading,
}: {
  initial?: Partial<Gasto>;
  onSubmit: (d: CreateGastoPayload) => void;
  loading: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<Partial<Gasto>>(initial ?? { categoria: 'Insumos', fecha: today, monto: 0 });
  const fStr = (k: keyof Gasto) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const fNum = (k: keyof Gasto) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: Number(e.target.value) }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          descripcion: String(form.descripcion ?? ''),
          monto: Number(form.monto ?? 0),
          categoria: (form.categoria ?? 'Insumos') as Gasto['categoria'],
          proveedor_id: form.proveedor_id ?? undefined,
          fecha: form.fecha ?? today,
          notas: form.notas ?? undefined,
        });
      }}
      className="space-y-4"
    >
      <div><label className="block text-xs text-white/50 mb-1">Descripción</label>
        <input value={form.descripcion ?? ''} onChange={fStr('descripcion')} required className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs text-white/50 mb-1">Monto</label>
          <input type="number" min="0.01" step="0.01" value={form.monto ?? 0} onChange={fNum('monto')} required className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <div><label className="block text-xs text-white/50 mb-1">Categoría</label>
          <select value={form.categoria ?? 'Insumos'} onChange={fStr('categoria')} className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select></div>
      </div>
      <div><label className="block text-xs text-white/50 mb-1">Fecha</label>
        <input type="date" value={form.fecha ?? today} onChange={fStr('fecha')} className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
      <div><label className="block text-xs text-white/50 mb-1">Notas</label>
        <textarea value={form.notas ?? ''} onChange={fStr('notas')} rows={2} className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" /></div>
      <div className="flex justify-end pt-2"><Button type="submit" loading={loading}>Guardar</Button></div>
    </form>
  );
}

export default function GastosPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState<Gasto | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const { data = [], isLoading } = useGastos(filtroCategoria ? { categoria: filtroCategoria } : undefined);
  const createM = useCreateGasto();
  const updateM = useUpdateGasto();
  const deleteM = useDeleteGasto();
  const total = data.reduce((s, g) => s + g.monto, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFiltroCategoria('')} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!filtroCategoria ? 'bg-emerald-500 text-white' : 'bg-surface-100 text-white/50 hover:text-white'}`}>Todos</button>
          {CATEGORIAS.map((c) => <button key={c} onClick={() => setFiltroCategoria(c)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filtroCategoria === c ? 'bg-emerald-500 text-white' : 'bg-surface-100 text-white/50 hover:text-white'}`}>{c}</button>)}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60">Total: <strong className="text-white">${total.toFixed(2)}</strong></span>
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Nuevo Gasto</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-surface-100">
        {isLoading ? <p className="py-10 text-center text-sm text-white/40">Cargando…</p> : data.length === 0 ? <p className="py-10 text-center text-sm text-white/40">Sin gastos</p> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Fecha</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Monto</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Acciones</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {data.map((g) => (
                <tr key={g.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white">{g.descripcion}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400">{g.categoria}</span></td>
                  <td className="px-4 py-3 text-white/60">{g.fecha}</td>
                  <td className="px-4 py-3 text-right text-white font-semibold">${g.monto.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(g); setShowEdit(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="danger" size="sm" loading={deleteM.isPending} onClick={() => confirm('¿Eliminar?') && deleteM.mutate(g.id)}>
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Gasto">
        <GastoForm onSubmit={async (d) => { await createM.mutateAsync(d); setShowCreate(false); }} loading={createM.isPending} />
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Editar Gasto">
        {editing && (
          <GastoForm
            initial={editing}
            onSubmit={async (d) => {
              await updateM.mutateAsync({ id: editing.id, ...d });
              setShowEdit(false);
              setEditing(null);
            }}
            loading={updateM.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
