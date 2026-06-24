import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function POST(request) {
  try {
    const db = getDb();
    const data = await request.json();
    
    // Validate
    if (!data.id || !data.pemasokId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert new PO
    const newPO = {
      id: data.id,
      pemasokId: data.pemasokId,
      pemasokNama: data.pemasokNama,
      tanggal: data.tanggal,
      tanggalKirim: data.tanggalKirim || null,
      status: data.status || 'draft',
      catatan: data.catatan || '',
      items: data.items
    };

    db.purchase_orders.push(newPO);
    saveDb(db);

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

    const poIndex = db.purchase_orders.findIndex(po => po.id === data.poId);
    if (poIndex === -1) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    db.purchase_orders[poIndex].status = data.status;
    if (data.status === 'dikirim') {
      db.purchase_orders[poIndex].tanggalKirim = new Date().toISOString().slice(0, 10);
    }

    saveDb(db);

    return NextResponse.json({ success: true, message: 'PO updated' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
