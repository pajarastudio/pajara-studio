"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PushNotification from "../push-notification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type StatItem = {
  label: string;
  value: number;
  detail: string;
  symbol: string;
  tone: "green" | "brown" | "cream";
};

const COLORS = {
  background: "#F1ECE6",
  green: "#214D32",
  greenLight: "#2F6B45",
  brown: "#8A6A4A",
  white: "#FFFFFF",
  muted: "#777D75",
  border: "#E7DFD5",
  cream: "#F7F4EE",
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [processingOrders, setProcessingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("status");

    if (error || !data) return;

    setTotalOrders(data.length);
    setNewOrders(
      data.filter((order) => order.status === "pending").length
    );
    setProcessingOrders(
      data.filter((order) => order.status === "processing").length
    );
    setCompletedOrders(
      data.filter((order) => order.status === "completed").length
    );
  }, []);

  const loadUnreadCount = useCallback(async (userId: string) => {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (!error) setUnreadCount(count ?? 0);
  }, []);

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.replace("/");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles_v2")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        router.replace("/");
        return;
      }

      if (!active) return;

      setAdminEmail(user.email || "");

      await Promise.all([
        loadOrders(),
        loadUnreadCount(user.id),
      ]);

      if (active) setLoading(false);
    }

    checkAdmin();

    return () => {
      active = false;
    };
  }, [router, loadOrders, loadUnreadCount]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  const stats: StatItem[] = [
    {
      label: "Total Pesanan",
      value: totalOrders,
      detail: "Seluruh pesanan masuk",
      symbol: "01",
      tone: "green",
    },
    {
      label: "Pesanan Baru",
      value: newOrders,
      detail: "Menunggu diproses",
      symbol: "02",
      tone: "brown",
    },
    {
      label: "Sedang Diproses",
      value: processingOrders,
      detail: "Dalam pengerjaan",
      symbol: "03",
      tone: "cream",
    },
    {
      label: "Pesanan Selesai",
      value: completedOrders,
      detail: "Berhasil diselesaikan",
      symbol: "04",
      tone: "green",
    },
  ];

  if (loading) {
    return (
      <main className="pajara-loading">
        <div className="pajara-loading-inner">
          <div className="pajara-spinner" />
          <p>Menyiapkan dashboard...</p>
          <span className="loading-caption">
            PAJARA STUDIO · ADMINISTRATION
          </span>
        </div>

        <style jsx>{`
          .pajara-loading {
            min-height: 100vh;
            min-height: 100dvh;
            display: grid;
            place-items: center;
            background: ${COLORS.background};
            color: ${COLORS.green};
            font-family: Arial, Helvetica, sans-serif;
          }

          .pajara-loading-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
          }

          .pajara-spinner {
            width: 32px;
            height: 32px;
            border: 2px solid #d9e2d8;
            border-top-color: ${COLORS.greenLight};
            border-right-color: ${COLORS.brown};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .pajara-loading p {
            margin: 0;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.2px;
          }

          .loading-caption {
            color: ${COLORS.muted};
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 1.7px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .pajara-spinner {
              animation-duration: 2s;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <>
      <PushNotification />

      <main className="pajara-page">
        {/* HEADER BRAND */}
        <header className="pajara-header">
          <div className="header-decoration header-decoration-one" />
          <div className="header-decoration header-decoration-two" />
          <div className="header-decoration header-decoration-three" />

          <div className="header-content">
            <div className="brand-row">
              <div className="brand-logo-wrap">
                <span className="brand-logo-orbit" aria-hidden="true" />
                <span className="brand-logo-side-accent" aria-hidden="true" />

                <div className="brand-logo-inner">
                  <Image
                    src="/icon-512.png"
                    alt="Logo Pajara Studio"
                    width={54}
                    height={54}
                    priority
                    className="brand-logo"
                  />
                </div>
              </div>

              <div className="brand-copy">
                <p className="brand-name">PAJARA STUDIO</p>
                <p className="brand-caption">
                  BERAKAR DI TANAH PASUNDAN
                </p>
              </div>

              <button
                type="button"
                className="notification-shortcut"
                aria-label={`Buka notifikasi, ${unreadCount} belum dibaca`}
                onClick={() => router.push("/notifications")}
              >
                <span className="bell-symbol">♧</span>
                {unreadCount > 0 && (
                  <span className="notification-dot">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>

            <div className="header-heading">
              <p className="eyebrow">RUANG KENDALI</p>
              <h1>
                Selamat datang
                <br />
                <span>di ruang kerja.</span>
              </h1>
              <p className="header-description">
                Kelola setiap pesanan, jaga kualitas karya,
                dan tumbuhkan perjalanan Pajara.
              </p>
            </div>

            <div className="header-bottom">
              <span className="header-bottom-label">
                ADMINISTRATION
              </span>
              <span className="header-bottom-line" />
              <span className="header-bottom-number">PS — 01</span>
            </div>
          </div>
        </header>

        <div className="pajara-content">
          {/* ADMIN PROFILE */}
          <section className="admin-greeting">
            <div className="greeting-logo-wrap">
              <Image
                src="/icon-512.png"
                alt="Pajara Studio"
                width={44}
                height={44}
                className="greeting-logo"
              />
            </div>

            <div className="greeting-copy">
              <p className="section-eyebrow">
                SENANG MELIHATMU KEMBALI
              </p>
              <h2>Halo, Admin Pajara.</h2>
              <p className="admin-email">{adminEmail}</p>
            </div>

            <span className="greeting-accent" aria-hidden="true" />
          </section>

          {/* STATISTICS */}
          <section className="statistics-section">
            <div className="section-heading">
              <div>
                <p className="section-eyebrow">GAMBARAN HARI INI</p>
                <h2>Ringkasan pesanan</h2>
              </div>

              <span className="section-index">01 / 04</span>
            </div>

            <div className="statistics-grid">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className={`stat-card stat-${stat.tone}`}
                >
                  <div className="stat-top">
                    <span className="stat-symbol">{stat.symbol}</span>
                    <span className="stat-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </div>

                  <p className="stat-value">{stat.value}</p>
                  <h3>{stat.label}</h3>
                  <p className="stat-detail">{stat.detail}</p>

                  <div className="stat-bottom-line" />
                </article>
              ))}
            </div>
          </section>

          {/* ORDER WORKSPACE */}
          <section className="workspace-section">
            <div className="workspace-pattern" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <div className="workspace-content">
              <div className="workspace-topline">
                <span className="workspace-label">PAJARA WORKSPACE</span>
                <span className="workspace-number">01</span>
              </div>

              <div className="workspace-title-row">
                <div>
                  <p className="workspace-kicker">
                    DARI BRIEF MENJADI KARYA
                  </p>
                  <h2>
                    Setiap karya
                    <br />
                    punya cerita.
                  </h2>
                </div>

                <div className="workspace-logo-wrap">
                  <Image
                    src="/icon-512.png"
                    alt="Logo Pajara Studio"
                    width={52}
                    height={52}
                    className="workspace-logo"
                  />
                </div>
              </div>

              <p className="workspace-description">
                Lihat permintaan desain, periksa brief pelanggan,
                dan kelola proses pengerjaan dalam satu ruang.
              </p>

              <button
                type="button"
                className="workspace-button"
                onClick={() => router.push("/orders")}
              >
                <span>Buka daftar pesanan</span>
                <span className="button-arrow">↗</span>
              </button>
            </div>
          </section>

          {/* ACTIVITY */}
          <section className="activity-section">
            <div className="section-heading activity-heading">
              <div>
                <p className="section-eyebrow">RUANG KERJA</p>
                <h2>Aktivitas terbaru</h2>
              </div>

              <span className="activity-clock">◷</span>
            </div>

            <div className="activity-content">
              <div className="activity-icon">✳</div>
              <div className="activity-copy">
                <h3>Perjalanan Pajara berlanjut</h3>
                <p>
                  Pantau perubahan status dan perkembangan pesanan
                  melalui halaman pesanan dan notifikasi.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="activity-link"
              onClick={() => router.push("/orders")}
            >
              Lihat pesanan <span>→</span>
            </button>
          </section>

          {/* ACCOUNT */}
          <section className="account-section">
            <div>
              <p className="account-title">PAJARA STUDIO</p>
              <p className="account-caption">
                Desain yang punya arah.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="logout-button"
            >
              <span>Keluar</span>
              <span>↗</span>
            </button>
          </section>

          <footer className="pajara-footer">
            <span>PAJARA STUDIO © 2026</span>
            <span>BERAKAR DI TANAH PASUNDAN.</span>
          </footer>
        </div>

        {/* BOTTOM NAVIGATION */}
        <nav className="bottom-navigation" aria-label="Navigasi utama">
          <div className="bottom-navigation-inner">
            {[
              { label: "Dashboard", icon: "⌂", action: "home" },
              { label: "Pesanan", icon: "▤", action: "orders" },
              {
                label: "Notifikasi",
                icon: "♧",
                action: "notifications",
              },
              { label: "Keuangan", icon: "Rp", action: "finance" },
            ].map((item) => {
              const selected = item.action === "home";

              return (
                <button
                  key={item.action}
                  type="button"
                  aria-label={item.label}
                  aria-current={selected ? "page" : undefined}
                  onClick={() => {
                    if (item.action === "home") {
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    } else if (item.action === "orders") {
                      router.push("/orders");
                    } else if (item.action === "notifications") {
                      router.push("/notifications");
                    } else {
                      router.push("/finance");
                    }
                  }}
                  className={`nav-item ${selected ? "nav-item-active" : ""}`}
                >
                  <span
                    className={`nav-icon ${
                      item.action === "finance" ? "nav-icon-rp" : ""
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="nav-label">{item.label}</span>

                  {item.action === "notifications" &&
                    unreadCount > 0 && (
                      <span className="nav-badge">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                </button>
              );
            })}
          </div>
        </nav>
      </main>

      <style jsx>{`
        .pajara-page {
          min-height: 100vh;
          padding-bottom: calc(100px + env(safe-area-inset-bottom));
          background: ${COLORS.background};
          color: ${COLORS.green};
          font-family:
            "DM Sans", Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .pajara-header {
          position: relative;
          overflow: hidden;
          color: ${COLORS.cream};
          background:
            radial-gradient(
              circle at 100% 5%,
              rgba(138, 106, 74, 0.24),
              transparent 32%
            ),
            linear-gradient(145deg, #173923 0%, #214d32 58%, #2f6b45 100%);
          border-radius: 0 0 30px 30px;
          box-shadow: 0 12px 32px rgba(33, 77, 50, 0.12);
        }

        .header-content {
          position: relative;
          z-index: 2;
          max-width: 1080px;
          margin: 0 auto;
          padding: 22px 22px 20px;
        }

        .header-decoration {
          position: absolute;
          pointer-events: none;
          border: 1px solid rgba(247, 244, 238, 0.09);
          border-radius: 50%;
        }

        .header-decoration-one {
          width: 260px;
          height: 260px;
          right: -115px;
          top: -100px;
        }

        .header-decoration-two {
          width: 200px;
          height: 200px;
          right: -65px;
          top: -70px;
        }

        .header-decoration-three {
          width: 120px;
          height: 120px;
          right: -25px;
          top: -30px;
          border-color: rgba(247, 244, 238, 0.06);
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* LOGO UTAMA: bingkai lengkung berlapis */
        .brand-logo-wrap {
          position: relative;
          isolation: isolate;
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          padding: 4px;
          border: 1px solid rgba(247, 244, 238, 0.42);
          border-radius: 21px;
          background: linear-gradient(
            145deg,
            rgba(247, 244, 238, 0.19),
            rgba(247, 244, 238, 0.055)
          );
          box-shadow:
            0 7px 18px rgba(0, 0, 0, 0.13),
            inset 0 0 0 1px rgba(247, 244, 238, 0.045);
        }

        .brand-logo-wrap::before {
          content: "";
          position: absolute;
          z-index: -1;
          inset: -5px;
          border: 1px solid rgba(216, 197, 173, 0.56);
          border-radius: 25px;
          pointer-events: none;
        }

        .brand-logo-wrap::after {
          content: "";
          position: absolute;
          z-index: 2;
          top: 8px;
          right: -5px;
          width: 9px;
          height: 25px;
          border-right: 1px solid rgba(216, 197, 173, 0.9);
          border-radius: 0 9px 9px 0;
          pointer-events: none;
        }

        .brand-logo-orbit {
          position: absolute;
          z-index: 2;
          left: -5px;
          bottom: 8px;
          width: 9px;
          height: 25px;
          border-left: 1px solid rgba(216, 197, 173, 0.78);
          border-radius: 9px 0 0 9px;
          pointer-events: none;
        }

        .brand-logo-side-accent {
          position: absolute;
          z-index: 2;
          right: 9px;
          bottom: -4px;
          width: 21px;
          height: 7px;
          border-bottom: 1px solid rgba(216, 197, 173, 0.9);
          border-radius: 0 0 10px 10px;
          pointer-events: none;
        }

        .brand-logo-inner {
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: grid;
          place-items: center;
          border: 1px solid rgba(247, 244, 238, 0.2);
          border-radius: 16px;
          background: rgba(247, 244, 238, 0.97);
        }

        .brand-logo {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          border-radius: 15px;
        }

        .brand-copy {
          min-width: 0;
          flex: 1;
        }

        .brand-name {
          margin: 0;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 2.2px;
        }

        .brand-caption {
          margin: 5px 0 0;
          color: #d8c5ad;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.15px;
        }

        .notification-shortcut {
          position: relative;
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border: 1px solid rgba(247, 244, 238, 0.2);
          border-radius: 14px;
          background: rgba(247, 244, 238, 0.08);
          color: ${COLORS.cream};
          cursor: pointer;
        }

        .bell-symbol {
          font-size: 22px;
          line-height: 1;
        }

        .notification-dot {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 17px;
          height: 17px;
          display: grid;
          place-items: center;
          padding: 0 4px;
          border: 2px solid #214d32;
          border-radius: 99px;
          background: #b45e48;
          color: #fff;
          font-size: 9px;
          font-weight: 900;
        }

        .header-heading {
          padding: 36px 0 31px;
          max-width: 540px;
        }

        .eyebrow,
        .section-eyebrow {
          margin: 0;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 2px;
        }

        .eyebrow {
          margin-bottom: 13px;
          color: #d9c6ae;
        }

        .header-heading h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(35px, 8vw, 51px);
          font-weight: 400;
          line-height: 1.06;
          letter-spacing: -1.6px;
        }

        .header-heading h1 span {
          color: #d8c5ad;
          font-style: italic;
        }

        .header-description {
          max-width: 320px;
          margin: 15px 0 0;
          color: #e0e8df;
          font-size: 12px;
          line-height: 1.8;
        }

        .header-bottom {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 15px;
          border-top: 1px solid rgba(247, 244, 238, 0.17);
        }

        .header-bottom-label,
        .header-bottom-number {
          color: #d8c5ad;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.5px;
          white-space: nowrap;
        }

        .header-bottom-line {
          flex: 1;
          height: 1px;
          background: rgba(247, 244, 238, 0.25);
        }

        .header-bottom-number {
          letter-spacing: 1px;
        }

        .pajara-content {
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
          padding: 20px 16px 0;
        }

        .admin-greeting {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px 16px;
          margin-bottom: 31px;
          overflow: hidden;
          border: 1px solid ${COLORS.border};
          border-radius: 19px;
          background: ${COLORS.cream};
          box-shadow: 0 5px 18px rgba(33, 77, 50, 0.035);
        }

        .greeting-logo-wrap {
          position: relative;
          z-index: 1;
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          padding: 5px;
          border: 1px solid #d9e1d5;
          border-radius: 16px;
          background: #edf1e9;
        }

        .greeting-logo {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          border-radius: 10px;
        }

        .greeting-copy {
          position: relative;
          z-index: 1;
          min-width: 0;
          flex: 1;
        }

        .section-eyebrow {
          color: ${COLORS.brown};
          font-size: 8px;
          letter-spacing: 1.5px;
          line-height: 1.6;
        }

        .greeting-copy h2 {
          margin: 4px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -0.5px;
        }

        .admin-email {
          margin: 5px 0 0;
          overflow-wrap: anywhere;
          color: ${COLORS.muted};
          font-size: 10px;
        }

        .greeting-accent {
          position: absolute;
          right: -17px;
          bottom: -36px;
          width: 82px;
          height: 82px;
          border: 1px solid #e8e2d8;
          border-radius: 50%;
          pointer-events: none;
        }

        .greeting-accent::after {
          position: absolute;
          content: "";
          inset: 12px;
          border: 1px solid #e8e2d8;
          border-radius: 50%;
        }

        .statistics-section {
          margin-bottom: 29px;
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 15px;
        }

        .section-heading h2 {
          margin: 5px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 25px;
          font-weight: 500;
          letter-spacing: -0.8px;
        }

        .section-index {
          padding-bottom: 4px;
          color: ${COLORS.muted};
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .statistics-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
        }

        .stat-card {
          position: relative;
          min-width: 0;
          min-height: 165px;
          padding: 15px 14px 17px;
          overflow: hidden;
          border: 1px solid ${COLORS.border};
          border-radius: 19px;
          background: ${COLORS.white};
          box-shadow: 0 4px 16px rgba(33, 77, 50, 0.025);
        }

        .stat-green {
          background: #fff;
        }

        .stat-brown {
          background: #f8f1e9;
          border-color: #e7d8c7;
        }

        .stat-cream {
          background: #f8f6f0;
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .stat-symbol {
          color: ${COLORS.brown};
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .stat-arrow {
          display: grid;
          place-items: center;
          width: 26px;
          height: 26px;
          border: 1px solid ${COLORS.border};
          border-radius: 9px;
          color: ${COLORS.greenLight};
          font-size: 13px;
        }

        .stat-value {
          margin: 16px 0 7px;
          color: ${COLORS.green};
          font-size: 36px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -1.8px;
          font-variant-numeric: tabular-nums;
        }

        .stat-card h3 {
          margin: 0;
          color: ${COLORS.green};
          font-size: 11px;
          font-weight: 800;
          line-height: 1.4;
        }

        .stat-detail {
          margin: 5px 0 0;
          color: ${COLORS.muted};
          font-size: 9px;
          line-height: 1.5;
        }

        .stat-bottom-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: ${COLORS.greenLight};
          opacity: 0.7;
        }

        .stat-brown .stat-bottom-line {
          background: ${COLORS.brown};
        }

        .stat-cream .stat-bottom-line {
          background: #b9c9b3;
        }

        .workspace-section {
          position: relative;
          overflow: hidden;
          margin-bottom: 29px;
          border-radius: 24px;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(138, 106, 74, 0.24),
              transparent 34%
            ),
            linear-gradient(145deg, #173923 0%, #214d32 70%, #2f6b45 100%);
          color: ${COLORS.cream};
          box-shadow: 0 12px 28px rgba(33, 77, 50, 0.12);
        }

        .workspace-pattern {
          position: absolute;
          right: -85px;
          top: 70px;
          width: 210px;
          height: 210px;
          pointer-events: none;
        }

        .workspace-pattern span {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(247, 244, 238, 0.12);
          border-radius: 50%;
        }

        .workspace-pattern span:nth-child(2) {
          inset: 22px;
        }

        .workspace-pattern span:nth-child(3) {
          inset: 44px;
        }

        .workspace-content {
          position: relative;
          z-index: 1;
          padding: 21px;
        }

        .workspace-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(247, 244, 238, 0.18);
        }

        .workspace-label,
        .workspace-number {
          color: #d8c5ad;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1.7px;
        }

        .workspace-number {
          font-size: 10px;
        }

        .workspace-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-top: 25px;
        }

        .workspace-title-row > div:first-child {
          min-width: 0;
        }

        .workspace-kicker {
          margin: 0 0 9px;
          color: #d8c5ad;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .workspace-title-row h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(31px, 7vw, 40px);
          font-weight: 400;
          line-height: 1.07;
          letter-spacing: -1px;
        }

        .workspace-logo-wrap {
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          padding: 6px;
          border: 1px solid rgba(247, 244, 238, 0.3);
          border-radius: 19px;
          background: rgba(247, 244, 238, 0.96);
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
        }

        .workspace-logo {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          border-radius: 11px;
        }

        .workspace-description {
          max-width: 310px;
          margin: 14px 0 22px;
          color: #e0e8df;
          font-size: 11px;
          line-height: 1.8;
        }

        .workspace-button {
          width: 100%;
          min-height: 49px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 15px;
          border: none;
          border-radius: 13px;
          background: ${COLORS.cream};
          color: ${COLORS.green};
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .workspace-button:active {
          transform: scale(0.985);
        }

        .button-arrow {
          display: grid;
          place-items: center;
          width: 27px;
          height: 27px;
          border-radius: 9px;
          background: #e5e9df;
          font-size: 15px;
        }

        .activity-section {
          margin-bottom: 22px;
          padding: 19px;
          border: 1px solid ${COLORS.border};
          border-radius: 20px;
          background: ${COLORS.cream};
        }

        .activity-heading {
          align-items: center;
          margin-bottom: 18px;
        }

        .activity-heading h2 {
          font-size: 23px;
        }

        .activity-clock {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border: 1px solid ${COLORS.border};
          border-radius: 13px;
          color: ${COLORS.brown};
          font-size: 21px;
        }

        .activity-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px 0;
          border-top: 1px solid ${COLORS.border};
          border-bottom: 1px solid ${COLORS.border};
        }

        .activity-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #e6ede3;
          color: ${COLORS.greenLight};
          font-size: 18px;
        }

        .activity-copy h3 {
          margin: 1px 0 0;
          font-size: 12px;
          font-weight: 800;
        }

        .activity-copy p {
          margin: 6px 0 0;
          color: ${COLORS.muted};
          font-size: 10px;
          line-height: 1.8;
        }

        .activity-link {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 15px;
          padding: 0;
          border: none;
          background: transparent;
          color: ${COLORS.green};
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }

        .activity-link span {
          font-size: 16px;
        }

        .account-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 18px 0;
          border-top: 1px solid #ddd4c8;
          border-bottom: 1px solid #ddd4c8;
        }

        .account-title {
          margin: 0;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.8px;
        }

        .account-caption {
          margin: 5px 0 0;
          color: ${COLORS.muted};
          font-family: Georgia, "Times New Roman", serif;
          font-size: 12px;
          font-style: italic;
        }

        .logout-button {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 38px;
          padding: 0 12px;
          border: 1px solid #d8c9b8;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.35);
          color: ${COLORS.brown};
          font-size: 10px;
          font-weight: 850;
          cursor: pointer;
        }

        .logout-button span:last-child {
          font-size: 14px;
        }

        .pajara-footer {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 8px;
          padding: 20px 2px 5px;
          color: ${COLORS.muted};
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.8px;
        }

        .bottom-navigation {
          position: fixed;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 100;
          padding: 8px 12px
            calc(8px + env(safe-area-inset-bottom));
          border-top: 1px solid rgba(228, 222, 213, 0.95);
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 -8px 28px rgba(33, 77, 50, 0.07);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .bottom-navigation-inner {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 5px;
          width: 100%;
          max-width: 620px;
          margin: 0 auto;
        }

        .nav-item {
          position: relative;
          display: flex;
          min-width: 0;
          min-height: 54px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 6px 2px;
          border: none;
          border-radius: 14px;
          background: transparent;
          color: ${COLORS.muted};
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .nav-item-active {
          background: #eaf1e9;
          color: ${COLORS.green};
        }

        .nav-icon {
          font-size: 21px;
          font-weight: 800;
          line-height: 1;
        }

        .nav-icon-rp {
          font-size: 13px;
        }

        .nav-label {
          font-size: 9px;
          font-weight: 700;
          line-height: 1.2;
          white-space: nowrap;
        }

        .nav-item-active .nav-label {
          font-weight: 900;
        }

        .nav-badge {
          position: absolute;
          top: 2px;
          right: calc(50% - 21px);
          display: grid;
          place-items: center;
          min-width: 15px;
          height: 15px;
          padding: 0 3px;
          border: 2px solid #fff;
          border-radius: 99px;
          background: #b45e48;
          color: #fff;
          font-size: 8px;
          font-weight: 900;
        }

        button:focus-visible {
          outline: 2px solid ${COLORS.brown};
          outline-offset: 3px;
        }

        @media (min-width: 700px) {
          .header-content {
            padding: 28px 32px 23px;
          }

          .header-heading {
            padding: 48px 0 38px;
          }

          .pajara-content {
            padding: 25px 28px 0;
          }

          .admin-greeting {
            padding: 20px 22px;
          }

          .statistics-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
          }

          .stat-card {
            min-height: 185px;
            padding: 18px;
          }

          .stat-value {
            font-size: 43px;
          }

          .workspace-content {
            padding: 29px;
          }

          .workspace-logo-wrap {
            width: 72px;
            height: 72px;
          }

          .workspace-description {
            max-width: 430px;
          }

          .workspace-button {
            max-width: 330px;
          }

          .activity-section {
            padding: 23px;
          }
        }

        @media (max-width: 360px) {
          .admin-greeting {
            gap: 10px;
            padding: 14px 12px;
          }

          .greeting-logo-wrap {
            width: 45px;
            height: 45px;
          }

          .greeting-copy h2 {
            font-size: 18px;
          }

          .workspace-logo-wrap {
            width: 52px;
            height: 52px;
            padding: 5px;
            border-radius: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .workspace-button,
          .nav-item {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
