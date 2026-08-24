/**
 * Mermas Service — Pure Supabase data layer for inventory losses (FEFO shrinkage).
 *
 * Handles:
 *  - Registering losses and deducting from the closest-to-expiry lote
 *  - Persisting the global audit log
 *  - Undoing a loss (restoring stock + removing audit entry)
 */

import { supabase } from "@/lib/supabase";
import type { Merma, MotivoMerma, ProductoConLotes } from "@/types/inventory";

// ─── Constants ───────────────────────────────────────────────────────
export const MERMAS_RECORD_ID = "00000000-0000-0000-0000-000000000002";

// ─── Fetch Mermas History ────────────────────────────────────────────
export async function fetchMermas(): Promise<Merma[]> {
  const { data, error } = await supabase
    .from("visitas")
    .select("notas")
    .eq("id", MERMAS_RECORD_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data?.notas) return [];

  try {
    return JSON.parse(data.notas) || [];
  } catch {
    return [];
  }
}

// ─── Register Merma ──────────────────────────────────────────────────

export interface RegisterMermaInput {
  productId: string;
  loteId: string | null;
  cantidad: number;
  motivo: MotivoMerma;
  notas?: string;
  usuario: string;
}

/**
 * Registers a shrinkage event. If no specific loteId is provided, it
 * automatically selects the lote closest to expiration (FEFO).
 *
 * Returns the new Merma record and the resolved target lote ID.
 */
export async function registerMerma(
  input: RegisterMermaInput,
  product: ProductoConLotes,
  currentMermas: Merma[],
): Promise<{ merma: Merma; targetLoteId: string | null; updatedMermas: Merma[] }> {
  const { productId, loteId, cantidad, motivo, notas, usuario } = input;

  const newMerma: Merma = {
    id:
      Math.random().toString(36).substring(2, 9) +
      Date.now().toString(36),
    producto_id: productId,
    lote_id: loteId,
    tienda_id: product.tienda_id,
    cantidad,
    motivo,
    notas: notas || null,
    created_at: new Date().toISOString(),
    usuario,
  };

  // Resolve target lote (FEFO: first-expired-first-out)
  let targetLoteId = loteId;
  if (!targetLoteId) {
    const activeLotes = [...product.lotes]
      .filter((l) => l.cantidad > 0)
      .sort(
        (a, b) =>
          new Date(a.fecha_caducidad || "9999").getTime() -
          new Date(b.fecha_caducidad || "9999").getTime(),
      );
    if (activeLotes.length > 0) {
      targetLoteId = activeLotes[0].id;
      newMerma.lote_id = targetLoteId;
    }
  }

  // Deduct from lote in Supabase
  if (targetLoteId) {
    const lote = product.lotes.find((l) => l.id === targetLoteId);
    if (lote) {
      const newQty = Math.max(0, lote.cantidad - cantidad);
      await supabase
        .from("lotes")
        .update({ cantidad: newQty })
        .eq("id", targetLoteId);
    }
  }

  // Persist in global audit log
  const updatedMermas = [newMerma, ...currentMermas];
  await saveMermasLog(updatedMermas);

  return { merma: newMerma, targetLoteId, updatedMermas };
}

// ─── Persist Mermas Audit Log ────────────────────────────────────────
export async function saveMermasLog(mermas: Merma[]): Promise<void> {
  await supabase
    .from("visitas")
    .update({ notas: JSON.stringify(mermas) })
    .eq("id", MERMAS_RECORD_ID);
}

// ─── Undo Merma ──────────────────────────────────────────────────────

/**
 * Reverts a previously registered merma:
 *  1. Restores stock to the affected lote
 *  2. Removes the entry from the audit log
 *
 * Returns the updated mermas list (without the reverted entry).
 */
export async function undoMerma(
  mermaId: string,
  currentMermas: Merma[],
  allItems: ProductoConLotes[],
): Promise<Merma[]> {
  const target = currentMermas.find((m) => m.id === mermaId);
  if (!target) throw new Error("Merma no encontrada.");

  // Restore stock
  if (target.lote_id) {
    const product = allItems.find((p) => p.id === target.producto_id);
    const lote = product?.lotes.find((l) => l.id === target.lote_id);
    if (lote) {
      const newQty = lote.cantidad + target.cantidad;
      await supabase
        .from("lotes")
        .update({ cantidad: newQty })
        .eq("id", target.lote_id);
    }
  }

  // Update audit log
  const filtered = currentMermas.filter((m) => m.id !== mermaId);
  await saveMermasLog(filtered);

  return filtered;
}
