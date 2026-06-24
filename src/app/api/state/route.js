import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET() {
  try {
    const db = initDb();

    const bahanBaku = db.bahan_baku;
    const suppliers = db.suppliers;
    const menu = db.menu;

    // Group price history by bahanId
    const priceHistory = {};
    db.price_history.forEach(row => {
      if (!priceHistory[row.bahanId]) {
        priceHistory[row.bahanId] = [];
      }
      priceHistory[row.bahanId].push({
        poId: row.poId,
        tanggal: row.tanggal,
        harga: row.harga
      });
    });

    const purchaseOrders = db.purchase_orders;
    const pesanan = db.pesanan;
    const wasteLog = db.waste_log;

    // Group active stock batches by bahanId, sorted by entry date (FIFO)
    const stok = {};
    const activeBatches = db.inventaris_batch
      .filter(b => b.qtySisa > 0)
      .sort((a, b) => a.tanggalMasuk.localeCompare(b.tanggalMasuk));

    activeBatches.forEach(b => {
      if (!stok[b.bahanId]) {
        stok[b.bahanId] = { batches: [] };
      }
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
