
"use client";

import { useEffect, useState } from "react";
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

const LOGO =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

function PajaraLoading() {
  return (
    <main style={styles.page}>
      <div style={styles.loadingWrap}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingLogoFrame}>
            <Image
              src={LOGO}
              alt="Logo Pajara Studio"
              width={76}
              height={76}
              unoptimized
              priority
              style={styles.loadingLogo}
            />
          </div>

          <div style={styles.loadingEyebrow}>PAJARA STUDIO</div>
          <h1 style={styles.loadingTitle}>Menyiapkan pembayaran</h1>

          <div style={styles.loadingSpinner} />

          <p style={styles.loadingText}>
            Sebentar, kami sedang menyiapkan informasi pembayaranmu.
          </p>

          <div style={styles.loadingDivider} />

          <p style={styles.loadingTagline}>
            Berakar di Tanah Pasundan.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loadingSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes loadingAppear {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .loading-card {
          animation: loadingAppear 400ms ease both;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

export default function PaymentsPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return <PajaraLoading />;
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            style={styles.backCard}
          >
            <span style={styles.backIcon} aria-hidden="true">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
                <path d="M9 12h11" />
              </svg>
            </span>

            <span style={styles.backContent}>
              <span style={styles.backCaption}>NAVIGASI</span>
              <span style={styles.backTitle}>Kembali ke Beranda</span>
            </span>

            <span style={styles.backArrow} aria-hidden="true">
              →
            </span>
          </button>

          <div style={styles.eyebrow}>
            <span style={styles.eyebrowDot} />
            PAJARA STUDIO
          </div>

          <h1 style={styles.title}>Pembayaran</h1>

          <p style={styles.subtitle}>
            Kelola pembayaran desain dan paket Pajara dalam satu tempat.
          </p>
        </header>

        {error ? (
          <section style={styles.error}>
            <div style={styles.errorIcon} aria-hidden="true">
              !
            </div>

            <div style={styles.errorContent}>
              <strong style={styles.errorTitle}>
                Belum dapat memuat data
              </strong>
              <p style={styles.errorText}>{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                style={styles.retryButton}
              >
                Coba Lagi →
              </button>
            </div>
          </section>
        ) : (
          <>
            <section style={styles.summaryCard}>
              <div style={styles.summaryTop}>
                <div style={styles.summaryLabel}>
                  RINGKASAN TAGIHAN
                </div>

                <div style={styles.summaryIcon}>
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 10h18M7 15h3" />
                  </svg>
                </div>
              </div>

              <div style={styles.amount}>
                {formatRupiah(totalOutstanding)}
              </div>

              <p style={styles.summaryDescription}>
                {waitingOrders.length > 0
                  ? `${waitingOrders.length} pesanan membutuhkan pembayaran.`
                  : "Tidak ada tagihan pesanan yang menunggu pembayaran."}
              </p>

              <div style={styles.summaryFooter}>
                <span style={styles.summaryFooterDot} />
                <span>
                  {waitingOrders.length > 0
                    ? "Periksa rincian tagihan di bawah"
                    : "Informasi tagihan pesanan kamu"}
                </span>
              </div>
            </section>

            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.sectionEyebrow}>DESAIN</div>
                  <h2 style={styles.sectionTitle}>
                    Pembayaran Pesanan
                  </h2>
                  <p style={styles.sectionDescription}>
                    Pantau tagihan untuk setiap pesanan desain.
                  </p>
                </div>

                <span style={styles.count}>{orders.length}</span>
              </div>

              {orders.length === 0 ? (
                <div style={styles.emptyCard}>
                  <div style={styles.emptyIcon}>
                    <svg
                      width="27"
                      height="27"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="4" y="3" width="16" height="18" rx="2" />
                      <path d="M8 8h8M8 12h8M8 16h4" />
                    </svg>
                  </div>

                  <h3 style={styles.cardTitle}>Belum ada pesanan</h3>

                  <p style={styles.cardDescription}>
                    Pesanan desain yang kamu buat akan muncul di sini.
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push("/order")}
                    style={styles.primaryButton}
                  >
                    Buat Pesanan <span>→</span>
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
                      <article key={order.id} style={styles.orderCard}>
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
                            <span style={styles.statusDot} />
                            {statusLabel(order.status)}
                          </span>
                        </div>

                        <div style={styles.orderCode}>
                          {order.order_code}
                        </div>

                        <h3 style={styles.cardTitle}>
                          {order.service_name || "Layanan Pajara Studio"}
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
                          type="button"
                          onClick={() =>
                            router.push(`/orders/payment?id=${order.id}`)
                          }
                          style={
                            needsPayment
                              ? styles.primaryButton
                              : styles.secondaryButton
                          }
                        >
                          {needsPayment
                            ? "Buka Pembayaran"
                            : "Lihat Detail Pembayaran"}
                          <span aria-hidden="true"> →</span>
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
                  <div style={styles.sectionEyebrow}>LANGGANAN</div>
                  <h2 style={styles.sectionTitle}>Pembayaran Paket</h2>
                  <p style={styles.sectionDescription}>
                    Informasi pembayaran paket mingguan dan bulanan.
                  </p>
                </div>
              </div>

              <div style={styles.packageCard}>
                <div style={styles.packageTop}>
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

                  <div style={styles.packageBadge}>PAJARA PACKAGE</div>
                </div>

                <h3 style={styles.cardTitle}>Paket Pajara</h3>

                <p style={styles.cardDescription}>
                  Lihat permintaan paket, status, dan proses pembayaran
                  paket mingguan atau bulanan.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/subscriptions")}
                  style={styles.primaryButton}
                >
                  Buka Paket <span>→</span>
                </button>
              </div>

              <p style={styles.helper}>
                Pembayaran paket dikelola melalui halaman Paket agar
                proses dan status langganan tetap tersinkron.
              </p>
            </section>

            <footer style={styles.footer}>
              <div style={styles.footerLogoFrame}>
                <Image
                  src={LOGO}
                  alt="Logo Pajara Studio"
                  width={46}
                  height={46}
                  unoptimized
                  style={styles.footerLogo}
                />
              </div>

              <div style={styles.footerContent}>
                <strong style={styles.footerTitle}>
                  Pajara Studio
                </strong>
                <p style={styles.footerText}>
                  Berakar di Tanah Pasundan.
                </p>
                <p style={styles.footerSmall}>
                  Desain yang punya arah.
                </p>
              </div>
            </footer>
          </>
        )}
      </div>

      <style jsx>{`
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

        button {
          -webkit-tap-highlight-color: transparent;
          transition:
            transform 160ms ease,
            background 160ms ease,
            box-shadow 160ms ease,
            border-color 160ms ease;
        }

        button:active {
          transform: scale(0.985);
        }

        @media (hover: hover) {
          button:hover {
            box-shadow: 0 7px 18px rgba(33, 77, 50, 0.1);
          }
        }

        @media (max-width: 480px) {
          .payment-summary {
            padding: 22px;
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "var(--cream, #f7f4ee)",
    padding: "24px 16px 70px",
    color: "var(--text, #1d2a22)",
    fontFamily: '"DM Sans", Arial, sans-serif',
    boxSizing: "border-box",
  },
  container: {
    width: "100%",
    maxWidth: "760px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "27px",
    animation: "fadeUp 350ms ease both",
  },
  backCard: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 15px",
    marginBottom: "29px",
    color: "#214d32",
    border: "1px solid rgba(33,77,50,.11)",
    borderRadius: "16px",
    background: "#ffffff",
    boxShadow: "0 5px 18px rgba(33,77,50,.045)",
    cursor: "pointer",
    boxSizing: "border-box",
    textAlign: "left",
  },
  backIcon: {
    display: "grid",
    width: "39px",
    height: "39px",
    flexShrink: 0,
    placeItems: "center",
    borderRadius: "12px",
    background: "#edf4ee",
    color: "#2f6b45",
  },
  backContent: {
    display: "grid",
    gap: "3px",
    flex: 1,
  },
  backCaption: {
    color: "#8a6a4a",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.13em",
  },
  backTitle: {
    color: "#214d32",
    fontSize: "13px",
    fontWeight: 700,
  },
  backArrow: {
    color: "#8a6a4a",
    fontSize: "19px",
    padding: "0 3px",
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.2em",
    color: "var(--brown, #8a6a4a)",
    marginBottom: "9px",
  },
  eyebrowDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#2f6b45",
  },
  title: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: "clamp(34px, 7vw, 45px)",
    lineHeight: 1.15,
    letterSpacing: "-1.2px",
    color: "var(--green-dark, #214d32)",
    fontWeight: 600,
    margin: 0,
  },
  subtitle: {
    fontSize: "13px",
    lineHeight: 1.8,
    color: "#737d74",
    margin: "12px 0 0",
    maxWidth: "450px",
  },
  loadingWrap: {
    minHeight: "calc(100vh - 94px)",
    display: "grid",
    placeItems: "center",
    width: "100%",
    maxWidth: "430px",
    margin: "0 auto",
  },
  loadingCard: {
    width: "100%",
    boxSizing: "border-box",
    padding: "34px 25px 27px",
    borderRadius: "24px",
    border: "1px solid rgba(33,77,50,.12)",
    background: "#ffffff",
    boxShadow: "0 18px 50px rgba(33,77,50,.075)",
    textAlign: "center",
    animation: "fadeUp 400ms ease both",
  },
  loadingLogoFrame: {
    width: "86px",
    height: "86px",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 20px",
    overflow: "hidden",
    borderRadius: "22px",
    border: "1px solid #e8eee6",
    background: "#f7f4ee",
  },
  loadingLogo: {
    width: "76px",
    height: "76px",
    objectFit: "contain",
    borderRadius: "14px",
  },
  loadingEyebrow: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.2em",
    color: "#8a6a4a",
    marginBottom: "10px",
  },
  loadingTitle: {
    margin: "0 0 23px",
    color: "#214d32",
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: "25px",
    lineHeight: 1.3,
    fontWeight: 600,
  },
  loadingSpinner: {
    width: "31px",
    height: "31px",
    border: "3px solid #e4ebe2",
    borderTopColor: "#2f6b45",
    borderRadius: "50%",
    margin: "0 auto 17px",
    animation: "loadingSpin 800ms linear infinite",
  },
  loadingText: {
    maxWidth: "285px",
    margin: "0 auto",
    color: "#747d74",
    fontSize: "13px",
    lineHeight: 1.8,
  },
  loadingDivider: {
    width: "45px",
    height: "2px",
    margin: "22px auto 15px",
    borderRadius: "10px",
    background: "#d8e4d7",
  },
  loadingTagline: {
    margin: 0,
    color: "#8a6a4a",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.025em",
  },
  summaryCard: {
    display: "grid",
    gap: "11px",
    padding: "26px",
    borderRadius: "23px",
    background:
      "linear-gradient(135deg, #214d32 0%, #2f6b45 72%, #467a56 100%)",
    color: "#fff",
    boxShadow: "0 14px 32px rgba(33,77,50,.13)",
    marginBottom: "37px",
    animation: "fadeUp 450ms ease both",
  },
  summaryTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  summaryLabel: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    color: "rgba(255,255,255,.76)",
  },
  summaryIcon: {
    width: "43px",
    height: "43px",
    display: "grid",
    placeItems: "center",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,.18)",
    background: "rgba(255,255,255,.09)",
    color: "#ffffff",
    flexShrink: 0,
  },
  amount: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: "clamp(28px, 7vw, 39px)",
    fontWeight: 700,
    letterSpacing: "-0.035em",
    overflowWrap: "anywhere",
  },
  summaryDescription: {
    color: "rgba(255,255,255,.82)",
    fontSize: "13px",
    lineHeight: 1.7,
    margin: 0,
  },
  summaryFooter: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderTop: "1px solid rgba(255,255,255,.17)",
    paddingTop: "15px",
    marginTop: "5px",
    color: "rgba(255,255,255,.78)",
    fontSize: "11px",
    lineHeight: 1.6,
  },
  summaryFooterDot: {
    width: "6px",
    height: "6px",
    flexShrink: 0,
    borderRadius: "50%",
    background: "#d6e6ce",
  },
  section: {
    marginBottom: "37px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "17px",
  },
  sectionEyebrow: {
    color: "var(--brown, #8a6a4a)",
    fontSize: "10px",
    letterSpacing: "0.15em",
    fontWeight: 800,
    marginBottom: "6px",
  },
  sectionTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    color: "var(--green-dark, #214d32)",
    fontSize: "24px",
    lineHeight: 1.3,
    letterSpacing: "-0.025em",
    margin: 0,
    fontWeight: 600,
  },
  sectionDescription: {
    color: "#7b8179",
    fontSize: "12px",
    lineHeight: 1.7,
    margin: "7px 0 0",
  },
  count: {
    minWidth: "34px",
    height: "34px",
    padding: "0 8px",
    boxSizing: "border-box",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    background: "#e8eee7",
    color: "#214d32",
    fontSize: "12px",
    fontWeight: 800,
  },
  list: {
    display: "grid",
    gap: "14px",
  },
  orderCard: {
    padding: "22px",
    borderRadius: "19px",
    background: "#fff",
    border: "1px solid #e8e2d8",
    boxShadow: "0 5px 17px rgba(33,77,50,.04)",
    animation: "fadeUp 350ms ease both",
  },
  orderTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "17px",
  },
  orderIcon: {
    width: "43px",
    height: "43px",
    display: "grid",
    placeItems: "center",
    borderRadius: "14px",
    background: "#edf3ec",
    color: "#2f6b45",
  },
  status: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    borderRadius: "20px",
    padding: "7px 10px",
    fontSize: "10px",
    fontWeight: 800,
    textAlign: "center",
    lineHeight: 1.4,
  },
  statusDot: {
    width: "6px",
    height: "6px",
    flexShrink: 0,
    borderRadius: "50%",
    background: "currentColor",
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
    fontSize: "10px",
    letterSpacing: "0.09em",
    color: "#8a8a80",
    fontWeight: 800,
    marginBottom: "6px",
  },
  cardTitle: {
    fontSize: "16px",
    lineHeight: 1.5,
    color: "#214d32",
    fontWeight: 800,
    margin: "0 0 8px",
  },
  cardDescription: {
    fontSize: "13px",
    lineHeight: 1.8,
    color: "#777970",
    margin: "0 0 17px",
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
    lineHeight: 1.6,
  },
  orderAmount: {
    color: "#214d32",
    fontSize: "14px",
    lineHeight: 1.5,
    textAlign: "right",
    overflowWrap: "anywhere",
  },
  primaryButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    minHeight: "46px",
    border: "1px solid #2f6b45",
    borderRadius: "12px",
    padding: "12px 16px",
    background: "#2f6b45",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "center",
    boxSizing: "border-box",
  },
  secondaryButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    minHeight: "46px",
    border: "1px solid #dce5da",
    borderRadius: "12px",
    padding: "12px 16px",
    background: "#f7faf6",
    color: "#214d32",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "center",
    boxSizing: "border-box",
  },
  emptyCard: {
    padding: "30px 22px",
    borderRadius: "19px",
    background: "#fff",
    border: "1px solid #e8e2d8",
    textAlign: "center",
    boxShadow: "0 5px 17px rgba(33,77,50,.035)",
  },
  emptyIcon: {
    width: "53px",
    height: "53px",
    display: "grid",
    placeItems: "center",
    borderRadius: "17px",
    background: "#edf3ec",
    color: "#2f6b45",
    margin: "0 auto 17px",
  },
  packageCard: {
    padding: "23px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "13px",
    borderRadius: "19px",
    background: "#fff",
    border: "1px solid #e8e2d8",
    boxShadow: "0 5px 17px rgba(33,77,50,.035)",
  },
  packageTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "2px",
  },
  packageIcon: {
    width: "48px",
    height: "48px",
    display: "grid",
    placeItems: "center",
    borderRadius: "15px",
    background: "#edf3ec",
    color: "#2f6b45",
  },
  packageBadge: {
    padding: "7px 10px",
    borderRadius: "8px",
    background: "#f7f4ee",
    color: "#8a6a4a",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.1em",
  },
  error: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    background: "#fff7f4",
    border: "1px solid #ead0c9",
    color: "#8a3d2f",
    padding: "19px",
    borderRadius: "16px",
    fontSize: "13px",
    lineHeight: 1.7,
    marginBottom: "22px",
  },
  errorIcon: {
    width: "32px",
    height: "32px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    borderRadius: "10px",
    background: "#f6e4df",
    fontWeight: 800,
  },
  errorContent: {
    flex: 1,
    minWidth: 0,
  },
  errorTitle: {
    display: "block",
    marginBottom: "5px",
  },
  errorText: {
    margin: 0,
    overflowWrap: "anywhere",
  },
  retryButton: {
    marginTop: "13px",
    padding: "10px 14px",
    border: "1px solid #d8aaa0",
    borderRadius: "10px",
    background: "#fff",
    color: "#8a3d2f",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  helper: {
    fontSize: "12px",
    color: "#85847b",
    lineHeight: 1.8,
    margin: "13px 2px 0",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    borderTop: "1px solid #e4ddd1",
    paddingTop: "23px",
    marginTop: "40px",
  },
  footerLogoFrame: {
    width: "46px",
    height: "46px",
    flexShrink: 0,
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    border: "1px solid #e8e2d8",
    borderRadius: "12px",
    background: "#fff",
  },
  footerLogo: {
    width: "46px",
    height: "46px",
    objectFit: "contain",
    borderRadius: "11px",
  },
  footerContent: {
    minWidth: 0,
  },
  footerTitle: {
    color: "#214d32",
    fontSize: "13px",
  },
  footerText: {
    margin: "4px 0 0",
    color: "#85847b",
    fontSize: "11px",
  },
  footerSmall: {
    margin: "3px 0 0",
    color: "#9a9589",
    fontSize: "10px",
  },
};
