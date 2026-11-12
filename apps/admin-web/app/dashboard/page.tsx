
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
  number: string;
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

    if (!error) {
      setUnreadCount(count ?? 0);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          router.replace("/");
          return;
        }

        const user = sessionData.session?.user;

        if (!user) {
          router.replace("/");
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles_v2")
            .select("role")
            .eq("id", user.id)
            .single();

        if (
          profileError ||
          !profile ||
          profile.role !== "admin"
        ) {
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

        if (active) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Gagal memuat dashboard:", error);
        router.replace("/");
      }
    }

    void checkAdmin();

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
      number: "01",
      tone: "green",
    },
    {
      label: "Pesanan Baru",
      value: newOrders,
      detail: "Menunggu diproses",
      number: "02",
      tone: "brown",
    },
    {
      label: "Sedang Diproses",
      value: processingOrders,
      detail: "Dalam pengerjaan",
      number: "03",
      tone: "cream",
    },
    {
      label: "Pesanan Selesai",
      value: completedOrders,
      detail: "Berhasil diselesaikan",
      number: "04",
      tone: "green",
    },
  ];

  if (loading) {
    return (
      <main
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2147483647,
          width: "100%",
          height: "100%",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "24px",
          boxSizing: "border-box",
          background: "#F1ECE6",
          color: "#214D32",
          fontFamily: "Arial, Helvetica, sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            maxWidth: "300px",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "82px",
              height: "82px",
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              padding: "12px",
              boxSizing: "border-box",
              border: "1px solid rgba(138,106,74,0.4)",
              borderRadius: "22px",
              background: "#FFFFFF",
              boxShadow: "0 8px 24px rgba(33,77,50,0.07)",
            }}
          >
            <Image
              src="/icon-512.png"
              alt="Pajara Studio"
              width={58}
              height={58}
              priority
              unoptimized
              style={{
                display: "block",
                width: "58px",
                height: "58px",
                minWidth: "58px",
                maxWidth: "58px",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "24px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: "18px",
                fontWeight: 800,
                letterSpacing: "2.5px",
                color: "#214D32",
              }}
            >
              PAJARA ADMIN
            </p>

            <p
              style={{
                margin: "6px 0 0",
                fontSize: "8px",
                lineHeight: "14px",
                fontWeight: 700,
                letterSpacing: "1.8px",
                color: "#8A6A4A",
              }}
            >
              MANAGEMENT WORKSPACE
            </p>
          </div>

          <div
            style={{
              width: "110px",
              height: "3px",
              marginTop: "32px",
              overflow: "hidden",
              borderRadius: "20px",
              background: "#DED9D0",
            }}
          >
            <div
              style={{
                width: "38%",
                height: "100%",
                borderRadius: "20px",
                background: "#2F6B45",
                animation:
                  "pajaraAdminProgress 1.3s ease-in-out infinite alternate",
              }}
            />
          </div>

          <h1
            style={{
              margin: "20px 0 0",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "21px",
              lineHeight: "29px",
              fontWeight: 400,
              letterSpacing: "-0.4px",
              color: "#214D32",
            }}
          >
            Menyiapkan ruang kerja
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              fontSize: "11px",
              lineHeight: "19px",
              color: "#777D75",
            }}
          >
            Sebentar, kami sedang menyiapkan dashboard.
          </p>

          <p
            style={{
              margin: "42px 0 0",
              fontSize: "8px",
              lineHeight: "14px",
              fontWeight: 700,
              letterSpacing: "1.8px",
              color: "#8A6A4A",
            }}
          >
            DESAIN YANG PUNYA ARAH.
          </p>
        </div>

        <style jsx global>{`
          @keyframes pajaraAdminProgress {
            from {
              transform: translateX(-5px);
            }
            to {
              transform: translateX(75px);
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
        <header className="pajara-header">
          <div className="header-content">
            <div className="brand-row">
              <div className="brand-logo-wrap">
                <Image
                  src="/icon-512.png"
                  alt="Logo Pajara Studio"
                  width={41}
                  height={41}
                  priority
                  className="brand-logo"
                  style={{
                    borderRadius: "15px",
                    clipPath: "inset(0 round 15px)",
                  }}
                />
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
                <svg
                  viewBox="0 0 24 24"
                  width="21"
                  height="21"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>

                {unreadCount > 0 && (
                  <span className="notification-dot">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>

            <div className="header-heading">
              <p className="eyebrow">RUANG KENDALI PAJARA</p>
              <h1>
                Selamat datang
                <br />
                <span>di ruang kerja.</span>
              </h1>
              <p className="header-description">
                Kelola pesanan, jaga kualitas karya, dan tumbuhkan
                perjalanan Pajara.
              </p>
            </div>

            <div className="header-bottom">
              <span>ADMINISTRATION</span>
              <span className="header-bottom-line" />
              <span>PS — 01</span>
            </div>
          </div>
        </header>

        <div className="pajara-content">
          <section className="admin-greeting">
            <div className="greeting-logo-wrap">
              <Image
                src="/icon-512.png"
                alt="Pajara Studio"
                width={36}
                height={36}
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
          </section>

          <section className="statistics-section">
            <div className="section-heading">
              <div>
                <p className="section-eyebrow">GAMBARAN PESANAN</p>
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
                    <span className="stat-number">{stat.number}</span>
                    <span className="stat-mark">↗</span>
                  </div>

                  <p className="stat-value">{stat.value}</p>
                  <h3>{stat.label}</h3>
                  <p className="stat-detail">{stat.detail}</p>
                  <div className="stat-bottom-line" />
                </article>
              ))}
            </div>
          </section>

          <section className="workspace-section">
            <div className="workspace-decoration" aria-hidden="true" />

            <div className="workspace-content">
              <div className="workspace-topline">
                <span>PAJARA WORKSPACE</span>
                <span>01</span>
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
                    width={45}
                    height={45}
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

          <section className="activity-section">
            <div className="section-heading activity-heading">
              <div>
                <p className="section-eyebrow">RUANG KERJA</p>
                <h2>Aktivitas terbaru</h2>
              </div>

              <span className="activity-symbol">◷</span>
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
          border-radius: 0 0 26px 26px;
          background: linear-gradient(
            145deg,
            #173923 0%,
            #214d32 60%,
            #2f6b45 100%
          );
          color: ${COLORS.cream};
          box-shadow: 0 8px 24px rgba(33, 77, 50, 0.08);
        }

        .header-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
          padding: 22px 20px 19px;
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* LOGO HEADER PALING ATAS */
        .brand-logo-wrap {
          display: grid;
          width: 49px;
          height: 49px;
          flex-shrink: 0;
          place-items: center;
          padding: 4px;
          box-sizing: border-box;
          overflow: hidden;
          border: 1px solid rgba(247, 244, 238, 0.35);
          border-radius: 18px;
          background: rgba(247, 244, 238, 0.12);
        }

        .brand-logo {
          display: block;
          width: 41px;
          height: 41px;
          object-fit: contain;
          border-radius: 15px;
          overflow: hidden;
        }

        .brand-copy {
          min-width: 0;
          flex: 1;
        }

        .brand-name {
          margin: 0;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .brand-caption {
          margin: 5px 0 0;
          color: #d8c5ad;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .notification-shortcut {
          position: relative;
          display: grid;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid rgba(247, 244, 238, 0.2);
          border-radius: 12px;
          background: rgba(247, 244, 238, 0.08);
          color: ${COLORS.cream};
          cursor: pointer;
        }

        .notification-dot {
          position: absolute;
          top: -5px;
          right: -5px;
          display: grid;
          min-width: 17px;
          height: 17px;
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
          max-width: 540px;
          padding: 35px 0 28px;
        }

        .eyebrow,
        .section-eyebrow {
          margin: 0;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1.7px;
        }

        .eyebrow {
          margin-bottom: 12px;
          color: #d8c5ad;
        }

        .header-heading h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(34px, 8vw, 49px);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -1.4px;
        }

        .header-heading h1 span {
          color: #d8c5ad;
          font-style: italic;
        }

        .header-description {
          max-width: 330px;
          margin: 13px 0 0;
          color: #e0e8df;
          font-size: 11px;
          line-height: 1.8;
        }

        .header-bottom {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 14px;
          border-top: 1px solid rgba(247, 244, 238, 0.16);
          color: #d8c5ad;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .header-bottom-line {
          height: 1px;
          flex: 1;
          background: rgba(247, 244, 238, 0.22);
        }

        .pajara-content {
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
          padding: 20px 16px 0;
        }

        .admin-greeting {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 16px;
          margin-bottom: 27px;
          border: 1px solid ${COLORS.border};
          border-radius: 18px;
          background: ${COLORS.cream};
          box-shadow: 0 4px 15px rgba(33, 77, 50, 0.025);
        }

        .greeting-logo-wrap {
          display: grid;
          width: 54px;
          height: 54px;
          flex-shrink: 0;
          place-items: center;
          padding: 6px;
          box-sizing: border-box;
          border: 1px solid #d9e1d5;
          border-radius: 16px;
          background: #edf1e9;
        }

        .greeting-logo {
          display: block;
          width: 36px;
          height: 36px;
          object-fit: contain;
          border-radius: 9px;
        }

        .greeting-copy {
          min-width: 0;
          flex: 1;
        }

        .section-eyebrow {
          color: ${COLORS.brown};
          font-size: 8px;
          letter-spacing: 1.4px;
          line-height: 1.6;
        }

        .greeting-copy h2 {
          margin: 4px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 19px;
          font-weight: 500;
          letter-spacing: -0.4px;
        }

        .admin-email {
          margin: 5px 0 0;
          overflow-wrap: anywhere;
          color: ${COLORS.muted};
          font-size: 10px;
        }

        .statistics-section {
          margin-bottom: 27px;
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .section-heading h2 {
          margin: 5px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 24px;
          font-weight: 500;
          letter-spacing: -0.6px;
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
          gap: 10px;
        }

        .stat-card {
          position: relative;
          min-width: 0;
          min-height: 150px;
          padding: 14px;
          overflow: hidden;
          border: 1px solid ${COLORS.border};
          border-radius: 17px;
          background: ${COLORS.white};
        }

        .stat-brown {
          border-color: #e7d8c7;
          background: #f8f1e9;
        }

        .stat-cream {
          background: #f8f6f0;
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-number {
          color: ${COLORS.brown};
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .stat-mark {
          display: grid;
          width: 24px;
          height: 24px;
          place-items: center;
          border: 1px solid ${COLORS.border};
          border-radius: 8px;
          color: ${COLORS.greenLight};
          font-size: 12px;
        }

        .stat-value {
          margin: 14px 0 7px;
          color: ${COLORS.green};
          font-size: 34px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -1.5px;
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
          right: 0;
          bottom: 0;
          left: 0;
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
          margin-bottom: 27px;
          border-radius: 22px;
          background: linear-gradient(
            145deg,
            #173923 0%,
            #214d32 70%,
            #2f6b45 100%
          );
          color: ${COLORS.cream};
          box-shadow: 0 10px 25px rgba(33, 77, 50, 0.1);
        }

        .workspace-decoration {
          position: absolute;
          top: 65px;
          right: -85px;
          width: 205px;
          height: 205px;
          border: 1px solid rgba(247, 244, 238, 0.12);
          border-radius: 50%;
          pointer-events: none;
        }

        .workspace-decoration::before,
        .workspace-decoration::after {
          position: absolute;
          inset: 22px;
          border: 1px solid rgba(247, 244, 238, 0.1);
          border-radius: 50%;
          content: "";
        }

        .workspace-decoration::after {
          inset: 44px;
        }

        .workspace-content {
          position: relative;
          z-index: 1;
          padding: 20px;
        }

        .workspace-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(247, 244, 238, 0.17);
          color: #d8c5ad;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1.6px;
        }

        .workspace-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 23px;
        }

        .workspace-title-row > div:first-child {
          min-width: 0;
        }

        .workspace-kicker {
          margin: 0 0 9px;
          color: #d8c5ad;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.1px;
        }

        .workspace-title-row h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(29px, 7vw, 39px);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -0.8px;
        }

        .workspace-logo-wrap {
          display: grid;
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          place-items: center;
          padding: 7px;
          box-sizing: border-box;
          border: 1px solid rgba(247, 244, 238, 0.4);
          border-radius: 19px;
          background: ${COLORS.cream};
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }

        .workspace-logo {
          display: block;
          width: 45px;
          height: 45px;
          object-fit: contain;
          border-radius: 10px;
        }

        .workspace-description {
          max-width: 330px;
          margin: 13px 0 19px;
          color: #e0e8df;
          font-size: 10px;
          line-height: 1.8;
        }

        .workspace-button {
          display: flex;
          width: 100%;
          min-height: 47px;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 14px;
          border: none;
          border-radius: 12px;
          background: ${COLORS.cream};
          color: ${COLORS.green};
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .workspace-button:active {
          transform: scale(0.985);
        }

        .button-arrow {
          display: grid;
          width: 26px;
          height: 26px;
          place-items: center;
          border-radius: 8px;
          background: #e5e9df;
          font-size: 14px;
        }

        .activity-section {
          margin-bottom: 21px;
          padding: 18px;
          border: 1px solid ${COLORS.border};
          border-radius: 19px;
          background: ${COLORS.cream};
        }

        .activity-heading {
          align-items: center;
          margin-bottom: 16px;
        }

        .activity-heading h2 {
          font-size: 22px;
        }

        .activity-symbol {
          display: grid;
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid ${COLORS.border};
          border-radius: 12px;
          color: ${COLORS.brown};
          font-size: 20px;
        }

        .activity-content {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px 0;
          border-top: 1px solid ${COLORS.border};
          border-bottom: 1px solid ${COLORS.border};
        }

        .activity-icon {
          display: grid;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 11px;
          background: #e6ede3;
          color: ${COLORS.greenLight};
          font-size: 17px;
        }

        .activity-copy h3 {
          margin: 1px 0 0;
          font-size: 11px;
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
          gap: 8px;
          margin-top: 14px;
          padding: 0;
          border: none;
          background: transparent;
          color: ${COLORS.green};
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }

        .activity-link span {
          font-size: 15px;
        }

        .account-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 17px 0;
          border-top: 1px solid #ddd4c8;
          border-bottom: 1px solid #ddd4c8;
        }

        .account-title {
          margin: 0;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.6px;
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
          min-height: 37px;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid #d8c9b8;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.35);
          color: ${COLORS.brown};
          font-size: 10px;
          font-weight: 850;
          cursor: pointer;
        }

        .pajara-footer {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 8px;
          padding: 19px 2px 5px;
          color: ${COLORS.muted};
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.7px;
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
            padding: 43px 0 35px;
          }

          .pajara-content {
            padding: 25px 28px 0;
          }

          .statistics-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
          }

          .stat-card {
            min-height: 175px;
            padding: 17px;
          }

          .stat-value {
            font-size: 40px;
          }

          .workspace-content {
            padding: 27px;
          }

          .workspace-logo-wrap {
            width: 70px;
            height: 70px;
          }

          .workspace-logo {
            width: 50px;
            height: 50px;
          }

          .workspace-button {
            max-width: 330px;
          }

          .activity-section {
            padding: 22px;
          }
        }

        @media (max-width: 360px) {
          .admin-greeting {
            gap: 10px;
            padding: 13px;
          }

          .greeting-copy h2 {
            font-size: 17px;
          }

          .workspace-logo-wrap {
            width: 54px;
            height: 54px;
            padding: 5px;
          }

          .workspace-logo {
            width: 40px;
            height: 40px;
          }

          .pajara-footer {
            font-size: 7px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .workspace-button {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
