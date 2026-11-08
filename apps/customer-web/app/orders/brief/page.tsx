"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@pajara/supabase";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  quantity: number | null;
  brief: string | null;
  notes: string | null;
  deadline: string | null;
  status: string | null;
  created_at: string;
};

const LOGO =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

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
      return status || "Dalam proses";
  }
}

/* =========================
   NAVBAR
========================= */

const navbarStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  width: "calc(100% + 36px)",
  marginLeft: -18,
  borderBottom: "1px solid rgba(47,107,69,.10)",
  background: "rgba(247,244,238,.88)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

const navbarInnerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 796,
  minHeight: 58,
  padding: "0 18px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  boxSizing: "border-box",
};

const navbarBrandStyle: React.CSSProperties = {
  display: "inline-flex",
  minWidth: 0,
  alignItems: "center",
  gap: 9,
  color: "#214D32",
  fontSize: 14,
  fontWeight: 800,
  textDecoration: "none",
};

const navbarLogoStyle: React.CSSProperties = {
  display: "block",
  width: 35,
  height: 35,
  minWidth: 35,
  borderRadius: 11,
  objectFit: "cover",
};

const navbarBackStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  flexShrink: 0,
  padding: "8px 11px",
  border: "1px solid rgba(47,107,69,.16)",
  borderRadius: 9,
  background: "rgba(255,255,255,.72)",
  color: "#214D32",
  fontSize: 10,
  fontWeight: 800,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

function BriefNavbar({ orderId = "" }: { orderId?: string }) {
  const backHref = orderId
    ? `/orders?id=${encodeURIComponent(orderId)}`
    : "/orders";

  return (
    <nav style={navbarStyle}>
      <div style={navbarInnerStyle}>
        <Link href="/dashboard" style={navbarBrandStyle}>
          <Image
            src={LOGO}
            alt="Logo Pajara Studio"
            width={35}
            height={35}
            priority
            unoptimized
            style={navbarLogoStyle}
          />
          <span>Pajara Studio</span>
        </Link>

        <Link href={backHref} style={navbarBackStyle}>
          <span aria-hidden="true">←</span>
          Kembali ke Pesanan
        </Link>
      </div>
    </nav>
  );
}

/* =========================
   LOADING
========================= */

function PajaraLoading({
  message = "Menyiapkan brief desainmu...",
}: {
  message?: string;
}) {
  return (
    <main style={pageStyle}>
      <BriefNavbar />

      <div
        style={{
          width: "100%",
          maxWidth: 320,
          padding: "30px 20px",
          margin: "min(12vh, 80px) auto 0",
          boxSizing: "border-box",
          textAlign: "center",
          border: "1px solid rgba(33,77,50,.12)",
          borderRadius: 20,
          background: "rgba(255,255,255,.9)",
          boxShadow: "0 15px 40px rgba(33,77,50,.06)",
        }}
      >
        <Image
          src={LOGO}
          alt="Pajara Studio"
          width={56}
          height={56}
          priority
          unoptimized
          style={{
            objectFit: "contain",
            borderRadius: 13,
            marginBottom: 14,
          }}
        />

        <p
          style={{
            margin: 0,
            color: "#214D32",
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 22,
          }}
        >
          Pajara Studio
        </p>

        <p
          style={{
            margin: "8px 0 20px",
            color: "#70766F",
            fontSize: 12,
            lineHeight: 1.7,
          }}
        >
          {message}
        </p>

        <div className="brief-spinner" role="status" aria-label="Memuat" />

        <p
          style={{
            margin: "18px 0 0",
            color: "#8A6A4A",
            fontSize: 9,
            letterSpacing: 1.8,
            fontWeight: 700,
          }}
        >
          DESAIN YANG PUNYA ARAH
        </p>
      </div>

      <BriefGlobalStyles />
    </main>
  );
}

/* =========================
   PAGE STYLE
========================= */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F7F4EE",
  padding: "0 18px 40px",
  boxSizing: "border-box",
  color: "#1D2A22",
  fontFamily: '"DM Sans", Arial, sans-serif',
};

/* =========================
   GLOBAL CSS
========================= */

function BriefGlobalStyles() {
  return (
    <style jsx global>{`
      .brief-page * {
        box-sizing: border-box;
      }

      .brief-spinner {
        width: 26px;
        height: 26px;
        margin: 0 auto;
        border: 3px solid #dce5dc;
        border-top-color: #2f6b45;
        border-radius: 50%;
        animation: briefSpin 0.8s linear infinite;
      }

      .brief-page a,
      .brief-page button {
        -webkit-tap-highlight-color: transparent;
        transition: all 160ms ease;
      }

      .brief-page a:active,
      .brief-page button:active {
        transform: scale(0.99);
      }

      .brief-page a:focus-visible,
      .brief-page button:focus-visible {
        outline: 2px solid rgba(47, 107, 69, 0.45);
        outline-offset: 3px;
      }

      .brief-container {
        width: 100%;
        max-width: 760px;
        margin: 0 auto;
        padding-top: 23px !important;
        padding-bottom: 25px !important;
      }

      .brief-header {
        margin-bottom: 20px !important;
      }

      .brief-header h1 {
        font-size: clamp(29px, 5vw, 37px) !important;
        margin-bottom: 8px !important;
      }

      .brief-header > p:last-child {
        font-size: 12px !important;
        line-height: 1.7 !important;
      }

      .brief-content {
        display: grid;
        gap: 15px !important;
        min-width: 0;
      }

      .brief-card {
        padding: 19px !important;
        border-radius: 17px !important;
      }

      .brief-card h2 {
        font-size: 22px !important;
      }

      .brief-info-grid {
        gap: 9px !important;
      }

      .brief-info-item {
        padding: 13px 14px !important;
        border-radius: 12px !important;
      }

      .brief-info-item p:first-child {
        font-size: 9px !important;
        margin-bottom: 5px !important;
      }

      .brief-info-item p:last-child {
        font-size: 13px !important;
        line-height: 1.6 !important;
      }

      .brief-text-box {
        min-height: 65px !important;
        padding: 14px !important;
        font-size: 13px !important;
        line-height: 1.75 !important;
      }

      .brief-footer {
        margin-top: 25px !important;
        padding-top: 17px !important;
      }

      .brief-footer img {
        width: 38px !important;
        height: 38px !important;
      }

      @keyframes briefSpin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 420px) {
        .brief-navbar-inner {
          gap: 8px !important;
          padding: 0 13px !important;
        }

        .brief-navbar-inner a:first-child {
          gap: 8px !important;
          font-size: 13px !important;
        }

        .brief-navbar-inner a:last-child {
          padding: 8px 9px !important;
          font-size: 9px !important;
        }

        .brief-card {
          padding: 16px !important;
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
  );
}

/* =========================
   MAIN CONTENT
========================= */

function BriefContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        if (!id) {
          if (active) setError("ID pesanan tidak ditemukan.");
          return;
        }

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (authError || !user) {
          window.location.href = "/login";
          return;
        }

        const { data, error: orderError } = await supabase
          .from("orders")
          .select(
            "id, order_code, service_name, design_type, quantity, brief, notes, deadline, status, created_at"
          )
          .eq("id", id)
          .eq("customer_id", user.id)
          .maybeSingle();

        if (!active) return;

        if (orderError) {
          console.error("Gagal mengambil brief:", orderError);
          setError("Brief pesanan gagal dimuat. Silakan coba lagi.");
          return;
        }

        if (!data) {
          setError("Pesanan tidak ditemukan atau tidak dapat diakses.");
          return;
        }

        setOrder(data as Order);
      } catch (err) {
        console.error("Kesalahan memuat brief:", err);

        if (active) {
          setError("Brief pesanan gagal dimuat. Silakan coba lagi.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [id]);

  const backHref = id
    ? `/orders?id=${encodeURIComponent(id)}`
    : "/orders";

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid rgba(33,77,50,.11)",
    borderRadius: 17,
    padding: 19,
    boxShadow: "0 8px 25px rgba(33,77,50,.04)",
    boxSizing: "border-box",
    minWidth: 0,
  };

  const eyebrowStyle: React.CSSProperties = {
    color: "#8A6A4A",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.6,
    lineHeight: 1.7,
    margin: "0 0 7px",
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 13,
    lineHeight: 1.75,
    color: "#34443A",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: 0,
  };

  const primaryButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    minHeight: 42,
    padding: "10px 15px",
    boxSizing: "border-box",
    borderRadius: 10,
    border: "none",
    background: "#2F6B45",
    color: "#FFFFFF",
    textDecoration: "none",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };

  const backErrorStyle: React.CSSProperties = {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 42,
    padding: "10px 14px",
    boxSizing: "border-box",
    border: "1px solid rgba(33,77,50,.14)",
    borderRadius: 10,
    background: "#FFFFFF",
    color: "#214D32",
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 700,
  };

  if (loading) return <PajaraLoading />;

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "clip",
        boxSizing: "border-box",
        background: "#F7F4EE",
        color: "#26352A",
        fontFamily: '"DM Sans", sans-serif',
      }}
      className="brief-page"
    >
      <BriefNavbar orderId={id || ""} />

      <section className="brief-container">
        <div className="brief-header">
          <p style={eyebrowStyle}>RUANG PROJECT PAJARA</p>

          <h1
            style={{
              margin: "0 0 10px",
              color: "#214D32",
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 37,
              fontWeight: 600,
              lineHeight: 1.18,
              letterSpacing: "-.6px",
            }}
          >
            Brief <span style={{ color: "#8A6A4A" }}>Desain.</span>
          </h1>

          <p
            style={{
              maxWidth: 590,
              margin: 0,
              color: "#70766F",
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            Semua arahan dan informasi desain tersimpan di satu tempat agar
            perjalanan kita dalam mengerjakan project tetap terarah.
          </p>
        </div>

        {error ? (
          <section style={cardStyle} className="brief-card">
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: 40,
                height: 40,
                marginBottom: 14,
                borderRadius: 12,
                background: "#F9EFEB",
                color: "#A13B32",
                fontSize: 19,
              }}
            >
              !
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                color: "#214D32",
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 22,
              }}
            >
              Brief belum tersedia
            </h2>

            <p
              style={{
                margin: "0 0 17px",
                color: "#70766F",
                fontSize: 12,
                lineHeight: 1.8,
              }}
            >
              {error}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              <button
                onClick={() => window.location.reload()}
                style={primaryButtonStyle}
              >
                Coba Lagi
              </button>

              <Link href={backHref} style={backErrorStyle}>
                Kembali ke Pesanan
              </Link>
            </div>
          </section>
        ) : order ? (
          <div className="brief-content">
            <section style={cardStyle} className="brief-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                  paddingBottom: 17,
                  borderBottom: "1px solid #EEEAE3",
                  marginBottom: 19,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={eyebrowStyle}>KODE PESANAN</p>

                  <h2
                    style={{
                      margin: 0,
                      color: "#214D32",
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontSize: 23,
                      lineHeight: 1.4,
                      overflowWrap: "anywhere",
                    }}
                  >
                    #{order.order_code}
                  </h2>
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "7px 11px",
                    borderRadius: 999,
                    background: "#EDF4EB",
                    color: "#2F6B45",
                    fontSize: 10,
                    lineHeight: 1.5,
                    fontWeight: 700,
                  }}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <p style={eyebrowStyle}>RINGKASAN PROJECT</p>

              <h2
                style={{
                  margin: "0 0 17px",
                  color: "#214D32",
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 25,
                  lineHeight: 1.35,
                }}
              >
                Informasi Desain
              </h2>

              <div
                className="brief-info-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
                  gap: 9,
                }}
              >
                {[
                  {
                    label: "Layanan",
                    value: order.service_name || "Belum ditentukan",
                  },
                  {
                    label: "Jenis Desain",
                    value: order.design_type || "Belum ditentukan",
                  },
                  {
                    label: "Jumlah Desain",
                    value: `${order.quantity ?? "—"} desain`,
                  },
                  {
                    label: "Deadline",
                    value: formatDeadline(order.deadline),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="brief-info-item"
                    style={{
                      padding: 14,
                      minWidth: 0,
                      border: "1px solid #EEEAE3",
                      borderRadius: 12,
                      background: "#FCFBF8",
                    }}
                  >
                    <p style={eyebrowStyle}>{item.label}</p>

                    <p
                      style={{
                        margin: 0,
                        color: "#34443A",
                        fontSize: 13,
                        lineHeight: 1.6,
                        fontWeight: 600,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section style={cardStyle} className="brief-card">
              <p style={eyebrowStyle}>ARAHAN DESAIN</p>

              <h2
                style={{
                  margin: "0 0 8px",
                  color: "#214D32",
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 25,
                  lineHeight: 1.35,
                }}
              >
                Brief Utama
              </h2>

              <p
                style={{
                  margin: "0 0 16px",
                  color: "#70766F",
                  fontSize: 12,
                  lineHeight: 1.8,
                }}
              >
                Arahan utama sebagai acuan pengerjaan desain Anda.
              </p>

              <div
                className="brief-text-box"
                style={{
                  ...valueStyle,
                  padding: 15,
                  minHeight: 80,
                  border: "1px solid #EAE7DF",
                  borderRadius: 13,
                  background: "#FAF9F6",
                }}
              >
                {order.brief?.trim() ||
                  "Belum ada brief utama yang tercatat."}
              </div>

              <div
                style={{
                  height: 1,
                  margin: "21px 0",
                  background: "#EEEAE3",
                }}
              />

              <p style={eyebrowStyle}>INFORMASI TAMBAHAN</p>

              <h2
                style={{
                  margin: "0 0 13px",
                  color: "#214D32",
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 22,
                  lineHeight: 1.4,
                }}
              >
                Catatan Tambahan
              </h2>

              <div
                className="brief-text-box"
                style={{
                  ...valueStyle,
                  padding: 15,
                  minHeight: 65,
                  border: "1px solid #EAE7DF",
                  borderRadius: 13,
                  background: "#FAF9F6",
                }}
              >
                {order.notes?.trim() || "Tidak ada catatan tambahan."}
              </div>
            </section>
          </div>
        ) : null}

        {/* FOOTER */}

        <footer
          className="brief-footer"
          style={{
            borderTop: "1px solid #e4ddd1",
            paddingTop: 17,
            marginTop: 25,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
            }}
          >
            <Image
              src={LOGO}
              alt="Logo Pajara Studio"
              width={38}
              height={38}
              unoptimized
              style={{
                width: 38,
                height: 38,
                flexShrink: 0,
                objectFit: "contain",
                borderRadius: 9,
                background: "#FFFFFF",
              }}
            />

            <div>
              <strong
                style={{
                  display: "block",
                  color: "#214D32",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                Pajara Studio
              </strong>

              <p
                style={{
                  margin: "3px 0 0",
                  color: "#8A6A4A",
                  fontSize: 10,
                  lineHeight: 1.5,
                }}
              >
                Berakar di Tanah Pasundan.
              </p>
            </div>
          </div>

          <p
            style={{
              margin: "16px 0 0",
              paddingTop: 12,
              borderTop: "1px solid #e9e3d9",
              color: "#999387",
              fontSize: 9,
              lineHeight: 1.7,
            }}
          >
            © 2026 Pajara Studio. Desain yang punya arah.
          </p>
        </footer>
      </section>

      <BriefGlobalStyles />
    </main>
  );
}

export default function BriefPage() {
  return (
    <Suspense
      fallback={<PajaraLoading message="Memuat halaman brief..." />}
    >
      <BriefContent />
    </Suspense>
  );
}
