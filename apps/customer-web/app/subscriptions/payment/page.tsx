"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@pajara/supabase";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  quota_total: number;
};

type Subscription = {
  id: string;
  plan_id: string;
  customer_id: string;
  status: string;
  quota_total: number;
  quota_used: number;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const subscriptionId = searchParams.get("subscription");

  const [plan, setPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [transactionId, setTransactionId] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        if (!subscriptionId) {
          setError("Data paket tidak ditemukan.");
          setLoading(false);
          return;
        }

        const { data: subscriptionData, error: subscriptionError } =
          await supabase
            .from("subscriptions")
            .select(
              "id, plan_id, customer_id, status, quota_total, quota_used"
            )
            .eq("id", subscriptionId)
            .eq("customer_id", user.id)
            .single();

        if (subscriptionError || !subscriptionData) {
          setError("Paket yang dipilih tidak ditemukan.");
          setLoading(false);
          return;
        }

        if (subscriptionData.status !== "pending") {
          setError("Paket ini tidak sedang menunggu pembayaran.");
          setSubscription(subscriptionData);
          setLoading(false);
          return;
        }

        const { data: planData, error: planError } = await supabase
          .from("subscription_plans")
          .select(
            "id, name, description, price, duration_days, quota_total"
          )
          .eq("id", subscriptionData.plan_id)
          .single();

        if (planError || !planData) {
          setError("Data paket tidak ditemukan.");
          setLoading(false);
          return;
        }

        setSubscription(subscriptionData);
        setPlan(planData);
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan saat memuat pembayaran.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, subscriptionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!subscription || !plan) {
      setError("Data pembayaran tidak lengkap.");
      return;
    }

    if (!proofFile) {
      setError("Silakan upload bukti pembayaran terlebih dahulu.");
      return;
    }

    if (proofFile.size > 10 * 1024 * 1024) {
      setError("Ukuran bukti pembayaran maksimal 10 MB.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(proofFile.type)) {
      setError("Format bukti pembayaran harus JPG, PNG, WEBP, atau PDF.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      /*
       * 1. Buat record pembayaran paket.
       */
      const { data: payment, error: paymentError } = await supabase
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

      if (paymentError || !payment) {
        console.error(paymentError);
        throw new Error(
          paymentError?.message || "Gagal membuat data pembayaran."
        );
      }

      /*
       * 2. Upload bukti pembayaran ke bucket pajara-files.
       */
      const safeFileName = proofFile.name
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-");

      const filePath = `subscriptions/${subscription.id}/payment-proof/${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("pajara-files")
        .upload(filePath, proofFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: proofFile.type,
        });

      if (uploadError) {
        console.error(uploadError);

        await supabase
          .from("subscription_payments")
          .delete()
          .eq("id", payment.id)
          .eq("customer_id", user.id);

        throw new Error("Gagal mengupload bukti pembayaran.");
      }

      /*
       * 3. Simpan metadata file.
       */
      const { error: fileError } = await supabase
        .from("subscription_payment_files")
        .insert({
          subscription_payment_id: payment.id,
          customer_id: user.id,
          file_name: proofFile.name,
          storage_path: filePath,
          mime_type: proofFile.type,
          file_size: proofFile.size,
        });

      if (fileError) {
        console.error(fileError);

        await supabase.storage.from("pajara-files").remove([filePath]);

        await supabase
          .from("subscription_payments")
          .delete()
          .eq("id", payment.id)
          .eq("customer_id", user.id);

        throw new Error("Gagal menyimpan data bukti pembayaran.");
      }

      setSuccess(
        "Bukti pembayaran berhasil dikirim. Tim Pajara Studio akan memverifikasi pembayaran kamu."
      );

      setProofFile(null);
      setTransactionId("");

      setTimeout(() => {
        router.push("/subscriptions");
      }, 2500);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengirim pembayaran."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f4ee",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#214d32",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Memuat pembayaran...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        padding: "24px 16px 48px",
        fontFamily: "Arial, sans-serif",
        color: "#214d32",
      }}
    >
      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/subscriptions")}
          style={{
            border: "none",
            background: "transparent",
            color: "#2f6b45",
            fontSize: "15px",
            fontWeight: 700,
            padding: 0,
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          ← Kembali ke Paket
        </button>

        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "#8a6a4a",
            }}
          >
            Pembayaran Paket
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              lineHeight: 1.15,
              fontWeight: 800,
            }}
          >
            Selesaikan pembayaran
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "#66746a",
              lineHeight: 1.6,
            }}
          >
            Paket akan aktif setelah pembayaran diverifikasi oleh tim Pajara
            Studio.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fff1f0",
              border: "1px solid #e4b5b0",
              color: "#9f3028",
              borderRadius: "14px",
              padding: "14px 16px",
              marginBottom: "18px",
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: "#edf7ef",
              border: "1px solid #b7d6bc",
              color: "#245c35",
              borderRadius: "14px",
              padding: "14px 16px",
              marginBottom: "18px",
              lineHeight: 1.5,
            }}
          >
            {success}
          </div>
        )}

        {plan && subscription && (
          <form onSubmit={handleSubmit}>
            <section
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "22px",
                marginBottom: "16px",
                boxShadow: "0 8px 30px rgba(33, 77, 50, 0.06)",
                border: "1px solid rgba(33, 77, 50, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "22px",
                    }}
                  >
                    {plan.name}
                  </h2>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#66746a",
                      lineHeight: 1.5,
                    }}
                  >
                    {plan.description ||
                      `${plan.duration_days} hari • ${plan.quota_total} kuota desain`}
                  </p>
                </div>

                <strong
                  style={{
                    fontSize: "19px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatRupiah(Number(plan.price))}
                </strong>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e8ebe7",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#7a857e",
                      marginBottom: "4px",
                    }}
                  >
                    Masa aktif
                  </div>
                  <strong>{plan.duration_days} hari</strong>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#7a857e",
                      marginBottom: "4px",
                    }}
                  >
                    Kuota
                  </div>
                  <strong>{plan.quota_total} desain</strong>
                </div>
              </div>
            </section>

            <section
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "22px",
                marginBottom: "16px",
                boxShadow: "0 8px 30px rgba(33, 77, 50, 0.06)",
                border: "1px solid rgba(33, 77, 50, 0.08)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 16px",
                  fontSize: "20px",
                }}
              >
                Metode Pembayaran
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                {["QRIS", "DANA", "GoPay", "SeaBank"].map((method) => (
                  <label
                    key={method}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      border:
                        paymentMethod === method
                          ? "2px solid #2f6b45"
                          : "1px solid #dfe5df",
                      borderRadius: "14px",
                      padding: "14px",
                      cursor: "pointer",
                      background:
                        paymentMethod === method ? "#f1f7f2" : "#ffffff",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />

                    <span
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      {method}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "22px",
                marginBottom: "16px",
                boxShadow: "0 8px 30px rgba(33, 77, 50, 0.06)",
                border: "1px solid rgba(33, 77, 50, 0.08)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 16px",
                  fontSize: "20px",
                }}
              >
                Detail Pembayaran
              </h2>

              <div
                style={{
                  background: "#f7f4ee",
                  borderRadius: "16px",
                  padding: "18px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <span>Harga Paket</span>
                  <strong>{formatRupiah(Number(plan.price))}</strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid #ddd8cf",
                    fontSize: "18px",
                  }}
                >
                  <strong>Total</strong>
                  <strong>{formatRupiah(Number(plan.price))}</strong>
                </div>
              </div>

              {paymentMethod === "QRIS" && (
                <div
                  style={{
                    border: "1px solid #dfe5df",
                    borderRadius: "16px",
                    padding: "16px",
                    textAlign: "center",
                    marginBottom: "18px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 12px",
                      fontWeight: 700,
                    }}
                  >
                    Scan QRIS Pajara Studio
                  </p>

                  <img
                    src="/qr_ID1026470184411_08.10.26_1791447334_1791447334905.jpeg"
                    alt="QRIS Pajara Studio"
                    style={{
                      width: "100%",
                      maxWidth: "320px",
                      height: "auto",
                      borderRadius: "12px",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                </div>
              )}

              {paymentMethod === "DANA" && (
                <div
                  style={{
                    background: "#f7f4ee",
                    borderRadius: "14px",
                    padding: "16px",
                    marginBottom: "18px",
                  }}
                >
                  <strong>DANA</strong>
                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#66746a",
                    }}
                  >
                    Gunakan nomor DANA Pajara Studio yang tersedia pada
                    informasi pembayaran resmi.
                  </p>
                </div>
              )}

              {paymentMethod === "GoPay" && (
                <div
                  style={{
                    background: "#f7f4ee",
                    borderRadius: "14px",
                    padding: "16px",
                    marginBottom: "18px",
                  }}
                >
                  <strong>GoPay</strong>
                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#66746a",
                    }}
                  >
                    Gunakan nomor GoPay Pajara Studio yang tersedia pada
                    informasi pembayaran resmi.
                  </p>
                </div>
              )}

              {paymentMethod === "SeaBank" && (
                <div
                  style={{
                    background: "#f7f4ee",
                    borderRadius: "14px",
                    padding: "16px",
                    marginBottom: "18px",
                  }}
                >
                  <strong>SeaBank</strong>
                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#66746a",
                    }}
                  >
                    Gunakan rekening SeaBank Pajara Studio yang tersedia pada
                    informasi pembayaran resmi.
                  </p>
                </div>
              )}

              <label
                style={{
                  display: "block",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                ID Transaksi / Referensi
                <span
                  style={{
                    color: "#8a857d",
                    fontWeight: 400,
                  }}
                >
                  {" "}
                  (opsional)
                </span>
              </label>

              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Contoh: TRX123456"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid #d8ded8",
                  borderRadius: "12px",
                  padding: "13px 14px",
                  fontSize: "15px",
                  outline: "none",
                  marginBottom: "18px",
                  background: "#ffffff",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                Bukti Pembayaran
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setProofFile(file);
                }}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid #d8ded8",
                  borderRadius: "12px",
                  padding: "12px",
                  background: "#ffffff",
                }}
              />

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "13px",
                  color: "#7a857e",
                  lineHeight: 1.5,
                }}
              >
                Format JPG, PNG, WEBP, atau PDF. Maksimal 10 MB.
              </p>

              {proofFile && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px 14px",
                    background: "#f1f7f2",
                    borderRadius: "12px",
                    fontSize: "14px",
                    color: "#245c35",
                  }}
                >
                  File dipilih: <strong>{proofFile.name}</strong>
                </div>
              )}
            </section>

            <button
              type="submit"
              disabled={submitting || !!success}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "14px",
                padding: "15px 18px",
                background:
                  submitting || success ? "#9aafa0" : "#2f6b45",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 800,
                cursor:
                  submitting || success ? "not-allowed" : "pointer",
              }}
            >
              {submitting
                ? "Mengirim pembayaran..."
                : success
                ? "Bukti Pembayaran Terkirim"
                : `Kirim Bukti Pembayaran — ${formatRupiah(
                    Number(plan.price)
                  )}`}
            </button>
          </form>
        )}

        <p
          style={{
            textAlign: "center",
            margin: "24px 0 0",
            color: "#7a857e",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          Paket akan aktif setelah pembayaran diverifikasi oleh Admin Pajara
          Studio.
        </p>
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#214d32",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Memuat pembayaran...
        </main>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
