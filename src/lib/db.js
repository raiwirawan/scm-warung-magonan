import Database from 'better-sqlite3';
import path from 'path';
import { BAHAN_BAKU, SUPPLIERS, MENU, PRICE_HISTORY } from '../data/mockData';

const dbPath = path.resolve(process.cwd(), 'scm.db');

export function getDb() {
  const db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  return db;
}

export function initDb() {
  const db = getDb();

  // Create tables if not exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS bahan_baku (
      id TEXT PRIMARY KEY,
      nama TEXT,
      kategori TEXT,
      satuan TEXT,
      minStok REAL,
      tipe TEXT
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      nama TEXT,
      kontak TEXT,
      alamat TEXT,
      rating REAL,
      komoditas TEXT, -- JSON string
      totalOrder INTEGER
    );

    CREATE TABLE IF NOT EXISTS menu (
      id TEXT PRIMARY KEY,
      nama TEXT,
      kategori TEXT,
      hargaJual REAL,
      emoji TEXT,
      resep TEXT -- JSON string
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bahanId TEXT,
      poId TEXT,
      tanggal TEXT,
      harga REAL
    );

    CREATE TABLE IF NOT EXISTS inventaris_batch (
      batchId TEXT PRIMARY KEY,
      bahanId TEXT,
      poId TEXT,
      tanggalMasuk TEXT,
      qtyAwal REAL,
      qtySisa REAL,
      hargaBeli REAL
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      pemasokId TEXT,
      pemasokNama TEXT,
      tanggal TEXT,
      tanggalKirim TEXT,
      status TEXT,
      catatan TEXT,
      items TEXT -- JSON string
    );

    CREATE TABLE IF NOT EXISTS pesanan (
      id TEXT PRIMARY KEY,
      tanggal TEXT,
      waktu TEXT,
      tipe TEXT,
      meja TEXT,
      totalHarga REAL,
      totalHPP REAL,
      status TEXT,
      items TEXT -- JSON string
    );

    CREATE TABLE IF NOT EXISTS waste_log (
      id TEXT PRIMARY KEY,
      tanggal TEXT,
      poId TEXT,
      bahanId TEXT,
      namaBahan TEXT,
      qty REAL,
      satuan TEXT,
      alasanTolak TEXT,
      nilaiKerugian REAL
    );
  `);

  // Seed data if empty
  const bahanCount = db.prepare('SELECT COUNT(*) as count FROM bahan_baku').get().count;
  if (bahanCount === 0) {
    seedDatabase(db);
  }

  return db;
}

function seedDatabase(db) {
  const insertBahan = db.prepare('INSERT INTO bahan_baku (id, nama, kategori, satuan, minStok, tipe) VALUES (?, ?, ?, ?, ?, ?)');
  BAHAN_BAKU.forEach(b => {
    insertBahan.run(b.id, b.nama, b.kategori, b.satuan, b.minStok, b.tipe);
  });

  const insertSupplier = db.prepare('INSERT INTO suppliers (id, nama, kontak, alamat, rating, komoditas, totalOrder) VALUES (?, ?, ?, ?, ?, ?, ?)');
  SUPPLIERS.forEach(s => {
    insertSupplier.run(s.id, s.nama, s.kontak, s.alamat, s.rating, JSON.stringify(s.komoditas), s.totalOrder);
  });

  const insertMenu = db.prepare('INSERT INTO menu (id, nama, kategori, hargaJual, emoji, resep) VALUES (?, ?, ?, ?, ?, ?)');
  MENU.forEach(m => {
    insertMenu.run(m.id, m.nama, m.kategori, m.hargaJual, m.emoji, JSON.stringify(m.resep));
  });

  const insertPriceHistory = db.prepare('INSERT INTO price_history (bahanId, poId, tanggal, harga) VALUES (?, ?, ?, ?)');
  Object.keys(PRICE_HISTORY).forEach(bahanId => {
    PRICE_HISTORY[bahanId].forEach(h => {
      insertPriceHistory.run(bahanId, h.poId, h.tanggal, h.harga);
    });
  });

  // Seed initial stock (1 batch per item)
  const insertBatch = db.prepare('INSERT INTO inventaris_batch (batchId, bahanId, poId, tanggalMasuk, qtyAwal, qtySisa, hargaBeli) VALUES (?, ?, ?, ?, ?, ?, ?)');
  // We'll create a generic initial batch for every BAHAN_BAKU with 20 units at a mock price, 
  // or we can use the old initial stock logic from mockData. 
  // Actually, wait, let's create dynamic batches based on what was in ScmContext initial state
  BAHAN_BAKU.forEach(b => {
      // Create a default initial batch
      const initialHarga = PRICE_HISTORY[b.id] ? PRICE_HISTORY[b.id][0].harga : 10000;
      const initialQty = b.kategori === 'Bumbu' ? 5 : 20; // arbitrary initial
      insertBatch.run(`INIT-${b.id}`, b.id, 'INIT', '2024-06-01', initialQty, initialQty, initialHarga);
  });

  console.log("Database seeded successfully with mock data.");
}

export function resetDatabase() {
  const db = getDb();
  db.exec(`
    DELETE FROM bahan_baku;
    DELETE FROM suppliers;
    DELETE FROM menu;
    DELETE FROM price_history;
    DELETE FROM inventaris_batch;
    DELETE FROM purchase_orders;
    DELETE FROM pesanan;
    DELETE FROM waste_log;
  `);
  seedDatabase(db);
}
