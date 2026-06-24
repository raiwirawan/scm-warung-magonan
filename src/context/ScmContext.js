"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ScmContext = createContext();

export function ScmProvider({ children }) {
  // Global States
  const [BAHAN_BAKU, setBahanBaku] = useState([]);
  const [SUPPLIERS, setSuppliers] = useState([]);
  const [MENU, setMenu] = useState([]);
  const [PRICE_HISTORY, setPriceHistory] = useState({});
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [pesanan, setPesanan] = useState([]);
  const [wasteLog, setWasteLog] = useState([]);
  const [stok, setStok] = useState({});

  const [isLoaded, setIsLoaded] = useState(false);

  // Helper to re-fetch all state from backend
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (res.ok) {
        setBahanBaku(data.BAHAN_BAKU || []);
        setSuppliers(data.SUPPLIERS || []);
        setMenu(data.MENU || []);
        setPriceHistory(data.PRICE_HISTORY || {});
        setPurchaseOrders(data.purchaseOrders || []);
        setPesanan(data.pesanan || []);
        setWasteLog(data.wasteLog || []);
        setStok(data.stok || {});
        setIsLoaded(true);
      }
    } catch (err) {
      console.error("Failed to fetch state:", err);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const getTotalStok = (bahanId) => {
    const s = stok[bahanId];
    if (!s || !s.batches) return 0;
    return s.batches.reduce((sum, b) => sum + b.qtySisa, 0);
  };

  const createPurchaseOrder = async (po) => {
    // Optimistic update
    setPurchaseOrders((prev) => [po, ...prev]);
    try {
      await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(po)
      });
      fetchState(); // sync
    } catch (err) {
      console.error(err);
    }
  };

  const updatePOStatus = async (poId, status) => {
    // Optimistic
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === poId) {
          return { ...po, status, tanggalKirim: status === "dikirim" ? new Date().toISOString().slice(0, 10) : po.tanggalKirim };
        }
        return po;
      })
    );
    try {
      await fetch('/api/purchase-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poId, status })
      });
      fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmInbound = async (poId, approved, rejected) => {
    // Optimistic (just remove PO from pending)
    setPurchaseOrders((prev) => prev.map(po => po.id === poId ? { ...po, status: 'diterima' } : po));
    try {
      await fetch('/api/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poId, approved, rejected })
      });
      fetchState(); // Important: fetch to get new batches and waste logs
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate calc without deducting for UI popups
  const calcFifoCost = (tempStok, bahanId, qtyNeeded) => {
    let cost = 0;
    let sisa = qtyNeeded;
    const batches = tempStok[bahanId]?.batches || [];
    
    for (let batch of batches) {
      if (sisa <= 0) break;
      const take = Math.min(batch.qtySisa, sisa);
      cost += take * batch.hargaBeli;
      sisa -= take;
      // update temp
      batch.qtySisa -= take;
    }
    return { cost, canFulfill: sisa <= 0.001 };
  };

  const processPesanan = async (cartItemsArray) => {
    // cartItemsArray has .tipe and .meja attached from PesananPage
    const cartItems = [...cartItemsArray];
    const tipe = cartItemsArray.tipe || 'Dine-in';
    const meja = cartItemsArray.meja || '-';
    
    try {
      const res = await fetch('/api/pesanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, tipe, meja })
      });
      if (!res.ok) {
        const d = await res.json();
        alert("Error: " + d.error);
        return;
      }
      fetchState(); // sync stock and pesanan list
    } catch (err) {
      console.error(err);
    }
  };

  const resetData = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoaded) return null;

  return (
    <ScmContext.Provider
      value={{
        BAHAN_BAKU,
        SUPPLIERS,
        MENU,
        PRICE_HISTORY,
        purchaseOrders,
        pesanan,
        wasteLog,
        stok,
        getTotalStok,
        createPurchaseOrder,
        updatePOStatus,
        confirmInbound,
        calcFifoCost,
        processPesanan,
        resetData,
      }}
    >
      {children}
    </ScmContext.Provider>
  );
}

export function useScm() {
  return useContext(ScmContext);
}
