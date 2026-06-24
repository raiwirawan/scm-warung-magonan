import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function POST(request) {
  try {
    const db = getDb();
    const data = await request.json(); // { poId, approved, rejected }
    
    if (!data.poId || !data.approved || !data.rejected) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tanggal = new Date().toISOString().slice(0, 10);

    // 1. Update PO status
    const poIndex = db.purchase_orders.findIndex(po => po.id === data.poId);
    if (poIndex !== -1) {
      db.purchase_orders[poIndex].status = 'diterima';
    }

    // 2. Insert Approved into inventaris_batch and price_history
    data.approved.forEach((item, index) => {
      const batchId = `${data.poId}-${item.bahanId}-${Date.now().toString().slice(-4)}-${index}`;
      
      db.inventaris_batch.push({
        batchId,
        bahanId: item.bahanId,
        poId: data.poId,
        tanggalMasuk: tanggal,
        qtyAwal: item.qty,
        qtySisa: item.qty,
        hargaBeli: item.hargaPerUnit
      });

      db.price_history.push({
        bahanId: item.bahanId,
        poId: data.poId,
        tanggal,
        harga: item.hargaPerUnit
      });
    });

    // 3. Insert Rejected into waste_log
    data.rejected.forEach((item, index) => {
      const wId = `WST-${Date.now().toString().slice(-6)}-${item.bahanId}-${index}`;
      const kerugian = item.qty * item.hargaPerUnit;
      
      db.waste_log.push({
        id: wId,
        tanggal,
        poId: data.poId,
        bahanId: item.bahanId,
        namaBahan: item.nama,
        qty: item.qty,
        satuan: item.satuan,
        alasanTolak: item.alasanTolak,
        nilaiKerugian: kerugian
      });
    });

    saveDb(db);

    return NextResponse.json({ success: true, message: 'Inbound processed' });
  } catch (error) {
    console.error("Inbound Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
