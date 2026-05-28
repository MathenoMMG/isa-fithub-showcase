import { supabase } from "@/lib/supabase";

export interface PendingOp {
  id: string;
  type: 'sell' | 'adjust' | 'add_product' | 'add_lote' | 'add_log' | 'visit';
  data: any;
  timestamp: number;
}

export const getPendingOps = (): PendingOp[] => {
  try {
    return JSON.parse(localStorage.getItem("fithub_pending_ops") || "[]");
  } catch {
    return [];
  }
};

export const savePendingOps = (ops: PendingOp[]) => {
  localStorage.setItem("fithub_pending_ops", JSON.stringify(ops));
};

export const addPendingOp = (type: PendingOp['type'], data: any) => {
  const ops = getPendingOps();
  const newOp: PendingOp = {
    id: Math.random().toString(36).substring(2, 9),
    type,
    data,
    timestamp: Date.now()
  };
  ops.push(newOp);
  savePendingOps(ops);
  
  // Emitir un evento para notificar al header de los cambios en la cola
  window.dispatchEvent(new Event("fithub_pending_ops_changed"));
  return newOp;
};

export const removePendingOp = (id: string) => {
  const ops = getPendingOps();
  const filtered = ops.filter(o => o.id !== id);
  savePendingOps(filtered);
  window.dispatchEvent(new Event("fithub_pending_ops_changed"));
};

export const clearPendingOps = () => {
  localStorage.removeItem("fithub_pending_ops");
  window.dispatchEvent(new Event("fithub_pending_ops_changed"));
};

/**
 * Procesa una operación pendiente directamente en la base de datos de Supabase,
 * realizando validaciones de consistencia previas para evitar inconsistencias de datos.
 */
export async function processPendingOp(op: PendingOp) {
  switch (op.type) {
    case 'sell': {
      const { producto_id, lote_id, cantidad } = op.data;
      
      // 1. Obtener estado en tiempo real del lote en la DB
      const { data: lote, error: lFetchErr } = await supabase
        .from("lotes")
        .select("cantidad")
        .eq("id", lote_id)
        .maybeSingle();
      
      if (lFetchErr) throw lFetchErr;
      
      if (!lote) {
        console.warn(`Sincronización: El lote ${lote_id} ya no existe en la base de datos. Saltando venta.`);
        return; // El lote fue eliminado por otra sesión, saltar
      }

      const stockDisponible = lote.cantidad;
      if (stockDisponible <= 0) {
        console.warn(`Sincronización: El lote ${lote_id} no tiene stock disponible en la DB. Saltando venta.`);
        return; // Sin stock real en DB, saltar
      }

      // Ajustar cantidad a vender al stock disponible real en la base de datos
      const cantidadRealAVender = Math.min(cantidad, stockDisponible);

      // Registrar la venta con la cantidad real ajustada
      const { error: vErr } = await supabase.from("ventas").insert({
        producto_id,
        lote_id,
        cantidad: cantidadRealAVender,
      });
      if (vErr) throw vErr;

      // Decrementar lote con el ajuste realizado
      const newQty = Math.max(0, stockDisponible - cantidadRealAVender);
      const { error: lErr } = await supabase
        .from("lotes")
        .update({ cantidad: newQty })
        .eq("id", lote_id);
      if (lErr) throw lErr;
      break;
    }
    
    case 'adjust': {
      const { lote_id, delta } = op.data;
      
      const { data: lote, error: lFetchErr } = await supabase
        .from("lotes")
        .select("cantidad")
        .eq("id", lote_id)
        .maybeSingle();
      if (lFetchErr) throw lFetchErr;

      if (!lote) {
        console.warn(`Sincronización: El lote ${lote_id} ya no existe para ajustar. Saltando ajuste.`);
        return;
      }

      // Asegurar que el ajuste no resulte en stock negativo en la DB
      const newQty = Math.max(0, lote.cantidad + delta);
      const { error } = await supabase
        .from("lotes")
        .update({ cantidad: newQty })
        .eq("id", lote_id);
      if (error) throw error;
      break;
    }
    
    case 'add_product': {
      const { cantidad, fecha_caducidad, ...productData } = op.data;
      
      // Validar si el producto (por código de artículo y tienda) ya existe
      const { data: existingProd, error: pFetchErr } = await supabase
        .from("productos")
        .select("id")
        .eq("articulo", productData.articulo)
        .eq("tienda_id", productData.tienda_id)
        .maybeSingle();
      
      if (pFetchErr) throw pFetchErr;

      let targetProductId = "";

      if (existingProd) {
        console.log(`Sincronización: El producto con artículo ${productData.articulo} ya existe. Asociando lote.`);
        targetProductId = existingProd.id;
      } else {
        const { data: product, error: pErr } = await supabase
          .from("productos")
          .insert(productData)
          .select()
          .single();
        if (pErr) throw pErr;
        targetProductId = product.id;
      }

      // Si tiene cantidad inicial, crear o acumular en lote
      if (cantidad > 0) {
        // Verificar si ya existe un lote con la misma caducidad
        const { data: existingLote, error: lFetchErr } = await supabase
          .from("lotes")
          .select("id, cantidad")
          .eq("producto_id", targetProductId)
          .eq("fecha_caducidad", fecha_caducidad || null)
          .maybeSingle();

        if (lFetchErr) throw lFetchErr;

        if (existingLote) {
          // Fusionar cantidades en lote existente
          const newQty = existingLote.cantidad + cantidad;
          const { error: lErr } = await supabase
            .from("lotes")
            .update({ cantidad: newQty })
            .eq("id", existingLote.id);
          if (lErr) throw lErr;
        } else {
          // Insertar nuevo lote
          const { error: lErr } = await supabase.from("lotes").insert({
            producto_id: targetProductId,
            cantidad,
            fecha_caducidad: fecha_caducidad || null,
          });
          if (lErr) throw lErr;
        }
      }
      break;
    }
    
    case 'add_lote': {
      const { producto_id, cantidad, fecha_caducidad } = op.data;
      
      // Verificar si ya existe un lote con la misma caducidad
      const { data: existingLote, error: lFetchErr } = await supabase
        .from("lotes")
        .select("id, cantidad")
        .eq("producto_id", producto_id)
        .eq("fecha_caducidad", fecha_caducidad || null)
        .maybeSingle();

      if (lFetchErr) throw lFetchErr;

      if (existingLote) {
        // Fusionar cantidades
        const newQty = existingLote.cantidad + cantidad;
        const { error: lErr } = await supabase
          .from("lotes")
          .update({ cantidad: newQty })
          .eq("id", existingLote.id);
        if (lErr) throw lErr;
      } else {
        const { error } = await supabase.from("lotes").insert({
          producto_id,
          cantidad,
          fecha_caducidad: fecha_caducidad || null,
        });
        if (error) throw error;
      }
      break;
    }
    
    case 'add_log': {
      const { tipo, tienda_id } = op.data;
      const { error } = await supabase.from("registros_horario").insert({
        tipo,
        tienda_id,
      });
      if (error) throw error;
      break;
    }
    
    case 'visit': {
      const { tienda_id, fecha, notas } = op.data;
      const { error } = await supabase.from("visitas").insert({
        tienda_id,
        fecha,
        notas: notas || null,
      });
      if (error && error.code !== "23505") throw error; // Ignorar duplicados
      break;
    }
  }
}
