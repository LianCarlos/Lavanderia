import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import { getProveedores, createProveedor } from '@/services/proveedores.service';

const CreateSchema = z.object({
  nombre:   z.string().min(1),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email:    z.string().email().optional().or(z.literal('')),
});

export async function GET() {
  try { return ok(getProveedores()); } catch (err) { return handleError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const body = CreateSchema.parse(await req.json());
    return ok(createProveedor(body), 201);
  } catch (err) {
    return handleError(err);
  }
}
