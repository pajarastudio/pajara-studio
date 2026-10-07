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

function formatRupiah(value: number | null) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getPaymentStatus(status: string | null) {
  switch (status) {
    case "waiting_dp":
      return {
        title: "Menunggu Pembayaran DP",
        description:
          "Silakan lakukan pembayaran DP sesuai nominal yang tercantum.",
      };

    case "processing":
      return {
        title: "Pembayaran DP Diproses",
        description:
          "Pesanan sedang diproses oleh Pajara Studio.",
      };

    case "waiting_payment":
      return {
        title: "Menunggu Pelunasan",
        description:
          "DP telah diterima. Sisa pembayaran dapat dilunasi setelah project selesai.",
      };

    case "completed":
      return {
        title: "Pembayaran Selesai",
        description:
          "Seluruh pembayaran untuk pesanan ini telah selesai.",
      };

    default:
      return {
        title: "Informasi Pembayaran",
        description:
          "Informasi pembayaran akan tersedia sesuai status pesanan.",
      };
  }
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
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

      const { data } = await supabase
        .from("orders")
        .select(
          "id, order_code, service_name, total_amount, dp_amount, remaining_amount, status"
        )
        .eq("id", id)
        .eq("customer_id", user.id)
        .maybeSingle();

      setOrder(data);
      setLoading(false);
    }

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--cream)",
          padding: "40px 20px",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{ color: "var(--green-dark)" }}>
            Pesanan tidak ditemukan
          </h1>

          <p style={{ color: "#666" }}>
            Pesanan yang kamu cari tidak tersedia atau bukan milik akun ini.
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

  const paymentStatus = getPaymentStatus(order.status);

  const isWaitingDP = order.status === "waiting_dp";

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

              <strong
                style={{
                  color: "var(--green-dark)",
                  fontSize: "18px",
                }}
              >
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
              marginBottom: "8px",
            }}
          >
            {paymentStatus.title}
          </h2>

          <p
            style={{
              color: "#666",
              lineHeight: 1.7,
              marginTop: 0,
            }}
          >
            {paymentStatus.description}
          </p>

          {isWaitingDP ? (
            <>
              <div
                style={{
                  marginTop: "22px",
                  padding: "22px",
                  borderRadius: "16px",
                  background: "var(--cream)",
                  border: "1px solid #ddd3c5",
                }}
              >
                <p
                  style={{
                    marginTop: 0,
                    marginBottom: "8px",
                    color: "#666",
                    fontSize: "14px",
                  }}
                >
                  Nominal yang perlu dibayar
                </p>

                <strong
                  style={{
                    display: "block",
                    color: "var(--green-dark)",
                    fontSize: "28px",
                  }}
                >
                  {formatRupiah(order.dp_amount)}
                </strong>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  borderRadius: "14px",
                  background: "#f8f6f1",
                  border: "1px dashed #cfc5b7",
                }}
              >
                <strong
                  style={{
                    color: "var(--green-dark)",
                  }}
                >
                  Metode Pembayaran
                </strong>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    marginTop: "14px",
                  }}
                >
                  {[
                    "QRIS",
                    "DANA",
                    "GoPay",
                    "SeaBank",
                  ].map((method) => (
                    <div
                      key={method}
                      style={{
                        padding: "13px 15px",
                        background: "#fff",
                        borderRadius: "10px",
                        border: "1px solid #e8e2d8",
                        color: "var(--green-dark)",
                        fontWeight: 700,
                      }}
                    >
                      {method}
                    </div>
                  ))}
                </div>

                <p
                  style={{
                    color: "#777",
                    lineHeight: 1.6,
                    marginBottom: 0,
                    marginTop: "16px",
                    fontSize: "14px",
                  }}
                >
                  Detail tujuan pembayaran akan ditampilkan
                  setelah sistem pembayaran Pajara Studio
                  dikonfigurasi.
                </p>
              </div>
            </>
          ) : (
            <div
              style={{
                marginTop: "20px",
                padding: "18px",
                borderRadius: "14px",
                background: "var(--cream)",
                border: "1px dashed #cfc5b7",
              }}
            >
              <strong style={{ color: "var(--green-dark)" }}>
                Informasi pembayaran
              </strong>

              <p
                style={{
                  color: "#777",
                  marginBottom: 0,
                  lineHeight: 1.6,
                }}
              >
                Detail pembayaran akan menyesuaikan status
                pesanan kamu.
              </p>
            </div>
          )}
        </section>
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
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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
