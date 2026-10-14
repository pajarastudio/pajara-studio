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

type FinalFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  url: string | null;
};

type AccessType = "brief" | "files" | null;

function formatFileSize(size: number | null) {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

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
        padding: "24px",
        background: "#F7F4EE",
        fontFamily: '"DM Sans", sans-serif',
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes pajara-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pajara-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .65; }
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "340px",
          padding: "38px 24px",
          boxSizing: "border-box",
          textAlign: "center",
          border: "1px solid rgba(33,77,50,.12)",
          borderRadius: "24px",
          background: "rgba(255,255,255,.85)",
          boxShadow: "0 20px 55px rgba(33,77,50,.07)",
        }}
      >
        <img
          src="/755809946_17926162029385149_3739923509439876817_n.jpg"
          alt="Pajara Studio"
          style={{
            width: "66px",
            height: "66px",
            objectFit: "contain",
            borderRadius: "16px",
            marginBottom: "18px",
            animation: "pajara-pulse 1.8s ease-in-out infinite",
          }}
        />

        <p
          style={{
            margin: 0,
            color: "#214D32",
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "25px",
          }}
        >
          Pajara Studio
        </p>

        <p
          style={{
            margin: "10px 0 24px",
            color: "#70766F",
            fontSize: "13px",
            lineHeight: 1.8,
          }}
        >
          Menyiapkan detail pesananmu...
        </p>

        <div
          role="status"
          aria-label="Memuat"
          style={{
            width: "30px",
            height: "30px",
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
            fontSize: "10px",
            letterSpacing: "2px",
            fontWeight: 700,
          }}
        >
          DESAIN YANG PUNYA ARAH
        </p>
      </div>
    </main>
  );
}

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [finalFiles, setFinalFiles] = useState<FinalFile[]>([]);
  const [isSubscriptionOrder, setIsSubscriptionOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState("");
  const [fileMessage, setFileMessage] = useState("");
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null
  );
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [activeAccess, setActiveAccess] = useState<AccessType>(null);

  useEffect(() => {
    let mounted = true;

    const loadFinalFiles = async (orderId: string) => {
      if (!mounted) return;

      setLoadingFiles(true);
      setFileMessage("");
      setDownloadError(null);

      const { data, error: filesError } = await supabase
        .from("order_files")
        .select(
          `
            id,
            file_name,
            file_path,
            file_type,
            file_size,
            created_at
          `
        )
        .eq("order_id", orderId)
        .eq("file_category", "final")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (filesError) {
        console.error("Gagal mengambil order_files:", filesError);
        setFinalFiles([]);
        setFileMessage("File final belum dapat dimuat. Silakan coba lagi.");
        setLoadingFiles(false);
        return;
      }

      if (!data || data.length === 0) {
        setFinalFiles([]);
        setFileMessage("Belum ada file final dari Pajara Studio.");
        setLoadingFiles(false);
        return;
      }

      const filesWithUrls: FinalFile[] = [];

      for (const file of data) {
        const { data: signedData, error: signedError } =
          await supabase.storage
            .from("pajara-files")
            .createSignedUrl(file.file_path, 60 * 60);

        if (!mounted) return;

        if (signedError || !signedData?.signedUrl) {
          console.error(
            "Gagal membuat signed URL:",
            file.file_path,
            signedError
          );
          filesWithUrls.push({ ...file, url: null });
          continue;
        }

        filesWithUrls.push({ ...file, url: signedData.signedUrl });
      }

      if (!mounted) return;

      setFinalFiles(filesWithUrls);

      const accessibleFiles = filesWithUrls.filter((file) => !!file.url);

      if (accessibleFiles.length === 0) {
        setFileMessage(
          "File final tersedia, tetapi belum dapat dibuka. Silakan coba lagi."
        );
      } else if (accessibleFiles.length < filesWithUrls.length) {
        setFileMessage(
          `${accessibleFiles.length} file final dapat dibuka. Beberapa file lainnya belum dapat diakses.`
        );
      }

      setLoadingFiles(false);
    };

    const loadOrder = async () => {
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

      const {
        data: subscriptionRequest,
        error: subscriptionRequestError,
      } = await supabase
        .from("subscription_requests")
        .select("id")
        .eq("order_id", data.id)
        .maybeSingle();

      if (!mounted) return;

      if (subscriptionRequestError) {
        console.error(
          "Gagal memeriksa jenis pesanan:",
          subscriptionRequestError
        );
        setError(
          "Jenis pesanan belum dapat diverifikasi. Silakan muat ulang halaman."
        );
        setLoading(false);
        return;
      }

      setIsSubscriptionOrder(!!subscriptionRequest);
      setOrder(data as Order);
      setLoading(false);

      await loadFinalFiles(data.id);
    };

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleDownload = async (file: FinalFile) => {
    if (!file.url) {
      setDownloadError("Link download file belum tersedia.");
      return;
    }

    try {
      setDownloadingFileId(file.id);
      setDownloadError(null);

      const response = await fetch(file.url);

      if (!response.ok) {
        throw new Error(`Gagal mengambil file. Status ${response.status}.`);
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error("File yang diterima kosong.");
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = file.file_name;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (downloadErr) {
      console.error("Gagal download file:", downloadErr);
      setDownloadError("File gagal didownload. Silakan coba lagi.");
    } finally {
      setDownloadingFileId(null);
    }
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
          padding: "24px",
          background: "#F7F4EE",
          fontFamily: '"DM Sans", sans-serif',
          boxSizing: "border-box",
        }}
      >
        <div
          className="pajara-order-detail-card"
          style={{
            width: "100%",
            maxWidth: "460px",
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
              fontSize: "14px",
              lineHeight: 1.8,
            }}
          >
            {error || "Pesanan tidak tersedia."}
          </p>
          <a
            href="/dashboard"
            className="pajara-button pajara-button-primary"
            style={{ marginTop: "16px" }}
          >
            Kembali ke Dashboard
          </a>
        </div>
      </main>
    );
  }

  const accessButtonStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "50px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    padding: "14px 16px",
    border: "1px solid var(--line)",
    borderRadius: "12px",
    background: "#fff",
    color: "var(--green)",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: 1.5,
    textAlign: "left",
    textDecoration: "none",
    cursor: "pointer",
  };

  const accessArrowStyle: React.CSSProperties = {
    flexShrink: 0,
    color: "var(--brown)",
    fontSize: "18px",
    fontWeight: 500,
  };

  return (
    <main>
      <style>{`
        .pajara-access-button:hover {
          background: var(--soft) !important;
          border-color: var(--green) !important;
        }
        .pajara-access-button:focus-visible {
          outline: 2px solid var(--green);
          outline-offset: 3px;
        }
        .pajara-consistent-text {
          font-size: 14px;
          line-height: 1.8;
          color: var(--muted);
        }
        .pajara-file-action {
          min-height: 44px;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 16px;
          border-radius: 10px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
        }
        @media (max-width: 640px) {
          .pajara-order-detail-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>

      <header className="pajara-header">
        <div className="pajara-container pajara-header-inner">
          <a
            href="/dashboard"
            className="pajara-brand"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <img
              src="/755809946_17926162029385149_3739923509439876817_n.jpg"
              alt="Logo Pajara Studio"
              style={{
                width: "42px",
                height: "42px",
                objectFit: "contain",
                borderRadius: "10px",
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
              gridTemplateColumns: "minmax(0, 1.5fr) minmax(280px, 1fr)",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: "20px", minWidth: 0 }}>
              <div className="pajara-order-detail-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p className="pajara-eyebrow">ID PESANAN</p>
                    <h2 style={{ marginTop: "8px", marginBottom: 0 }}>
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
                      marginTop: "16px",
                      padding: "14px",
                      borderRadius: "12px",
                      background: "var(--soft)",
                      color: "var(--green)",
                      fontSize: "14px",
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
                    gap: "16px",
                    marginTop: "22px",
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
                        {new Date(`${order.deadline}T00:00:00`).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {activeAccess === "brief" && (
                <div className="pajara-order-detail-card">
                  <p className="pajara-eyebrow">INFORMASI PROJECT</p>
                  <h2>Brief Desain</h2>

                  <div
                    style={{
                      marginTop: "18px",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "var(--soft)",
                      color: "var(--green)",
                      fontSize: "14px",
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {order.brief || "Belum ada brief desain."}
                  </div>

                  {order.notes && (
                    <div
                      style={{
                        marginTop: "20px",
                        paddingTop: "20px",
                        borderTop: "1px solid var(--line)",
                      }}
                    >
                      <p className="pajara-eyebrow">CATATAN TAMBAHAN</p>
                      <p
                        style={{
                          marginTop: "10px",
                          fontSize: "14px",
                          lineHeight: 1.8,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeAccess === "files" && (
                <div className="pajara-order-detail-card">
                  <p className="pajara-eyebrow">HASIL DESAIN</p>
                  <h2>File Desain Final</h2>

                  <p
                    className="pajara-consistent-text"
                    style={{ marginTop: "10px" }}
                  >
                    File hasil desain akan tersedia setelah tim Pajara Studio
                    mengunggah file final pesanan Anda.
                  </p>

                  {loadingFiles ? (
                    <div
                      role="status"
                      style={{
                        marginTop: "18px",
                        padding: "16px",
                        borderRadius: "12px",
                        background: "var(--soft)",
                        color: "var(--green)",
                        fontSize: "14px",
                      }}
                    >
                      Memuat file final...
                    </div>
                  ) : finalFiles.length === 0 ? (
                    <div
                      style={{
                        marginTop: "18px",
                        padding: "16px",
                        borderRadius: "12px",
                        background: "var(--soft)",
                        color: "var(--muted)",
                        fontSize: "14px",
                        lineHeight: 1.8,
                      }}
                    >
                      {fileMessage || "Belum ada file final."}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gap: "14px",
                        marginTop: "20px",
                      }}
                    >
                      {finalFiles.map((file) => {
                        const isImage = file.file_type?.startsWith("image/");
                        const isPdf = file.file_type === "application/pdf";
                        const isDownloading = downloadingFileId === file.id;

                        return (
                          <div
                            key={file.id}
                            style={{
                              border: "1px solid var(--line)",
                              borderRadius: "14px",
                              padding: "16px",
                              background: "#fff",
                              minWidth: 0,
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "var(--green)",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {file.file_name}
                            </p>

                            <p
                              style={{
                                margin: "6px 0 0",
                                fontSize: "12px",
                                color: "var(--muted)",
                              }}
                            >
                              {formatFileSize(file.file_size)}
                            </p>

                            {isImage && file.url && (
                              <div
                                style={{
                                  marginTop: "16px",
                                  borderRadius: "10px",
                                  overflow: "hidden",
                                  background: "#F7F4EE",
                                }}
                              >
                                <img
                                  src={file.url}
                                  alt={file.file_name}
                                  loading="lazy"
                                  style={{
                                    display: "block",
                                    width: "100%",
                                    maxHeight: "500px",
                                    objectFit: "contain",
                                  }}
                                />
                              </div>
                            )}

                            {file.url ? (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  flexWrap: "wrap",
                                  marginTop: "16px",
                                }}
                              >
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="pajara-file-action"
                                  style={{
                                    background: "var(--green)",
                                    color: "#fff",
                                  }}
                                >
                                  {isPdf ? "Buka PDF" : "Buka File"}
                                </a>

                                <button
                                  type="button"
                                  onClick={() => handleDownload(file)}
                                  disabled={isDownloading}
                                  className="pajara-file-action"
                                  style={{
                                    border: "1px solid var(--line)",
                                    background: "#fff",
                                    color: "var(--green)",
                                    opacity: isDownloading ? 0.65 : 1,
                                  }}
                                >
                                  {isDownloading ? "Mengunduh..." : "Download"}
                                </button>
                              </div>
                            ) : (
                              <div
                                style={{
                                  marginTop: "16px",
                                  padding: "12px",
                                  borderRadius: "10px",
                                  background: "var(--soft)",
                                  color: "var(--muted)",
                                  fontSize: "13px",
                                  lineHeight: 1.7,
                                }}
                              >
                                File tercatat di sistem, tetapi link file belum
                                dapat dibuat.
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {fileMessage && (
                        <p
                          className="pajara-consistent-text"
                          style={{ margin: 0 }}
                        >
                          {fileMessage}
                        </p>
                      )}
                    </div>
                  )}

                  {downloadError && (
                    <p
                      role="alert"
                      style={{
                        marginTop: "14px",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "var(--soft)",
                        color: "var(--green)",
                        fontSize: "13px",
                        lineHeight: 1.7,
                      }}
                    >
                      {downloadError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gap: "20px",
                alignContent: "start",
                minWidth: 0,
              }}
            >
              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">AKSES PESANAN</p>
                <h2>Kelola Project</h2>

                <p
                  className="pajara-consistent-text"
                  style={{ marginTop: "10px" }}
                >
                  Buka informasi project dan file desainmu saat diperlukan.
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    marginTop: "22px",
                  }}
                >
                  {!isSubscriptionOrder && (
                    <a
                      href={`/orders/payment?id=${order.id}`}
                      className="pajara-access-button"
                      style={accessButtonStyle}
                    >
                      <span>Pembayaran</span>
                      <span style={accessArrowStyle}>→</span>
                    </a>
                  )}

                  <a
                    href={`/orders/revision?id=${order.id}`}
                    className="pajara-access-button"
                    style={accessButtonStyle}
                  >
                    <span>Revisi</span>
                    <span style={accessArrowStyle}>→</span>
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveAccess((current) =>
                        current === "brief" ? null : "brief"
                      )
                    }
                    aria-expanded={activeAccess === "brief"}
                    className="pajara-access-button"
                    style={accessButtonStyle}
                  >
                    <span>Lihat Brief Desain</span>
                    <span style={accessArrowStyle}>
                      {activeAccess === "brief" ? "−" : "+"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveAccess((current) =>
                        current === "files" ? null : "files"
                      )
                    }
                    aria-expanded={activeAccess === "files"}
                    className="pajara-access-button"
                    style={accessButtonStyle}
                  >
                    <span>Lihat File Final Anda</span>
                    <span style={accessArrowStyle}>
                      {activeAccess === "files" ? "−" : "+"}
                    </span>
                  </button>

                  <a
                    href={`/orders/files?id=${order.id}`}
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
                      gap: "14px",
                      marginTop: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        fontSize: "14px",
                      }}
                    >
                      <span className="pajara-consistent-text">Total</span>
                      <strong>{formatRupiah(order.total_amount)}</strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        fontSize: "14px",
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
                        gap: "12px",
                        paddingTop: "14px",
                        borderTop: "1px solid var(--line)",
                        fontSize: "14px",
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

          <div style={{ marginTop: "28px", paddingBottom: "24px" }}>
            <a
              href="/dashboard"
              style={{
                color: "var(--green)",
                fontSize: "14px",
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
