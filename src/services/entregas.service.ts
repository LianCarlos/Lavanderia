import db from '@/lib/db';
import {
  Entrega,
  AppError,
  CreateEntregaPayload,
  UpdateEntregaPayload,
} from '@/types/index';

const SELECT_ENTREGA = `
  SELECT e.*, o.numero AS orden_numero, c.nombre AS cliente_nombre,
         p.nombre AS personal_nombre
  FROM entregas e
  JOIN ordenes o ON o.id = e.orden_id
  JOIN clientes c ON c.id = o.cliente_id
  LEFT JOIN personal p ON p.id = e.personal_id
`;

export function getEntregas(): Entrega[] {
  return db
    .prepare(`${SELECT_ENTREGA} ORDER BY e.fecha_entrega DESC`)
    .all() as Entrega[];
}

export function getEntregaById(id: number): Entrega | undefined {
  return db
    .prepare(`${SELECT_ENTREGA} WHERE e.id = ?`)
    .get(id) as Entrega | undefined;
}

export function createEntrega(data: CreateEntregaPayload): Entrega {
  const result = db
    .prepare(
      `INSERT INTO entregas (orden_id, personal_id, fecha_entrega, notas)
       VALUES (@orden_id, @personal_id, @fecha_entrega, @notas)`,
    )
    .run({
      orden_id:      data.orden_id,
      personal_id:   data.personal_id   ?? null,
      fecha_entrega: data.fecha_entrega ?? null,
      notas:         data.notas         ?? null,
    });
  return getEntregaById(result.lastInsertRowid as number)!;
}

export function updateEntrega(id: number, data: UpdateEntregaPayload): Entrega {
  const current = getEntregaById(id);
  if (!current) throw new AppError('Entrega no encontrada', 404);

  db.prepare(
    `UPDATE entregas
     SET orden_id = @orden_id,
         personal_id = @personal_id,
         fecha_entrega = @fecha_entrega,
         notas = @notas
     WHERE id = @id`,
  ).run({
    id,
    orden_id: data.orden_id ?? current.orden_id,
    personal_id:
      data.personal_id !== undefined ? data.personal_id : (current.personal_id ?? null),
    fecha_entrega: data.fecha_entrega ?? current.fecha_entrega,
    notas: data.notas !== undefined ? data.notas : (current.notas ?? null),
  });

  return getEntregaById(id)!;
}

export function deleteEntrega(id: number): void {
  const result = db.prepare('DELETE FROM entregas WHERE id = ?').run(id);
  if (result.changes === 0) throw new AppError('Entrega no encontrada', 404);
}
