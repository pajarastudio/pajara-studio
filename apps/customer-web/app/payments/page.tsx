"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@pajara/supabase";

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
        if (mounted) setLoading(false);
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

  return (
    <main style={styles.page}>
      {/* NAVBAR */}

      <nav className="dashboard-navbar">
        <div className="dashboard-navbar-inner">
          <a
            href="/"
            className="dashboard-brand"
            aria-label="Pajara Studio"
          >
            <Image
              src={logo}
              alt="Logo Pajara Studio"
              width={39}
              height={39}
              unoptimized
              className="dashboard-brand-logo"
            />
            <span className="dashboard-brand-name">
              Pajara Studio
            </span>
          </a>

          <div className="dashboard-navbar-actions">
            <button
              type="button"
              className={`dashboard-menu-button ${
                menuOpen ? "open" : ""
              }`}
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
            </button>

            <button
              type="button"
              className="dashboard-order-button"
              onClick={() => router.push("/order")}
            >
              Pesan Desain ↗
            </button>
          </div>

          {menuOpen && (
            <div className="dashboard-menu">
              <p className="dashboard-menu-label">
                MENU PELANGGAN
              </p>

              <button
                type="button"
                className="dashboard-menu-link"
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/dashboard");
                }}
              >
                Dashboard
              </button>

              <button
                type="button"
                className="dashboard-menu-link"
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/orders/list");
                }}
              >
                Pesanan Saya
              </button>

              <button
                type="button"
                className="dashboard-menu-link"
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/subscriptions");
                }}
              >
                Paket Desain
              </button>

              <button
                type="button"
                className="dashboard-menu-link active"
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/payments");
                }}
              >
                Pembayaran
              </button>
            </div>
          )}
        </div>
      </nav>

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.eyebrow}>PAJARA STUDIO</div>

          <h1 style={styles.title}>Pembayaran</h1>

          <p style={styles.subtitle}>
            Kelola pembayaran desain dan paket Pajara dalam satu tempat.
          </p>
        </header>

        {error && (
          <div style={styles.error}>
            <strong>Belum dapat memuat data</strong>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={styles.retryButton}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <p>Memuat data pembayaran...</p>
          </div>
        ) : !error ? (
          <>
            <section style={styles.summaryCard}>
              <div style={styles.summaryLabel}>
                TOTAL TAGIHAN PESANAN
              </div>

              <div style={styles.amount}>
                {formatRupiah(totalOutstanding)}
              </div>

              <p style={styles.summaryDescription}>
                {waitingOrders.length > 0
                  ? `${waitingOrders.length} pesanan membutuhkan pembayaran.`
                  : "Tidak ada tagihan pesanan yang menunggu pembayaran."}
              </p>
            </section>

            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.sectionEyebrow}>DESAIN</div>
                  <h2 style={styles.sectionTitle}>
                    Pembayaran Pesanan
                  </h2>
                </div>

                <span style={styles.count}>{orders.length}</span>
              </div>

              {orders.length === 0 ? (
                <div style={styles.emptyCard}>
                  <div style={styles.emptyIcon}>◇</div>

                  <h3 style={styles.cardTitle}>
                    Belum ada pesanan
                  </h3>

                  <p style={styles.cardDescription}>
                    Pesanan desain yang kamu buat akan muncul di sini.
                  </p>

                  <button
                    onClick={() => router.push("/order")}
                    style={styles.primaryButton}
                  >
                    Buat Pesanan
                  </button>
                </div>
              ) : (
                <div style={styles.list}>
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
                        style={styles.orderCard}
                      >
                        <div style={styles.orderTop}>
                          <div style={styles.orderIcon}>
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
                            style={{
                              ...styles.status,
                              ...(needsPayment
                                ? styles.statusPending
                                : styles.statusNormal),
                            }}
                          >
                            {statusLabel(order.status)}
                          </span>
                        </div>

                        <div style={styles.orderCode}>
                          {order.order_code}
                        </div>

                        <h3 style={styles.cardTitle}>
                          {order.service_name ||
                            "Layanan Pajara Studio"}
                        </h3>

                        <div style={styles.amountRow}>
                          <span style={styles.muted}>
                            {order.status === "waiting_dp"
                              ? "Tagihan DP"
                              : order.status === "waiting_payment"
                                ? "Tagihan pelunasan"
                                : "Total pesanan"}
                          </span>

                          <strong style={styles.orderAmount}>
                            {formatRupiah(
                              needsPayment ? amount : order.total_amount
                            )}
                          </strong>
                        </div>

                        <button
                          onClick={() =>
                            router.push(
                              `/orders/payment?id=${order.id}`
                            )
                          }
                          style={
                            needsPayment
                              ? styles.primaryButton
                              : styles.secondaryButton
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

            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.sectionEyebrow}>
                    LANGGANAN
                  </div>

                  <h2 style={styles.sectionTitle}>
                    Pembayaran Paket
                  </h2>
                </div>
              </div>

              <div style={styles.packageCard}>
                <div style={styles.packageIcon}>
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
                    <rect x="3" y="7" width="18" height="14" rx="2" />
                    <path d="M16 3l-4 4-4-4M3 12h18" />
                  </svg>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitle}>Paket Pajara</h3>

                  <p style={styles.cardDescription}>
                    Lihat permintaan paket, status, dan proses pembayaran
                    paket mingguan atau bulanan.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/subscriptions")}
                  style={styles.primaryButton}
                >
                  Buka Paket →
                </button>
              </div>

              <p style={styles.helper}>
                Pembayaran paket dikelola melalui halaman Paket agar
                proses dan status langganan tetap tersinkron.
              </p>
            </section>

            {/* FOOTER */}

            <footer style={styles.footer}>
              <Image
                src={logo}
                alt="Logo Pajara Studio"
                width={43}
                height={43}
                unoptimized
                style={styles.footerLogo}
              />

              <div style={styles.footerCopy}>
                <strong style={styles.footerTitle}>
                  Pajara Studio
                </strong>

                <p style={styles.footerText}>
                  Berakar di Tanah Pasundan.
                </p>

                <small style={styles.footerCopyright}>
                  © 2026 Pajara Studio. Desain yang punya arah.
                </small>
              </div>
            </footer>
          </>
        ) : null}
      </div>

      <style jsx>{`
        /* NAVBAR */

        .dashboard-navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          margin: -24px -16px 0;
          padding: 0 16px;
          border-bottom: 1px solid rgba(47, 107, 69, 0.1);
          background: rgba(247, 244, 238, 0.88);
          backdrop-filter: blur(22px) saturate(160%);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
        }

        .dashboard-navbar-inner {
          position: relative;
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
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 10px;
          color: #214d32;
          text-decoration: none;
        }

        :global(.dashboard-brand-logo) {
          display: block;
          width: 39px;
          height: 39px;
          flex: 0 0 39px;
          border-radius: 12px;
          object-fit: contain;
          background: #fff;
        }

        .dashboard-brand-name {
          overflow: hidden;
          color: #214d32;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.3px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dashboard-navbar-actions {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 9px;
        }

        .dashboard-menu-button {
          display: flex;
          width: 42px;
          height: 42px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: 1px solid rgba(33, 77, 50, 0.13);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.55);
          cursor: pointer;
        }

        .dashboard-menu-button span {
          display: block;
          width: 17px;
          height: 2px;
          border-radius: 3px;
          background: #214d32;
          transition:
            transform 180ms ease,
            opacity 180ms ease;
        }

        .dashboard-menu-button.open span:first-child {
          transform: translateY(3.5px) rotate(45deg);
        }

        .dashboard-menu-button.open span:last-child {
          transform: translateY(-3.5px) rotate(-45deg);
        }

        .dashboard-order-button {
          display: inline-flex;
          min-height: 42px;
          align-items: center;
          justify-content: center;
          padding: 10px 14px;
          border: 1px solid #214d32;
          border-radius: 10px;
          background: #214d32;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          transition:
            background 160ms ease,
            transform 160ms ease;
        }

        .dashboard-order-button:hover {
          transform: translateY(-1px);
          background: #2f6b45;
        }

        .dashboard-menu {
          position: absolute;
          top: calc(100% + 9px);
          left: 50%;
          z-index: 110;
          width: min(760px, calc(100vw - 32px));
          padding: 13px;
          border: 1px solid rgba(33, 77, 50, 0.1);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 15px 40px rgba(33, 77, 50, 0.12);
          transform: translateX(-50%);
          animation: menuIn 180ms ease both;
        }

        .dashboard-menu-label {
          margin: 2px 8px 9px;
          color: #8a6a4a;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.16em;
        }

        .dashboard-menu-link {
          display: flex;
          width: 100%;
          min-height: 43px;
          align-items: center;
          padding: 10px 11px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #214d32;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
          transition: background 150ms ease;
        }

        .dashboard-menu-link:hover,
        .dashboard-menu-link.active {
          background: #f0f4ee;
        }

        @keyframes menuIn {
          from {
            opacity: 0;
            transform: translate(-50%, -6px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        button {
          -webkit-tap-highlight-color: transparent;
          transition:
            transform 160ms ease,
            opacity 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        button:active {
          transform: scale(0.98);
        }

        @media (hover: hover) {
          button:hover {
            opacity: 0.94;
          }
        }

        @media (max-width: 420px) {
          .dashboard-navbar-inner {
            gap: 8px;
          }

          .dashboard-brand {
            gap: 8px;
          }

          .dashboard-brand-name {
            font-size: 13px;
          }

          .dashboard-navbar-actions {
            gap: 7px;
          }

          .dashboard-order-button {
            padding: 10px 11px;
            font-size: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "var(--cream, #f7f4ee)",
    padding: "24px 16px 110px",
    color: "var(--text, #243329)",
    fontFamily: '"DM Sans", Arial, sans-serif',
  },

  container: {
    width: "100%",
    maxWidth: "760px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "26px",
    paddingTop: "24px",
    animation: "fadeUp 350ms ease both",
  },

  eyebrow: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.2em",
    color: "var(--brown, #8a6a4a)",
    marginBottom: "9px",
  },

  title: {
    fontFamily: "Georgia, serif",
    fontSize: "clamp(32px, 7vw, 43px)",
    lineHeight: 1.15,
    letterSpacing: "-1.2px",
    color: "var(--green-dark, #214d32)",
    fontWeight: 500,
    margin: 0,
  },

  subtitle: {
    fontSize: "13px",
    lineHeight: 1.8,
    color: "#778078",
    margin: "12px 0 25px",
    maxWidth: "450px",
  },

  summaryCard: {
    display: "grid",
    gap: "9px",
    padding: "25px",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg, #214d32 0%, #2f6b45 72%, #467a56 100%)",
    color: "#fff",
    boxShadow: "0 12px 28px rgba(33,77,50,.12)",
    marginBottom: "34px",
    animation: "fadeUp 450ms ease both",
  },

  summaryLabel: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,.76)",
  },

  amount: {
    fontFamily: "Georgia, serif",
    fontSize: "clamp(28px, 7vw, 38px)",
    fontWeight: 700,
    letterSpacing: "-0.04em",
    overflowWrap: "anywhere",
  },

  summaryDescription: {
    color: "rgba(255,255,255,.8)",
    fontSize: "13px",
    lineHeight: 1.6,
    margin: 0,
  },

  section: {
    marginBottom: "34px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "16px",
  },

  sectionEyebrow: {
    color: "var(--brown, #8a6a4a)",
    fontSize: "10px",
    letterSpacing: "0.14em",
    fontWeight: 800,
    marginBottom: "5px",
  },

  sectionTitle: {
    fontFamily: "Georgia, serif",
    color: "var(--green-dark, #214d32)",
    fontSize: "23px",
    letterSpacing: "-0.025em",
    margin: 0,
  },

  count: {
    minWidth: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#e8eee7",
    color: "var(--green-dark, #214d32)",
    fontSize: "12px",
    fontWeight: 800,
  },

  list: {
    display: "grid",
    gap: "13px",
  },

  orderCard: {
    padding: "21px",
    borderRadius: "18px",
    background: "#fff",
    border: "1px solid #e8e2d8",
    boxShadow: "0 4px 14px rgba(33,77,50,.035)",
    animation: "fadeUp 350ms ease both",
  },

  orderTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },

  orderIcon: {
    width: "42px",
    height: "42px",
    display: "grid",
    placeItems: "center",
    borderRadius: "13px",
    background: "#edf3ec",
    color: "var(--green, #2f6b45)",
  },

  status: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "20px",
    padding: "7px 10px",
    fontSize: "10px",
    fontWeight: 800,
    textAlign: "center",
  },

  statusPending: {
    background: "#fbf0df",
    color: "#8a5b20",
  },

  statusNormal: {
    background: "#edf3ec",
    color: "#2f6b45",
  },

  orderCode: {
    fontSize: "11px",
    letterSpacing: "0.07em",
    color: "#88877e",
    fontWeight: 800,
    marginBottom: "5px",
  },

  cardTitle: {
    fontSize: "16px",
    color: "var(--green-dark, #214d32)",
    fontWeight: 800,
    margin: "0 0 8px",
  },

  cardDescription: {
    fontSize: "13px",
    lineHeight: 1.7,
    color: "#777970",
    margin: "0 0 15px",
  },

  amountRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    borderTop: "1px solid #eee9e0",
    paddingTop: "15px",
    marginTop: "15px",
    marginBottom: "17px",
  },

  muted: {
    color: "#777970",
    fontSize: "12px",
  },

  orderAmount: {
    color: "var(--green-dark, #214d32)",
    fontSize: "14px",
    textAlign: "right",
  },

  primaryButton: {
    display: "block",
    width: "100%",
    border: "none",
    borderRadius: "12px",
    padding: "13px 16px",
    background: "var(--green, #2f6b45)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "center",
    boxSizing: "border-box",
  },

  secondaryButton: {
    display: "block",
    width: "100%",
    border: "1px solid #dce5da",
    borderRadius: "12px",
    padding: "13px 16px",
    background: "#f7faf6",
    color: "var(--green-dark, #214d32)",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "center",
    boxSizing: "border-box",
  },

  emptyCard: {
    padding: "28px 22px",
    borderRadius: "18px",
    background: "#fff",
    border: "1px solid #e8e2d8",
    textAlign: "center",
  },

  emptyIcon: {
    width: "48px",
    height: "48px",
    display: "grid",
    placeItems: "center",
    borderRadius: "16px",
    background: "#edf3ec",
    color: "var(--green, #2f6b45)",
    fontSize: "28px",
    margin: "0 auto 15px",
  },

  packageCard: {
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "14px",
    borderRadius: "18px",
    background: "#fff",
    border: "1px solid #e8e2d8",
  },

  packageIcon: {
    width: "48px",
    height: "48px",
    display: "grid",
    placeItems: "center",
    borderRadius: "15px",
    background: "#edf3ec",
    color: "var(--green, #2f6b45)",
  },

  loading: {
    padding: "55px 20px",
    textAlign: "center",
    color: "#777970",
    fontSize: "13px",
  },

  spinner: {
    width: "27px",
    height: "27px",
    border: "3px solid #dce5da",
    borderTopColor: "var(--green, #2f6b45)",
    borderRadius: "50%",
    margin: "0 auto 12px",
    animation: "spin 800ms linear infinite",
  },

  error: {
    background: "#fff3f0",
    border: "1px solid #ead0c9",
    color: "#8a3d2f",
    padding: "17px",
    borderRadius: "14px",
    fontSize: "13px",
    lineHeight: 1.6,
    marginBottom: "20px",
  },

  retryButton: {
    marginTop: "12px",
    padding: "9px 13px",
    border: "1px solid #d8aaa0",
    borderRadius: "9px",
    background: "#fff",
    color: "#8a3d2f",
    fontWeight: 700,
    cursor: "pointer",
  },

  helper: {
    fontSize: "12px",
    color: "#85847b",
    lineHeight: 1.7,
    margin: "12px 2px 0",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    borderTop: "1px solid #e4ddd1",
    paddingTop: "22px",
    marginTop: "36px",
  },

  footerLogo: {
    width: "43px",
    height: "43px",
    flex: "0 0 43px",
    objectFit: "contain",
    borderRadius: "10px",
    background: "#fff",
  },

  footerCopy: {
    minWidth: 0,
  },

  footerTitle: {
    display: "block",
    color: "#214d32",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  footerText: {
    margin: "4px 0 0",
    color: "#8a6a4a",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  footerCopyright: {
    display: "block",
    marginTop: "3px",
    color: "#999387",
    fontSize: "10px",
    lineHeight: 1.5,
  },
};
