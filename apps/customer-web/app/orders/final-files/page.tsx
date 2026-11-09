
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
};

type OrderFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  signed_url: string;
};

const LOGO =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

function formatFileSize(size: number | null) {
  if (!size || size <= 0) return "Ukuran tidak diketahui";

  if (size < 1024) return `${size} B`;

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "Tanggal tidak diketahui";

  return value.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isImage(file: OrderFile) {
  return (
    file.file_type?.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.file_name)
  );
}

function getFileType(file: OrderFile) {
  if (file.file_type?.includes("pdf") || /\.pdf$/i.test(file.file_name)) {
    return "PDF";
  }

  if (isImage(file)) return "GAMBAR";

  if (/\.(zip|rar|7z)$/i.test(file.file_name)) return "ARSIP";

  return "DOKUMEN";
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
};

function FinalFilesNavbar({ orderId = "" }: { orderId?: string }) {
  const backHref = orderId
    ? `/orders?id=${encodeURIComponent(orderId)}`
    : "/orders";

  return (
    <nav style={navbarStyle}>
      <div className="final-navbar-inner" style={navbarInnerStyle}>
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

function FinalFilesContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFinalFiles() {
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

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("id, order_code")
          .eq("id", id)
          .eq("customer_id", user.id)
          .maybeSingle();

        if (!active) return;

        if (orderError) {
          console.error("Gagal mengambil pesanan:", orderError);
          setError("Informasi pesanan gagal dimuat. Silakan coba lagi.");
          return;
        }

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

        if (fileError) {
          console.error("Gagal mengambil file final:", fileError);
          setError("File final belum dapat dimuat. Silakan coba lagi.");
          return;
        }

        const filesWithUrls: OrderFile[] = [];

        for (const file of fileData || []) {
          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("pajara-files")
              .createSignedUrl(file.file_path, 3600);

          if (!active) return;

          if (signedError || !signedData?.signedUrl) {
            console.error(
              "Gagal membuat akses file:",
              file.file_name,
              signedError
            );
            continue;
          }

          filesWithUrls.push({
            ...file,
            signed_url: signedData.signedUrl,
          });
        }

        if (!active) return;

        setFiles(filesWithUrls);
      } catch (err) {
        console.error("Kesalahan memuat file final:", err);

        if (active) {
          setError("File final gagal dimuat. Silakan coba lagi.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFinalFiles();

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

  const primaryButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    padding: "11px 16px",
    boxSizing: "border-box",
    borderRadius: 11,
    border: "none",
    background: "#214D32",
    color: "#FFFFFF",
    textDecoration: "none",
    fontFamily: "Arial, sans-serif",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };

  if (loading) {
    return (
      <CustomerLoading
        title="Menyiapkan File Final"
        description="Sebentar, kami sedang menyiapkan file desain final pesanan Kang/Teh."
      />
    );
  }

  return (
    <main className="final-page">
      <FinalFilesNavbar orderId={id || ""} />

      <div className="final-container">
        <header className="final-header">
          <p style={eyebrowStyle}>RUANG PROJECT PAJARA</p>

          <h1 className="final-page-title">
            File <span>Final.</span>
          </h1>

          <p className="final-description">
            Semua hasil akhir desain pesanan Anda tersimpan di satu tempat
            dan dapat diakses kapan saja.
          </p>
        </header>

        {error ? (
          <section style={cardStyle} aria-live="polite">
            <div className="final-error-icon">!</div>

            <h2 className="final-section-title">
              File belum tersedia
            </h2>

            <p className="final-message">{error}</p>

            <div className="final-actions">
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={primaryButtonStyle}
              >
                Coba Lagi
              </button>

              <Link href={backHref} className="final-secondary-button">
                Kembali ke Pesanan
              </Link>
            </div>
          </section>
        ) : order ? (
          <>
            <section style={cardStyle}>
              <div className="final-order-heading">
                <div style={{ minWidth: 0 }}>
                  <p style={eyebrowStyle}>KODE PESANAN</p>

                  <h2 className="final-order-code">
                    #{order.order_code}
                  </h2>
                </div>

                <span className="final-count">
                  {files.length} File
                </span>
              </div>

              <p style={eyebrowStyle}>HASIL PROJECT</p>

              <h2 className="final-section-title">
                File Desain Final
              </h2>

              <p className="final-message">
                Berikut adalah file hasil akhir desain yang telah
                disediakan oleh tim Pajara Studio.
              </p>

              {files.length === 0 ? (
                <div className="final-empty">
                  <div className="final-empty-icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="30"
                      height="30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6M8 13h8M8 17h5" />
                    </svg>
                  </div>

                  <h3>Belum Ada File Final</h3>

                  <p>
                    File desain final pesanan Anda belum diunggah. Setelah
                    tim Pajara Studio mengunggah hasil desain, file akan
                    otomatis muncul di halaman ini.
                  </p>
                </div>
              ) : (
                <div className="final-file-list">
                  {files.map((file) => (
                    <article key={file.id} className="final-file-card">
                      {isImage(file) ? (
                        <a
                          href={file.signed_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="final-preview"
                          aria-label={`Lihat preview ${file.file_name}`}
                        >
                          <img
                            src={file.signed_url}
                            alt={file.file_name}
                            loading="lazy"
                          />
                        </a>
                      ) : (
                        <div className="final-file-icon">
                          <svg
                            viewBox="0 0 24 24"
                            width="28"
                            height="28"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6" />
                            <path d="M8 13h8M8 17h8" />
                          </svg>

                          <span>{getFileType(file)}</span>
                        </div>
                      )}

                      <div className="final-file-information">
                        <h3 title={file.file_name}>
                          {file.file_name}
                        </h3>

                        <p>
                          {formatFileSize(file.file_size)}
                          <span>•</span>
                          {formatDate(file.created_at)}
                        </p>

                        <div className="final-file-actions">
                          <a
                            href={file.signed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="final-view-button"
                          >
                            Lihat File ↗
                          </a>

                          <a
                            href={file.signed_url}
                            download={file.file_name}
                            className="final-download-button"
                          >
                            Unduh ↓
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="final-information-note">
              <strong>Informasi File</strong>
              <p>
                Tautan akses file berlaku selama 1 jam. Jika tautan sudah
                kedaluwarsa, muat ulang halaman ini untuk mendapatkan
                tautan akses baru.
              </p>
            </div>
          </>
        ) : null}

        <footer className="final-footer">
          <div className="final-footer-brand">
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

          <p className="final-footer-copyright">
            © 2026 Pajara Studio. Desain yang punya arah.
          </p>
        </footer>
      </div>

      <style jsx>{`
        .final-page {
          min-height: 100vh;
          width: 100%;
          overflow-x: clip;
          box-sizing: border-box;
          background: #f7f4ee;
          color: #26352a;
          font-family: Arial, sans-serif;
        }

        .final-container {
          width: min(850px, calc(100% - 40px));
          margin: 0 auto;
          padding: 42px 0 34px;
          box-sizing: border-box;
        }

        .final-header {
          margin-bottom: 30px;
        }

        .final-page-title {
          margin: 0 0 12px;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 42px;
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.8px;
        }

        .final-page-title span {
          color: #8a6a4a;
        }

        .final-description {
          max-width: 590px;
          margin: 0;
          color: #70766f;
          font-size: 13px;
          line-height: 1.9;
        }

        .final-order-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          flex-wrap: wrap;
          padding-bottom: 22px;
          border-bottom: 1px solid #eeeae3;
          margin-bottom: 24px;
        }

        .final-order-code {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 26px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .final-count {
          display: inline-flex;
          align-items: center;
          padding: 8px 13px;
          border-radius: 999px;
          background: #edf4eb;
          color: #2f6b45;
          font-size: 11px;
          font-weight: 700;
        }

        .final-section-title {
          margin: 0 0 12px;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 25px;
          font-weight: 600;
          line-height: 1.4;
        }

        .final-message {
          margin: 0;
          color: #70766f;
          font-size: 13px;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .final-file-list {
          display: grid;
          gap: 14px;
          margin-top: 24px;
        }

        .final-file-card {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
          padding: 15px;
          border: 1px solid #eeeae3;
          border-radius: 15px;
          background: #fcfbf8;
          box-sizing: border-box;
        }

        .final-preview {
          display: block;
          width: 104px;
          height: 104px;
          flex: 0 0 104px;
          overflow: hidden;
          border: 1px solid #eeeae3;
          border-radius: 12px;
          background: #f1eee8;
        }

        .final-preview img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .final-file-icon {
          display: flex;
          width: 104px;
          height: 104px;
          flex: 0 0 104px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #eeeae3;
          border-radius: 12px;
          background: #f1f5f0;
          color: #2f6b45;
        }

        .final-file-icon span {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .final-file-information {
          flex: 1;
          min-width: 0;
        }

        .final-file-information h3 {
          margin: 0;
          color: #214d32;
          font-family: Arial, sans-serif;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .final-file-information > p {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
          margin: 6px 0 13px;
          color: #8a8e86;
          font-size: 10px;
          line-height: 1.6;
        }

        .final-file-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .final-view-button,
        .final-download-button {
          display: inline-flex;
          min-height: 35px;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 700;
          text-decoration: none;
          transition: background .2s ease;
        }

        .final-view-button {
          background: #214d32;
          color: #ffffff;
        }

        .final-view-button:hover {
          background: #2f6b45;
        }

        .final-download-button {
          border: 1px solid rgba(33,77,50,.15);
          background: #ffffff;
          color: #214d32;
        }

        .final-download-button:hover {
          background: #edf4eb;
        }

        .final-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 38px 20px;
          margin-top: 24px;
          border: 1px dashed rgba(33,77,50,.19);
          border-radius: 16px;
          background: #fcfbf8;
          text-align: center;
        }

        .final-empty-icon {
          display: grid;
          width: 58px;
          height: 58px;
          place-items: center;
          margin-bottom: 16px;
          border-radius: 17px;
          background: #edf4eb;
          color: #2f6b45;
        }

        .final-empty h3 {
          margin: 0 0 9px;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          font-weight: 600;
        }

        .final-empty p {
          max-width: 390px;
          margin: 0;
          color: #70766f;
          font-size: 12px;
          line-height: 1.9;
        }

        .final-information-note {
          margin-top: 18px;
          padding: 17px 19px;
          border: 1px solid rgba(138,106,74,.13);
          border-radius: 14px;
          background: rgba(255,255,255,.55);
        }

        .final-information-note strong {
          color: #8a6a4a;
          font-size: 11px;
          font-weight: 800;
        }

        .final-information-note p {
          margin: 6px 0 0;
          color: #70766f;
          font-size: 11px;
          line-height: 1.8;
        }

        .final-error-icon {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          margin-bottom: 18px;
          border-radius: 14px;
          background: #f9efeb;
          color: #a13b32;
          font-size: 21px;
          font-weight: 700;
        }

        .final-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }

        .final-secondary-button {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          padding: 11px 16px;
          border: 1px solid rgba(33,77,50,.14);
          border-radius: 11px;
          background: #ffffff;
          color: #214d32;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
        }

        .final-footer {
          border-top: 1px solid #e4ddd1;
          padding-top: 22px;
          margin-top: 36px;
        }

        .final-footer-brand {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .final-footer-brand strong {
          display: block;
          color: #214d32;
          font-size: 13px;
          line-height: 1.5;
        }

        .final-footer-brand p {
          margin: 4px 0 0;
          color: #8a6a4a;
          font-size: 11px;
          line-height: 1.5;
        }

        .final-footer-copyright {
          margin: 20px 0 0;
          padding-top: 14px;
          border-top: 1px solid #e9e3d9;
          color: #999387;
          font-size: 10px;
          line-height: 1.7;
        }

        @media (max-width: 600px) {
          .final-container {
            width: calc(100% - 28px);
            padding-top: 30px;
          }

          .final-page-title {
            font-size: 35px;
          }

          .final-description {
            font-size: 12px;
          }

          .final-order-code {
            font-size: 23px;
          }

          .final-section-title {
            font-size: 23px;
          }

          .final-file-card {
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
          }

          .final-preview,
          .final-file-icon {
            width: 82px;
            height: 82px;
            flex-basis: 82px;
          }

          .final-file-information h3 {
            font-size: 12px;
          }

          .final-file-information > p {
            font-size: 9px;
          }
        }

        @media (max-width: 420px) {
          .final-navbar-inner {
            gap: 8px !important;
          }

          .final-navbar-inner a:first-child {
            gap: 8px !important;
          }

          .final-navbar-inner a:first-child img {
            width: 38px !important;
            height: 38px !important;
          }

          .final-navbar-inner a:first-child span {
            font-size: 15px !important;
          }

          .final-navbar-inner a:last-child {
            padding: 9px 10px !important;
            font-size: 10px !important;
          }
        }

        @media (max-width: 360px) {
          .final-navbar-inner a:first-child img {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
          }

          .final-navbar-inner a:first-child span {
            font-size: 13px !important;
          }

          .final-navbar-inner a:last-child {
            gap: 5px !important;
            padding: 8px !important;
            font-size: 9px !important;
          }

          .final-page-title {
            font-size: 32px;
          }

          .final-file-card {
            flex-direction: column;
          }

          .final-preview,
          .final-file-icon {
            width: 100%;
            height: 150px;
            flex-basis: auto;
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

function FinalFilesFallback() {
  return (
    <CustomerLoading
      title="Menyiapkan File Final"
      description="Sebentar, kami sedang menyiapkan file desain final pesanan Kang/Teh."
    />
  );
}

export default function FinalFilesPage() {
  return (
    <Suspense fallback={<FinalFilesFallback />}>
      <FinalFilesContent />
    </Suspense>
  );
}
