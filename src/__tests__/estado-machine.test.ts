/**
 * Tests de la máquina de estados de órdenes.
 * Usa un mock de db para no tocar disco.
 */

import { AppError } from '@/types/index';

// ---- mock del módulo db ----
const mockGet  = jest.fn();
const mockRun  = jest.fn(() => ({ changes: 1 }));
const mockStmt = { get: mockGet, run: mockRun };

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    prepare: jest.fn(() => mockStmt),
  },
}));

import {
  updateOrdenEstado,
  softDeleteOrden,
} from '@/services/ordenes.service';

const ORDER_BASE = {
  id: 1, numero: 'ORD-0001', cliente_id: 1, estado: 'Pendiente',
  total: 0, observaciones: null, fecha_entrega: null,
  deleted_at: null, created_at: '', updated_at: '',
};

describe('Máquina de estados de órdenes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Pendiente → En Proceso es válido', () => {
    mockGet
      .mockReturnValueOnce({ ...ORDER_BASE, estado: 'Pendiente' })
      .mockReturnValueOnce({ ...ORDER_BASE, estado: 'En Proceso' });
    const result = updateOrdenEstado(1, 'En Proceso');
    expect(result.estado).toBe('En Proceso');
  });

  it('En Proceso → Terminada es válido', () => {
    mockGet
      .mockReturnValueOnce({ ...ORDER_BASE, estado: 'En Proceso' })
      .mockReturnValueOnce({ ...ORDER_BASE, estado: 'Terminada' });
    const result = updateOrdenEstado(1, 'Terminada');
    expect(result.estado).toBe('Terminada');
  });

  it('Terminada → Cobrada es válido', () => {
    mockGet
      .mockReturnValueOnce({ ...ORDER_BASE, estado: 'Terminada' })
      .mockReturnValueOnce({ ...ORDER_BASE, estado: 'Cobrada' });
    const result = updateOrdenEstado(1, 'Cobrada');
    expect(result.estado).toBe('Cobrada');
  });

  it('Cobrada → cualquier estado es inválido (422)', () => {
    mockGet.mockReturnValueOnce({ ...ORDER_BASE, estado: 'Cobrada' });
    let caught: AppError | undefined;
    try {
      updateOrdenEstado(1, 'Pendiente');
    } catch (e) {
      caught = e as AppError;
    }
    expect(caught).toBeInstanceOf(AppError);
    expect(caught?.statusCode).toBe(422);
  });

  it('Pendiente → Terminada (salto) es inválido (422)', () => {
    mockGet.mockReturnValueOnce({ ...ORDER_BASE, estado: 'Pendiente' });
    expect(() => updateOrdenEstado(1, 'Terminada')).toThrow(AppError);
  });

  it('Orden no encontrada lanza 404', () => {
    mockGet.mockReturnValueOnce(undefined);
    let caught: AppError | undefined;
    try {
      updateOrdenEstado(999, 'En Proceso');
    } catch (e) {
      caught = e as AppError;
    }
    expect(caught).toBeInstanceOf(AppError);
    expect(caught?.statusCode).toBe(404);
  });

  it('softDeleteOrden con ID inexistente lanza 404', () => {
    mockRun.mockReturnValueOnce({ changes: 0 });
    expect(() => softDeleteOrden(999)).toThrow(AppError);
  });
});
