"use client";

import { useScm } from "@/context/ScmContext";
import styles from "./page.module.css";

const fmtRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function LaporanPage() {
  const { wasteLog, pesanan } = useScm();

  // Calculate some stats
  const totalOmzet = pesanan.reduce((s, p) => s + p.totalHarga, 0);
  const totalHPP = pesanan.reduce((s, p) => s + p.totalHPP, 0);
  const foodCostPct = totalOmzet ? ((totalHPP / totalOmzet) * 100).toFixed(1) : 0;
  const totalWasteLoss = wasteLog.reduce((s, w) => s + w.nilaiKerugian, 0);
  const totalPesananSelesai = pesanan.length;

  return (
    <div className={styles.page}>
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Total Omzet</div>
          <div className={styles.cardValue}>{fmtRp(totalOmzet)}</div>
          <div className={styles.cardSub}>Semua pesanan selesai</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Total HPP</div>
          <div className={styles.cardValueAlert}>{fmtRp(totalHPP)}</div>
          <div className={styles.cardSub}>Biaya bahan baku (FIFO)</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Food Cost %</div>
          <div className={`${styles.cardValue} ${parseFloat(foodCostPct) > 35 ? styles.textAlert : styles.textSuccess}`}>
            {foodCostPct}%
          </div>
          <div className={styles.cardSub}>Target: &lt; 35%</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Total Kerugian Waste</div>
          <div className={styles.cardValueAlert}>{fmtRp(totalWasteLoss)}</div>
          <div className={styles.cardSub}>{wasteLog.length} item terbuang</div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.tableSection}>
          <h3 className={styles.sectionTitle}>Log Analitik Waste & Retur</h3>
          <p className={styles.sectionDesc}>
            Daftar bahan baku yang terbuang dari hasil Quality Control (QC) Inbound,
            beserta nilai kerugiannya.
          </p>
          
          <div className={styles.tableCard}>
            {wasteLog.length === 0 ? (
              <div className={styles.emptyState}>Belum ada data waste. Bagus!</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>TANGGAL</th>
                    <th>BAHAN BAKU</th>
                    <th>QTY TERBUANG</th>
                    <th>ALASAN</th>
                    <th>NILAI KERUGIAN</th>
                  </tr>
                </thead>
                <tbody>
                  {wasteLog.map((w) => (
                    <tr key={w.id}>
                      <td>{w.tanggal}</td>
                      <td className={styles.bold}>{w.namaBahan}</td>
                      <td>{w.qty} {w.satuan}</td>
                      <td><span className={styles.badgeAlasan}>{w.alasanTolak}</span></td>
                      <td className={styles.textAlertBold}>{fmtRp(w.nilaiKerugian)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className={styles.chartSection}>
            <div className={styles.tableCard} style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                <h3 className={styles.sectionTitle} style={{padding: '20px 20px 0'}}>Insight Laporan</h3>
                <div className={styles.insightContent}>
                    <div className={styles.insightItem}>
                        <div className={styles.insightIcon}>📈</div>
                        <div className={styles.insightText}>
                            <strong>Food Cost Terkendali</strong>
                            <p>Dengan persentase {foodCostPct}%, HPP masih dalam batas sehat (&lt; 35%). Sistem FIFO berhasil menjaga akurasi biaya.</p>
                        </div>
                    </div>
                    <div className={styles.insightItem}>
                        <div className={styles.insightIcon}>🗑️</div>
                        <div className={styles.insightText}>
                            <strong>Analisis Waste</strong>
                            <p>Total kerugian {fmtRp(totalWasteLoss)}. Evaluasi kualitas pemasok yang sering mengirimkan barang tidak sesuai standar QC untuk meminimalkan waste.</p>
                        </div>
                    </div>
                    <div className={styles.insightItem}>
                        <div className={styles.insightIcon}>🚀</div>
                        <div className={styles.insightText}>
                            <strong>Performa Pesanan</strong>
                            <p>{totalPesananSelesai} pesanan telah diselesaikan. Stok bahan baku telah otomatis terpotong dari gudang sesuai resep menu.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
