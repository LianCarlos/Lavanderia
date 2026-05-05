import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import {
  getPersonalById,
  updatePersonal,
  softDeletePersonal,
} from '@/services/personal.service';
import { PERSONAL_ROLES } from '@/types/index';

const UpdateSchema = z.object({
  nombre:   z.string().min(1).optional(),
  rol:      z.enum(PERSONAL_ROLES).optional(),
  telefono: z.string().optional(),
  email:    z.string().email().optional().or(z.literal('')),
  salario:  z.number().nonnegative().optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const p = getPersonalById(Number(params.id));
    if (!p) return ok({ error: 'No encontrado' }, 404);
    return ok(p);
  } catch (err) { return handleError(err); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = UpdateSchema.parse(await req.json());
    return ok(updatePersonal(Number(params.id), body as Parameters<typeof updatePersonal>[1]));
  } catch (err) { return handleError(err); }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    softDeletePersonal(Number(params.id));
    return ok({ ok: true });
  } catch (err) { return handleError(err); }
}
