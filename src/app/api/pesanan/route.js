import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const db = getDb();
    const data = await request.json(); // { cartItems, tipe, meja }

    const tanggal = new Date().toISOString().slice(0, 10);
    const waktu = new Date().toTimeString().slice(0, 5);
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    let totalHarga = 0;
    let totalHPP = 0;

    const processOrder = db.transaction(() => {
      // For each item in cart
      for (const cartItem of data.cartItems) {
        totalHarga += cartItem.hargaJual * cartItem.qty;

        // Deduct materials from inventaris_batch
        for (const bahan of cartItem.resep) {
          let qtyNeeded = bahan.qty * cartItem.qty;
          let costForThisBahan = 0;

          // Get batches for this bahan ordered by tanggalMasuk
          const batches = db.prepare('SELECT * FROM inventaris_batch WHERE bahanId = ? AND qtySisa > 0 ORDER BY tanggalMasuk ASC').all(bahan.bahanId);
          
          for (const batch of batches) {
            if (qtyNeeded <= 0) break;

            const take = Math.min(batch.qtySisa, qtyNeeded);
            qtyNeeded -= take;
            costForThisBahan += take * batch.hargaBeli;

            // Update batch qtySisa
            db.prepare('UPDATE inventaris_batch SET qtySisa = qtySisa - ? WHERE batchId = ?').run(take, batch.batchId);
          }

          if (qtyNeeded > 0.001) {
            // Insufficient stock theoretically, but we'll allow negative or just throw error.
            // Throwing error rolls back transaction
            throw new Error(`Stok tidak mencukupi untuk bahan ID ${bahan.bahanId}`);
          }
          totalHPP += costForThisBahan;
        }
      }

      // Insert Pesanan record
      const stmt = db.prepare('INSERT INTO pesanan (id, tanggal, waktu, tipe, meja, totalHarga, totalHPP, status, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.run(orderId, tanggal, waktu, data.tipe || 'Dine-in', data.meja || '-', totalHarga, totalHPP, 'selesai', JSON.stringify(data.cartItems));
    });

    processOrder();

    return NextResponse.json({ success: true, message: 'Pesanan processed' });
  } catch (error) {
    console.error("Pesanan Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
