
"use client";

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

const COLORS = {
  green: "#2f6b45",
  darkGreen: "#214d32",
  brown: "#8a6a4a",
  cream: "#f7f4ee",
  white: "#ffffff",
  text: "#243329",
  muted: "#778078",
  border: "rgba(33,77,50,.10)",
};

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

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
    return { background: "#e7f4e9", color: "#246338", dot: "#3a8950" };
  }

  if (status === "cancelled") {
    return { background: "#fbe9e7", color: "#a33e35", dot: "#c34c43" };
  }

  if (status === "revision") {
    return { background: "#fff1d8", color: "#94601c", dot: "#c78b2d" };
  }

  if (status === "waiting_payment" || status === "waiting_dp") {
    return { background: "#fff3df", color: "#95621d", dot: "#c78b2d" };
  }

  if (status === "processing") {
    return { background: "#e7efff", color: "#365c9b", dot: "#5079bb" };
  }

  return { background: "#edf3ed", color: "#456b4d", dot: "#6e9775" };
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

export default function OrderListPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Sesi Anda tidak ditemukan. Silakan login kembali.");
        return;
      }

      const { data, error: queryError } = await supabase
        .from("orders")
        .select(
          "id, order_code, service_name, design_type, quantity, status, deadline, created_at"
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error("Gagal memuat daftar pesanan:", queryError);
        setError("Pesanan gagal dimuat. Periksa koneksi lalu coba kembali.");
        return;
      }

      setOrders((data || []) as Order[]);
    } catch (err) {
      console.error("Kesalahan saat memuat pesanan:", err);
      setError("Terjadi kendala koneksi. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initialLoad() {
      try {
        await loadOrders();
      } finally {
        if (mounted) {
          setPageLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      mounted = false;
    };
  }, [loadOrders]);

  const activeOrders = orders.filter(
    (order) => !["completed", "cancelled"].includes(order.status || "")
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

  if (pageLoading) {
    return (
      <CustomerLoading
        title="Menyiapkan Pesanan"
        description="Sebentar, kami sedang menyiapkan ruang pesanan Kang/Teh."
      />
    );
  }

  return (
    <main className="order-page">
      <style jsx global>{`
        .order-page,
        .order-page *,
        .order-page *::before,
        .order-page *::after {
          box-sizing: border-box !important;
        }

        .order-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
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

        /* NAVBAR */

        .order-page .dashboard-header {
          position: sticky !important;
          top: 0 !important;
          z-index: 1000 !important;
          display: block !important;
          width: calc(100% + 32px) !important;
          min-height: 70px !important;
          margin: 0 0 0 -16px !important;
          padding: 0 !important;
          border: 0 !important;
          border-bottom: 1px solid rgba(47, 107, 69, 0.12) !important;
          background: rgba(247, 244, 238, 0.78) !important;
          -webkit-backdrop-filter: blur(22px) saturate(160%) !important;
          backdrop-filter: blur(22px) saturate(160%) !important;
        }

        .order-page .dashboard-container {
          width: min(100% - 32px, 680px) !important;
          max-width: 680px !important;
          margin: 0 auto !important;
          padding: 0 !important;
        }

        .order-page .dashboard-header-inner {
          display: flex !important;
          width: 100% !important;
          min-height: 70px !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 12px !important;
        }

        .order-page .dashboard-brand {
          display: inline-flex !important;
          width: auto !important;
          min-width: 0 !important;
          max-width: 70% !important;
          flex: 0 1 auto !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 10px !important;
          margin: 0 !important;
          padding: 0 !important;
          color: #214d32 !important;
          font-family: "DM Sans", Arial, sans-serif !important;
          font-size: 15px !important;
          font-weight: 800 !important;
          line-height: 1.3 !important;
          letter-spacing: normal !important;
          text-decoration: none !important;
          white-space: nowrap !important;
        }

        .order-page .dashboard-brand span {
          display: inline-block !important;
          width: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          color: #214d32 !important;
          font-family: "DM Sans", Arial, sans-serif !important;
          font-size: 15px !important;
          font-weight: 800 !important;
          line-height: 1.3 !important;
          letter-spacing: normal !important;
          white-space: nowrap !important;
        }

        .order-page img.dashboard-logo {
          position: relative !important;
          display: block !important;
          width: 39px !important;
          height: 39px !important;
          min-width: 39px !important;
          min-height: 39px !important;
          max-width: 39px !important;
          max-height: 39px !important;
          flex: 0 0 39px !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 12px !important;
          object-fit: cover !important;
          object-position: center !important;
          overflow: hidden !important;
        }

        .order-page .dashboard-header-actions {
          display: flex !important;
          flex: 0 0 auto !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 9px !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .order-page .dashboard-menu-button {
          display: flex !important;
          width: 42px !important;
          height: 42px !important;
          min-width: 42px !important;
          min-height: 42px !important;
          flex: 0 0 42px !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 5px !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 1px solid rgba(47, 107, 69, 0.2) !important;
          border-radius: 11px !important;
          background: rgba(255, 255, 255, 0.65) !important;
          cursor: pointer;
        }

        .order-page .dashboard-menu-button span {
          display: block !important;
          width: 17px !important;
          height: 2px !important;
          min-height: 2px !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 5px !important;
          background: #214d32 !important;
          transition: transform 0.2s ease;
        }

        .order-page .dashboard-menu-button.is-open span:first-child {
          transform: translateY(3.5px) rotate(45deg);
        }

        .order-page .dashboard-menu-button.is-open span:last-child {
          transform: translateY(-3.5px) rotate(-45deg);
        }

        .order-page .dashboard-header-link {
          display: inline-flex !important;
          min-height: 42px !important;
          flex: 0 0 auto !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 7px !important;
          margin: 0 !important;
          padding: 10px 14px !important;
          border: 1px solid rgba(47, 107, 69, 0.2) !important;
          border-radius: 10px !important;
          background: #214d32 !important;
          color: #ffffff !important;
          font-family: "DM Sans", Arial, sans-serif !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
          text-decoration: none !important;
          white-space: nowrap !important;
        }

        .order-page .dashboard-menu {
          position: absolute !important;
          top: calc(100% + 8px) !important;
          left: 50% !important;
          z-index: 1002 !important;
          display: block !important;
          width: min(680px, calc(100% - 32px)) !important;
          margin: 0 !important;
          padding: 13px !important;
          border: 1px solid rgba(47, 107, 69, 0.12) !important;
          border-radius: 15px !important;
          background: rgba(255, 255, 255, 0.97) !important;
          box-shadow: 0 12px 35px rgba(33, 77, 50, 0.12) !important;
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

        .order-page .dashboard-menu-label {
          display: block !important;
          margin: 2px 9px 9px !important;
          padding: 0 !important;
          color: #999487 !important;
          font-family: "DM Sans", Arial, sans-serif !important;
          font-size: 9px !important;
          font-weight: 800 !important;
          line-height: 1.5 !important;
          letter-spacing: 1.5px !important;
        }

        .order-page .dashboard-menu a {
          display: flex !important;
          min-height: 43px !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin: 0 !important;
          padding: 10px 11px !important;
          border-radius: 9px !important;
          color: #214d32 !important;
          font-family: "DM Sans", Arial, sans-serif !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          line-height: 1.5 !important;
          text-decoration: none !important;
        }

        .order-page .dashboard-menu a span:last-child {
          color: #8a6a4a !important;
        }

        /* KONTEN */

        .order-page .order-container {
          width: 100% !important;
          max-width: 760px !important;
          margin: 0 auto !important;
          padding: 27px 0 0 !important;
        }

        .order-page .eyebrow {
          margin: 0 0 9px !important;
          padding: 0 !important;
          color: #8a6a4a !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          line-height: 1.5 !important;
          letter-spacing: 0.2em !important;
        }

        .order-page .page-title {
          margin: 0 !important;
          padding: 0 !important;
          color: #243329 !important;
          font-family: Georgia, serif !important;
          font-size: clamp(32px, 7vw, 43px) !important;
          font-weight: 500 !important;
          line-height: 1.15 !important;
          letter-spacing: -1.2px !important;
        }

        .order-page .page-title span {
          color: #2f6b45 !important;
          font-family: Georgia, serif !important;
          font-size: inherit !important;
          font-style: italic !important;
          font-weight: inherit !important;
        }

        .order-page .subtitle {
          max-width: 450px !important;
          margin: 12px 0 25px !important;
          padding: 0 !important;
          color: #778078 !important;
          font-size: 13px !important;
          line-height: 1.8 !important;
        }

        .order-page .summary {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 10px !important;
          margin: 0 0 27px !important;
          padding: 0 !important;
        }

        .order-page .summary-card {
          min-width: 0 !important;
          margin: 0 !important;
          padding: 15px 12px !important;
          border: 1px solid rgba(33, 77, 50, 0.1) !important;
          border-radius: 17px !important;
          background: #ffffff !important;
          box-shadow: 0 5px 18px rgba(33, 77, 50, 0.035) !important;
        }

        .order-page .summary-number {
          display: block !important;
          margin: 0 0 6px !important;
          color: #214d32 !important;
          font-family: Georgia, serif !important;
          font-size: 27px !important;
          font-weight: 400 !important;
          line-height: 1 !important;
        }

        .order-page .summary-label {
          display: block !important;
          margin: 0 !important;
          color: #778078 !important;
          font-size: 10px !important;
          line-height: 1.5 !important;
        }

        .order-page .section-heading {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 10px !important;
          margin: 0 0 14px !important;
        }

        .order-page .section-title {
          margin: 0 !important;
          padding: 0 !important;
          color: #243329 !important;
          font-family: Georgia, serif !important;
          font-size: 23px !important;
          font-weight: 500 !important;
          line-height: 1.3 !important;
        }

        .order-page .count-label {
          color: #778078 !important;
          font-size: 11px !important;
          line-height: 1.5 !important;
        }

        .order-page .filters {
          display: flex !important;
          flex-direction: row !important;
          gap: 8px !important;
          overflow-x: auto !important;
          margin: 0 !important;
          padding: 2px 0 14px !important;
          scrollbar-width: none;
        }

        .order-page .filters::-webkit-scrollbar {
          display: none;
        }

        .order-page .filter-button {
          flex: 0 0 auto !important;
          min-height: 36px !important;
          margin: 0 !important;
          padding: 10px 15px !important;
          border: 1px solid rgba(33, 77, 50, 0.1) !important;
          border-radius: 30px !important;
          background: #ffffff !important;
          color: #778078 !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
          cursor: pointer;
        }

        .order-page .filter-button.active {
          border-color: #214d32 !important;
          background: #214d32 !important;
          color: #ffffff !important;
        }

        .order-page .order-list {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) !important;
          gap: 13px !important;
        }

        .order-page .order-card {
          display: block !important;
          width: 100% !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 19px !important;
          border: 1px solid rgba(33, 77, 50, 0.1) !important;
          border-radius: 19px !important;
          background: #ffffff !important;
          color: #243329 !important;
          text-align: left !important;
          box-shadow: 0 6px 23px rgba(33, 77, 50, 0.035) !important;
          cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .order-page .order-card:active {
          transform: scale(0.99);
        }

        .order-page .card-top {
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          justify-content: space-between !important;
          gap: 12px !important;
        }

        .order-page .order-code {
          margin: 0 0 8px !important;
          padding: 0 !important;
          color: #8a6a4a !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          line-height: 1.5 !important;
          letter-spacing: 0.09em !important;
          overflow-wrap: anywhere !important;
        }

        .order-page .service-title {
          margin: 0 0 6px !important;
          padding: 0 !important;
          color: #243329 !important;
          font-family: Georgia, serif !important;
          font-size: 20px !important;
          font-weight: 500 !important;
          line-height: 1.3 !important;
          overflow-wrap: anywhere !important;
        }

        .order-page .design-type {
          margin: 0 !important;
          padding: 0 !important;
          color: #778078 !important;
          font-size: 12px !important;
          line-height: 1.6 !important;
        }

        .order-page .status {
          display: inline-flex !important;
          max-width: 48% !important;
          flex: 0 0 auto !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 6px !important;
          margin: 0 !important;
          padding: 8px 10px !important;
          border-radius: 30px !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          line-height: 1.3 !important;
        }

        .order-page .status-dot {
          display: block !important;
          width: 6px !important;
          height: 6px !important;
          min-width: 6px !important;
          min-height: 6px !important;
          flex: 0 0 6px !important;
          border-radius: 50% !important;
        }

        .order-page .card-divider {
          width: 100% !important;
          height: 1px !important;
          margin: 17px 0 13px !important;
          padding: 0 !important;
          background: rgba(33, 77, 50, 0.1) !important;
        }

        .order-page .card-bottom {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 12px !important;
        }

        .order-page .detail-meta {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: wrap !important;
          gap: 12px !important;
          color: #778078 !important;
          font-size: 11px !important;
          line-height: 1.7 !important;
        }

        .order-page .detail-link {
          flex: 0 0 auto !important;
          color: #2f6b45 !important;
          font-size: 11px !important;
          font-weight: 800 !important;
          line-height: 1.5 !important;
        }

        /* EMPTY, ERROR, LOADING */

        .order-page .state-card {
          margin: 0 !important;
          padding: 30px 22px !important;
          border: 1px solid rgba(33, 77, 50, 0.1) !important;
          border-radius: 20px !important;
          background: #ffffff !important;
          text-align: center !important;
          box-shadow: 0 7px 25px rgba(33, 77, 50, 0.04) !important;
        }

        .order-page .state-icon {
          display: grid !important;
          width: 56px !important;
          height: 56px !important;
          place-items: center !important;
          margin: 0 auto 17px !important;
          padding: 0 !important;
          border-radius: 18px !important;
          background: #edf4ee !important;
          color: #2f6b45 !important;
          font-size: 26px !important;
        }

        .order-page .state-title {
          margin: 0 0 9px !important;
          padding: 0 !important;
          color: #243329 !important;
          font-family: Georgia, serif !important;
          font-size: 23px !important;
          font-weight: 500 !important;
          line-height: 1.3 !important;
        }

        .order-page .state-description {
          max-width: 360px !important;
          margin: 0 auto 19px !important;
          padding: 0 !important;
          color: #778078 !important;
          font-size: 12px !important;
          line-height: 1.8 !important;
        }

        .order-page .primary-button {
          display: inline-flex !important;
          min-height: 45px !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          margin: 0 !important;
          padding: 0 19px !important;
          border: 0 !important;
          border-radius: 13px !important;
          background: #2f6b45 !important;
          color: #ffffff !important;
          font-size: 12px !important;
          font-weight: 800 !important;
          line-height: 1.3 !important;
          cursor: pointer;
        }

        .order-page .secondary-button {
          min-height: 40px !important;
          margin: 12px 0 0 !important;
          padding: 10px 16px !important;
          border: 1px solid rgba(33, 77, 50, 0.1) !important;
          border-radius: 12px !important;
          background: #ffffff !important;
          color: #2f6b45 !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          cursor: pointer;
        }

        .order-page .loading-line {
          height: 13px !important;
          margin: 12px 0 !important;
          padding: 0 !important;
          border-radius: 8px !important;
          background: #e9eee8 !important;
          animation: order-pulse 1.2s ease-in-out infinite alternate;
        }

        @keyframes order-pulse {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }

        /* FOOTER */

        .order-page .dashboard-footer {
          display: flex !important;
          width: 100% !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 13px !important;
          margin: 36px 0 20px !important;
          padding: 22px 0 0 !important;
          border: 0 !important;
          border-top: 1px solid #e4ddd1 !important;
        }

        .order-page img.dashboard-footer-logo {
          display: block !important;
          position: relative !important;
          width: 43px !important;
          height: 43px !important;
          min-width: 43px !important;
          min-height: 43px !important;
          max-width: 43px !important;
          max-height: 43px !important;
          flex: 0 0 43px !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 10px !important;
          object-fit: cover !important;
          object-position: center !important;
        }

        .order-page .dashboard-footer-copy {
          display: block !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          text-align: left !important;
        }

        .order-page .dashboard-footer-copy strong {
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
          color: #214d32 !important;
          font-family: "DM Sans", Arial, sans-serif !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          line-height: 1.5 !important;
        }

        .order-page .dashboard-footer-copy p {
          display: block !important;
          margin: 4px 0 0 !important;
          padding: 0 !important;
          color: #8a6a4a !important;
          font-size: 11px !important;
          line-height: 1.5 !important;
        }

        .order-page .dashboard-footer-copy small {
          display: block !important;
          margin: 3px 0 0 !important;
          padding: 0 !important;
          color: #999387 !important;
          font-size: 10px !important;
          line-height: 1.5 !important;
        }

        /* RESPONSIVE */

        @media (max-width: 420px) {
          .order-page {
            padding-right: 13px !important;
            padding-left: 13px !important;
          }

          .order-page .dashboard-header {
            width: calc(100% + 26px) !important;
            margin-left: -13px !important;
          }

          .order-page .dashboard-container {
            width: calc(100% - 26px) !important;
          }

          .order-page .dashboard-brand {
            gap: 8px !important;
            font-size: 13px !important;
          }

          .order-page .dashboard-brand span {
            font-size: 13px !important;
          }

          .order-page img.dashboard-logo {
            width: 39px !important;
            height: 39px !important;
            min-width: 39px !important;
            min-height: 39px !important;
            max-width: 39px !important;
            max-height: 39px !important;
            flex-basis: 39px !important;
          }

          .order-page .summary {
            gap: 7px !important;
          }

          .order-page .summary-card {
            padding: 13px 9px !important;
            border-radius: 14px !important;
          }

          .order-page .summary-number {
            font-size: 24px !important;
          }

          .order-page .summary-label {
            font-size: 9px !important;
          }

          .order-page .order-card {
            padding: 16px !important;
          }

          .order-page .card-top {
            flex-direction: column !important;
          }

          .order-page .status {
            max-width: 100% !important;
          }

          .order-page .card-bottom {
            align-items: flex-start !important;
          }

          .order-page .detail-meta {
            flex-direction: column !important;
            gap: 3px !important;
          }

          .order-page .detail-link {
            margin-top: 3px !important;
          }
        }

        @media (max-width: 380px) {
          .order-page .dashboard-container {
            width: calc(100% - 24px) !important;
          }

          .order-page .dashboard-header-link {
            padding-right: 10px !important;
            padding-left: 10px !important;
            font-size: 11px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .order-page *,
          .order-page *::before,
          .order-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
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

        {!loading && !error && (
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
              <span className="summary-number">{completedOrders.length}</span>
              <span className="summary-label">Selesai</span>
            </div>
          </section>
        )}

        <section>
          <div className="section-heading">
            <h2 className="section-title">Daftar Pesanan</h2>

            {!loading && !error && (
              <span className="count-label">
                {filteredOrders.length} pesanan
              </span>
            )}
          </div>

          {!loading && !error && orders.length > 0 && (
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

          {loading ? (
            <div className="state-card">
              <div className="state-icon">✳</div>
              <h3 className="state-title">Menyiapkan pesananmu</h3>
              <p className="state-description">
                Sebentar, kami sedang mengambil data pesanan.
              </p>
              <div className="loading-line" />
              <div className="loading-line" />
              <div className="loading-line" />
            </div>
          ) : error ? (
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
