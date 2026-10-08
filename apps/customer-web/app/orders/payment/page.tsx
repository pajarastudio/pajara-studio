"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@pajara/supabase";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  total_amount: number | null;
  dp_amount: number | null;
  remaining_amount: number | null;
  status: string | null;
};

type Payment = {
  id: string;
  order_id: string;
  payment_method: string | null;
  payment_type: string | null;
  amount: number | null;
  status: string | null;
  created_at: string | null;
};

const PAYMENT_METHODS = [
  {
    name: "QRIS",
    description: "Bayar menggunakan QRIS",
  },
  {
    name: "DANA",
    description: "Bayar menggunakan DANA",
  },
  {
    name: "GoPay",
    description: "Bayar menggunakan GoPay",
  },
  {
    name: "SeaBank",
    description: "Transfer melalui SeaBank",
  },
];

function formatRupiah(value: number | null) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getPaymentStatus(payment: Payment | null) {
  if (!payment) return null;

  switch (payment.status) {
    case "pending":
      return "Menunggu Verifikasi";
    case "verified":
      return "Pembayaran Terverifikasi";
    case "rejected":
      return "Pembayaran Ditolak";
    default:
      return payment.status || "Menunggu";
  }
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: orderData } = await supabase
        .from("orders")
        .select(
          "id, order_code, service_name, total_amount, dp_amount, remaining_amount, status"
        )
        .eq("id", id)
        .eq("customer_id", user.id)
        .maybeSingle();

      if (!orderData) {
        setLoading(false);
        return;
      }

      setOrder(orderData);

      const { data: paymentData } = await supabase
        .from("payments")
        .select(
          "id, order_id, payment_method, payment_type, amount, status, created_at"
        )
        .eq("order_id", orderData.id)
        .eq("payment_type", "DP")
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (paymentData) {
        setPayment(paymentData);
        setSelectedMethod(paymentData.payment_method || "");
      }

      setLoading(false);
    }

    loadData();
  }, [id]);

  async function handleCreatePayment() {
    if (!order) return;

    if (!selectedMethod) {
      setError("Silakan pilih metode pembayaran terlebih dahulu.");
      return;
    }

    if (!order.dp_amount || order.dp_amount <= 0) {
      setError(
        "Nominal DP belum tersedia. Silakan tunggu Pajara Studio menetapkan harga."
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const { data: existingPayment } = await supabase
      .from("payments")
      .select(
        "id, order_id, payment_method, payment_type, amount, status, created_at"
      )
      .eq("order_id", order.id)
      .eq("payment_type", "DP")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (existingPayment) {
      setPayment(existingPayment);
      setSelectedMethod(existingPayment.payment_method || "");
      setMessage("Pembayaran DP untuk pesanan ini sudah dibuat.");
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("payments")
      .insert({
        order_id: order.id,
        payment_method: selectedMethod,
        payment_type: "DP",
        amount: order.dp_amount,
        status: "pending",
      })
      .select(
        "id, order_id, payment_method, payment_type, amount, status, created_at"
      )
      .single();

    if (insertError) {
      setError(
        insertError.message ||
          "Pembayaran gagal dibuat. Silakan coba lagi."
      );
      setSaving(false);
      return;
    }

    setPayment(data);
    setMessage(
      "Metode pembayaran berhasil disimpan. Lanjutkan pembayaran sesuai instruksi dari Pajara Studio."
    );
    setSaving(false);
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--cream)",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <p style={{ color: "var(--green)" }}>
            Memuat pembayaran...
          </p>
        </div>
      </main>
    );
  }

  if (!id || !order) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--cream)",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h1 style={{ color: "var(--green-dark)" }}>
            Pesanan tidak ditemukan
          </h1>

          <p style={{ color: "#666" }}>
            Pesanan yang kamu cari tidak tersedia atau bukan milik
            akun ini.
          </p>

          <a
            href="/orders"
            style={{
              color: "var(--green)",
              fontWeight: 700,
            }}
          >
            ← Kembali ke Pesanan
          </a>
        </div>
      </main>
    );
  }

  const isWaitingDP = order.status === "waiting_dp";
  const paymentStatus = getPaymentStatus(payment);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <a
          href={`/orders?id=${order.id}`}
          style={{
            color: "var(--green)",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          ← Kembali ke Pesanan
        </a>

        <div style={{ marginTop: "28px" }}>
          <p
            style={{
              color: "var(--brown)",
              fontWeight: 700,
              marginBottom: "8px",
              letterSpacing: "0.08em",
            }}
          >
            PEMBAYARAN
          </p>

          <h1
            style={{
              color: "var(--green-dark)",
              marginBottom: "8px",
            }}
          >
            {order.order_code}
          </h1>

          <p style={{ color: "#666" }}>
            {order.service_name || "Layanan Pajara Studio"}
          </p>
        </div>

        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px 18px",
              borderRadius: "14px",
              background: "#edf6ef",
              border: "1px solid #c8dfcc",
              color: "var(--green-dark)",
              lineHeight: 1.6,
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px 18px",
              borderRadius: "14px",
              background: "#fff3f0",
              border: "1px solid #ead0c9",
              color: "#8a3d2f",
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            marginTop: "28px",
            background: "#fff",
            borderRadius: "18px",
            padding: "28px",
            border: "1px solid #e8e2d8",
          }}
        >
          <h2
            style={{
              color: "var(--green-dark)",
              marginTop: 0,
            }}
          >
            Ringkasan Pembayaran
          </h2>

          <div
            style={{
              display: "grid",
              gap: "14px",
              marginTop: "22px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <span style={{ color: "#666" }}>
                Total Pesanan
              </span>

              <strong style={{ color: "var(--green-dark)" }}>
                {formatRupiah(order.total_amount)}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <span style={{ color: "#666" }}>
                DP 50%
              </span>

              <strong style={{ color: "var(--green-dark)" }}>
                {formatRupiah(order.dp_amount)}
              </strong>
            </div>

            <div
              style={{
                height: "1px",
                background: "#e8e2d8",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <span style={{ color: "#666" }}>
                Sisa Pembayaran
              </span>

              <strong
                style={{
                  color: "var(--brown)",
                  fontSize: "18px",
                }}
              >
                {formatRupiah(order.remaining_amount)}
              </strong>
            </div>
          </div>
        </section>

        {payment && (
          <section
            style={{
              marginTop: "18px",
              background: "#fff",
              borderRadius: "18px",
              padding: "28px",
              border: "1px solid #e8e2d8",
            }}
          >
            <p
              style={{
                color: "var(--brown)",
                fontWeight: 700,
                marginTop: 0,
                marginBottom: "8px",
                fontSize: "13px",
                letterSpacing: "0.06em",
              }}
            >
              PEMBAYARAN DP
            </p>

            <h2
              style={{
                color: "var(--green-dark)",
                marginTop: 0,
              }}
            >
              {formatRupiah(payment.amount)}
            </h2>

            <div
              style={{
                display: "grid",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                <span style={{ color: "#666" }}>
                  Metode
                </span>

                <strong style={{ color: "var(--green-dark)" }}>
                  {payment.payment_method || "-"}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                <span style={{ color: "#666" }}>
                  Status
                </span>

                <strong style={{ color: "var(--green-dark)" }}>
                  {paymentStatus}
                </strong>
              </div>
            </div>
          </section>
        )}

        {isWaitingDP && !payment && (
          <section
            style={{
              marginTop: "18px",
              background: "#fff",
              borderRadius: "18px",
              padding: "28px",
              border: "1px solid #e8e2d8",
            }}
          >
            <h2
              style={{
                color: "var(--green-dark)",
                marginTop: 0,
              }}
            >
              Pilih Metode Pembayaran
            </h2>

            <p
              style={{
                color: "#666",
                lineHeight: 1.7,
              }}
            >
              Pilih metode yang akan digunakan untuk pembayaran
              DP sebesar{" "}
              <strong style={{ color: "var(--green-dark)" }}>
                {formatRupiah(order.dp_amount)}
              </strong>
              .
            </p>

            <div
              style={{
                display: "grid",
                gap: "12px",
                marginTop: "22px",
              }}
            >
              {PAYMENT_METHODS.map((method) => {
                const selected =
                  selectedMethod === method.name;

                return (
                  <button
                    key={method.name}
                    type="button"
                    onClick={() =>
                      setSelectedMethod(method.name)
                    }
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "18px",
                      borderRadius: "14px",
                      border: selected
                        ? "2px solid var(--green)"
                        : "1px solid #ddd5c9",
                      background: selected
                        ? "#f1f7f2"
                        : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            color: "var(--green-dark)",
                            fontSize: "16px",
                          }}
                        >
                          {method.name}
                        </strong>

                        <div
                          style={{
                            marginTop: "5px",
                            color: "#777",
                            fontSize: "13px",
                          }}
                        >
                          {method.description}
                        </div>
                      </div>

                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border: selected
                            ? "6px solid var(--green)"
                            : "2px solid #c9c0b4",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCreatePayment}
              disabled={saving}
              style={{
                width: "100%",
                marginTop: "22px",
                padding: "15px 20px",
                border: "none",
                borderRadius: "12px",
                background: "var(--green)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                cursor: saving ? "wait" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving
                ? "Menyimpan..."
                : "Lanjutkan Pembayaran"}
            </button>
          </section>
        )}

        {!isWaitingDP && !payment && (
          <section
            style={{
              marginTop: "18px",
              background: "#fff",
              borderRadius: "18px",
              padding: "28px",
              border: "1px solid #e8e2d8",
            }}
          >
            <h2
              style={{
                color: "var(--green-dark)",
                marginTop: 0,
              }}
            >
              Pembayaran
            </h2>

            <p
              style={{
                color: "#666",
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              Pembayaran belum dapat dilakukan pada tahap
              pesanan saat ini.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function PaymentFallback() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <p style={{ color: "var(--green)" }}>
          Memuat pembayaran...
        </p>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentContent />
    </Suspense>
  );
}
