import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import { addItemOrden } from '@/services/ordenes.service';

const Schema = z.object({
  descripcion:     z.string().min(1),
  cantidad:        z.number().int().positive(),
  precio_unitario: z.number().nonnegative(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = Schema.parse(await req.json());
    return ok(addItemOrden({ orden_id: Number(params.id), ...body }), 201);
  } catch (err) {
    return handleError(err);
  }
}
