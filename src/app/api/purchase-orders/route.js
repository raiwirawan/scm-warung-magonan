import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const db = getDb();
    const data = await request.json();
    
    // Validate
    if (!data.id || !data.pemasokId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stmt = db.prepare('INSERT INTO purchase_orders (id, pemasokId, pemasokNama, tanggal, tanggalKirim, status, catatan, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(
      data.id, 
      data.pemasokId, 
      data.pemasokNama, 
      data.tanggal, 
      data.tanggalKirim || null, 
      data.status || 'draft', 
      data.catatan || '', 
      JSON.stringify(data.items)
    );

    return NextResponse.json({ success: true, message: 'PO created' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = getDb();
    const data = await request.json(); // expect { poId, status, (optional) tanggalKirim }

    if (!data.poId || !data.status) {
      return NextResponse.json({ error: 'Missing poId or status' }, { status: 400 });
    }

    if (data.status === 'dikirim') {
      const tgl = new Date().toISOString().slice(0, 10);
      db.prepare('UPDATE purchase_orders SET status = ?, tanggalKirim = ? WHERE id = ?').run(data.status, tgl, data.poId);
    } else {
      db.prepare('UPDATE purchase_orders SET status = ? WHERE id = ?').run(data.status, data.poId);
    }

    return NextResponse.json({ success: true, message: 'PO updated' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
