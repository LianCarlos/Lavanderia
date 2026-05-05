/**
 * SQLite Singleton — HMR-safe para Next.js
 *
 * El Hot Module Replacement de Next.js re-evalúa los módulos en cada cambio,
 * lo que crearía múltiples instancias de la conexión y causaría
 * "Database is locked". El patrón globalThis garantiza una sola instancia
 * durante toda la vida del proceso Node.js, incluso con HMR activo.
 */
import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const DB_DIR  = join(process.cwd(), 'data');
const DB_PATH = join(DB_DIR, 'lavanderia.db');
const SCHEMA_PATH = join(process.cwd(), 'src', 'lib', 'schema.sql');

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function createConnection(): Database.Database {
  mkdirSync(DB_DIR, { recursive: true });

  const db = new Database(DB_PATH);

  // Pragmas de rendimiento y seguridad
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = -65536'); // 64 MB
  db.pragma('busy_timeout = 5000');

  // Ejecutar migración solo si la tabla principal no existe aún
  const tableExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clientes'")
    .get();

  if (!tableExists && existsSync(SCHEMA_PATH)) {
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);
    console.log('✅ DB inicializada con schema + seed data');
  }

  return db;
}

// En producción creamos siempre una instancia nueva (proceso largo, sin HMR).
// En desarrollo usamos globalThis para sobrevivir el HMR.
export const db: Database.Database =
  process.env.NODE_ENV === 'production'
    ? createConnection()
    : (globalThis.__db ?? (globalThis.__db = createConnection()));

export default db;
