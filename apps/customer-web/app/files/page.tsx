"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@pajara/supabase";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
};

type OrderFile = {
  id: string;
  order_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string | null;
};

type FinalFile = OrderFile & {
  order_code: string;
  service_name: string;
  signed_url: string;
};

function formatDate(value: string | null) {
  if (!value) return "Tanggal tidak tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatFileSize(value: number | null) {
  if (!value || value <= 0) return "Ukuran tidak diketahui";

  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileType(file: OrderFile) {
  const type = file.file_type?.toLowerCase() || "";
  const name = file.file_name.toLowerCase();

  if (
    type.includes("image") ||
    /\.(png|jpe?g|webp|gif|svg|avif)$/.test(name)
  ) {
    return "Gambar";
  }

  if (type.includes("pdf") || name.endsWith(".pdf")) {
    return "PDF";
  }

  if (type.includes("zip") || /\.(zip|rar|7z)$/.test(name)) {
    return "Arsip";
  }

  return "File desain";
}

export default function FilesPage() {
  const router = useRouter();

  const [files, setFiles] = useState<FinalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingFile, setOpeningFile] = useState("");

  const loadFiles = useCallback(async () => {
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

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, order_code, service_name")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        throw new Error(
          "Data pesanan gagal dimuat: " + ordersError.message
        );
      }

      const orders = (ordersData || []) as Order[];

      if (orders.length === 0) {
        setFiles([]);
        return;
      }

      const orderIds = orders.map((order) => order.id);

      const { data: filesData, error: filesError } = await supabase
        .from("order_files")
        .select(
          "id, order_id, file_name, file_path, file_type, file_size, created_at"
        )
        .in("order_id", orderIds)
        .eq("file_category", "final")
        .order("created_at", { ascending: false });

      if (filesError) {
        throw new Error(
          "Data file desain gagal dimuat: " + filesError.message
        );
      }

      const orderMap = new Map(
        orders.map((order) => [order.id, order])
      );

      const finalFiles = (filesData || []) as OrderFile[];

      const results = await Promise.all(
        finalFiles.map(async (file) => {
          const order = orderMap.get(file.order_id);

          if (!order) return null;

          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("pajara-files")
              .createSignedUrl(file.file_path, 60 * 60);

          if (signedError || !signedData?.signedUrl) {
            return null;
          }

          return {
            ...file,
            order_code: order.order_code,
            service_name:
              order.service_name || "Desain Pajara Studio",
            signed_url: signedData.signedUrl,
          };
        })
      );

      setFiles(
        results.filter(
          (file): file is FinalFile => file !== null
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat file."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  async function openFile(file: FinalFile) {
    setOpeningFile(file.id);

    try {
      const { data, error: signedError } = await supabase.storage
        .from("pajara-files")
        .createSignedUrl(file.file_path, 60 * 60);

      if (signedError || !data?.signedUrl) {
        throw new Error("File belum dapat dibuka. Coba lagi.");
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal membuka file desain."
      );
    } finally {
      setOpeningFile("");
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            style={styles.backButton}
          >
            <span aria-hidden="true" style={styles.backIcon}>
              ←
            </span>
            <span>Kembali ke Beranda</span>
          </button>

          <div style={styles.eyebrow}>PAJARA STUDIO</div>
          <h1 style={styles.title}>File Desain</h1>
          <p style={styles.subtitle}>
            Semua file final dari pesanan desainmu, tersimpan
            dalam satu tempat dan siap dibuka kapan saja.
          </p>
        </header>

        <section style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
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
              <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z" />
              <path d="M13 3v7h7M8 15h8M8 18h6" />
            </svg>
          </div>

          <div style={styles.summaryInfo}>
            <span style={styles.summaryLabel}>
              FILE DESAIN FINAL
            </span>
            <div style={styles.summaryNumber}>
              {loading ? "—" : files.length}
            </div>
            <p style={styles.summaryDescription}>
              {files.length === 1
                ? "1 file siap kamu buka."
                : `${files.length} file tersedia di akunmu.`}
            </p>
          </div>
        </section>

        {error && (
          <div style={styles.error}>
            <strong>Belum dapat memuat file</strong>
            <p style={styles.errorText}>{error}</p>
            <button
              onClick={() => void loadFiles()}
              style={styles.retryButton}
            >
              Coba Lagi
            </button>
          </div>
        )}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionEyebrow}>KOLEKSI DESAIN</div>
              <h2 style={styles.sectionTitle}>File Milikmu</h2>
            </div>

            <button
              onClick={() => void loadFiles()}
              disabled={loading}
              style={styles.refreshButton}
              aria-label="Muat ulang file"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 7v5h-5M4 17v-5h5" />
                <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div style={styles.loadingCard}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>Memuat file desain...</p>
            </div>
          ) : !error && files.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z" />
                  <path d="M13 3v7h7" />
                </svg>
              </div>

              <h3 style={styles.emptyTitle}>
                Belum ada file final
              </h3>
              <p style={styles.emptyDescription}>
                File desain final akan muncul di sini setelah
                Pajara Studio mengunggah hasil desain pesananmu.
              </p>

              <button
                onClick={() => router.push("/orders/list")}
                style={styles.primaryButton}
              >
                Lihat Pesanan →
              </button>
            </div>
          ) : (
            <div style={styles.fileList}>
              {files.map((file) => (
                <article key={file.id} style={styles.fileCard}>
                  <div style={styles.fileTop}>
                    <div style={styles.fileIcon}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z" />
                        <path d="M13 3v7h7M8 15h8M8 18h5" />
                      </svg>
                    </div>

                    <span style={styles.finalBadge}>Final</span>
                  </div>

                  <h3 style={styles.fileName}>{file.file_name}</h3>

                  <p style={styles.fileService}>
                    {file.service_name}
                  </p>

                  <div style={styles.fileMeta}>
                    <span>{getFileType(file)}</span>
                    <span style={styles.metaDot}>•</span>
                    <span>{formatFileSize(file.file_size)}</span>
                  </div>

                  <div style={styles.fileOrder}>
                    <span>Kode pesanan</span>
                    <strong>{file.order_code}</strong>
                  </div>

                  <div style={styles.fileDate}>
                    Diunggah {formatDate(file.created_at)}
                  </div>

                  <button
                    onClick={() => void openFile(file)}
                    disabled={openingFile === file.id}
                    style={{
                      ...styles.primaryButton,
                      opacity: openingFile === file.id ? 0.7 : 1,
                    }}
                  >
                    {openingFile === file.id
                      ? "Membuka file..."
                      : "Buka File →"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <div style={styles.notice}>
          <span style={styles.noticeIcon}>i</span>
          <p style={styles.noticeText}>
            Tautan file bersifat sementara untuk menjaga keamanan
            hasil desainmu. Jika tautan kedaluwarsa, buka kembali
            halaman ini dan tekan tombol Buka File.
          </p>
        </div>

        <footer style={styles.footer}>
          <div style={styles.footerMark}>
            <Image
              src="/755809946_17926162029385149_3739923509439876817_n.jpg"
              alt="Logo Pajara Studio"
              width={44}
              height={44}
              unoptimized
              style={styles.footerLogo}
            />
          </div>

          <div>
            <strong style={styles.footerTitle}>Pajara Studio</strong>
            <p style={styles.footerText}>
              Berakar di Tanah Pasundan.
            </p>
          </div>
        </footer>
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

        button:active:not(:disabled) {
          transform: scale(0.985);
        }

        button:disabled {
          cursor: not-allowed;
        }

        @media (hover: hover) {
          button:hover:not(:disabled) {
            opacity: 0.94;
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
    padding: "30px 18px 110px",
    color: "var(--text, #1d2a22)",
  },
  container: {
    maxWidth: "760px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "26px",
    animation: "fadeUp 350ms ease both",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "11px",
    padding: "10px 16px 10px 10px",
    marginBottom: "28px",
    color: "#214d32",
    border: "1px solid rgba(33,77,50,.10)",
    borderRadius: "16px",
    background: "#ffffff",
    boxShadow: "0 5px 18px rgba(33,77,50,.05)",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    boxSizing: "border-box",
    textAlign: "left",
  },
  backIcon: {
    display: "grid",
    width: "32px",
    height: "32px",
    flexShrink: 0,
    placeItems: "center",
    borderRadius: "11px",
    background: "#edf4ee",
    color: "#2f6b45",
    fontSize: "19px",
    lineHeight: 1,
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.18em",
    color: "var(--brown, #8a6a4a)",
    marginBottom: "8px",
  },
  title: {
    fontFamily: "Georgia, serif",
    fontSize: "clamp(30px, 7vw, 42px)",
    lineHeight: 1.15,
    letterSpacing: "-0.04em",
    color: "var(--green-dark, #214d32)",
    margin: "0 0 10px",
  },
  subtitle: {
    fontSize: "14px",
    lineHeight: 1.8,
    color: "#73766f",
    margin: 0,
    maxWidth: "440px",
  },
  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "17px",
    padding: "24px",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg, #214d32 0%, #2f6b45 72%, #467a56 100%)",
    color: "#fff",
    boxShadow: "0 12px 28px rgba(33,77,50,.12)",
    marginBottom: "34px",
    animation: "fadeUp 450ms ease both",
  },
  summaryIcon: {
    width: "54px",
    height: "54px",
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: "17px",
    background: "rgba(255,255,255,.13)",
  },
  summaryInfo: {
    minWidth: 0,
  },
  summaryLabel: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,.76)",
  },
  summaryNumber: {
    fontFamily: "Georgia, serif",
    fontSize: "32px",
    fontWeight: 700,
    lineHeight: 1.25,
    marginTop: "5px",
  },
  summaryDescription: {
    color: "rgba(255,255,255,.8)",
    fontSize: "12px",
    lineHeight: 1.6,
    margin: "4px 0 0",
  },
  section: {
    marginBottom: "30px",
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
  refreshButton: {
    width: "40px",
    height: "40px",
    display: "grid",
    placeItems: "center",
    border: "1px solid #e4ddd1",
    borderRadius: "12px",
    background: "#fff",
    color: "var(--green, #2f6b45)",
    cursor: "pointer",
  },
  fileList: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: "15px",
  },
  fileCard: {
    minWidth: 0,
    padding: "21px",
    borderRadius: "19px",
    background: "#fff",
    border: "1px solid #e8e2d8",
    boxShadow: "0 4px 14px rgba(33,77,50,.035)",
    animation: "fadeUp 350ms ease both",
  },
  fileTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "17px",
  },
  fileIcon: {
    width: "46px",
    height: "46px",
    display: "grid",
    placeItems: "center",
    borderRadius: "15px",
    background: "#edf3ec",
    color: "var(--green, #2f6b45)",
  },
  finalBadge: {
    padding: "7px 11px",
    borderRadius: "20px",
    background: "#edf3ec",
    color: "#2f6b45",
    fontSize: "10px",
    fontWeight: 800,
  },
  fileName: {
    fontSize: "15px",
    lineHeight: 1.55,
    overflowWrap: "anywhere",
    color: "var(--green-dark, #214d32)",
    margin: "0 0 7px",
  },
  fileService: {
    fontSize: "12px",
    color: "#777970",
    lineHeight: 1.6,
    margin: "0 0 12px",
  },
  fileMeta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "7px",
    color: "#777970",
    fontSize: "11px",
    marginBottom: "17px",
  },
  metaDot: {
    color: "#b4afa5",
  },
  fileOrder: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    borderTop: "1px solid #eee9e0",
    paddingTop: "14px",
    fontSize: "11px",
    color: "#85847b",
  },
  fileDate: {
    color: "#85847b",
    fontSize: "11px",
    marginTop: "10px",
    marginBottom: "17px",
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
  },
  emptyCard: {
    padding: "35px 23px",
    borderRadius: "20px",
    background: "#fff",
    border: "1px solid #e8e2d8",
    textAlign: "center",
  },
  emptyIcon: {
    width: "66px",
    height: "66px",
    display: "grid",
    placeItems: "center",
    borderRadius: "20px",
    background: "#edf3ec",
    color: "var(--green, #2f6b45)",
    margin: "0 auto 18px",
  },
  emptyTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "20px",
    color: "var(--green-dark, #214d32)",
    margin: "0 0 10px",
  },
  emptyDescription: {
    maxWidth: "350px",
    margin: "0 auto 22px",
    color: "#777970",
    fontSize: "13px",
    lineHeight: 1.8,
  },
  loadingCard: {
    padding: "55px 20px",
    textAlign: "center",
    borderRadius: "18px",
    background: "#fff",
    border: "1px solid #e8e2d8",
  },
  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #dce5da",
    borderTopColor: "var(--green, #2f6b45)",
    borderRadius: "50%",
    margin: "0 auto 13px",
    animation: "spin 800ms linear infinite",
  },
  loadingText: {
    color: "#777970",
    fontSize: "13px",
    margin: 0,
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
    overflowWrap: "anywhere",
  },
  errorText: {
    margin: "6px 0 0",
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
  notice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    padding: "16px",
    borderRadius: "15px",
    background: "#eeeae1",
    marginBottom: "38px",
  },
  noticeIcon: {
    width: "21px",
    height: "21px",
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: "#ded7c8",
    color: "#655b49",
    fontSize: "12px",
    fontWeight: 800,
  },
  noticeText: {
    margin: 0,
    color: "#716e64",
    fontSize: "11px",
    lineHeight: 1.8,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderTop: "1px solid #e4ddd1",
    paddingTop: "22px",
    marginTop: "38px",
  },
  footerMark: {
    width: "44px",
    height: "44px",
    flexShrink: 0,
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    borderRadius: "10px",
    background: "#fff",
  },
  footerLogo: {
    width: "44px",
    height: "44px",
    objectFit: "contain",
    borderRadius: "10px",
  },
  footerTitle: {
    color: "var(--green-dark, #214d32)",
    fontSize: "13px",
  },
  footerText: {
    margin: "3px 0 0",
    color: "#85847b",
    fontSize: "11px",
  },
};
