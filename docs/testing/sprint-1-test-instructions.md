# Sprint 1 — Instrucciones de Testeo Manual

**Fecha:** 2026-05-05  
**Alcance:** Dashboard · Órdenes (CRUD + máquina de estados) · Seguridad de totales · Clientes · Inventario · Gastos  
**Tests automatizados:** 42 pasando en verde (Jest + Supertest)

---

## Prerequisitos y entorno

| Requisito | Detalle |
|---|---|
| Backend corriendo | `http://localhost:3001` |
| Frontend corriendo | `http://localhost:3000` |
| DB inicializada con seed | Primer arranque del servidor crea `server/lavanderia.db` con datos demo |
| Herramienta HTTP | curl, Postman, Insomnia o Thunder Client |

### Arranque

```bash
# Opción A — ambos juntos
pnpm dev

# Opción B — terminales separadas
pnpm --filter server dev   # terminal 1
pnpm --filter client dev   # terminal 2
```

### Reset de datos de prueba

```bash
# Detener el servidor, luego:
rm server/lavanderia.db
pnpm --filter server dev   # recrea DB + seed automáticamente
```

---

## Datos de prueba disponibles (seed)

- **Clientes:** al menos 3 clientes activos con nombre y teléfono.
- **Órdenes:** al menos 2 órdenes en estado `Pendiente` con 2 ítems cada una.
- **Inventario:** al menos 3 productos con stock > 0.
- **Gastos:** al menos 2 gastos registrados en categorías distintas.

---

## Casos de Prueba

---

### TC-01 — Dashboard: carga y muestra estadísticas

**Flujo:** UI

1. Navegar a `http://localhost:3000/dashboard`.
2. Verificar que se renderizan **4 tarjetas KPI**:
   - Órdenes Activas
   - Clientes Registrados
   - Ingresos del Mes (o similar)
   - Gastos del Mes (o similar)
3. Verificar que los valores son numéricos y mayores que 0 (existen datos seed).

**Resultado esperado:** Las 4 cards muestran valores sin errores de carga. No debe aparecer ningún spinner infinito ni mensaje de error.

---

### TC-02 — Dashboard: últimas órdenes con badges de estado

**Flujo:** UI

1. En `/dashboard`, localizar la tabla o lista de últimas órdenes.
2. Verificar que se muestran al menos **2 órdenes**.
3. Verificar que cada orden muestra un **badge de estado** con el color correcto:
   - `Pendiente` → color amarillo / naranja
   - `En Proceso` → color azul
   - `Terminada` → color verde claro
   - `Cobrada` → color verde oscuro / morado

**Resultado esperado:** Las órdenes se renderizan con badges visualmente diferenciados.

---

### TC-03 — Dashboard: acciones rápidas navegan correctamente

**Flujo:** UI

1. En `/dashboard`, localizar el bloque de **Acciones Rápidas**.
2. Hacer click en cada acción disponible (ej. "Nueva Orden", "Nuevo Cliente").
3. Verificar que cada botón navega a la página correspondiente sin errores 404.

**Resultado esperado:** Cada acción redirige a la ruta correcta.

---

### TC-04 — CRUD de Clientes

**Flujo:** UI + API

#### Crear

1. Navegar a `/clientes`.
2. Crear un nuevo cliente con nombre `"Test QA"`, teléfono `"555-0000"`, email `"qa@test.com"`.
3. Verificar que aparece en el listado.

```bash
# Equivalente API:
curl -X POST http://localhost:3001/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test QA","telefono":"555-0000","email":"qa@test.com"}'
# Esperado: 201 con id asignado
```

#### Editar

4. Editar el nombre del cliente recién creado a `"Test QA Editado"`.
5. Verificar que el cambio persiste al recargar.

#### Soft Delete

6. Eliminar el cliente.
7. Verificar que ya **no aparece** en el listado.
8. Verificar en DB (opcional) que `deleted_at` tiene valor y el registro existe.

**Resultado esperado:** El cliente se crea, edita y desaparece del listado tras el soft delete. El registro en DB no se borra físicamente.

---

### TC-05 — CRÍTICO: Crear orden con ítems — total calculado por trigger

**Flujo:** API

1. Crear una orden para un cliente existente (id: 1):

```bash
curl -X POST http://localhost:3001/api/ordenes \
  -H "Content-Type: application/json" \
  -d '{"cliente_id":1,"observaciones":"Test QA sprint-1"}'
# Guardar el id retornado: ORDEN_ID
```

2. Agregar dos ítems:

```bash
# Ítem 1: 2 × $15.00 = $30.00
curl -X POST http://localhost:3001/api/ordenes/ORDEN_ID/items \
  -H "Content-Type: application/json" \
  -d '{"descripcion":"Camisa","cantidad":2,"precio_unitario":15}'

# Ítem 2: 3 × $10.00 = $30.00
curl -X POST http://localhost:3001/api/ordenes/ORDEN_ID/items \
  -H "Content-Type: application/json" \
  -d '{"descripcion":"Pantalon","cantidad":3,"precio_unitario":10}'
```

3. Consultar la orden:

```bash
curl http://localhost:3001/api/ordenes/ORDEN_ID
```

**Resultado esperado:**
- `total` de la orden = **60.00** (calculado por trigger, no por el cliente)
- `subtotal` del ítem 1 = `30.00`
- `subtotal` del ítem 2 = `30.00`

---

### TC-06 — CRÍTICO: Enviar `total` en POST /api/ordenes — debe ser ignorado

**Flujo:** API  
**Severidad:** Alta — protección contra manipulación de precios

```bash
curl -X POST http://localhost:3001/api/ordenes \
  -H "Content-Type: application/json" \
  -d '{"cliente_id":1,"total":999999,"observaciones":"Ataque de precio"}'
```

**Resultado esperado:**
- HTTP `201` — la orden se crea correctamente.
- `total` en la respuesta = **0** (sin ítems aún) — nunca `999999`.
- El campo `total` del cuerpo fue silenciosamente descartado por Zod strip + strip del controller.

---

### TC-07 — Máquina de estados: Pendiente → En Proceso (transición válida)

**Flujo:** API

```bash
curl -X PATCH http://localhost:3001/api/ordenes/ORDEN_ID/estado \
  -H "Content-Type: application/json" \
  -d '{"estado":"En Proceso"}'
```

**Resultado esperado:** HTTP `200` con la orden en estado `"En Proceso"`.

---

### TC-08 — Máquina de estados: retroceso Cobrada → Pendiente debe fallar

**Flujo:** API

1. Avanzar la orden hasta `Cobrada` (requiere tres transiciones previas válidas).
2. Intentar retroceder:

```bash
curl -X PATCH http://localhost:3001/api/ordenes/ORDEN_ID/estado \
  -H "Content-Type: application/json" \
  -d '{"estado":"Pendiente"}'
```

**Resultado esperado:** HTTP `422` con mensaje descriptivo indicando que la transición es inválida.

---

### TC-09 — Máquina de estados: salto Pendiente → Cobrada debe fallar

**Flujo:** API

1. Crear una orden nueva (queda en `Pendiente`).
2. Intentar saltar directamente:

```bash
curl -X PATCH http://localhost:3001/api/ordenes/NUEVA_ORDEN_ID/estado \
  -H "Content-Type: application/json" \
  -d '{"estado":"Cobrada"}'
```

**Resultado esperado:** HTTP `422` con mensaje descriptivo. El estado de la orden no cambia.

---

### TC-10 — CRUD de Inventario con ajuste de stock

**Flujo:** API + UI (opcional)

#### Crear producto

```bash
curl -X POST http://localhost:3001/api/inventario \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Detergente QA","cantidad":10,"unidad":"litros","stock_minimo":2}'
# Guardar PROD_ID
```

#### Ajustar stock +5

```bash
curl -X PATCH http://localhost:3001/api/inventario/PROD_ID/stock \
  -H "Content-Type: application/json" \
  -d '{"delta":5}'
# Esperado: stock = 15
```

#### Ajustar stock -3

```bash
curl -X PATCH http://localhost:3001/api/inventario/PROD_ID/stock \
  -H "Content-Type: application/json" \
  -d '{"delta":-3}'
# Esperado: stock = 12
```

**Resultado esperado:** El stock refleja correctamente la suma de deltas aplicados.

---

### TC-11 — Registro de gastos

**Flujo:** API + UI

```bash
curl -X POST http://localhost:3001/api/gastos \
  -H "Content-Type: application/json" \
  -d '{"descripcion":"Compra de jabón QA","monto":150.50,"categoria":"Insumos","fecha":"2026-05-05"}'
```

**Resultado esperado:**
- HTTP `201` con el gasto creado.
- El gasto aparece en `GET /api/gastos`.
- Aparece en `GET /api/gastos/por-categoria` bajo la categoría `"Insumos"`.

---

### TC-12 — Soft delete: orden eliminada no aparece en listados

**Flujo:** API

1. Eliminar la orden de prueba creada en TC-05:

```bash
curl -X DELETE http://localhost:3001/api/ordenes/ORDEN_ID
# Esperado: 204 No Content
```

2. Verificar que no aparece en el listado:

```bash
curl http://localhost:3001/api/ordenes
# La orden con ORDEN_ID NO debe aparecer en el array
```

3. Verificar que el dashboard ya no la contabiliza (refrescar `/dashboard`).

**Resultado esperado:** La orden desaparece de todos los listados. En DB, `deleted_at` tiene valor pero el registro persiste.

---

## Criterios de Aceptación Globales

| Criterio | Estado esperado |
|---|---|
| Todos los `total` de órdenes coinciden con la suma de sus ítems | ✅ Verificado por trigger |
| Ningún endpoint acepta `total` ni `subtotal` desde el cliente | ✅ Zod strip + strip en controller |
| Transiciones inválidas retornan **422** con mensaje descriptivo | ✅ Estado machine en service |
| El dashboard se actualiza al cambiar el estado de una orden | ✅ React Query refetch |
| Soft delete: registros eliminados no aparecen en listados | ✅ Filtro `WHERE deleted_at IS NULL` |
| 42 tests automatizados pasan en verde | ✅ `pnpm test` |

---

## Casos de Borde

| Caso | Comportamiento esperado |
|---|---|
| Crear cliente sin nombre | `400` — "El nombre es requerido" |
| Email inválido en cliente | `400` — "Email inválido" |
| Ajustar stock con delta que lleva a negativo | `400` o `409` — stock no puede ser negativo (constraint SQLite) |
| Fecha de gasto con formato incorrecto (no YYYY-MM-DD) | `400` — "Formato de fecha: YYYY-MM-DD" |
| Agregar ítem con `cantidad: 0` | `400` — validación Zod |
| Agregar ítem con `precio_unitario: -5` | `400` — validación Zod |
| Consultar orden inexistente | `404` |
| Eliminar ítem de orden con estado `Cobrada` | Depende de implementación — documentar comportamiento real |

---

## Validaciones de Regresión

Ejecutar tras cualquier cambio de código:

```bash
pnpm test                              # 42 tests deben pasar
pnpm --filter server test:coverage     # cobertura de líneas
```

Revisar manualmente TC-06 y TC-08/TC-09 ante cualquier cambio en los services de órdenes o los middlewares de validación.

---

## Gaps Documentales Residuales

- La gestión de **Entregas** y **Personal** están en el schema SQL pero no expuestas en rutas — pendiente de implementar en siguiente ciclo.
- El seed exacto no está documentado en este artefacto; verificar `server/src/database/connection.ts` o archivo de seed correspondiente para IDs exactos.
