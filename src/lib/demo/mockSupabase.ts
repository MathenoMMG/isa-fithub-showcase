/**
 * Demo-mode Supabase stand-in.
 *
 * Implements the subset of the supabase-js API this app uses (query builder,
 * embedded relations and auth) over an in-memory database seeded with mock
 * data and persisted to localStorage, so the showcase runs with no backend
 * and no login.
 */

import { createSeedDatabase, DEMO_USER_EMAIL, type DemoDatabase } from "./seed";

type Row = Record<string, any>;
type Filter = (row: Row) => boolean;

const STORAGE_KEY = "isa-fithub-demo-db-v1";

// ─── Persistence ─────────────────────────────────────────────────────
function loadDb(): DemoDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const db = createSeedDatabase();
  saveDb(db);
  return db;
}

function saveDb(db: DemoDatabase) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {}
}

export function resetDemoDatabase() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  db = createSeedDatabase();
  saveDb(db);
}

let db: DemoDatabase = typeof window !== "undefined" ? loadDb() : createSeedDatabase();

function table(name: string): Row[] {
  if (!db[name]) db[name] = [];
  return db[name];
}

// ─── Relations used by `select("*, rel(...)")` ───────────────────────
const RELATIONS: Record<string, Record<string, { kind: "many" | "one"; table: string; fk: string }>> = {
  productos: { lotes: { kind: "many", table: "lotes", fk: "producto_id" } },
  ventas: { productos: { kind: "one", table: "productos", fk: "producto_id" } },
};

// Only parses the shapes present in this codebase: "*", "a, b" and "*, rel(a, b)".
function parseSelect(columns: string) {
  const embeds: { name: string; cols: string[] }[] = [];
  const stripped = columns.replace(/(\w+)\(([^)]*)\)/g, (_, name, cols) => {
    embeds.push({ name, cols: cols.split(",").map((c: string) => c.trim()).filter(Boolean) });
    return "";
  });
  const cols = stripped.split(",").map((c) => c.trim()).filter(Boolean);
  return { cols, embeds };
}

function pick(row: Row, cols: string[]): Row {
  if (cols.length === 0 || cols.includes("*")) return { ...row };
  const out: Row = {};
  for (const c of cols) out[c] = row[c];
  return out;
}

function project(tableName: string, row: Row, columns: string): Row {
  const { cols, embeds } = parseSelect(columns);
  const out = pick(row, cols);
  for (const embed of embeds) {
    const rel = RELATIONS[tableName]?.[embed.name];
    if (!rel) continue;
    if (rel.kind === "many") {
      out[embed.name] = table(rel.table)
        .filter((r) => r[rel.fk] === row.id)
        .map((r) => pick(r, embed.cols));
    } else {
      const target = table(rel.table).find((r) => r.id === row[rel.fk]);
      out[embed.name] = target ? pick(target, embed.cols) : null;
    }
  }
  return out;
}

function likeToRegex(pattern: string) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/%/g, ".*").replace(/_/g, ".")}$`);
}

function withDefaults(tableName: string, row: Row): Row {
  const now = new Date().toISOString();
  const base: Row = { id: crypto.randomUUID(), created_at: now, ...row };
  if (tableName === "lotes") base.fecha_ingreso ??= now.slice(0, 10);
  return base;
}

// ─── Query builder ───────────────────────────────────────────────────
type Op = "select" | "insert" | "update" | "delete" | "upsert";

class QueryBuilder implements PromiseLike<{ data: any; error: any; count?: number | null }> {
  private op: Op = "select";
  private filters: Filter[] = [];
  private columns = "*";
  private returning = false;
  private payload: Row | Row[] | null = null;
  private orderBy: { col: string; ascending: boolean } | null = null;
  private limitN: number | null = null;
  private singleMode: "single" | "maybe" | null = null;
  private countMode = false;
  private headOnly = false;
  private upsertKey = "id";

  constructor(private tableName: string) {}

  select(columns = "*", opts?: { count?: string; head?: boolean }) {
    if (this.op === "select") this.columns = columns;
    else {
      this.returning = true;
      this.columns = columns;
    }
    this.countMode = !!opts?.count;
    this.headOnly = !!opts?.head;
    return this;
  }
  insert(values: Row | Row[]) {
    this.op = "insert";
    this.payload = values;
    return this;
  }
  update(values: Row) {
    this.op = "update";
    this.payload = values;
    return this;
  }
  upsert(values: Row | Row[], opts?: { onConflict?: string }) {
    this.op = "upsert";
    this.payload = values;
    if (opts?.onConflict) this.upsertKey = opts.onConflict;
    return this;
  }
  delete() {
    this.op = "delete";
    return this;
  }

  eq(col: string, value: any) {
    // supabase-js would send "eq.null"; the demo treats it as IS NULL, which is what callers intend.
    this.filters.push((r) => (value === null ? r[col] == null : r[col] === value));
    return this;
  }
  neq(col: string, value: any) {
    this.filters.push((r) => r[col] !== value);
    return this;
  }
  gte(col: string, value: any) {
    this.filters.push((r) => r[col] >= value);
    return this;
  }
  lte(col: string, value: any) {
    this.filters.push((r) => r[col] <= value);
    return this;
  }
  gt(col: string, value: any) {
    this.filters.push((r) => r[col] > value);
    return this;
  }
  lt(col: string, value: any) {
    this.filters.push((r) => r[col] < value);
    return this;
  }
  in(col: string, values: any[]) {
    this.filters.push((r) => values.includes(r[col]));
    return this;
  }
  is(col: string, value: any) {
    this.filters.push((r) => (value === null ? r[col] == null : r[col] === value));
    return this;
  }
  like(col: string, pattern: string) {
    const re = likeToRegex(pattern);
    this.filters.push((r) => re.test(String(r[col] ?? "")));
    return this;
  }
  not(col: string, operator: string, value: any) {
    if (operator === "like") {
      const re = likeToRegex(value);
      this.filters.push((r) => !re.test(String(r[col] ?? "")));
    } else if (operator === "is") {
      this.filters.push((r) => (value === null ? r[col] != null : r[col] !== value));
    } else {
      this.filters.push((r) => r[col] !== value);
    }
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderBy = { col, ascending: opts?.ascending ?? true };
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  single() {
    this.singleMode = "single";
    return this;
  }
  maybeSingle() {
    this.singleMode = "maybe";
    return this;
  }

  private matches(row: Row) {
    return this.filters.every((f) => f(row));
  }

  private execute(): { data: any; error: any; count?: number | null } {
    const rows = table(this.tableName);
    let result: Row[] = [];

    switch (this.op) {
      case "select":
        result = rows.filter((r) => this.matches(r));
        break;
      case "insert": {
        const values = Array.isArray(this.payload) ? this.payload : [this.payload!];
        result = values.map((v) => withDefaults(this.tableName, v));
        rows.push(...result);
        saveDb(db);
        break;
      }
      case "upsert": {
        const values = Array.isArray(this.payload) ? this.payload : [this.payload!];
        result = values.map((v) => {
          const idx = rows.findIndex((r) => r[this.upsertKey] === v[this.upsertKey]);
          if (idx >= 0) {
            rows[idx] = { ...rows[idx], ...v };
            return rows[idx];
          }
          const created = withDefaults(this.tableName, v);
          rows.push(created);
          return created;
        });
        saveDb(db);
        break;
      }
      case "update":
        result = rows.filter((r) => this.matches(r));
        result.forEach((r) => Object.assign(r, this.payload));
        saveDb(db);
        break;
      case "delete":
        result = rows.filter((r) => this.matches(r));
        db[this.tableName] = rows.filter((r) => !this.matches(r));
        if (this.tableName === "productos") {
          const ids = new Set(result.map((r) => r.id));
          db.lotes = table("lotes").filter((l) => !ids.has(l.producto_id));
        }
        saveDb(db);
        break;
    }

    if (this.orderBy) {
      const { col, ascending } = this.orderBy;
      result = [...result].sort((a, b) => {
        if (a[col] === b[col]) return 0;
        const cmp = a[col] > b[col] ? 1 : -1;
        return ascending ? cmp : -cmp;
      });
    }
    const count = this.countMode ? result.length : null;
    if (this.limitN !== null) result = result.slice(0, this.limitN);

    if (this.op !== "select" && !this.returning) return { data: null, error: null, count };
    if (this.headOnly) return { data: null, error: null, count };

    const projected = result.map((r) => project(this.tableName, r, this.columns));
    if (this.singleMode) {
      if (projected.length === 0) {
        return this.singleMode === "maybe"
          ? { data: null, error: null }
          : { data: null, error: { message: "No rows found (demo)", code: "PGRST116" } };
      }
      return { data: projected[0], error: null };
    }
    return { data: projected, error: null, count };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    // Small delay so loading states render like they would against a real API.
    return new Promise<{ data: any; error: any; count?: number | null }>((resolve) =>
      setTimeout(() => resolve(this.execute()), 120),
    ).then(onfulfilled, onrejected);
  }
}

// ─── Auth (always signed in as the demo user) ────────────────────────
const demoUser = {
  id: "demo-user",
  email: DEMO_USER_EMAIL,
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: { name: "Demo" },
  created_at: new Date().toISOString(),
};

const demoSession = {
  access_token: "demo",
  refresh_token: "demo",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600 * 24,
  user: demoUser,
};

const auth = {
  getSession: async () => ({ data: { session: demoSession }, error: null }),
  onAuthStateChange: (_cb: (event: string, session: any) => void) => ({
    data: { subscription: { unsubscribe: () => {} } },
  }),
  signInWithPassword: async () => ({ data: { session: demoSession, user: demoUser }, error: null }),
  signOut: async () => ({ error: null }),
  resetPasswordForEmail: async () => ({ data: {}, error: null }),
  updateUser: async () => ({ data: { user: demoUser }, error: null }),
};

export function createMockSupabase() {
  return {
    from: (tableName: string) => new QueryBuilder(tableName),
    auth,
  };
}
