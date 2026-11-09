"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@pajara/supabase";
import CustomerLoading from "../../components/CustomerLoading";

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
  zIndex: 100,
  width: "100%",
  background: "rgba(247,244,238,.76)",
  backdropFilter: "blur(18px) saturate(160%)",
  WebkitBackdropFilter: "blur(18px) saturate(160%)",
  borderBottom: "1px solid rgba(33,77,50,.10)",
  boxShadow: "0 4px 20px rgba(33,77,50,.035)",
};

const navbarInnerStyle: React.CSSProperties = {
  width: "min(1120px, calc(100% - 24px))",
  minHeight: 74,
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  boxSizing: "border-box",
};

const navbarBrandStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 11,
  minWidth: 0,
  color: "#214D32",
  textDecoration: "none",
};

const navbarLogoStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  minWidth: 40,
  display: "block",
  objectFit: "contain",
  borderRadius: 10,
};

const navbarBrandTextStyle: React.CSSProperties = {
  color: "#214D32",
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 17,
  fontWeight: 700,
  letterSpacing: "-.3px",
  whiteSpace: "nowrap",
};

const navbarBackStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  flexShrink: 0,
  minHeight: 40,
  padding: "9px 15px",
  border: "1px solid rgba(33,77,50,.13)",
  borderRadius: 10,
  background: "rgba(255,255,255,.75)",
  color: "#214D32",
  fontFamily: "Arial, sans-serif",
  fontSize: 12,
  fontWeight: 700,
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "background .2s ease",
};

function BriefNavbar({ orderId = "" }: { orderId?: string }) {
  const backHref = orderId
    ? `/orders?id=${encodeURIComponent(orderId)}`
    : "/orders";

  return (
    <nav style={navbarStyle}>
      <div className="brief-navbar-inner" style={navbarInnerStyle}>
        <Link href="/dashboard" style={navbarBrandStyle}>
          <Image
            src={LOGO}
            alt="Logo Pajara Studio"
            width={40}
            height={40}
            priority
            unoptimized
            style={navbarLogoStyle}
          />

          <span style={navbarBrandTextStyle}>Pajara Studio</span>
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
    border: "1px solid rgba(33,77,50,.09)",
    borderRadius: 23,
    padding: 24,
    boxShadow: "0 10px 35px rgba(33,77,50,.08)",
    boxSizing: "border-box",
    minWidth: 0,
  };

  const eyebrowStyle: React.CSSProperties = {
    color: "#8A6A4A",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.7,
    lineHeight: 1.7,
    margin: "0 0 8px",
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: "Arial, sans-serif",
    fontSize: 14,
    lineHeight: 1.85,
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
    minHeight: 46,
    padding: "12px 18px",
    boxSizing: "border-box",
    borderRadius: 11,
    border: "none",
    background: "#214D32",
    color: "#FFFFFF",
    textDecoration: "none",
    fontFamily: "Arial, sans-serif",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };

  const backErrorStyle: React.CSSProperties = {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 46,
    padding: "12px 16px",
    boxSizing: "border-box",
    border: "1px solid rgba(33,77,50,.14)",
    borderRadius: 11,
    background: "#FFFFFF",
    color: "#214D32",
    textDecoration: "none",
    fontFamily: "Arial, sans-serif",
    fontSize: 13,
    fontWeight: 700,
  };

  if (loading) {
    return (
      <CustomerLoading
        title="Menyiapkan Brief"
        description="Sebentar, kami sedang menyiapkan halaman brief pesanan Kang/Teh."
      />
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "clip",
        boxSizing: "border-box",
        background: "#F7F4EE",
        color: "#26352A",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <BriefNavbar orderId={id || ""} />

      <div className="brief-container">
        <header className="brief-header">
          <p style={eyebrowStyle}>RUANG PROJECT PAJARA</p>

          <h1 className="brief-page-title">
            Brief <span>Desain.</span>
          </h1>

          <p className="brief-description">
            Semua arahan dan informasi desain tersimpan di satu tempat agar
            perjalanan kita dalam mengerjakan project tetap terarah.
          </p>
        </header>

        {error ? (
          <section style={cardStyle} aria-live="polite">
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: 46,
                height: 46,
                marginBottom: 18,
                borderRadius: 14,
                background: "#F9EFEB",
                color: "#A13B32",
                fontSize: 21,
                fontWeight: 700,
              }}
            >
              !
            </div>

            <h2 className="brief-section-title">
              Brief belum tersedia
            </h2>

            <p
              style={{
                margin: "0 0 20px",
                color: "#70766F",
                fontSize: 13,
                lineHeight: 1.8,
              }}
            >
              {error}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
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
          <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
            <section style={cardStyle}>
              <div className="brief-order-heading">
                <div style={{ minWidth: 0 }}>
                  <p style={eyebrowStyle}>KODE PESANAN</p>

                  <h2 className="brief-order-code">
                    #{order.order_code}
                  </h2>
                </div>

                <span className="brief-status">
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <p style={eyebrowStyle}>RINGKASAN PROJECT</p>

              <h2 className="brief-section-title">
                Informasi Desain
              </h2>

              <div className="brief-info-grid">
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
                  <div key={item.label} className="brief-info-item">
                    <p style={eyebrowStyle}>{item.label}</p>

                    <p className="brief-info-value">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section style={cardStyle}>
              <p style={eyebrowStyle}>ARAHAN DESAIN</p>

              <h2 className="brief-section-title">
                Brief Utama
              </h2>

              <p className="brief-section-description">
                Arahan utama sebagai acuan pengerjaan desain Anda.
              </p>

              <div className="brief-text-box brief-main-text">
                {order.brief?.trim() ||
                  "Belum ada brief utama yang tercatat."}
              </div>

              <div className="brief-divider" />

              <p style={eyebrowStyle}>INFORMASI TAMBAHAN</p>

              <h2 className="brief-subtitle">
                Catatan Tambahan
              </h2>

              <div className="brief-text-box brief-notes-text">
                {order.notes?.trim() || "Tidak ada catatan tambahan."}
              </div>
            </section>
          </div>
        ) : null}

        <footer className="brief-footer">
          <div className="brief-footer-brand">
            <Image
              src={LOGO}
              alt="Logo Pajara Studio"
              width={43}
              height={43}
              unoptimized
              style={{
                width: 43,
                height: 43,
                flexShrink: 0,
                objectFit: "contain",
                borderRadius: 10,
                background: "#FFFFFF",
              }}
            />

            <div>
              <strong>Pajara Studio</strong>

              <p>Berakar di Tanah Pasundan.</p>
            </div>
          </div>

          <p className="brief-footer-copyright">
            © 2026 Pajara Studio. Desain yang punya arah.
          </p>
        </footer>
      </div>

      <style jsx>{`
        .brief-container {
          width: min(850px, calc(100% - 40px));
          margin: 0 auto;
          padding: 42px 0 34px;
          box-sizing: border-box;
        }

        .brief-header {
          margin-bottom: 30px;
        }

        .brief-page-title {
          margin: 0 0 12px;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 42px;
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.8px;
        }

        .brief-page-title span {
          color: #8a6a4a;
        }

        .brief-description {
          max-width: 590px;
          margin: 0;
          color: #70766f;
          font-family: Arial, sans-serif;
          font-size: 13px;
          line-height: 1.9;
        }

        .brief-order-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          flex-wrap: wrap;
          padding-bottom: 22px;
          border-bottom: 1px solid #eeeae3;
          margin-bottom: 24px;
        }

        .brief-order-code {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 26px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .brief-status {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          padding: 8px 13px;
          border-radius: 999px;
          background: #edf4eb;
          color: #2f6b45;
          font-size: 11px;
          line-height: 1.5;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .brief-section-title {
          margin: 0 0 20px;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 25px;
          font-weight: 600;
          line-height: 1.4;
        }

        .brief-section-description {
          margin: -10px 0 20px;
          color: #70766f;
          font-size: 13px;
          line-height: 1.8;
        }

        .brief-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .brief-info-item {
          padding: 17px;
          min-width: 0;
          border: 1px solid #eeeae3;
          border-radius: 13px;
          background: #fcfbf8;
          box-sizing: border-box;
        }

        .brief-info-value {
          margin: 0;
          color: #34443a;
          font-size: 13px;
          line-height: 1.8;
          font-weight: 600;
          overflow-wrap: anywhere;
        }

        .brief-text-box {
          color: #34443a;
          font-family: Arial, sans-serif;
          font-size: 13px;
          line-height: 1.9;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          padding: 20px;
          box-sizing: border-box;
          border: 1px solid #eae7df;
          border-radius: 14px;
          background: #faf9f6;
        }

        .brief-main-text {
          min-height: 110px;
        }

        .brief-notes-text {
          min-height: 76px;
        }

        .brief-divider {
          height: 1px;
          margin: 26px 0;
          background: #eeeae3;
        }

        .brief-subtitle {
          margin: 0 0 16px;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
          font-weight: 600;
          line-height: 1.4;
        }

        .brief-footer {
          border-top: 1px solid #e4ddd1;
          padding-top: 22px;
          margin-top: 36px;
        }

        .brief-footer-brand {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .brief-footer-brand strong {
          display: block;
          color: #214d32;
          font-family: Arial, sans-serif;
          font-size: 13px;
          line-height: 1.5;
        }

        .brief-footer-brand p {
          margin: 4px 0 0;
          color: #8a6a4a;
          font-size: 11px;
          line-height: 1.5;
        }

        .brief-footer-copyright {
          margin: 20px 0 0;
          padding-top: 14px;
          border-top: 1px solid #e9e3d9;
          color: #999387;
          font-size: 10px;
          line-height: 1.7;
        }

        @media (max-width: 600px) {
          .brief-container {
            width: calc(100% - 28px);
            padding-top: 30px;
          }

          .brief-page-title {
            font-size: 35px;
          }

          .brief-description {
            font-size: 12px;
          }

          .brief-info-grid {
            grid-template-columns: 1fr;
          }

          .brief-order-code {
            font-size: 23px;
          }

          .brief-section-title {
            font-size: 23px;
          }

          .brief-subtitle {
            font-size: 21px;
          }

          .brief-text-box {
            padding: 17px;
            font-size: 12px;
          }
        }

        @media (max-width: 420px) {
          .brief-navbar-inner {
            gap: 8px !important;
          }

          .brief-navbar-inner a:first-child {
            gap: 8px !important;
          }

          .brief-navbar-inner a:first-child img {
            width: 38px !important;
            height: 38px !important;
          }

          .brief-navbar-inner a:first-child span {
            font-size: 15px !important;
          }

          .brief-navbar-inner a:last-child {
            padding: 9px 10px !important;
            font-size: 10px !important;
          }

          .brief-container {
            width: calc(100% - 28px);
          }
        }

        @media (max-width: 360px) {
          .brief-navbar-inner a:first-child img {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
          }

          .brief-navbar-inner a:first-child span {
            font-size: 13px !important;
          }

          .brief-navbar-inner a:last-child {
            gap: 5px !important;
            padding: 8px !important;
            font-size: 9px !important;
          }

          .brief-page-title {
            font-size: 32px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

export default function BriefPage() {
  return (
    <Suspense
      fallback={
        <CustomerLoading
          title="Menyiapkan Brief"
          description="Sebentar, kami sedang menyiapkan halaman brief pesanan Kang/Teh."
        />
      }
    >
      <BriefContent />
    </Suspense>
  );
}
