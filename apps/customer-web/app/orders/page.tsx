
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
          .select(
            `
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
            `
          )
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

        const { data: subscriptionRequest, error: subscriptionError } =
          await supabase
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

        setIsSubscriptionOrder(!!subscriptionRequest);
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
    minHeight: 50,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    padding: "14px 16px",
    border: "1px solid var(--line)",
    borderRadius: 12,
    background: "#fff",
    color: "var(--green)",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.5,
    textAlign: "left",
    textDecoration: "none",
    transition: "border-color .2s ease, background .2s ease",
  };

  const accessArrowStyle: React.CSSProperties = {
    flexShrink: 0,
    color: "var(--brown)",
    fontSize: 18,
    fontWeight: 500,
  };

  if (loading) {
    return <PajaraLoading />;
  }

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
    <main>
      <header className="pajara-header">
        <div className="pajara-container pajara-header-inner">
          <a
            href="/dashboard"
            className="pajara-brand"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
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

      <section className="pajara-order-detail">
        <div className="pajara-container">
          <div className="pajara-order-detail-header">
            <p className="pajara-eyebrow">DETAIL PESANAN</p>
            <h1>
              Pesanan <span>Pajara.</span>
            </h1>
            <p>
              Pantau status project, revisi, dan file desain Anda dari satu
              tempat.
            </p>
          </div>

          <div
            className="pajara-order-detail-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1.5fr) minmax(280px, 1fr)",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
              <div className="pajara-order-detail-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 20,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
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

              <div className="pajara-order-detail-card">
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

                  {order.deadline && (
                    <div>
                      <p className="pajara-eyebrow">DEADLINE</p>
                      <strong>
                        {new Date(
                          `${order.deadline}T00:00:00`
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </strong>
                    </div>
                  )}
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
              <div className="pajara-order-detail-card">
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
                    gap: 12,
                    marginTop: 22,
                  }}
                >
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
