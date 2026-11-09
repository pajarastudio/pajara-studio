
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@pajara/supabase";
import CustomerLoading from "../components/CustomerLoading";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  quantity: number | null;
  brief: string | null;
  notes: string | null;
  total_amount: number | null;
  dp_amount: number | null;
  remaining_amount: number | null;
  status: string | null;
  deadline: string | null;
  created_at: string | null;
};

const LOGO =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

function formatRupiah(amount: number | null) {
  return `Rp ${(amount || 0).toLocaleString("id-ID")}`;
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return "Belum ditentukan";

  const date = new Date(`${deadline.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "Belum ditentukan";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "pending":
      return "Menunggu Diproses";
    case "waiting_dp":
      return "Menunggu DP";
    case "processing":
      return "Sedang Diproses";
    case "revision":
      return "Dalam Revisi";
    case "waiting_payment":
      return "Menunggu Pelunasan";
    case "completed":
      return "Selesai";
    case "cancelled":
      return "Dibatalkan";
    default:
      return status || "Menunggu";
  }
}

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [isSubscriptionOrder, setIsSubscriptionOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      try {
        if (!id) {
          if (mounted) {
            setError("ID pesanan tidak ditemukan.");
            setLoading(false);
          }
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (userError || !user) {
          setError("Sesi Anda tidak ditemukan. Silakan login kembali.");
          setLoading(false);
          return;
        }

        const { data, error: orderError } = await supabase
          .from("orders")
          .select(`
            id,
            order_code,
            service_name,
            design_type,
            quantity,
            brief,
            notes,
            total_amount,
            dp_amount,
            remaining_amount,
            status,
            deadline,
            created_at
          `)
          .eq("id", id)
          .eq("customer_id", user.id)
          .maybeSingle();

        if (!mounted) return;

        if (orderError) {
          console.error("Gagal mengambil pesanan:", orderError);
          setError("Pesanan belum dapat dimuat. Silakan coba lagi.");
          setLoading(false);
          return;
        }

        if (!data) {
          setError("Pesanan tidak ditemukan.");
          setLoading(false);
          return;
        }

        const {
          data: subscriptionRequest,
          error: subscriptionError,
        } = await supabase
          .from("subscription_requests")
          .select("id")
          .eq("order_id", data.id)
          .maybeSingle();

        if (!mounted) return;

        if (subscriptionError) {
          console.error(
            "Gagal memeriksa jenis pesanan:",
            subscriptionError
          );
          setError(
            "Jenis pesanan belum dapat diverifikasi. Silakan muat ulang halaman."
          );
          setLoading(false);
          return;
        }

        setIsSubscriptionOrder(Boolean(subscriptionRequest));
        setOrder(data as Order);
      } catch (err) {
        console.error("Kesalahan memuat pesanan:", err);

        if (mounted) {
          setError("Pesanan belum dapat dimuat. Silakan coba lagi.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [id]);

  const accessButtonStyle: React.CSSProperties = {
    width: "100%",
    minWidth: 0,
    minHeight: 54,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "15px 16px",
    border: "1px solid var(--line)",
    borderRadius: 14,
    background: "#fff",
    color: "var(--green)",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.6,
    textAlign: "left",
    textDecoration: "none",
    overflowWrap: "normal",
    wordBreak: "normal",
    transition: "border-color .2s ease, background .2s ease",
  };

  const accessArrowStyle: React.CSSProperties = {
    flexShrink: 0,
    color: "var(--brown)",
    fontSize: 18,
    fontWeight: 500,
  };

  if (loading) {
    return (
      <CustomerLoading
        title="Menyiapkan Detail Pesanan"
        description="Sebentar, kami sedang menyiapkan informasi pesanan Kang/Teh."
      />
    );
  }

  if (error || !order) {
    return (
      <main className="pajara-error-page">
        <div className="pajara-order-detail-card">
          <p className="pajara-eyebrow">PAJARA STUDIO</p>

          <h1>Pesanan tidak dapat ditemukan</h1>

          <p className="pajara-error-description">
            {error || "Pesanan tidak tersedia."}
          </p>

          <a href="/dashboard" className="pajara-error-button">
            Kembali ke Dashboard
          </a>
        </div>

        <style>{`
          .pajara-error-page {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: #F7F4EE;
            font-family: "DM Sans", Arial, sans-serif;
            box-sizing: border-box;
          }

          .pajara-error-page .pajara-order-detail-card {
            width: 100%;
            max-width: 460px;
            padding: 28px;
            box-sizing: border-box;
            text-align: center;
            border: 1px solid rgba(33,77,50,.10);
            border-radius: 20px;
            background: rgba(255,255,255,.9);
            box-shadow: 0 12px 35px rgba(33,77,50,.06);
          }

          .pajara-error-page .pajara-eyebrow {
            color: #8A6A4A;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .16em;
          }

          .pajara-error-page h1 {
            color: #2F6B45;
            font-family: Georgia, serif;
            font-size: 27px;
            font-weight: 500;
          }

          .pajara-error-description {
            color: #778078;
            font-size: 14px;
            line-height: 1.8;
          }

          .pajara-error-button {
            display: inline-flex;
            min-height: 46px;
            align-items: center;
            justify-content: center;
            margin-top: 16px;
            padding: 0 18px;
            border-radius: 12px;
            background: #2F6B45;
            color: #fff;
            font-size: 12px;
            font-weight: 700;
            text-decoration: none;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="pajara-detail-page">
      <header className="pajara-header">
        <div className="pajara-container pajara-header-inner">
          <a href="/dashboard" className="pajara-brand">
            <img
              src={LOGO}
              alt="Logo Pajara Studio"
              className="pajara-header-logo"
            />
            <span>Pajara Studio</span>
          </a>

          <div className="pajara-menu-wrapper">
            <button
              type="button"
              className={`pajara-menu-toggle ${menuOpen ? "is-open" : ""}`}
              aria-label={
                menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
              }
              aria-expanded={menuOpen}
              aria-controls="pajara-detail-menu"
              onClick={() => setMenuOpen((current) => !current)}
            >
              <span />
              <span />
              <span />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  className="pajara-menu-backdrop"
                  aria-label="Tutup menu"
                  onClick={() => setMenuOpen(false)}
                />

                <nav
                  id="pajara-detail-menu"
                  className="pajara-dropdown-menu"
                  aria-label="Navigasi utama"
                >
                  <a
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>Dashboard</span>
                    <span className="pajara-menu-arrow">↗</span>
                  </a>

                  <a
                    href="/order"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>Pesan Desain</span>
                    <span className="pajara-menu-arrow">↗</span>
                  </a>
                </nav>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="pajara-order-detail">
        <div className="pajara-container pajara-detail-container">
          <div className="pajara-order-detail-header">
            <p className="pajara-eyebrow">DETAIL PESANAN</p>

            <h1>
              Pesanan <span>Pajara.</span>
            </h1>

            <p className="pajara-detail-description">
              Pantau status project, revisi, dan file desain Anda dari satu
              tempat.
            </p>
          </div>

          <div className="pajara-order-detail-grid">
            <div className="pajara-detail-column">
              <div className="pajara-order-detail-card">
                <div className="pajara-order-id-row">
                  <div className="pajara-order-id-info">
                    <p className="pajara-eyebrow">ID PESANAN</p>
                    <h2>#{order.order_code}</h2>
                  </div>

                  <span className="pajara-order-status">
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">RINGKASAN</p>
                <h2>Informasi Pesanan</h2>

                {isSubscriptionOrder && (
                  <div className="pajara-subscription-notice">
                    Pesanan ini menggunakan kuota paket Anda. Tidak ada
                    pembayaran tambahan per desain.
                  </div>
                )}

                <div className="pajara-information-list">
                  <div>
                    <p className="pajara-eyebrow">LAYANAN</p>
                    <strong>{order.service_name || "Belum ditentukan"}</strong>
                  </div>

                  <div>
                    <p className="pajara-eyebrow">JENIS DESAIN</p>
                    <strong>{order.design_type || "Belum ditentukan"}</strong>
                  </div>

                  <div>
                    <p className="pajara-eyebrow">JUMLAH DESAIN</p>
                    <strong>{order.quantity || 1} desain</strong>
                  </div>

                  <div>
                    <p className="pajara-eyebrow">STATUS PROJECT</p>
                    <strong>{getStatusLabel(order.status)}</strong>
                  </div>

                  <div>
                    <p className="pajara-eyebrow">DEADLINE</p>
                    <strong>{formatDeadline(order.deadline)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="pajara-detail-column">
              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">AKSES PESANAN</p>
                <h2>Kelola Project</h2>

                <p className="pajara-access-description">
                  Buka informasi project dan file desain Anda saat diperlukan.
                </p>

                <div className="pajara-access-list">
                  {!isSubscriptionOrder && (
                    <a
                      href={`/orders/payment?id=${encodeURIComponent(order.id)}`}
                      className="pajara-access-button"
                      style={accessButtonStyle}
                    >
                      <span>Pembayaran</span>
                      <span style={accessArrowStyle}>→</span>
                    </a>
                  )}

                  <a
                    href={`/orders/revision?id=${encodeURIComponent(order.id)}`}
                    className="pajara-access-button"
                    style={accessButtonStyle}
                  >
                    <span>Revisi</span>
                    <span style={accessArrowStyle}>→</span>
                  </a>

                  <a
                    href={`/orders/brief?id=${encodeURIComponent(order.id)}`}
                    className="pajara-access-button"
                    style={accessButtonStyle}
                  >
                    <span>Lihat Brief Desain</span>
                    <span style={accessArrowStyle}>→</span>
                  </a>

                  <a
                    href={`/orders/final-files?id=${encodeURIComponent(order.id)}`}
                    className="pajara-access-button"
                    style={accessButtonStyle}
                  >
                    <span>Lihat File Final Anda</span>
                    <span style={accessArrowStyle}>→</span>
                  </a>

                  <a
                    href={`/orders/files?id=${encodeURIComponent(order.id)}`}
                    className="pajara-access-button"
                    style={accessButtonStyle}
                  >
                    <span>File Referensi Pesanan</span>
                    <span style={accessArrowStyle}>→</span>
                  </a>
                </div>
              </div>

              {!isSubscriptionOrder && (
                <div className="pajara-order-detail-card">
                  <p className="pajara-eyebrow">PEMBAYARAN</p>
                  <h2>Ringkasan Biaya</h2>

                  <div className="pajara-payment-list">
                    <div>
                      <span>Total</span>
                      <strong>{formatRupiah(order.total_amount)}</strong>
                    </div>

                    <div>
                      <span>DP</span>
                      <strong>{formatRupiah(order.dp_amount)}</strong>
                    </div>

                    <div className="pajara-payment-remaining">
                      <span>Sisa</span>
                      <strong>
                        {formatRupiah(order.remaining_amount)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="pajara-footer">
        <div className="pajara-container pajara-footer-inner">
          <div className="pajara-footer-brand">
            <img
              src={LOGO}
              alt="Logo Pajara Studio"
              className="pajara-footer-logo"
            />

            <div className="pajara-footer-copy">
              <strong>Pajara Studio</strong>
              <p>Berakar di Tanah Pasundan.</p>
              <small>
                © 2026 Pajara Studio. Desain yang punya arah.
              </small>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .pajara-detail-page {
          --cream: #F7F4EE;
          --green: #2F6B45;
          --dark-green: #214D32;
          --brown: #8A6A4A;
          --text: #243329;
          --muted: #778078;
          --line: rgba(33,77,50,.10);
          --soft: #EDF4EE;

          min-width: 0;
          width: 100%;
          overflow-x: clip;
          background: var(--cream);
          color: var(--text);
          font-family: "DM Sans", Arial, sans-serif;
        }

        .pajara-detail-page,
        .pajara-detail-page * {
          box-sizing: border-box;
          font-family: "DM Sans", Arial, sans-serif;
        }

        .pajara-detail-page h1,
        .pajara-detail-page h2,
        .pajara-detail-page h3 {
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 500;
        }

        .pajara-container {
          width: 100%;
          max-width: 1160px;
          margin-inline: auto;
          padding-inline: clamp(18px, 4vw, 28px);
        }

        /* NAVBAR GLASS */

        .pajara-header {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid rgba(47,107,69,.10);
          background: rgba(247,244,238,.62);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          box-shadow: 0 5px 24px rgba(33,77,50,.025);
        }

        .pajara-header-inner {
          display: flex;
          min-height: 68px;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          position: relative;
        }

        .pajara-brand {
          display: inline-flex !important;
          min-width: 0;
          align-items: center;
          gap: 10px;
          color: #214D32;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
        }

        .pajara-header-logo {
          display: block !important;
          width: 39px !important;
          height: 39px !important;
          min-width: 39px !important;
          max-width: 39px !important;
          min-height: 39px !important;
          max-height: 39px !important;
          flex: 0 0 39px !important;
          border-radius: 12px;
          object-fit: cover;
        }

        .pajara-menu-wrapper {
          position: relative;
          z-index: 52;
        }

        .pajara-menu-toggle {
          display: flex;
          width: 43px;
          height: 43px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 0;
          border: 1px solid rgba(47,107,69,.16);
          border-radius: 12px;
          background: rgba(255,255,255,.48);
          cursor: pointer;
          transition: background .2s ease, border-color .2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .pajara-menu-toggle:hover {
          border-color: rgba(47,107,69,.35);
          background: rgba(255,255,255,.85);
        }

        .pajara-menu-toggle span {
          display: block;
          width: 18px;
          height: 2px;
          border-radius: 5px;
          background: #214D32;
          transition: transform .2s ease, opacity .2s ease;
        }

        .pajara-menu-toggle.is-open span:first-child {
          transform: translateY(7px) rotate(45deg);
        }

        .pajara-menu-toggle.is-open span:nth-child(2) {
          opacity: 0;
        }

        .pajara-menu-toggle.is-open span:last-child {
          transform: translateY(-7px) rotate(-45deg);
        }

        .pajara-menu-backdrop {
          position: fixed;
          inset: 0;
          z-index: -1;
          width: 100vw;
          height: 100vh;
          border: 0;
          background: transparent;
          cursor: default;
        }

        .pajara-dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          z-index: 55;
          width: 220px;
          padding: 8px;
          border: 1px solid rgba(33,77,50,.1);
          border-radius: 16px;
          background: rgba(255,255,255,.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 16px 40px rgba(33,77,50,.12);
          animation: pajara-menu-in .18s ease-out;
        }

        .pajara-dropdown-menu a {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 13px 12px;
          border-radius: 10px;
          color: #214D32;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: background .2s ease;
        }

        .pajara-dropdown-menu a:hover {
          background: #F1F5F0;
        }

        .pajara-menu-arrow {
          color: #8A6A4A;
          font-size: 15px;
        }

        @keyframes pajara-menu-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* DETAIL PESANAN */

        .pajara-order-detail {
          width: 100%;
          box-sizing: border-box;
          overflow-x: clip;
        }

        .pajara-detail-container {
          padding-top: 32px;
          padding-bottom: 24px;
          min-width: 0;
        }

        .pajara-order-detail-header {
          display: block;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          margin: 0 0 28px;
          padding: 0;
          text-align: left;
          overflow-wrap: break-word;
        }

        .pajara-detail-page .pajara-eyebrow {
          display: block;
          margin: 0 0 10px;
          color: #8A6A4A;
          font-size: 10px;
          font-weight: 800;
          line-height: 1.6;
          letter-spacing: .16em;
        }

        .pajara-order-detail-header h1 {
          display: block;
          width: 100%;
          max-width: 100%;
          margin: 0 0 12px;
          padding: 0;
          color: #243329;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(32px, 5vw, 46px);
          line-height: 1.2;
          font-weight: 500;
          letter-spacing: -1px;
        }

        .pajara-order-detail-header h1 span {
          color: #2F6B45;
          font-style: italic;
        }

        .pajara-detail-description {
          display: block;
          width: 100%;
          max-width: 560px;
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.8;
        }

        .pajara-order-detail-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
          gap: 24px;
          align-items: start;
          width: 100%;
          min-width: 0;
        }

        .pajara-detail-column {
          display: grid;
          gap: 20px;
          min-width: 0;
        }

        .pajara-order-detail-card {
          min-width: 0;
          padding: 26px;
          overflow-wrap: break-word;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: rgba(255,255,255,.88);
          box-shadow: 0 7px 25px rgba(33,77,50,.035);
        }

        .pajara-order-detail-card h2 {
          margin: 0;
          color: var(--green);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          line-height: 1.35;
          font-weight: 500;
        }

        .pajara-order-id-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          min-width: 0;
        }

        .pajara-order-id-info {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .pajara-order-id-info h2 {
          margin-top: 8px;
          overflow-wrap: anywhere;
        }

        .pajara-order-status {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          padding: 9px 13px;
          border-radius: 30px;
          background: #EDF4EE;
          color: #2F6B45;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.5;
        }

        .pajara-subscription-notice {
          margin-top: 16px;
          padding: 14px;
          border-radius: 12px;
          background: var(--soft);
          color: var(--green);
          font-size: 13px;
          line-height: 1.8;
        }

        .pajara-information-list {
          display: grid;
          gap: 18px;
          margin-top: 22px;
        }

        .pajara-information-list > div {
          min-width: 0;
        }

        .pajara-information-list .pajara-eyebrow {
          margin-bottom: 5px;
        }

        .pajara-information-list strong {
          color: #243329;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }

        .pajara-access-description {
          margin: 10px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.8;
        }

        .pajara-access-list {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 12px;
          width: 100%;
          min-width: 0;
          margin-top: 22px;
        }

        .pajara-access-button {
          white-space: normal;
          word-break: normal !important;
          overflow-wrap: break-word;
        }

        .pajara-access-button > span:first-child {
          flex: 1 1 auto;
          min-width: 0;
        }

        .pajara-payment-list {
          display: grid;
          gap: 14px;
          margin-top: 20px;
        }

        .pajara-payment-list > div {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          font-size: 13px;
        }

        .pajara-payment-list span {
          color: var(--muted);
          line-height: 1.7;
        }

        .pajara-payment-list strong {
          color: #243329;
          text-align: right;
          line-height: 1.7;
        }

        .pajara-payment-list .pajara-payment-remaining {
          padding-top: 14px;
          border-top: 1px solid var(--line);
        }

        .pajara-payment-remaining strong {
          color: var(--green);
        }

        /* FOOTER PAJARA */

        .pajara-footer {
          width: 100%;
          border-top: 1px solid rgba(33,77,50,.10);
          background: rgba(255,255,255,.32);
        }

        .pajara-footer-inner {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 20px;
          padding-top: 23px;
          padding-bottom: 23px;
        }

        .pajara-footer-brand {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 13px;
        }

        .pajara-footer-logo {
          display: block;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          border-radius: 11px;
          object-fit: cover;
          background: #fff;
        }

        .pajara-footer-copy {
          min-width: 0;
        }

        .pajara-footer-copy strong {
          display: block;
          color: #214D32;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.5;
        }

        .pajara-footer-copy p {
          margin: 3px 0 0;
          color: #8A6A4A;
          font-size: 11px;
          line-height: 1.5;
        }

        .pajara-footer-copy small {
          display: block;
          margin-top: 4px;
          color: #999387;
          font-size: 10px;
          line-height: 1.5;
        }

        @media (max-width: 760px) {
          .pajara-order-detail-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
          }

          .pajara-detail-column {
            width: 100%;
            min-width: 0;
          }

          .pajara-order-detail-card {
            width: 100%;
            padding: clamp(20px, 5vw, 26px);
          }

          .pajara-order-detail-header h1 {
            font-size: clamp(32px, 8vw, 40px);
          }
        }

        @media (max-width: 520px) {
          .pajara-footer-inner {
            align-items: flex-start;
            flex-direction: column;
            gap: 17px;
          }
        }

        @media (max-width: 420px) {
          .pajara-header-inner {
            min-height: 64px;
          }

          .pajara-brand {
            gap: 8px;
            font-size: 14px;
          }

          .pajara-header-logo {
            width: 36px !important;
            height: 36px !important;
            min-width: 36px !important;
            max-width: 36px !important;
            min-height: 36px !important;
            max-height: 36px !important;
            flex-basis: 36px !important;
          }

          .pajara-menu-toggle {
            width: 40px;
            height: 40px;
          }

          .pajara-detail-container {
            padding-top: 26px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pajara-menu-toggle,
          .pajara-menu-toggle span,
          .pajara-dropdown-menu,
          .pajara-dropdown-menu a {
            animation: none;
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}

function OrderDetailFallback() {
  return (
    <CustomerLoading
      title="Menyiapkan Detail Pesanan"
      description="Sebentar, kami sedang menyiapkan informasi pesanan Kang/Teh."
    />
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<OrderDetailFallback />}>
      <OrderDetailContent />
    </Suspense>
  );
}
