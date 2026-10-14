"use client";

import { Suspense, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@pajara/supabase";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  status: string | null;
};

const LOGO =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

function PajaraLoading({
  message = "Menyiapkan file pesananmu...",
}: {
  message?: string;
}) {
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
          background: "rgba(255,255,255,.9)",
          boxShadow: "0 20px 55px rgba(33,77,50,.07)",
        }}
      >
        <img
          src={LOGO}
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
          {message}
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
            animation: "pajara-reference-spin .8s linear infinite",
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
        @keyframes pajara-reference-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

function FileIcon({ size = 27 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h8" />
    </svg>
  );
}

function FilesContent() {
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
          setError("ID pesanan tidak ditemukan.");
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
          .select("id, order_code, service_name, design_type, status")
          .eq("id", id)
          .eq("customer_id", user.id)
          .maybeSingle();

        if (!active) return;

        if (orderError) {
          throw orderError;
        }

        if (!data) {
          setError(
            "Pesanan tidak ditemukan atau tidak dapat diakses oleh akun ini."
          );
          return;
        }

        setOrder(data as Order);
      } catch (err) {
        console.error("Gagal memuat informasi pesanan:", err);

        if (active) {
          setError("Informasi pesanan gagal dimuat. Silakan coba lagi.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [id]);

  const backHref = id
    ? `/orders?id=${encodeURIComponent(id)}`
    : "/orders";

  const cardStyle: CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid rgba(33,77,50,.11)",
    borderRadius: 22,
    padding: "clamp(20px, 5vw, 30px)",
    boxShadow: "0 12px 35px rgba(33,77,50,.045)",
    boxSizing: "border-box",
    minWidth: 0,
  };

  const eyebrowStyle: CSSProperties = {
    color: "#8A6A4A",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.8,
    lineHeight: 1.7,
    margin: "0 0 8px",
  };

  const backStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    width: "100%",
    minHeight: 58,
    padding: "13px 16px",
    marginBottom: 28,
    boxSizing: "border-box",
    background: "#FFFFFF",
    color: "#214D32",
    border: "1px solid rgba(33,77,50,.12)",
    borderRadius: 15,
    boxShadow: "0 6px 20px rgba(33,77,50,.035)",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.6,
  };

  const primaryButtonStyle: CSSProperties = {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    minHeight: 48,
    padding: "12px 18px",
    boxSizing: "border-box",
    borderRadius: 12,
    border: "none",
    background: "#2F6B45",
    color: "#FFFFFF",
    textDecoration: "none",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  };

  if (loading) {
    return <PajaraLoading />;
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
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 1160,
          margin: "0 auto",
          padding:
            "clamp(26px, 5vw, 48px) clamp(18px, 4vw, 28px) 34px",
          boxSizing: "border-box",
        }}
      >
        <Link href={backHref} style={backStyle}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 0,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "grid",
                placeItems: "center",
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "#F0F4EE",
                color: "#2F6B45",
                fontSize: 19,
                flexShrink: 0,
              }}
            >
              ←
            </span>
            <span>Kembali ke Pesanan</span>
          </span>

          <span
            aria-hidden="true"
            style={{
              color: "#8A6A4A",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            →
          </span>
        </Link>

        <header style={{ marginBottom: 28 }}>
          <p style={eyebrowStyle}>RUANG PROJECT PAJARA</p>

          <h1
            style={{
              margin: "0 0 12px",
              color: "#214D32",
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "clamp(32px, 6vw, 46px)",
              fontWeight: 600,
              lineHeight: 1.18,
              letterSpacing: "-.7px",
              overflowWrap: "break-word",
            }}
          >
            File Referensi{" "}
            <span style={{ color: "#8A6A4A" }}>Pesanan.</span>
          </h1>

          <p
            style={{
              maxWidth: 590,
              margin: 0,
              color: "#70766F",
              fontSize: 14,
              lineHeight: 1.9,
            }}
          >
            Semua file referensi yang kamu kirim menjadi bagian dari perjalanan
            kita dalam mewujudkan desain yang sesuai dengan kebutuhanmu.
          </p>
        </header>

        {error ? (
          <section style={cardStyle} aria-live="polite">
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: 48,
                height: 48,
                marginBottom: 18,
                borderRadius: 15,
                background: "#F9EFEB",
                color: "#A13B32",
                fontSize: 22,
              }}
            >
              !
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                color: "#214D32",
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 24,
              }}
            >
              Pesanan belum tersedia
            </h2>

            <p
              style={{
                margin: "0 0 20px",
                color: "#70766F",
                fontSize: 14,
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

              <Link href="/orders" style={secondaryButtonStyle}>
                Kembali ke Daftar Pesanan
              </Link>
            </div>
          </section>
        ) : order ? (
          <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
            <section style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 14,
                  flexWrap: "wrap",
                  paddingBottom: 22,
                  borderBottom: "1px solid #EEEAE3",
                  marginBottom: 24,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={eyebrowStyle}>KODE PESANAN</p>

                  <h2
                    style={{
                      margin: 0,
                      color: "#214D32",
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontSize: "clamp(21px, 4vw, 27px)",
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
                    gap: 7,
                    padding: "8px 13px",
                    borderRadius: 999,
                    background: "#EDF4EB",
                    color: "#2F6B45",
                    fontSize: 11,
                    lineHeight: 1.5,
                    fontWeight: 700,
                  }}
                >
                  <FileIcon size={15} />
                  File Referensi
                </span>
              </div>

              <p style={eyebrowStyle}>RINGKASAN PROJECT</p>

              <h2
                style={{
                  margin: "0 0 20px",
                  color: "#214D32",
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 24,
                  lineHeight: 1.4,
                }}
              >
                Informasi Desain
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
                  gap: 12,
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
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: 17,
                      minWidth: 0,
                      border: "1px solid #EEEAE3",
                      borderRadius: 14,
                      background: "#FCFBF8",
                      boxSizing: "border-box",
                    }}
                  >
                    <p style={eyebrowStyle}>{item.label}</p>

                    <p
                      style={{
                        margin: 0,
                        color: "#34443A",
                        fontSize: 14,
                        lineHeight: 1.8,
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

            <section style={cardStyle}>
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 58,
                  height: 58,
                  marginBottom: 20,
                  borderRadius: 18,
                  background: "#EDF4EB",
                  color: "#2F6B45",
                }}
              >
                <FileIcon size={27} />
              </div>

              <p style={eyebrowStyle}>DOKUMEN PROJECT</p>

              <h2
                style={{
                  margin: "0 0 12px",
                  color: "#214D32",
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 27,
                  lineHeight: 1.35,
                }}
              >
                File Referensi Pesanan
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#70766F",
                  fontSize: 14,
                  lineHeight: 1.9,
                }}
              >
                Halaman ini menampilkan informasi pesanan yang menjadi acuan
                untuk file referensi. File hasil desain final dapat kamu lihat
                melalui halaman File Final Anda setelah tersedia.
              </p>

              <div
                style={{
                  height: 1,
                  margin: "26px 0",
                  background: "#EEEAE3",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: 18,
                  border: "1px solid #EEEAE3",
                  borderRadius: 15,
                  background: "#FAF9F6",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "#EDF4EB",
                    color: "#2F6B45",
                  }}
                >
                  <FileIcon size={21} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      margin: "0 0 6px",
                      color: "#214D32",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    Referensi desain
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#70766F",
                      fontSize: 13,
                      lineHeight: 1.8,
                    }}
                  >
                    Informasi referensi pesanan tersimpan bersama detail
                    project. Untuk melihat file yang telah dikirim, buka
                    kembali detail pesananmu.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginTop: 22,
                }}
              >
                <Link href={backHref} style={primaryButtonStyle}>
                  ← Detail Pesanan
                </Link>

                <Link
                  href={`/orders/final?id=${encodeURIComponent(order.id)}`}
                  style={secondaryButtonStyle}
                >
                  Lihat File Final →
                </Link>
              </div>
            </section>
          </div>
        ) : null}

        <footer
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            borderTop: "1px solid #e4ddd1",
            paddingTop: 22,
            marginTop: 36,
          }}
        >
          <img
            src={LOGO}
            alt="Logo Pajara Studio"
            width={43}
            height={43}
            style={{
              display: "block",
              width: 43,
              height: 43,
              flexShrink: 0,
              objectFit: "contain",
              borderRadius: 10,
              background: "#fff",
            }}
          />

          <div>
            <strong
              style={{
                display: "block",
                color: "#214d32",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Pajara Studio
            </strong>

            <p
              style={{
                margin: "4px 0 0",
                color: "#8a6a4a",
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              Berakar di Tanah Pasundan.
            </p>

            <p
              style={{
                margin: "3px 0 0",
                color: "#999387",
                fontSize: 10,
                lineHeight: 1.5,
              }}
            >
              Desain yang punya arah.
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}

const secondaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
  minHeight: 48,
  padding: "12px 16px",
  boxSizing: "border-box",
  border: "1px solid rgba(33,77,50,.14)",
  borderRadius: 12,
  background: "#FFFFFF",
  color: "#214D32",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 700,
};

export default function FilesPage() {
  return (
    <Suspense
      fallback={
        <PajaraLoading message="Memuat halaman file referensi..." />
      }
    >
      <FilesContent />
    </Suspense>
  );
}
