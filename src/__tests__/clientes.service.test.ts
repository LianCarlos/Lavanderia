import { AppError } from '@/types/index';

const mockGet  = jest.fn();
const mockRun  = jest.fn(() => ({ lastInsertRowid: 1, changes: 1 }));
const mockAll  = jest.fn(() => []);
const mockStmt = { get: mockGet, run: mockRun, all: mockAll };

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    prepare: jest.fn(() => mockStmt),
  },
}));

import {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  softDeleteCliente,
} from '@/services/clientes.service';

const CLIENTE = { id: 1, nombre: 'Juan Pérez', telefono: null, email: null, direccion: null, notas: null, deleted_at: null, created_at: '', updated_at: '' };

beforeEach(() => jest.clearAllMocks());

describe('clientes.service', () => {
  it('getClientes devuelve array', () => {
    mockAll.mockReturnValueOnce([CLIENTE]);
    const result = getClientes();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].nombre).toBe('Juan Pérez');
  });

  it('getClienteById devuelve cliente', () => {
    mockGet.mockReturnValueOnce(CLIENTE);
    expect(getClienteById(1)).toEqual(CLIENTE);
  });

  it('getClienteById devuelve undefined si no existe', () => {
    mockGet.mockReturnValueOnce(undefined);
    expect(getClienteById(999)).toBeUndefined();
  });

  it('createCliente inserta y retorna cliente', () => {
    mockGet.mockReturnValueOnce(CLIENTE);
    const result = createCliente({ nombre: 'Juan Pérez' });
    expect(result.nombre).toBe('Juan Pérez');
  });

  it('updateCliente lanza 404 si no existe', () => {
    mockGet.mockReturnValueOnce(undefined);
    let caught: AppError | undefined;
    try {
      updateCliente(999, { nombre: 'X' });
    } catch (e) {
      caught = e as AppError;
    }
    expect(caught).toBeInstanceOf(AppError);
    expect(caught?.statusCode).toBe(404);
  });

  it('softDeleteCliente lanza 404 si no existe', () => {
    mockRun.mockReturnValueOnce({ changes: 0 });
    let caught: AppError | undefined;
    try {
      softDeleteCliente(999);
    } catch (e) {
      caught = e as AppError;
    }
    expect(caught).toBeInstanceOf(AppError);
    expect(caught?.statusCode).toBe(404);
  });
});
