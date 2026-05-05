import db from '@/lib/db';
import { Proveedor, AppError } from '@/types/index';

export function getProveedores(): Proveedor[] {
  return db
    .prepare('SELECT * FROM proveedores WHERE deleted_at IS NULL ORDER BY nombre')
    .all() as Proveedor[];
}

export function getProveedorById(id: number): Proveedor | undefined {
  return db
    .prepare('SELECT * FROM proveedores WHERE id = ? AND deleted_at IS NULL')
    .get(id) as Proveedor | undefined;
}

export function createProveedor(data: {
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
}): Proveedor {
  const result = db
    .prepare(
      `INSERT INTO proveedores (nombre, contacto, telefono, email)
       VALUES (@nombre, @contacto, @telefono, @email)`,
    )
    .run({
      nombre:   data.nombre,
      contacto: data.contacto ?? null,
      telefono: data.telefono ?? null,
      email:    data.email    ?? null,
    });
  return getProveedorById(result.lastInsertRowid as number)!;
}

export function updateProveedor(
  id: number,
  data: { nombre?: string; contacto?: string; telefono?: string; email?: string },
): Proveedor {
  const existing = getProveedorById(id);
  if (!existing) throw new AppError('Proveedor no encontrado', 404);
  const merged = { ...existing, ...data };
  db.prepare(
    `UPDATE proveedores SET nombre=@nombre, contacto=@contacto, telefono=@telefono, email=@email WHERE id=@id`,
  ).run({ nombre: merged.nombre, contacto: merged.contacto ?? null, telefono: merged.telefono ?? null, email: merged.email ?? null, id });
  return getProveedorById(id)!;
}

export function softDeleteProveedor(id: number): void {
  const result = db
    .prepare(
      `UPDATE proveedores SET deleted_at=datetime('now','localtime') WHERE id=? AND deleted_at IS NULL`,
    )
    .run(id);
  if (result.changes === 0) throw new AppError('Proveedor no encontrado', 404);
}
