"use client";

import { usePathname } from "next/navigation";
import styles from "./Topbar.module.css";
import { useScm } from "@/context/ScmContext";

const PAGE_TITLES = {
  "/": "Dashboard",
  "/pemasok": "Manajemen Pemasok",
  "/pembelian": "Purchase Order",
  "/inbound": "Inbound & Quality Control",
  "/inventaris": "Inventaris Gudang",
  "/pesanan": "POS — Pesanan & Masak",
  "/laporan": "Laporan & Waste Analytics",
  "/pengaturan": "Pengaturan",
};

export default function Topbar() {
  const pathname = usePathname();
  const { resetData } = useScm();
  const title = PAGE_TITLES[pathname] || "SCM Warung Magonan";

  return (
    <header className={styles.topbar}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.right}>
        <button
          className={styles.resetBtn}
          onClick={() => {
            if (confirm("Reset semua data ke kondisi awal (untuk demo ulang)?")) {
              resetData();
            }
          }}
          title="Reset data untuk demo ulang"
        >
          🔄 Reset Demo
        </button>
        <div className={styles.notifBtn}>🔔</div>
        <div className={styles.profile}>👔</div>
      </div>
    </header>
  );
}
