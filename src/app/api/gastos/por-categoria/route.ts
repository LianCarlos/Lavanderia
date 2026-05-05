import { ok, handleError } from '@/lib/apiResponse';
import { getGastosPorCategoria } from '@/services/gastos.service';

export async function GET() {
  try {
    return ok(getGastosPorCategoria());
  } catch (err) {
    return handleError(err);
  }
}
