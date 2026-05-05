import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import { getEntregaById, updateEntrega, deleteEntrega } from '@/services/entregas.service';

const UpdateSchema = z.object({
  orden_id: z.number().int().positive().optional(),
  personal_id: z.number().int().positive().nullable().optional(),
  notas: z.string().optional(),
  fecha_entrega: z.string().optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const e = getEntregaById(Number(params.id));
    if (!e) return ok({ error: 'No encontrado' }, 404);
    return ok(e);
  } catch (err) { return handleError(err); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = UpdateSchema.parse(await req.json());
    return ok(updateEntrega(Number(params.id), body));
  } catch (err) { return handleError(err); }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    deleteEntrega(Number(params.id));
    return ok({ ok: true });
  } catch (err) { return handleError(err); }
}
