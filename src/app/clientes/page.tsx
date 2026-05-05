'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useClientes, useCreateCliente, useUpdateCliente, useDeleteCliente } from '@/hooks/useClientes';
import type { Cliente } from '@/types/index';

function ClienteForm({
  initial,
  onSubmit,
  loading,
}: {
  initial?: Partial<Cliente>;
  onSubmit: (d: Partial<Cliente>) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<Partial<Cliente>>(initial ?? {});
  const f = (k: keyof Cliente) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-4"
    >
      {(['nombre', 'telefono', 'email', 'direccion'] as const).map((field) => (
        <div key={field}>
          <label className="block text-xs text-white/50 mb-1 capitalize">{field}</label>
          <input
            type={field === 'email' ? 'email' : 'text'}
            value={(form[field] as string) ?? ''}
            onChange={f(field)}
            required={field === 'nombre'}
            className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      ))}
      <div>
        <label className="block text-xs text-white/50 mb-1">Notas</label>
        <textarea
          value={form.notas ?? ''}
          onChange={f('notas')}
          rows={2}
          className="w-full rounded-lg bg-surface border border-white/10 px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={loading}>Guardar</Button>
      </div>
    </form>
  );
}

export default function ClientesPage() {
  const [q, setQ]         = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Cliente | null>(null);

  const { data = [], isLoading } = useClientes(q || undefined);
  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente();
  const deleteMutation = useDeleteCliente();

  const handleCreate = async (d: Partial<Cliente>) => {
    await createMutation.mutateAsync(d as Parameters<typeof createMutation.mutateAsync>[0]);
    setModal(null);
  };
  const handleUpdate = async (d: Partial<Cliente>) => {
    await updateMutation.mutateAsync({ id: editing!.id, ...d });
    setModal(null);
  };
  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar cliente?')) await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar cliente…"
            className="w-full rounded-lg bg-surface-100 border border-white/10 pl-9 pr-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <Button onClick={() => setModal('create')}>
          <Plus className="h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-surface-100">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-white/40">Cargando…</p>
        ) : data.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/40">No se encontraron clientes</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase">Dirección</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{c.nombre}</td>
                  <td className="px-4 py-3 text-white/60">{c.telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-white/60">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-white/60">{c.direccion ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(c); setModal('edit'); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="danger" size="sm" loading={deleteMutation.isPending} onClick={() => handleDelete(c.id)}>
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

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Nuevo Cliente">
        <ClienteForm onSubmit={handleCreate} loading={createMutation.isPending} />
      </Modal>
      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title="Editar Cliente">
        {editing && (
          <ClienteForm initial={editing} onSubmit={handleUpdate} loading={updateMutation.isPending} />
        )}
      </Modal>
    </div>
  );
}
