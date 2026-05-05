'use client';

import { useMemo, useState } from 'react';
import { ClipboardList, Clock, CheckCircle, DollarSign, Package, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useOrdenes } from '@/hooks/useOrdenes';
import { useClientes, useCreateCliente } from '@/hooks/useClientes';
import { useCreateOrden } from '@/hooks/useOrdenes';
import { useCreateInventario } from '@/hooks/useInventario';
import { useCreateGasto } from '@/hooks/useGastos';
import type { Cliente, Orden } from '@/types/index';

function QuickActionCard({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-surface-100 p-4 text-left transition-colors hover:bg-white/5"
    >
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs text-white/45">{subtitle}</p>
      </div>
      <span className="text-lg text-emerald-400">+</span>
    </button>
  );
}

function ClienteQuickForm({ onSubmit, loading }: { onSubmit: (data: { nombre: string; telefono?: string; email?: string; direccion?: string; notas?: string }) => void; loading: boolean }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', direccion: '', notas: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      {[
        ['nombre', 'Nombre'],
        ['telefono', 'Teléfono'],
        ['email', 'Email'],
        ['direccion', 'Dirección'],
      ].map(([key, label]) => (
        <div key={key}>
          <label className="mb-1 block text-xs text-white/50">{label}</label>
          <input
            required={key === 'nombre'}
            type={key === 'email' ? 'email' : 'text'}
            value={form[key as keyof typeof form]}
            onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      ))}
      <div>
        <label className="mb-1 block text-xs text-white/50">Notas</label>
        <textarea
          rows={2}
          value={form.notas}
          onChange={(e) => setForm((prev) => ({ ...prev, notas: e.target.value }))}
          className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div className="flex justify-end"><Button type="submit" loading={loading}>Guardar cliente</Button></div>
    </form>
  );
}

function OrdenQuickForm({ clientes, onSubmit, loading }: { clientes: Cliente[]; onSubmit: (data: { cliente_id: number; observaciones?: string; fecha_entrega?: string }) => void; loading: boolean }) {
  const initialCliente = clientes[0]?.id ?? 0;
  const [form, setForm] = useState({ cliente_id: initialCliente, observaciones: '', fecha_entrega: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs text-white/50">Cliente</label>
        <select
          required
          value={form.cliente_id}
          onChange={(e) => setForm((prev) => ({ ...prev, cliente_id: Number(e.target.value) }))}
          className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-white/50">Fecha de entrega</label>
        <input
          type="date"
          value={form.fecha_entrega}
          onChange={(e) => setForm((prev) => ({ ...prev, fecha_entrega: e.target.value }))}
          className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-white/50">Observaciones</label>
        <textarea
          rows={2}
          value={form.observaciones}
          onChange={(e) => setForm((prev) => ({ ...prev, observaciones: e.target.value }))}
          className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div className="flex justify-end"><Button type="submit" loading={loading}>Guardar orden</Button></div>
    </form>
  );
}

function InventarioQuickForm({ onSubmit, loading }: { onSubmit: (data: { nombre: string; descripcion?: string; stock?: number; precio_unitario?: number; unidad?: string }) => void; loading: boolean }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', stock: 0, precio_unitario: 0, unidad: 'unidad' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs text-white/50">Nombre</label>
        <input required value={form.nombre} onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-white/50">Descripción</label>
        <input value={form.descripcion} onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input type="number" min="0" value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))} className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Stock" />
        <input type="number" min="0" step="0.01" value={form.precio_unitario} onChange={(e) => setForm((prev) => ({ ...prev, precio_unitario: Number(e.target.value) }))} className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Precio" />
        <input value={form.unidad} onChange={(e) => setForm((prev) => ({ ...prev, unidad: e.target.value }))} className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Unidad" />
      </div>
      <div className="flex justify-end"><Button type="submit" loading={loading}>Guardar artículo</Button></div>
    </form>
  );
}

function GastoQuickForm({ onSubmit, loading }: { onSubmit: (data: { descripcion: string; monto: number; categoria: 'Insumos' | 'Servicios' | 'Personal' | 'Mantenimiento' | 'Otros'; fecha?: string; notas?: string }) => void; loading: boolean }) {
  const [form, setForm] = useState({ descripcion: '', monto: 0, categoria: 'Insumos' as const, fecha: new Date().toISOString().slice(0, 10), notas: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <input required value={form.descripcion} onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Descripción" />
      <div className="grid grid-cols-2 gap-3">
        <input type="number" min="0.01" step="0.01" value={form.monto} onChange={(e) => setForm((prev) => ({ ...prev, monto: Number(e.target.value) }))} className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Monto" />
        <select value={form.categoria} onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value as typeof form.categoria }))} className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          {['Insumos', 'Servicios', 'Personal', 'Mantenimiento', 'Otros'].map((categoria) => (
            <option key={categoria} value={categoria}>{categoria}</option>
          ))}
        </select>
      </div>
      <input type="date" value={form.fecha} onChange={(e) => setForm((prev) => ({ ...prev, fecha: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      <textarea rows={2} value={form.notas} onChange={(e) => setForm((prev) => ({ ...prev, notas: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Notas" />
      <div className="flex justify-end"><Button type="submit" loading={loading}>Guardar gasto</Button></div>
    </form>
  );
}

export default function DashboardPage() {
  const [quickAction, setQuickAction] = useState<null | 'cliente' | 'orden' | 'inventario' | 'gasto'>(null);
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: ordenes, isLoading: loadingOrdenes } = useOrdenes();
  const { data: clientes = [] } = useClientes();
  const createCliente = useCreateCliente();
  const createOrden = useCreateOrden();
  const createInventario = useCreateInventario();
  const createGasto = useCreateGasto();

  const recientes = useMemo(() => (ordenes ?? []).slice(0, 6), [ordenes]);

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Pendientes"  value={loadingStats ? '…' : (stats?.pendientes  ?? 0)} icon={ClipboardList} color="yellow"  />
        <StatCard title="En Proceso"  value={loadingStats ? '…' : (stats?.en_proceso  ?? 0)} icon={Clock}         color="blue"    />
        <StatCard title="Terminadas"  value={loadingStats ? '…' : (stats?.terminadas  ?? 0)} icon={CheckCircle}   color="emerald" />
        <StatCard title="Cobradas"    value={loadingStats ? '…' : (stats?.cobradas    ?? 0)} icon={DollarSign}    color="gray"    />
        <StatCard title="Ingresos Hoy" value={loadingStats ? '…' : `$${(stats?.ingresos_hoy ?? 0).toFixed(2)}`} icon={TrendingUp} color="green" />
        <StatCard title="Cta. Corriente" value={loadingStats ? '…' : (stats?.ordenes_cuenta_corriente ?? 0)} icon={Package} color="blue" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <QuickActionCard title="Nuevo cliente" subtitle="Alta rápida desde dashboard" onClick={() => setQuickAction('cliente')} />
        <QuickActionCard title="Nueva orden" subtitle="Registrar recepción" onClick={() => setQuickAction('orden')} />
        <QuickActionCard title="Nuevo artículo" subtitle="Agregar inventario" onClick={() => setQuickAction('inventario')} />
        <QuickActionCard title="Registrar gasto" subtitle="Impacta balance al guardar" onClick={() => setQuickAction('gasto')} />
      </div>

      {/* Órdenes recientes */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-white/80">Órdenes Recientes</h2>
        <div className="overflow-hidden rounded-xl border border-white/5 bg-surface-100">
          {loadingOrdenes ? (
            <p className="py-10 text-center text-sm text-white/40">Cargando…</p>
          ) : recientes.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/40">No hay órdenes</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Número</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recientes.map((o: Orden) => (
                  <tr key={o.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-mono text-emerald-400">{o.numero}</td>
                    <td className="px-4 py-3 text-white/80">{(o as Orden & { cliente_nombre?: string }).cliente_nombre ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge estado={o.estado} /></td>
                    <td className="px-4 py-3 text-right text-white/80">${(o.total ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={quickAction === 'cliente'} onClose={() => setQuickAction(null)} title="Nuevo cliente">
        <ClienteQuickForm
          loading={createCliente.isPending}
          onSubmit={async (data) => {
            await createCliente.mutateAsync(data);
            setQuickAction(null);
          }}
        />
      </Modal>

      <Modal open={quickAction === 'orden'} onClose={() => setQuickAction(null)} title="Nueva orden">
        <OrdenQuickForm
          clientes={clientes}
          loading={createOrden.isPending}
          onSubmit={async (data) => {
            await createOrden.mutateAsync(data);
            setQuickAction(null);
          }}
        />
      </Modal>

      <Modal open={quickAction === 'inventario'} onClose={() => setQuickAction(null)} title="Nuevo artículo de inventario">
        <InventarioQuickForm
          loading={createInventario.isPending}
          onSubmit={async (data) => {
            await createInventario.mutateAsync(data);
            setQuickAction(null);
          }}
        />
      </Modal>

      <Modal open={quickAction === 'gasto'} onClose={() => setQuickAction(null)} title="Registrar gasto">
        <GastoQuickForm
          loading={createGasto.isPending}
          onSubmit={async (data) => {
            await createGasto.mutateAsync(data);
            setQuickAction(null);
          }}
        />
      </Modal>
    </div>
  );
}
