import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import {
  getOrdenById,
  updateOrden,
  softDeleteOrden,
} from '@/services/ordenes.service';

const UpdateSchema = z.object({
  cliente_id: z.number().int().positive().optional(),
  observaciones: z.string().optional(),
  fecha_entrega: z.string().optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orden = getOrdenById(Number(params.id));
    if (!orden) return ok({ error: 'No encontrado' }, 404);
    return ok(orden);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = UpdateSchema.parse(await req.json());
    return ok(updateOrden(Number(params.id), body));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    softDeleteOrden(Number(params.id));
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
