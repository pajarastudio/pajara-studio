
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@pajara/supabase";
import CustomerLoading from "../components/CustomerLoading";
import "./orders.css";

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
