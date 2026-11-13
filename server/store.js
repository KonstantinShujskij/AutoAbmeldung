// Хранилище заявок — SQLite (встроенный node:sqlite, без нативных зависимостей).
// Файл БД лежит в томе server/data, поэтому переживает пересборку контейнера.
// При старте однократно импортирует старые заявки из server/data/applications/*.json.

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readdirSync, readFileSync, renameSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'server', 'data');
const DB_PATH = path.join(DATA_DIR, 'autoabmeldung.db');
const LEGACY_DIR = path.join(DATA_DIR, 'applications');

mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id         TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    status     TEXT NOT NULL,
    data       TEXT NOT NULL,
    privacy    TEXT,
    payment    TEXT,
    history    TEXT NOT NULL
  )
`);

const rowToRecord = (r) =>
  r && {
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    status: r.status,
    data: JSON.parse(r.data),
    privacy: r.privacy ? JSON.parse(r.privacy) : null,
    payment: r.payment ? JSON.parse(r.payment) : null,
    history: JSON.parse(r.history),
  };

const insertStmt = db.prepare(
  `INSERT INTO applications (id, created_at, updated_at, status, data, privacy, payment, history)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
);

/** @param {{id,status,createdAt,data,privacy}} rec */
export function createApplication(rec) {
  const history = JSON.stringify([{ status: rec.status, at: rec.createdAt }]);
  insertStmt.run(
    rec.id, rec.createdAt, rec.createdAt, rec.status,
    JSON.stringify(rec.data), rec.privacy ? JSON.stringify(rec.privacy) : null, null, history,
  );
  return getApplication(rec.id);
}

const getStmt = db.prepare('SELECT * FROM applications WHERE id = ?');
export function getApplication(id) {
  return rowToRecord(getStmt.get(id));
}

const updateStmt = db.prepare(
  'UPDATE applications SET status = ?, payment = ?, history = ?, updated_at = ? WHERE id = ?',
);
/** Сменить статус и/или данные оплаты, записать событие в историю. */
export function updateApplication(id, { status, payment, by } = {}) {
  const rec = getApplication(id);
  if (!rec) return null;
  const now = new Date().toISOString();
  const nextStatus = status ?? rec.status;
  const nextPayment = payment ?? rec.payment;
  const history = [...rec.history, { status: nextStatus, at: now, ...(by ? { by } : {}) }];
  updateStmt.run(nextStatus, nextPayment ? JSON.stringify(nextPayment) : null, JSON.stringify(history), now, id);
  return getApplication(id);
}

const listStmt = db.prepare('SELECT * FROM applications ORDER BY created_at DESC LIMIT ?');
export function listApplications(limit = 100) {
  return listStmt.all(limit).map(rowToRecord);
}

// --- Разовый импорт старых JSON-заявок ---
function migrateLegacy() {
  if (!existsSync(LEGACY_DIR)) return;
  let files;
  try { files = readdirSync(LEGACY_DIR).filter((f) => f.endsWith('.json')); } catch { return; }
  if (files.length === 0) return;
  const done = path.join(LEGACY_DIR, 'imported');
  mkdirSync(done, { recursive: true });
  let n = 0;
  for (const f of files) {
    try {
      const rec = JSON.parse(readFileSync(path.join(LEGACY_DIR, f), 'utf8'));
      if (rec.id && !getApplication(rec.id)) {
        insertStmt.run(
          rec.id, rec.createdAt, rec.createdAt, rec.status ?? 'eingegangen',
          JSON.stringify(rec.data ?? {}), rec.privacy ? JSON.stringify(rec.privacy) : null,
          rec.payment ? JSON.stringify(rec.payment) : null,
          JSON.stringify([{ status: rec.status ?? 'eingegangen', at: rec.createdAt }]),
        );
        n++;
      }
      renameSync(path.join(LEGACY_DIR, f), path.join(done, f));
    } catch (err) {
      console.error('[store] Legacy-Import übersprungen', f, err.message);
    }
  }
  if (n) console.log(`[store] ${n} alte Anträge aus JSON importiert`);
}
migrateLegacy();
