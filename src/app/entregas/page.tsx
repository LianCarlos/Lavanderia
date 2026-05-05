'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useEntregas, useCreateEntrega, useUpdateEntrega, useDeleteEntrega } from '@/hooks/useEntregas';
import { useOrdenes } from '@/hooks/useOrdenes';
import { usePersonal } from '@/hooks/usePersonal';
import type { Entrega, CreateEntregaPayload } from '@/types/index';

function EntregaForm({
  initial,
  ordenes,
  personal,
  onSubmit,
  loading,
}: {
  initial?: Partial<Entrega>;
  ordenes: { id: number; numero: string }[];
  personal: { id: number; nombre: string }[];
  onSubmit: (d: CreateEntregaPayload) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    orden_id: initial?.orden_id ?? ordenes[0]?.id ?? 0,
    personal_id: initial?.personal_id ?? 0,
    notas: initial?.notas ?? '',
    fecha_entrega: initial?.fecha_entrega ?? '',
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, personal_id: form.personal_id || undefined, fecha_entrega: form.fecha_entrega || undefined }); }} className="space-y-4">
      <div><label className="block text-xs text-white/50 mb-1">Orden</label>
        <select value={form.orden_id} onChange={(e) => setForm((p) => ({ ...p, orden_id: Number(e.target.value) }))} required className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {ordenes.map((o) => <option key={o.id} value={o.id}>{o.numero}</option>)}
        </select></div>
      <div><label className="block text-xs text-white/50 mb-1">Personal (opcional)</label>
        <select value={form.personal_id} onChange={(e) => setForm((p) => ({ ...p, personal_id: Number(e.target.value) }))} className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value={0}>Sin asignar</option>
          {personal.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select></div>
      <div><label className="block text-xs text-white/50 mb-1">Fecha de entrega</label>
        <input type="date" value={form.fecha_entrega} onChange={(e) => setForm((p) => ({ ...p, fecha_entrega: e.target.value }))} className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
      <div><label className="block text-xs text-white/50 mb-1">Notas</label>
        <textarea value={form.notas} onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))} rows={2} className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" /></div>
      <div className="flex justify-end pt-2"><Button type="submit" loading={loading}>Registrar Entrega</Button></div>
    </form>
  );
}

export default function EntregasPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState<Entrega | null>(null);
  const { data: entregas = [], isLoading } = useEntregas();
  const { data: ordenes = [] } = useOrdenes();
  const { data: personal = [] } = usePersonal();
  const createM = useCreateEntrega();
  const updateM = useUpdateEntrega();
  const deleteM = useDeleteEntrega();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Registrar Entrega</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/5 bg-surface-100">
        {isLoading ? <p className="py-10 text-center text-sm text-white/40">Cargando…</p> : entregas.length === 0 ? <p className="py-10 text-center text-sm text-white/40">Sin entregas</p> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Orden</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Personal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Fecha Entrega</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Acciones</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {(entregas as (Entrega & { orden_numero?: string; cliente_nombre?: string; personal_nombre?: string })[]).map((e) => (
                <tr key={e.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-mono text-emerald-400">{e.orden_numero ?? e.orden_id}</td>
                  <td className="px-4 py-3 text-white/80">{e.cliente_nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-white/60">{e.personal_nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-white/60">{e.fecha_entrega ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(e); setShowEdit(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="danger" size="sm" loading={deleteM.isPending} onClick={() => confirm('¿Eliminar?') && deleteM.mutate(e.id)}>
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
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Entrega">
        <EntregaForm
          ordenes={ordenes.map((o) => ({ id: o.id, numero: o.numero }))}
          personal={personal}
          onSubmit={async (d) => { await createM.mutateAsync(d); setShowCreate(false); }}
          loading={createM.isPending}
        />
      </Modal>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Editar Entrega">
        {editing && (
          <EntregaForm
            initial={editing}
            ordenes={ordenes.map((o) => ({ id: o.id, numero: o.numero }))}
            personal={personal}
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
