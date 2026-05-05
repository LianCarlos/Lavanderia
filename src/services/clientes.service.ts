import db from '@/lib/db';
import { Cliente, AppError } from '@/types/index';

export function getClientes(): Cliente[] {
  return db
    .prepare('SELECT * FROM clientes WHERE deleted_at IS NULL ORDER BY nombre')
    .all() as Cliente[];
}

export function getClienteById(id: number): Cliente | undefined {
  return db
    .prepare('SELECT * FROM clientes WHERE id = ? AND deleted_at IS NULL')
    .get(id) as Cliente | undefined;
}

export function createCliente(data: {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
}): Cliente {
  const result = db
    .prepare(
      `INSERT INTO clientes (nombre, telefono, email, direccion, notas)
       VALUES (@nombre, @telefono, @email, @direccion, @notas)`,
    )
    .run({
      nombre:    data.nombre,
      telefono:  data.telefono  ?? null,
      email:     data.email     ?? null,
      direccion: data.direccion ?? null,
      notas:     data.notas     ?? null,
    });
  return getClienteById(result.lastInsertRowid as number)!;
}

export function updateCliente(
  id: number,
  data: { nombre?: string; telefono?: string; email?: string; direccion?: string; notas?: string },
): Cliente {
  const existing = getClienteById(id);
  if (!existing) throw new AppError('Cliente no encontrado', 404);
  const merged = { ...existing, ...data };
  db.prepare(
    `UPDATE clientes SET nombre=@nombre, telefono=@telefono, email=@email,
     direccion=@direccion, notas=@notas WHERE id=@id`,
  ).run({
    nombre:    merged.nombre,
    telefono:  merged.telefono  ?? null,
    email:     merged.email     ?? null,
    direccion: merged.direccion ?? null,
    notas:     merged.notas     ?? null,
    id,
  });
  return getClienteById(id)!;
}

export function softDeleteCliente(id: number): void {
  const result = db
    .prepare(
      `UPDATE clientes SET deleted_at = datetime('now','localtime') WHERE id = ? AND deleted_at IS NULL`,
    )
    .run(id);
  if (result.changes === 0) throw new AppError('Cliente no encontrado', 404);
}

export function searchClientes(query: string): Cliente[] {
  return db
    .prepare('SELECT * FROM clientes WHERE deleted_at IS NULL AND nombre LIKE ? ORDER BY nombre')
    .all(`%${query}%`) as Cliente[];
}
