import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET() {
  try {
    const db = initDb();

    const bahanBaku = db.prepare('SELECT * FROM bahan_baku').all();
    const suppliers = db.prepare('SELECT * FROM suppliers').all().map(s => ({
      ...s,
      komoditas: JSON.parse(s.komoditas)
    }));
    const menu = db.prepare('SELECT * FROM menu').all().map(m => ({
      ...m,
      resep: JSON.parse(m.resep)
    }));

    const priceHistoryRows = db.prepare('SELECT * FROM price_history').all();
    const priceHistory = {};
    priceHistoryRows.forEach(row => {
      if (!priceHistory[row.bahanId]) priceHistory[row.bahanId] = [];
      priceHistory[row.bahanId].push({ poId: row.poId, tanggal: row.tanggal, harga: row.harga });
    });

    const poRows = db.prepare('SELECT * FROM purchase_orders').all();
    const purchaseOrders = poRows.map(po => ({
      ...po,
      items: JSON.parse(po.items)
    }));

    const pesananRows = db.prepare('SELECT * FROM pesanan').all();
    const pesanan = pesananRows.map(p => ({
      ...p,
      items: JSON.parse(p.items)
    }));

    const wasteLog = db.prepare('SELECT * FROM waste_log').all();

    const batches = db.prepare('SELECT * FROM inventaris_batch WHERE qtySisa > 0 ORDER BY tanggalMasuk ASC').all();
    const stok = {};
    batches.forEach(b => {
      if (!stok[b.bahanId]) stok[b.bahanId] = { batches: [] };
      stok[b.bahanId].batches.push(b);
    });

    return NextResponse.json({
      BAHAN_BAKU: bahanBaku,
      SUPPLIERS: suppliers,
      MENU: menu,
      PRICE_HISTORY: priceHistory,
      purchaseOrders,
      pesanan,
      wasteLog,
      stok
    });
  } catch (error) {
    console.error("API State Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
