import { ok, handleError } from '@/lib/apiResponse';
import { getBalanceStats } from '@/services/dashboard.service';

export async function GET() {
  try {
    return ok(getBalanceStats());
  } catch (err) {
    return handleError(err);
  }
}
