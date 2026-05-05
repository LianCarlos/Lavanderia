import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import { getGastos, createGasto } from '@/services/gastos.service';

const CreateSchema = z.object({
  descripcion:  z.string().min(1),
  monto:        z.number().positive(),
  categoria:    z.enum(['Insumos', 'Servicios', 'Personal', 'Mantenimiento', 'Otros']),
  proveedor_id: z.number().int().positive().optional(),
  fecha:        z.string().optional(),
  notas:        z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const fecha_desde = searchParams.get('fecha_desde') ?? undefined;
    const categoria   = searchParams.get('categoria')   ?? undefined;
    return ok(getGastos({ fecha_desde, categoria }));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = CreateSchema.parse(await req.json());
    return ok(createGasto(body as Parameters<typeof createGasto>[0]), 201);
  } catch (err) {
    return handleError(err);
  }
}
