import fs from 'fs';
import path from 'path';
import { BAHAN_BAKU, SUPPLIERS, MENU, PRICE_HISTORY } from '../data/mockData';

const dbPath = path.resolve(process.cwd(), 'scm_db.json');

// Global variable for in-memory persistence when the filesystem is read-only (e.g., Vercel)
let memoryDb = null;

function getInitialData() {
  const initialBatches = [];
  BAHAN_BAKU.forEach(b => {
    const initialHarga = PRICE_HISTORY[b.id] ? PRICE_HISTORY[b.id][0].harga : 10000;
    const initialQty = b.kategori === 'Bumbu' ? 5 : 20;
    initialBatches.push({
      batchId: `INIT-${b.id}`,
      bahanId: b.id,
      poId: 'INIT',
      tanggalMasuk: '2024-06-01',
      qtyAwal: initialQty,
      qtySisa: initialQty,
      hargaBeli: initialHarga
    });
  });

  const priceHistoryList = [];
  Object.keys(PRICE_HISTORY).forEach(bahanId => {
    PRICE_HISTORY[bahanId].forEach(h => {
      priceHistoryList.push({
        bahanId,
        poId: h.poId,
        tanggal: h.tanggal,
        harga: h.harga
      });
    });
  });

  return {
    bahan_baku: BAHAN_BAKU,
    suppliers: SUPPLIERS,
    menu: MENU,
    price_history: priceHistoryList,
    inventaris_batch: initialBatches,
    purchase_orders: [],
    pesanan: [],
    waste_log: []
  };
}

export function getDb() {
  // If memoryDb is already loaded in this runtime instance, return it
  if (memoryDb) {
    return memoryDb;
  }

  // Try to load from file (for local development persistence)
  try {
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, 'utf8');
      memoryDb = JSON.parse(fileData);
      return memoryDb;
    }
  } catch (error) {
    console.warn("db.js: Gagal membaca database dari file. Menggunakan in-memory fallback.", error);
  }

  // If file doesn't exist or read fails, generate initial mock data
  memoryDb = getInitialData();
  saveDb(memoryDb);
  return memoryDb;
}

export function saveDb(data) {
  memoryDb = data;
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    // Normal in Vercel preview/production where the directory is read-only
    console.warn("db.js: Gagal menulis database ke file (ini normal di Vercel). Menggunakan in-memory state.");
  }
}

export function initDb() {
  return getDb();
}

export function resetDatabase() {
  const initialData = getInitialData();
  saveDb(initialData);
  return initialData;
}
