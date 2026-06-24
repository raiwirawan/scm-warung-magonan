"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import { useScm } from "@/context/ScmContext";

const navItems = [
  { name: "Dashboard", path: "/", icon: "⊞" },
  { name: "Pemasok", path: "/pemasok", icon: "🚚" },
  { name: "Pembelian", path: "/pembelian", icon: "🛒" },
  { name: "Inbound / QC", path: "/inbound", icon: "📋" },
  { name: "Inventaris", path: "/inventaris", icon: "📦" },
  { name: "POS / Pesanan", path: "/pesanan", icon: "🍳" },
  { name: "Laporan", path: "/laporan", icon: "📈" },
  { name: "Pengaturan", path: "/pengaturan", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { purchaseOrders, stok, BAHAN_BAKU, getTotalStok } = useScm();

  // Hitung badge: PO menunggu konfirmasi (status: dikirim)
  const pendingInbound = purchaseOrders.filter((po) => po.status === "dikirim").length;

  // Hitung bahan menipis
  const lowStockCount = BAHAN_BAKU.filter((b) => {
    const qty = getTotalStok(b.id);
    return qty <= b.minStok;
  }).length;

  const badges = {
    "/inbound": pendingInbound > 0 ? pendingInbound : null,
    "/inventaris": lowStockCount > 0 ? lowStockCount : null,
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.avatar}>👨‍🍳</div>
        <div>
          <div className={styles.brandName}>Warung Magonan</div>
          <div className={styles.brandSub}>SCM CONTROL</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
          const badge = badges[item.path];
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.link} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.name}</span>
              {badge && <span className={styles.badge}>{badge}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerUser}>
          <div className={styles.footerAvatar}>👔</div>
          <div>
            <div className={styles.footerName}>Bapak Wayan</div>
            <div className={styles.footerRole}>Pemilik Warung</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
