import db from '@/lib/db';
import { Orden, ItemOrden, AppError } from '@/types/index';

const VALID_TRANSITIONS: Record<string, string[]> = {
  Pendiente:   ['En Proceso'],
  'En Proceso': ['Terminada'],
  Terminada:   ['Cobrada'],
  Cobrada:     [],
};

const SELECT_ORDEN = `
  SELECT o.*, c.nombre AS cliente_nombre
  FROM ordenes o
  JOIN clientes c ON c.id = o.cliente_id
  WHERE o.id = ? AND o.deleted_at IS NULL
`;

export function getOrdenes(filters?: { estado?: string; cliente_id?: number }): Orden[] {
  let sql = `
    SELECT o.*, c.nombre AS cliente_nombre
    FROM ordenes o
    JOIN clientes c ON c.id = o.cliente_id
    WHERE o.deleted_at IS NULL
  `;
  const params: (string | number)[] = [];
  if (filters?.estado) { sql += ' AND o.estado = ?'; params.push(filters.estado); }
  if (filters?.cliente_id) { sql += ' AND o.cliente_id = ?'; params.push(filters.cliente_id); }
  sql += ' ORDER BY o.created_at DESC';
  return db.prepare(sql).all(...params) as Orden[];
}

export function getOrdenById(id: number): (Orden & { items: ItemOrden[] }) | undefined {
  const orden = db.prepare(SELECT_ORDEN).get(id) as Orden | undefined;
  if (!orden) return undefined;
  const items = db
    .prepare('SELECT * FROM items_orden WHERE orden_id = ? ORDER BY id')
    .all(id) as ItemOrden[];
  return { ...orden, items };
}

export function createOrden(data: {
  cliente_id: number;
  observaciones?: string;
  fecha_entrega?: string;
}): Orden {
  const result = db
    .prepare(
      `INSERT INTO ordenes (numero, cliente_id, estado, observaciones, fecha_entrega)
       VALUES ('ORD-TEMP', @cliente_id, 'Pendiente', @observaciones, @fecha_entrega)`,
    )
    .run({
      cliente_id:    data.cliente_id,
      observaciones: data.observaciones ?? null,
      fecha_entrega: data.fecha_entrega ?? null,
    });
  return db.prepare(SELECT_ORDEN).get(result.lastInsertRowid) as Orden;
}

export function updateOrdenEstado(id: number, nuevoEstado: string): Orden {
  const orden = db
    .prepare('SELECT * FROM ordenes WHERE id = ? AND deleted_at IS NULL')
    .get(id) as Orden | undefined;
  if (!orden) throw new AppError('Orden no encontrada', 404);

  const permitidos = VALID_TRANSITIONS[orden.estado] ?? [];
  if (!permitidos.includes(nuevoEstado)) {
    throw new AppError(
      `Transición inválida: "${orden.estado}" → "${nuevoEstado}". ` +
        `Permitidas desde "${orden.estado}": [${permitidos.join(', ') || 'ninguna'}]`,
      422,
    );
  }
  db.prepare('UPDATE ordenes SET estado = ? WHERE id = ?').run(nuevoEstado, id);
  return db.prepare(SELECT_ORDEN).get(id) as Orden;
}

export function updateOrden(
  id: number,
  data: { cliente_id?: number; observaciones?: string; fecha_entrega?: string },
): Orden {
  const orden = db
    .prepare('SELECT * FROM ordenes WHERE id = ? AND deleted_at IS NULL')
    .get(id) as Orden | undefined;
  if (!orden) throw new AppError('Orden no encontrada', 404);
  db.prepare(
    `UPDATE ordenes
     SET cliente_id = @cliente_id,
         observaciones = @observaciones,
         fecha_entrega = @fecha_entrega
     WHERE id = @id`,
  ).run({
    id,
    cliente_id: data.cliente_id ?? orden.cliente_id,
    observaciones: data.observaciones ?? orden.observaciones,
    fecha_entrega: data.fecha_entrega ?? orden.fecha_entrega,
  });
  return db.prepare(SELECT_ORDEN).get(id) as Orden;
}

export function addItemOrden(data: {
  orden_id: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}): ItemOrden {
  const result = db
    .prepare(
      `INSERT INTO items_orden (orden_id, descripcion, cantidad, precio_unitario)
       VALUES (@orden_id, @descripcion, @cantidad, @precio_unitario)`,
    )
    .run(data);
  return db
    .prepare('SELECT * FROM items_orden WHERE id = ?')
    .get(result.lastInsertRowid) as ItemOrden;
}

export function deleteItemOrden(itemId: number): void {
  const item = db.prepare('SELECT id FROM items_orden WHERE id = ?').get(itemId);
  if (!item) throw new AppError('Item no encontrado', 404);
  db.prepare('DELETE FROM items_orden WHERE id = ?').run(itemId);
}

export function softDeleteOrden(id: number): void {
  const result = db
    .prepare(
      `UPDATE ordenes SET deleted_at = datetime('now','localtime') WHERE id = ? AND deleted_at IS NULL`,
    )
    .run(id);
  if (result.changes === 0) throw new AppError('Orden no encontrada', 404);
}
