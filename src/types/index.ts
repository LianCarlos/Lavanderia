// ── Tipos compartidos del dominio ──────────────────────────────────────────────

export type OrdenEstado = 'Pendiente' | 'En Proceso' | 'Terminada' | 'Cobrada';
export const ORDEN_ESTADOS: OrdenEstado[] = ['Pendiente', 'En Proceso', 'Terminada', 'Cobrada'];
export const GASTO_CATEGORIAS = ['Insumos', 'Servicios', 'Personal', 'Mantenimiento', 'Otros'] as const;
export const PERSONAL_ROLES = ['Operador', 'Administrativo', 'Gerente'] as const;

export interface Cliente {
  id: number;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  notas?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemOrden {
  id: number;
  orden_id: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  /** Solo lectura — calculado por trigger */
  subtotal: number;
  created_at: string;
}

export interface Orden {
  id: number;
  /** Generado por trigger — ORD-XXXX */
  numero: string;
  cliente_id: number;
  cliente_nombre?: string;
  estado: OrdenEstado;
  /** Solo lectura — calculado por trigger */
  total: number;
  observaciones?: string | null;
  fecha_entrega?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  items?: ItemOrden[];
}

export interface Inventario {
  id: number;
  nombre: string;
  descripcion?: string | null;
  stock: number;
  precio_unitario: number;
  unidad: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string | null;
  telefono?: string | null;
  email?: string | null;
  deleted_at?: string | null;
  created_at: string;
}

export interface Personal {
  id: number;
  nombre: string;
  rol: typeof PERSONAL_ROLES[number];
  telefono?: string | null;
  email?: string | null;
  salario: number;
  deleted_at?: string | null;
  created_at: string;
}

export interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  categoria: typeof GASTO_CATEGORIAS[number];
  proveedor_id?: number | null;
  proveedor_nombre?: string | null;
  fecha: string;
  notas?: string | null;
  deleted_at?: string | null;
  created_at: string;
}

export interface Entrega {
  id: number;
  orden_id: number;
  orden_numero?: string;
  cliente_nombre?: string;
  personal_id?: number | null;
  personal_nombre?: string | null;
  fecha_entrega: string;
  notas?: string | null;
  created_at: string;
}

export interface DashboardStats {
  pendientes: number;
  en_proceso: number;
  terminadas: number;
  cobradas: number;
  ingresos_hoy: number;
  ordenes_cuenta_corriente: number;
}

export interface BalanceStats {
  ingresos_total: number;
  gastos_total: number;
  balance_neto: number;
  ingresos_por_mes: { mes: string; total: number }[];
  gastos_por_categoria: { categoria: string; total: number }[];
}

export interface CreateClientePayload {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
}

export interface UpdateClientePayload {
  nombre?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
}

export interface CreateOrdenPayload {
  cliente_id: number;
  observaciones?: string;
  fecha_entrega?: string;
}

export interface UpdateOrdenPayload {
  cliente_id?: number;
  observaciones?: string;
  fecha_entrega?: string;
}

export interface CreateItemOrdenPayload {
  orden_id: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

export interface CreateInventarioPayload {
  nombre: string;
  descripcion?: string;
  stock?: number;
  precio_unitario?: number;
  unidad?: string;
}

export interface UpdateInventarioPayload {
  nombre?: string;
  descripcion?: string;
  stock?: number;
  precio_unitario?: number;
  unidad?: string;
}

export interface CreateGastoPayload {
  descripcion: string;
  monto: number;
  categoria: typeof GASTO_CATEGORIAS[number];
  proveedor_id?: number;
  fecha?: string;
  notas?: string;
}

export interface UpdateGastoPayload {
  descripcion?: string;
  monto?: number;
  categoria?: typeof GASTO_CATEGORIAS[number];
  proveedor_id?: number | null;
  fecha?: string;
  notas?: string;
}

export interface CreateEntregaPayload {
  orden_id: number;
  personal_id?: number;
  notas?: string;
  fecha_entrega?: string;
}

export interface UpdateEntregaPayload {
  orden_id?: number;
  personal_id?: number | null;
  notas?: string;
  fecha_entrega?: string;
}

// ── Error de dominio ──────────────────────────────────────────────────────────
export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
