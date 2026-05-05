import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import {
  getInventarioById,
  updateInventario,
  softDeleteInventario,
} from '@/services/inventario.service';

const UpdateSchema = z.object({
  nombre:          z.string().min(1).optional(),
  descripcion:     z.string().optional(),
  stock:           z.number().nonnegative().optional(),
  precio_unitario: z.number().nonnegative().optional(),
  unidad:          z.string().optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = getInventarioById(Number(params.id));
    if (!item) return ok({ error: 'No encontrado' }, 404);
    return ok(item);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = UpdateSchema.parse(await req.json());
    return ok(updateInventario(Number(params.id), body));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    softDeleteInventario(Number(params.id));
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
