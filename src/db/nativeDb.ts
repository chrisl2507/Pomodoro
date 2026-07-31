import { SCHEMA_SQL } from './schema'
import type { SpanDb, SqlValue } from './db'

/* Device implementation over @capacitor-community/sqlite. Only loaded when
   running inside a Capacitor shell; the dynamic import keeps the plugin
   out of the web bundle. The database lives in the app container, which
   Android Auto Backup and iOS device backup both cover. */

const DB_NAME = 'span'

export async function openNativeDb(): Promise<SpanDb> {
  const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite')
  const sqlite = new SQLiteConnection(CapacitorSQLite)
  const conn = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false)
  await conn.open()
  await conn.execute(SCHEMA_SQL)

  return {
    async run(sql: string, params: SqlValue[] = []) {
      await conn.run(sql, params)
    },
    async query<T>(sql: string, params: SqlValue[] = []) {
      const res = await conn.query(sql, params)
      return (res.values ?? []) as T[]
    },
    async flush() {
      /* the plugin writes through to disk; nothing buffered */
    },
  }
}
