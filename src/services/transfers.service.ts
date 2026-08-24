/**
 * Transfers Service — Pure Supabase data layer for inter-store stock transfers.
 *
 * Handles the complete transfer lifecycle:
 *  1. Finding/creating the destination product
 *  2. Creating/incrementing the destination lote
 *  3. Deducting from the origin lote
 *  4. Persisting the audit trail
 */

import { supabase } from "@/lib/supabase";
import type {
  ProductoConLotes,
  Traspaso,
  TraspasoInput,
  StoreId,
} from "@/types/inventory";
import { TIENDA_MAP } from "./inventory.service";

// ─── Constants ───────────────────────────────────────────────────────
export const TRASPASOS_RECORD_ID = "00000000-0000-0000-0000-000000000003";

// ─── Fetch Traspasos History ─────────────────────────────────────────
export async function fetchTraspasos(): Promise<Traspaso[]> {
  const { data, error } = await supabase
    .from("visitas")
    .select("notas")
    .eq("id", TRASPASOS_RECORD_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data?.notas) return [];

  try {
    return JSON.parse(data.notas) || [];
  } catch {
    return [];
  }
}

// ─── Execute Transfer ────────────────────────────────────────────────

export interface TransferResult {
  traspaso: Traspaso;
  productoDestinoId: string;
}

export async function executeTransfer(
  input: TraspasoInput,
  allItems: ProductoConLotes[],
  usuario: string,
): Promise<TransferResult> {
  const {
    origenTiendaId,
    destinoTiendaId,
    productoOrigenId,
    loteOrigenId,
    cantidad,
    motivo,
  } = input;

  // ── Validations ──
  if (origenTiendaId === destinoTiendaId) {
    throw new Error("La tienda de origen y destino no pueden ser la misma.");
  }
  if (cantidad <= 0) {
    throw new Error("La cantidad a transferir debe ser mayor a 0.");
  }

  const productoOrigen = allItems.find((p) => p.id === productoOrigenId);
  if (!productoOrigen) throw new Error("Producto de origen no encontrado.");

  const loteOrigen = productoOrigen.lotes.find((l) => l.id === loteOrigenId);
  if (!loteOrigen) throw new Error("Lote de origen no encontrado.");

  if (loteOrigen.cantidad < cantidad) {
    throw new Error(
      `Stock insuficiente en el lote. Disponible: ${loteOrigen.cantidad}`,
    );
  }

  // ── 1. Find or create destination product ──
  let productoDestino = allItems.find(
    (p) =>
      p.tienda_id === destinoTiendaId &&
      (p.articulo === productoOrigen.articulo ||
        p.nombre.trim().toLowerCase() ===
          productoOrigen.nombre.trim().toLowerCase()),
  );

  let productoDestinoId: string;

  if (productoDestino) {
    productoDestinoId = productoDestino.id;
  } else {
    const { data: newProd, error: newProdErr } = await supabase
      .from("productos")
      .insert({
        tienda_id: destinoTiendaId,
        articulo: productoOrigen.articulo,
        sicol: productoOrigen.sicol,
        nombre: productoOrigen.nombre,
        categoria: productoOrigen.categoria,
        proveedor_nombre: productoOrigen.proveedor_nombre,
        proveedor_codigo: productoOrigen.proveedor_codigo,
        notas: productoOrigen.notas,
      })
      .select()
      .single();

    if (newProdErr) throw newProdErr;
    productoDestinoId = newProd.id;
  }

  // ── 2. Create or increment destination lote ──
  const loteDestinoMismaCaducidad = productoDestino?.lotes.find(
    (l) =>
      (l.fecha_caducidad || null) === (loteOrigen.fecha_caducidad || null),
  );

  if (loteDestinoMismaCaducidad) {
    const { error: incErr } = await supabase
      .from("lotes")
      .update({ cantidad: loteDestinoMismaCaducidad.cantidad + cantidad })
      .eq("id", loteDestinoMismaCaducidad.id);
    if (incErr) throw incErr;
  } else {
    const { error: newLoteErr } = await supabase.from("lotes").insert({
      producto_id: productoDestinoId,
      cantidad,
      fecha_caducidad: loteOrigen.fecha_caducidad || null,
      notas: `Traspaso desde ${TIENDA_MAP[origenTiendaId]} (${new Date().toLocaleDateString()})`,
    });
    if (newLoteErr) throw newLoteErr;
  }

  // ── 3. Deduct from origin lote ──
  const newQtyOrigen = loteOrigen.cantidad - cantidad;
  const { error: decErr } = await supabase
    .from("lotes")
    .update({ cantidad: newQtyOrigen })
    .eq("id", loteOrigenId);
  if (decErr) throw decErr;

  // ── 4. Build audit record ──
  const newTraspaso: Traspaso = {
    id:
      Math.random().toString(36).substring(2, 9) +
      Date.now().toString(36),
    origen_tienda_id: origenTiendaId,
    origen_tienda_nombre: TIENDA_MAP[origenTiendaId] || "Norte",
    destino_tienda_id: destinoTiendaId,
    destino_tienda_nombre: TIENDA_MAP[destinoTiendaId] || "Sur",
    producto_id_origen: productoOrigenId,
    producto_id_destino: productoDestinoId,
    articulo: productoOrigen.articulo,
    nombre: productoOrigen.nombre,
    categoria: productoOrigen.categoria,
    lote_id_origen: loteOrigenId,
    cantidad,
    fecha_caducidad: loteOrigen.fecha_caducidad,
    motivo: motivo || "Reubicación de stock",
    usuario,
    created_at: new Date().toISOString(),
  };

  return { traspaso: newTraspaso, productoDestinoId };
}

// ─── Persist Traspasos Audit Log ─────────────────────────────────────
export async function saveTraspasosLog(
  traspasos: Traspaso[],
): Promise<void> {
  await supabase.from("visitas").upsert(
    {
      id: TRASPASOS_RECORD_ID,
      tienda_id: 1,
      fecha: "2099-12-31",
      notas: JSON.stringify(traspasos),
    },
    { onConflict: "id" },
  );
}

// ─── Undo Transfer ───────────────────────────────────────────────────
export async function undoTransfer(
  traspasoId: string,
  currentTraspasos: Traspaso[],
  allItems: ProductoConLotes[],
): Promise<Traspaso[]> {
  const target = currentTraspasos.find((t) => t.id === traspasoId);
  if (!target) throw new Error("Traspaso no encontrado.");

  // 1. Restore origin lote
  const prodOrigen = allItems.find(
    (p) => p.id === target.producto_id_origen,
  );
  const loteOrigen = prodOrigen?.lotes.find(
    (l) => l.id === target.lote_id_origen,
  );
  if (loteOrigen) {
    await supabase
      .from("lotes")
      .update({ cantidad: loteOrigen.cantidad + target.cantidad })
      .eq("id", target.lote_id_origen);
  }

  // 2. Deduct from destination lote
  if (target.producto_id_destino) {
    const prodDestino = allItems.find(
      (p) => p.id === target.producto_id_destino,
    );
    const loteDestino = prodDestino?.lotes.find(
      (l) =>
        (l.fecha_caducidad || null) === (target.fecha_caducidad || null),
    );
    if (loteDestino) {
      const remQty = Math.max(0, loteDestino.cantidad - target.cantidad);
      await supabase
        .from("lotes")
        .update({ cantidad: remQty })
        .eq("id", loteDestino.id);
    }
  }

  // 3. Update audit log
  const filtered = currentTraspasos.filter((t) => t.id !== traspasoId);
  await saveTraspasosLog(filtered);

  return filtered;
}
