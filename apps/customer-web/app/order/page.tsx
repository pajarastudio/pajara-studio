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

  if (!Number.isInteger(quantity) || quantity < 1) {
    setError("Jumlah desain minimal 1.");
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
      setError(
        `File "${file.name}" melebihi batas 10 MB.`
      );
      return;
    }
  }

  const orderCode = `PJ-${Date.now().toString().slice(-8)}`;

  let deadline: string | null = null;

  if (deadlineValue) {
    const selectedDate = new Date(
      `${deadlineValue}T12:00:00`
    );

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
      insertError?.message || "Pesanan gagal dibuat. Silakan coba kembali."
    );
    return;
  }

  let uploadedCount = 0;

  for (const file of referenceFiles) {
    const safeFileName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

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
<span>
<strong>Pajara Studio</strong>
<small>Berakar di Tanah Pasundan.</small>
</span>
</Link>

      <Link href="/dashboard" className="order-dashboard-link">
        Dashboard
      </Link>
    </div>
  </header>

  <section className="order-main">
    <div className="order-container">
      <Link href="/dashboard" className="order-back-link">
        <span aria-hidden="true">←</span>
        <span>Kembali ke Home</span>
      </Link>

      <div className="order-intro">
        <div className="order-eyebrow">
          <span className="order-eyebrow-dot" />
          PAJARA STUDIO · ORDER FORM
        </div>

        <h1>
          Wujudkan ide,
          <br />
          <span>mulai dari sini.</span>
        </h1>

        <p>
          Ceritakan kebutuhan desain Kang/Teh kepada kami.
          Semakin jelas brief yang diberikan, semakin mudah
          bagi tim Pajara memahami arah desain yang diinginkan.
        </p>

        <div className="order-intro-note">
          <span aria-hidden="true">✳</span>
          <span>Isi detail pesanan dengan teliti sebelum dikirim.</span>
        </div>
      </div>

      <form className="order-form" onSubmit={handleSubmit}>
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
              <small>Masukkan jumlah output desain yang dibutuhkan.</small>
            </div>

            <div className="order-field">
              <label htmlFor="deadline">Target selesai</label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                min={new Date().toLocaleDateString("en-CA")}
              />
              <small>Deadline akan menjadi acuan pengerjaan.</small>
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
              Tuliskan informasi selengkap mungkin agar kebutuhan desain
              lebih mudah dipahami.
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
              ↑
            </span>
            <strong>Pilih file referensi</strong>
            <span>
              JPG, PNG, WEBP, GIF, atau PDF · Maksimal 10 MB per file
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
              <strong>
                {selectedFiles.length} file dipilih
              </strong>
              {selectedFiles.map((name, index) => (
                <div className="order-file-name" key={`${name}-${index}`}>
                  <span aria-hidden="true">↳</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          )}

          <p className="order-field-help">
            Referensi bersifat opsional. Pastikan file yang diunggah
            sesuai dengan kebutuhan project.
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
            <strong>Pesanan belum selesai diproses</strong>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="order-alert order-alert-success" role="status">
            <strong>Pesanan berhasil dibuat</strong>
            <p>{success}</p>
            <Link href="/orders/list">Lihat daftar pesanan →</Link>
          </div>
        )}

        <div className="order-submit-area">
          <div className="order-submit-copy">
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
        <span>PAJARA STUDIO</span>
        <span>Berakar di Tanah Pasundan.</span>
      </footer>
    </div>
  </section>

  <style jsx>{`
    .order-page {
      min-height: 100vh;
      background: #f7f4ee;
      color: #24372a;
      padding-bottom: 100px;
    }

    .order-topbar {
      background: rgba(255, 255, 255, 0.92);
      border-bottom: 1px solid #e8e4da;
    }

    .order-topbar-inner {
      width: min(100% - 40px, 1040px);
      min-height: 78px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .order-brand {
      display: inline-flex;
      align-items: center;
      gap: 11px;
      color: #214d32;
      text-decoration: none;
      min-width: 0;
    }

    .order-brand-logo {
      width: 43px;
      height: 43px;
      min-width: 43px;
      object-fit: cover;
      border-radius: 12px;
      border: 1px solid #e8e4da;
    }

    .order-brand strong,
    .order-brand small {
      display: block;
    }

    .order-brand strong {
      font-size: 15px;
      letter-spacing: -0.3px;
    }

    .order-brand small {
      margin-top: 3px;
      color: #7b8178;
      font-size: 10px;
    }

    .order-dashboard-link {
      color: #2f6b45;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 15px;
      border: 1px solid #d9e1d7;
      border-radius: 12px;
      white-space: nowrap;
      transition: background 0.2s ease;
    }

    .order-dashboard-link:hover {
      background: #edf2e9;
    }

    .order-main {
      padding: 32px 0 0;
    }

    .order-container {
      width: min(100% - 40px, 760px);
      margin: 0 auto;
    }

    .order-back-link {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: #4c604e;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      padding: 11px 16px;
      border: 1px solid #e2dfd4;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.65);
      transition:
        color 0.2s ease,
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
    }

    .order-back-link span:first-child {
      font-size: 19px;
      line-height: 1;
    }

    .order-back-link:hover {
      color: #214d32;
      background: #fff;
      border-color: #b8cbb8;
      transform: translateX(-2px);
    }

    .order-intro {
      padding: 43px 0 35px;
    }

    .order-eyebrow {
      display: flex;
      align-items: center;
      gap: 9px;
      color: #687b66;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .order-eyebrow-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #2f6b45;
    }

    .order-intro h1 {
      margin: 18px 0 15px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(37px, 7vw, 57px);
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
      max-width: 540px;
      margin: 0;
      color: #73776f;
      font-size: 14px;
      line-height: 1.9;
    }

    .order-intro-note {
      display: flex;
      align-items: center;
      gap: 9px;
      margin-top: 20px;
      color: #687b66;
      font-size: 12px;
      line-height: 1.6;
    }

    .order-intro-note span:first-child {
      color: #8a6a4a;
      font-size: 17px;
    }

    .order-form {
      overflow: hidden;
      background: #fff;
      border: 1px solid #e9e5dc;
      border-radius: 22px;
      box-shadow: 0 14px 40px rgba(36, 55, 42, 0.045);
    }

    .order-section {
      padding: 29px 32px 32px;
      border-bottom: 1px solid #eeeae2;
    }

    .order-section-heading {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      margin-bottom: 25px;
    }

    .order-section-number {
      display: flex;
      flex: 0 0 39px;
      width: 39px;
      height: 39px;
      align-items: center;
      justify-content: center;
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
      font-size: 12px;
      line-height: 1.7;
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
      font-size: 12px;
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
      font-size: 11px;
      line-height: 1.7;
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
      width: 42px;
      height: 42px;
      border-radius: 13px;
      background: #e7eee3;
      color: #2f6b45;
      font-size: 24px;
    }

    .order-upload-box strong {
      color: #354638;
      font-size: 13px;
    }

    .order-upload-box > span:not(.order-upload-icon):not(.order-upload-button) {
      color: #92938b;
      font-size: 11px;
      line-height: 1.6;
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

    .order-upload-button {
      margin-top: 3px;
      padding: 10px 15px;
      border: 1px solid #d9e1d7;
      border-radius: 10px;
      background: #fff;
      color: #2f6b45;
      font-size: 11px;
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

    .order-selected-files > strong {
      color: #354638;
      font-size: 12px;
    }

    .order-file-name {
      display: flex;
      gap: 8px;
      min-width: 0;
      color: #6d766a;
      font-size: 12px;
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
      top: 15px;
      right: 15px;
      accent-color: #2f6b45;
    }

    .order-payment-card {
      display: flex;
      flex-direction: column;
      gap: 9px;
      height: 100%;
      box-sizing: border-box;
      padding: 18px;
      border: 1px solid #e4e3da;
      border-radius: 13px;
      background: #fdfcf9;
      transition:
        border-color 0.2s ease,
        background 0.2s ease;
    }

    .order-payment-option:has(input:checked) .order-payment-card {
      border-color: #729477;
      background: #f2f6ef;
    }

    .order-payment-title {
      padding-right: 20px;
      color: #294b32;
      font-size: 14px;
      font-weight: 700;
    }

    .order-payment-description {
      color: #85877f;
      font-size: 11px;
      line-height: 1.7;
    }

    .order-alert {
      margin: 22px 25px 0;
      padding: 15px 17px;
      border: 1px solid;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.7;
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
      padding: 25px 32px 30px;
      background: #fdfcf9;
    }

    .order-submit-copy strong {
      display: block;
      color: #354638;
      font-size: 13px;
    }

    .order-submit-copy p {
      max-width: 300px;
      margin: 7px 0 0;
      color: #85877f;
      font-size: 11px;
      line-height: 1.7;
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
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition:
        background 0.2s ease,
        transform 0.2s ease;
    }

    .order-submit-button:hover:not(:disabled) {
      background: #214d32;
      transform: translateY(-1px);
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
      justify-content: space-between;
      gap: 12px;
      padding: 25px 2px;
      color: #898b81;
      font-size: 10px;
    }

    .order-footer span:first-child {
      color: #687b66;
      font-weight: 700;
      letter-spacing: 1.7px;
    }

    @keyframes order-spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 600px) {
      .order-topbar-inner {
        width: calc(100% - 32px);
        min-height: 70px;
      }

      .order-brand-logo {
        width: 39px;
        height: 39px;
        min-width: 39px;
      }

      .order-brand strong {
        font-size: 13px;
      }

      .order-brand small {
        font-size: 9px;
      }

      .order-dashboard-link {
        padding: 9px 11px;
        font-size: 11px;
      }

      .order-main {
        padding-top: 23px;
      }

      .order-container {
        width: calc(100% - 30px);
      }

      .order-intro {
        padding: 34px 0 27px;
      }

      .order-intro h1 {
        font-size: clamp(36px, 10vw, 47px);
        letter-spacing: -1.3px;
      }

      .order-intro > p {
        font-size: 13px;
      }

      .order-form {
        border-radius: 17px;
      }

      .order-section {
        padding: 23px 18px 25px;
      }

      .order-section-heading {
        gap: 12px;
        margin-bottom: 22px;
      }

      .order-section-number {
        flex-basis: 35px;
        width: 35px;
        height: 35px;
      }

      .order-section-heading h2 {
        font-size: 20px;
      }

      .order-grid,
      .order-payment-options {
        grid-template-columns: minmax(0, 1fr);
        gap: 18px;
      }

      .order-field input,
      .order-field select {
        min-height: 48px;
        font-size: 16px;
      }

      .order-field textarea {
        font-size: 16px;
      }

      .order-submit-area {
        align-items: stretch;
        flex-direction: column;
        padding: 23px 18px;
      }

      .order-submit-button {
        width: 100%;
        min-height: 49px;
      }

      .order-alert {
        margin-right: 18px;
        margin-left: 18px;
      }

      .order-footer {
        flex-direction: column;
        gap: 7px;
      }
    }
  `}</style>
</main>

);
}
