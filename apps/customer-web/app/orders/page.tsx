
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

function formatFileSize(size: number | null) {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

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
        setError(orderError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Pesanan tidak ditemukan.");
        setLoading(false);
        return;
      }

      // Pesanan yang terhubung ke subscription_requests
      // merupakan desain yang menggunakan kuota paket.
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

        // Demi keamanan, jangan tampilkan tagihan jika
        // jenis pesanan belum berhasil diverifikasi.
        setError(
          "Jenis pesanan belum dapat diverifikasi. Silakan muat ulang halaman."
        );
        setLoading(false);
        return;
      }

      setIsSubscriptionOrder(!!subscriptionRequest);
      setOrder(data);
      setLoading(false);

      await loadFinalFiles(data.id, mounted);
    };

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [id]);

  const loadFinalFiles = async (
    orderId: string,
    mounted: boolean
  ) => {
    setLoadingFiles(true);
    setFileMessage("");
    setDownloadError(null);

    const { data, error: filesError } = await supabase
      .from("order_files")
      .select(`
        id,
        file_name,
        file_path,
        file_type,
        file_size,
        created_at
      `)
      .eq("order_id", orderId)
      .eq("file_category", "final")
      .order("created_at", { ascending: false });

    if (!mounted) return;

    if (filesError) {
      console.error("Gagal mengambil order_files:", filesError);
      setFinalFiles([]);
      setFileMessage(`File final belum dapat dimuat. ${filesError.message}`);
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
    return (
      <main>
        <section className="pajara-order-detail">
          <div className="pajara-container">
            <p>Memuat detail pesanan...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main>
        <section className="pajara-order-detail">
          <div className="pajara-container">
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">PESANAN</p>
              <h2>Pesanan tidak dapat ditemukan</h2>
              <p>{error || "Pesanan tidak tersedia."}</p>
              <a
                href="/dashboard"
                className="pajara-button pajara-button-primary"
              >
                Kembali ke Dashboard
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <img
              src="/755809946_17926162029385149_3739923509439876817_n.jpg"
              alt="Pajara Studio"
              className="pajara-brand-logo"
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
              Pantau status project, revisi, dan file desain Anda dari satu tempat.
            </p>
          </div>

          <div className="pajara-order-detail-grid">
            <div style={{ display: "grid", gap: "20px" }}>
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
                    <p
                      style={{
                        margin: 0,
                        color: "var(--brown)",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      ID Pesanan
                    </p>
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
                      lineHeight: 1.6,
                    }}
                  >
                    Pesanan ini menggunakan kuota paket Anda. Tidak ada pembayaran
                    tambahan per desain.
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
                    <p>Layanan</p>
                    <strong>{order.service_name || "Belum ditentukan"}</strong>
                  </div>
                  <div>
                    <p>Jenis Desain</p>
                    <strong>{order.design_type || "Belum ditentukan"}</strong>
                  </div>
                  <div>
                    <p>Jumlah Desain</p>
                    <strong>{order.quantity || 1} desain</strong>
                  </div>
                  <div>
                    <p>Status Project</p>
                    <strong>{getStatusLabel(order.status)}</strong>
                  </div>
                </div>
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">BRIEF</p>
                <h2>Brief Desain</h2>
                <p style={{ marginTop: "16px", whiteSpace: "pre-wrap" }}>
                  {order.brief || "Belum ada brief."}
                </p>

                {order.notes && (
                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "20px",
                      borderTop: "1px solid var(--line)",
                    }}
                  >
                    <p>Catatan Tambahan</p>
                    <p style={{ whiteSpace: "pre-wrap" }}>{order.notes}</p>
                  </div>
                )}
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">FILE FINAL</p>
                <h2>File Desain Final</h2>
                <p
                  style={{
                    marginTop: "10px",
                    color: "var(--muted)",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  File hasil desain akan tersedia di halaman ini setelah pesanan
                  selesai dan file final sudah diunggah oleh tim Pajara Studio.
                </p>

                {loadingFiles ? (
                  <div
                    style={{
                      marginTop: "18px",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "var(--soft)",
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
                      fontSize: "14px",
                      lineHeight: 1.6,
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
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: "14px",
                              flexWrap: "wrap",
                            }}
                          >
                            <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontWeight: 700,
                                  color: "var(--green)",
                                  wordBreak: "break-word",
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
                            </div>
                          </div>

                          {isImage && file.url && (
                            <div
                              style={{
                                marginTop: "16px",
                                borderRadius: "10px",
                                overflow: "hidden",
                                background: "#f5f5f5",
                              }}
                            >
                              <img
                                src={file.url}
                                alt={file.file_name}
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
                                className="pajara-button pajara-button-primary"
                              >
                                {isPdf ? "Buka PDF" : "Buka File"}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDownload(file)}
                                disabled={isDownloading}
                                className="pajara-button pajara-button-secondary"
                                style={{
                                  border: "none",
                                  cursor: isDownloading ? "wait" : "pointer",
                                  opacity: isDownloading ? 0.7 : 1,
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
                                fontSize: "13px",
                                lineHeight: 1.5,
                              }}
                            >
                              File tercatat di sistem, tetapi link file belum dapat
                              dibuat.
                            </div>
                          )}

                          {downloadError && downloadingFileId === null && (
                            <div
                              style={{
                                marginTop: "12px",
                                padding: "12px 14px",
                                borderRadius: "10px",
                                background: "var(--soft)",
                                fontSize: "13px",
                                lineHeight: 1.5,
                              }}
                            >
                              {downloadError}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {fileMessage && (
                      <div
                        style={{
                          padding: "12px 14px",
                          borderRadius: "10px",
                          background: "var(--soft)",
                          fontSize: "13px",
                          lineHeight: 1.5,
                        }}
                      >
                        {fileMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: "20px",
                alignContent: "start",
              }}
            >
              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">AKSES PESANAN</p>
                <h2>Kelola Project</h2>

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
                      className="pajara-button pajara-button-primary"
                    >
                      Pembayaran
                    </a>
                  )}

                  <a
                    href={`/orders/revision?id=${order.id}`}
                    className="pajara-button pajara-button-secondary"
                  >
                    Revisi
                  </a>

                  <a
                    href={`/orders/files?id=${order.id}`}
                    className="pajara-button pajara-button-secondary"
                  >
                    File Pesanan
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
                      gap: "12px",
                      marginTop: "18px",
                    }}
                  >
                    <div>
                      Total: Rp{" "}
                      {(order.total_amount || 0).toLocaleString("id-ID")}
                    </div>
                    <div>
                      DP: Rp{" "}
                      {(order.dp_amount || 0).toLocaleString("id-ID")}
                    </div>
                    <div>
                      Sisa: Rp{" "}
                      {(order.remaining_amount || 0).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: "28px" }}>
            <a
              href="/dashboard"
              style={{
                color: "var(--green)",
                fontSize: "14px",
                fontWeight: 700,
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
  return (
    <main>
      <section className="pajara-order-detail">
        <div className="pajara-container">
          <p>Memuat detail pesanan...</p>
        </div>
      </section>
    </main>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<OrderDetailFallback />}>
      <OrderDetailContent />
    </Suspense>
  );
}
