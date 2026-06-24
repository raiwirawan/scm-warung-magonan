"use client";

import { useState } from "react";
import { SUPPLIERS, PRICE_HISTORY } from "@/data/mockData";
import styles from "./page.module.css";

const fmtRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function PemasokPage() {
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nama: "", kontak: "", komoditas: "", alamat: "" });

  const handleSave = () => {
    alert(`Pemasok "${formData.nama}" telah ditambahkan! (Simulasi)`);
    setShowForm(false);
    setFormData({ nama: "", kontak: "", komoditas: "", alamat: "" });
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h3 className={styles.sectionTitle}>{SUPPLIERS.length} Pemasok Terdaftar</h3>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>
          + Tambah Pemasok
        </button>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Tambah Pemasok Baru</h3>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.label}>Nama Pemasok</label>
                <input className={styles.input} placeholder="Contoh: Pak Suwardi Telur" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>No. Telepon</label>
                <input className={styles.input} placeholder="08xxxxxxxxxx" value={formData.kontak} onChange={(e) => setFormData({ ...formData, kontak: e.target.value })} />
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>Komoditas</label>
                <input className={styles.input} placeholder="Telur, Susu" value={formData.komoditas} onChange={(e) => setFormData({ ...formData, komoditas: e.target.value })} />
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>Alamat / Pasar</label>
                <input className={styles.input} placeholder="Pasar Sanglah" value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowForm(false)}>Batal</button>
              <button className={styles.btnPrimary} onClick={handleSave}>Simpan Pemasok</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.layout}>
        {/* Supplier Table */}
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NAMA PEMASOK</th>
                <th>KOMODITAS</th>
                <th>KONTAK</th>
                <th>ALAMAT</th>
                <th>RATING</th>
                <th>TOTAL PO</th>
              </tr>
            </thead>
            <tbody>
              {SUPPLIERS.map((s) => (
                <tr
                  key={s.id}
                  className={selected?.id === s.id ? styles.rowSelected : styles.row}
                  onClick={() => setSelected(s)}
                >
                  <td className={styles.nameCell}>
                    <div className={styles.supplierAvatar}>
                      {s.nama.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.supplierName}>{s.nama}</div>
                      <div className={styles.supplierId}>{s.id}</div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.tagRow}>
                      {s.komoditas.map((k) => (
                        <span key={k} className={styles.tag}>{k}</span>
                      ))}
                    </div>
                  </td>
                  <td className={styles.contactCell}>📞 {s.kontak}</td>
                  <td className={styles.muted}>{s.alamat}</td>
                  <td>
                    <div className={styles.ratingRow}>
                      <span className={styles.star}>★</span>
                      <span className={styles.ratingVal}>{s.rating}</span>
                    </div>
                  </td>
                  <td className={styles.bold}>{s.totalOrder}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Price History Panel */}
        {selected && (
          <div className={styles.historyCard}>
            <div className={styles.historyHeader}>
              <div className={styles.historyAvatar}>{selected.nama.charAt(0)}</div>
              <div>
                <h3 className={styles.historyName}>{selected.nama}</h3>
                <p className={styles.historySub}>{selected.alamat}</p>
              </div>
            </div>

            <div className={styles.historySection}>
              <p className={styles.historyTitle}>Riwayat Harga — Cabai Rawit Merah</p>
              {selected.id === "S001" && PRICE_HISTORY["B003"] ? (
                <div className={styles.priceHistory}>
                  {PRICE_HISTORY["B003"].map((h, i, arr) => {
                    const prev = arr[i - 1];
                    const diff = prev ? h.harga - prev.harga : 0;
                    return (
                      <div key={h.poId} className={styles.priceRow}>
                        <div className={styles.priceDate}>{h.tanggal}</div>
                        <div className={styles.priceAmount}>{fmtRp(h.harga)}<span className={styles.priceUnit}>/Kg</span></div>
                        {diff !== 0 && (
                          <span className={diff > 0 ? styles.priceUp : styles.priceDown}>
                            {diff > 0 ? "▲" : "▼"} {fmtRp(Math.abs(diff))}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div className={styles.priceNote}>
                    ⚠️ Harga cabai naik <strong>+Rp 6.000/kg</strong> dalam 1 bulan terakhir. Pertimbangkan penyesuaian harga menu.
                  </div>
                </div>
              ) : (
                <p className={styles.muted} style={{ marginTop: "12px" }}>Belum ada riwayat harga untuk pemasok ini.</p>
              )}
            </div>

            <button className={styles.btnPrimaryFull} onClick={() => window.location.href = "/pembelian"}>
              🛒 Buat PO ke Pemasok Ini
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
