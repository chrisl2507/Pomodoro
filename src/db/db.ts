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

export function getDb(): Promise<SpanDb> {
  if (!instance) {
    instance = isCapacitorNative()
      ? import('./nativeDb').then((m) => m.openNativeDb())
      : import('./webDb').then((m) => m.openWebDb())
  }
  return instance
}
