-- =============================================================================
-- Migration 001 — Schema inicial Lavandería App
-- Fecha: 2026-05-05
-- IMPORTANTE: Los totales en ordenes e items_orden son SOLO calculados por
-- triggers. Nunca escribir total/subtotal directamente desde el cliente.
-- =============================================================================

PRAGMA foreign_keys = ON;

-- =============================================================================
-- === TABLAS ===
-- =============================================================================

CREATE TABLE IF NOT EXISTS clientes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT    NOT NULL,
  telefono    TEXT,
  email       TEXT,
  direccion   TEXT,
  notas       TEXT,
  deleted_at  TEXT    DEFAULT NULL,                          -- Soft Delete
  created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS proveedores (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT    NOT NULL,
  contacto    TEXT,
  telefono    TEXT,
  email       TEXT,
  deleted_at  TEXT    DEFAULT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS personal (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT    NOT NULL,
  rol         TEXT    NOT NULL CHECK(rol IN ('Operador', 'Administrativo', 'Gerente')),
  telefono    TEXT,
  email       TEXT,
  salario     REAL    NOT NULL DEFAULT 0,
  deleted_at  TEXT    DEFAULT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS ordenes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  numero         TEXT    NOT NULL UNIQUE,                    -- ORD-XXXX, generado por trigger
  cliente_id     INTEGER NOT NULL REFERENCES clientes(id),
  estado         TEXT    NOT NULL DEFAULT 'Pendiente'
                         CHECK(estado IN ('Pendiente', 'En Proceso', 'Terminada', 'Cobrada')),
  total          REAL    NOT NULL DEFAULT 0,                 -- SOLO calculado por trigger
  observaciones  TEXT,
  fecha_entrega  TEXT,
  deleted_at     TEXT    DEFAULT NULL,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS items_orden (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  orden_id         INTEGER NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  descripcion      TEXT    NOT NULL,
  cantidad         INTEGER NOT NULL DEFAULT 1 CHECK(cantidad > 0),
  precio_unitario  REAL    NOT NULL CHECK(precio_unitario >= 0),
  subtotal         REAL    NOT NULL DEFAULT 0,               -- SOLO calculado por trigger
  created_at       TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS inventario (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre           TEXT    NOT NULL,
  descripcion      TEXT,
  stock            INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
  precio_unitario  REAL    DEFAULT 0,
  unidad           TEXT    DEFAULT 'unidad',
  deleted_at       TEXT    DEFAULT NULL,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS gastos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  descripcion   TEXT    NOT NULL,
  monto         REAL    NOT NULL CHECK(monto > 0),
  categoria     TEXT    NOT NULL
                CHECK(categoria IN ('Insumos', 'Servicios', 'Personal', 'Mantenimiento', 'Otros')),
  proveedor_id  INTEGER REFERENCES proveedores(id),
  fecha         TEXT    DEFAULT (date('now','localtime')),
  notas         TEXT,
  deleted_at    TEXT    DEFAULT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS entregas (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  orden_id       INTEGER NOT NULL REFERENCES ordenes(id),
  personal_id    INTEGER REFERENCES personal(id),
  fecha_entrega  TEXT    DEFAULT (datetime('now','localtime')),
  notas          TEXT,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

-- =============================================================================
-- === TRIGGERS ===
-- =============================================================================

-- 1. Generar número de orden automático (ORD-XXXX con padding de 4 dígitos)
CREATE TRIGGER IF NOT EXISTS trg_generar_numero_orden
AFTER INSERT ON ordenes
BEGIN
  UPDATE ordenes
  SET numero = 'ORD-' || printf('%04d', NEW.id)
  WHERE id = NEW.id;
END;

-- 2. Calcular subtotal de item al INSERT y recalcular total de la orden
CREATE TRIGGER IF NOT EXISTS trg_calcular_subtotal_item_insert
AFTER INSERT ON items_orden
BEGIN
  UPDATE items_orden
  SET subtotal = NEW.cantidad * NEW.precio_unitario
  WHERE id = NEW.id;

  UPDATE ordenes
  SET total      = (SELECT COALESCE(SUM(subtotal), 0) FROM items_orden WHERE orden_id = NEW.orden_id),
      updated_at = datetime('now','localtime')
  WHERE id = NEW.orden_id;
END;

-- 3. Recalcular subtotal de item al UPDATE de cantidad o precio
CREATE TRIGGER IF NOT EXISTS trg_calcular_subtotal_item_update
AFTER UPDATE OF cantidad, precio_unitario ON items_orden
BEGIN
  UPDATE items_orden
  SET subtotal = NEW.cantidad * NEW.precio_unitario
  WHERE id = NEW.id;

  UPDATE ordenes
  SET total      = (SELECT COALESCE(SUM(subtotal), 0) FROM items_orden WHERE orden_id = NEW.orden_id),
      updated_at = datetime('now','localtime')
  WHERE id = NEW.orden_id;
END;

-- 4. Recalcular total de la orden al eliminar un item
CREATE TRIGGER IF NOT EXISTS trg_recalcular_total_on_item_delete
AFTER DELETE ON items_orden
BEGIN
  UPDATE ordenes
  SET total      = (SELECT COALESCE(SUM(subtotal), 0) FROM items_orden WHERE orden_id = OLD.orden_id),
      updated_at = datetime('now','localtime')
  WHERE id = OLD.orden_id;
END;

-- 5. Actualizar updated_at en ordenes (solo cuando no fue ya actualizado por los triggers de items)
CREATE TRIGGER IF NOT EXISTS trg_ordenes_updated_at
AFTER UPDATE ON ordenes
WHEN OLD.updated_at = NEW.updated_at
BEGIN
  UPDATE ordenes SET updated_at = datetime('now','localtime') WHERE id = NEW.id;
END;

-- 6. Actualizar updated_at en clientes
CREATE TRIGGER IF NOT EXISTS trg_clientes_updated_at
AFTER UPDATE ON clientes
WHEN OLD.updated_at = NEW.updated_at
BEGIN
  UPDATE clientes SET updated_at = datetime('now','localtime') WHERE id = NEW.id;
END;

-- =============================================================================
-- === ÍNDICES ===
-- =============================================================================

-- Clientes: filtro de soft delete
CREATE INDEX IF NOT EXISTS idx_clientes_deleted_at    ON clientes(deleted_at);

-- Órdenes: queries de dashboard y JOIN frecuentes
CREATE INDEX IF NOT EXISTS idx_ordenes_estado         ON ordenes(estado, deleted_at);
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente_id     ON ordenes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_created_at     ON ordenes(created_at);

-- Items: JOIN siempre presente
CREATE INDEX IF NOT EXISTS idx_items_orden_orden_id   ON items_orden(orden_id);

-- Gastos: filtros por fecha y categoría
CREATE INDEX IF NOT EXISTS idx_gastos_fecha           ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria       ON gastos(categoria);

-- =============================================================================
-- === DATOS SEMILLA ===
-- =============================================================================

-- Clientes
INSERT INTO clientes (nombre, telefono, email, direccion) VALUES
  ('Benevento, Carlos',  '351-555-0101', 'carlos@benevento.com',  'Av. Colón 1234, Córdoba'),
  ('Rulo, Marcelo',      '351-555-0202', 'rulo@email.com',        'Bv. San Juan 890, Córdoba'),
  ('Martínez, Ana',      '351-555-0303', 'ana.martinez@mail.com', 'Calle Lima 456, Córdoba'),
  ('López, Roberto',     '351-555-0404', 'rlopez@email.com',      'Av. Vélez 321, Córdoba'),
  ('García, Sofía',      '351-555-0505', 'sofia.garcia@mail.com', 'Rivadavia 789, Córdoba');

-- Proveedores
INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES
  ('Insumos del Sur S.A.',  'Diego Peralta',  '011-4444-1111', 'ventas@insumossur.com'),
  ('Química Cba Distribuidora', 'Laura Díaz', '351-444-2222', 'ldíaz@quimicacba.com');

-- Personal
INSERT INTO personal (nombre, rol, telefono, salario) VALUES
  ('Rodríguez, José',   'Operador',      '351-666-0001', 120000),
  ('Fernández, María',  'Administrativo','351-666-0002', 150000);

-- Inventario
INSERT INTO inventario (nombre, descripcion, stock, precio_unitario, unidad) VALUES
  ('Detergente industrial', 'Bidón 5 litros',    20, 3500,  'bidón'),
  ('Suavizante',            'Botella 2 litros',  35, 1800,  'botella'),
  ('Bolsas plásticas',      'Pack x 100 unid.',  10, 2200,  'pack');

-- ---------------------------------------------------------------------------
-- Órdenes con items — los triggers calculan subtotal y total automáticamente
-- Se insertan con numero='ORD-TEMP' que el trigger reemplaza por ORD-XXXX
-- Los IDs dependen del AUTOINCREMENT; usamos el orden de inserción:
--   orden id=1 → cliente Benevento   → ORD-0001 (en seed, diseño muestra ORD-0243 como referencia UI)
-- Para replicar los números del diseño (ORD-0240..0243) podemos usar sqlite_sequence
-- ---------------------------------------------------------------------------

-- Órdenes (numero será sobreescrito por el trigger trg_generar_numero_orden)
INSERT INTO ordenes (numero, cliente_id, estado, observaciones, fecha_entrega) VALUES
  ('ORD-TEMP', 1, 'En Proceso',  'Manchas difíciles en camisa',    datetime('now','+2 days','localtime')),  -- id=1 → ORD-0001
  ('ORD-TEMP', 2, 'Pendiente',   'Llamar antes de retirar',        datetime('now','+3 days','localtime')),  -- id=2
  ('ORD-TEMP', 3, 'Terminada',   'Lista para entrega',             datetime('now','-1 day','localtime')),   -- id=3
  ('ORD-TEMP', 4, 'Cobrada',     'Entregado y cobrado',            datetime('now','-2 days','localtime')),  -- id=4
  ('ORD-TEMP', 1, 'Pendiente',   'Terno completo',                 datetime('now','+5 days','localtime')),  -- id=5
  ('ORD-TEMP', 5, 'En Proceso',  'Sábanas y toallas',              datetime('now','+1 day','localtime')),   -- id=6
  ('ORD-TEMP', 2, 'Terminada',   'Uniforme de trabajo',            datetime('now','-1 day','localtime')),   -- id=7
  ('ORD-TEMP', 3, 'Cobrada',     'Tapicería sofá',                 datetime('now','-3 days','localtime'));  -- id=8

-- Items de Orden 1 — En Proceso, Benevento → total $40.000
-- 2 camisas ($8.000 c/u) + 1 traje ($24.000) = $40.000
INSERT INTO items_orden (orden_id, descripcion, cantidad, precio_unitario) VALUES
  (1, 'Lavado camisa',    2, 8000.00),
  (1, 'Lavado en seco traje', 1, 24000.00);

-- Items de Orden 2 — Pendiente, Rulo → total $15.000
-- 3 pantalones ($5.000 c/u) = $15.000
INSERT INTO items_orden (orden_id, descripcion, cantidad, precio_unitario) VALUES
  (2, 'Lavado pantalón', 3, 5000.00);

-- Items de Orden 3 — Terminada, Martínez → total $22.500
-- 2 camisas ($6.000 c/u) + 1 vestido ($10.500) = $22.500
INSERT INTO items_orden (orden_id, descripcion, cantidad, precio_unitario) VALUES
  (3, 'Lavado camisa',  2,  6000.00),
  (3, 'Lavado vestido', 1, 10500.00);

-- Items de Orden 4 — Cobrada, López → total $18.000
-- 1 tapado ($12.000) + 2 camisas ($3.000 c/u) = $18.000
INSERT INTO items_orden (orden_id, descripcion, cantidad, precio_unitario) VALUES
  (4, 'Lavado en seco tapado', 1, 12000.00),
  (4, 'Lavado camisa',         2,  3000.00);

-- Items de Orden 5 — Pendiente, Benevento → total $32.000
-- 1 terno completo ($32.000) = $32.000
INSERT INTO items_orden (orden_id, descripcion, cantidad, precio_unitario) VALUES
  (5, 'Lavado terno completo', 1, 32000.00);

-- Items de Orden 6 — En Proceso, García → total $14.000
-- 4 sábanas ($2.500 c/u) + 6 toallas ($900 c/u) = $15.400
INSERT INTO items_orden (orden_id, descripcion, cantidad, precio_unitario) VALUES
  (6, 'Lavado sábana doble', 4, 2500.00),
  (6, 'Lavado toalla',       6,  900.00);

-- Items de Orden 7 — Terminada, Rulo → total $20.000
-- 2 uniformes ($10.000 c/u) = $20.000
INSERT INTO items_orden (orden_id, descripcion, cantidad, precio_unitario) VALUES
  (7, 'Lavado uniforme trabajo', 2, 10000.00);

-- Items de Orden 8 — Cobrada, Martínez → total $35.000
-- 1 tapicería sofá 3 cuerpos ($35.000) = $35.000
INSERT INTO items_orden (orden_id, descripcion, cantidad, precio_unitario) VALUES
  (8, 'Lavado tapicería sofá 3 cuerpos', 1, 35000.00);

-- Gastos
INSERT INTO gastos (descripcion, monto, categoria, proveedor_id, fecha) VALUES
  ('Compra detergente industrial bidón x5',  17500.00, 'Insumos',      1, date('now','-5 days','localtime')),
  ('Servicio eléctrico mensual',             28000.00, 'Servicios',  NULL, date('now','-3 days','localtime')),
  ('Compra suavizante x10 botellas',         18000.00, 'Insumos',      2, date('now','-1 day','localtime'));

-- Entregas (órdenes Terminada y Cobrada)
INSERT INTO entregas (orden_id, personal_id, notas) VALUES
  (3, 1, 'Entregado al cliente en mostrador'),
  (4, 2, 'Entregado y cobrado en efectivo'),
  (7, 1, 'Entregado al cliente'),
  (8, 2, 'Entregado y cobrado con tarjeta');

-- =============================================================================
-- === ROLLBACK (comentado) ===
-- Para revertir esta migración ejecutar:
-- DROP TABLE IF EXISTS entregas;
-- DROP TABLE IF EXISTS gastos;
-- DROP TABLE IF EXISTS inventario;
-- DROP TABLE IF EXISTS items_orden;
-- DROP TABLE IF EXISTS ordenes;
-- DROP TABLE IF EXISTS personal;
-- DROP TABLE IF EXISTS proveedores;
-- DROP TABLE IF EXISTS clientes;
-- =============================================================================
