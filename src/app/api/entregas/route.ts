import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import { getEntregas, createEntrega } from '@/services/entregas.service';

const CreateSchema = z.object({
  orden_id:      z.number().int().positive(),
  personal_id:   z.number().int().positive().optional(),
  notas:         z.string().optional(),
  fecha_entrega: z.string().optional(),
});

export async function GET() {
  try { return ok(getEntregas()); } catch (err) { return handleError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const body = CreateSchema.parse(await req.json());
    return ok(createEntrega(body), 201);
  } catch (err) {
    return handleError(err);
  }
}
