
"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@pajara/supabase";

type Subscription = {
  id: string;
  quota_total: number;
  quota_used: number;
  status: string;
  started_at: string | null;
  expires_at: string | null;
};

export default function SubscriptionDesignRequest() {
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSubscription() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          if (mounted) {
            setError(
              "Sesi Anda tidak ditemukan. Silakan login kembali."
            );
            setLoadingPage(false);
          }
          return;
        }

        const { data, error: queryError } = await supabase
          .from("subscriptions")
          .select(
            "id, quota_total, quota_used, status, started_at, expires_at"
          )
          .eq("customer_id", user.id)
          .eq("status", "active")
          .order("expires_at", { ascending: true });

        if (queryError) {
          throw queryError;
        }

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
        if (mounted) setLoadingPage(false);
      }
    }

    loadSubscription();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!subscription) {
      setError("Paket aktif atau kuota desain tidak tersedia.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const service = String(formData.get("service") || "");
    const designType = String(
      formData.get("design-type") || ""
    ).trim();
    const brief = String(formData.get("brief") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    const deadlineValue = String(
      formData.get("deadline") || ""
    );

    const input = form.elements.namedItem(
      "reference"
    ) as HTMLInputElement | null;

    const files = input?.files
      ? Array.from(input.files)
      : [];

    if (!service || !designType || !brief) {
      setError("Lengkapi layanan, jenis desain, dan brief.");
      return;
    }

    if (files.length > 5) {
      setError("Maksimal 5 file referensi.");
      return;
    }

    const maxFileSize = 10 * 1024 * 1024;

    for (const file of files) {
      const allowed =
        file.type.startsWith("image/") ||
        file.type === "application/pdf";

      if (!allowed) {
        setError(
          `File "${file.name}" harus berupa gambar atau PDF.`
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

    setLoading(true);
    setError("");
    setSuccess("");

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

      // Pastikan paket masih aktif sebelum mengirim.
      const { data: latest, error: checkError } =
        await supabase
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

      const deadline = deadlineValue
        ? new Date(
            `${deadlineValue}T23:59:59`
          ).toISOString()
        : null;

      // Order dan subscription request dibuat oleh satu RPC.
      // Trigger database tetap mengatur pemotongan kuota.
      const { data, error: rpcError } = await supabase.rpc(
        "create_subscription_design_request",
        {
          p_subscription_id: subscription.id,
          p_service_name: service,
          p_design_type: designType,
          p_brief: brief,
          p_notes: notes || null,
          p_deadline: deadline,
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

      for (const file of files) {
        const safeFileName = file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

        const filePath =
          `orders/${result.created_order_id}/reference/` +
          `${crypto.randomUUID()}-${safeFileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("pajara-files")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
              contentType:
                file.type || "application/octet-stream",
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
            file_type:
              file.type || "application/octet-stream",
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

      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : requestCreated
            ? "Pesanan sudah dibuat, tetapi ada masalah saat mengunggah referensi. Jangan kirim ulang request."
            : "Gagal membuat request desain."
      );
    } finally {
      setLoading(false);
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
            <a href="/subscriptions">Paket Desain</a>
          </nav>
        </div>
      </header>

      <section className="pajara-order">
        <div className="pajara-container">
          <div className="pajara-order-header">
            <p className="pajara-eyebrow">
              Pajara Subscription
            </p>

            <h1>
              Pesan desain dengan <span>paket Anda.</span>
            </h1>

            <p>
              Satu request menggunakan satu kuota output desain.
              Tidak ada pembayaran tambahan untuk request paket.
            </p>
          </div>

          {loadingPage ? (
            <p>Memeriksa paket dan kuota...</p>
          ) : subscription ? (
            <div
              style={{
                padding: "18px",
                marginBottom: "22px",
                borderRadius: "16px",
                background: "#eaf3eb",
                border: "1px solid #d5e5d7",
                color: "#214d32",
              }}
            >
              <strong>Paket aktif</strong>
              <p style={{ margin: "8px 0" }}>
                Sisa kuota:{" "}
                {Math.max(
                  0,
                  subscription.quota_total -
                    subscription.quota_used
                )}{" "}
                desain
              </p>
              <p style={{ margin: 0, fontSize: "13px" }}>
                Berlaku sampai {formatDate(subscription.expires_at)}
              </p>
            </div>
          ) : (
            <div
              style={{
                padding: "18px",
                marginBottom: "22px",
                borderRadius: "16px",
                background: "#f5f0e8",
                color: "#624c34",
              }}
            >
              <strong>Tidak ada paket dengan kuota tersedia.</strong>
              <p>
                Aktifkan paket atau periksa sisa kuota Anda sebelum
                membuat request.
              </p>
              <a href="/subscriptions">Lihat Paket Desain</a>
            </div>
          )}

          <form
            className="pajara-order-form"
            onSubmit={handleSubmit}
          >
            <div className="pajara-form-section">
              <div className="pajara-form-section-heading">
                <span>01</span>
                <div>
                  <h2>Detail Desain</h2>
                  <p>Pilih kebutuhan untuk satu output desain.</p>
                </div>
              </div>

              <div className="pajara-form-grid">
                <div className="pajara-form-field">
                  <label htmlFor="service">Layanan</label>
                  <select id="service" name="service" required>
                    <option value="">Pilih layanan</option>
                    <option value="Logo & Branding">
                      Logo & Branding
                    </option>
                    <option value="Desain Promosi">
                      Desain Promosi
                    </option>
                    <option value="Social Media">
                      Social Media
                    </option>
                    <option value="Banner">Banner</option>
                    <option value="Kemasan & Menu">
                      Kemasan & Menu
                    </option>
                  </select>
                </div>

                <div className="pajara-form-field">
                  <label htmlFor="design-type">Jenis Desain</label>
                  <input
                    id="design-type"
                    name="design-type"
                    placeholder="Contoh: Feed Instagram"
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
                    min={new Date().toLocaleDateString("en-CA")}
                  />
                </div>
              </div>
            </div>

            <div className="pajara-form-section">
              <div className="pajara-form-section-heading">
                <span>02</span>
                <div>
                  <h2>Brief Desain</h2>
                  <p>Jelaskan detail kebutuhan desain Anda.</p>
                </div>
              </div>

              <div className="pajara-form-field">
                <label htmlFor="brief">Brief Desain</label>
                <textarea
                  id="brief"
                  name="brief"
                  rows={7}
                  placeholder="Tuliskan konsep, isi teks, ukuran, warna, target audiens, dan informasi penting."
                  required
                />
              </div>

              <div className="pajara-form-field">
                <label htmlFor="notes">Catatan Tambahan</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="Catatan khusus jika ada."
                />
              </div>
            </div>

            <div className="pajara-form-section">
              <div className="pajara-form-section-heading">
                <span>03</span>
                <div>
                  <h2>Referensi Desain</h2>
                  <p>Tambahkan gambar atau PDF pendukung.</p>
                </div>
              </div>

              <div className="pajara-form-field">
                <label htmlFor="reference">
                  File Referensi (opsional)
                </label>
                <input
                  id="reference"
                  name="reference"
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                />
                <p className="pajara-form-help">
                  Maksimal 5 file, masing-masing 10 MB.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  marginTop: "20px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "rgba(160,50,50,0.07)",
                  border: "1px solid rgba(160,50,50,0.15)",
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
                role="status"
                style={{
                  marginTop: "20px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "rgba(47,107,69,0.07)",
                  border: "1px solid #d5e5d7",
                  color: "#214d32",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                {success}
                <p>
                  <a href="/dashboard">Kembali ke Dashboard</a>
                </p>
              </div>
            )}

            <div className="pajara-order-submit">
              <div>
                <strong>Gunakan satu kuota desain</strong>
                <p>
                  Pastikan brief sudah benar sebelum dikirim.
                </p>
              </div>

              <button
                type="submit"
                className="pajara-button pajara-button-primary"
                disabled={
                  loadingPage || loading || !subscription
                }
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Mengirim..." : "Kirim Request"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
