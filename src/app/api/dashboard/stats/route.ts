import { ok, handleError } from '@/lib/apiResponse';
import { getDashboardStats } from '@/services/dashboard.service';

export async function GET() {
  try {
    return ok(getDashboardStats());
  } catch (err) {
    return handleError(err);
  }
}
