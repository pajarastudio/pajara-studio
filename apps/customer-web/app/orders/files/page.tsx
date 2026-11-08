"use client";

import { Suspense, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@pajara/supabase";

type Order = {
  id: string;
  order_code: string;
};

type FinalFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  url: string;
};

const LOGO =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

/* =========================
   NAVBAR
========================= */

const navbarStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  width: "100%",
  borderBottom: "1px solid rgba(47,107,69,.10)",
  background: "rgba(247,244,238,.88)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

const navbarInnerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 796,
  minHeight: 66,
  padding: "0 18px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  boxSizing: "border-box",
};

const navbarBrandStyle: CSSProperties = {
  display: "inline-flex",
  minWidth: 0,
  alignItems: "center",
  gap: 10,
  color: "#214d32",
  fontSize: 15,
  fontWeight: 800,
  textDecoration: "none",
};

const navbarLogoStyle: CSSProperties = {
  display: "block",
  width: 39,
  height: 39,
  minWidth: 39,
  borderRadius: 12,
  objectFit: "cover",
};

const navbarBackStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  flexShrink: 0,
  padding: "10px 13px",
  border: "1px solid rgba(47,107,69,.16)",
  borderRadius: 10,
  background: "rgba(255,255,255,.72)",
  color: "#214d32",
  fontSize: 11,
  fontWeight: 800,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

function FinalFilesNavbar({ orderId = "" }: { orderId?: string }) {
  const backHref = orderId
    ? `/orders?id=${encodeURIComponent(orderId)}`
    : "/orders";

  return (
    <nav style={navbarStyle}>
      <div style={navbarInnerStyle} className="final-navbar-inner">
        <Link href="/dashboard" style={navbarBrandStyle}>
          <Image
            src={LOGO}
            alt="Logo Pajara Studio"
            width={39}
            height={39}
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
  message = "Menyiapkan file final Anda...",
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
        <Image
          src={LOGO}
          alt="Pajara Studio"
          width={66}
          height={66}
          priority
          unoptimized
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
            animation: "pajara-files-spin .8s linear infinite",
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
        @keyframes pajara-files-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

/* =========================
   FILE ICON
========================= */

function FileIcon({ size = 23 }: { size?: number }) {
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

/* =========================
   MAIN CONTENT
========================= */

function FinalFilesContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [files, setFiles] = useState<FinalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFiles() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (authError || !user) {
          window.location.href = "/login";
          return;
        }

        if (!id) {
          setError("ID pesanan tidak ditemukan.");
          return;
        }

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("id, order_code")
          .eq("id", id)
          .eq("customer_id", user.id)
          .maybeSingle();

        if (!active) return;

        if (orderError) throw orderError;

        if (!orderData) {
          setError("Pesanan tidak ditemukan atau tidak dapat diakses.");
          return;
        }

        setOrder(orderData as Order);

        const { data: fileData, error: fileError } = await supabase
          .from("order_files")
          .select(
            "id, file_name, file_path, file_type, file_size, created_at"
          )
          .eq("order_id", orderData.id)
          .eq("file_category", "final")
          .order("created_at", { ascending: false });

        if (!active) return;
        if (fileError) throw fileError;

        const signedFiles = await Promise.all(
          (fileData || []).map(async (file) => {
            const { data: signedData, error: signedError } =
              await supabase.storage
                .from("pajara-files")
                .createSignedUrl(file.file_path, 3600);

            return {
              ...file,
              url: signedError ? "" : signedData?.signedUrl || "",
            } as FinalFile;
          })
        );

        if (active) setFiles(signedFiles);
      } catch (err) {
        console.error("Gagal memuat file final:", err);

        if (active) {
          setError("File final gagal dimuat. Silakan coba lagi.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFiles();

    return () => {
      active = false;
    };
  }, [id]);

  function formatSize(bytes: number | null) {
    if (bytes == null || bytes < 0) {
      return "Ukuran tidak tersedia";
    }

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Tanggal tidak tersedia";
    }

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

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
    >
      <FinalFilesNavbar orderId={id || ""} />

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
            File Final <span style={{ color: "#8A6A4A" }}>Anda.</span>
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
            Semua hasil desain final tersimpan di satu tempat, sehingga
            perjalanan kita dalam menyelesaikan project tetap terarah.
          </p>
        </header>

        {order && (
          <section
            style={{
              ...cardStyle,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
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
                background: "#EDF4EB",
                color: "#2F6B45",
                borderRadius: 999,
                padding: "8px 13px",
                fontSize: 11,
                lineHeight: 1.5,
                fontWeight: 700,
              }}
            >
              <FileIcon size={15} />
              File Final
            </span>
          </section>
        )}

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
              File belum tersedia
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

            <button
              onClick={() => window.location.reload()}
              style={primaryButtonStyle}
            >
              Coba Lagi
            </button>
          </section>
        ) : files.length === 0 ? (
          <section
            style={{
              ...cardStyle,
              textAlign: "center",
              padding: "clamp(30px, 7vw, 46px) 22px",
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: "#EDF4EB",
                color: "#2F6B45",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 20px",
              }}
            >
              <FileIcon size={27} />
            </div>

            <p style={eyebrowStyle}>HASIL DESAIN</p>

            <h2
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: "#214D32",
                fontSize: 25,
                lineHeight: 1.35,
                margin: "0 0 12px",
              }}
            >
              Belum Ada File Final
            </h2>

            <p
              style={{
                color: "#70766F",
                fontSize: 14,
                lineHeight: 1.9,
                maxWidth: 440,
                margin: "0 auto",
              }}
            >
              File hasil desain akan muncul di sini setelah diunggah oleh tim
              Pajara Studio. Silakan periksa kembali halaman ini nanti.
            </p>
          </section>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ marginBottom: 2 }}>
              <p style={eyebrowStyle}>DOKUMEN PROJECT</p>

              <h2
                style={{
                  margin: 0,
                  color: "#214D32",
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 24,
                  lineHeight: 1.4,
                }}
              >
                Hasil Desain
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#70766F",
                  fontSize: 13,
                  lineHeight: 1.8,
                }}
              >
                {files.length} file tersedia untuk pesanan ini.
              </p>
            </div>

            {files.map((file) => {
              const isImage =
                /\.(png|jpe?g|webp|gif|svg)$/i.test(file.file_name) ||
                (file.file_type || "").startsWith("image/");

              return (
                <article key={file.id} style={cardStyle}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "#EDF4EB",
                        color: "#2F6B45",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <FileIcon />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3
                        style={{
                          color: "#214D32",
                          fontSize: 15,
                          lineHeight: 1.7,
                          fontWeight: 700,
                          margin: "0 0 6px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {file.file_name}
                      </h3>

                      <p
                        style={{
                          color: "#70766F",
                          fontSize: 12,
                          lineHeight: 1.8,
                          margin: "0 0 16px",
                        }}
                      >
                        {formatSize(file.file_size)}
                        {" · "}
                        {formatDate(file.created_at)}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 9,
                        }}
                      >
                        {file.url ? (
                          <>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              style={primaryButtonStyle}
                            >
                              <FileIcon size={16} />
                              Lihat File
                            </a>

                            <a
                              href={file.url}
                              download={file.file_name}
                              style={{
                                ...primaryButtonStyle,
                                background: "#FFFFFF",
                                color: "#214D32",
                                border: "1px solid rgba(33,77,50,.16)",
                              }}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <path d="m7 10 5 5 5-5M12 15V3" />
                              </svg>
                              Unduh File
                            </a>
                          </>
                        ) : (
                          <p
                            style={{
                              color: "#A13B32",
                              fontSize: 12,
                              lineHeight: 1.8,
                              margin: 0,
                            }}
                          >
                            Tautan file tidak tersedia. Silakan muat ulang
                            halaman untuk mencoba lagi.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {isImage && file.url && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Lihat pratinjau ${file.file_name}`}
                      style={{
                        display: "block",
                        marginTop: 20,
                        overflow: "hidden",
                        border: "1px solid #EEEAE3",
                        borderRadius: 15,
                        background: "#FAF9F6",
                      }}
                    >
                      <img
                        src={file.url}
                        alt={file.file_name}
                        loading="lazy"
                        style={{
                          display: "block",
                          width: "100%",
                          maxHeight: 440,
                          objectFit: "contain",
                        }}
                      />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* FOOTER */}

        <footer
          style={{
            borderTop: "1px solid #e4ddd1",
            paddingTop: 22,
            marginTop: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
            }}
          >
            <Image
              src={LOGO}
              alt="Logo Pajara Studio"
              width={43}
              height={43}
              unoptimized
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
            </div>
          </div>

          <p
            style={{
              margin: "20px 0 0",
              paddingTop: 14,
              borderTop: "1px solid #e9e3d9",
              color: "#999387",
              fontSize: 10,
              lineHeight: 1.7,
            }}
          >
            © 2026 Pajara Studio. Desain yang punya arah.
          </p>
        </footer>
      </section>

      <style>{`
        @media (max-width: 420px) {
          .final-navbar-inner {
            gap: 8px !important;
            padding: 0 13px !important;
          }

          .final-navbar-inner a:first-child {
            gap: 8px !important;
            font-size: 13px !important;
          }

          .final-navbar-inner a:last-child {
            padding: 9px 10px !important;
            font-size: 10px !important;
          }
        }
      `}</style>
    </main>
  );
}

export default function FinalFilesPage() {
  return (
    <Suspense
      fallback={
        <PajaraLoading message="Memuat halaman file final..." />
      }
    >
      <FinalFilesContent />
    </Suspense>
  );
}
