"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@pajara/supabase";

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

function PajaraLoading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#F7F4EE",
        fontFamily: '"DM Sans", sans-serif',
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          padding: "38px 24px",
          boxSizing: "border-box",
          textAlign: "center",
          border: "1px solid rgba(33,77,50,.12)",
          borderRadius: 24,
          background: "rgba(255,255,255,.85)",
          boxShadow: "0 20px 55px rgba(33,77,50,.07)",
        }}
      >
        <img
          src="/755809946_17926162029385149_3739923509439876817_n.jpg"
          alt="Pajara Studio"
          style={{
            width: 66,
            height: 66,
            objectFit: "contain",
            borderRadius: 16,
            marginBottom: 18,
          }}
        />

        <p
          style={{
            margin: 0,
            color: "#214D32",
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 25,
          }}
        >
          Pajara Studio
        </p>

        <p
          style={{
            margin: "10px 0 24px",
            color: "#70766F",
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          Menyiapkan detail pesananmu...
        </p>

        <div
          role="status"
          aria-label="Memuat"
          style={{
            width: 30,
            height: 30,
            margin: "0 auto",
            border: "3px solid #DCE5DC",
            borderTopColor: "#2F6B45",
            borderRadius: "50%",
            animation: "pajara-spin .8s linear infinite",
          }}
        />

        <p
          style={{
            margin: "22px 0 0",
            color: "#8A6A4A",
            fontSize: 10,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          DESAIN YANG PUNYA ARAH
        </p>
      </div>

      <style>{`
        @keyframes pajara-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [isSubscriptionOrder, setIsSubscriptionOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <PajaraLoading />;

  if (error || !order) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#F7F4EE",
          fontFamily: '"DM Sans", sans-serif',
          boxSizing: "border-box",
        }}
      >
        <div
          className="pajara-order-detail-card"
          style={{
            width: "100%",
            maxWidth: 460,
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <p className="pajara-eyebrow">PAJARA STUDIO</p>

          <h1 style={{ color: "var(--green)" }}>
            Pesanan tidak dapat ditemukan
          </h1>

          <p
            style={{
              color: "var(--muted)",
              fontSize: 14,
              lineHeight: 1.8,
            }}
          >
            {error || "Pesanan tidak tersedia."}
          </p>

          <a
            href="/dashboard"
            className="pajara-button pajara-button-primary"
            style={{ marginTop: 16 }}
          >
            Kembali ke Dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minWidth: 0, width: "100%", overflowX: "clip" }}>
      <header className="pajara-header">
        <div className="pajara-container pajara-header-inner">
          <a
            href="/dashboard"
            className="pajara-brand"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
              textDecoration: "none",
            }}
          >
            <img
              src="/755809946_17926162029385149_3739923509439876817_n.jpg"
              alt="Logo Pajara Studio"
              style={{
                width: 42,
                height: 42,
                objectFit: "contain",
                borderRadius: 10,
                flexShrink: 0,
              }}
            />
            <span>Pajara Studio</span>
          </a>

          <nav className="pajara-nav">
            <a href="/dashboard">Dashboard</a>
            <a href="/order" className="pajara-nav-cta">
              Pesan Desain
            </a>
          </nav>
        </div>
      </header>

      <section
        className="pajara-order-detail"
        style={{
          width: "100%",
          boxSizing: "border-box",
          overflowX: "clip",
        }}
      >
        <div
          className="pajara-container"
          style={{
            width: "100%",
            maxWidth: 1160,
            marginInline: "auto",
            paddingInline: "clamp(18px, 4vw, 28px)",
            boxSizing: "border-box",
            minWidth: 0,
          }}
        >
          <div
            className="pajara-order-detail-header"
            style={{
              display: "block",
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              height: "auto",
              boxSizing: "border-box",
              margin: "0 0 28px",
              padding: 0,
              textAlign: "left",
              overflowWrap: "break-word",
            }}
          >
            <p
              className="pajara-eyebrow"
              style={{
                display: "block",
                margin: "0 0 12px",
                fontSize: 11,
                lineHeight: 1.6,
                letterSpacing: 2,
              }}
            >
              DETAIL PESANAN
            </p>

            <h1
              style={{
                display: "block",
                width: "100%",
                maxWidth: "100%",
                margin: "0 0 12px",
                padding: 0,
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: "clamp(30px, 5vw, 46px)",
                lineHeight: 1.2,
                fontWeight: 600,
                overflowWrap: "normal",
                wordBreak: "normal",
              }}
            >
              Pesanan <span>Pajara.</span>
            </h1>

            <p
              style={{
                display: "block",
                width: "100%",
                maxWidth: 560,
                margin: 0,
                fontSize: 14,
                lineHeight: 1.8,
                overflowWrap: "break-word",
              }}
            >
              Pantau status project, revisi, dan file desain Anda dari satu
              tempat.
            </p>
          </div>

          <div
            className="pajara-order-detail-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
              gap: 24,
              alignItems: "start",
              width: "100%",
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: 20,
                minWidth: 0,
              }}
            >
              <div className="pajara-order-detail-card" style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                    minWidth: 0,
                  }}
                >
                  <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>
                    <p className="pajara-eyebrow">ID PESANAN</p>
                    <h2 style={{ marginTop: 8, marginBottom: 0 }}>
                      #{order.order_code}
                    </h2>
                  </div>

                  <span className="pajara-order-status">
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              <div className="pajara-order-detail-card" style={{ minWidth: 0 }}>
                <p className="pajara-eyebrow">RINGKASAN</p>
                <h2>Informasi Pesanan</h2>

                {isSubscriptionOrder && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 14,
                      borderRadius: 12,
                      background: "var(--soft)",
                      color: "var(--green)",
                      fontSize: 14,
                      lineHeight: 1.7,
                    }}
                  >
                    Pesanan ini menggunakan kuota paket Anda. Tidak ada
                    pembayaran tambahan per desain.
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gap: 16,
                    marginTop: 22,
                  }}
                >
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

            <div
              style={{
                display: "grid",
                gap: 20,
                alignContent: "start",
                minWidth: 0,
              }}
            >
              <div className="pajara-order-detail-card" style={{ minWidth: 0 }}>
                <p className="pajara-eyebrow">AKSES PESANAN</p>
                <h2>Kelola Project</h2>

                <p
                  className="pajara-consistent-text"
                  style={{ marginTop: 10 }}
                >
                  Buka informasi project dan file desain Anda saat diperlukan.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr)",
                    gap: 12,
                    marginTop: 22,
                    width: "100%",
                    minWidth: 0,
                  }}
                >
                  {!isSubscriptionOrder && (
                    <a
                      href={`/orders/payment?id=${encodeURIComponent(order.id)}`}
                      className="pajara-access-button"
                      style={accessButtonStyle}
                    >
                      <span style={{ minWidth: 0 }}>Pembayaran</span>
                      <span style={accessArrowStyle}>→</span>
                    </a>
                  )}

                  <a
                    href={`/orders/revision?id=${encodeURIComponent(order.id)}`}
                    className="pajara-access-button"
                    style={accessButtonStyle}
                  >
                    <span style={{ minWidth: 0 }}>Revisi</span>
                    <span style={accessArrowStyle}>→</span>
                  </a>

                  <a
                    href={`/orders/brief?id=${encodeURIComponent(order.id)}`}
                    className="pajara-access-button"
                    style={accessButtonStyle}
                  >
                    <span style={{ minWidth: 0 }}>Lihat Brief Desain</span>
                    <span style={accessArrowStyle}>→</span>
                  </a>

                  <a
                    href={`/orders/final-files?id=${encodeURIComponent(order.id)}`}
                    className="pajara-access-button"
                    style={accessButtonStyle}
                  >
                    <span style={{ minWidth: 0 }}>Lihat File Final Anda</span>
                    <span style={accessArrowStyle}>→</span>
                  </a>

                  <a
                    href={`/orders/files?id=${encodeURIComponent(order.id)}`}
                    className="pajara-access-button"
                    style={accessButtonStyle}
                  >
                    <span style={{ minWidth: 0 }}>File Referensi Pesanan</span>
                    <span style={accessArrowStyle}>→</span>
                  </a>
                </div>
              </div>

              {!isSubscriptionOrder && (
                <div className="pajara-order-detail-card" style={{ minWidth: 0 }}>
                  <p className="pajara-eyebrow">PEMBAYARAN</p>
                  <h2>Ringkasan Biaya</h2>

                  <div
                    style={{
                      display: "grid",
                      gap: 14,
                      marginTop: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        fontSize: 14,
                      }}
                    >
                      <span className="pajara-consistent-text">Total</span>
                      <strong>{formatRupiah(order.total_amount)}</strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        fontSize: 14,
                      }}
                    >
                      <span className="pajara-consistent-text">DP</span>
                      <strong>{formatRupiah(order.dp_amount)}</strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        paddingTop: 14,
                        borderTop: "1px solid var(--line)",
                        fontSize: 14,
                      }}
                    >
                      <span className="pajara-consistent-text">Sisa</span>
                      <strong style={{ color: "var(--green)" }}>
                        {formatRupiah(order.remaining_amount)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 28, paddingBottom: 24 }}>
            <a
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "var(--green)",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              ← Kembali ke Dashboard
            </a>
          </div>
        </div>
      </section>

      <style>{`
        .pajara-order-detail-grid > * {
          min-width: 0;
        }

        .pajara-order-detail-card {
          box-sizing: border-box;
          min-width: 0;
          overflow-wrap: break-word;
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

        @media (max-width: 760px) {
          .pajara-order-detail-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 18px !important;
          }

          .pajara-order-detail-grid > * {
            width: 100%;
            min-width: 0;
          }

          .pajara-order-detail-card {
            width: 100%;
            padding: clamp(20px, 5vw, 28px) !important;
          }

          .pajara-order-detail-header h1 {
            font-size: clamp(30px, 8vw, 38px) !important;
          }

          .pajara-access-button {
            width: 100%;
            min-height: 54px;
          }
        }
      `}</style>
    </main>
  );
}

function OrderDetailFallback() {
  return <PajaraLoading />;
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<OrderDetailFallback />}>
      <OrderDetailContent />
    </Suspense>
  );
}
