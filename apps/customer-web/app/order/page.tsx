"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@pajara/supabase";

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

const PAYMENT_METHODS = [
  {
    value: "QRIS",
    title: "QRIS",
    description: "Pembayaran melalui kode QR.",
  },
  {
    value: "DANA",
    title: "DANA",
    description: "Pembayaran melalui e-wallet.",
  },
  {
    value: "GoPay",
    title: "GoPay",
    description: "Pembayaran melalui e-wallet.",
  },
  {
    value: "SeaBank",
    title: "SeaBank",
    description: "Pembayaran melalui transfer bank.",
  },
];

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;

export default function CreateOrder() {
  const [pageLoading, setPageLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [service, setService] = useState("");
  const [designType, setDesignType] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [deadline, setDeadline] = useState("");
  const [brief, setBrief] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentType, setPaymentType] = useState("");

  useEffect(() => {
    let mounted = true;

    async function preparePage() {
      try {
        await supabase.auth.getUser();
      } finally {
        if (mounted) {
          setPageLoading(false);
        }
      }
    }

    preparePage();

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

    if (!service || !designType || !brief.trim() || !paymentType) {
      setError("Mohon lengkapi semua informasi wajib pesanan.");
      return;
    }

    const quantityNumber = Number(quantity);

    if (
      !Number.isInteger(quantityNumber) ||
      quantityNumber < 1 ||
      quantityNumber > 100
    ) {
      setError("Jumlah desain harus antara 1 sampai 100.");
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

    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Sesi login tidak ditemukan. Silakan login kembali.");
        return;
      }

      const orderCode = `PJ-${Date.now().toString().slice(-8)}`;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_code: orderCode,
          customer_id: user.id,
          service_name: service,
          design_type: designType,
          quantity: quantityNumber,
          brief: brief.trim(),
          notes: notes.trim() || null,
          deadline: deadline || null,
          total_amount: 0,
          dp_amount: 0,
          remaining_amount: 0,
          status: "pending",
        })
        .select("id, order_code")
        .single();

      if (orderError || !order) {
        throw new Error(
          orderError?.message || "Pesanan belum berhasil dibuat."
        );
      }

      for (const file of selectedFiles) {
        const safeName = file.name
          .normalize("NFKD")
          .replace(/[^\w.-]/g, "-")
          .replace(/-+/g, "-");

        const filePath =
          `orders/${order.id}/reference/` +
          `${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("pajara-files")
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Pesanan ${order.order_code || order.id} sudah dibuat, tetapi file "${file.name}" gagal diunggah. Hubungi admin dengan kode pesanan tersebut.`
          );
        }

        const { error: fileRecordError } = await supabase
          .from("order_files")
          .insert({
            order_id: order.id,
            revision_id: null,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            file_category: "reference",
            uploaded_by: user.id,
          });

        if (fileRecordError) {
          throw new Error(
            `Pesanan ${order.order_code || order.id} sudah dibuat, tetapi pencatatan file "${file.name}" gagal. Hubungi admin dengan kode pesanan tersebut.`
          );
        }
      }

      setSuccess(
        `Pesanan berhasil dibuat${
          order.order_code ? ` dengan kode ${order.order_code}` : ""
        }. Silakan cek halaman pesanan untuk informasi selanjutnya.`
      );

      setService("");
      setDesignType("");
      setQuantity("1");
      setDeadline("");
      setBrief("");
      setNotes("");
      setPaymentType("");
      setSelectedFiles([]);

      const fileInput = document.getElementById(
        "reference"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <main className="pajara-loading-page">
        <div className="pajara-loading-content">
          <div className="pajara-loading-logo">
            <img src={LOGO} alt="Pajara Studio" />
          </div>

          <div className="pajara-loading-brand">PAJARA STUDIO</div>

          <h1>Menyiapkan Pesanan</h1>

          <p>
            Mohon tunggu sebentar, kami sedang menyiapkan halaman pesanan Anda.
          </p>

          <div className="pajara-loading-progress">
            <span />
          </div>

          <div className="pajara-loading-footer">
            DESAIN YANG PUNYA ARAH
          </div>
        </div>

        <style jsx>{`
          .pajara-loading-page {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 25px;
            background: #f7f4ee;
            font-family: Arial, Helvetica, sans-serif;
            text-align: center;
          }

          .pajara-loading-content {
            display: flex;
            width: 100%;
            max-width: 360px;
            flex-direction: column;
            align-items: center;
          }

          .pajara-loading-logo {
            display: grid;
            width: 90px;
            height: 90px;
            place-items: center;
            margin-bottom: 25px;
            padding: 9px;
            overflow: hidden;
            border: 1px solid rgba(47, 107, 69, 0.2);
            border-radius: 23px;
            background: #fff;
            box-shadow: 0 8px 25px rgba(33, 77, 50, 0.08);
          }

          .pajara-loading-logo img {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 15px;
            object-fit: contain;
          }

          .pajara-loading-brand {
            margin-bottom: 13px;
            color: #8a6a4a;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 3px;
          }

          .pajara-loading-content h1 {
            margin: 0;
            color: #214d32;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 29px;
            font-weight: 500;
            letter-spacing: -0.7px;
          }

          .pajara-loading-content p {
            max-width: 290px;
            margin: 12px 0 25px;
            color: #85877c;
            font-size: 11px;
            line-height: 1.8;
          }

          .pajara-loading-progress {
            position: relative;
            width: 155px;
            height: 3px;
            overflow: hidden;
            border-radius: 10px;
            background: #e4e7dd;
          }

          .pajara-loading-progress span {
            position: absolute;
            top: 0;
            left: -45%;
            width: 45%;
            height: 100%;
            border-radius: 10px;
            background: #2f6b45;
            animation: pajara-loading 1.3s ease-in-out infinite;
          }

          @keyframes pajara-loading {
            0% {
              left: -45%;
            }
            100% {
              left: 100%;
            }
          }

          .pajara-loading-footer {
            margin-top: 35px;
            color: #aaa394;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 2px;
          }

          @media (prefers-reduced-motion: reduce) {
            .pajara-loading-progress span {
              animation-duration: 2.5s;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="order-page">
      <header className="dashboard-header">
        <div className="dashboard-container dashboard-header-inner">
          <Link href="/dashboard" className="dashboard-brand">
            <img
              src={LOGO}
              alt="Logo Pajara Studio"
              className="dashboard-logo"
              width={39}
              height={39}
            />
            <span>Pajara Studio</span>
          </Link>

          <div className="dashboard-header-actions">
            <button
              type="button"
              className={`dashboard-menu-button ${
                menuOpen ? "is-open" : ""
              }`}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              <span />
              <span />
            </button>

            <Link href="/order" className="dashboard-header-link">
              Pesan Desain <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        {menuOpen && (
          <nav className="dashboard-menu" aria-label="Navigasi dashboard">
            <p className="dashboard-menu-label">MENU PELANGGAN</p>

            <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard <span>↗</span>
            </Link>

            <Link href="/orders/list" onClick={() => setMenuOpen(false)}>
              Pesanan Saya <span>↗</span>
            </Link>

            <Link href="/subscriptions" onClick={() => setMenuOpen(false)}>
              Paket Desain <span>↗</span>
            </Link>

            <Link href="/payments" onClick={() => setMenuOpen(false)}>
              Pembayaran <span>↗</span>
            </Link>
          </nav>
        )}
      </header>

      <div className="order-container">
        <div className="order-breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <span>Pesan Desain</span>
        </div>

        <section className="order-intro">
          <div className="order-eyebrow">
            <span className="order-eyebrow-dot" />
            PAJARA STUDIO · ORDER
          </div>

          <h1>
            Mari wujudkan
            <br />
            <span>ide kreatif Anda.</span>
          </h1>

          <p>
            Ceritakan kebutuhan desain Anda kepada kami. Lengkapi informasi
            berikut agar perjalanan desain kita dimulai dengan arah yang jelas.
          </p>

          <div className="order-intro-note">
            <span aria-hidden="true">✳</span>
            Desain yang punya arah.
          </div>
        </section>

        <section className="order-form-card">
          <div className="order-form-heading">
            <div>
              <span className="order-section-number">01 / INFORMASI</span>
              <h2>Detail pesanan</h2>
              <p>Isi kebutuhan desain yang ingin Anda buat.</p>
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
                disabled={!service}
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

            <div className="order-field-grid">
              <div className="order-field">
                <label htmlFor="quantity">
                  Jumlah output desain <span>*</span>
                </label>

                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  required
                />

                <small>1 output dihitung sebagai 1 desain.</small>
              </div>

              <div className="order-field">
                <label htmlFor="deadline">Target penyelesaian</label>

                <input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />

                <small>Jadwal akan dikonfirmasi oleh admin.</small>
              </div>
            </div>

            <div className="order-divider" />

            <div className="order-form-heading order-form-heading-secondary">
              <div>
                <span className="order-section-number">02 / BRIEF</span>
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
              />

              <small>
                Tuliskan tujuan desain, informasi yang perlu dicantumkan, dan
                gambaran hasil yang Anda inginkan.
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
              />
            </div>

            <div className="order-divider" />

            <div className="order-form-heading order-form-heading-secondary">
              <div>
                <span className="order-section-number">03 / REFERENSI</span>
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

            <div className="order-divider" />

            <div className="order-form-heading order-form-heading-secondary">
              <div>
                <span className="order-section-number">04 / PEMBAYARAN</span>
                <h2>Preferensi pembayaran</h2>
                <p>
                  Pilih metode yang Anda rencanakan untuk digunakan.
                </p>
              </div>
            </div>

            <div className="order-payment-options">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`order-payment-option ${
                    paymentType === method.value ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-type"
                    value={method.value}
                    checked={paymentType === method.value}
                    onChange={(event) => setPaymentType(event.target.value)}
                    required
                  />

                  <span className="order-payment-radio" />

                  <span className="order-payment-copy">
                    <strong>{method.title}</strong>
                    <small>{method.description}</small>
                  </span>
                </label>
              ))}
            </div>

            <p className="order-payment-note">
              Pilihan ini merupakan preferensi awal. Konfirmasi nominal,
              instruksi pembayaran, dan metode yang tersedia akan mengikuti
              informasi resmi dari Pajara Studio.
            </p>

            <div className="order-submit-area">
              <p>
                Dengan mengirim pesanan, Anda menyatakan bahwa informasi yang
                diberikan sudah sesuai dengan kebutuhan desain.
              </p>

              <button
                type="submit"
                className="order-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="order-spinner" />
                    Mengirim pesanan...
                  </>
                ) : (
                  <>
                    Kirim Pesanan
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
              © 2026 Pajara Studio. Desain yang punya arah.
            </p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .order-page {
          --green: #2f6b45;
          --green-dark: #214d32;
          --brown: #8a6a4a;
          --cream: #f7f4ee;
          --ink: #252820;
          --muted: #77796f;
          min-height: 100vh;
          background: var(--cream);
          color: var(--ink);
          font-family: Arial, Helvetica, sans-serif;
          padding-bottom: 30px;
        }

        .order-page * {
          box-sizing: border-box;
        }

        /* DASHBOARD NAVBAR */

        .dashboard-header {
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(47, 107, 69, 0.1);
          background: rgba(247, 244, 238, 0.88);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
          backdrop-filter: blur(22px) saturate(160%);
          transition: background 0.3s ease;
        }

        .dashboard-container {
          width: min(100% - 32px, 680px);
          margin: 0 auto;
        }

        .dashboard-header-inner {
          display: flex;
          min-height: 70px;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .dashboard-brand {
          display: inline-flex;
          min-width: 0;
          align-items: center;
          gap: 10px;
          color: #214d32;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
        }

        .dashboard-logo {
          display: block !important;
          width: 39px !important;
          height: 39px !important;
          min-width: 39px !important;
          max-width: 39px !important;
          min-height: 39px !important;
          max-height: 39px !important;
          flex: 0 0 39px !important;
          border-radius: 12px;
          object-fit: cover;
        }

        .dashboard-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-shrink: 0;
        }

        .dashboard-menu-button {
          display: flex;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          border: 1px solid rgba(47, 107, 69, 0.2);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.55);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dashboard-menu-button:hover {
          border-color: #2f6b45;
          background: #fff;
        }

        .dashboard-menu-button span {
          display: block;
          width: 17px;
          height: 2px;
          border-radius: 5px;
          background: #214d32;
          transition: transform 0.2s ease;
        }

        .dashboard-menu-button.is-open span:first-child {
          transform: translateY(3.5px) rotate(45deg);
        }

        .dashboard-menu-button.is-open span:last-child {
          transform: translateY(-3.5px) rotate(-45deg);
        }

        .dashboard-header-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          flex-shrink: 0;
          min-height: 42px;
          padding: 10px 14px;
          border: 1px solid rgba(47, 107, 69, 0.2);
          border-radius: 10px;
          background: #214d32;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .dashboard-header-link:hover {
          border-color: #2f6b45;
          background: #2f6b45;
        }

        .dashboard-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          width: min(680px, calc(100% - 32px));
          padding: 13px;
          border: 1px solid rgba(47, 107, 69, 0.12);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 12px 35px rgba(33, 77, 50, 0.12);
          transform: translateX(-50%);
          animation: dashboard-menu-in 0.18s ease;
        }

        @keyframes dashboard-menu-in {
          from {
            opacity: 0;
            transform: translate(-50%, -5px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .dashboard-menu-label {
          margin: 2px 9px 9px;
          color: #999487;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .dashboard-menu a {
          display: flex;
          min-height: 43px;
          align-items: center;
          justify-content: space-between;
          padding: 10px 11px;
          border-radius: 9px;
          color: #214d32;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .dashboard-menu a:hover {
          background: #f1f5ed;
        }

        .dashboard-menu a span:last-child {
          color: #8a6a4a;
        }

        .order-container {
          width: min(850px, calc(100% - 40px));
          margin: 0 auto;
        }

        .order-breadcrumb {
          display: flex;
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

        .order-field select:disabled {
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

        .order-field-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
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
          transition: border-color 0.2s ease, background 0.2s ease;
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

        .order-payment-options {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .order-payment-option {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
          padding: 15px;
          border: 1px solid #e5e5dc;
          border-radius: 13px;
          background: #fff;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .order-payment-option.is-selected {
          border-color: #85a98a;
          background: #f3f7f0;
        }

        .order-payment-option input {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        .order-payment-option:focus-within {
          outline: 2px solid #80a68a;
          outline-offset: 2px;
        }

        .order-payment-radio {
          display: grid;
          width: 17px;
          height: 17px;
          flex: 0 0 17px;
          place-items: center;
          border: 1px solid #c9cbbf;
          border-radius: 50%;
        }

        .order-payment-option.is-selected .order-payment-radio {
          border: 5px solid var(--green);
        }

        .order-payment-copy {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }

        .order-payment-copy strong {
          color: #373d32;
          font-size: 12px;
        }

        .order-payment-copy small {
          color: #87897e;
          font-size: 10px;
          line-height: 1.5;
        }

        .order-payment-note {
          margin: 15px 0 0;
          color: #85867d;
          font-size: 10px;
          line-height: 1.8;
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
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .order-submit-button:hover:not(:disabled) {
          background: var(--green-dark);
          transform: translateY(-1px);
        }

        .order-submit-button:disabled {
          opacity: 0.7;
          cursor: wait;
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

        @media (max-width: 600px) {
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

          .order-field-grid {
            grid-template-columns: 1fr;
            gap: 0;
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

          .order-payment-options {
            grid-template-columns: 1fr;
            gap: 9px;
          }

          .order-payment-option {
            padding: 13px;
          }

          .order-upload-area {
            padding: 23px 13px;
          }
        }

        @media (max-width: 360px) {
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
