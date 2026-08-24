/**
 * Time Log Service — Pure Supabase data layer for clock-in/clock-out records.
 */

import { supabase } from "@/lib/supabase";
import type { RegistroHorario } from "@/types/inventory";

// ─── Fetch All Logs ──────────────────────────────────────────────────
export async function fetchTimeLogs(): Promise<RegistroHorario[]> {
  const { data, error } = await supabase
    .from("registros_horario")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// ─── Create Log Entry ────────────────────────────────────────────────
export async function createTimeLog(
  tipo: "entrada" | "salida",
  tiendaId: number | null,
): Promise<RegistroHorario> {
  const { data, error } = await supabase
    .from("registros_horario")
    .insert({ tipo, tienda_id: tiendaId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Update Log Timestamp ────────────────────────────────────────────
export async function updateTimeLog(
  id: string,
  newDateIso: string,
): Promise<void> {
  const { error } = await supabase
    .from("registros_horario")
    .update({ created_at: newDateIso })
    .eq("id", id);
  if (error) throw error;
}

// ─── Delete Log Entry ────────────────────────────────────────────────
export async function deleteTimeLog(id: string): Promise<void> {
  const { error } = await supabase
    .from("registros_horario")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
