"use client";

import { useState } from "react";
import { useScm } from "@/context/ScmContext";
import styles from "./page.module.css";

const fmtRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function InventarisPage() {
  const { stok, BAHAN_BAKU, getTotalStok } = useScm();
  const [selectedBahan, setSelectedBahan] = useState(null);
  const [search, setSearch] = useState("");
  const [filterKat, setFilterKat] = useState("semua");

  const kategori = ["semua", ...new Set(BAHAN_BAKU.map((b) => b.kategori))];

  const filtered = BAHAN_BAKU.filter((b) => {
    const qty = getTotalStok(b.id);
    const matchSearch = b.nama.toLowerCase().includes(search.toLowerCase());
    const matchKat = filterKat === "semua" || b.kategori === filterKat;
    return matchSearch && matchKat;
  });

  const getStatus = (b) => {
    const qty = getTotalStok(b.id);
    if (qty <= 0) return { label: "HABIS", cls: "statusHabis" };
    if (qty <= b.minStok) return { label: "MENIPIS", cls: "statusMenipis" };
    return { label: "AMAN", cls: "statusAman" };
  };

  const bahanSelected = selectedBahan ? BAHAN_BAKU.find((b) => b.id === selectedBahan) : null;
  const batchData = selectedBahan ? (stok[selectedBahan]?.batches || []) : [];
  const selectedQty = getTotalStok(selectedBahan || "");

  // Hitung nilai total stok terpilih (FIFO price weighted)
  const nilaiTotal = batchData.reduce((s, b) => s + b.qtySisa * b.hargaBeli, 0);

  // Total nilai stok keseluruhan
  const totalNilaiGudang = BAHAN_BAKU.reduce((sum, b) => {
    const batches = stok[b.id]?.batches || [];
    return sum + batches.reduce((s, bt) => s + bt.qtySisa * bt.hargaBeli, 0);
  }, 0);

  return (
    <div className={styles.page}>
      {/* Summary bar */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Item Terdaftar</span>
          <span className={styles.summaryValue}>{BAHAN_BAKU.length} Bahan</span>
        </div>
        <div className={styles.summaryDivider}></div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Stok Menipis</span>
          <span className={styles.summaryValueAlert}>{BAHAN_BAKU.filter((b) => { const q = getTotalStok(b.id); return q > 0 && q <= b.minStok; }).length} Item</span>
        </div>
        <div className={styles.summaryDivider}></div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Stok Habis</span>
          <span className={styles.summaryValueAlert}>{BAHAN_BAKU.filter((b) => getTotalStok(b.id) <= 0).length} Item</span>
        </div>
        <div className={styles.summaryDivider}></div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Estimasi Nilai Gudang</span>
          <span className={styles.summaryValue}>{fmtRp(totalNilaiGudang)}</span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left: table */}
        <div className={styles.leftPanel}>
          <div className={styles.filterBar}>
            <input
              className={styles.searchInput}
              placeholder="🔍 Cari bahan baku..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className={styles.selectFilter} value={filterKat} onChange={(e) => setFilterKat(e.target.value)}>
              {kategori.map((k) => (
                <option key={k} value={k}>{k === "semua" ? "Semua Kategori" : k}</option>
              ))}
            </select>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>BAHAN BAKU</th>
                  <th>KATEGORI</th>
                  <th>STOK TERSEDIA</th>
                  <th>MIN. STOK</th>
                  <th>BATCH</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const qty = getTotalStok(b.id);
                  const batches = stok[b.id]?.batches || [];
                  const st = getStatus(b);
                  return (
                    <tr
                      key={b.id}
                      className={`${styles.row} ${selectedBahan === b.id ? styles.rowSelected : ""}`}
                      onClick={() => setSelectedBahan(b.id === selectedBahan ? null : b.id)}
                    >
                      <td className={styles.bahanName}>{b.nama}</td>
                      <td><span className={styles.katTag}>{b.kategori}</span></td>
                      <td className={styles.qtyCell}>
                        <strong>{qty.toFixed(qty < 10 ? 1 : 0)}</strong> {b.satuan}
                      </td>
                      <td className={styles.muted}>{b.minStok} {b.satuan}</td>
                      <td className={styles.batchCount}>{batches.length}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[st.cls]}`}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: FIFO Batch Detail */}
        <div className={styles.rightPanel}>
          {!bahanSelected ? (
            <div className={styles.emptyDetail}>
              <div style={{ fontSize: "40px" }}>📦</div>
              <p>Klik bahan baku untuk melihat detail batch FIFO</p>
            </div>
          ) : (
            <>
              <div className={styles.detailHeader}>
                <div>
                  <h3 className={styles.detailName}>{bahanSelected.nama}</h3>
                  <p className={styles.detailMeta}>{bahanSelected.kategori} • Min. stok: {bahanSelected.minStok} {bahanSelected.satuan}</p>
                </div>
                <div className={styles.detailTotal}>
                  <div className={styles.detailQty}>{selectedQty.toFixed(2)} {bahanSelected.satuan}</div>
                  <div className={styles.detailNilai}>Nilai: {fmtRp(nilaiTotal)}</div>
                </div>
              </div>

              <div className={styles.batchSection}>
                <h4 className={styles.batchTitle}>📦 Detail Batch (FIFO Order)</h4>
                <p className={styles.batchNote}>Batch pertama di atas akan digunakan terlebih dahulu saat masak.</p>
                <div className={styles.batchList}>
                  {batchData.length === 0 ? (
                    <div className={styles.emptyBatch}>Stok kosong — tidak ada batch aktif</div>
                  ) : (
                    batchData.map((bt, idx) => (
                      <div key={bt.batchId} className={`${styles.batchItem} ${idx === 0 ? styles.batchItemFirst : ""}`}>
                        <div className={styles.batchOrder}>{idx + 1}</div>
                        <div className={styles.batchInfo}>
                          <div className={styles.batchId}>{bt.batchId}</div>
                          <div className={styles.batchPO}>PO: {bt.poId} • Masuk: {bt.tanggalMasuk}</div>
                        </div>
                        <div className={styles.batchRight}>
                          <div className={styles.batchQty}>{bt.qtySisa.toFixed(2)} {bahanSelected.satuan}</div>
                          <div className={styles.batchPrice}>{fmtRp(bt.hargaBeli)}/{bahanSelected.satuan}</div>
                          <div className={styles.batchNilai}>{fmtRp(bt.qtySisa * bt.hargaBeli)}</div>
                        </div>
                        {idx === 0 && <div className={styles.nextLabel}>NEXT OUT</div>}
                      </div>
                    ))
                  )}
                </div>

                {batchData.length > 1 && (
                  <div className={styles.fifoNote}>
                    💡 <strong>FIFO Active:</strong> Terdapat {batchData.length} batch dengan harga beli berbeda.
                    Harga pokok produksi (HPP) dihitung berdasarkan harga batch yang paling lama masuk.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
