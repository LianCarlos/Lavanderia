'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { usePersonal, useCreatePersonal, useUpdatePersonal, useDeletePersonal } from '@/hooks/usePersonal';
import { PERSONAL_ROLES, type Personal } from '@/types/index';

const ROLES = PERSONAL_ROLES;

function PersonalForm({ initial, onSubmit, loading }: { initial?: Partial<Personal>; onSubmit: (d: Partial<Personal>) => void; loading: boolean }) {
  const [form, setForm] = useState<Partial<Personal>>(initial ?? { rol: 'Operador', salario: 0 });
  const fStr = (k: keyof Personal) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const fNum = (k: keyof Personal) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: Number(e.target.value) }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div><label className="block text-xs text-white/50 mb-1">Nombre</label>
        <input value={form.nombre ?? ''} onChange={fStr('nombre')} required className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
      <div><label className="block text-xs text-white/50 mb-1">Rol</label>
        <select value={form.rol ?? 'Operador'} onChange={fStr('rol')} className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select></div>
      {(['telefono', 'email'] as const).map((f) => (
        <div key={f}><label className="block text-xs text-white/50 mb-1 capitalize">{f}</label>
          <input type={f === 'email' ? 'email' : 'text'} value={(form[f] as string) ?? ''} onChange={fStr(f)} className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
      ))}
      <div><label className="block text-xs text-white/50 mb-1">Salario</label>
        <input type="number" min="0" step="0.01" value={form.salario ?? 0} onChange={fNum('salario')} className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
      <div className="flex justify-end pt-2"><Button type="submit" loading={loading}>Guardar</Button></div>
    </form>
  );
}

export default function PersonalPage() {
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Personal | null>(null);
  const { data = [], isLoading } = usePersonal();
  const createM = useCreatePersonal();
  const updateM = useUpdatePersonal();
  const deleteM = useDeletePersonal();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setModal('create')}><Plus className="h-4 w-4" /> Nuevo Personal</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/5 bg-surface-100">
        {isLoading ? <p className="py-10 text-center text-sm text-white/40">Cargando…</p> : data.length === 0 ? <p className="py-10 text-center text-sm text-white/40">Sin personal</p> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Teléfono</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Salario</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Acciones</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {data.map((p) => (
                <tr key={p.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{p.nombre}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">{p.rol}</span></td>
                  <td className="px-4 py-3 text-white/60">{p.telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-white/80">${p.salario.toFixed(2)}</td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(p); setModal('edit'); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="danger" size="sm" loading={deleteM.isPending} onClick={() => confirm('¿Eliminar?') && deleteM.mutate(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Nuevo Personal">
        <PersonalForm onSubmit={async (d) => { await createM.mutateAsync(d as Parameters<typeof createM.mutateAsync>[0]); setModal(null); }} loading={createM.isPending} />
      </Modal>
      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title="Editar Personal">
        {editing && <PersonalForm initial={editing} onSubmit={async (d) => { await updateM.mutateAsync({ id: editing.id, ...d }); setModal(null); }} loading={updateM.isPending} />}
      </Modal>
    </div>
  );
}
