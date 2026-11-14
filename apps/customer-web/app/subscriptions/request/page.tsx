
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@pajara/supabase";
import CustomerLoading from "../../components/CustomerLoading";

type Subscription = {
  id: string;
  quota_total: number;
  quota_used: number;
  status: string;
  started_at: string | null;
  expires_at: string | null;
};

const LOGO =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

const SERVICES = [
  "Logo & Branding",
  "Desain Promosi",
  "Social Media",
  "Banner",
  "Kemasan & Menu",
];

const DESIGN_TYPES: Record<string, string[]> = {
  "Logo & Branding": ["Logo", "Brand Identity", "Rebranding", "Lainnya"],
  "Desain Promosi": [
    "Poster",
    "Flyer",
    "Brosur",
    "Konten Promosi",
    "Lainnya",
  ],
  "Social Media": [
    "Feed IG",
    "Story IG",
    "Carousel Instagram",
    "Konten Media Sosial",
    "Lainnya",
  ],
  Banner: ["Banner Digital", "Banner Cetak", "Spanduk", "Lainnya"],
  "Kemasan & Menu": [
    "Kemasan Produk",
    "Menu Makanan",
    "Menu Minuman",
    "Lainnya",
  ],
};

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;

export default function SubscriptionDesignRequest() {
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [service, setService] = useState("");
  const [designType, setDesignType] = useState("");
  const [deadline, setDeadline] = useState("");
  const [brief, setBrief] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSubscription() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(
            "Sesi Anda tidak ditemukan. Silakan login kembali."
          );
        }

        const { data, error: queryError } = await supabase
          .from("subscriptions")
          .select(
            "id, quota_total, quota_used, status, started_at, expires_at"
          )
          .eq("customer_id", user.id)
          .eq("status", "active")
          .order("expires_at", { ascending: true });

        if (queryError) throw queryError;

        const now = Date.now();

        const active = (data || []).find((item) => {
          const started = item.started_at
            ? new Date(item.started_at).getTime()
            : Infinity;

          const expires = item.expires_at
            ? new Date(item.expires_at).getTime()
            : 0;

          return (
            started <= now &&
            expires > now &&
            item.quota_used < item.quota_total
          );
        });

        if (mounted) {
          setSubscription(active || null);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat paket Anda."
          );
        }
      } finally {
        if (mounted) setPageLoading(false);
      }
    }

    loadSubscription();

    return () => {
      mounted = false;
    };
  }, []);

  function handleFileSelection(files: File[]) {
    setError("");
    setSuccess("");

    if (files.length > MAX_FILES) {
      setError(`Maksimal ${MAX_FILES} file referensi untuk satu pesanan.`);
      return;
    }

    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError(
          `Format file "${file.name}" tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau PDF.`
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" melebihi batas 10 MB.`);
        return;
      }
    }

    setSelectedFiles(files);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!subscription) {
      setError("Paket aktif atau kuota desain tidak tersedia.");
      return;
    }

    if (!service || !designType || !brief.trim()) {
      setError("Mohon lengkapi semua informasi wajib pesanan.");
      return;
    }

    for (const file of selectedFiles) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError(
          `Format file "${file.name}" tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau PDF.`
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" melebihi batas 10 MB.`);
        return;
      }
    }

    setSubmitting(true);

    let requestCreated = false;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "Sesi Anda berakhir. Silakan login kembali."
        );
      }

      const { data: latest, error: checkError } = await supabase
        .from("subscriptions")
        .select(
          "id, quota_total, quota_used, status, started_at, expires_at"
        )
        .eq("id", subscription.id)
        .eq("customer_id", user.id)
        .single();

      if (checkError || !latest) {
        throw new Error("Paket tidak dapat diverifikasi.");
      }

      const now = Date.now();

      if (
        latest.status !== "active" ||
        !latest.started_at ||
        !latest.expires_at ||
        new Date(latest.started_at).getTime() > now ||
        new Date(latest.expires_at).getTime() <= now ||
        latest.quota_used >= latest.quota_total
      ) {
        setSubscription(null);

        throw new Error(
          "Paket tidak aktif atau kuota sudah habis. Muat ulang halaman."
        );
      }

      const deadlineValue = deadline
        ? new Date(`${deadline}T23:59:59`).toISOString()
        : null;

      const { data, error: rpcError } = await supabase.rpc(
        "create_subscription_design_request",
        {
          p_subscription_id: subscription.id,
          p_service_name: service,
          p_design_type: designType,
          p_brief: brief.trim(),
          p_notes: notes.trim() || null,
          p_deadline: deadlineValue,
        }
      );

      if (rpcError) throw rpcError;

      const result = Array.isArray(data) ? data[0] : data;

      if (
        !result?.created_order_id ||
        !result?.created_order_code
      ) {
        throw new Error(
          "Request belum mengembalikan nomor pesanan. Periksa status pesanan sebelum mencoba lagi."
        );
      }

      requestCreated = true;

      let uploadedCount = 0;

      for (const file of selectedFiles) {
        const safeFileName = file.name
          .normalize("NFKD")
          .replace(/[^\w.-]/g, "-")
          .replace(/-+/g, "-");

        const filePath =
          `orders/${result.created_order_id}/reference/` +
          `${crypto.randomUUID()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("pajara-files")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          throw new Error(
            `Pesanan sudah dibuat, tetapi file "${file.name}" gagal diunggah: ${uploadError.message}. Jangan kirim ulang request.`
          );
        }

        const { error: recordError } = await supabase
          .from("order_files")
          .insert({
            order_id: result.created_order_id,
            revision_id: null,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            file_category: "reference",
            uploaded_by: user.id,
          });

        if (recordError) {
          throw new Error(
            `Pesanan sudah dibuat, tetapi pencatatan file "${file.name}" gagal: ${recordError.message}. Jangan kirim ulang request.`
          );
        }

        uploadedCount++;
      }

      setSuccess(
        `Pesanan ${result.created_order_code} berhasil dibuat. ` +
          `Referensi terunggah: ${uploadedCount}. ` +
          `Kuota digunakan: 1 desain. Tidak ada pembayaran tambahan.`
      );

      setSubscription((current) =>
        current
          ? {
              ...current,
              quota_used: current.quota_used + 1,
            }
          : null
      );

      setService("");
      setDesignType("");
      setDeadline("");
      setBrief("");
      setNotes("");
      setSelectedFiles([]);

      const fileInput = document.getElementById(
        "reference"
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : requestCreated
            ? "Pesanan sudah dibuat, tetapi ada masalah saat mengunggah referensi. Jangan kirim ulang request."
            : "Gagal membuat request desain."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const formatDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

  if (pageLoading) {
    return (
      <CustomerLoading
        title="Menyiapkan Halaman"
        description="Sebentar, kami sedang memeriksa paket dan kuota desain Kang/Teh."
      />
    );
  }

  return (
    <main className="order-page">
      <header className="order-navbar">
        <div className="order-navbar-inner">
          <Link href="/dashboard" className="order-brand">
            <img
              src={LOGO}
              alt="Logo Pajara Studio"
              className="order-brand-logo"
            />

            <span className="order-brand-copy">
              <strong>Pajara Studio</strong>
              <span>Berakar di Tanah Pasundan.</span>
            </span>
          </Link>

          <Link href="/dashboard" className="order-dashboard-link">
            <span>Dashboard</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <div className="order-container">
        <div className="order-breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link href="/subscriptions">Paket Desain</Link>
          <span>/</span>
          <span>Pesan Desain</span>
        </div>

        <section className="order-intro">
          <div className="order-eyebrow">
            <span className="order-eyebrow-dot" />
            PAJARA STUDIO · SUBSCRIPTION
          </div>

          <h1>
            Mari wujudkan
            <br />
            <span>ide kreatif Anda.</span>
          </h1>

          <p>
            Ceritakan kebutuhan desain Anda kepada kami. Gunakan kuota
            paket untuk memulai perjalanan desain dengan arah yang jelas.
          </p>

          <div className="order-intro-note">
            <span aria-hidden="true">✳</span>
            Desain yang punya arah.
          </div>
        </section>

        {subscription ? (
          <section className="order-quota-card">
            <div className="order-quota-top">
              <div>
                <span className="order-section-number">
                  PAKET DESAIN ANDA
                </span>
                <h2>Paket aktif</h2>
              </div>

              <span className="order-quota-status">
                <span />
                Aktif
              </span>
            </div>

            <div className="order-quota-content">
              <div className="order-quota-number">
                <strong>
                  {Math.max(
                    0,
                    subscription.quota_total - subscription.quota_used
                  )}
                </strong>
                <span>
                  dari {subscription.quota_total} kuota tersedia
                </span>
              </div>

              <div className="order-quota-progress">
                <span
                  style={{
                    width: `${
                      subscription.quota_total > 0
                        ? Math.min(
                            100,
                            (subscription.quota_used /
                              subscription.quota_total) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p>
                Berlaku sampai{" "}
                <strong>{formatDate(subscription.expires_at)}</strong>
              </p>
            </div>
          </section>
        ) : (
          <section className="order-no-quota">
            <div className="order-alert-symbol">!</div>
            <div>
              <strong>
                Tidak ada paket dengan kuota tersedia.
              </strong>
              <p>
                Aktifkan paket atau periksa sisa kuota sebelum membuat
                request desain.
              </p>
              <Link href="/subscriptions">
                Lihat Paket Desain <span>↗</span>
              </Link>
            </div>
          </section>
        )}

        <section className="order-form-card">
          <div className="order-form-heading">
            <div>
              <span className="order-section-number">
                01 / INFORMASI
              </span>
              <h2>Detail pesanan</h2>
              <p>Isi kebutuhan satu output desain yang ingin Anda buat.</p>
            </div>
          </div>

          {error && (
            <div className="order-alert order-alert-error" role="alert">
              <span className="order-alert-symbol">!</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="order-alert order-alert-success" role="status">
              <span className="order-alert-symbol">✓</span>

              <div>
                <strong>Pesanan berhasil dikirim.</strong>
                <p>{success}</p>

                <Link href="/orders/list" className="order-success-link">
                  Lihat pesanan <span>↗</span>
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="order-field">
              <label htmlFor="service">
                Layanan desain <span>*</span>
              </label>

              <select
                id="service"
                value={service}
                onChange={(event) => {
                  setService(event.target.value);
                  setDesignType("");
                }}
                required
                disabled={!subscription || submitting}
              >
                <option value="">Pilih layanan yang dibutuhkan</option>

                {SERVICES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="order-field">
              <label htmlFor="designType">
                Jenis desain <span>*</span>
              </label>

              <select
                id="designType"
                value={designType}
                onChange={(event) => setDesignType(event.target.value)}
                required
                disabled={!service || !subscription || submitting}
              >
                <option value="">
                  {service
                    ? "Pilih jenis desain"
                    : "Pilih layanan terlebih dahulu"}
                </option>

                {(DESIGN_TYPES[service] || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="order-field">
              <label htmlFor="deadline">Target penyelesaian</label>

              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                min={new Date().toLocaleDateString("en-CA")}
                disabled={!subscription || submitting}
              />

              <small>Jadwal akan dikonfirmasi oleh admin.</small>
            </div>

            <div className="order-divider" />

            <div className="order-form-heading order-form-heading-secondary">
              <div>
                <span className="order-section-number">
                  02 / BRIEF
                </span>
                <h2>Ceritakan ide Anda</h2>
                <p>
                  Semakin jelas brief, semakin mudah kami memahami arahnya.
                </p>
              </div>
            </div>

            <div className="order-field">
              <label htmlFor="brief">
                Brief desain <span>*</span>
              </label>

              <textarea
                id="brief"
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                placeholder="Contoh: Saya membutuhkan desain feed Instagram untuk promosi produk. Nuansa yang diinginkan hangat, minimalis, dan mudah dibaca..."
                rows={6}
                required
                disabled={!subscription || submitting}
              />

              <small>
                Tuliskan tujuan desain, informasi yang perlu dicantumkan,
                dan gambaran hasil yang Anda inginkan.
              </small>
            </div>

            <div className="order-field">
              <label htmlFor="notes">Catatan tambahan</label>

              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Warna, referensi gaya, ukuran, atau informasi tambahan lainnya."
                rows={3}
                disabled={!subscription || submitting}
              />
            </div>

            <div className="order-divider" />

            <div className="order-form-heading order-form-heading-secondary">
              <div>
                <span className="order-section-number">
                  03 / REFERENSI
                </span>
                <h2>Tambahkan referensi</h2>
                <p>
                  Unggah gambar atau dokumen untuk membantu kami memahami
                  kebutuhan desain Anda.
                </p>
              </div>
            </div>

            <div className="order-upload">
              <label htmlFor="reference" className="order-upload-area">
                <span className="order-upload-icon" aria-hidden="true">
                  ↑
                </span>

                <strong>Pilih file referensi</strong>

                <span>
                  Tekan untuk memilih gambar atau PDF dari perangkat Anda.
                </span>

                <small>
                  JPG, PNG, WEBP, GIF, atau PDF · Maks. 10 MB per file ·
                  Maks. {MAX_FILES} file
                </small>
              </label>

              <input
                id="reference"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,image/jpeg,image/png,image/webp,image/gif,application/pdf"
                multiple
                disabled={!subscription || submitting}
                onChange={(event) => {
                  handleFileSelection(
                    Array.from(event.target.files || [])
                  );
                  event.target.value = "";
                }}
              />

              {selectedFiles.length > 0 && (
                <div className="order-file-list">
                  {selectedFiles.map((file, index) => (
                    <div
                      className="order-file-item"
                      key={`${file.name}-${index}`}
                    >
                      <span className="order-file-icon" aria-hidden="true">
                        ↗
                      </span>

                      <span className="order-file-info">
                        <strong>{file.name}</strong>
                        <small>
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </small>
                      </span>

                      <button
                        type="button"
                        className="order-file-remove"
                        aria-label={`Hapus ${file.name}`}
                        disabled={submitting}
                        onClick={() =>
                          setSelectedFiles((current) =>
                            current.filter((_, i) => i !== index)
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="order-quota-notice">
              <span className="order-quota-notice-icon">✓</span>
              <div>
                <strong>Gunakan satu kuota desain</strong>
                <p>
                  Satu request menggunakan satu kuota output desain.
                  Tidak ada pembayaran tambahan untuk request paket.
                </p>
              </div>
            </div>

            <div className="order-submit-area">
              <p>
                Dengan mengirim request, Anda menyatakan bahwa informasi
                yang diberikan sudah sesuai dengan kebutuhan desain.
              </p>

              <button
                type="submit"
                className="order-submit-button"
                disabled={
                  submitting ||
                  !subscription ||
                  pageLoading
                }
              >
                {submitting ? (
                  <>
                    <span className="order-spinner" />
                    Mengirim request...
                  </>
                ) : (
                  <>
                    Kirim Request
                    <span aria-hidden="true">↗</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <footer className="order-footer">
          <img
            src={LOGO}
            alt="Logo Pajara Studio"
            className="order-footer-logo"
          />

          <div className="order-footer-copy">
            <strong>Pajara Studio</strong>
            <span>Berakar di Tanah Pasundan.</span>
            <small>© 2026 Pajara Studio. Desain yang punya arah.</small>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        .order-page {
          --green: #2f6b45;
          --green-dark: #214d32;
          --brown: #8a6a4a;
          --cream: #f7f4ee;
          --ink: #252820;
          --muted: #77796f;
          min-height: 100vh;
          padding-bottom: 30px;
          background: var(--cream);
          color: var(--ink);
          font-family: Arial, Helvetica, sans-serif;
        }

        .order-page *,
        .order-page *::before,
        .order-page *::after {
          box-sizing: border-box;
        }

        .order-navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          background: rgba(247, 244, 238, 0.76);
          border-bottom: 1px solid rgba(220, 220, 208, 0.65);
          box-shadow: 0 5px 24px rgba(33, 77, 50, 0.055);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          backdrop-filter: blur(18px) saturate(160%);
        }

        .order-navbar-inner {
          width: min(1120px, calc(100% - 24px));
          min-height: 74px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .order-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1 1 auto;
          color: var(--green-dark);
          text-decoration: none;
        }

        .order-brand-logo {
          display: block;
          width: 40px;
          height: 40px;
          min-width: 40px;
          flex: 0 0 40px;
          object-fit: cover;
          border-radius: 11px;
          border: 1px solid rgba(230, 232, 223, 0.9);
          background: rgba(255, 255, 255, 0.8);
        }

        .order-brand-copy {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .order-brand-copy strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.3px;
        }

        .order-brand-copy span {
          color: #85877c;
          font-size: 9px;
          line-height: 1.4;
        }

        .order-dashboard-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex: 0 0 auto;
          min-height: 42px;
          padding: 9px 14px;
          border: 1px solid rgba(213, 226, 207, 0.85);
          border-radius: 13px;
          background: rgba(237, 243, 233, 0.76);
          color: var(--green-dark);
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 3px 10px rgba(33, 77, 50, 0.06);
          transition: 0.2s ease;
        }

        .order-dashboard-link:hover {
          background: rgba(227, 237, 221, 0.95);
          border-color: #b9ceb0;
          transform: translateY(-1px);
        }

        .order-container {
          width: min(850px, calc(100% - 40px));
          margin: 0 auto;
        }

        .order-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding: 27px 0 20px;
          color: #93948a;
          font-size: 12px;
        }

        .order-breadcrumb a {
          color: var(--green);
          text-decoration: none;
        }

        .order-intro {
          padding: 21px 0 32px;
        }

        .order-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 17px;
          color: var(--green);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .order-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--brown);
        }

        .order-intro h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(35px, 6vw, 54px);
          line-height: 1.12;
          letter-spacing: -1.8px;
          font-weight: 500;
        }

        .order-intro h1 span {
          color: var(--green);
          font-style: italic;
        }

        .order-intro > p {
          max-width: 550px;
          margin: 18px 0 0;
          color: #77796f;
          font-size: 14px;
          line-height: 1.9;
        }

        .order-intro-note {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          padding: 9px 13px;
          border: 1px solid #e6e4d9;
          border-radius: 999px;
          color: #6e715f;
          background: rgba(255, 255, 255, 0.52);
          font-size: 11px;
        }

        .order-intro-note span {
          color: var(--brown);
          font-size: 15px;
        }

        .order-quota-card {
          margin-bottom: 22px;
          padding: 22px 25px;
          border: 1px solid #d5e5d7;
          border-radius: 17px;
          background: #eaf3eb;
          color: var(--green-dark);
        }

        .order-quota-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .order-quota-top .order-section-number {
          margin-bottom: 7px;
        }

        .order-quota-top h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          font-weight: 500;
        }

        .order-quota-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border: 1px solid #c9dfca;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.55);
          color: #35613b;
          font-size: 10px;
          font-weight: 700;
        }

        .order-quota-status span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4c8b53;
        }

        .order-quota-content {
          margin-top: 18px;
        }

        .order-quota-number {
          display: flex;
          align-items: baseline;
          gap: 9px;
        }

        .order-quota-number strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 32px;
          line-height: 1.2;
        }

        .order-quota-number span {
          color: #58745b;
          font-size: 11px;
        }

        .order-quota-progress {
          height: 6px;
          margin-top: 13px;
          overflow: hidden;
          border-radius: 99px;
          background: rgba(47, 107, 69, 0.13);
        }

        .order-quota-progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: var(--green);
          transition: width 0.3s ease;
        }

        .order-quota-content > p {
          margin: 12px 0 0;
          color: #668069;
          font-size: 11px;
        }

        .order-quota-content > p strong {
          color: var(--green-dark);
        }

        .order-no-quota {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-bottom: 22px;
          padding: 18px;
          border: 1px solid #e8ddca;
          border-radius: 15px;
          background: #f5f0e8;
          color: #624c34;
          font-size: 12px;
          line-height: 1.8;
        }

        .order-no-quota .order-alert-symbol {
          flex: 0 0 25px;
          background: rgba(138, 106, 74, 0.12);
        }

        .order-no-quota strong {
          display: block;
          margin-bottom: 4px;
        }

        .order-no-quota p {
          margin: 0;
        }

        .order-no-quota a {
          display: inline-block;
          margin-top: 7px;
          color: var(--green-dark);
          font-weight: 700;
          text-decoration: none;
        }

        .order-form-card {
          padding: 35px;
          background: #fff;
          border: 1px solid #e9e7df;
          border-radius: 23px;
          box-shadow: 0 15px 55px rgba(42, 48, 34, 0.045);
        }

        .order-form-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 28px;
        }

        .order-section-number {
          display: block;
          margin-bottom: 10px;
          color: var(--brown);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.8px;
        }

        .order-form-heading h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 28px;
          line-height: 1.25;
          font-weight: 500;
          letter-spacing: -0.5px;
        }

        .order-form-heading p {
          margin: 9px 0 0;
          color: #83847b;
          font-size: 12px;
          line-height: 1.7;
        }

        .order-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-bottom: 22px;
        }

        .order-field label {
          color: #373b32;
          font-size: 12px;
          font-weight: 700;
        }

        .order-field label span {
          color: #a66b45;
        }

        .order-field input,
        .order-field select,
        .order-field textarea {
          display: block;
          width: 100%;
          min-width: 0;
          border: 1px solid #e3e3d9;
          border-radius: 12px;
          padding: 14px 15px;
          background: #fcfcfa;
          color: #292d25;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          line-height: 1.5;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .order-field input,
        .order-field select {
          min-height: 49px;
        }

        .order-field select {
          cursor: pointer;
        }

        .order-field select:disabled,
        .order-field input:disabled,
        .order-field textarea:disabled {
          cursor: not-allowed;
          color: #999a91;
          background: #f3f3ef;
        }

        .order-field textarea {
          min-height: 90px;
          resize: vertical;
        }

        .order-field input:focus,
        .order-field select:focus,
        .order-field textarea:focus {
          border-color: #80a68a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(47, 107, 69, 0.09);
        }

        .order-field input::placeholder,
        .order-field textarea::placeholder {
          color: #a1a197;
        }

        .order-field > small {
          color: #898a80;
          font-size: 10px;
          line-height: 1.6;
        }

        .order-divider {
          width: 100%;
          height: 1px;
          margin: 31px 0;
          background: #eeede7;
        }

        .order-form-heading-secondary {
          margin-bottom: 24px;
        }

        .order-form-heading-secondary h2 {
          font-size: 25px;
        }

        .order-upload {
          margin-bottom: 25px;
        }

        .order-upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px 18px;
          border: 1px dashed #c9d6c1;
          border-radius: 15px;
          background: #f8faf6;
          text-align: center;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .order-upload-area:hover {
          border-color: var(--green);
          background: #f1f6ed;
        }

        .order-upload-icon {
          display: grid;
          width: 43px;
          height: 43px;
          place-items: center;
          margin-bottom: 13px;
          border: 1px solid #e0e9da;
          border-radius: 14px;
          background: #fff;
          color: var(--green);
          font-size: 23px;
        }

        .order-upload-area strong {
          margin-bottom: 7px;
          color: #344733;
          font-size: 13px;
        }

        .order-upload-area > span:not(.order-upload-icon) {
          color: #85877c;
          font-size: 11px;
          line-height: 1.7;
        }

        .order-upload-area small {
          margin-top: 12px;
          color: #929387;
          font-size: 10px;
          line-height: 1.6;
        }

        .order-upload input[type="file"] {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          clip-path: inset(50%);
        }

        .order-file-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-top: 13px;
        }

        .order-file-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px;
          border: 1px solid #e8e8df;
          border-radius: 12px;
          background: #fff;
        }

        .order-file-icon {
          display: grid;
          width: 35px;
          height: 35px;
          flex: 0 0 35px;
          place-items: center;
          border-radius: 10px;
          background: #edf3e9;
          color: var(--green);
        }

        .order-file-info {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .order-file-info strong {
          overflow-wrap: anywhere;
          color: #414439;
          font-size: 11px;
        }

        .order-file-info small {
          color: #8b8d82;
          font-size: 10px;
        }

        .order-file-remove {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          border: 0;
          border-radius: 9px;
          background: #f7eeea;
          color: #925e4b;
          font-size: 20px;
          cursor: pointer;
        }

        .order-file-remove:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .order-quota-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border: 1px solid #d9e6d4;
          border-radius: 13px;
          background: #f3f7f0;
          color: var(--green-dark);
        }

        .order-quota-notice-icon {
          display: grid;
          width: 25px;
          height: 25px;
          flex: 0 0 25px;
          place-items: center;
          border-radius: 50%;
          background: rgba(47, 107, 69, 0.1);
          font-size: 12px;
          font-weight: 700;
        }

        .order-quota-notice strong {
          display: block;
          margin-bottom: 5px;
          font-size: 12px;
        }

        .order-quota-notice p {
          margin: 0;
          color: #668069;
          font-size: 11px;
          line-height: 1.7;
        }

        .order-submit-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          margin-top: 32px;
          padding-top: 25px;
          border-top: 1px solid #eeede7;
        }

        .order-submit-area > p {
          max-width: 490px;
          margin: 0;
          color: #87887f;
          font-size: 10px;
          line-height: 1.8;
          text-align: center;
        }

        .order-submit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 13px;
          width: 100%;
          min-height: 53px;
          padding: 15px 20px;
          border: 1px solid var(--green);
          border-radius: 13px;
          background: var(--green);
          color: #fff;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .order-submit-button:hover:not(:disabled) {
          background: var(--green-dark);
          transform: translateY(-1px);
        }

        .order-submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .order-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: order-spin 0.8s linear infinite;
        }

        @keyframes order-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .order-alert {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 23px;
          padding: 15px;
          border-radius: 13px;
          font-size: 12px;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .order-alert-error {
          border: 1px solid #ecd4ca;
          background: #fff6f2;
          color: #884d3b;
        }

        .order-alert-success {
          border: 1px solid #d3e4cf;
          background: #f2f8ef;
          color: #345d38;
        }

        .order-alert-symbol {
          display: grid;
          width: 25px;
          height: 25px;
          flex: 0 0 25px;
          place-items: center;
          border-radius: 50%;
          background: rgba(47, 107, 69, 0.1);
          font-weight: 700;
        }

        .order-alert-success strong {
          display: block;
          margin-bottom: 4px;
        }

        .order-alert-success p {
          margin: 0;
        }

        .order-success-link {
          display: inline-block;
          margin-top: 8px;
          color: var(--green-dark);
          font-weight: 700;
          text-decoration: none;
        }

        .order-footer {
          display: flex;
          align-items: center;
          gap: 13px;
          border-top: 1px solid #e4ddd1;
          padding-top: 22px;
          margin-top: 36px;
        }

        .order-footer-logo {
          display: block;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          object-fit: contain;
          border-radius: 10px;
          background: #fff;
        }

        .order-footer-copy {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .order-footer-copy strong {
          color: var(--green-dark);
          font-size: 13px;
          line-height: 1.5;
        }

        .order-footer-copy span {
          color: var(--brown);
          font-size: 11px;
          line-height: 1.5;
        }

        .order-footer-copy small {
          color: #999387;
          font-size: 10px;
          line-height: 1.5;
        }

        @media (max-width: 600px) {
          .order-navbar-inner {
            width: calc(100% - 24px);
            min-height: 74px;
            gap: 8px;
          }

          .order-brand {
            gap: 8px;
          }

          .order-brand-logo {
            width: 38px;
            height: 38px;
            min-width: 38px;
            flex-basis: 38px;
          }

          .order-brand-copy {
            gap: 4px;
          }

          .order-brand-copy strong {
            font-size: 15px;
            letter-spacing: -0.3px;
          }

          .order-brand-copy span {
            max-width: 150px;
            font-size: 8px;
            line-height: 1.3;
          }

          .order-dashboard-link {
            gap: 8px;
            min-height: 40px;
            padding: 8px 11px;
            border-radius: 11px;
            font-size: 11px;
          }

          .order-container {
            width: calc(100% - 28px);
          }

          .order-breadcrumb {
            padding: 22px 0 15px;
            font-size: 11px;
          }

          .order-intro {
            padding: 19px 0 26px;
          }

          .order-intro h1 {
            font-size: clamp(34px, 9vw, 46px);
            letter-spacing: -1.2px;
          }

          .order-intro > p {
            font-size: 12px;
            line-height: 1.85;
          }

          .order-form-card {
            padding: 23px 17px;
            border-radius: 19px;
          }

          .order-form-heading {
            margin-bottom: 24px;
          }

          .order-form-heading h2 {
            font-size: 25px;
          }

          .order-form-heading p {
            font-size: 11px;
          }

          .order-field {
            margin-bottom: 19px;
          }

          .order-field input,
          .order-field select,
          .order-field textarea {
            font-size: 13px;
          }

          .order-divider {
            margin: 25px 0;
          }

          .order-form-heading-secondary h2 {
            font-size: 23px;
          }

          .order-upload-area {
            padding: 23px 13px;
          }

          .order-quota-card {
            padding: 19px;
          }

          .order-quota-number strong {
            font-size: 29px;
          }
        }

        @media (max-width: 360px) {
          .order-navbar-inner {
            width: calc(100% - 16px);
            gap: 5px;
          }

          .order-brand {
            gap: 6px;
          }

          .order-brand-logo {
            width: 32px;
            height: 32px;
            min-width: 32px;
            flex-basis: 32px;
            border-radius: 9px;
          }

          .order-brand-copy strong {
            font-size: 13px;
          }

          .order-brand-copy span {
            max-width: 112px;
            font-size: 7px;
          }

          .order-dashboard-link {
            gap: 6px;
            padding: 7px 9px;
            font-size: 10px;
          }

          .order-container {
            width: calc(100% - 22px);
          }

          .order-form-card {
            padding: 19px 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .order-page *,
          .order-page *::before,
          .order-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
