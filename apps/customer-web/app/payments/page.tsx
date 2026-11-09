"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@pajara/supabase";
import CustomerLoading from "../components/CustomerLoading";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  total_amount: number | null;
  dp_amount: number | null;
  remaining_amount: number | null;
  status: string | null;
  created_at: string | null;
};

const logo = "/755809946_17926162029385149_3739923509439876817_n.jpg";

function formatRupiah(value: number | null) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function statusLabel(status: string | null) {
  const labels: Record<string, string> = {
    waiting_dp: "Menunggu DP",
    waiting_payment: "Menunggu Pelunasan",
    processing: "Sedang Diproses",
    revision: "Revisi",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    pending: "Menunggu Konfirmasi",
    approved: "Disetujui",
    active: "Aktif",
    rejected: "Ditolak",
    expired: "Kedaluwarsa",
  };

  return status ? labels[status] || status : "Belum Ada Status";
}

export default function PaymentsPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadPayments() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const { data, error: ordersError } = await supabase
          .from("orders")
          .select(
            "id, order_code, service_name, total_amount, dp_amount, remaining_amount, status, created_at"
          )
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false });

        if (ordersError) {
          throw new Error(
            "Data pembayaran pesanan gagal dimuat: " +
              ordersError.message
          );
        }

        if (mounted) {
          setOrders(data || []);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan saat memuat pembayaran."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPayments();

    return () => {
      mounted = false;
    };
  }, [router]);

  const waitingOrders = orders.filter(
    (order) =>
      order.status === "waiting_dp" ||
      order.status === "waiting_payment"
  );

  const totalOutstanding = waitingOrders.reduce((total, order) => {
    if (order.status === "waiting_dp") {
      return total + (order.dp_amount || 0);
    }

    return total + (order.remaining_amount || 0);
  }, 0);

  if (loading) {
    return (
      <CustomerLoading
        title="Menyiapkan Pembayaran"
        description="Sebentar, kami sedang menyiapkan informasi tagihan Kang/Teh."
      />
    );
  }

  return (
    <main className="payments-page">
      <style jsx global>{`
        .payments-page {
          min-height: 100vh;
          padding: 0 16px 110px;
          background: #f7f4ee;
          color: #243329;
          font-family: "DM Sans", Arial, sans-serif;
        }

        .payments-page *,
        .payments-page *::before,
        .payments-page *::after {
          box-sizing: border-box;
        }

        .payments-page button {
          font-family: inherit;
          -webkit-tap-highlight-color: transparent;
          transition:
            transform 160ms ease,
            opacity 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .payments-page button:active {
          transform: scale(0.98);
        }

        .payments-container {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
        }

        /* NAVBAR */

        .dashboard-header {
          position: sticky;
          top: 0;
          z-index: 100;
          margin: 0 -16px;
          padding: 0 16px;
          border-bottom: 1px solid rgba(47, 107, 69, 0.1);
          background: rgba(247, 244, 238, 0.88);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
          backdrop-filter: blur(22px) saturate(160%);
          transition: background 0.3s ease;
        }

        .dashboard-header-inner {
          display: flex;
          width: 100%;
          max-width: 760px;
          min-height: 70px;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 0 auto;
        }

        .dashboard-brand {
          display: inline-flex;
          min-width: 0;
          align-items: center;
          gap: 10px;
          color: #214d32;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
        }

        .dashboard-logo {
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

        .dashboard-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-shrink: 0;
        }

        .dashboard-menu-button {
          display: flex;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          border: 1px solid rgba(47, 107, 69, 0.2);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.55);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dashboard-menu-button:hover {
          border-color: #2f6b45;
          background: #fff;
        }

        .dashboard-menu-button span {
          display: block;
          width: 17px;
          height: 2px;
          border-radius: 5px;
          background: #214d32;
          transition: transform 0.2s ease;
        }

        .dashboard-menu-button.is-open span:first-child {
          transform: translateY(3.5px) rotate(45deg);
        }

        .dashboard-menu-button.is-open span:last-child {
          transform: translateY(-3.5px) rotate(-45deg);
        }

        .dashboard-header-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          flex-shrink: 0;
          min-height: 42px;
          padding: 10px 14px;
          border: 1px solid rgba(47, 107, 69, 0.2);
          border-radius: 10px;
          background: #214d32;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .dashboard-header-link:hover {
          border-color: #2f6b45;
          background: #2f6b45;
        }

        .dashboard-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          width: min(760px, calc(100% - 32px));
          padding: 13px;
          border: 1px solid rgba(47, 107, 69, 0.12);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 12px 35px rgba(33, 77, 50, 0.12);
          transform: translateX(-50%);
          animation: paymentsMenuIn 0.18s ease;
        }

        @keyframes paymentsMenuIn {
          from {
            opacity: 0;
            transform: translate(-50%, -5px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .dashboard-menu-label {
          margin: 2px 9px 9px;
          color: #999487;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .dashboard-menu-link {
          display: flex;
          width: 100%;
          min-height: 43px;
          align-items: center;
          justify-content: space-between;
          padding: 10px 11px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #214d32;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          text-align: left;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .dashboard-menu-link:hover,
        .dashboard-menu-link.active {
          background: #f1f5ed;
        }

        .dashboard-menu-link span {
          color: #8a6a4a;
        }

        /* CONTENT */

        .payments-header {
          margin-bottom: 26px;
          padding-top: 24px;
          animation: paymentsFadeUp 350ms ease both;
        }

        .payments-eyebrow {
          margin: 0 0 9px;
          color: #8a6a4a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }

        .payments-title {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(32px, 7vw, 43px);
          font-weight: 500;
          letter-spacing: -1.2px;
          line-height: 1.15;
        }

        .payments-subtitle {
          max-width: 450px;
          margin: 12px 0 25px;
          color: #778078;
          font-size: 13px;
          line-height: 1.8;
        }

        .payments-summary {
          display: grid;
          gap: 9px;
          margin-bottom: 34px;
          padding: 25px;
          border-radius: 22px;
          background: linear-gradient(
            135deg,
            #214d32 0%,
            #2f6b45 72%,
            #467a56 100%
          );
          color: #fff;
          box-shadow: 0 12px 28px rgba(33, 77, 50, 0.12);
          animation: paymentsFadeUp 450ms ease both;
        }

        .payments-summary-label {
          color: rgba(255, 255, 255, 0.76);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .payments-summary-amount {
          color: #fff;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(28px, 7vw, 38px);
          font-weight: 700;
          letter-spacing: -0.04em;
          overflow-wrap: anywhere;
        }

        .payments-summary-description {
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          line-height: 1.6;
        }

        .payments-section {
          margin-bottom: 34px;
        }

        .payments-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .payments-section-eyebrow {
          margin-bottom: 5px;
          color: #8a6a4a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .payments-section-title {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          letter-spacing: -0.025em;
        }

        .payments-count {
          display: grid;
          width: 32px;
          height: 32px;
          min-width: 32px;
          place-items: center;
          border-radius: 50%;
          background: #e8eee7;
          color: #214d32;
          font-size: 12px;
          font-weight: 800;
        }

        .payments-list {
          display: grid;
          gap: 13px;
        }

        .payments-order-card {
          padding: 21px;
          border: 1px solid #e8e2d8;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 4px 14px rgba(33, 77, 50, 0.035);
          animation: paymentsFadeUp 350ms ease both;
        }

        .payments-order-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 16px;
        }

        .payments-order-icon {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border-radius: 13px;
          background: #edf3ec;
          color: #2f6b45;
        }

        .payments-status {
          display: inline-flex;
          align-items: center;
          border-radius: 20px;
          padding: 7px 10px;
          font-size: 10px;
          font-weight: 800;
          text-align: center;
        }

        .payments-status-pending {
          background: #fbf0df;
          color: #8a5b20;
        }

        .payments-status-normal {
          background: #edf3ec;
          color: #2f6b45;
        }

        .payments-order-code {
          margin-bottom: 5px;
          color: #88877e;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.07em;
          overflow-wrap: anywhere;
        }

        .payments-card-title {
          margin: 0 0 8px;
          color: #214d32;
          font-size: 16px;
          font-weight: 800;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .payments-card-description {
          margin: 0 0 15px;
          color: #777970;
          font-size: 13px;
          line-height: 1.7;
        }

        .payments-amount-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-top: 15px;
          margin-bottom: 17px;
          padding-top: 15px;
          border-top: 1px solid #eee9e0;
        }

        .payments-muted {
          color: #777970;
          font-size: 12px;
        }

        .payments-order-amount {
          color: #214d32;
          font-size: 14px;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .payments-primary-button,
        .payments-secondary-button {
          display: block;
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 800;
          text-align: center;
          cursor: pointer;
          box-sizing: border-box;
        }

        .payments-primary-button {
          border: none;
          background: #2f6b45;
          color: #fff;
        }

        .payments-primary-button:hover {
          background: #214d32;
        }

        .payments-secondary-button {
          border: 1px solid #dce5da;
          background: #f7faf6;
          color: #214d32;
        }

        .payments-secondary-button:hover {
          background: #edf3ec;
        }

        .payments-empty {
          padding: 28px 22px;
          border: 1px solid #e8e2d8;
          border-radius: 18px;
          background: #fff;
          text-align: center;
        }

        .payments-empty-icon {
          display: grid;
          width: 48px;
          height: 48px;
          place-items: center;
          margin: 0 auto 15px;
          border-radius: 16px;
          background: #edf3ec;
          color: #2f6b45;
          font-size: 28px;
        }

        .payments-package-card {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 14px;
          padding: 22px;
          border: 1px solid #e8e2d8;
          border-radius: 18px;
          background: #fff;
        }

        .payments-package-icon {
          display: grid;
          width: 48px;
          height: 48px;
          place-items: center;
          border-radius: 15px;
          background: #edf3ec;
          color: #2f6b45;
        }

        .payments-helper {
          margin: 12px 2px 0;
          color: #85847b;
          font-size: 12px;
          line-height: 1.7;
        }

        .payments-error {
          margin-bottom: 20px;
          padding: 17px;
          border: 1px solid #ead0c9;
          border-radius: 14px;
          background: #fff3f0;
          color: #8a3d2f;
          font-size: 13px;
          line-height: 1.6;
        }

        .payments-retry-button {
          margin-top: 12px;
          padding: 9px 13px;
          border: 1px solid #d8aaa0;
          border-radius: 9px;
          background: #fff;
          color: #8a3d2f;
          font-weight: 700;
          cursor: pointer;
        }

        /* FOOTER */

        .payments-footer {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 36px;
          border-top: 1px solid #e4ddd1;
          padding-top: 22px;
        }

        .payments-footer-logo {
          display: block;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          border-radius: 10px;
          background: #fff;
          object-fit: contain;
        }

        .payments-footer-copy {
          min-width: 0;
        }

        .payments-footer-title {
          display: block;
          color: #214d32;
          font-size: 13px;
          line-height: 1.5;
        }

        .payments-footer-text {
          margin: 4px 0 0;
          color: #8a6a4a;
          font-size: 11px;
          line-height: 1.5;
        }

        .payments-footer-copyright {
          display: block;
          margin-top: 3px;
          color: #999387;
          font-size: 10px;
          line-height: 1.5;
        }

        @keyframes paymentsFadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 420px) {
          .dashboard-header-inner {
            gap: 8px;
          }

          .dashboard-brand {
            gap: 8px;
            font-size: 13px;
          }

          .dashboard-header-actions {
            gap: 7px;
          }

          .dashboard-header-link {
            padding: 10px 11px;
            font-size: 10px;
          }
        }

        @media (max-width: 380px) {
          .payments-page {
            padding-right: 12px;
            padding-left: 12px;
          }

          .dashboard-header {
            margin-right: -12px;
            margin-left: -12px;
            padding-right: 12px;
            padding-left: 12px;
          }

          .payments-summary {
            padding: 22px 19px;
          }

          .payments-order-card {
            padding: 17px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .payments-page *,
          .payments-page *::before,
          .payments-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <header className="dashboard-header">
        <div className="dashboard-container dashboard-header-inner">
          <a href="/" className="dashboard-brand">
            <Image
              src={logo}
              alt="Logo Pajara Studio"
              width={39}
              height={39}
              unoptimized
              className="dashboard-logo"
            />
            <span>Pajara Studio</span>
          </a>

          <div className="dashboard-header-actions">
            <button
              type="button"
              className={`dashboard-menu-button ${
                menuOpen ? "is-open" : ""
              }`}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              <span />
              <span />
            </button>

            <button
              type="button"
              className="dashboard-header-link"
              onClick={() => router.push("/order")}
            >
              Pesan Desain <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="dashboard-menu" aria-label="Navigasi dashboard">
            <p className="dashboard-menu-label">MENU PELANGGAN</p>

            <button
              type="button"
              className="dashboard-menu-link"
              onClick={() => {
                setMenuOpen(false);
                router.push("/dashboard");
              }}
            >
              Dashboard <span>↗</span>
            </button>

            <button
              type="button"
              className="dashboard-menu-link"
              onClick={() => {
                setMenuOpen(false);
                router.push("/orders/list");
              }}
            >
              Pesanan Saya <span>↗</span>
            </button>

            <button
              type="button"
              className="dashboard-menu-link"
              onClick={() => {
                setMenuOpen(false);
                router.push("/subscriptions");
              }}
            >
              Paket Desain <span>↗</span>
            </button>

            <button
              type="button"
              className="dashboard-menu-link active"
              onClick={() => {
                setMenuOpen(false);
                router.push("/payments");
              }}
            >
              Pembayaran <span>↗</span>
            </button>
          </nav>
        )}
      </header>

      <div className="payments-container">
        <header className="payments-header">
          <div className="payments-eyebrow">PAJARA STUDIO</div>

          <h1 className="payments-title">Pembayaran</h1>

          <p className="payments-subtitle">
            Kelola pembayaran desain dan paket Pajara dalam satu tempat.
          </p>
        </header>

        {error && (
          <div className="payments-error" role="alert">
            <strong>Belum dapat memuat data</strong>
            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="payments-retry-button"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!error && (
          <>
            <section className="payments-summary">
              <div className="payments-summary-label">
                TOTAL TAGIHAN PESANAN
              </div>

              <div className="payments-summary-amount">
                {formatRupiah(totalOutstanding)}
              </div>

              <p className="payments-summary-description">
                {waitingOrders.length > 0
                  ? `${waitingOrders.length} pesanan membutuhkan pembayaran.`
                  : "Tidak ada tagihan pesanan yang menunggu pembayaran."}
              </p>
            </section>

            <section className="payments-section">
              <div className="payments-section-header">
                <div>
                  <div className="payments-section-eyebrow">DESAIN</div>
                  <h2 className="payments-section-title">
                    Pembayaran Pesanan
                  </h2>
                </div>

                <span className="payments-count">{orders.length}</span>
              </div>

              {orders.length === 0 ? (
                <div className="payments-empty">
                  <div className="payments-empty-icon">◇</div>

                  <h3 className="payments-card-title">
                    Belum ada pesanan
                  </h3>

                  <p className="payments-card-description">
                    Pesanan desain yang kamu buat akan muncul di sini.
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push("/order")}
                    className="payments-primary-button"
                  >
                    Buat Pesanan
                  </button>
                </div>
              ) : (
                <div className="payments-list">
                  {orders.map((order) => {
                    const needsPayment =
                      order.status === "waiting_dp" ||
                      order.status === "waiting_payment";

                    const amount =
                      order.status === "waiting_dp"
                        ? order.dp_amount
                        : order.status === "waiting_payment"
                          ? order.remaining_amount
                          : 0;

                    return (
                      <article
                        key={order.id}
                        className="payments-order-card"
                      >
                        <div className="payments-order-top">
                          <div className="payments-order-icon">
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <rect
                                x="4"
                                y="3"
                                width="16"
                                height="18"
                                rx="2"
                              />
                              <path d="M8 8h8M8 12h8M8 16h4" />
                            </svg>
                          </div>

                          <span
                            className={`payments-status ${
                              needsPayment
                                ? "payments-status-pending"
                                : "payments-status-normal"
                            }`}
                          >
                            {statusLabel(order.status)}
                          </span>
                        </div>

                        <div className="payments-order-code">
                          {order.order_code}
                        </div>

                        <h3 className="payments-card-title">
                          {order.service_name || "Layanan Pajara Studio"}
                        </h3>

                        <div className="payments-amount-row">
                          <span className="payments-muted">
                            {order.status === "waiting_dp"
                              ? "Tagihan DP"
                              : order.status === "waiting_payment"
                                ? "Tagihan pelunasan"
                                : "Total pesanan"}
                          </span>

                          <strong className="payments-order-amount">
                            {formatRupiah(
                              needsPayment ? amount : order.total_amount
                            )}
                          </strong>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/orders/payment?id=${encodeURIComponent(
                                order.id
                              )}`
                            )
                          }
                          className={
                            needsPayment
                              ? "payments-primary-button"
                              : "payments-secondary-button"
                          }
                        >
                          {needsPayment
                            ? "Buka Pembayaran →"
                            : "Lihat Detail Pembayaran →"}
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="payments-section">
              <div className="payments-section-header">
                <div>
                  <div className="payments-section-eyebrow">
                    LANGGANAN
                  </div>

                  <h2 className="payments-section-title">
                    Pembayaran Paket
                  </h2>
                </div>
              </div>

              <div className="payments-package-card">
                <div className="payments-package-icon">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="7"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path d="M16 3l-4 4-4-4M3 12h18" />
                  </svg>
                </div>

                <div>
                  <h3 className="payments-card-title">Paket Pajara</h3>

                  <p className="payments-card-description">
                    Lihat permintaan paket, status, dan proses pembayaran
                    paket mingguan atau bulanan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/subscriptions")}
                  className="payments-primary-button"
                >
                  Buka Paket →
                </button>
              </div>

              <p className="payments-helper">
                Pembayaran paket dikelola melalui halaman Paket agar
                proses dan status langganan tetap tersinkron.
              </p>
            </section>

            <footer className="payments-footer">
              <Image
                src={logo}
                alt="Logo Pajara Studio"
                width={43}
                height={43}
                unoptimized
                className="payments-footer-logo"
              />

              <div className="payments-footer-copy">
                <strong className="payments-footer-title">
                  Pajara Studio
                </strong>

                <p className="payments-footer-text">
                  Berakar di Tanah Pasundan.
                </p>

                <small className="payments-footer-copyright">
                  © 2026 Pajara Studio. Desain yang punya arah.
                </small>
              </div>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
