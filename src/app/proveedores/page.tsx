'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useProveedores, useCreateProveedor, useUpdateProveedor, useDeleteProveedor } from '@/hooks/useProveedores';
import type { Proveedor } from '@/types/index';

function ProveedorForm({ initial, onSubmit, loading }: { initial?: Partial<Proveedor>; onSubmit: (d: Partial<Proveedor>) => void; loading: boolean }) {
  const [form, setForm] = useState<Partial<Proveedor>>(initial ?? {});
  const f = (k: keyof Proveedor) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      {(['nombre', 'contacto', 'telefono', 'email'] as const).map((field) => (
        <div key={field}>
          <label className="block text-xs text-white/50 mb-1 capitalize">{field}</label>
          <input type={field === 'email' ? 'email' : 'text'} value={(form[field] as string) ?? ''} onChange={f(field)} required={field === 'nombre'}
            className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      ))}
      <div className="flex justify-end pt-2"><Button type="submit" loading={loading}>Guardar</Button></div>
    </form>
  );
}

export default function ProveedoresPage() {
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const { data = [], isLoading } = useProveedores();
  const createM = useCreateProveedor();
  const updateM = useUpdateProveedor();
  const deleteM = useDeleteProveedor();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setModal('create')}><Plus className="h-4 w-4" /> Nuevo Proveedor</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/5 bg-surface-100">
        {isLoading ? <p className="py-10 text-center text-sm text-white/40">Cargando…</p> : data.length === 0 ? <p className="py-10 text-center text-sm text-white/40">Sin proveedores</p> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Contacto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Email</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Acciones</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {data.map((p) => (
                <tr key={p.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{p.nombre}</td>
                  <td className="px-4 py-3 text-white/60">{p.contacto ?? '—'}</td>
                  <td className="px-4 py-3 text-white/60">{p.telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-white/60">{p.email ?? '—'}</td>
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
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Nuevo Proveedor">
        <ProveedorForm onSubmit={async (d) => { await createM.mutateAsync(d as Parameters<typeof createM.mutateAsync>[0]); setModal(null); }} loading={createM.isPending} />
      </Modal>
      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title="Editar Proveedor">
        {editing && <ProveedorForm initial={editing} onSubmit={async (d) => { await updateM.mutateAsync({ id: editing.id, ...d }); setModal(null); }} loading={updateM.isPending} />}
      </Modal>
    </div>
  );
}
