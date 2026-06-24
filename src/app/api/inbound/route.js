import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const db = getDb();
    const data = await request.json(); // { poId, approved, rejected }
    
    if (!data.poId || !data.approved || !data.rejected) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tanggal = new Date().toISOString().slice(0, 10);

    // Use transaction to ensure all operations succeed or fail together
    const processInbound = db.transaction(() => {
      // 1. Update PO status
      db.prepare('UPDATE purchase_orders SET status = ? WHERE id = ?').run('diterima', data.poId);

      // 2. Insert Approved into inventaris_batch
      const insertBatch = db.prepare('INSERT INTO inventaris_batch (batchId, bahanId, poId, tanggalMasuk, qtyAwal, qtySisa, hargaBeli) VALUES (?, ?, ?, ?, ?, ?, ?)');
      const insertPriceHistory = db.prepare('INSERT INTO price_history (bahanId, poId, tanggal, harga) VALUES (?, ?, ?, ?)');
      
      data.approved.forEach(item => {
        const batchId = `${data.poId}-${item.bahanId}-${Date.now().toString().slice(-4)}`;
        insertBatch.run(batchId, item.bahanId, data.poId, tanggal, item.qty, item.qty, item.hargaPerUnit);
        insertPriceHistory.run(item.bahanId, data.poId, tanggal, item.hargaPerUnit);
      });

      // 3. Insert Rejected into waste_log
      const insertWaste = db.prepare('INSERT INTO waste_log (id, tanggal, poId, bahanId, namaBahan, qty, satuan, alasanTolak, nilaiKerugian) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      data.rejected.forEach(item => {
        const wId = `WST-${Date.now().toString().slice(-6)}-${item.bahanId}`;
        const kerugian = item.qty * item.hargaPerUnit;
        insertWaste.run(wId, tanggal, data.poId, item.bahanId, item.nama, item.qty, item.satuan, item.alasanTolak, kerugian);
      });
    });

    processInbound();

    return NextResponse.json({ success: true, message: 'Inbound processed' });
  } catch (error) {
    console.error("Inbound Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
