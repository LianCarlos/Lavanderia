# Lavandería App

![Tests](https://img.shields.io/badge/tests-13%20passing-brightgreen)
![Node](https://img.shields.io/badge/node-18%2B-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.4-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Sistema de gestión de lavandería — prueba técnica senior fullstack. Permite administrar clientes, órdenes de servicio con sus ítems, inventario de insumos, proveedores, personal, gastos operativos, entregas y un balance financiero, todo dentro de un único monolito Next.js con API Routes y SQLite embebido.

---

## Stack técnico

| Capa | Tecnología | Versión |
|---|---|---|
| Runtime | Node.js | 18+ |
| Framework fullstack | Next.js App Router | 14.2 |
| DB driver | better-sqlite3 | 11.x |
| Validación | Zod | 3.x |
| Estilos | Tailwind CSS | 3 |
| Data fetching | TanStack React Query | 5 |
| Lenguaje | TypeScript | 5.4 |
| Testing | Jest + ts-jest | — |
| Gestor de paquetes | pnpm | 8+ |

---

## Arquitectura del proyecto

Monolito unificado: las API Routes de Next.js actúan como backend REST y las páginas en `app/` son el frontend. No hay servidor separado.

```
lavanderia/
├── package.json                    ← única raíz, sin workspaces
├── data/
│   └── lavanderia.db               ← SQLite (creado automáticamente)
└── src/
    ├── app/
    │   ├── layout.tsx              ← Providers globales (QueryClient, sidebar)
    │   ├── dashboard/page.tsx
    │   ├── clientes/page.tsx
    │   ├── ordenes/page.tsx
    │   ├── inventario/page.tsx
    │   ├── proveedores/page.tsx
    │   ├── personal/page.tsx
    │   ├── gastos/page.tsx
    │   ├── entregas/page.tsx
    │   ├── balance/page.tsx
    │   └── api/                    ← API Routes (Next.js Route Handlers)
    │       ├── dashboard/stats/
    │       ├── clientes/[id]/
    │       ├── ordenes/[id]/
    │       │   ├── estado/
    │       │   └── items/[itemId]/
    │       ├── inventario/[id]/stock/
    │       ├── proveedores/[id]/
    │       ├── personal/[id]/
    │       ├── gastos/[id]/
    │       ├── entregas/[id]/
    │       └── balance/
    ├── services/                   ← lógica de negocio + acceso SQLite
    │   ├── clientes.service.ts
    │   ├── ordenes.service.ts
    │   ├── inventario.service.ts
    │   ├── proveedores.service.ts
    │   ├── personal.service.ts
    │   ├── gastos.service.ts
    │   ├── entregas.service.ts
    │   └── dashboard.service.ts
    ├── hooks/                      ← React Query hooks (data fetching)
    │   ├── useClientes.ts
    │   ├── useOrdenes.ts
    │   ├── useInventario.ts
    │   ├── useProveedores.ts
    │   ├── usePersonal.ts
    │   ├── useGastos.ts
    │   ├── useEntregas.ts
    │   └── useDashboard.ts
    ├── lib/
    │   ├── db.ts                   ← singleton SQLite HMR-safe (globalThis.__db)
    │   ├── schema.sql              ← DDL completo con triggers e índices
    │   └── apiResponse.ts          ← helpers ok() / handleError()
    ├── types/
    │   └── index.ts                ← interfaces, enums y AppError
    └── __tests__/
        ├── estado-machine.test.ts
        └── clientes.service.test.ts
```

---

## Requisitos previos

- **Node.js** 18 o superior
- **pnpm** 8 o superior (`npm install -g pnpm`)

---

## Instalación y arranque

```bash
# 1. Instalar dependencias
pnpm install

# 2. Arrancar la aplicación (puerto 3000)
pnpm dev
```

Abrir `http://localhost:3000`.

La primera vez, SQLite crea la base de datos en `data/lavanderia.db` e inserta datos de demostración automáticamente. No se requiere ninguna migración manual.

---

## Endpoints de la API

Base URL: `http://localhost:3000/api`

### Dashboard

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/dashboard/stats` | KPIs globales + últimas órdenes |

### Balance

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/balance` | Ingresos, egresos y saldo neto del período |

### Clientes

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/clientes` | Listar clientes activos |
| `GET` | `/clientes/:id` | Obtener cliente por ID |
| `POST` | `/clientes` | Crear cliente |
| `PUT` | `/clientes/:id` | Actualizar cliente |
| `DELETE` | `/clientes/:id` | Soft delete de cliente |

### Órdenes

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/ordenes` | Listar órdenes activas |
| `GET` | `/ordenes/:id` | Obtener orden con sus ítems |
| `POST` | `/ordenes` | Crear orden (sin `total`, lo calculan triggers) |
| `PATCH` | `/ordenes/:id/estado` | Avanzar estado (máquina de estados) |
| `DELETE` | `/ordenes/:id` | Soft delete de orden |
| `POST` | `/ordenes/:id/items` | Agregar ítem a una orden |
| `DELETE` | `/ordenes/:id/items/:itemId` | Eliminar ítem de una orden |

### Inventario

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/inventario` | Listar productos activos |
| `GET` | `/inventario/:id` | Obtener producto por ID |
| `POST` | `/inventario` | Crear producto |
| `PUT` | `/inventario/:id` | Actualizar producto |
| `PATCH` | `/inventario/:id/stock` | Ajustar stock por delta (`+n` / `-n`) |
| `DELETE` | `/inventario/:id` | Soft delete de producto |

### Proveedores

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/proveedores` | Listar proveedores activos |
| `POST` | `/proveedores` | Crear proveedor |
| `PUT` | `/proveedores/:id` | Actualizar proveedor |
| `DELETE` | `/proveedores/:id` | Soft delete |

### Personal

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/personal` | Listar personal activo |
| `POST` | `/personal` | Crear miembro del personal |
| `PUT` | `/personal/:id` | Actualizar personal |
| `DELETE` | `/personal/:id` | Soft delete |

Roles válidos: `Operador`, `Administrativo`, `Gerente`.

### Gastos

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/gastos` | Listar gastos |
| `POST` | `/gastos` | Registrar gasto |
| `DELETE` | `/gastos/:id` | Eliminar gasto |

Categorías válidas: `Insumos`, `Servicios`, `Personal`, `Mantenimiento`, `Otros`.

### Entregas

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/entregas` | Listar entregas |
| `POST` | `/entregas` | Registrar entrega |
| `DELETE` | `/entregas/:id` | Eliminar entrega |

---

## Seguridad: totales no manipulables

Los campos `total` (en `ordenes`) y `subtotal` (en `items_orden`) son **exclusivamente calculados por triggers SQLite**. El cliente nunca puede inyectar valores fraudulentos gracias a doble protección:

1. **Zod strip** — el schema de validación no incluye `total` ni `subtotal`; cualquier valor enviado es descartado en la deserialización.
2. **Strip explícito en service** — antes del `INSERT`/`UPDATE`, el service elimina explícitamente esos campos del objeto.

Resultado: aunque un atacante envíe `{ "total": 999999 }` en el cuerpo de la petición, la base de datos siempre calculará el valor correcto mediante triggers.

---

## Máquina de estados — Órdenes

Las transiciones de estado son estrictamente lineales. Cualquier salto o retroceso devuelve **HTTP 422**:

```
┌───────────┐    ┌────────────┐    ┌───────────┐    ┌─────────┐
│ Pendiente │───▶│ En Proceso │───▶│ Terminada │───▶│ Cobrada │
└───────────┘    └────────────┘    └───────────┘    └─────────┘

Reglas:
  ✅ Pendiente  → En Proceso    (válido)
  ✅ En Proceso → Terminada     (válido)
  ✅ Terminada  → Cobrada       (válido)
  ❌ Cobrada    → cualquier     (422 - estado final)
  ❌ Pendiente  → Cobrada       (422 - salto inválido)
  ❌ Terminada  → Pendiente     (422 - retroceso)
```

---

## SQLite — Diseño de datos

El schema completo está en `src/lib/schema.sql`. Puntos destacados:

- **8 tablas**: `clientes`, `proveedores`, `personal`, `ordenes`, `items_orden`, `inventario`, `gastos`, `entregas`.
- **Soft delete**: todas las tablas tienen columna `deleted_at`; las queries filtran `WHERE deleted_at IS NULL`.
- **Triggers automáticos**: `subtotal` de ítems y `total` de órdenes se recalculan en cada `INSERT`/`UPDATE`/`DELETE` de `items_orden`.
- **Número correlativo**: las órdenes reciben un `numero` legible (`ORD-0001`, `ORD-0002`, …) generado por trigger.
- **Índices**: sobre `deleted_at`, `estado`, `cliente_id` y `created_at` para queries frecuentes.
- **Singleton HMR-safe**: `src/lib/db.ts` usa `globalThis.__db` para evitar múltiples conexiones durante el hot reload de Next.js.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Arranca la app en desarrollo (`http://localhost:3000`) |
| `pnpm build` | Compila para producción |
| `pnpm start` | Sirve la build de producción |
| `pnpm test` | Ejecuta los 13 tests (Jest + ts-jest) |
| `pnpm lint` | ESLint sobre todo el proyecto |
| `pnpm format` | Prettier sobre todo el proyecto |

---

## Base de datos y datos de prueba

- La base de datos SQLite se crea en `data/lavanderia.db` al primer arranque.
- El seed inserta clientes, proveedores, personal, órdenes, ítems e inventario de demostración automáticamente.
- **Para resetear la DB:** detener la app, borrar el archivo y reiniciar.jf

```bash
rm data/lavanderia.db && pnpm dev
```
