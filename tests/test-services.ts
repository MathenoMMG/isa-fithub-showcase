import {
  aggregateSalesByCategory,
  getTopProducts,
  getCriticalStock,
  type SaleRecord,
} from "@/services/analytics.service";
import { getDaysUntilExpiry, getExpiryStatus, countLotesByStatus } from "@/lib/expiry";
import type { ProductoConLotes } from "@/types/inventory";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✅ ${message}`);
}

async function runUnitTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING UNIT TESTS FOR SERVICES & UTILITIES");
  console.log("=================================================");

  // ── 1. Expiry & Date Utility Tests ──
  console.log("\n[1/3] Testing Expiry Utility Functions...");
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 60);
  const futureIso = futureDate.toISOString().slice(0, 10);

  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() - 5);
  const expiredIso = expiredDate.toISOString().slice(0, 10);

  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + 15);
  const warningIso = warningDate.toISOString().slice(0, 10);

  assert(getExpiryStatus(futureIso) === "en_regla", "Future date > 30 days is 'en_regla'");
  assert(getExpiryStatus(expiredIso) === "vencido", "Past date is 'vencido'");
  assert(getExpiryStatus(warningIso) === "proximo", "Date <= 30 days is 'proximo'");
  assert(getDaysUntilExpiry(futureIso) >= 59, "getDaysUntilExpiry calculates remaining days correctly");

  // ── 2. Analytics Aggregations ──
  console.log("\n[2/3] Testing Analytics Aggregation Functions...");
  const mockSales: SaleRecord[] = [
    {
      id: "v1",
      producto_id: "p1",
      lote_id: "l1",
      cantidad: 5,
      created_at: new Date().toISOString(),
      productos: { tienda_id: 1, nombre: "Arepa Choclo", categoria: "Arepas", articulo: "SKU-1" },
    },
    {
      id: "v2",
      producto_id: "p1",
      lote_id: "l1",
      cantidad: 3,
      created_at: new Date().toISOString(),
      productos: { tienda_id: 1, nombre: "Arepa Choclo", categoria: "Arepas", articulo: "SKU-1" },
    },
    {
      id: "v3",
      producto_id: "p2",
      lote_id: "l2",
      cantidad: 4,
      created_at: new Date().toISOString(),
      productos: { tienda_id: 1, nombre: "Yogurt Griego", categoria: "Lácteos", articulo: "SKU-2" },
    },
  ];

  const catData = aggregateSalesByCategory(mockSales);
  assert(catData.length === 2, "aggregateSalesByCategory finds exactly 2 categories");
  assert(catData[0].name === "Arepas" && catData[0].value === 8, "Arepas category has 8 units total");
  assert(catData[1].name === "Lácteos" && catData[1].value === 4, "Lácteos category has 4 units total");

  const topProds = getTopProducts(mockSales);
  assert(topProds.length === 2, "getTopProducts returns 2 distinct products");
  assert(topProds[0].nombre === "Arepa Choclo" && topProds[0].unidades === 8, "Top 1 product is Arepa Choclo with 8 units");

  // ── 3. Critical Stock Detection ──
  console.log("\n[3/3] Testing Critical Stock Detection...");
  const mockInventory: ProductoConLotes[] = [
    {
      id: "p1",
      tienda_id: 1,
      tienda_nombre: "Norte",
      articulo: "SKU-1",
      sicol: "SIC-1",
      nombre: "Arepa Choclo",
      categoria: "Arepas",
      proveedor_nombre: "ADWELLCH",
      proveedor_codigo: null,
      notas: null,
      created_at: new Date().toISOString(),
      vendidos_total: 8,
      lotes: [
        {
          id: "l1",
          producto_id: "p1",
          cantidad: 10,
          fecha_caducidad: expiredIso,
          fecha_ingreso: new Date().toISOString(),
          notas: null,
          created_at: new Date().toISOString(),
        },
        {
          id: "l2",
          producto_id: "p1",
          cantidad: 20,
          fecha_caducidad: futureIso,
          fecha_ingreso: new Date().toISOString(),
          notas: null,
          created_at: new Date().toISOString(),
        },
      ],
    },
  ];

  const criticals = getCriticalStock(mockInventory);
  assert(criticals.length === 1, "Only expired/warning lote detected in critical stock");
  assert(criticals[0].loteId === "l1", "Correct critical lote ID identified");
  assert(criticals[0].estado === "vencido", "Critical lote has 'vencido' status");

  console.log("\n=================================================");
  console.log("🎉 ALL UNIT TESTS PASSED SUCCESSFULLY!");
  console.log("=================================================\n");
}

runUnitTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
