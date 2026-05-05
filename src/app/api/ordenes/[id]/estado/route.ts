import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import { updateOrdenEstado } from '@/services/ordenes.service';

const Schema = z.object({ estado: z.string().min(1) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { estado } = Schema.parse(await req.json());
    return ok(updateOrdenEstado(Number(params.id), estado));
  } catch (err) {
    return handleError(err);
  }
}
