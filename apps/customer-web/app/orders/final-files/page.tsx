
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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

        if (orderError) throw orderError;

        if (!orderData) {
          setError("Pesanan tidak ditemukan atau tidak dapat diakses.");
          return;
        }

        if (active) setOrder(orderData as Order);

        const { data: fileData, error: fileError } = await supabase
          .from("order_files")
          .select("id, file_name, file_path, file_type, file_size, created_at")
          .eq("order_id", orderData.id)
          .eq("file_category", "final")
          .order("created_at", { ascending: false });

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
      } catch {
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
    if (bytes == null || bytes < 0) return "Ukuran tidak tersedia";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e8e4dc",
    borderRadius: 20,
    padding: "clamp(18px, 4vw, 26px)",
    boxShadow: "0 12px 35px rgba(33,77,50,0.05)",
  } as const;

  const actionStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 13px",
    background: "#2f6b45",
    color: "#ffffff",
    borderRadius: 10,
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 700,
  } as const;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        color: "#26352a",
        padding: "32px 16px 56px",
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Link
          href={id ? `/orders?id=${encodeURIComponent(id)}` : "/orders"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            color: "#2f6b45",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 24,
            padding: "11px 15px",
            background: "#ffffff",
            border: "1px solid #e8e4dc",
            borderRadius: 12,
          }}
        >
          <span aria-hidden="true">←</span>
          Kembali ke Pesanan
        </Link>

        <header style={{ marginBottom: 24 }}>
          <p
            style={{
              color: "#8a6a4a",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.14em",
              margin: "0 0 10px",
            }}
          >
            HASIL DESAIN
          </p>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(28px, 6vw, 38px)",
              lineHeight: 1.2,
              margin: "0 0 10px",
              color: "#214d32",
            }}
          >
            File Final Anda
          </h1>
          <p style={{ color: "#718075", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            Semua file hasil desain yang sudah diunggah untuk pesanan Anda tersedia di halaman ini.
          </p>
        </header>

        {order && (
          <div
            style={{
              ...cardStyle,
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  color: "#718075",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  margin: "0 0 6px",
                }}
              >
                KODE PESANAN
              </p>
              <strong style={{ color: "#214d32", fontSize: 18 }}>
                {order.order_code}
              </strong>
            </div>
            <span
              style={{
                background: "#edf4eb",
                color: "#2f6b45",
                borderRadius: 999,
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              File Final
            </span>
          </div>
        )}

        {loading ? (
          <div style={cardStyle} aria-live="polite">
            <div
              style={{
                width: 34,
                height: 34,
                border: "3px solid #e4eadf",
                borderTopColor: "#2f6b45",
                borderRadius: "50%",
                animation: "pajaraFinalSpin 0.8s linear infinite",
                marginBottom: 16,
              }}
            />
            <p style={{ color: "#718075", margin: 0, fontSize: 14 }}>
              Memuat file final...
            </p>
            <style>{`@keyframes pajaraFinalSpin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={cardStyle}>
            <p style={{ color: "#a13b32", lineHeight: 1.7, marginTop: 0 }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                ...actionStyle,
                border: 0,
                cursor: "pointer",
              }}
            >
              Coba Lagi
            </button>
          </div>
        ) : files.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: "38px 22px" }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: "#edf4eb",
                color: "#2f6b45",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 18px",
              }}
            >
              <svg
                width="27"
                height="27"
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
            </div>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                color: "#214d32",
                fontSize: 23,
                margin: "0 0 10px",
              }}
            >
              Belum Ada File Final
            </h2>
            <p
              style={{
                color: "#718075",
                fontSize: 14,
                lineHeight: 1.8,
                maxWidth: 420,
                margin: "0 auto",
              }}
            >
              File hasil desain akan muncul di sini setelah diunggah oleh tim Pajara Studio.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
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
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "#edf4eb",
                        color: "#2f6b45",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <svg
                        width="23"
                        height="23"
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
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h2
                        style={{
                          color: "#214d32",
                          fontSize: 15,
                          lineHeight: 1.6,
                          margin: "0 0 5px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {file.file_name}
                      </h2>
                      <p
                        style={{
                          color: "#718075",
                          fontSize: 12,
                          lineHeight: 1.7,
                          margin: "0 0 14px",
                        }}
                      >
                        {formatSize(file.file_size)}
                        {" · "}
                        {new Date(file.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                        {file.url ? (
                          <>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              style={actionStyle}
                            >
                              Lihat File ↗
                            </a>
                            <a
                              href={file.url}
                              download={file.file_name}
                              style={{
                                ...actionStyle,
                                background: "#ffffff",
                                color: "#2f6b45",
                                border: "1px solid #dce6d9",
                              }}
                            >
                              Unduh ↓
                            </a>
                          </>
                        ) : (
                          <span style={{ color: "#a13b32", fontSize: 12 }}>
                            Tautan file tidak tersedia. Muat ulang halaman untuk mencoba lagi.
                          </span>
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
                      style={{ display: "block", marginTop: 18 }}
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
                          background: "#faf9f6",
                          border: "1px solid #eeeae3",
                          borderRadius: 14,
                        }}
                      />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <p
          style={{
            color: "#718075",
            fontSize: 12,
            lineHeight: 1.8,
            textAlign: "center",
            marginTop: 24,
          }}
        >
          Pajara Studio · Desain yang punya arah.
        </p>
      </div>
    </main>
  );
}

export default function FinalFilesPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#f7f4ee",
            color: "#718075",
            fontSize: 14,
          }}
        >
          Memuat halaman...
        </main>
      }
    >
      <FinalFilesContent />
    </Suspense>
  );
}
