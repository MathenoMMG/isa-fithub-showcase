/**
 * Inventory Service — Pure Supabase data layer for products and lotes.
 *
 * Every function is a standalone async operation with no React dependency,
 * making it testable in isolation and reusable across any JS/TS consumer.
 */

import { supabase } from "@/lib/supabase";
import type {
  ProductoConLotes,
  Lote,
  NewProductInput,
  NewLoteInput,
  Producto,
  StoreId,
} from "@/types/inventory";

// ─── Constants ───────────────────────────────────────────────────────
export const TIENDA_MAP: Record<number, StoreId> = {
  1: "Norte",
  2: "Sur",
  3: "Centro",
};

// ─── Fetch All Products + Lotes + Sales ──────────────────────────────
export async function fetchInventory(): Promise<ProductoConLotes[]> {
  const [prodResult, salesResult] = await Promise.all([
    supabase.from("productos").select("*, lotes(*)").order("nombre"),
    supabase.from("ventas").select("producto_id, lote_id, cantidad"),
  ]);

  if (prodResult.error) throw prodResult.error;
  if (salesResult.error) throw salesResult.error;

  const salesMap: Record<string, number> = {};
  const loteSalesMap: Record<string, number> = {};
  for (const v of salesResult.data || []) {
    salesMap[v.producto_id] = (salesMap[v.producto_id] || 0) + v.cantidad;
    if (v.lote_id) {
      loteSalesMap[v.lote_id] = (loteSalesMap[v.lote_id] || 0) + v.cantidad;
    }
  }

  return (prodResult.data || []).map((p) => ({
    ...p,
    tienda_nombre: TIENDA_MAP[p.tienda_id] || "Norte",
    vendidos_total: salesMap[p.id] || 0,
    lotes: (p.lotes || [])
      .map((l: Lote) => ({ ...l, vendidos: loteSalesMap[l.id] || 0 }))
      .sort(
        (a: Lote, b: Lote) =>
          new Date(a.fecha_caducidad || "9999-12-31").getTime() -
          new Date(b.fecha_caducidad || "9999-12-31").getTime(),
      ),
  }));
}

// ─── Product CRUD ────────────────────────────────────────────────────

export async function createProduct(
  input: NewProductInput & { cantidad: number; fecha_caducidad: string | null },
): Promise<string> {
  const { cantidad, fecha_caducidad, ...productData } = input;

  const { data: product, error: pErr } = await supabase
    .from("productos")
    .insert(productData)
    .select()
    .single();

  if (pErr) throw pErr;

  if (cantidad > 0) {
    const { error: lErr } = await supabase.from("lotes").insert({
      producto_id: product.id,
      cantidad,
      fecha_caducidad: fecha_caducidad || null,
    });
    if (lErr) throw lErr;
  }

  return product.id;
}

export async function updateProduct(
  productId: string,
  updates: Partial<Producto>,
): Promise<void> {
  const { error } = await supabase
    .from("productos")
    .update(updates)
    .eq("id", productId);
  if (error) throw error;
}

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id", productId);
  if (error) throw error;
}

export async function restoreProduct(product: ProductoConLotes): Promise<void> {
  const { error: pErr } = await supabase.from("productos").insert({
    id: product.id,
    tienda_id: product.tienda_id,
    articulo: product.articulo,
    sicol: product.sicol,
    nombre: product.nombre,
    categoria: product.categoria,
    proveedor_nombre: product.proveedor_nombre,
    proveedor_codigo: product.proveedor_codigo,
    notas: product.notas,
  });

  if (pErr) throw pErr;

  if (product.lotes && product.lotes.length > 0) {
    const lotesToInsert = product.lotes.map((l) => ({
      id: l.id,
      producto_id: product.id,
      cantidad: l.cantidad,
      fecha_caducidad: l.fecha_caducidad,
      fecha_ingreso: l.fecha_ingreso,
      notas: l.notas,
    }));

    const { error: lErr } = await supabase.from("lotes").insert(lotesToInsert);
    if (lErr) throw lErr;
  }
}

export async function updateProductCategories(
  updates: Record<string, string>,
): Promise<void> {
  const promises = Object.entries(updates).map(([productId, newCategory]) =>
    supabase
      .from("productos")
      .update({ categoria: newCategory })
      .eq("id", productId),
  );

  const results = await Promise.all(promises);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    console.error("Errors updating categories:", errors);
    throw new Error("Ocurrió un error al actualizar algunas categorías.");
  }
}

// ─── Lote CRUD ───────────────────────────────────────────────────────

export async function createLote(
  productId: string,
  input: NewLoteInput,
): Promise<void> {
  const { error } = await supabase.from("lotes").insert({
    producto_id: productId,
    cantidad: input.cantidad,
    fecha_caducidad: input.fecha_caducidad || null,
  });
  if (error) throw error;
}

export async function deleteLote(loteId: string): Promise<void> {
  const { error } = await supabase.from("lotes").delete().eq("id", loteId);
  if (error) throw error;
}

export async function adjustLoteQuantity(
  loteId: string,
  newQuantity: number,
): Promise<void> {
  const { error } = await supabase
    .from("lotes")
    .update({ cantidad: Math.max(0, newQuantity) })
    .eq("id", loteId);
  if (error) throw error;
}

// ─── Sales ───────────────────────────────────────────────────────────

export async function recordSale(
  productId: string,
  loteId: string,
  qty: number,
): Promise<void> {
  const { error: vErr } = await supabase.from("ventas").insert({
    producto_id: productId,
    lote_id: loteId,
    cantidad: qty,
  });
  if (vErr) throw vErr;
}

export async function undoLastSale(loteId: string): Promise<{
  found: boolean;
  cantidad: number;
}> {
  const { data: lastSale, error: fetchErr } = await supabase
    .from("ventas")
    .select("*")
    .eq("lote_id", loteId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (!lastSale) return { found: false, cantidad: 0 };

  const { error: delErr } = await supabase
    .from("ventas")
    .delete()
    .eq("id", lastSale.id);
  if (delErr) throw delErr;

  return { found: true, cantidad: lastSale.cantidad };
}
