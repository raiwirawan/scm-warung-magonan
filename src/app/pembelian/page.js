"use client";

import { useState } from "react";
import { useScm } from "@/context/ScmContext";
import { SUPPLIERS, BAHAN_BAKU } from "@/data/mockData";
import styles from "./page.module.css";

const fmtRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const STATUS_CONFIG = {
  draft: { label: "Draft", cls: "statusDraft" },
  dikirim: { label: "Dikirim", cls: "statusDikirim" },
  diterima: { label: "Diterima", cls: "statusDiterima" },
};

export default function PembelianPage() {
  const { purchaseOrders, createPurchaseOrder, updatePOStatus } = useScm();
  const [showForm, setShowForm] = useState(false);
  const [expandedPO, setExpandedPO] = useState(null);
  const [filterStatus, setFilterStatus] = useState("semua");

  // Form state
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [catatan, setCatatan] = useState("");
  const [items, setItems] = useState([{ bahanId: "", nama: "", qty: 1, hargaPerUnit: 0, satuan: "" }]);

  const addItem = () => setItems((prev) => [...prev, { bahanId: "", nama: "", qty: 1, hargaPerUnit: 0, satuan: "" }]);
  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (idx, field, val) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      if (field === "bahanId") {
        const bahan = BAHAN_BAKU.find((b) => b.id === val);
        if (bahan) {
          next[idx].nama = bahan.nama;
          next[idx].satuan = bahan.satuan;
        }
      }
      return next;
    });
  };

  const totalNilai = items.reduce((s, it) => s + (it.qty * it.hargaPerUnit), 0);

  const handleSubmit = () => {
    if (!selectedSupplier || items.some((it) => !it.bahanId || it.qty <= 0 || it.hargaPerUnit <= 0)) {
      alert("Mohon lengkapi semua field sebelum menyimpan.");
      return;
    }
    const supplier = SUPPLIERS.find((s) => s.id === selectedSupplier);
    const newPO = {
      id: `PO-${Date.now().toString().slice(-6)}`,
      pemasokId: selectedSupplier,
      pemasokNama: supplier?.nama || "",
      tanggal: new Date().toISOString().slice(0, 10),
      tanggalKirim: null,
      status: "draft",
      items: items.map((it) => ({ ...it, qty: parseFloat(it.qty), hargaPerUnit: parseFloat(it.hargaPerUnit) })),
      catatan,
    };
    createPurchaseOrder(newPO);
    setShowForm(false);
    setItems([{ bahanId: "", nama: "", qty: 1, hargaPerUnit: 0, satuan: "" }]);
    setSelectedSupplier("");
    setCatatan("");
  };

  const filtered = filterStatus === "semua" ? purchaseOrders : purchaseOrders.filter((po) => po.status === filterStatus);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {["semua", "draft", "dikirim", "diterima"].map((s) => (
            <button key={s} className={`${styles.filterTab} ${filterStatus === s ? styles.filterTabActive : ""}`} onClick={() => setFilterStatus(s)}>
              {s === "semua" ? "Semua" : STATUS_CONFIG[s]?.label}
              <span className={styles.filterCount}>{s === "semua" ? purchaseOrders.length : purchaseOrders.filter((po) => po.status === s).length}</span>
            </button>
          ))}
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>
          + Buat PO Baru
        </button>
      </div>

      {/* PO List */}
      <div className={styles.poList}>
        {filtered.map((po) => {
          const totalPO = po.items.reduce((s, it) => s + it.qty * it.hargaPerUnit, 0);
          const cfg = STATUS_CONFIG[po.status];
          const isOpen = expandedPO === po.id;
          return (
            <div key={po.id} className={styles.poCard}>
              <div className={styles.poHeader} onClick={() => setExpandedPO(isOpen ? null : po.id)}>
                <div className={styles.poLeft}>
                  <div className={styles.poId}>{po.id}</div>
                  <div className={styles.poSupplier}>📦 {po.pemasokNama}</div>
                </div>
                <div className={styles.poMid}>
                  <div className={styles.poDate}>📅 {po.tanggal}</div>
                  <div className={styles.poItemCount}>{po.items.length} item bahan baku</div>
                </div>
                <div className={styles.poRight}>
                  <div className={styles.poTotal}>{fmtRp(totalPO)}</div>
                  <span className={`${styles.statusBadge} ${styles[cfg?.cls]}`}>{cfg?.label}</span>
                </div>
                <div className={styles.poChevron}>{isOpen ? "▲" : "▼"}</div>
              </div>

              {isOpen && (
                <div className={styles.poDetail}>
                  <table className={styles.itemTable}>
                    <thead>
                      <tr>
                        <th>BAHAN BAKU</th>
                        <th>QTY</th>
                        <th>HARGA / UNIT</th>
                        <th>SUBTOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {po.items.map((item) => (
                        <tr key={item.bahanId}>
                          <td className={styles.bold}>{item.nama}</td>
                          <td>{item.qty} {item.satuan}</td>
                          <td>{fmtRp(item.hargaPerUnit)}</td>
                          <td className={styles.bold}>{fmtRp(item.qty * item.hargaPerUnit)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className={styles.totalLabel}>Total Nilai PO</td>
                        <td className={styles.totalValue}>{fmtRp(totalPO)}</td>
                      </tr>
                    </tfoot>
                  </table>
                  {po.catatan && <div className={styles.poNotes}>📝 {po.catatan}</div>}
                  <div className={styles.poActions}>
                    {po.status === "draft" && (
                      <button className={styles.btnAction} onClick={() => updatePOStatus(po.id, "dikirim")}>
                        ✉️ Kirim PO ke Pemasok
                      </button>
                    )}
                    {po.status === "dikirim" && (
                      <button className={styles.btnActionGreen} onClick={() => window.location.href = "/inbound"}>
                        📋 Konfirmasi di Inbound/QC →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New PO Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Buat Purchase Order Baru</h3>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className={styles.formSection}>
              <label className={styles.label}>Pilih Pemasok</label>
              <select className={styles.select} value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
                <option value="">-- Pilih Pemasok --</option>
                {SUPPLIERS.map((s) => (
                  <option key={s.id} value={s.id}>{s.nama} — {s.komoditas.join(", ")}</option>
                ))}
              </select>
            </div>

            <div className={styles.itemsSection}>
              <div className={styles.itemsHeader}>
                <span className={styles.label}>Item Pembelian</span>
                <button className={styles.btnAddItem} onClick={addItem}>+ Tambah Item</button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className={styles.itemRow}>
                  <select
                    className={styles.selectSm}
                    value={item.bahanId}
                    onChange={(e) => updateItem(idx, "bahanId", e.target.value)}
                  >
                    <option value="">Pilih bahan...</option>
                    {BAHAN_BAKU.map((b) => (
                      <option key={b.id} value={b.id}>{b.nama}</option>
                    ))}
                  </select>
                  <input
                    className={styles.inputSm}
                    type="number"
                    placeholder="Qty"
                    value={item.qty}
                    min="0"
                    onChange={(e) => updateItem(idx, "qty", e.target.value)}
                  />
                  <span className={styles.satuanLabel}>{item.satuan || "—"}</span>
                  <input
                    className={styles.inputSm}
                    type="number"
                    placeholder="Harga/unit (Rp)"
                    value={item.hargaPerUnit || ""}
                    min="0"
                    onChange={(e) => updateItem(idx, "hargaPerUnit", e.target.value)}
                  />
                  {items.length > 1 && (
                    <button className={styles.btnRemove} onClick={() => removeItem(idx)}>✕</button>
                  )}
                </div>
              ))}
              <div className={styles.totalPO}>
                Total Nilai PO: <strong>{fmtRp(totalNilai)}</strong>
              </div>
            </div>

            <div className={styles.formSection}>
              <label className={styles.label}>Catatan (opsional)</label>
              <textarea className={styles.textarea} rows={2} placeholder="Instruksi khusus untuk pemasok..." value={catatan} onChange={(e) => setCatatan(e.target.value)} />
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowForm(false)}>Batal</button>
              <button className={styles.btnPrimary} onClick={handleSubmit}>💾 Simpan sebagai Draft</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
