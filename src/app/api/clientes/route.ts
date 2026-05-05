import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, handleError } from '@/lib/apiResponse';
import {
  getClientes,
  createCliente,
  searchClientes,
} from '@/services/clientes.service';

const CreateSchema = z.object({
  nombre:    z.string().min(1),
  telefono:  z.string().optional(),
  email:     z.string().email().optional().or(z.literal('')),
  direccion: z.string().optional(),
  notas:     z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    const data = q ? searchClientes(q) : getClientes();
    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = CreateSchema.parse(await req.json());
    return ok(createCliente(body), 201);
  } catch (err) {
    return handleError(err);
  }
}
