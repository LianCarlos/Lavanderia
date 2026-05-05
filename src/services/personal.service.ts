import db from '@/lib/db';
import { Personal, AppError, PERSONAL_ROLES } from '@/types/index';

export function getPersonal(): Personal[] {
  return db
    .prepare('SELECT * FROM personal WHERE deleted_at IS NULL ORDER BY nombre')
    .all() as Personal[];
}

export function getPersonalById(id: number): Personal | undefined {
  return db
    .prepare('SELECT * FROM personal WHERE id = ? AND deleted_at IS NULL')
    .get(id) as Personal | undefined;
}

export function createPersonal(data: {
  nombre: string;
  rol: typeof PERSONAL_ROLES[number];
  telefono?: string;
  email?: string;
  salario?: number;
}): Personal {
  const result = db
    .prepare(
      `INSERT INTO personal (nombre, rol, telefono, email, salario)
       VALUES (@nombre, @rol, @telefono, @email, @salario)`,
    )
    .run({
      nombre:   data.nombre,
      rol:      data.rol,
      telefono: data.telefono ?? null,
      email:    data.email    ?? null,
      salario:  data.salario  ?? 0,
    });
  return getPersonalById(result.lastInsertRowid as number)!;
}

export function updatePersonal(
  id: number,
  data: { nombre?: string; rol?: typeof PERSONAL_ROLES[number]; telefono?: string; email?: string; salario?: number },
): Personal {
  const existing = getPersonalById(id);
  if (!existing) throw new AppError('Personal no encontrado', 404);
  const merged = { ...existing, ...data };
  db.prepare(
    `UPDATE personal SET nombre=@nombre, rol=@rol, telefono=@telefono, email=@email, salario=@salario WHERE id=@id`,
  ).run({ nombre: merged.nombre, rol: merged.rol, telefono: merged.telefono ?? null, email: merged.email ?? null, salario: merged.salario, id });
  return getPersonalById(id)!;
}

export function softDeletePersonal(id: number): void {
  const result = db
    .prepare(
      `UPDATE personal SET deleted_at=datetime('now','localtime') WHERE id=? AND deleted_at IS NULL`,
    )
    .run(id);
  if (result.changes === 0) throw new AppError('Personal no encontrado', 404);
}
