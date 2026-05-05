'use client';

import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { useBalanceStats } from '@/hooks/useDashboard';

export default function BalancePage() {
  const { data, isLoading } = useBalanceStats();

  if (isLoading) return <p className="py-20 text-center text-sm text-white/40">Cargando balance…</p>;
  if (!data) return <p className="py-20 text-center text-sm text-white/40">Sin datos</p>;

  return (
    <div className="space-y-8">
      {/* Resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Ingresos Totales"  value={`$${data.ingresos_total.toFixed(2)}`}  icon={TrendingUp}   color="green"   />
        <StatCard title="Gastos Totales"    value={`$${data.gastos_total.toFixed(2)}`}    icon={TrendingDown} color="yellow"  />
        <StatCard title="Balance Neto"      value={`$${data.balance_neto.toFixed(2)}`}    icon={DollarSign}   color={data.balance_neto >= 0 ? 'emerald' : 'yellow'} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ingresos por mes */}
        <div className="rounded-xl border border-white/5 bg-surface-100 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/70">Ingresos por Mes</h2>
          {data.ingresos_por_mes.length === 0 ? (
            <p className="text-sm text-white/40">Sin ingresos registrados</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">
                <th className="pb-2 text-left text-xs text-white/40">Mes</th>
                <th className="pb-2 text-right text-xs text-white/40">Total</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {data.ingresos_por_mes.map((row) => (
                  <tr key={row.mes}>
                    <td className="py-2 text-white/70">{row.mes}</td>
                    <td className="py-2 text-right font-semibold text-emerald-400">${row.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Gastos por categoría */}
        <div className="rounded-xl border border-white/5 bg-surface-100 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/70">Gastos por Categoría</h2>
          {data.gastos_por_categoria.length === 0 ? (
            <p className="text-sm text-white/40">Sin gastos registrados</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">
                <th className="pb-2 text-left text-xs text-white/40">Categoría</th>
                <th className="pb-2 text-right text-xs text-white/40">Total</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {data.gastos_por_categoria.map((row) => (
                  <tr key={row.categoria}>
                    <td className="py-2 text-white/70">{row.categoria}</td>
                    <td className="py-2 text-right font-semibold text-red-400">${row.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
