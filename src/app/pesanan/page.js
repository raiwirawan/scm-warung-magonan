"use client";

import { useState } from "react";
import { useScm } from "@/context/ScmContext";
import styles from "./page.module.css";

const fmtRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function PesananPage() {
  const { MENU, processPesanan, calcFifoCost, stok, pesanan } = useScm();
  const [cart, setCart] = useState([]);
  const [tipe, setTipe] = useState("Dine-in");
  const [meja, setMeja] = useState("Meja 1");
  const [showSimulasi, setShowSimulasi] = useState(false);
  const [simulasiData, setSimulasiData] = useState([]);

  // Filter out recent orders for the UI
  const recentOrders = pesanan.slice(0, 3);

  const getStokBahan = (bahanId) => {
    if (!stok || !stok[bahanId] || !stok[bahanId].batches) return 0;
    return stok[bahanId].batches.reduce((sum, batch) => sum + batch.qtySisa, 0);
  };

  const addToCart = (menu) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.menuId === menu.id);
      if (exist) {
        return prev.map((item) => (item.menuId === menu.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { menuId: menu.id, nama: menu.nama, hargaJual: menu.hargaJual, qty: 1, resep: menu.resep }];
    });
  };

  const updateQty = (menuId, delta) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.menuId === menuId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      }).filter((item) => item.qty > 0);
    });
  };

  const totalHarga = cart.reduce((s, item) => s + item.hargaJual * item.qty, 0);

  // Check if we can fulfill the order and calculate simulated HPP
  const checkBahan = () => {
    let canFulfill = true;
    let totalHPP = 0;
    const simulasi = [];

    // Clone stock for simulation
    let tempStok = JSON.parse(JSON.stringify(stok));

    cart.forEach((cartItem) => {
      let itemHPP = 0;
      cartItem.resep.forEach((bahan) => {
        const qtyNeeded = bahan.qty * cartItem.qty;
        // This is a simplified simulation for UI purposes
        const res = calcFifoCost(tempStok, bahan.bahanId, qtyNeeded);
        itemHPP += res.cost;
        if (!res.canFulfill) canFulfill = false;
      });
      totalHPP += itemHPP;
      simulasi.push({
        nama: cartItem.nama,
        qty: cartItem.qty,
        hpp: itemHPP,
        hargaJual: cartItem.hargaJual * cartItem.qty,
        margin: (cartItem.hargaJual * cartItem.qty) - itemHPP
      });
    });

    return { canFulfill, totalHPP, simulasi };
  };

  const handleProses = () => {
    if (cart.length === 0) return;

    const { canFulfill, simulasi } = checkBahan();

    if (!canFulfill) {
      alert("⚠️ Gagal: Stok bahan baku tidak mencukupi untuk pesanan ini. Silakan cek inventaris.");
      return;
    }

    setSimulasiData(simulasi);
    setShowSimulasi(true);
  };

  const confirmPesanan = () => {
    processPesanan(cart); // Note: processPesanan logic in ScmContext handles 'tipe' & 'meja' if added to cart, but actually the context takes (cartItems) and looks at cartItems.tipe. Wait, processPesanan in ScmContext takes `cartItems` and uses `cartItems.tipe` which is wrong since it's an array. 
    // I need to pass it properly or just let the ScmContext use defaults. I will fix processPesanan in context or just pass it as an object { items: cart, tipe, meja }. Let's just fix it by passing { cart, tipe, meja } if needed. Ah, the context expects an array but reads .tipe off it. I'll pass an array with those properties attached.
    const cartArray = [...cart];
    cartArray.tipe = tipe;
    cartArray.meja = meja;
    processPesanan(cartArray);
    
    setCart([]);
    setShowSimulasi(false);
    alert("✅ Pesanan berhasil diproses! Stok bahan baku telah dipotong.");
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* Left Panel: Menu Grid */}
        <div className={styles.leftPanel}>
          <div className={styles.header}>
            <h2 className={styles.title}>Menu Warung</h2>
            <p className={styles.subtitle}>Pilih menu untuk ditambahkan ke pesanan</p>
          </div>

          <div className={styles.menuGrid}>
            {MENU.map((menu) => (
              <div key={menu.id} className={styles.menuCard} onClick={() => addToCart(menu)}>
                <div className={styles.menuEmoji}>{menu.emoji}</div>
                <div className={styles.menuInfo}>
                  <div className={styles.menuName}>{menu.nama}</div>
                  <div className={styles.menuPrice}>{fmtRp(menu.hargaJual)}</div>
                </div>
                
                {/* Ingredients List */}
                <div className={styles.menuIngredients}>
                  <div className={styles.ingredientsTitle}>Bahan Baku & Stok:</div>
                  {menu.resep.map((bahan) => {
                    const availStock = getStokBahan(bahan.bahanId);
                    const isShort = availStock < bahan.qty;
                    return (
                      <div key={bahan.bahanId} className={`${styles.ingredientItem} ${isShort ? styles.shortStock : ""}`}>
                        <span className={styles.ingName}>{bahan.nama}</span>
                        <span className={styles.ingQty}>
                          {bahan.qty} {bahan.satuan}
                          <span className={styles.ingAvail}> (Stok: {availStock.toFixed(1)})</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Recent Orders below Menu Grid */}
          <div className={styles.recentOrdersSection}>
              <h3 className={styles.recentOrdersTitle}>Pesanan Terakhir</h3>
              <div className={styles.recentOrdersList}>
                  {recentOrders.map(order => (
                      <div key={order.id} className={styles.recentOrderCard}>
                          <div className={styles.roHeader}>
                              <span className={styles.roId}>{order.id}</span>
                              <span className={styles.roType}>{order.tipe} - {order.meja}</span>
                          </div>
                          <div className={styles.roItems}>
                              {order.items.map((it, idx) => (
                                  <span key={idx}>{it.qty}x {it.nama}{idx < order.items.length - 1 ? ', ' : ''}</span>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        </div>

        {/* Right Panel: Cart */}
        <div className={styles.rightPanel}>
          <div className={styles.cartHeader}>
            <h2 className={styles.cartTitle}>Pesanan Saat Ini</h2>
            <div className={styles.orderOptions}>
              <select className={styles.select} value={tipe} onChange={(e) => setTipe(e.target.value)}>
                <option value="Dine-in">Dine-in</option>
                <option value="Takeaway">Takeaway</option>
              </select>
              {tipe === "Dine-in" && (
                <select className={styles.select} value={meja} onChange={(e) => setMeja(e.target.value)}>
                  <option value="Meja 1">Meja 1</option>
                  <option value="Meja 2">Meja 2</option>
                  <option value="Meja 3">Meja 3</option>
                  <option value="Meja 4">Meja 4</option>
                </select>
              )}
            </div>
          </div>

          <div className={styles.cartItems}>
            {cart.length === 0 ? (
              <div className={styles.emptyCart}>
                <div className={styles.emptyEmoji}>🍽️</div>
                <p>Belum ada menu yang dipilih</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.menuId} className={styles.cartItem}>
                  <div className={styles.cartItemInfo}>
                    <div className={styles.cartItemName}>{item.nama}</div>
                    <div className={styles.cartItemPrice}>{fmtRp(item.hargaJual * item.qty)}</div>
                  </div>
                  <div className={styles.qtyControl}>
                    <button className={styles.qtyBtn} onClick={() => updateQty(item.menuId, -1)}>-</button>
                    <span className={styles.qtyValue}>{item.qty}</span>
                    <button className={styles.qtyBtn} onClick={() => updateQty(item.menuId, 1)}>+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.cartFooter}>
            <div className={styles.totalRow}>
              <span>Total Pesanan</span>
              <span className={styles.totalAmount}>{fmtRp(totalHarga)}</span>
            </div>
            <button
              className={`${styles.btnProses} ${cart.length === 0 ? styles.btnDisabled : ""}`}
              onClick={handleProses}
              disabled={cart.length === 0}
            >
              Proses Pesanan
            </button>
          </div>
        </div>
      </div>

      {/* Simulasi Modal */}
      {showSimulasi && (
        <div className={styles.modalOverlay} onClick={() => setShowSimulasi(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Konfirmasi Proses & Analisis HPP</h3>
              <button className={styles.closeBtn} onClick={() => setShowSimulasi(false)}>✕</button>
            </div>
            
            <div className={styles.simulasiContent}>
              <p className={styles.simulasiInfo}>
                Sistem mendeteksi bahwa pesanan ini akan menggunakan bahan baku dari batch stok gudang (FIFO):
              </p>
              
              <table className={styles.simTable}>
                <thead>
                  <tr>
                    <th>MENU</th>
                    <th>QTY</th>
                    <th>HPP (Cost)</th>
                    <th>HARGA JUAL</th>
                    <th>MARGIN</th>
                  </tr>
                </thead>
                <tbody>
                  {simulasiData.map((sim, idx) => (
                    <tr key={idx}>
                      <td>{sim.nama}</td>
                      <td>{sim.qty}</td>
                      <td className={styles.colCost}>{fmtRp(sim.hpp)}</td>
                      <td>{fmtRp(sim.hargaJual)}</td>
                      <td className={styles.colMargin}>{fmtRp(sim.margin)} ({(sim.margin/sim.hargaJual*100).toFixed(0)}%)</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" className={styles.tfootLabel}>Total</td>
                    <td className={styles.colCost}>{fmtRp(simulasiData.reduce((s,i) => s + i.hpp, 0))}</td>
                    <td className={styles.colTotalJual}>{fmtRp(totalHarga)}</td>
                    <td className={styles.colMargin}>{fmtRp(simulasiData.reduce((s,i) => s + i.margin, 0))}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div className={styles.warningBox}>
                ⚠️ Melanjutkan aksi ini akan otomatis memotong stok bahan baku dari Inventaris Gudang.
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowSimulasi(false)}>Batal</button>
              <button className={styles.btnConfirm} onClick={confirmPesanan}>✅ Masak & Potong Stok</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
