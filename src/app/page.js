"use client";

import { useScm } from "@/context/ScmContext";
import Link from "next/link";
import styles from "./page.module.css";

const fmtRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
const fmtNum = (n) => new Intl.NumberFormat("id-ID").format(n);

export default function DashboardPage() {
  const { pesanan, wasteLog, BAHAN_BAKU, getTotalStok, purchaseOrders } = useScm();

  const todayPesanan = pesanan.filter((p) => p.tanggal === "2024-06-17");
  const totalOmzet = todayPesanan.reduce((s, p) => s + p.totalHarga, 0);
  const totalHPP = todayPesanan.reduce((s, p) => s + p.totalHPP, 0);
  const foodCostPct = totalOmzet > 0 ? ((totalHPP / totalOmzet) * 100).toFixed(1) : 0;
  const totalWasteLoss = wasteLog.reduce((s, w) => s + w.nilaiKerugian, 0);
  const pendingPO = purchaseOrders.filter((po) => po.status === "dikirim").length;

  const lowStockItems = BAHAN_BAKU.filter((b) => {
    const qty = getTotalStok(b.id);
    return qty <= b.minStok;
  });

  // Nilai stok gudang (simpel)
  const nilaiStok = BAHAN_BAKU.reduce((sum, b) => {
    const qty = getTotalStok(b.id);
    return sum + qty * 15000; // estimasi kasar
  }, 0);

  // Tren penjualan (simulasi 7 hari, puncak di hari ke-6 = hari ini)
  const trendData = [
    { hari: "Sen", omzet: 820000, hpp: 280000 },
    { hari: "Sel", omzet: 1150000, hpp: 390000 },
    { hari: "Rab", omzet: 940000, hpp: 310000 },
    { hari: "Kam", omzet: 1280000, hpp: 420000 },
    { hari: "Jum", omzet: 1560000, hpp: 520000 },
    { hari: "Sab", omzet: totalOmzet || 1840000, hpp: totalHPP || 610000 },
    { hari: "Min", omzet: 760000, hpp: 250000 },
  ];
  const maxOmzet = Math.max(...trendData.map((d) => d.omzet));

  return (
    <div className={styles.page}>
      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>PESANAN HARI INI</span>
            <span className={styles.kpiIcon}>🧾</span>
          </div>
          <div className={styles.kpiValue}>{fmtNum(todayPesanan.length)}</div>
          <div className={styles.kpiSub}>
            <span className={styles.trendUp}>↗ +3 dari kemarin</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>OMZET HARI INI</span>
            <span className={styles.kpiIcon}>💰</span>
          </div>
          <div className={styles.kpiValue}>{fmtRp(totalOmzet || 1840000)}</div>
          <div className={styles.kpiSub}>
            <span className={styles.trendUp}>↗ +12.4% dari kemarin</span>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${parseFloat(foodCostPct) > 35 ? styles.kpiAlert : ""}`}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>FOOD COST %</span>
            <span className={styles.kpiIcon}>📊</span>
          </div>
          <div className={styles.kpiValue}>{foodCostPct || "33.1"}%</div>
          <div className={styles.kpiSub}>
            <span className={parseFloat(foodCostPct) > 35 ? styles.trendDown : styles.trendUp}>
              {parseFloat(foodCostPct) > 35 ? "⚠ Di atas target 35%" : "✓ Di bawah target 35%"}
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>KERUGIAN WASTE</span>
            <span className={styles.kpiIcon}>🗑️</span>
          </div>
          <div className={styles.kpiValueAlert}>{fmtRp(totalWasteLoss)}</div>
          <div className={styles.kpiSub}>
            <span className={styles.trendDown}>▼ {wasteLog.length} item terbuang</span>
          </div>
        </div>
      </div>

      <div className={styles.mainRow}>
        {/* Grafik tren */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Tren Omzet vs HPP</h3>
              <p className={styles.cardSub}>7 Hari Terakhir</p>
            </div>
            <div className={styles.chartLegend}>
              <span><span className={styles.dotGreen}></span> Omzet</span>
              <span><span className={styles.dotBrown}></span> HPP</span>
            </div>
          </div>
          <div className={styles.chart}>
            {trendData.map((d, i) => {
              const isToday = i === 5;
              const heightOmzet = (d.omzet / maxOmzet) * 100;
              const heightHPP = (d.hpp / maxOmzet) * 100;
              return (
                <div key={d.hari} className={styles.barGroup}>
                  <div className={styles.barContainer}>
                    <div
                      className={`${styles.bar} ${isToday ? styles.barTodayOmzet : styles.barOmzet}`}
                      style={{ height: `${heightOmzet}%` }}
                    />
                    <div
                      className={`${styles.bar} ${isToday ? styles.barTodayHPP : styles.barHPP}`}
                      style={{ height: `${heightHPP}%` }}
                    />
                  </div>
                  <span className={isToday ? styles.barLabelActive : styles.barLabel}>{d.hari}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel kanan */}
        <div className={styles.rightPanel}>
          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className={styles.alertCard}>
              <div className={styles.alertHeader}>
                <span>⚠️ Stok Menipis</span>
                <Link href="/inventaris" className={styles.alertLink}>Lihat Semua →</Link>
              </div>
              {lowStockItems.slice(0, 3).map((b) => (
                <div key={b.id} className={styles.alertItem}>
                  <span className={styles.alertName}>{b.nama}</span>
                  <span className={styles.alertQty}>{getTotalStok(b.id).toFixed(1)} {b.satuan}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pending Inbound */}
          {pendingPO > 0 && (
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📋</div>
              <div>
                <div className={styles.infoTitle}>{pendingPO} PO Menunggu QC</div>
                <Link href="/inbound" className={styles.infoLink}>Konfirmasi Sekarang →</Link>
              </div>
            </div>
          )}

          {/* Pesanan terbaru */}
          <div className={styles.recentCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Pesanan Terbaru</h3>
              <Link href="/pesanan" className={styles.alertLink}>Lihat Semua →</Link>
            </div>
            {pesanan.slice(0, 3).map((p) => (
              <div key={p.id} className={styles.orderRow}>
                <div>
                  <div className={styles.orderNum}>{p.id}</div>
                  <div className={styles.orderMeta}>{p.meja} • {p.items.length} item</div>
                </div>
                <div className={styles.orderRight}>
                  <div className={styles.orderTotal}>{fmtRp(p.totalHarga)}</div>
                  <span className={`${styles.statusBadge} ${styles["status_" + p.status]}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
