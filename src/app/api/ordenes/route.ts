import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import { getOrdenes, createOrden } from '@/services/ordenes.service';

const CreateSchema = z.object({
  cliente_id:    z.number().int().positive(),
  observaciones: z.string().optional(),
  fecha_entrega: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const estado     = searchParams.get('estado')     ?? undefined;
    const cliente_id = searchParams.get('cliente_id') ? Number(searchParams.get('cliente_id')) : undefined;
    return ok(getOrdenes({ estado, cliente_id }));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = CreateSchema.parse(await req.json());
    return ok(createOrden(body), 201);
  } catch (err) {
    return handleError(err);
  }
}
