
"use client";

import "./orders-list.css";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@pajara/supabase";
import CustomerLoading from "../../components/CustomerLoading";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  quantity: number | null;
  status: string | null;
  deadline: string | null;
  created_at: string | null;
};

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

/* ========================================
   ORDER HELPERS
======================================== */

function statusLabel(status: string | null) {
  const labels: Record<string, string> = {
    pending: "Pesanan Baru",
    waiting_dp: "Menunggu DP",
    processing: "Sedang Diproses",
    revision: "Dalam Revisi",
    waiting_payment: "Menunggu Pelunasan",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return status ? labels[status] || status : "Menunggu";
}

function statusStyle(status: string | null) {
  if (status === "completed") {
    return {
      background: "#e7f4e9",
      color: "#246338",
      dot: "#3a8950",
    };
  }

  if (status === "cancelled") {
    return {
      background: "#fbe9e7",
      color: "#a33e35",
      dot: "#c34c43",
    };
  }

  if (status === "revision") {
    return {
      background: "#fff1d8",
      color: "#94601c",
      dot: "#c78b2d",
    };
  }

  if (status === "waiting_payment" || status === "waiting_dp") {
    return {
      background: "#fff3df",
      color: "#95621d",
      dot: "#c78b2d",
    };
  }

  if (status === "processing") {
    return {
      background: "#e7efff",
      color: "#365c9b",
      dot: "#5079bb",
    };
  }

  return {
    background: "#edf3ed",
    color: "#456b4d",
    dot: "#6e9775",
  };
}

function formatDate(value: string | null) {
  if (!value) return "Belum ditentukan";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Belum ditentukan";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ========================================
   ORDER LIST PAGE
======================================== */

export default function OrderListPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const request = async () => {
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError) {
          throw authError;
        }

        if (!session?.user) {
          return {
            type: "auth" as const,
            orders: [] as Order[],
          };
        }

        const { data, error: queryError } = await supabase
          .from("orders")
          .select(
            "id, order_code, service_name, design_type, quantity, status, deadline, created_at"
          )
          .eq("customer_id", session.user.id)
          .order("created_at", { ascending: false });

        if (queryError) {
          throw queryError;
        }

        return {
          type: "success" as const,
          orders: (data || []) as Order[],
        };
      };

      const result = await Promise.race([
        request(),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("timeout"));
          }, 15000);
        }),
      ]);

      if (result.type === "auth") {
        setError("Sesi Anda tidak ditemukan. Silakan login kembali.");
        return;
      }

      setOrders(result.orders);
    } catch (err) {
      console.error("Gagal memuat daftar pesanan:", err);

      if (err instanceof Error && err.message === "timeout") {
        setError(
          "Koneksi terlalu lama. Silakan periksa internet Kang/Teh lalu coba kembali."
        );
      } else {
        setError(
          "Pesanan gagal dimuat. Periksa koneksi lalu coba kembali."
        );
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const activeOrders = orders.filter(
    (order) =>
      !["completed", "cancelled"].includes(order.status || "")
  );

  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  );

  const filteredOrders =
    filter === "active"
      ? activeOrders
      : filter === "completed"
        ? completedOrders
        : orders;

  if (loading) {
    return (
      <CustomerLoading
        title="Menyiapkan Pesanan"
        description="Sebentar, kami sedang menyiapkan ruang pesanan Kang/Teh."
      />
    );
  }

  return (
    <main className="order-page">
      <style jsx>{`
        .order-page,
        .order-page *,
        .order-page *::before,
        .order-page *::after {
          box-sizing: border-box;
        }

        .order-page {
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          margin: 0;
          padding: 0 16px 36px;
          overflow-x: clip;
          background: #f7f4ee;
          color: #243329;
          font-family: "DM Sans", Arial, sans-serif;
          font-size: 14px;
          line-height: 1.5;
        }

        .order-page a,
        .order-page button {
          font-family: "DM Sans", Arial, sans-serif;
          -webkit-tap-highlight-color: transparent;
        }

        .dashboard-header {
          position: sticky;
          top: 0;
          z-index: 100;
          display: block;
          width: calc(100% + 32px);
          margin: 0 0 0 -16px;
          border-bottom: 1px solid rgba(47, 107, 69, 0.1);
          background: rgba(247, 244, 238, 0.88);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
          backdrop-filter: blur(22px) saturate(160%);
          transition: background 0.3s ease;
        }

        .dashboard-container {
          width: min(100% - 32px, 680px);
          margin: 0 auto;
        }

        .dashboard-header-inner {
          display: flex;
          min-height: 70px;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .dashboard-brand {
          display: inline-flex;
          min-width: 0;
          flex: 0 1 auto;
          align-items: center;
          gap: 10px;
          color: #214d32;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.3;
          text-decoration: none;
          white-space: nowrap;
        }

        .dashboard-brand span {
          display: inline-block;
          margin: 0;
          padding: 0;
          color: #214d32;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.3;
          white-space: nowrap;
        }

        .dashboard-logo {
          display: block;
          width: 39px;
          height: 39px;
          min-width: 39px;
          max-width: 39px;
          min-height: 39px;
          max-height: 39px;
          flex: 0 0 39px;
          margin: 0;
          padding: 0;
          border-radius: 12px;
          object-fit: cover;
          object-position: center;
        }

        .dashboard-header-actions {
          display: flex;
          flex: 0 0 auto;
          align-items: center;
          justify-content: flex-end;
          gap: 9px;
        }

        .dashboard-menu-button {
          display: flex;
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          margin: 0;
          padding: 0;
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
          margin: 0;
          padding: 0;
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
          min-height: 42px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 14px;
          border: 1px solid rgba(47, 107, 69, 0.2);
          border-radius: 10px;
          background: #214d32;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.3;
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
          z-index: 101;
          width: min(680px, calc(100% - 32px));
          margin: 0;
          padding: 13px;
          border: 1px solid rgba(47, 107, 69, 0.12);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 12px 35px rgba(33, 77, 50, 0.12);
          transform: translateX(-50%);
          animation: order-menu-in 0.18s ease;
        }

        @keyframes order-menu-in {
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
          line-height: 1.5;
          letter-spacing: 1.5px;
        }

        .dashboard-menu a {
          display: flex;
          min-height: 43px;
          align-items: center;
          justify-content: space-between;
          padding: 10px 11px;
          border-radius: 9px;
          color: #214d32;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.5;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .dashboard-menu a:hover {
          background: #f1f5ed;
        }

        .dashboard-menu a span:last-child {
          color: #8a6a4a;
        }

        .order-container {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding: 27px 0 0;
        }

        .eyebrow {
          margin: 0 0 9px;
          color: #8a6a4a;
          font-size: 10px;
          font-weight: 800;
          line-height: 1.5;
          letter-spacing: 0.2em;
        }

        .page-title {
          margin: 0;
          color: #243329;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(32px, 7vw, 43px);
          font-weight: 500;
          line-height: 1.15;
          letter-spacing: -1.2px;
          overflow-wrap: anywhere;
        }

        .page-title span {
          color: #2f6b45;
          font-family: Georgia, "Times New Roman", serif;
          font-size: inherit;
          font-style: italic;
          font-weight: inherit;
        }

        .subtitle {
          max-width: 450px;
          margin: 12px 0 25px;
          color: #778078;
          font-size: 13px;
          line-height: 1.8;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin: 0 0 27px;
        }

        .summary-card {
          min-width: 0;
          padding: 15px 12px;
          border: 1px solid rgba(33, 77, 50, 0.1);
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 5px 18px rgba(33, 77, 50, 0.035);
        }

        .summary-number {
          display: block;
          margin: 0 0 6px;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 27px;
          font-weight: 400;
          line-height: 1;
        }

        .summary-label {
          display: block;
          color: #778078;
          font-size: 10px;
          line-height: 1.5;
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin: 0 0 14px;
        }

        .section-title {
          margin: 0;
          color: #243329;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          font-weight: 500;
          line-height: 1.3;
        }

        .count-label {
          color: #778078;
          font-size: 11px;
          line-height: 1.5;
        }

        .filters {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          margin: 0;
          padding: 2px 0 14px;
          scrollbar-width: none;
        }

        .filters::-webkit-scrollbar {
          display: none;
        }

        .filter-button {
          min-height: 36px;
          flex: 0 0 auto;
          padding: 10px 15px;
          border: 1px solid rgba(33, 77, 50, 0.1);
          border-radius: 30px;
          background: #fff;
          color: #778078;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.3;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-button.active {
          border-color: #214d32;
          background: #214d32;
          color: #fff;
        }

        .order-list {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 13px;
        }

        .order-card {
          display: block;
          width: 100%;
          min-width: 0;
          margin: 0;
          padding: 19px;
          border: 1px solid rgba(33, 77, 50, 0.1);
          border-radius: 19px;
          background: #fff;
          color: #243329;
          text-align: left;
          box-shadow: 0 6px 23px rgba(33, 77, 50, 0.035);
          cursor: pointer;
          transition:
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .order-card:hover {
          box-shadow: 0 9px 28px rgba(33, 77, 50, 0.08);
        }

        .order-card:active {
          transform: scale(0.99);
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .order-code {
          margin: 0 0 8px;
          color: #8a6a4a;
          font-size: 10px;
          font-weight: 800;
          line-height: 1.5;
          letter-spacing: 0.09em;
          overflow-wrap: anywhere;
        }

        .service-title {
          margin: 0 0 6px;
          color: #243329;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          font-weight: 500;
          line-height: 1.3;
          overflow-wrap: anywhere;
        }

        .design-type {
          margin: 0;
          color: #778078;
          font-size: 12px;
          line-height: 1.6;
        }

        .status {
          display: inline-flex;
          max-width: 48%;
          flex: 0 0 auto;
          align-items: center;
          gap: 6px;
          margin: 0;
          padding: 8px 10px;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 800;
          line-height: 1.3;
        }

        .status-dot {
          display: block;
          width: 6px;
          height: 6px;
          min-width: 6px;
          min-height: 6px;
          flex: 0 0 6px;
          border-radius: 50%;
        }

        .card-divider {
          width: 100%;
          height: 1px;
          margin: 17px 0 13px;
          background: rgba(33, 77, 50, 0.1);
        }

        .card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .detail-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          color: #778078;
          font-size: 11px;
          line-height: 1.7;
        }

        .detail-link {
          flex: 0 0 auto;
          color: #2f6b45;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.5;
        }

        .state-card {
          margin: 0;
          padding: 30px 22px;
          border: 1px solid rgba(33, 77, 50, 0.1);
          border-radius: 20px;
          background: #fff;
          text-align: center;
          box-shadow: 0 7px 25px rgba(33, 77, 50, 0.04);
        }

        .state-icon {
          display: grid;
          width: 56px;
          height: 56px;
          place-items: center;
          margin: 0 auto 17px;
          border-radius: 18px;
          background: #edf4ee;
          color: #2f6b45;
          font-size: 26px;
        }

        .state-title {
          margin: 0 0 9px;
          color: #243329;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          font-weight: 500;
          line-height: 1.3;
        }

        .state-description {
          max-width: 360px;
          margin: 0 auto 19px;
          color: #778078;
          font-size: 12px;
          line-height: 1.8;
        }

        .primary-button {
          display: inline-flex;
          min-height: 45px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 0;
          padding: 0 19px;
          border: 0;
          border-radius: 13px;
          background: #2f6b45;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .primary-button:hover {
          background: #214d32;
        }

        .secondary-button {
          min-height: 40px;
          margin: 12px 0 0;
          padding: 10px 16px;
          border: 1px solid rgba(33, 77, 50, 0.1);
          border-radius: 12px;
          background: #fff;
          color: #2f6b45;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .dashboard-footer {
          display: flex;
          align-items: center;
          gap: 13px;
          margin: 36px 0 20px;
          padding: 22px 0 0;
          border-top: 1px solid #e4ddd1;
        }

        .dashboard-footer-logo {
          display: block;
          width: 43px;
          height: 43px;
          min-width: 43px;
          max-width: 43px;
          flex: 0 0 43px;
          border-radius: 10px;
          background: #fff;
          object-fit: contain;
        }

        .dashboard-footer-copy {
          min-width: 0;
        }

        .dashboard-footer-copy strong {
          display: block;
          color: #214d32;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.5;
        }

        .dashboard-footer-copy p {
          margin: 4px 0 0;
          color: #8a6a4a;
          font-size: 11px;
          line-height: 1.5;
        }

        .dashboard-footer-copy small {
          display: block;
          margin-top: 3px;
          color: #999387;
          font-size: 10px;
          line-height: 1.5;
        }

        @media (max-width: 420px) {
          .order-page {
            padding-right: 13px;
            padding-left: 13px;
          }

          .dashboard-header {
            width: calc(100% + 26px);
            margin-left: -13px;
          }

          .dashboard-container {
            width: calc(100% - 26px);
          }

          .dashboard-brand {
            gap: 8px;
          }

          .dashboard-brand span {
            font-size: 13px;
          }

          .summary {
            gap: 7px;
          }

          .summary-card {
            padding: 13px 9px;
            border-radius: 14px;
          }

          .summary-number {
            font-size: 24px;
          }

          .summary-label {
            font-size: 9px;
          }

          .order-card {
            padding: 16px;
          }

          .card-top {
            flex-direction: column;
          }

          .status {
            max-width: 100%;
          }

          .card-bottom {
            align-items: flex-start;
          }

          .detail-meta {
            flex-direction: column;
            gap: 3px;
          }

          .detail-link {
            margin-top: 3px;
          }
        }

        @media (max-width: 380px) {
          .dashboard-container {
            width: calc(100% - 24px);
          }

          .dashboard-header-link {
            padding-right: 10px;
            padding-left: 10px;
            font-size: 11px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .order-page *,
          .order-page *::before,
          .order-page *::after {
            animation-duration: 0.01ms;
            transition-duration: 0.01ms;
          }
        }
      `}</style>

      <header className="dashboard-header">
        <div className="dashboard-container dashboard-header-inner">
          <a href="/" className="dashboard-brand">
            <img
              src={logo}
              alt="Logo Pajara Studio"
              className="dashboard-logo"
              width={39}
              height={39}
            />
            <span>Pajara Studio</span>
          </a>

          <div className="dashboard-header-actions">
            <button
              type="button"
              className={`dashboard-menu-button ${menuOpen ? "is-open" : ""}`}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              <span />
              <span />
            </button>

            <a href="/order" className="dashboard-header-link">
              Pesan Desain <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        {menuOpen && (
          <nav className="dashboard-menu" aria-label="Navigasi dashboard">
            <p className="dashboard-menu-label">MENU PELANGGAN</p>

            <a href="/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard <span>↗</span>
            </a>

            <a href="/orders/list" onClick={() => setMenuOpen(false)}>
              Pesanan Saya <span>↗</span>
            </a>

            <a href="/subscriptions" onClick={() => setMenuOpen(false)}>
              Paket Desain <span>↗</span>
            </a>

            <a href="/payments" onClick={() => setMenuOpen(false)}>
              Pembayaran <span>↗</span>
            </a>
          </nav>
        )}
      </header>

      <div className="order-container">
        <header>
          <p className="eyebrow">PAJARA STUDIO · CUSTOMER SPACE</p>

          <h1 className="page-title">
            Pesanan <span>Saya.</span>
          </h1>

          <p className="subtitle">
            Setiap desain punya prosesnya sendiri. Pantau perkembangan
            pesananmu dengan mudah, dari awal hingga selesai.
          </p>
        </header>

        {!error && (
          <section className="summary" aria-label="Ringkasan pesanan">
            <div className="summary-card">
              <span className="summary-number">{orders.length}</span>
              <span className="summary-label">Total Pesanan</span>
            </div>

            <div className="summary-card">
              <span className="summary-number">{activeOrders.length}</span>
              <span className="summary-label">Dalam Proses</span>
            </div>

            <div className="summary-card">
              <span className="summary-number">
                {completedOrders.length}
              </span>
              <span className="summary-label">Selesai</span>
            </div>
          </section>
        )}

        <section>
          <div className="section-heading">
            <h2 className="section-title">Daftar Pesanan</h2>

            {!error && (
              <span className="count-label">
                {filteredOrders.length} pesanan
              </span>
            )}
          </div>

          {!error && orders.length > 0 && (
            <div className="filters" aria-label="Filter pesanan">
              <button
                type="button"
                className={`filter-button ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
                aria-pressed={filter === "all"}
              >
                Semua
              </button>

              <button
                type="button"
                className={`filter-button ${filter === "active" ? "active" : ""}`}
                onClick={() => setFilter("active")}
                aria-pressed={filter === "active"}
              >
                Dalam Proses
              </button>

              <button
                type="button"
                className={`filter-button ${filter === "completed" ? "active" : ""}`}
                onClick={() => setFilter("completed")}
                aria-pressed={filter === "completed"}
              >
                Selesai
              </button>
            </div>
          )}

          {error ? (
            <div className="state-card">
              <div className="state-icon">!</div>
              <h3 className="state-title">Belum bisa memuat data</h3>
              <p className="state-description">{error}</p>

              {error.includes("Sesi") ? (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => router.push("/login")}
                >
                  Login Kembali
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-button"
                  onClick={loadOrders}
                >
                  Coba Lagi
                </button>
              )}
            </div>
          ) : orders.length === 0 ? (
            <div className="state-card">
              <div className="state-icon">✳</div>
              <h3 className="state-title">
                Perjalanan desainmu dimulai di sini
              </h3>
              <p className="state-description">
                Belum ada pesanan untuk saat ini. Saat kamu memesan desain,
                semua informasi dan perkembangannya akan tampil di halaman ini.
              </p>
              <button
                type="button"
                className="primary-button"
                onClick={() => router.push("/order")}
              >
                <span aria-hidden="true">＋</span> Pesan Desain
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="state-card">
              <div className="state-icon">✳</div>
              <h3 className="state-title">
                Belum ada pesanan di kategori ini
              </h3>
              <p className="state-description">
                Coba pilih kategori lain untuk melihat pesananmu.
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setFilter("all")}
              >
                Tampilkan Semua
              </button>
            </div>
          ) : (
            <div className="order-list">
              {filteredOrders.map((order) => {
                const status = statusStyle(order.status);

                return (
                  <button
                    key={order.id}
                    type="button"
                    className="order-card"
                    onClick={() =>
                      router.push(
                        `/orders?id=${encodeURIComponent(order.id)}`
                      )
                    }
                    aria-label={`Lihat detail pesanan ${order.order_code}`}
                  >
                    <div className="card-top">
                      <div>
                        <p className="order-code">
                          ORDER #{order.order_code}
                        </p>

                        <h3 className="service-title">
                          {order.service_name || "Pesanan Desain"}
                        </h3>

                        <p className="design-type">
                          {order.design_type || "Jenis desain belum ditentukan"}
                        </p>
                      </div>

                      <span
                        className="status"
                        style={{
                          background: status.background,
                          color: status.color,
                        }}
                      >
                        <span
                          className="status-dot"
                          style={{ background: status.dot }}
                        />
                        {statusLabel(order.status)}
                      </span>
                    </div>

                    <div className="card-divider" />

                    <div className="card-bottom">
                      <div className="detail-meta">
                        <span>◇ {order.quantity || 1} desain</span>
                        <span>Tenggat: {formatDate(order.deadline)}</span>
                      </div>

                      <span className="detail-link">Detail ↗</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <footer className="dashboard-footer">
          <img
            src={logo}
            alt="Logo Pajara Studio"
            width={43}
            height={43}
            className="dashboard-footer-logo"
          />

          <div className="dashboard-footer-copy">
            <strong>Pajara Studio</strong>
            <p>Berakar di Tanah Pasundan.</p>
            <small>© 2026 Pajara Studio. Desain yang punya arah.</small>
          </div>
        </footer>
      </div>
    </main>
  );
}
