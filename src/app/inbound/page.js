"use client";

import { useState } from "react";
import { useScm } from "@/context/ScmContext";
import styles from "./page.module.css";

const fmtRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const QC_CHECKS = ["Warna/Penampilan Segar", "Tekstur Baik", "Tidak Berbau Menyengat", "Berat Sesuai PO", "Kemasan Tidak Rusak"];

const ALASAN_TOLAK = ["Layu / Tidak Segar", "Bau Tidak Sedap", "Melewati Masa Pakai", "Kontaminasi", "Berat Kurang / Tidak Sesuai", "Rusak / Cacat"];

export default function InboundPage() {
  const { purchaseOrders, confirmInbound } = useScm();
  const [selectedPO, setSelectedPO] = useState(null);
  const [itemStates, setItemStates] = useState({});
  const [confirmed, setConfirmed] = useState(false);

  const pendingPOs = purchaseOrders.filter((po) => po.status === "dikirim");
  const recentPOs = purchaseOrders.filter((po) => po.status === "diterima").slice(0, 3);

  const openQC = (po) => {
    setSelectedPO(po);
    setConfirmed(false);
    const init = {};
    po.items.forEach((item) => {
      init[item.bahanId] = {
        status: "pending", // pending | terima | tolak
        checks: {},
        alasanTolak: "",
        qtyDiterima: item.qty,
      };
    });
    setItemStates(init);
  };

  const toggleCheck = (bahanId, check) => {
    setItemStates((prev) => ({
      ...prev,
      [bahanId]: {
        ...prev[bahanId],
        checks: { ...prev[bahanId].checks, [check]: !prev[bahanId].checks[check] },
      },
    }));
  };

  const setItemStatus = (bahanId, status) => {
    setItemStates((prev) => ({
      ...prev,
      [bahanId]: { ...prev[bahanId], status },
    }));
  };

  const handleConfirm = () => {
    const approved = [];
    const rejected = [];
    selectedPO.items.forEach((item) => {
      const state = itemStates[item.bahanId];
      if (state?.status === "terima") {
        approved.push({ ...item, qty: parseFloat(state.qtyDiterima) });
      } else if (state?.status === "tolak") {
        rejected.push({ ...item, alasanTolak: state.alasanTolak });
      }
    });
    confirmInbound(selectedPO.id, approved, rejected);
    setConfirmed(true);
    setTimeout(() => {
      setSelectedPO(null);
      setConfirmed(false);
    }, 2000);
  };

  const allDecided = selectedPO && selectedPO.items.every((item) => itemStates[item.bahanId]?.status !== "pending");

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* Left: List of pending POs */}
        <div className={styles.leftPanel}>
          {pendingPOs.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>✅</div>
              <h3>Tidak ada pengiriman yang menunggu</h3>
              <p>Semua Purchase Order telah dikonfirmasi.</p>
            </div>
          ) : (
            <>
              <h3 className={styles.panelTitle}>Menunggu Konfirmasi QC <span className={styles.countBadge}>{pendingPOs.length}</span></h3>
              {pendingPOs.map((po) => (
                <div
                  key={po.id}
                  className={`${styles.poCard} ${selectedPO?.id === po.id ? styles.poCardActive : ""}`}
                  onClick={() => openQC(po)}
                >
                  <div className={styles.poId}>{po.id}</div>
                  <div className={styles.poSupplier}>🚚 {po.pemasokNama}</div>
                  <div className={styles.poItems}>{po.items.length} item — Dikirim: {po.tanggalKirim}</div>
                  <div className={styles.totalNilai}>
                    {fmtRp(po.items.reduce((s, it) => s + it.qty * it.hargaPerUnit, 0))}
                  </div>
                  <div className={styles.arrowHint}>Klik untuk Mulai QC →</div>
                </div>
              ))}
            </>
          )}

          {recentPOs.length > 0 && (
            <div className={styles.recentSection}>
              <h3 className={styles.panelTitle} style={{marginTop: '8px'}}>Baru Dikonfirmasi</h3>
              {recentPOs.map((po) => (
                <div key={po.id} className={styles.poCardDone}>
                  <div className={styles.doneCheck}>✓</div>
                  <div>
                    <div className={styles.poId}>{po.id}</div>
                    <div className={styles.poSupplier}>{po.pemasokNama}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: QC Detail */}
        <div className={styles.rightPanel}>
          {!selectedPO ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <h3>Pilih PO untuk Memulai QC</h3>
              <p>Klik salah satu Purchase Order yang menunggu konfirmasi di sebelah kiri.</p>
            </div>
          ) : confirmed ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}>🎉</div>
              <h3>QC Selesai!</h3>
              <p>Bahan yang diterima telah masuk ke Gudang (Inventaris).</p>
            </div>
          ) : (
            <>
              <div className={styles.qcHeader}>
                <h3 className={styles.qcTitle}>QC Checklist — {selectedPO.id}</h3>
                <div className={styles.qcSupplier}>Pemasok: <strong>{selectedPO.pemasokNama}</strong></div>
              </div>

              <div className={styles.itemsQC}>
                {selectedPO.items.map((item) => {
                  const state = itemStates[item.bahanId] || {};
                  return (
                    <div key={item.bahanId} className={`${styles.qcItem} ${state.status === "terima" ? styles.qcItemAccepted : state.status === "tolak" ? styles.qcItemRejected : ""}`}>
                      <div className={styles.qcItemHeader}>
                        <div>
                          <div className={styles.qcItemName}>{item.nama}</div>
                          <div className={styles.qcItemMeta}>
                            {item.qty} {item.satuan} • {fmtRp(item.hargaPerUnit)}/{item.satuan} • Total: {fmtRp(item.qty * item.hargaPerUnit)}
                          </div>
                        </div>
                        <div className={styles.qcDecision}>
                          <button
                            className={`${styles.btnDecide} ${state.status === "terima" ? styles.btnAccept : styles.btnAcceptOutline}`}
                            onClick={() => setItemStatus(item.bahanId, "terima")}
                          >✓ Terima</button>
                          <button
                            className={`${styles.btnDecide} ${state.status === "tolak" ? styles.btnReject : styles.btnRejectOutline}`}
                            onClick={() => setItemStatus(item.bahanId, "tolak")}
                          >✕ Tolak</button>
                        </div>
                      </div>

                      {/* Checklist */}
                      <div className={styles.checkList}>
                        {QC_CHECKS.map((check) => (
                          <label key={check} className={styles.checkItem}>
                            <input
                              type="checkbox"
                              checked={!!state.checks?.[check]}
                              onChange={() => toggleCheck(item.bahanId, check)}
                              className={styles.checkbox}
                            />
                            <span>{check}</span>
                          </label>
                        ))}
                      </div>

                      {/* Jika diterima: edit qty */}
                      {state.status === "terima" && (
                        <div className={styles.qtyEdit}>
                          <span className={styles.qtyLabel}>Qty Diterima (aktual):</span>
                          <input
                            type="number"
                            className={styles.qtyInput}
                            value={state.qtyDiterima}
                            min="0"
                            max={item.qty}
                            onChange={(e) =>
                              setItemStates((prev) => ({
                                ...prev,
                                [item.bahanId]: { ...prev[item.bahanId], qtyDiterima: e.target.value },
                              }))
                            }
                          />
                          <span className={styles.qtyUnit}>{item.satuan}</span>
                        </div>
                      )}

                      {/* Jika ditolak: pilih alasan */}
                      {state.status === "tolak" && (
                        <div className={styles.alasanSection}>
                          <label className={styles.alasanLabel}>Alasan Penolakan:</label>
                          <select
                            className={styles.alasanSelect}
                            value={state.alasanTolak}
                            onChange={(e) =>
                              setItemStates((prev) => ({
                                ...prev,
                                [item.bahanId]: { ...prev[item.bahanId], alasanTolak: e.target.value },
                              }))
                            }
                          >
                            <option value="">Pilih alasan...</option>
                            {ALASAN_TOLAK.map((a) => <option key={a} value={a}>{a}</option>)}
                          </select>
                          <div className={styles.wasteWarning}>
                            ⚠️ Item ini akan dicatat sebagai <strong>Waste</strong> — Kerugian: <strong>{fmtRp(item.qty * item.hargaPerUnit)}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                className={`${styles.btnConfirm} ${!allDecided ? styles.btnConfirmDisabled : ""}`}
                disabled={!allDecided}
                onClick={handleConfirm}
              >
                ✅ Konfirmasi Inbound & Simpan ke Gudang
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
