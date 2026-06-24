"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  STOK_INITIAL,
  PURCHASE_ORDERS_INITIAL,
  PESANAN_INITIAL,
  WASTE_INITIAL,
  BAHAN_BAKU,
  MENU,
} from "@/data/mockData";

const ScmContext = createContext(null);

const STORAGE_KEY = "scm_warung_magonan_v2";

// FIFO: Hitung total qty dari semua batch
function calcTotalQty(batches) {
  return batches.reduce((sum, b) => sum + b.qtySisa, 0);
}

// FIFO: Hitung HPP (Harga Pokok Produksi) berdasarkan FIFO tanpa mengurangi stok
function calcFifoCost(stok, bahanId, qtyNeeded) {
  const data = stok[bahanId];
  if (!data || data.batches.length === 0) return { cost: 0, canFulfill: false };
  let remaining = qtyNeeded;
  let totalCost = 0;
  for (const batch of data.batches) {
    if (remaining <= 0) break;
    const used = Math.min(remaining, batch.qtySisa);
    totalCost += used * batch.hargaBeli;
    remaining -= used;
  }
  return { cost: totalCost, canFulfill: remaining <= 0.0001 };
}

// FIFO: Kurangi stok secara FIFO, return stok baru
function deductFifo(stok, bahanId, qtyNeeded) {
  const data = stok[bahanId];
  if (!data) return stok;
  let remaining = qtyNeeded;
  const newBatches = data.batches.map((b) => {
    if (remaining <= 0) return b;
    const used = Math.min(remaining, b.qtySisa);
    remaining -= used;
    return { ...b, qtySisa: parseFloat((b.qtySisa - used).toFixed(4)) };
  }).filter((b) => b.qtySisa > 0.0001);
  return { ...stok, [bahanId]: { batches: newBatches } };
}

function loadFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function ScmProvider({ children }) {
  const [stok, setStok] = useState(STOK_INITIAL);
  const [purchaseOrders, setPurchaseOrders] = useState(PURCHASE_ORDERS_INITIAL);
  const [pesanan, setPesanan] = useState(PESANAN_INITIAL);
  const [wasteLog, setWasteLog] = useState(WASTE_INITIAL);
  const [hydrated, setHydrated] = useState(false);

  // Load dari localStorage saat pertama kali mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      if (saved.stok) setStok(saved.stok);
      if (saved.purchaseOrders) setPurchaseOrders(saved.purchaseOrders);
      if (saved.pesanan) setPesanan(saved.pesanan);
      if (saved.wasteLog) setWasteLog(saved.wasteLog);
    }
    setHydrated(true);
  }, []);

  // Simpan ke localStorage setiap kali state berubah
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage({ stok, purchaseOrders, pesanan, wasteLog });
  }, [stok, purchaseOrders, pesanan, wasteLog, hydrated]);

  // Buat PO Baru
  const createPurchaseOrder = useCallback((po) => {
    setPurchaseOrders((prev) => [po, ...prev]);
  }, []);

  // Update status PO (draft → dikirim → diterima)
  const updatePOStatus = useCallback((poId, status) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status, tanggalKirim: status === 'dikirim' ? new Date().toISOString().slice(0, 10) : po.tanggalKirim } : po))
    );
  }, []);

  // Konfirmasi penerimaan inbound → update PO status + tambah batch ke stok
  const confirmInbound = useCallback((poId, approvedItems, rejectedItems) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    let newStok = { ...stok };
    const today = new Date().toISOString().slice(0, 10);
    const timestamp = Date.now();

    // Tambahkan batch baru untuk setiap item yang disetujui
    approvedItems.forEach((item) => {
      if (!newStok[item.bahanId]) {
        newStok[item.bahanId] = { batches: [] };
      }
      const newBatch = {
        batchId: `BCH-${poId}-${item.bahanId}-${timestamp}`,
        poId,
        tanggalMasuk: today,
        hargaBeli: item.hargaPerUnit,
        qtyAwal: item.qty,
        qtySisa: item.qty,
      };
      newStok[item.bahanId] = {
        batches: [...newStok[item.bahanId].batches, newBatch],
      };
    });

    setStok(newStok);

    // Tambah item rejected ke waste log
    if (rejectedItems.length > 0) {
      const newWastes = rejectedItems.map((item, i) => ({
        id: `W-${timestamp}-${i}`,
        tanggal: today,
        bahanId: item.bahanId,
        nama: item.nama,
        qty: item.qty,
        satuan: item.satuan,
        alasan: item.alasanTolak || 'Ditolak saat QC',
        hargaBeli: item.hargaPerUnit,
        nilaiKerugian: item.qty * item.hargaPerUnit,
      }));
      setWasteLog((prev) => [...newWastes, ...prev]);
    }

    // Update status PO menjadi diterima
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: 'diterima' } : po))
    );
  }, [stok, purchaseOrders]);

  // Proses pesanan dari POS — kurangi stok FIFO, hitung HPP
  const processPesanan = useCallback((cartItems) => {
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const waktu = now.toTimeString().slice(0, 5);
    const timestamp = Date.now();

    let newStok = { ...stok };
    let totalHarga = 0;
    let totalHPP = 0;

    const orderItems = cartItems.map((cartItem) => {
      const menu = MENU.find((m) => m.id === cartItem.menuId);
      let itemHPP = 0;

      // Hitung HPP dan kurangi stok untuk setiap bahan dalam resep
      menu.resep.forEach((bahan) => {
        const qtyNeeded = bahan.qty * cartItem.qty;
        const { cost } = calcFifoCost(newStok, bahan.bahanId, qtyNeeded);
        itemHPP += cost;
        newStok = deductFifo(newStok, bahan.bahanId, qtyNeeded);
      });

      totalHarga += menu.hargaJual * cartItem.qty;
      totalHPP += itemHPP;

      return {
        menuId: cartItem.menuId,
        nama: menu.nama,
        qty: cartItem.qty,
        hargaJual: menu.hargaJual,
        hpp: parseFloat(itemHPP.toFixed(0)),
      };
    });

    const newOrder = {
      id: `ORD-${String(timestamp).slice(-4)}`,
      tanggal: today,
      waktu,
      tipe: cartItems.tipe || 'Dine-in',
      meja: cartItems.meja || 'Meja 1',
      items: orderItems,
      status: 'selesai',
      totalHarga: parseFloat(totalHarga.toFixed(0)),
      totalHPP: parseFloat(totalHPP.toFixed(0)),
    };

    setStok(newStok);
    setPesanan((prev) => [newOrder, ...prev]);
    return newOrder;
  }, [stok]);

  // Tambah waste manual
  const addWaste = useCallback((wasteItem) => {
    setWasteLog((prev) => [wasteItem, ...prev]);
  }, []);

  // Reset ke data awal (untuk demo ulang)
  const resetData = useCallback(() => {
    setStok(STOK_INITIAL);
    setPurchaseOrders(PURCHASE_ORDERS_INITIAL);
    setPesanan(PESANAN_INITIAL);
    setWasteLog(WASTE_INITIAL);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Helper: total stok per bahan
  const getTotalStok = useCallback((bahanId) => {
    const data = stok[bahanId];
    if (!data) return 0;
    return parseFloat(calcTotalQty(data.batches).toFixed(4));
  }, [stok]);

  const value = {
    stok, purchaseOrders, pesanan, wasteLog,
    BAHAN_BAKU, MENU,
    createPurchaseOrder, updatePOStatus, confirmInbound,
    processPesanan, addWaste, resetData,
    getTotalStok, calcFifoCost,
    hydrated,
  };

  return <ScmContext.Provider value={value}>{children}</ScmContext.Provider>;
}

export function useScm() {
  const ctx = useContext(ScmContext);
  if (!ctx) throw new Error("useScm must be used inside ScmProvider");
  return ctx;
}
