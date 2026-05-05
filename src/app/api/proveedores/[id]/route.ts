import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import {
  getProveedorById,
  updateProveedor,
  softDeleteProveedor,
} from '@/services/proveedores.service';

const UpdateSchema = z.object({
  nombre:   z.string().min(1).optional(),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email:    z.string().email().optional().or(z.literal('')),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const p = getProveedorById(Number(params.id));
    if (!p) return ok({ error: 'No encontrado' }, 404);
    return ok(p);
  } catch (err) { return handleError(err); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = UpdateSchema.parse(await req.json());
    return ok(updateProveedor(Number(params.id), body));
  } catch (err) { return handleError(err); }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    softDeleteProveedor(Number(params.id));
    return ok({ ok: true });
  } catch (err) { return handleError(err); }
}
