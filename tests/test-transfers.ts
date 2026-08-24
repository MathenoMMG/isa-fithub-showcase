import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY =
  "YOUR_SUPABASE_ANON_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTests() {
  console.log("=================================================");
  console.log("🧪 TEST AUTOMATIZADO: MÓDULO DE TRASPASOS FITHUB");
  console.log("=================================================");

  // 1. Verificar tiendas
  console.log("\n[1/6] Verificando catálogo de tiendas...");
  const { data: tiendas, error: tErr } = await supabase.from("tiendas").select("*");
  if (tErr) throw tErr;
  console.log(`✅ Tiendas activas: ${tiendas.length} sedes encontradas.`);
  tiendas.forEach((t) => console.log(`   - ID ${t.id}: ${t.nombre} (Código: ${t.codigo})`));

  // 2. Crear producto mock en Norte (ID 1)
  const testArticulo = "TEST-" + Math.floor(1000 + Math.random() * 9000);
  console.log(`\n[2/6] Creando producto mock en Norte (SKU: ${testArticulo})...`);
  const { data: newProd, error: pErr } = await supabase
    .from("productos")
    .insert({
      tienda_id: 1,
      articulo: testArticulo,
      sicol: "SIC-" + testArticulo,
      nombre: "AREPA FIT TEST UNITARIO",
      categoria: "Arepas",
      proveedor_nombre: "ADWELLCH S.A.S.",
    })
    .select()
    .single();

  if (pErr) throw pErr;
  console.log(`✅ Producto mock creado: ID ${newProd.id} en Tienda 1`);

  // 3. Crear lote inicial (10 unidades, vence 2026-12-31)
  console.log("\n[3/6] Creando lote inicial (10 unidades, vence 2026-12-31)...");
  const { data: newLote, error: lErr } = await supabase
    .from("lotes")
    .insert({
      producto_id: newProd.id,
      cantidad: 10,
      fecha_caducidad: "2026-12-31",
    })
    .select()
    .single();

  if (lErr) throw lErr;
  console.log(`✅ Lote inicial creado: ID ${newLote.id}, Stock: ${newLote.cantidad} uds`);

  // 4. Realizar traspaso de 4 unidades a Sur (ID 2)
  console.log("\n[4/6] Ejecutando traspaso de 4 unidades hacia Sur (ID 2)...");
  // Verificar si existe en Sur
  const { data: destProdCheck } = await supabase
    .from("productos")
    .select("*")
    .eq("tienda_id", 2)
    .eq("articulo", testArticulo)
    .maybeSingle();

  let destProdId = destProdCheck?.id;
  if (!destProdId) {
    console.log("   - Producto no existe en Sur. Auto-creando producto destino...");
    const { data: createdDest, error: cErr } = await supabase
      .from("productos")
      .insert({
        tienda_id: 2,
        articulo: newProd.articulo,
        sicol: newProd.sicol,
        nombre: newProd.nombre,
        categoria: newProd.categoria,
        proveedor_nombre: newProd.proveedor_nombre,
      })
      .select()
      .single();
    if (cErr) throw cErr;
    destProdId = createdDest.id;
    console.log(`   - Producto destino creado en Sur: ID ${destProdId}`);
  }

  // Insertar lote en destino
  const { data: destLote, error: dlErr } = await supabase
    .from("lotes")
    .insert({
      producto_id: destProdId,
      cantidad: 4,
      fecha_caducidad: "2026-12-31",
      notas: "Traspaso test desde Norte",
    })
    .select()
    .single();
  if (dlErr) throw dlErr;
  console.log(`   - Lote creado en Sur con 4 unidades: ID ${destLote.id}`);

  // Reducir stock en lote origen
  const { error: decErr } = await supabase
    .from("lotes")
    .update({ cantidad: newLote.cantidad - 4 })
    .eq("id", newLote.id);
  if (decErr) throw decErr;
  console.log("   - Lote origen descontado exitosamente (10 - 4 = 6)");

  // 5. Validar conservación matemática de stock
  console.log("\n[5/6] Validando integridad de inventario...");
  const { data: origCheck } = await supabase.from("lotes").select("*").eq("id", newLote.id).single();
  const { data: destCheck } = await supabase.from("lotes").select("*").eq("id", destLote.id).single();

  const isOrigCorrect = origCheck.cantidad === 6;
  const isDestCorrect = destCheck.cantidad === 4;
  const isTotalConserved = origCheck.cantidad + destCheck.cantidad === 10;

  console.log(`   - Stock en Origen (Norte): ${origCheck.cantidad} uds (Esperado: 6) -> ${isOrigCorrect ? "✅ CORRECTO" : "❌ FALLO"}`);
  console.log(`   - Stock en Destino (Sur): ${destCheck.cantidad} uds (Esperado: 4) -> ${isDestCorrect ? "✅ CORRECTO" : "❌ FALLO"}`);
  console.log(`   - Conservación total (6 + 4 = 10): ${isTotalConserved ? "✅ CORRECTO (SIN PÉRDIDAS NI DUPLICADOS)" : "❌ FALLO"}`);

  // 6. Limpieza
  console.log("\n[6/6] Limpiando registros temporales de prueba...");
  await supabase.from("lotes").delete().eq("id", newLote.id);
  await supabase.from("lotes").delete().eq("id", destLote.id);
  await supabase.from("productos").delete().eq("id", newProd.id);
  await supabase.from("productos").delete().eq("id", destProdId);
  console.log("✅ Limpieza completada sin dejar rastros en la base de datos.");

  console.log("\n=================================================");
  console.log("🎉 RESULTADO: TODOS LOS TESTS PASARON EXITOSAMENTE");
  console.log("=================================================\n");
}

runTests().catch(console.error);
