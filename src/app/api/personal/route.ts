import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import { getPersonal, createPersonal } from '@/services/personal.service';
import { PERSONAL_ROLES } from '@/types/index';

const CreateSchema = z.object({
  nombre:   z.string().min(1),
  rol:      z.enum(PERSONAL_ROLES),
  telefono: z.string().optional(),
  email:    z.string().email().optional().or(z.literal('')),
  salario:  z.number().nonnegative().optional(),
});

export async function GET() {
  try { return ok(getPersonal()); } catch (err) { return handleError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const body = CreateSchema.parse(await req.json());
    return ok(createPersonal(body as Parameters<typeof createPersonal>[0]), 201);
  } catch (err) {
    return handleError(err);
  }
}
