import initSqlJs, { type Database } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import { SCHEMA_SQL } from './schema'
import type { SpanDb, SqlValue } from './db'

/* sql.js (SQLite compiled to WASM) with the database image persisted to
   IndexedDB. Writes are debounced; pagehide flushes synchronously enough
   for a tab close. This is the dev/browser implementation — on device the
   Capacitor SQLite plugin owns storage. */

const IDB_NAME = 'span-db'
const IDB_STORE = 'sqlite'
const IDB_KEY = 'main'
const PERSIST_DEBOUNCE_MS = 250

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbRead(): Promise<Uint8Array | null> {
  const idb = await openIdb()
  return new Promise((resolve, reject) => {
    const req = idb.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(IDB_KEY)
    req.onsuccess = () => resolve(req.result instanceof Uint8Array ? req.result : null)
    req.onerror = () => reject(req.error)
  })
}

async function idbWrite(bytes: Uint8Array): Promise<void> {
  const idb = await openIdb()
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(bytes, IDB_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function openWebDb(): Promise<SpanDb> {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl })
  let db: Database
  try {
    const saved = await idbRead()
    db = saved ? new SQL.Database(saved) : new SQL.Database()
  } catch {
    db = new SQL.Database()
  }
  db.exec(SCHEMA_SQL)

  let persistTimer: number | null = null
  const persistNow = async () => {
    if (persistTimer !== null) {
      clearTimeout(persistTimer)
      persistTimer = null
    }
    try {
      await idbWrite(db.export())
    } catch {
      /* storage unavailable — data stays in memory for this session */
    }
  }
  const persistSoon = () => {
    if (persistTimer !== null) clearTimeout(persistTimer)
    persistTimer = window.setTimeout(persistNow, PERSIST_DEBOUNCE_MS)
  }
  window.addEventListener('pagehide', () => void persistNow())

  return {
    async run(sql: string, params: SqlValue[] = []) {
      db.run(sql, params)
      persistSoon()
    },
    async query<T>(sql: string, params: SqlValue[] = []) {
      const stmt = db.prepare(sql)
      try {
        stmt.bind(params)
        const rows: T[] = []
        while (stmt.step()) rows.push(stmt.getAsObject() as T)
        return rows
      } finally {
        stmt.free()
      }
    },
    flush: persistNow,
  }
}
