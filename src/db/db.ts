/* SpanDb — the one seam between the app and SQLite. The web implementation
   (sql.js, persisted to IndexedDB) runs everywhere including dev; the
   native implementation (@capacitor-community/sqlite) is selected when the
   app runs inside a Capacitor shell. */

export type SqlValue = string | number | null

export interface SpanDb {
  /** Execute a write statement. */
  run(sql: string, params?: SqlValue[]): Promise<void>
  /** Execute a read statement, rows as objects keyed by column name. */
  query<T = Record<string, SqlValue>>(sql: string, params?: SqlValue[]): Promise<T[]>
  /** Flush any pending persistence immediately (called on pagehide). */
  flush(): Promise<void>
}

let instance: Promise<SpanDb> | null = null

function isCapacitorNative(): boolean {
  const w = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }
  return Boolean(w.Capacitor?.isNativePlatform?.())
}

/* If the real store cannot open (WASM blocked, IndexedDB unavailable, a
   broken plugin), the app degrades to an ephemeral timer instead of
   hanging on the splash: writes vanish, reads are empty. The failure is
   cached only for this launch, so the next launch retries the real store. */
function nullDb(): SpanDb {
  return {
    async run() {},
    async query() {
      return []
    },
    async flush() {},
  }
}

export function getDb(): Promise<SpanDb> {
  if (!instance) {
    instance = (
      isCapacitorNative()
        ? import('./nativeDb').then((m) => m.openNativeDb())
        : import('./webDb').then((m) => m.openWebDb())
    ).catch((err) => {
      console.warn('span db unavailable, running without persistence', err)
      return nullDb()
    })
  }
  return instance
}
