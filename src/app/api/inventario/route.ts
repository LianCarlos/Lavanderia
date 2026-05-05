import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import { getInventario, createInventario } from '@/services/inventario.service';

const CreateSchema = z.object({
  nombre:          z.string().min(1),
  descripcion:     z.string().optional(),
  stock:           z.number().nonnegative().optional(),
  precio_unitario: z.number().nonnegative().optional(),
  unidad:          z.string().optional(),
});

export async function GET() {
  try {
    return ok(getInventario());
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = CreateSchema.parse(await req.json());
    return ok(createInventario(body), 201);
  } catch (err) {
    return handleError(err);
  }
}
