
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@pajara/supabase";

export default function CreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Sesi Anda tidak ditemukan. Silakan login kembali.");
        return;
      }

      const formData = new FormData(form);
      const service = String(formData.get("service") || "");
      const designType = String(formData.get("design-type") || "").trim();
      const quantity = Number(formData.get("quantity") || 1);
      const deadlineValue = String(formData.get("deadline") || "");
      const brief = String(formData.get("brief") || "").trim();
      const notes = String(formData.get("notes") || "").trim();
      const paymentType = String(formData.get("payment-type") || "");

      const referenceInput = form.elements.namedItem(
        "reference"
      ) as HTMLInputElement | null;

      const referenceFiles = referenceInput?.files
        ? Array.from(referenceInput.files)
        : [];

      if (!service) {
        setError("Silakan pilih layanan terlebih dahulu.");
        return;
      }

      if (!designType) {
        setError("Silakan isi jenis desain.");
        return;
      }

      if (!brief) {
        setError("Silakan isi brief desain.");
        return;
      }

      if (!paymentType) {
        setError("Silakan pilih skema pembayaran.");
        return;
      }

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        setError("Jumlah desain harus berupa angka antara 1–100.");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
      ];

      const maxFileSize = 10 * 1024 * 1024;

      for (const file of referenceFiles) {
        if (!allowedTypes.includes(file.type)) {
          setError(
            `Format file "${file.name}" tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau PDF.`
          );
          return;
        }

        if (file.size > maxFileSize) {
          setError(`File "${file.name}" melebihi batas 10 MB.`);
          return;
        }
      }

      const orderCode = `PJ-${Date.now().toString().slice(-8)}`;

      let deadline: string | null = null;

      if (deadlineValue) {
        const selectedDate = new Date(`${deadlineValue}T12:00:00`);

        if (Number.isNaN(selectedDate.getTime())) {
          setError("Tanggal deadline tidak valid.");
          return;
        }

        selectedDate.setHours(23, 59, 59, 999);
        deadline = selectedDate.toISOString();
      }

      const now = new Date().toISOString();

      const { data: order, error: insertError } = await supabase
        .from("orders")
        .insert({
          order_code: orderCode,
          customer_id: user.id,
          service_id: null,
          service_name: service,
          design_type: designType,
          quantity,
          brief,
          notes,
          total_amount: 0,
          dp_amount: 0,
          remaining_amount: 0,
          status: "pending",
          deadline,
          assigned_admin: null,
          created_at: now,
          updated_at: now,
        })
        .select("id")
        .single();

      if (insertError || !order) {
        setError(
          insertError?.message ||
            "Pesanan gagal dibuat. Silakan coba kembali."
        );
        return;
      }

      let uploadedCount = 0;

      for (const file of referenceFiles) {
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const filePath =
          `orders/${order.id}/reference/` +
          `${crypto.randomUUID()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("pajara-files")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "application/octet-stream",
          });

        if (uploadError) {
          setError(
            `Pesanan ${orderCode} sudah dibuat, tetapi file "${file.name}" gagal diupload. ${uploadError.message}`
          );
          return;
        }

        const { error: fileRecordError } = await supabase
          .from("order_files")
          .insert({
            order_id: order.id,
            revision_id: null,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type || "application/octet-stream",
            file_size: file.size,
            file_category: "reference",
            uploaded_by: user.id,
          });

        if (fileRecordError) {
          setError(
            `File "${file.name}" sudah diupload, tetapi pencatatan file gagal. ${fileRecordError.message}`
          );
          return;
        }

        uploadedCount++;
      }

      setSuccess(
        `Pesanan ${orderCode} berhasil dibuat. ${uploadedCount} file referensi berhasil diupload. Tim Pajara akan meninjau pesanan Anda.`
      );

      form.reset();
      setSelectedFiles([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat pesanan. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="order-page">
      <header className="order-topbar">
        <div className="order-topbar-inner">
          <Link href="/dashboard" className="order-brand">
            <img
              src="/755809946_17926162029385149_3739923509439876817_n.jpg"
              alt="Logo Pajara Studio"
              className="order-brand-logo"
            />
            <span className="order-brand-copy">
              <strong>Pajara Studio</strong>
              <small>Berakar di Tanah Pasundan.</small>
            </span>
          </Link>

          <Link href="/dashboard" className="order-dashboard-link">
            Dashboard <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <section className="order-main">
        <div className="order-container">
          <div className="order-intro">
            <div className="order-eyebrow">
              <span className="order-eyebrow-dot" />
              PAJARA STUDIO <span className="order-eyebrow-divider">/</span>{" "}
              ORDER FORM
            </div>

            <h1>
              Wujudkan ide,
              <br />
              <span>mulai dari sini.</span>
            </h1>

            <p>
              Setiap desain berawal dari sebuah cerita. Ceritakan kebutuhan
              Kang/Teh kepada kami agar tim Pajara dapat memahami arah visual
              yang ingin diwujudkan.
            </p>

            <div className="order-intro-note">
              <span className="order-note-icon" aria-hidden="true">
                ✳
              </span>
              <span>
                Luangkan waktu untuk mengisi detail pesanan dengan teliti.
              </span>
            </div>

            <div className="order-progress" aria-label="Empat bagian formulir">
              <span className="order-progress-line" />
              <span className="order-progress-item">
                <b>01</b> Detail
              </span>
              <span className="order-progress-item">
                <b>02</b> Brief
              </span>
              <span className="order-progress-item">
                <b>03</b> Referensi
              </span>
              <span className="order-progress-item">
                <b>04</b> Pembayaran
              </span>
            </div>
          </div>

          <form className="order-form" onSubmit={handleSubmit}>
            <div className="order-form-topline">
              <span>FORMULIR PEMESANAN</span>
              <span>
                <i /> Pengisian pesanan
              </span>
            </div>

            <section className="order-section">
              <div className="order-section-heading">
                <span className="order-section-number">01</span>
                <div>
                  <h2>Detail pesanan</h2>
                  <p>Tentukan layanan dan kebutuhan desain.</p>
                </div>
              </div>

              <div className="order-grid">
                <div className="order-field">
                  <label htmlFor="service">Layanan desain</label>
                  <select id="service" name="service" defaultValue="" required>
                    <option value="" disabled>
                      Pilih layanan
                    </option>
                    <option value="Logo & Branding">Logo &amp; Branding</option>
                    <option value="Desain Promosi">Desain Promosi</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Banner">Banner</option>
                    <option value="Kemasan & Menu">Kemasan &amp; Menu</option>
                  </select>
                </div>

                <div className="order-field">
                  <label htmlFor="design-type">Jenis desain</label>
                  <input
                    id="design-type"
                    name="design-type"
                    type="text"
                    placeholder="Contoh: Feed Instagram"
                    maxLength={120}
                    required
                  />
                </div>

                <div className="order-field">
                  <label htmlFor="quantity">Jumlah desain</label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue="1"
                    required
                  />
                  <small>Jumlah output desain yang dibutuhkan.</small>
                </div>

                <div className="order-field">
                  <label htmlFor="deadline">Target selesai</label>
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    min={new Date().toLocaleDateString("en-CA")}
                  />
                  <small>Menjadi acuan target pengerjaan.</small>
                </div>
              </div>
            </section>

            <section className="order-section">
              <div className="order-section-heading">
                <span className="order-section-number">02</span>
                <div>
                  <h2>Brief desain</h2>
                  <p>Jelaskan arah visual yang Kang/Teh inginkan.</p>
                </div>
              </div>

              <div className="order-field">
                <label htmlFor="brief">Brief utama</label>
                <textarea
                  id="brief"
                  name="brief"
                  rows={6}
                  maxLength={5000}
                  placeholder="Ceritakan konsep desain, teks yang harus dicantumkan, ukuran, target audiens, warna pilihan, dan informasi penting lainnya."
                  required
                />
                <small>
                  Semakin jelas informasinya, semakin mudah tim Pajara
                  memahami kebutuhan desain.
                </small>
              </div>

              <div className="order-field order-field-spaced">
                <label htmlFor="notes">
                  Catatan tambahan <span>(opsional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  maxLength={3000}
                  placeholder="Ada permintaan khusus? Tulis di sini."
                />
              </div>
            </section>

            <section className="order-section">
              <div className="order-section-heading">
                <span className="order-section-number">03</span>
                <div>
                  <h2>Referensi visual</h2>
                  <p>Tambahkan file pendukung jika tersedia.</p>
                </div>
              </div>

              <label className="order-upload-box" htmlFor="reference">
                <span className="order-upload-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="25"
                    height="25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 16V4" />
                    <path d="m7 9 5-5 5 5" />
                    <path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />
                  </svg>
                </span>
                <strong>Pilih file referensi</strong>
                <span>
                  JPG, PNG, WEBP, GIF, atau PDF
                  <br />
                  Maksimal 10 MB per file
                </span>
                <input
                  id="reference"
                  name="reference"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                  multiple
                  onChange={(event) =>
                    setSelectedFiles(
                      Array.from(event.target.files || []).map(
                        (file) => file.name
                      )
                    )
                  }
                />
                <span className="order-upload-button">
                  Pilih file dari perangkat
                </span>
              </label>

              {selectedFiles.length > 0 && (
                <div className="order-selected-files">
                  <div className="order-selected-heading">
                    <strong>File yang dipilih</strong>
                    <span>{selectedFiles.length} file</span>
                  </div>
                  {selectedFiles.map((name, index) => (
                    <div
                      className="order-file-name"
                      key={`${name}-${index}`}
                    >
                      <span className="order-file-symbol" aria-hidden="true">
                        ↳
                      </span>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="order-field-help">
                Referensi bersifat opsional. Pastikan file sesuai dengan
                kebutuhan project yang dipesan.
              </p>
            </section>

            <section className="order-section">
              <div className="order-section-heading">
                <span className="order-section-number">04</span>
                <div>
                  <h2>Skema pembayaran</h2>
                  <p>Pilih rencana pembayaran yang diinginkan.</p>
                </div>
              </div>

              <div className="order-payment-options">
                <label className="order-payment-option">
                  <input
                    type="radio"
                    name="payment-type"
                    value="dp"
                    required
                  />
                  <span className="order-payment-card">
                    <span className="order-payment-card-top">
                      <span className="order-payment-symbol">01</span>
                      <span className="order-payment-check" aria-hidden="true">
                        ✓
                      </span>
                    </span>
                    <span className="order-payment-title">DP 50%</span>
                    <span className="order-payment-description">
                      Uang muka di awal, sisanya setelahnya.
                    </span>
                  </span>
                </label>

                <label className="order-payment-option">
                  <input
                    type="radio"
                    name="payment-type"
                    value="full"
                    required
                  />
                  <span className="order-payment-card">
                    <span className="order-payment-card-top">
                      <span className="order-payment-symbol">02</span>
                      <span className="order-payment-check" aria-hidden="true">
                        ✓
                      </span>
                    </span>
                    <span className="order-payment-title">Full / Lunas</span>
                    <span className="order-payment-description">
                      Pembayaran penuh di awal.
                    </span>
                  </span>
                </label>
              </div>

              <p className="order-field-help">
                Harga final dan nominal pembayaran akan dikonfirmasi oleh
                admin Pajara. Memilih skema di sini belum melakukan pembayaran.
              </p>
            </section>

            {error && (
              <div className="order-alert order-alert-error" role="alert">
                <span className="order-alert-symbol" aria-hidden="true">
                  !
                </span>
                <div>
                  <strong>Pesanan belum selesai diproses</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="order-alert order-alert-success" role="status">
                <span className="order-alert-symbol" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <strong>Pesanan berhasil dibuat</strong>
                  <p>{success}</p>
                  <Link href="/orders/list">Lihat daftar pesanan →</Link>
                </div>
              </div>
            )}

            <div className="order-submit-area">
              <div className="order-submit-copy">
                <span className="order-submit-kicker">LANGKAH TERAKHIR</span>
                <strong>Siap mengirim pesanan?</strong>
                <p>
                  Periksa kembali detail yang sudah diisi sebelum mengirim.
                </p>
              </div>

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
                    Kirim pesanan
                    <span aria-hidden="true">↗</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <footer className="order-footer">
            <div>
              <strong>PAJARA STUDIO</strong>
              <span>Berakar di Tanah Pasundan.</span>
            </div>
            <span className="order-footer-note">
              Desain yang punya arah.
            </span>
          </footer>
        </div>
      </section>

      <style jsx>{`
        .order-page {
          min-height: 100vh;
          background: #f7f4ee;
          color: #24372a;
          padding-bottom: 45px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .order-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(255, 255, 255, 0.96);
          border-bottom: 1px solid #e8e4da;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .order-topbar-inner {
          width: min(100% - 40px, 1040px);
          min-height: 76px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .order-brand {
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          gap: 12px;
          min-width: 0;
          color: #214d32;
          text-decoration: none;
        }

        .order-brand-logo {
          display: block;
          flex: 0 0 45px;
          width: 45px;
          height: 45px;
          object-fit: cover;
          border-radius: 13px;
          border: 1px solid #e8e4da;
          background: #f7f4ee;
          box-shadow: 0 3px 10px rgba(33, 77, 50, 0.08);
        }

        .order-brand-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          min-width: 0;
          gap: 4px;
        }

        .order-brand-copy strong {
          display: block;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.4px;
          line-height: 1.2;
        }

        .order-brand-copy small {
          display: block;
          margin: 0;
          color: #85877f;
          font-size: 10px;
          letter-spacing: 0.1px;
          line-height: 1.4;
        }

        .order-dashboard-link {
          display: inline-flex;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 43px;
          box-sizing: border-box;
          padding: 0 16px;
          border: 1px solid #dce6d8;
          border-radius: 13px;
          background: #edf3e9;
          color: #2f6b45;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 3px 10px rgba(33, 77, 50, 0.04);
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .order-dashboard-link span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 23px;
          height: 23px;
          border-radius: 8px;
          background: #fff;
          color: #2f6b45;
          font-size: 13px;
        }

        .order-dashboard-link:hover {
          background: #e3eddf;
          border-color: #b9cbb9;
          box-shadow: 0 5px 14px rgba(33, 77, 50, 0.08);
          transform: translateY(-1px);
        }

        .order-dashboard-link:focus-visible,
        .order-brand:focus-visible {
          outline: 2px solid #2f6b45;
          outline-offset: 4px;
          border-radius: 10px;
        }

        .order-main {
          padding: 30px 0 0;
        }

        .order-container {
          width: min(100% - 40px, 760px);
          margin: 0 auto;
        }

        .order-intro {
          position: relative;
          padding: 43px 0 31px;
        }

        .order-eyebrow {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          color: #687b66;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.8px;
        }

        .order-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2f6b45;
          box-shadow: 0 0 0 4px #e4ebdf;
        }

        .order-eyebrow-divider {
          color: #b7aa94;
        }

        .order-intro h1 {
          margin: 20px 0 15px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(38px, 7vw, 58px);
          font-weight: 500;
          line-height: 1.08;
          letter-spacing: -1.8px;
          color: #214d32;
        }

        .order-intro h1 span {
          color: #8a6a4a;
          font-style: italic;
        }

        .order-intro > p {
          max-width: 535px;
          margin: 0;
          color: #73776f;
          font-size: 13px;
          line-height: 1.95;
        }

        .order-intro-note {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
          color: #687b66;
          font-size: 11px;
          line-height: 1.7;
        }

        .order-note-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 27px;
          height: 27px;
          flex: 0 0 27px;
          border: 1px solid #e0d8c9;
          border-radius: 9px;
          background: #fffdf8;
          color: #8a6a4a;
          font-size: 15px;
        }

        .order-progress {
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-top: 29px;
          padding-top: 17px;
          border-top: 1px solid #e2ded2;
        }

        .order-progress-line {
          display: none;
        }

        .order-progress-item {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #85877f;
          font-size: 10px;
        }

        .order-progress-item b {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 25px;
          height: 25px;
          border: 1px solid #d8e1d4;
          border-radius: 9px;
          background: #edf2e9;
          color: #2f6b45;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 10px;
          font-weight: 500;
        }

        .order-form {
          overflow: hidden;
          background: #fff;
          border: 1px solid #e7e3d9;
          border-radius: 20px;
          box-shadow: 0 18px 45px rgba(36, 55, 42, 0.055);
        }

        .order-form-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 30px;
          border-bottom: 1px solid #eeeae2;
          background: #fdfcf9;
          color: #7e8478;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .order-form-topline > span:last-child {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          letter-spacing: 0;
          font-size: 10px;
          font-weight: 500;
        }

        .order-form-topline i {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #739477;
        }

        .order-section {
          padding: 29px 30px 31px;
          border-bottom: 1px solid #eeeae2;
        }

        .order-section-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 24px;
        }

        .order-section-number {
          display: flex;
          flex: 0 0 39px;
          width: 39px;
          height: 39px;
          align-items: center;
          justify-content: center;
          border: 1px solid #e0e8dc;
          border-radius: 12px;
          background: #edf2e9;
          color: #2f6b45;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 15px;
        }

        .order-section-heading h2 {
          margin: 2px 0 6px;
          color: #24372a;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
          font-weight: 500;
          letter-spacing: -0.4px;
        }

        .order-section-heading p {
          margin: 0;
          color: #85877f;
          font-size: 11px;
          line-height: 1.8;
        }

        .order-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 21px 18px;
        }

        .order-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
          min-width: 0;
        }

        .order-field-spaced {
          margin-top: 22px;
        }

        .order-field label {
          color: #354638;
          font-size: 11px;
          font-weight: 700;
        }

        .order-field label span {
          color: #9b9d94;
          font-weight: 400;
        }

        .order-field input,
        .order-field select,
        .order-field textarea {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          border: 1px solid #e4e3da;
          border-radius: 11px;
          outline: none;
          background: #fdfcf9;
          color: #24372a;
          font-family: inherit;
          font-size: 13px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .order-field input,
        .order-field select {
          min-height: 47px;
          padding: 0 13px;
        }

        .order-field textarea {
          min-height: 105px;
          padding: 13px;
          line-height: 1.8;
          resize: vertical;
        }

        .order-field input::placeholder,
        .order-field textarea::placeholder {
          color: #a5a59b;
        }

        .order-field input:focus,
        .order-field select:focus,
        .order-field textarea:focus {
          border-color: #729477;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(47, 107, 69, 0.08);
        }

        .order-field small,
        .order-field-help {
          color: #92938b;
          font-size: 10px;
          line-height: 1.8;
        }

        .order-field-help {
          margin: 13px 0 0;
        }

        .order-upload-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 11px;
          padding: 28px 16px;
          border: 1px dashed #b9cbb9;
          border-radius: 15px;
          background: #f9faf6;
          text-align: center;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .order-upload-box:hover {
          background: #f1f5ed;
          border-color: #729477;
        }

        .order-upload-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          border: 1px solid #dfe8da;
          border-radius: 14px;
          background: #eaf0e5;
          color: #2f6b45;
        }

        .order-upload-box strong {
          color: #354638;
          font-size: 12px;
        }

        .order-upload-box > span:not(.order-upload-icon):not(.order-upload-button) {
          color: #92938b;
          font-size: 10px;
          line-height: 1.8;
        }

        .order-upload-box input {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          clip-path: inset(50%);
        }

        .order-upload-box input:focus-visible + .order-upload-button {
          outline: 2px solid #2f6b45;
          outline-offset: 3px;
        }

        .order-upload-button {
          margin-top: 3px;
          padding: 10px 15px;
          border: 1px solid #d9e1d7;
          border-radius: 10px;
          background: #fff;
          color: #2f6b45;
          font-size: 10px;
          font-weight: 700;
        }

        .order-selected-files {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 15px;
          padding: 14px;
          border: 1px solid #e6e8df;
          border-radius: 12px;
          background: #fbfcf8;
        }

        .order-selected-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 9px;
          border-bottom: 1px solid #e9ece3;
        }

        .order-selected-heading strong {
          color: #354638;
          font-size: 11px;
        }

        .order-selected-heading > span {
          color: #2f6b45;
          font-size: 10px;
        }

        .order-file-name {
          display: flex;
          gap: 8px;
          min-width: 0;
          color: #6d766a;
          font-size: 11px;
          line-height: 1.7;
        }

        .order-file-symbol {
          color: #8a6a4a;
        }

        .order-file-name span:last-child {
          overflow-wrap: anywhere;
        }

        .order-payment-options {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .order-payment-option {
          position: relative;
          display: block;
          cursor: pointer;
        }

        .order-payment-option > input {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        .order-payment-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          height: 100%;
          min-height: 150px;
          box-sizing: border-box;
          padding: 17px;
          border: 1px solid #e4e3da;
          border-radius: 14px;
          background: #fdfcf9;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .order-payment-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .order-payment-symbol {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 29px;
          height: 29px;
          border: 1px solid #e7e1d5;
          border-radius: 9px;
          color: #8a6a4a;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 10px;
        }

        .order-payment-check {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 21px;
          height: 21px;
          border: 1px solid #dddcd3;
          border-radius: 50%;
          color: transparent;
          font-size: 11px;
        }

        .order-payment-option:has(input:checked) .order-payment-card {
          border-color: #729477;
          background: #f2f6ef;
          box-shadow: 0 0 0 2px rgba(47, 107, 69, 0.07);
        }

        .order-payment-option:has(input:checked) .order-payment-check {
          border-color: #2f6b45;
          background: #2f6b45;
          color: #fff;
        }

        .order-payment-option:has(input:focus-visible) .order-payment-card {
          outline: 2px solid #2f6b45;
          outline-offset: 3px;
        }

        .order-payment-title {
          color: #294b32;
          font-size: 13px;
          font-weight: 700;
        }

        .order-payment-description {
          color: #85877f;
          font-size: 10px;
          line-height: 1.8;
        }

        .order-alert {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin: 22px 25px 0;
          padding: 15px 16px;
          border: 1px solid;
          border-radius: 13px;
          font-size: 12px;
          line-height: 1.8;
        }

        .order-alert-symbol {
          display: flex;
          flex: 0 0 25px;
          align-items: center;
          justify-content: center;
          width: 25px;
          height: 25px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.7);
          font-weight: 700;
        }

        .order-alert strong {
          display: block;
          margin-bottom: 4px;
        }

        .order-alert p {
          margin: 0;
          overflow-wrap: anywhere;
        }

        .order-alert-error {
          border-color: #ead2ce;
          background: #fcf4f2;
          color: #8b3930;
        }

        .order-alert-success {
          border-color: #d6e4d2;
          background: #f2f7ef;
          color: #285d38;
        }

        .order-alert-success a {
          display: inline-block;
          margin-top: 8px;
          color: #214d32;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .order-submit-area {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 25px 30px 29px;
          background: #fdfcf9;
        }

        .order-submit-kicker {
          display: block;
          margin-bottom: 8px;
          color: #8a6a4a;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .order-submit-copy strong {
          display: block;
          color: #354638;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          font-weight: 500;
        }

        .order-submit-copy p {
          max-width: 300px;
          margin: 7px 0 0;
          color: #85877f;
          font-size: 10px;
          line-height: 1.8;
        }

        .order-submit-button {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 48px;
          padding: 0 21px;
          border: 1px solid #214d32;
          border-radius: 12px;
          background: #2f6b45;
          color: #fff;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition:
            background 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .order-submit-button:hover:not(:disabled) {
          background: #214d32;
          box-shadow: 0 7px 17px rgba(33, 77, 50, 0.15);
          transform: translateY(-1px);
        }

        .order-submit-button:focus-visible {
          outline: 2px solid #2f6b45;
          outline-offset: 3px;
        }

        .order-submit-button:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .order-submit-button > span:last-child {
          font-size: 17px;
        }

        .order-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: order-spin 0.8s linear infinite;
        }

        .order-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 25px 2px;
          color: #898b81;
          font-size: 10px;
        }

        .order-footer > div {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .order-footer strong {
          color: #687b66;
          font-size: 10px;
          letter-spacing: 1.7px;
        }

        .order-footer-note {
          color: #8a6a4a;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 12px;
          font-style: italic;
        }

        @keyframes order-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .order-page *,
          .order-page *::before,
          .order-page *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (max-width: 600px) {
          .order-topbar-inner {
            width: calc(100% - 30px);
            min-height: 70px;
            gap: 10px;
          }

          .order-brand {
            flex-direction: row;
            gap: 9px;
          }

          .order-brand-logo {
            flex-basis: 40px;
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }

          .order-brand-copy {
            gap: 4px;
          }

          .order-brand-copy strong {
            font-size: 15px;
          }

          .order-brand-copy small {
            font-size: 9px;
          }

          .order-dashboard-link {
            min-height: 40px;
            gap: 7px;
            padding: 0 10px;
            border-radius: 11px;
            font-size: 10px;
          }

          .order-dashboard-link span {
            width: 21px;
            height: 21px;
            border-radius: 7px;
          }

          .order-main {
            padding-top: 22px;
          }

          .order-container {
            width: calc(100% - 30px);
          }

          .order-intro {
            padding: 33px 0 25px;
          }

          .order-eyebrow {
            gap: 7px;
            font-size: 9px;
            letter-spacing: 1.3px;
          }

          .order-intro h1 {
            margin-top: 19px;
            font-size: clamp(36px, 10vw, 47px);
            letter-spacing: -1.3px;
          }

          .order-intro > p {
            font-size: 12px;
            line-height: 1.9;
          }

          .order-intro-note {
            align-items: flex-start;
            font-size: 10px;
          }

          .order-note-icon {
            margin-top: 1px;
          }

          .order-progress {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-top: 24px;
            padding-top: 18px;
          }

          .order-progress-item {
            font-size: 10px;
          }

          .order-form {
            border-radius: 16px;
          }

          .order-form-topline {
            padding: 14px 17px;
            font-size: 8px;
            letter-spacing: 1px;
          }

          .order-form-topline > span:last-child {
            font-size: 9px;
          }

          .order-section {
            padding: 23px 17px 25px;
          }

          .order-section-heading {
            gap: 12px;
            margin-bottom: 21px;
          }

          .order-section-number {
            flex-basis: 35px;
            width: 35px;
            height: 35px;
            border-radius: 11px;
            font-size: 14px;
          }

          .order-section-heading h2 {
            font-size: 20px;
          }

          .order-section-heading p {
            font-size: 10px;
          }

          .order-grid,
          .order-payment-options {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
          }

          .order-field {
            gap: 8px;
          }

          .order-field input,
          .order-field select {
            min-height: 48px;
            font-size: 16px;
          }

          .order-field textarea {
            font-size: 16px;
          }

          .order-field small,
          .order-field-help {
            font-size: 10px;
          }

          .order-field-spaced {
            margin-top: 20px;
          }

          .order-upload-box {
            padding: 25px 12px;
          }

          .order-payment-card {
            min-height: 0;
            padding: 16px;
          }

          .order-alert {
            gap: 10px;
            margin: 18px 15px 0;
            padding: 13px;
            font-size: 11px;
          }

          .order-submit-area {
            align-items: stretch;
            flex-direction: column;
            gap: 20px;
            padding: 22px 17px;
          }

          .order-submit-copy strong {
            font-size: 16px;
          }

          .order-submit-button {
            width: 100%;
            min-height: 49px;
          }

          .order-footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 13px;
            padding: 22px 2px;
          }
        }

        @media (max-width: 360px) {
          .order-container {
            width: calc(100% - 22px);
          }

          .order-topbar-inner {
            width: calc(100% - 22px);
            gap: 7px;
          }

          .order-brand {
            gap: 7px;
          }

          .order-brand-logo {
            flex-basis: 36px;
            width: 36px;
            height: 36px;
          }

          .order-brand-copy strong {
            font-size: 13px;
          }

          .order-brand-copy small {
            max-width: 125px;
            font-size: 8px;
          }

          .order-dashboard-link {
            gap: 5px;
            padding: 0 8px;
            font-size: 9px;
          }

          .order-form-topline {
            gap: 7px;
            padding-right: 12px;
            padding-left: 12px;
          }

          .order-section {
            padding-right: 13px;
            padding-left: 13px;
          }

          .order-submit-area {
            padding-right: 13px;
            padding-left: 13px;
          }
        }
      `}</style>
    </main>
  );
}
