import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createMockSupabase } from "./demo/mockSupabase";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  "";

const supabaseKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
  "";

/**
 * Public showcase: without Supabase credentials (or with VITE_DEMO_MODE=true)
 * the app runs on mock data with authentication disabled.
 */
export const IS_DEMO =
  !supabaseUrl ||
  !supabaseKey ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_DEMO_MODE === "true");

export const supabase: SupabaseClient = IS_DEMO
  ? (createMockSupabase() as unknown as SupabaseClient)
  : createClient(supabaseUrl, supabaseKey);
