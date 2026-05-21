/**
 * Import products from "Portafolio Ctg.xlsx" into Supabase.
 * Only imports the base catalog (cols A-F). No quantities or visit data.
 *
 * Usage: npx tsx scripts/import-excel.ts
 */

import XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY =
  "YOUR_SUPABASE_ANON_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Category assignment by keywords in product name
function assignCategory(nombre: string): string {
  const n = nombre.toUpperCase();

  if (/AREPA|AREPFIT/.test(n)) return "Arepas";
  if (/YOGURT|KEFIR|LECHE|LACT|KUMIS/.test(n)) return "Lácteos";
  if (/BARRA|BROWNIE|ALFAJOR|BITES|BLONDIE|ROGEL|GALLETA|COOKIE|WAFER/.test(n)) return "Snacks";
  if (/TÉ|TE |KOMBUCHA|BCAA|BEBIDA|AGUA|JUGO|LIMONADA|BATIDO/.test(n)) return "Bebidas";
  if (/PROTEIN|WHEY|ISO |MEGAPLEX|BIPRO|CASEINA|CREATINA|AMINO|GLUTAM|BCAA|PRE.?WORK|MASS/.test(n))
    return "Suplementos";
  if (/ACEITE|MIEL|AREQUIPE|MERMELADA|MANTEQUILLA|GHEE|SALSA|VINAGRE|ADEREZO/.test(n))
    return "Despensa";
  if (
    /PAN |MOGOLLA|BASE PIZZA|HARINA|TORTILLA|WRAP|TOSTADA|EMPANADA|PIZZA|PARATHA|HAMBURGUESA|PERRO/.test(
      n,
    )
  )
    return "Panadería";
  if (/CEREAL|GRANOLA|AVENA|MUESLI/.test(n)) return "Cereales";
  if (/CHOCOLATE|CACAO|DULCE|CARAMELO|GOMITA/.test(n)) return "Confitería";
  if (/QUESO|QUSO|CHEESE/.test(n)) return "Quesos";
  if (/FRUT|NUEZ|NUECES|ALMEND|MANI|MIX |SNACK|CHIP/.test(n)) return "Frutos y Nueces";
  if (/SHAKER|GUANTE|CINTUR|ACCESORI|TERMO/.test(n)) return "Accesorios";

  return "Otros";
}

// Store mapping
const STORE_MAP: Record<string, number> = {
  "1103": 1, // Norte → tiendas.id = 1
  "1129": 2, // Sur → tiendas.id = 2
};

interface RawRow {
  tienda: string;
  articulo: string;
  sicol: string;
  nombre: string;
  proveedor_nombre: string;
  proveedor_codigo: string;
}

function readSheet(wb: XLSX.WorkBook, sheetName: string): RawRow[] {
  const ws = wb.Sheets[sheetName];
  if (!ws) {
    console.error(`Sheet "${sheetName}" not found`);
    return [];
  }

  const data: (string | number)[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
    raw: false,
  });

  // Skip header, filter empty rows
  return data
    .slice(1)
    .filter((row) => row.some((c) => String(c).trim() !== ""))
    .filter((row) => String(row[1]).trim() !== "") // must have articulo
    .map((row) => ({
      tienda: String(row[0]).trim(),
      articulo: String(row[1]).trim(),
      sicol: String(row[2]).trim(),
      nombre: String(row[3]).trim(),
      proveedor_nombre: String(row[4]).trim() || "ADWELLCH S.A.S.",
      proveedor_codigo: String(row[5]).trim(),
    }));
}

async function main() {
  console.log("📖 Reading Excel file...");

  const wb = XLSX.readFile("Portafolio Ctg.xlsx");
  console.log("  Sheets:", wb.SheetNames.join(", "));

  const bocaRows = readSheet(wb, "Copia de BOCAGRAND");
  const surRows = readSheet(wb, "Copia de SUR");

  console.log(`  Norte: ${bocaRows.length} products`);
  console.log(`  Sur: ${surRows.length} products`);

  const allRows = [...bocaRows, ...surRows];

  // Deduplicate by (tienda_id, articulo)
  const seen = new Set<string>();
  const unique: RawRow[] = [];
  for (const row of allRows) {
    const key = `${row.tienda}-${row.articulo}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(row);
    }
  }
  console.log(`  Unique products: ${unique.length}`);

  // Prepare inserts
  const inserts = unique.map((row) => ({
    tienda_id: STORE_MAP[row.tienda] ?? 1,
    articulo: row.articulo,
    sicol: row.sicol,
    nombre: row.nombre,
    categoria: assignCategory(row.nombre),
    proveedor_nombre: row.proveedor_nombre,
    proveedor_codigo: row.proveedor_codigo || null,
  }));

  // Log category distribution
  const catCount: Record<string, number> = {};
  for (const p of inserts) {
    catCount[p.categoria] = (catCount[p.categoria] || 0) + 1;
  }
  console.log("\n📊 Category distribution:");
  for (const [cat, count] of Object.entries(catCount).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  // Insert in batches of 50
  console.log("\n⬆️  Uploading to Supabase...");
  const BATCH = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < inserts.length; i += BATCH) {
    const batch = inserts.slice(i, i + BATCH);
    const { error } = await supabase.from("productos").upsert(batch, {
      onConflict: "tienda_id,articulo",
      ignoreDuplicates: true,
    });

    if (error) {
      console.error(`  ❌ Batch ${i / BATCH + 1} error:`, error.message);
      errors++;
    } else {
      inserted += batch.length;
      process.stdout.write(`  ✅ ${inserted}/${inserts.length}\r`);
    }
  }

  console.log(`\n\n✅ Done! Inserted ${inserted} products (${errors} batch errors)`);
}

main().catch(console.error);
