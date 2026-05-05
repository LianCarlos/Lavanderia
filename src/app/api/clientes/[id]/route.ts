import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import {
  getClienteById,
  updateCliente,
  softDeleteCliente,
} from '@/services/clientes.service';

const UpdateSchema = z.object({
  nombre:    z.string().min(1).optional(),
  telefono:  z.string().optional(),
  email:     z.string().email().optional().or(z.literal('')),
  direccion: z.string().optional(),
  notas:     z.string().optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cliente = getClienteById(Number(params.id));
    if (!cliente) return ok({ error: 'No encontrado' }, 404);
    return ok(cliente);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = UpdateSchema.parse(await req.json());
    return ok(updateCliente(Number(params.id), body));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    softDeleteCliente(Number(params.id));
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
