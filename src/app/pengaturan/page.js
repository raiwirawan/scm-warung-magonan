"use client";

import styles from "./page.module.css";
import { useScm } from "@/context/ScmContext";

export default function PengaturanPage() {
  const { resetData } = useScm();
  
  return (
    <div className={styles.page}>
      <div className={styles.settingsGrid}>
        
        {/* Profil Warung */}
        <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
                <div className={styles.iconBox}>🏪</div>
                <div>
                    <h3 className={styles.cardTitle}>Profil Warung</h3>
                    <p className={styles.cardDesc}>Informasi dasar cabang atau restoran.</p>
                </div>
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Nama Warung / Cabang</label>
                <input className={styles.input} type="text" defaultValue="Warung Magonan - Pusat" />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Alamat Lengkap</label>
                <textarea className={styles.textarea} rows={2} defaultValue="Jl. Raya Sanglah No. 45, Denpasar" />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Kontak Manager</label>
                <input className={styles.input} type="text" defaultValue="081234567890" />
            </div>
            <button className={styles.btnSave}>Simpan Perubahan</button>
        </div>

        {/* Notifikasi & Alert */}
        <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
                <div className={styles.iconBox}>🔔</div>
                <div>
                    <h3 className={styles.cardTitle}>Notifikasi SCM</h3>
                    <p className={styles.cardDesc}>Atur peringatan stok dan pengadaan.</p>
                </div>
            </div>
            <div className={styles.toggleRow}>
                <div>
                    <div className={styles.toggleTitle}>Alert Stok Menipis</div>
                    <div className={styles.toggleDesc}>Peringatan jika stok &lt;= minimum stok</div>
                </div>
                <label className={styles.toggle}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                </label>
            </div>
            <div className={styles.toggleRow}>
                <div>
                    <div className={styles.toggleTitle}>Alert PO Telat</div>
                    <div className={styles.toggleDesc}>Notifikasi jika Pemasok telat kirim barang</div>
                </div>
                <label className={styles.toggle}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                </label>
            </div>
            <div className={styles.toggleRow}>
                <div>
                    <div className={styles.toggleTitle}>Email Harian Laporan</div>
                    <div className={styles.toggleDesc}>Kirim rekap omzet & waste otomatis</div>
                </div>
                <label className={styles.toggle}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                </label>
            </div>
            <button className={styles.btnSave}>Simpan Preferensi</button>
        </div>

        {/* Integrasi / Lanjutan */}
        <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
                <div className={styles.iconBox}>⚙️</div>
                <div>
                    <h3 className={styles.cardTitle}>Sistem & Integrasi</h3>
                    <p className={styles.cardDesc}>Pengaturan lanjutan SCM.</p>
                </div>
            </div>
            <div className={styles.settingItem}>
                <div className={styles.settingText}>
                    <strong>Metode Valuasi Stok</strong>
                    <p>Sistem saat ini dikunci menggunakan First-In-First-Out (FIFO) untuk akurasi HPP restoran.</p>
                </div>
                <span className={styles.badgeInfo}>FIFO (Locked)</span>
            </div>
            <div className={styles.settingItem}>
                <div className={styles.settingText}>
                    <strong>Reset Data Demo</strong>
                    <p>Hapus semua transaksi, kembali ke mock data awal (Database SQLite).</p>
                </div>
                <button className={styles.btnDanger} onClick={() => {
                    if (confirm("Reset seluruh data di database?")) {
                        resetData();
                        alert("Database telah direset.");
                    }
                }}>Reset Database</button>
            </div>
        </div>

      </div>
    </div>
  );
}
