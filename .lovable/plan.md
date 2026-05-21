
# Plan: App de Inventario y Horarios FitHub (iPad-first)

## Nota sobre el stack
El proyecto base usa **TanStack Router** (no React Router DOM) sobre TanStack Start + Vite. Mantendré todo lo demás del stack solicitado tal cual (Tailwind, shadcn/ui, Lucide, TanStack Table, date-fns, xlsx) y usaré TanStack Router para la navegación entre Dashboard, Inventario, Horarios y Ajustes. Funcionalmente equivalente, sin fricción para el usuario.

Persistencia inicial: mock data en memoria + `localStorage` para cambios de stock y registros de horario (sin backend). Si más adelante se quiere multiusuario/multidispositivo, se puede activar Lovable Cloud en un segundo paso.

## Estructura de rutas

```text
src/routes/
  __root.tsx            -> Shell con Sidebar + TopBar + <Outlet/>
  index.tsx             -> Dashboard (KPIs + accesos rápidos)
  inventario.tsx        -> Vista núcleo (tabla agrupada)
  horarios.tsx          -> Registro entrada/salida + historial
  ajustes.tsx           -> Preferencias (tienda por defecto, tema)
```

## Estado global
- `StoreContext` (React Context) con la tienda seleccionada: `"Sur" | "Norte" | "Ambas"`. Persistida en `localStorage`.
- `InventoryContext` con el array mock + acciones `incrementStock`, `decrementStock`. Persistencia ligera en `localStorage`.
- `TimeLogContext` para registros de horario `{ id, fecha, tipo: "entrada"|"salida", tienda }`.

## Layout principal (en `__root.tsx`)
- **Sidebar** (shadcn `sidebar.tsx`):
  - Logo FitHub, links: Dashboard, Inventario, Horarios, Ajustes.
  - Botón destacado verde "Registrar Entrada/Salida" que abre un `Dialog` rápido sin salir de la vista.
  - Colapsable con `SidebarTrigger` (hamburguesa en móvil, icon-mode en tablet portrait).
- **TopBar**:
  - Título de la ruta actual.
  - `Select` global de tienda (Sur / Norte / Ambas).
  - Hora actual y nombre de la mercaimpulsadora (mock).
- **Área principal**: fondo `bg-slate-50`, tarjetas `rounded-2xl` con `p-6`, tipografía generosa, todos los botones/inputs con `min-h-11` (≥44px).

## Vista: Dashboard (`/`)
- 3 KPI cards (Total productos, Próximos a vencer, Vencidos) calculadas sobre el inventario filtrado por la tienda activa.
- Atajos grandes a "Ir a Inventario" y "Registrar horario".

## Vista: Inventario (`/inventario`) — núcleo

**Header de la vista**
- 3 KPI Cards reactivas (Total, Próximos a vencer naranja, Vencidos rojo).
- Barra de búsqueda (input grande) filtrando por `sku`, `nombre`, `subcategoria_sabor`.
- Botón verde prominente **"Exportar a Excel"** que usa `xlsx` para descargar las filas actualmente visibles (respeta filtros y tienda).

**Tabla TanStack**
- Columnas: Producto (nombre + sabor), Cantidad (con botones `-` / `+` táctiles, 44×44), Caducidad (fecha legible), Estado (Badge).
- **Grouping** por `linea_producto`, filas iniciales colapsadas (`getGroupedRowModel`, `getExpandedRowModel`, `initialState.grouping`, `initialState.expanded = {}`).
- Cabecera de grupo: nombre de la línea + contador + chevron, toda la fila clickable.
- Densidad amplia (`py-4`) para uso con dedos.

**Lógica de estado de caducidad** (helper en `src/lib/expiry.ts` usando `date-fns`):
- `differenceInDays(fechaCaducidad, today)`:
  - `< 0` → Badge rojo "Vencido".
  - `0–30` → Badge ámbar "X días restantes".
  - `> 30` → Badge verde "En regla".

## Vista: Horarios (`/horarios`)
- Tarjeta grande con hora actual, tienda activa y dos botones enormes:
  - "Registrar Entrada" (verde).
  - "Registrar Salida" (slate oscuro).
  - Se deshabilita el que no corresponda según el último evento del día.
- Registro del día actual (lista de eventos con hora).
- Historial semanal: tabla simple con fecha, entrada, salida, horas trabajadas (calculadas con `date-fns`).

## Vista: Ajustes (`/ajustes`)
- Selección de tienda por defecto.
- Botón "Resetear datos locales" (limpia `localStorage`).

## Mock data
Archivo `src/data/mock-inventory.ts` con ~25–30 productos repartidos entre Sur y Norte, distintas `linea_producto` (Proteínas, Pre-entrenos, Snacks, Bebidas, Accesorios), varias `subcategoria_sabor`, y fechas que cubran los tres estados (vencidos, próximos a vencer, lejanos). Tipos TS en `src/types/inventory.ts`.

## Componentes nuevos
```text
src/components/
  layout/AppSidebar.tsx
  layout/TopBar.tsx
  layout/StoreSelector.tsx
  inventory/KpiCards.tsx
  inventory/InventoryTable.tsx
  inventory/ExpiryBadge.tsx
  inventory/QuantityStepper.tsx
  inventory/ExportExcelButton.tsx
  time/ClockInOutCard.tsx
  time/WeeklyHistory.tsx
src/context/
  StoreContext.tsx
  InventoryContext.tsx
  TimeLogContext.tsx
src/lib/
  expiry.ts
  export-xlsx.ts
src/data/
  mock-inventory.ts
src/types/
  inventory.ts
  time.ts
```

## Estilo y accesibilidad
- Paleta Slate/Zinc por defecto de Tailwind con acento `emerald-600` para acciones primarias (Registrar Entrada, Exportar Excel, botón `+`).
- Naranja `amber-500` para "Próximo a vencer", rojo `red-600` para "Vencido", verde `emerald-600` para "En regla".
- Sin animaciones complejas. Tipografía base 16px, headings claros, mucho whitespace.
- Touch targets ≥44×44, `Dialog` y `Select` shadcn con tamaños grandes.
- Layout responsive: sidebar fija desde `md`, hamburguesa en móvil; tabla con scroll horizontal en móvil pero pensada para iPad landscape.

## Dependencias a instalar
```text
@tanstack/react-table
date-fns
xlsx
```
(Lucide, Tailwind y shadcn/ui ya están disponibles en el proyecto).

## Orden de implementación
1. Instalar dependencias y crear tipos + mock data.
2. Contextos (Store, Inventory, TimeLog) con persistencia en `localStorage`.
3. Layout: Sidebar + TopBar + selector global en `__root.tsx`.
4. Rutas vacías para `/inventario`, `/horarios`, `/ajustes` + metadatos `head()` propios.
5. Helper `expiry.ts` + `ExpiryBadge` + `KpiCards`.
6. `InventoryTable` con TanStack Table (grouping, búsqueda, stepper de cantidad).
7. `ExportExcelButton` con SheetJS.
8. Vista Horarios (clock in/out + historial semanal).
9. Dashboard con KPIs y atajos.
10. Vista Ajustes y pulido responsive iPad.
