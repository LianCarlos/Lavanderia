import { NextResponse } from 'next/server';
import { AppError } from '@/types/index';
import { ZodError } from 'zod';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function handleError(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode });
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: err.flatten().fieldErrors },
      { status: 400 },
    );
  }
  console.error('[API Error]', err);
  return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
}
