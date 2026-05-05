import { NextRequest } from 'next/server';
import { ok, handleError } from '@/lib/apiResponse';
import { deleteItemOrden } from '@/services/ordenes.service';

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; itemId: string } },
) {
  try {
    deleteItemOrden(Number(params.itemId));
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
