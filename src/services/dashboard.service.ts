import db from '@/lib/db';
import { DashboardStats, BalanceStats } from '@/types/index';

export function getDashboardStats(): DashboardStats {
  const counts = db
    .prepare(
      `SELECT
        SUM(CASE WHEN estado='Pendiente'  THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN estado='En Proceso' THEN 1 ELSE 0 END) AS en_proceso,
        SUM(CASE WHEN estado='Terminada'  THEN 1 ELSE 0 END) AS terminadas,
        SUM(CASE WHEN estado='Cobrada'    THEN 1 ELSE 0 END) AS cobradas
       FROM ordenes WHERE deleted_at IS NULL`,
    )
    .get() as { pendientes: number; en_proceso: number; terminadas: number; cobradas: number };

  const { ingresos_hoy } = db
    .prepare(
      `SELECT COALESCE(SUM(total), 0) AS ingresos_hoy
       FROM ordenes
       WHERE estado='Cobrada' AND date(updated_at)=date('now','localtime') AND deleted_at IS NULL`,
    )
    .get() as { ingresos_hoy: number };

  const { ordenes_cuenta_corriente } = db
    .prepare(
      `SELECT COUNT(*) AS ordenes_cuenta_corriente
       FROM ordenes WHERE estado IN ('Pendiente','En Proceso','Terminada') AND deleted_at IS NULL`,
    )
    .get() as { ordenes_cuenta_corriente: number };

  return {
    pendientes:               counts.pendientes  ?? 0,
    en_proceso:               counts.en_proceso  ?? 0,
    terminadas:               counts.terminadas  ?? 0,
    cobradas:                 counts.cobradas    ?? 0,
    ingresos_hoy:             ingresos_hoy       ?? 0,
    ordenes_cuenta_corriente: ordenes_cuenta_corriente ?? 0,
  };
}

export function getBalanceStats(): BalanceStats {
  const { ingresos_total } = db
    .prepare(
      `SELECT COALESCE(SUM(total), 0) AS ingresos_total
       FROM ordenes WHERE estado='Cobrada' AND deleted_at IS NULL`,
    )
    .get() as { ingresos_total: number };

  const { gastos_total } = db
    .prepare(`SELECT COALESCE(SUM(monto), 0) AS gastos_total FROM gastos WHERE deleted_at IS NULL`)
    .get() as { gastos_total: number };

  const ingresos_por_mes = db
    .prepare(
      `SELECT strftime('%Y-%m', updated_at) AS mes, COALESCE(SUM(total), 0) AS total
       FROM ordenes WHERE estado='Cobrada' AND deleted_at IS NULL
       GROUP BY mes ORDER BY mes DESC LIMIT 12`,
    )
    .all() as { mes: string; total: number }[];

  const gastos_por_categoria = db
    .prepare(
      `SELECT categoria, COALESCE(SUM(monto), 0) AS total
       FROM gastos WHERE deleted_at IS NULL
       GROUP BY categoria ORDER BY total DESC`,
    )
    .all() as { categoria: string; total: number }[];

  return {
    ingresos_total,
    gastos_total,
    balance_neto: ingresos_total - gastos_total,
    ingresos_por_mes,
    gastos_por_categoria,
  };
}
