
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@pajara/supabase";

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
    event: React.ChangeEvent<HTMLInputElement>
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

  const backCard = (
    <button
      type="button"
      onClick={() => router.push("/subscriptions")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        minHeight: 76,
        boxSizing: "border-box",
        padding: "14px 16px",
        margin: "0 0 20px",
        border: "1px solid #d5e5d8",
        borderRadius: 18,
        backgroundColor: "#ffffff",
        color: "#214d32",
        boxShadow: "0 6px 18px rgba(33,77,50,0.12)",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "Arial, sans-serif",
        appearance: "none",
        WebkitAppearance: "none",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: "#e3f0e6",
          color: "#2f6b45",
          fontSize: 26,
          fontWeight: 700,
        }}
      >
        ←
      </span>

      <span
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          flex: 1,
        }}
      >
        <span
          style={{
            display: "block",
            color: "#214d32",
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          Kembali ke Paket
        </span>
        <span
          style={{
            display: "block",
            color: "#66736a",
            fontSize: 12,
            fontWeight: 400,
          }}
        >
          Lihat pilihan paket Pajara Studio
        </span>
      </span>

      <span
        aria-hidden="true"
        style={{
          color: "#2f6b45",
          fontSize: 25,
          fontWeight: 400,
        }}
      >
        ›
      </span>
    </button>
  );

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f4ee",
          padding: "32px 16px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 10px 35px rgba(33,77,50,0.08)",
          }}
        >
          <p style={{ margin: 0, color: "#214d32", fontSize: 16 }}>
            Memuat pembayaran...
          </p>
        </div>
      </main>
    );
  }

  if (!subscription || !plan) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f4ee",
          padding: "32px 16px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 10px 35px rgba(33,77,50,0.08)",
          }}
        >
          <h1
            style={{
              margin: "0 0 10px",
              color: "#214d32",
              fontSize: 28,
            }}
          >
            Pembayaran Paket
          </h1>

          {error && (
            <div
              style={{
                background: "#fff1f1",
                color: "#a12b2b",
                border: "1px solid #f0caca",
                borderRadius: 14,
                padding: 14,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => router.push("/subscriptions")}
            style={{
              marginTop: 20,
              width: "100%",
              border: "none",
              borderRadius: 14,
              padding: "14px 18px",
              background: "#2f6b45",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Kembali ke Paket
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        padding: "28px 16px 50px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {backCard}

        <section
          style={{
            background: "#ffffff",
            borderRadius: 24,
            padding: 24,
            marginBottom: 16,
            boxShadow: "0 10px 35px rgba(33,77,50,0.08)",
          }}
        >
          <p
            style={{
              margin: "0 0 7px",
              color: "#8a6a4a",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Pembayaran Paket
          </p>

          <h1
            style={{
              margin: "0 0 12px",
              color: "#214d32",
              fontSize: 30,
              lineHeight: 1.2,
            }}
          >
            {plan.name}
          </h1>

          {plan.description && (
            <p
              style={{
                margin: "0 0 18px",
                color: "#66736a",
                lineHeight: 1.6,
              }}
            >
              {plan.description}
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 10,
            }}
          >
            {[
              { label: "Harga", value: formatRupiah(plan.price) },
              { label: "Masa Aktif", value: `${plan.duration_days} hari` },
              { label: "Kuota", value: `${plan.quota_total} desain` },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "#f7f4ee",
                  borderRadius: 16,
                  padding: 15,
                }}
              >
                <div
                  style={{
                    color: "#6d776f",
                    fontSize: 12,
                    marginBottom: 5,
                  }}
                >
                  {item.label}
                </div>
                <strong style={{ color: "#214d32", fontSize: 17 }}>
                  {item.value}
                </strong>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 16,
              background: "#edf5ef",
              borderRadius: 14,
              padding: 14,
              color: "#214d32",
              lineHeight: 1.5,
              fontSize: 14,
            }}
          >
            Pembayaran paket dilakukan <strong>100% di awal</strong>.
            Setelah pembayaran diverifikasi Admin, paket akan aktif.
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 10px 35px rgba(33,77,50,0.08)",
          }}
        >
          <h2
            style={{
              margin: "0 0 18px",
              color: "#214d32",
              fontSize: 21,
            }}
          >
            Pilih Metode Pembayaran
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {(["QRIS", "DANA", "GoPay", "SeaBank"] as PaymentMethod[]).map(
              (method) => {
                const active = paymentMethod === method;

                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method);
                      setError("");
                    }}
                    style={{
                      border: active
                        ? "2px solid #2f6b45"
                        : "1px solid #d8dfd9",
                      borderRadius: 14,
                      padding: "13px 10px",
                      background: active ? "#edf5ef" : "#ffffff",
                      color: "#214d32",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {method}
                  </button>
                );
              }
            )}
          </div>

          {paymentMethod === "QRIS" && (
            <div
              style={{
                background: "#f7f4ee",
                borderRadius: 18,
                padding: 18,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  margin: "0 0 14px",
                  color: "#214d32",
                  fontWeight: 700,
                }}
              >
                Scan QRIS Pajara Studio
              </p>
              <img
                src="/qr_ID1026470184411_08.10.26_1791447334_1791447334905.jpeg"
                alt="QRIS Pajara Studio"
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: 340,
                  margin: "0 auto",
                  borderRadius: 14,
                  background: "#ffffff",
                }}
              />
              <p
                style={{
                  margin: "14px 0 0",
                  color: "#6d776f",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Pastikan nominal pembayaran sesuai dengan harga paket.
              </p>
            </div>
          )}

          {(paymentMethod === "DANA" || paymentMethod === "GoPay") && (
            <div
              style={{
                background: "#f7f4ee",
                borderRadius: 18,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <div style={{ color: "#6d776f", fontSize: 13, marginBottom: 7 }}>
                {paymentMethod}
              </div>
              <div
                style={{
                  color: "#214d32",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                }}
              >
                0858-8242-1145
              </div>
              <div style={{ marginTop: 5, color: "#6d776f", fontSize: 14 }}>
                A/N TUTI
              </div>
            </div>
          )}

          {paymentMethod === "SeaBank" && (
            <div
              style={{
                background: "#f7f4ee",
                borderRadius: 18,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <div style={{ color: "#6d776f", fontSize: 13, marginBottom: 7 }}>
                SeaBank
              </div>
              <div
                style={{
                  color: "#214d32",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                }}
              >
                901052450932
              </div>
              <div style={{ marginTop: 5, color: "#6d776f", fontSize: 14 }}>
                A/N TUTI
              </div>
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="transaction-id"
              style={{
                display: "block",
                color: "#214d32",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              ID Transaksi
              <span
                style={{
                  color: "#8a6a4a",
                  fontWeight: 400,
                  marginLeft: 6,
                }}
              >
                (opsional)
              </span>
            </label>
            <input
              id="transaction-id"
              type="text"
              value={transactionId}
              onChange={(event) => setTransactionId(event.target.value)}
              placeholder="Masukkan ID transaksi jika ada"
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1px solid #d8dfd9",
                borderRadius: 14,
                padding: "13px 14px",
                outline: "none",
                color: "#214d32",
                background: "#ffffff",
              }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="proof-file"
              style={{
                display: "block",
                color: "#214d32",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Bukti Pembayaran
            </label>
            <input
              id="proof-file"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1px solid #d8dfd9",
                borderRadius: 14,
                padding: 10,
                background: "#ffffff",
                color: "#214d32",
              }}
            />
            <p
              style={{
                margin: "8px 0 0",
                color: "#7a837d",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              JPG, PNG, WEBP, atau PDF. Maksimal 10 MB.
            </p>

            {proofFile && (
              <div
                style={{
                  marginTop: 10,
                  background: "#edf5ef",
                  borderRadius: 12,
                  padding: 11,
                  color: "#214d32",
                  fontSize: 13,
                }}
              >
                File dipilih: <strong>{proofFile.name}</strong>
              </div>
            )}
          </div>

          {error && (
            <div
              style={{
                marginBottom: 16,
                background: "#fff1f1",
                border: "1px solid #f0caca",
                borderRadius: 14,
                padding: 14,
                color: "#a12b2b",
                lineHeight: 1.5,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                marginBottom: 16,
                background: "#edf5ef",
                border: "1px solid #c9dfce",
                borderRadius: 14,
                padding: 14,
                color: "#214d32",
                lineHeight: 1.5,
                fontSize: 14,
              }}
            >
              {success}
            </div>
          )}

          <button
            type="button"
            onClick={submitPayment}
            disabled={submitting || !!success}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 15,
              padding: "15px 18px",
              background:
                submitting || !!success ? "#9aae9e" : "#2f6b45",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 15,
              cursor: submitting || !!success ? "not-allowed" : "pointer",
            }}
          >
            {submitting
              ? "Mengirim Pembayaran..."
              : "Kirim Bukti Pembayaran"}
          </button>

          <p
            style={{
              margin: "14px 0 0",
              textAlign: "center",
              color: "#7a837d",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            Setelah dikirim, Admin akan memeriksa pembayaran sebelum paket
            diaktifkan.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function SubscriptionPaymentPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            background: "#f7f4ee",
            padding: "32px 16px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: 720,
              margin: "0 auto",
              background: "#ffffff",
              borderRadius: 24,
              padding: 28,
            }}
          >
            Memuat pembayaran...
          </div>
        </main>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
