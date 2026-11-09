
"use client";

import { Suspense, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@pajara/supabase";
import CustomerLoading from "../../components/CustomerLoading";

type Subscription = {
  id: string;
  customer_id: string;
  plan_id: string;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  quota_total: number;
  quota_used: number;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  quota_total: number;
};

type PaymentMethod = "QRIS" | "DANA" | "GoPay" | "SeaBank";

const LOGO =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

function DashboardNavbar() {
  return (
    <header className="payment-navbar">
      <div className="payment-navbar-inner">
        <Link href="/dashboard" className="payment-brand">
          <img
            src={LOGO}
            alt="Logo Pajara Studio"
            className="payment-brand-logo"
          />

          <span className="payment-brand-copy">
            <strong>Pajara Studio</strong>
            <span>Berakar di Tanah Pasundan.</span>
          </span>
        </Link>

        <Link href="/dashboard" className="payment-dashboard-link">
          <span>Dashboard</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}

function PajaraFooter() {
  return (
    <footer className="payment-footer">
      <img
        src={LOGO}
        alt="Logo Pajara Studio"
        className="payment-footer-logo"
      />

      <div className="payment-footer-copy">
        <strong>Pajara Studio</strong>
        <span>Berakar di Tanah Pasundan.</span>
        <small>© 2026 Pajara Studio. Desain yang punya arah.</small>
      </div>
    </footer>
  );
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscription");

  const [subscription, setSubscription] =
    useState<Subscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("QRIS");
  const [transactionId, setTransactionId] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadSubscription();
  }, [subscriptionId]);

  async function loadSubscription() {
    setLoading(true);
    setError("");

    if (!subscriptionId) {
      setError("Data pembelian paket tidak ditemukan.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }

    const { data: subscriptionData, error: subscriptionError } =
      await supabase
        .from("subscriptions")
        .select(
          "id, customer_id, plan_id, status, started_at, expires_at, quota_total, quota_used"
        )
        .eq("id", subscriptionId)
        .eq("customer_id", user.id)
        .maybeSingle();

    if (subscriptionError) {
      console.error(subscriptionError);
      setError("Data pembelian paket gagal dimuat.");
      setLoading(false);
      return;
    }

    if (!subscriptionData) {
      setError("Pembelian paket tidak ditemukan.");
      setLoading(false);
      return;
    }

    if (subscriptionData.status !== "pending") {
      setError(
        "Pembelian paket ini sudah tidak menunggu pembayaran."
      );
      setLoading(false);
      return;
    }

    const { data: planData, error: planError } = await supabase
      .from("subscription_plans")
      .select(
        "id, name, description, price, duration_days, quota_total"
      )
      .eq("id", subscriptionData.plan_id)
      .maybeSingle();

    if (planError) {
      console.error(planError);
      setError("Informasi paket gagal dimuat.");
      setLoading(false);
      return;
    }

    if (!planData) {
      setError("Informasi paket tidak ditemukan.");
      setLoading(false);
      return;
    }

    setSubscription(subscriptionData);
    setPlan(planData);
    setLoading(false);
  }

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    const file = event.target.files?.[0] || null;

    if (!file) {
      setProofFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Format bukti pembayaran harus JPG, PNG, WEBP, atau PDF."
      );
      event.target.value = "";
      setProofFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran bukti pembayaran maksimal 10 MB.");
      event.target.value = "";
      setProofFile(null);
      return;
    }

    setProofFile(file);
  }

  async function submitPayment() {
    setError("");
    setSuccess("");

    if (!subscription || !plan) {
      setError("Data paket belum siap.");
      return;
    }

    if (!proofFile) {
      setError("Silakan upload bukti pembayaran terlebih dahulu.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Silakan login terlebih dahulu.");
      return;
    }

    if (user.id !== subscription.customer_id) {
      setError("Akses pembelian paket tidak valid.");
      return;
    }

    setSubmitting(true);

    let paymentId: string | null = null;
    let uploadedStoragePath: string | null = null;
    let paymentFileId: string | null = null;

    try {
      const { data: paymentData, error: paymentError } =
        await supabase
          .from("subscription_payments")
          .insert({
            subscription_id: subscription.id,
            customer_id: user.id,
            amount: plan.price,
            payment_method: paymentMethod,
            transaction_id: transactionId.trim() || null,
            status: "pending",
          })
          .select("id")
          .single();

      if (paymentError) {
        console.error(paymentError);
        throw new Error(
          paymentError.message || "Gagal membuat data pembayaran."
        );
      }

      paymentId = paymentData.id;

      const safeFileName = proofFile.name
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-");

      const storagePath = `subscriptions/${subscription.id}/payment-proof/${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("pajara-files")
        .upload(storagePath, proofFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: proofFile.type,
        });

      if (uploadError) {
        console.error(uploadError);
        throw new Error(
          uploadError.message ||
            "Gagal mengupload bukti pembayaran."
        );
      }

      uploadedStoragePath = storagePath;

      const { data: paymentFileData, error: paymentFileError } =
        await supabase
          .from("subscription_payment_files")
          .insert({
            subscription_payment_id: paymentId,
            customer_id: user.id,
            file_name: proofFile.name,
            storage_path: storagePath,
            mime_type: proofFile.type,
            file_size: proofFile.size,
          })
          .select("id")
          .single();

      if (paymentFileError) {
        console.error(paymentFileError);
        throw new Error(
          paymentFileError.message ||
            "Gagal menyimpan data bukti pembayaran."
        );
      }

      paymentFileId = paymentFileData.id;

      setSuccess(
        "Bukti pembayaran berhasil dikirim. Pembayaran akan diverifikasi oleh Admin."
      );
      setProofFile(null);
      setTransactionId("");

      window.setTimeout(() => {
        router.push("/subscriptions");
      }, 2500);
    } catch (err) {
      console.error(err);

      if (paymentFileId) {
        await supabase
          .from("subscription_payment_files")
          .delete()
          .eq("id", paymentFileId);
      }

      if (uploadedStoragePath) {
        await supabase.storage
          .from("pajara-files")
          .remove([uploadedStoragePath]);
      }

      if (paymentId) {
        await supabase
          .from("subscription_payments")
          .delete()
          .eq("id", paymentId);
      }

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengirim pembayaran."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <CustomerLoading
        title="Menyiapkan Pembayaran"
        description="Sebentar, kami sedang menyiapkan halaman pembayaran paket Kang/Teh."
      />
    );
  }

  if (!subscription || !plan) {
    return (
      <main className="payment-page">
        <DashboardNavbar />

        <div className="payment-container">
          <div className="payment-breadcrumb">
            <Link href="/dashboard">Dashboard</Link>
            <span>/</span>
            <Link href="/subscriptions">Paket</Link>
            <span>/</span>
            <span>Pembayaran</span>
          </div>

          <section className="payment-error-card">
            <div className="payment-eyebrow">
              <span className="payment-eyebrow-dot" />
              PAJARA STUDIO · PEMBAYARAN
            </div>

            <h1>Pembayaran Paket</h1>

            <div className="payment-alert payment-alert-error">
              <span className="payment-alert-symbol">!</span>
              <span>{error}</span>
            </div>

            <Link
              href="/subscriptions"
              className="payment-primary-button"
            >
              Lihat Pilihan Paket <span>↗</span>
            </Link>
          </section>

          <PajaraFooter />
        </div>

        <PaymentStyles />
      </main>
    );
  }

  return (
    <main className="payment-page">
      <DashboardNavbar />

      <div className="payment-container">
        <div className="payment-breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link href="/subscriptions">Paket</Link>
          <span>/</span>
          <span>Pembayaran</span>
        </div>

        <section className="payment-intro">
          <div className="payment-eyebrow">
            <span className="payment-eyebrow-dot" />
            PAJARA STUDIO · SUBSCRIPTION
          </div>

          <h1>
            Selesaikan
            <br />
            <span>perjalanan paket Anda.</span>
          </h1>

          <p>
            Satu langkah lagi untuk memulai perjalanan kreatif bersama
            Pajara Studio. Silakan periksa detail paket dan selesaikan
            pembayaran Anda.
          </p>

          <div className="payment-intro-note">
            <span aria-hidden="true">✳</span>
            Desain yang punya arah.
          </div>
        </section>

        <section className="payment-card">
          <div className="payment-section-heading">
            <div>
              <span className="payment-section-number">
                01 / DETAIL PAKET
              </span>
              <h2>{plan.name}</h2>
              <p>Periksa kembali informasi paket pilihan Anda.</p>
            </div>
          </div>

          {plan.description && (
            <p className="payment-plan-description">
              {plan.description}
            </p>
          )}

          <div className="payment-plan-grid">
            <div className="payment-plan-item">
              <span>Harga Paket</span>
              <strong>{formatRupiah(plan.price)}</strong>
            </div>

            <div className="payment-plan-item">
              <span>Masa Aktif</span>
              <strong>{plan.duration_days} hari</strong>
            </div>

            <div className="payment-plan-item">
              <span>Kuota Desain</span>
              <strong>{plan.quota_total} desain</strong>
            </div>
          </div>

          <div className="payment-info-note">
            Pembayaran paket dilakukan <strong>100% di awal</strong>.
            Setelah pembayaran diverifikasi Admin, paket akan aktif.
          </div>

          <div className="payment-divider" />

          <div className="payment-section-heading">
            <div>
              <span className="payment-section-number">
                02 / METODE PEMBAYARAN
              </span>
              <h2>Pilih metode pembayaran</h2>
              <p>
                Gunakan salah satu metode pembayaran yang tersedia.
              </p>
            </div>
          </div>

          <div className="payment-method-grid">
            {(
              ["QRIS", "DANA", "GoPay", "SeaBank"] as PaymentMethod[]
            ).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => {
                  setPaymentMethod(method);
                  setError("");
                }}
                className={`payment-method-option ${
                  paymentMethod === method ? "is-selected" : ""
                }`}
              >
                <span className="payment-method-radio" />
                <span className="payment-method-copy">
                  <strong>{method}</strong>
                  <small>
                    {method === "QRIS"
                      ? "Pembayaran melalui kode QR."
                      : method === "SeaBank"
                        ? "Transfer melalui rekening bank."
                        : "Pembayaran melalui e-wallet."}
                  </small>
                </span>
              </button>
            ))}
          </div>

          {paymentMethod === "QRIS" && (
            <div className="payment-instruction">
              <div className="payment-instruction-heading">
                <span className="payment-section-number">
                  INSTRUKSI PEMBAYARAN
                </span>
                <h3>Scan QRIS Pajara Studio</h3>
                <p>
                  Pindai kode QR berikut melalui aplikasi pembayaran
                  yang mendukung QRIS.
                </p>
              </div>

              <img
                src="/qr_ID1026470184411_08.10.26_1791447334_1791447334905.jpeg"
                alt="QRIS Pajara Studio"
                className="payment-qris-image"
              />

              <p className="payment-instruction-note">
                Pastikan nominal pembayaran sesuai dengan harga paket.
              </p>
            </div>
          )}

          {(paymentMethod === "DANA" ||
            paymentMethod === "GoPay") && (
            <div className="payment-instruction">
              <span className="payment-section-number">
                INSTRUKSI PEMBAYARAN
              </span>
              <h3>{paymentMethod}</h3>
              <div className="payment-account-number">
                0858-8242-1145
              </div>
              <p className="payment-account-name">A/N TUTI</p>
            </div>
          )}

          {paymentMethod === "SeaBank" && (
            <div className="payment-instruction">
              <span className="payment-section-number">
                INSTRUKSI PEMBAYARAN
              </span>
              <h3>SeaBank</h3>
              <div className="payment-account-number">
                901052450932
              </div>
              <p className="payment-account-name">A/N TUTI</p>
            </div>
          )}

          <div className="payment-divider" />

          <div className="payment-section-heading">
            <div>
              <span className="payment-section-number">
                03 / KONFIRMASI
              </span>
              <h2>Konfirmasi pembayaran</h2>
              <p>
                Lengkapi informasi berikut setelah melakukan pembayaran.
              </p>
            </div>
          </div>

          <div className="payment-field">
            <label htmlFor="transaction-id">
              ID Transaksi
              <span className="payment-optional">(opsional)</span>
            </label>

            <input
              id="transaction-id"
              type="text"
              value={transactionId}
              onChange={(event) =>
                setTransactionId(event.target.value)
              }
              placeholder="Masukkan ID transaksi jika ada"
            />
          </div>

          <div className="payment-field">
            <label htmlFor="proof-file">
              Bukti Pembayaran <span>*</span>
            </label>

            <label htmlFor="proof-file" className="payment-upload-area">
              <span className="payment-upload-icon">↑</span>
              <strong>Pilih bukti pembayaran</strong>
              <span>
                Tekan untuk memilih gambar atau PDF dari perangkat Anda.
              </span>
              <small>
                JPG, PNG, WEBP, atau PDF · Maks. 10 MB
              </small>
            </label>

            <input
              id="proof-file"
              className="payment-file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
            />

            {proofFile && (
              <div className="payment-selected-file">
                <span className="payment-file-icon">↗</span>
                <span className="payment-file-info">
                  <strong>{proofFile.name}</strong>
                  <small>
                    {(proofFile.size / (1024 * 1024)).toFixed(2)} MB
                  </small>
                </span>
                <button
                  type="button"
                  className="payment-remove-file"
                  aria-label="Hapus bukti pembayaran"
                  onClick={() => {
                    setProofFile(null);
                    const input = document.getElementById(
                      "proof-file"
                    ) as HTMLInputElement | null;
                    if (input) input.value = "";
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="payment-alert payment-alert-error">
              <span className="payment-alert-symbol">!</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="payment-alert payment-alert-success">
              <span className="payment-alert-symbol">✓</span>
              <span>{success}</span>
            </div>
          )}

          <div className="payment-submit-area">
            <p>
              Pastikan bukti pembayaran yang dikirim sudah benar.
              Admin akan memeriksa pembayaran sebelum paket diaktifkan.
            </p>

            <button
              type="button"
              onClick={submitPayment}
              disabled={submitting || !!success}
              className="payment-submit-button"
            >
              {submitting ? (
                <>
                  <span className="payment-spinner" />
                  Mengirim pembayaran...
                </>
              ) : (
                <>
                  Kirim Bukti Pembayaran
                  <span aria-hidden="true">↗</span>
                </>
              )}
            </button>
          </div>
        </section>

        <PajaraFooter />
      </div>

      <PaymentStyles />
    </main>
  );
}

function PaymentStyles() {
  return (
    <style jsx global>{`
      .payment-page {
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

      .payment-page *,
      .payment-error-card * {
        box-sizing: border-box;
      }

      .payment-navbar {
        position: relative;
        z-index: 10;
        width: 100%;
        background: #fff;
        border-bottom: 1px solid #e9e7df;
        box-shadow: 0 4px 20px rgba(33, 77, 50, 0.035);
      }

      .payment-navbar-inner {
        width: min(1120px, calc(100% - 24px));
        min-height: 74px;
        margin: 0 auto;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .payment-brand {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex: 1 1 auto;
        color: var(--green-dark);
        text-decoration: none;
      }

      .payment-brand-logo {
        display: block;
        width: 40px;
        height: 40px;
        min-width: 40px;
        flex: 0 0 40px;
        object-fit: cover;
        border-radius: 11px;
        border: 1px solid #e6e8df;
        background: #fff;
      }

      .payment-brand-copy {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        min-width: 0;
        flex: 1 1 auto;
        gap: 4px;
        text-align: left;
      }

      .payment-brand-copy strong {
        display: block;
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.3px;
      }

      .payment-brand-copy span {
        display: block;
        color: #85877c;
        font-size: 9px;
        line-height: 1.4;
      }

      .payment-dashboard-link {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
        flex: 0 0 auto;
        min-height: 42px;
        padding: 9px 14px;
        border: 1px solid #d5e2cf;
        border-radius: 13px;
        background: #edf3e9;
        color: var(--green-dark);
        font-size: 12px;
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
        box-shadow: 0 3px 10px rgba(33, 77, 50, 0.08);
        transition:
          background 0.2s ease,
          border-color 0.2s ease,
          transform 0.2s ease;
      }

      .payment-dashboard-link:hover {
        background: #e3eddd;
        border-color: #b9ceb0;
        transform: translateY(-1px);
      }

      .payment-container {
        width: min(850px, calc(100% - 40px));
        margin: 0 auto;
      }

      .payment-breadcrumb {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        padding: 27px 0 20px;
        color: #93948a;
        font-size: 12px;
      }

      .payment-breadcrumb a {
        color: var(--green);
        text-decoration: none;
      }

      .payment-intro {
        padding: 21px 0 32px;
      }

      .payment-eyebrow {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-bottom: 17px;
        color: var(--green);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
      }

      .payment-eyebrow-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--brown);
      }

      .payment-intro h1 {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(35px, 6vw, 54px);
        line-height: 1.12;
        letter-spacing: -1.8px;
        font-weight: 500;
      }

      .payment-intro h1 span {
        color: var(--green);
        font-style: italic;
      }

      .payment-intro > p {
        max-width: 550px;
        margin: 18px 0 0;
        color: #77796f;
        font-size: 14px;
        line-height: 1.9;
      }

      .payment-intro-note {
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

      .payment-intro-note span {
        color: var(--brown);
        font-size: 15px;
      }

      .payment-card,
      .payment-error-card {
        padding: 35px;
        background: #fff;
        border: 1px solid #e9e7df;
        border-radius: 23px;
        box-shadow: 0 15px 55px rgba(42, 48, 34, 0.045);
      }

      .payment-section-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 15px;
        margin-bottom: 24px;
      }

      .payment-section-number {
        display: block;
        margin-bottom: 10px;
        color: var(--brown);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.8px;
      }

      .payment-section-heading h2 {
        margin: 0;
        color: var(--ink);
        font-family: Georgia, "Times New Roman", serif;
        font-size: 28px;
        line-height: 1.25;
        font-weight: 500;
        letter-spacing: -0.5px;
      }

      .payment-section-heading p {
        margin: 9px 0 0;
        color: #83847b;
        font-size: 12px;
        line-height: 1.7;
      }

      .payment-plan-description {
        margin: -8px 0 20px;
        color: #77796f;
        font-size: 13px;
        line-height: 1.8;
      }

      .payment-plan-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .payment-plan-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
        padding: 17px;
        border: 1px solid #eeede7;
        border-radius: 14px;
        background: #f7f4ee;
      }

      .payment-plan-item span {
        color: #77796f;
        font-size: 11px;
      }

      .payment-plan-item strong {
        color: var(--green-dark);
        font-size: 16px;
        line-height: 1.5;
        overflow-wrap: anywhere;
      }

      .payment-info-note {
        margin-top: 16px;
        padding: 15px;
        border: 1px solid #dce8d8;
        border-radius: 13px;
        background: #f3f7f0;
        color: var(--green-dark);
        font-size: 12px;
        line-height: 1.8;
      }

      .payment-divider {
        width: 100%;
        height: 1px;
        margin: 31px 0;
        background: #eeede7;
      }

      .payment-method-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 22px;
      }

      .payment-method-option {
        display: flex;
        align-items: center;
        gap: 11px;
        min-width: 0;
        padding: 15px;
        border: 1px solid #e5e5dc;
        border-radius: 13px;
        background: #fff;
        color: var(--ink);
        text-align: left;
        cursor: pointer;
        transition:
          border-color 0.2s ease,
          background 0.2s ease;
      }

      .payment-method-option.is-selected {
        border-color: #85a98a;
        background: #f3f7f0;
      }

      .payment-method-option:focus-visible {
        outline: 2px solid #80a68a;
        outline-offset: 2px;
      }

      .payment-method-radio {
        display: grid;
        width: 17px;
        height: 17px;
        flex: 0 0 17px;
        place-items: center;
        border: 1px solid #c9cbbf;
        border-radius: 50%;
      }

      .payment-method-option.is-selected .payment-method-radio {
        border: 5px solid var(--green);
      }

      .payment-method-copy {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 0;
      }

      .payment-method-copy strong {
        color: #373d32;
        font-size: 12px;
      }

      .payment-method-copy small {
        color: #87897e;
        font-size: 10px;
        line-height: 1.5;
      }

      .payment-instruction {
        margin-bottom: 20px;
        padding: 23px;
        border: 1px solid #eeede7;
        border-radius: 16px;
        background: #f8f7f2;
      }

      .payment-instruction h3 {
        margin: 0 0 9px;
        color: var(--green-dark);
        font-family: Georgia, "Times New Roman", serif;
        font-size: 22px;
        font-weight: 500;
      }

      .payment-instruction-heading p {
        margin: 0 0 18px;
        color: #85877c;
        font-size: 11px;
        line-height: 1.7;
      }

      .payment-qris-image {
        display: block;
        width: 100%;
        max-width: 340px;
        margin: 0 auto;
        border-radius: 14px;
        background: #fff;
      }

      .payment-instruction-note {
        margin: 15px 0 0;
        color: #77796f;
        font-size: 11px;
        line-height: 1.7;
        text-align: center;
      }

      .payment-account-number {
        color: var(--green-dark);
        font-size: 23px;
        font-weight: 700;
        letter-spacing: 0.5px;
        overflow-wrap: anywhere;
      }

      .payment-account-name {
        margin: 7px 0 0;
        color: #77796f;
        font-size: 12px;
      }

      .payment-field {
        display: flex;
        flex-direction: column;
        gap: 9px;
        margin-bottom: 22px;
      }

      .payment-field > label:first-child {
        color: #373b32;
        font-size: 12px;
        font-weight: 700;
      }

      .payment-field label span:not(.payment-optional) {
        color: #a66b45;
      }

      .payment-optional {
        margin-left: 6px;
        color: #929387;
        font-size: 10px;
        font-weight: 400;
      }

      .payment-field input[type="text"] {
        display: block;
        width: 100%;
        min-width: 0;
        min-height: 49px;
        padding: 14px 15px;
        border: 1px solid #e3e3d9;
        border-radius: 12px;
        outline: none;
        background: #fcfcfa;
        color: #292d25;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 13px;
        line-height: 1.5;
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          background 0.2s ease;
      }

      .payment-field input[type="text"]:focus {
        border-color: #80a68a;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(47, 107, 69, 0.09);
      }

      .payment-field input::placeholder {
        color: #a1a197;
      }

      .payment-upload-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 26px 18px;
        border: 1px dashed #c9d6c1;
        border-radius: 15px;
        background: #f8faf6;
        text-align: center;
        cursor: pointer;
        transition:
          border-color 0.2s ease,
          background 0.2s ease;
      }

      .payment-upload-area:hover {
        border-color: var(--green);
        background: #f1f6ed;
      }

      .payment-upload-icon {
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

      .payment-upload-area strong {
        margin-bottom: 7px;
        color: #344733;
        font-size: 13px;
      }

      .payment-upload-area > span:not(.payment-upload-icon) {
        color: #85877c;
        font-size: 11px;
        line-height: 1.7;
      }

      .payment-upload-area small {
        margin-top: 12px;
        color: #929387;
        font-size: 10px;
        line-height: 1.6;
      }

      .payment-file-input {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        clip-path: inset(50%);
      }

      .payment-file-input:focus-visible + .payment-selected-file {
        outline: 2px solid var(--green);
      }

      .payment-selected-file {
        display: flex;
        align-items: center;
        gap: 11px;
        margin-top: 12px;
        padding: 12px;
        border: 1px solid #e8e8df;
        border-radius: 12px;
        background: #fff;
      }

      .payment-file-icon {
        display: grid;
        width: 35px;
        height: 35px;
        flex: 0 0 35px;
        place-items: center;
        border-radius: 10px;
        background: #edf3e9;
        color: var(--green);
      }

      .payment-file-info {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .payment-file-info strong {
        overflow-wrap: anywhere;
        color: #414439;
        font-size: 11px;
      }

      .payment-file-info small {
        color: #8b8d82;
        font-size: 10px;
      }

      .payment-remove-file {
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

      .payment-alert {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 20px;
        padding: 15px;
        border-radius: 13px;
        font-size: 12px;
        line-height: 1.8;
        overflow-wrap: anywhere;
      }

      .payment-alert-error {
        border: 1px solid #ecd4ca;
        background: #fff6f2;
        color: #884d3b;
      }

      .payment-alert-success {
        border: 1px solid #d3e4cf;
        background: #f2f8ef;
        color: #345d38;
      }

      .payment-alert-symbol {
        display: grid;
        width: 25px;
        height: 25px;
        flex: 0 0 25px;
        place-items: center;
        border-radius: 50%;
        background: rgba(47, 107, 69, 0.1);
        font-weight: 700;
      }

      .payment-submit-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        margin-top: 30px;
        padding-top: 25px;
        border-top: 1px solid #eeede7;
      }

      .payment-submit-area > p {
        max-width: 490px;
        margin: 0;
        color: #87887f;
        font-size: 10px;
        line-height: 1.8;
        text-align: center;
      }

      .payment-submit-button,
      .payment-primary-button {
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
        text-decoration: none;
        cursor: pointer;
        transition:
          background 0.2s ease,
          transform 0.2s ease;
      }

      .payment-submit-button:hover:not(:disabled),
      .payment-primary-button:hover {
        background: var(--green-dark);
        transform: translateY(-1px);
      }

      .payment-submit-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .payment-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: payment-spin 0.8s linear infinite;
      }

      @keyframes payment-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .payment-error-card h1 {
        margin: 0 0 20px;
        color: var(--green-dark);
        font-family: Georgia, "Times New Roman", serif;
        font-size: 34px;
        font-weight: 500;
      }

      .payment-error-card .payment-alert {
        margin-bottom: 20px;
      }

      .payment-footer {
        display: flex;
        align-items: center;
        gap: 13px;
        border-top: 1px solid #e4ddd1;
        padding-top: 22px;
        margin-top: 36px;
      }

      .payment-footer-logo {
        display: block;
        width: 43px;
        height: 43px;
        flex-shrink: 0;
        object-fit: contain;
        border-radius: 10px;
        background: #fff;
      }

      .payment-footer-copy {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .payment-footer-copy strong {
        display: block;
        color: var(--green-dark);
        font-size: 13px;
        line-height: 1.5;
      }

      .payment-footer-copy span {
        color: var(--brown);
        font-size: 11px;
        line-height: 1.5;
      }

      .payment-footer-copy small {
        color: #999387;
        font-size: 10px;
        line-height: 1.5;
      }

      @media (max-width: 600px) {
        .payment-navbar-inner {
          width: calc(100% - 24px);
          min-height: 74px;
          gap: 8px;
        }

        .payment-brand {
          gap: 8px;
        }

        .payment-brand-logo {
          width: 38px;
          height: 38px;
          min-width: 38px;
          flex-basis: 38px;
        }

        .payment-brand-copy {
          gap: 4px;
        }

        .payment-brand-copy strong {
          font-size: 15px;
          letter-spacing: -0.3px;
        }

        .payment-brand-copy span {
          max-width: 150px;
          font-size: 8px;
          line-height: 1.3;
        }

        .payment-dashboard-link {
          gap: 8px;
          min-height: 40px;
          padding: 8px 11px;
          border-radius: 11px;
          font-size: 11px;
        }

        .payment-container {
          width: calc(100% - 28px);
        }

        .payment-breadcrumb {
          padding: 22px 0 15px;
          font-size: 11px;
        }

        .payment-intro {
          padding: 19px 0 26px;
        }

        .payment-intro h1 {
          font-size: clamp(34px, 9vw, 46px);
          letter-spacing: -1.2px;
        }

        .payment-intro > p {
          font-size: 12px;
          line-height: 1.85;
        }

        .payment-card,
        .payment-error-card {
          padding: 23px 17px;
          border-radius: 19px;
        }

        .payment-section-heading {
          margin-bottom: 24px;
        }

        .payment-section-heading h2 {
          font-size: 25px;
        }

        .payment-section-heading p {
          font-size: 11px;
        }

        .payment-plan-grid {
          grid-template-columns: 1fr;
          gap: 9px;
        }

        .payment-plan-item {
          padding: 14px;
        }

        .payment-plan-item strong {
          font-size: 15px;
        }

        .payment-divider {
          margin: 25px 0;
        }

        .payment-method-grid {
          grid-template-columns: 1fr;
          gap: 9px;
        }

        .payment-method-option {
          padding: 13px;
        }

        .payment-instruction {
          padding: 18px 14px;
        }
      }

      @media (max-width: 360px) {
        .payment-navbar-inner {
          width: calc(100% - 16px);
          gap: 5px;
        }

        .payment-brand {
          gap: 6px;
        }

        .payment-brand-logo {
          width: 32px;
          height: 32px;
          min-width: 32px;
          flex-basis: 32px;
          border-radius: 9px;
        }

        .payment-brand-copy strong {
          font-size: 13px;
        }

        .payment-brand-copy span {
          max-width: 112px;
          font-size: 7px;
        }

        .payment-dashboard-link {
          gap: 6px;
          padding: 7px 9px;
          font-size: 10px;
        }

        .payment-container {
          width: calc(100% - 22px);
        }

        .payment-card,
        .payment-error-card {
          padding: 19px 13px;
        }

        .payment-account-number {
          font-size: 20px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .payment-page *,
        .payment-page *::before,
        .payment-page *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `}</style>
  );
}

export default function SubscriptionPaymentPage() {
  return (
    <Suspense
      fallback={
        <CustomerLoading
          title="Menyiapkan Pembayaran"
          description="Sebentar, kami sedang menyiapkan halaman pembayaran paket Kang/Teh."
        />
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
