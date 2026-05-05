import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import { updateGasto, deleteGasto } from '@/services/gastos.service';

const UpdateSchema = z.object({
  descripcion: z.string().min(1).optional(),
  monto: z.number().positive().optional(),
  categoria: z.enum(['Insumos', 'Servicios', 'Personal', 'Mantenimiento', 'Otros']).optional(),
  proveedor_id: z.number().int().positive().nullable().optional(),
  fecha: z.string().optional(),
  notas: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = UpdateSchema.parse(await req.json());
    return ok(updateGasto(Number(params.id), body));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    deleteGasto(Number(params.id));
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
