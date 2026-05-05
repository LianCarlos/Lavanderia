import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import { ajustarStock } from '@/services/inventario.service';

const Schema = z.object({ delta: z.number() });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { delta } = Schema.parse(await req.json());
    return ok(ajustarStock(Number(params.id), delta));
  } catch (err) {
    return handleError(err);
  }
}
