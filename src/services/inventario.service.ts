import db from '@/lib/db';
import { Inventario, AppError } from '@/types/index';

const SELECT_INV = `
  SELECT id, nombre, descripcion, stock, precio_unitario, unidad, deleted_at, created_at, updated_at
  FROM inventario WHERE deleted_at IS NULL
`;

export function getInventario(): Inventario[] {
  return db.prepare(`${SELECT_INV} ORDER BY nombre`).all() as Inventario[];
}

export function getInventarioById(id: number): Inventario | undefined {
  return db.prepare(`${SELECT_INV} AND id = ?`).get(id) as Inventario | undefined;
}

export function createInventario(data: {
  nombre: string;
  descripcion?: string;
  stock?: number;
  precio_unitario?: number;
  unidad?: string;
}): Inventario {
  const result = db
    .prepare(
      `INSERT INTO inventario (nombre, descripcion, stock, precio_unitario, unidad)
       VALUES (@nombre, @descripcion, @stock, @precio_unitario, @unidad)`,
    )
    .run({
      nombre:          data.nombre,
      descripcion:     data.descripcion    ?? null,
      stock:           data.stock          ?? 0,
      precio_unitario: data.precio_unitario ?? 0,
      unidad:          data.unidad         ?? 'unidad',
    });
  return getInventarioById(result.lastInsertRowid as number)!;
}

export function updateInventario(
  id: number,
  data: { nombre?: string; descripcion?: string; stock?: number; precio_unitario?: number; unidad?: string },
): Inventario {
  const existing = getInventarioById(id);
  if (!existing) throw new AppError('Item no encontrado', 404);
  const merged = { ...existing, ...data };
  db.prepare(
    `UPDATE inventario SET nombre=@nombre, descripcion=@descripcion, stock=@stock,
     precio_unitario=@precio_unitario, unidad=@unidad,
     updated_at=datetime('now','localtime') WHERE id=@id`,
  ).run({
    nombre:          merged.nombre,
    descripcion:     merged.descripcion    ?? null,
    stock:           merged.stock,
    precio_unitario: merged.precio_unitario,
    unidad:          merged.unidad,
    id,
  });
  return getInventarioById(id)!;
}

export function ajustarStock(id: number, delta: number): Inventario {
  const existing = getInventarioById(id);
  if (!existing) throw new AppError('Item no encontrado', 404);
  const nuevoStock = existing.stock + delta;
  if (nuevoStock < 0) throw new AppError(`Stock insuficiente. Actual: ${existing.stock}`, 422);
  db.prepare(
    `UPDATE inventario SET stock=?, updated_at=datetime('now','localtime') WHERE id=?`,
  ).run(nuevoStock, id);
  return getInventarioById(id)!;
}

export function softDeleteInventario(id: number): void {
  const result = db
    .prepare(
      `UPDATE inventario SET deleted_at=datetime('now','localtime') WHERE id=? AND deleted_at IS NULL`,
    )
    .run(id);
  if (result.changes === 0) throw new AppError('Item no encontrado', 404);
}
