/**
 * Mock data for the public showcase. Every product, supplier, store and record
 * here is fictitious; dates are generated relative to "today" so expiry alerts,
 * charts and weekly schedules always look current.
 */

export const DEMO_USER_EMAIL = "demo@isafithub.dev";

export type DemoDatabase = Record<string, Record<string, any>[]>;

const MERMAS_RECORD_ID = "00000000-0000-0000-0000-000000000002";
const TRASPASOS_RECORD_ID = "00000000-0000-0000-0000-000000000003";

// Deterministic PRNG so every visitor sees the same demo data.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CATALOG: { nombre: string; categoria: string; proveedor: string }[] = [
  { nombre: "Proteína Whey Vainilla 2 lb", categoria: "Suplementos", proveedor: "NutriAndes Distribuciones" },
  { nombre: "Proteína Whey Chocolate 2 lb", categoria: "Suplementos", proveedor: "NutriAndes Distribuciones" },
  { nombre: "Creatina Monohidratada 300 g", categoria: "Suplementos", proveedor: "NutriAndes Distribuciones" },
  { nombre: "Pre-entreno Frutos Rojos 250 g", categoria: "Suplementos", proveedor: "PowerFit Import" },
  { nombre: "Colágeno Hidrolizado 500 g", categoria: "Suplementos", proveedor: "PowerFit Import" },
  { nombre: "Arepa de Quinoa x5", categoria: "Arepas", proveedor: "Molinos Verdes" },
  { nombre: "Arepa de Almendra x5", categoria: "Arepas", proveedor: "Molinos Verdes" },
  { nombre: "Yogur Griego Natural 500 g", categoria: "Lácteos", proveedor: "Lácteos La Pradera" },
  { nombre: "Kéfir de Fresa 1 L", categoria: "Lácteos", proveedor: "Lácteos La Pradera" },
  { nombre: "Queso Campesino Light 250 g", categoria: "Quesos", proveedor: "Lácteos La Pradera" },
  { nombre: "Barra de Proteína Maní", categoria: "Snacks", proveedor: "Snack Saludable S.A.S." },
  { nombre: "Chips de Plátano Horneados", categoria: "Snacks", proveedor: "Snack Saludable S.A.S." },
  { nombre: "Galletas de Avena sin Azúcar", categoria: "Panadería", proveedor: "Horno Integral" },
  { nombre: "Pan de Masa Madre Integral", categoria: "Panadería", proveedor: "Horno Integral" },
  { nombre: "Granola Keto 400 g", categoria: "Cereales", proveedor: "Molinos Verdes" },
  { nombre: "Avena en Hojuelas 1 kg", categoria: "Cereales", proveedor: "Molinos Verdes" },
  { nombre: "Mix de Frutos Secos 200 g", categoria: "Frutos y Nueces", proveedor: "Snack Saludable S.A.S." },
  { nombre: "Mantequilla de Maní 340 g", categoria: "Despensa", proveedor: "Snack Saludable S.A.S." },
  { nombre: "Bebida Isotónica Limón", categoria: "Bebidas", proveedor: "PowerFit Import" },
  { nombre: "Agua de Coco 330 ml", categoria: "Bebidas", proveedor: "PowerFit Import" },
  { nombre: "Chocolate 70% Cacao Stevia", categoria: "Confitería", proveedor: "Horno Integral" },
  { nombre: "Shaker 600 ml", categoria: "Accesorios", proveedor: "PowerFit Import" },
];

const STORE_IDS = [1, 2, 3];
const STORE_NAMES: Record<number, string> = { 1: "Norte", 2: "Sur", 3: "Centro" };

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysFromNow(days: number, hour = 12, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function createSeedDatabase(): DemoDatabase {
  const rand = mulberry32(2026);
  const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const uuid = (prefix: string, n: number) => `${prefix}-${String(n).padStart(4, "0")}-demo`;

  const productos: Record<string, any>[] = [];
  const lotes: Record<string, any>[] = [];
  const ventas: Record<string, any>[] = [];
  let loteCounter = 0;

  // Each store carries most of the catalog; codes match across stores like the real app.
  CATALOG.forEach((item, idx) => {
    STORE_IDS.forEach((tiendaId) => {
      if (rand() < 0.15) return; // not every store stocks every product
      const productId = uuid(`prod-${tiendaId}`, idx);
      productos.push({
        id: productId,
        tienda_id: tiendaId,
        articulo: `ART-${1000 + idx}`,
        sicol: `SC${5000 + idx}`,
        nombre: item.nombre,
        categoria: item.categoria,
        proveedor_nombre: item.proveedor,
        proveedor_codigo: `PRV-${100 + (idx % 6)}`,
        notas: null,
        created_at: daysFromNow(-90).toISOString(),
      });

      const loteCount = randInt(1, 3);
      for (let i = 0; i < loteCount; i++) {
        loteCounter++;
        // Mix of expired, expiring this week/month and long shelf-life batches.
        const expiryOffset = [-3, 5, 12, 25, 60, 120, 200][randInt(0, 6)];
        const hasExpiry = item.categoria !== "Accesorios";
        lotes.push({
          id: uuid("lote", loteCounter),
          producto_id: productId,
          cantidad: randInt(0, 24),
          fecha_caducidad: hasExpiry ? isoDate(daysFromNow(expiryOffset)) : null,
          fecha_ingreso: isoDate(daysFromNow(-randInt(10, 60))),
          notas: null,
          created_at: daysFromNow(-randInt(10, 60)).toISOString(),
        });
      }
    });
  });

  // ~45 days of sales history, heavier on weekends.
  let ventaCounter = 0;
  for (let day = 45; day >= 0; day--) {
    const date = daysFromNow(-day);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const salesToday = randInt(weekend ? 10 : 5, weekend ? 20 : 12);
    for (let s = 0; s < salesToday; s++) {
      const lote = lotes[randInt(0, lotes.length - 1)];
      ventaCounter++;
      ventas.push({
        id: uuid("venta", ventaCounter),
        producto_id: lote.producto_id,
        lote_id: lote.id,
        cantidad: randInt(1, 3),
        created_at: daysFromNow(-day, randInt(8, 19), randInt(0, 59)).toISOString(),
      });
    }
  }

  // Two weeks of clock-in / clock-out records on weekdays.
  const registros_horario: Record<string, any>[] = [];
  for (let day = 14; day >= 1; day--) {
    const d = daysFromNow(-day);
    if (d.getDay() === 0) continue;
    const tiendaId = STORE_IDS[day % 3];
    registros_horario.push(
      { id: uuid("reg-in", day), tipo: "entrada", tienda_id: tiendaId, created_at: daysFromNow(-day, 8, randInt(0, 15)).toISOString() },
      { id: uuid("reg-out", day), tipo: "salida", tienda_id: tiendaId, created_at: daysFromNow(-day, 17, randInt(0, 30)).toISOString() },
    );
  }

  const visitas: Record<string, any>[] = [
    { id: uuid("visita", 1), tienda_id: 1, fecha: isoDate(daysFromNow(-2)), notas: "Reposición de proteínas y revisión de nevera.", created_at: daysFromNow(-2).toISOString() },
    { id: uuid("visita", 2), tienda_id: 2, fecha: isoDate(daysFromNow(-4)), notas: "Conteo de lotes próximos a vencer.", created_at: daysFromNow(-4).toISOString() },
    { id: uuid("visita", 3), tienda_id: 3, fecha: isoDate(daysFromNow(-6)), notas: "Exhibición nueva de snacks.", created_at: daysFromNow(-6).toISOString() },
  ];

  // Mermas and transfer history live in JSON config rows, like the original schema.
  const mermaLote = lotes.find((l) => l.fecha_caducidad && l.fecha_caducidad < isoDate(new Date()))!;
  const mermaProducto = productos.find((p) => p.id === mermaLote?.producto_id);
  const mermas = mermaProducto
    ? [
        {
          id: uuid("merma", 1),
          producto_id: mermaProducto.id,
          lote_id: mermaLote.id,
          tienda_id: mermaProducto.tienda_id,
          cantidad: 2,
          motivo: "caducidad",
          notas: "Lote vencido retirado de exhibición",
          created_at: daysFromNow(-1).toISOString(),
          usuario: "Demo",
        },
      ]
    : [];

  const origen = productos.find((p) => p.tienda_id === 1)!;
  const destino = productos.find((p) => p.tienda_id === 2 && p.articulo === origen.articulo);
  const origenLote = lotes.find((l) => l.producto_id === origen.id)!;
  const traspasos = [
    {
      id: uuid("traspaso", 1),
      origen_tienda_id: 1,
      origen_tienda_nombre: STORE_NAMES[1],
      destino_tienda_id: 2,
      destino_tienda_nombre: STORE_NAMES[2],
      producto_id_origen: origen.id,
      producto_id_destino: destino?.id,
      articulo: origen.articulo,
      nombre: origen.nombre,
      categoria: origen.categoria,
      lote_id_origen: origenLote.id,
      cantidad: 3,
      fecha_caducidad: origenLote.fecha_caducidad,
      motivo: "Balanceo de stock entre sedes",
      usuario: "Demo",
      created_at: daysFromNow(-3).toISOString(),
    },
  ];

  visitas.push(
    { id: MERMAS_RECORD_ID, tienda_id: 1, fecha: isoDate(new Date()), notas: JSON.stringify(mermas), created_at: new Date().toISOString() },
    { id: TRASPASOS_RECORD_ID, tienda_id: 1, fecha: isoDate(new Date()), notas: JSON.stringify(traspasos), created_at: new Date().toISOString() },
  );

  return { productos, lotes, ventas, registros_horario, visitas, conexiones: [] };
}
