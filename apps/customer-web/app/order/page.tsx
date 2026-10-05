"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@pajara/supabase";

export default function CreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
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
        setError(
          "Sesi Anda tidak ditemukan. Silakan login kembali."
        );
        setLoading(false);
        return;
      }

      const formData = new FormData(form);

      const service = String(
        formData.get("service") || ""
      );

      const designType = String(
        formData.get("design-type") || ""
      );

      const quantity = Number(
        formData.get("quantity") || 1
      );

      const deadlineValue = String(
        formData.get("deadline") || ""
      );

      const brief = String(
        formData.get("brief") || ""
      );

      const notes = String(
        formData.get("notes") || ""
      );

      const paymentType = String(
        formData.get("payment-type") || ""
      );

      if (!service) {
        setError("Silakan pilih layanan.");
        setLoading(false);
        return;
      }

      if (!designType) {
        setError("Silakan isi jenis desain.");
        setLoading(false);
        return;
      }

      if (!brief) {
        setError("Silakan isi brief desain.");
        setLoading(false);
        return;
      }

      if (!paymentType) {
        setError("Silakan pilih pembayaran.");
        setLoading(false);
        return;
      }

      if (!Number.isFinite(quantity) || quantity < 1) {
        setError("Jumlah desain minimal 1.");
        setLoading(false);
        return;
      }

      const orderCode = `PJ-${Date.now()
        .toString()
        .slice(-8)}`;

      const deadline = deadlineValue
        ? new Date(
            `${deadlineValue}T23:59:59`
          ).toISOString()
        : null;

      // Harga akan kita hubungkan ke sistem layanan/payment
      // pada tahap berikutnya.
      const totalAmount = 0;
      const dpAmount = 0;
      const remainingAmount = 0;

      const { error: insertError } =
        await supabase
          .from("orders")
          .insert({
            order_code: orderCode,
            customer: user.id,
            service_id: null,
            "service name": service,
            "design type": designType,
            quantity,
            brief,
            notes,
            "total amount": totalAmount,
            dp_amount: dpAmount,
            "remaining amount": remainingAmount,
            status: "pending",
            deadline,
            assigned_admin: null,
            "created at":
              new Date().toISOString(),
            updated_at:
              new Date().toISOString(),
          });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      setSuccess(
        `Pesanan ${orderCode} berhasil dibuat.`
      );

      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat pesanan."
      );
    }

    setLoading(false);
  };

  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a
            href="/"
            className="pajara-brand"
          >
            <img
              src="/755809946_17926162029385149_3739923509439876817_n.jpg"
              alt="Pajara Studio"
              className="pajara-brand-logo"
            />

            <span>Pajara Studio</span>
          </a>

          <nav className="pajara-nav">
            <a href="/dashboard">
              Dashboard
            </a>

            <a
              href="/"
              className="pajara-nav-cta"
            >
              Website
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-order">
        <div className="pajara-container">
          <div className="pajara-order-header">
            <p className="pajara-eyebrow">
              Pesan Desain
            </p>

            <h1>
              Mulai project bersama{" "}
              <span>Pajara.</span>
            </h1>

            <p>
              Isi brief berikut dengan informasi
              yang jelas agar Pajara dapat memahami
              kebutuhan desain Anda.
            </p>
          </div>

          <form
            className="pajara-order-form"
            onSubmit={handleSubmit}
          >
            <div className="pajara-form-section">
              <div className="pajara-form-section-heading">
                <span>01</span>

                <div>
                  <h2>Detail Pesanan</h2>

                  <p>
                    Tentukan layanan dan kebutuhan
                    utama project Anda.
                  </p>
                </div>
              </div>

              <div className="pajara-form-grid">
                <div className="pajara-form-field">
                  <label htmlFor="service">
                    Layanan
                  </label>

                  <select
                    id="service"
                    name="service"
                    required
                  >
                    <option value="">
                      Pilih layanan
                    </option>

                    <option value="Logo & Branding">
                      Logo & Branding
                    </option>

                    <option value="Desain Promosi">
                      Desain Promosi
                    </option>

                    <option value="Social Media">
                      Social Media
                    </option>

                    <option value="Banner">
                      Banner
                    </option>

                    <option value="Kemasan & Menu">
                      Kemasan & Menu
                    </option>
                  </select>
                </div>

                <div className="pajara-form-field">
                  <label htmlFor="design-type">
                    Jenis Desain
                  </label>

                  <input
                    id="design-type"
                    name="design-type"
                    type="text"
                    placeholder="Contoh: Feed Instagram"
                    required
                  />
                </div>

                <div className="pajara-form-field">
                  <label htmlFor="quantity">
                    Jumlah Desain
                  </label>

                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue="1"
                    required
                  />
                </div>

                <div className="pajara-form-field">
                  <label htmlFor="deadline">
                    Deadline / Target Selesai
                  </label>

                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                  />
                </div>
              </div>
            </div>

            <div className="pajara-form-section">
              <div className="pajara-form-section-heading">
                <span>02</span>

                <div>
                  <h2>Brief Desain</h2>

                  <p>
                    Jelaskan konsep dan informasi
                    yang perlu diketahui Pajara.
                  </p>
                </div>
              </div>

              <div className="pajara-form-field">
                <label htmlFor="brief">
                  Brief Desain
                </label>

                <textarea
                  id="brief"
                  name="brief"
                  rows={7}
                  placeholder="Jelaskan kebutuhan desain, isi teks, ukuran, konsep, target audiens, dan informasi penting lainnya."
                  required
                />
              </div>

              <div className="pajara-form-field">
                <label htmlFor="notes">
                  Catatan Tambahan
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows={5}
                  placeholder="Tambahkan catatan atau permintaan khusus jika ada."
                />
              </div>
            </div>

            <div className="pajara-form-section">
              <div className="pajara-form-section-heading">
                <span>03</span>

                <div>
                  <h2>Referensi</h2>

                  <p>
                    Tambahkan contoh visual jika
                    tersedia.
                  </p>
                </div>
              </div>

              <div className="pajara-form-field">
                <label htmlFor="reference">
                  Referensi Desain
                </label>

                <input
                  id="reference"
                  name="reference"
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                />

                <p className="pajara-form-help">
                  Upload referensi atau contoh desain
                  yang dapat membantu menjelaskan
                  kebutuhan Anda.
                </p>
              </div>
            </div>

            <div className="pajara-form-section">
              <div className="pajara-form-section-heading">
                <span>04</span>

                <div>
                  <h2>Pembayaran</h2>

                  <p>
                    Pilih skema pembayaran untuk
                    project Anda.
                  </p>
                </div>
              </div>

              <div className="pajara-form-field">
                <label htmlFor="payment-type">
                  Pembayaran
                </label>

                <select
                  id="payment-type"
                  name="payment-type"
                  required
                >
                  <option value="">
                    Pilih metode pembayaran
                  </option>

                  <option value="dp">
                    DP
                  </option>

                  <option value="full">
                    Full / Lunas
                  </option>
                </select>
              </div>
            </div>

            {error && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background:
                    "rgba(160, 50, 50, 0.07)",
                  border:
                    "1px solid rgba(160, 50, 50, 0.15)",
                  color: "#8b3030",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background:
                    "rgba(47, 107, 69, 0.07)",
                  border:
                    "1px solid var(--line)",
                  color:
                    "var(--green-dark)",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                {success}
              </div>
            )}

            <div className="pajara-order-submit">
              <div>
                <strong>
                  Siap mengirim pesanan?
                </strong>

                <p>
                  Pastikan informasi yang Anda
                  masukkan sudah sesuai sebelum
                  dikirim.
                </p>
              </div>

              <button
                type="submit"
                className="pajara-button pajara-button-primary"
                disabled={loading}
                style={{
                  opacity:
                    loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? "Mengirim..."
                  : "Kirim Pesanan"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
