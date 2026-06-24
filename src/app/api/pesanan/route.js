import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function POST(request) {
  try {
    const db = getDb();
    const data = await request.json(); // { cartItems, tipe, meja }

    const tanggal = new Date().toISOString().slice(0, 10);
    const waktu = new Date().toTimeString().slice(0, 5);
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    let totalHarga = 0;
    let totalHPP = 0;

    // Clone inventaris_batch so we can revert if any item fails (mimics SQLite transaction)
    const tempBatches = JSON.parse(JSON.stringify(db.inventaris_batch));

    // For each item in cart
    for (const cartItem of data.cartItems) {
      totalHarga += cartItem.hargaJual * cartItem.qty;

      // Deduct materials from inventaris_batch
      for (const bahan of cartItem.resep) {
        let qtyNeeded = bahan.qty * cartItem.qty;
        let costForThisBahan = 0;

        // Get batches for this bahan ordered by tanggalMasuk
        const batches = tempBatches
          .filter(b => b.bahanId === bahan.bahanId && b.qtySisa > 0)
          .sort((a, b) => a.tanggalMasuk.localeCompare(b.tanggalMasuk));
        
        for (const batch of batches) {
          if (qtyNeeded <= 0) break;

          const take = Math.min(batch.qtySisa, qtyNeeded);
          qtyNeeded -= take;
          costForThisBahan += take * batch.hargaBeli;

          // Update batch qtySisa
          batch.qtySisa = parseFloat((batch.qtySisa - take).toFixed(4));
        }

        if (qtyNeeded > 0.001) {
          return NextResponse.json({ error: `Stok tidak mencukupi untuk bahan ID ${bahan.bahanId}` }, { status: 400 });
        }
        totalHPP += costForThisBahan;
      }
    }

    // Apply the updated batches
    db.inventaris_batch = tempBatches;

    // Insert Pesanan record
    db.pesanan.push({
      id: orderId,
      tanggal,
      waktu,
      tipe: data.tipe || 'Dine-in',
      meja: data.meja || '-',
      totalHarga,
      totalHPP,
      status: 'selesai',
      items: data.cartItems
    });

    saveDb(db);

    return NextResponse.json({ success: true, message: 'Pesanan processed' });
  } catch (error) {
    console.error("Pesanan Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
