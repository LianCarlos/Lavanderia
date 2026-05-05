import db from '@/lib/db';
import {
  Gasto,
  AppError,
  CreateGastoPayload,
  UpdateGastoPayload,
} from '@/types/index';

const SELECT_GASTO = `
  SELECT g.*, p.nombre AS proveedor_nombre
  FROM gastos g
  LEFT JOIN proveedores p ON p.id = g.proveedor_id
  WHERE g.deleted_at IS NULL
`;

export function getGastos(filters?: { fecha_desde?: string; categoria?: string }): Gasto[] {
  let sql = SELECT_GASTO;
  const params: string[] = [];
  if (filters?.fecha_desde) { sql += ' AND g.fecha >= ?'; params.push(filters.fecha_desde); }
  if (filters?.categoria)   { sql += ' AND g.categoria = ?'; params.push(filters.categoria); }
  sql += ' ORDER BY g.fecha DESC, g.created_at DESC';
  return db.prepare(sql).all(...params) as Gasto[];
}

export function getGastoById(id: number): Gasto | undefined {
  return db.prepare(`${SELECT_GASTO} AND g.id = ?`).get(id) as Gasto | undefined;
}

export function createGasto(data: CreateGastoPayload): Gasto {
  const result = db
    .prepare(
      `INSERT INTO gastos (descripcion, monto, categoria, proveedor_id, fecha, notas)
       VALUES (@descripcion, @monto, @categoria, @proveedor_id, @fecha, @notas)`,
    )
    .run({
      descripcion:  data.descripcion,
      monto:        data.monto,
      categoria:    data.categoria,
      proveedor_id: data.proveedor_id ?? null,
      fecha:        data.fecha ?? new Date().toISOString().slice(0, 10),
      notas:        data.notas ?? null,
    });
  return getGastoById(result.lastInsertRowid as number)!;
}

export function updateGasto(id: number, data: UpdateGastoPayload): Gasto {
  const current = getGastoById(id);
  if (!current) throw new AppError('Gasto no encontrado', 404);

  db.prepare(
    `UPDATE gastos
     SET descripcion = @descripcion,
         monto = @monto,
         categoria = @categoria,
         proveedor_id = @proveedor_id,
         fecha = @fecha,
         notas = @notas
     WHERE id = @id`,
  ).run({
    id,
    descripcion: data.descripcion ?? current.descripcion,
    monto: data.monto ?? current.monto,
    categoria: data.categoria ?? current.categoria,
    proveedor_id:
      data.proveedor_id !== undefined ? data.proveedor_id : (current.proveedor_id ?? null),
    fecha: data.fecha ?? current.fecha,
    notas: data.notas !== undefined ? data.notas : (current.notas ?? null),
  });

  return getGastoById(id)!;
}

export function deleteGasto(id: number): void {
  const result = db.prepare('DELETE FROM gastos WHERE id = ?').run(id);
  if (result.changes === 0) throw new AppError('Gasto no encontrado', 404);
}

export function getGastosPorCategoria(): { categoria: string; total: number }[] {
  return db
    .prepare(
      `SELECT categoria, COALESCE(SUM(monto), 0) AS total
       FROM gastos WHERE deleted_at IS NULL
       GROUP BY categoria ORDER BY total DESC`,
    )
    .all() as { categoria: string; total: number }[];
}
