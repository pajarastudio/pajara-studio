"use client";

import { useEffect, useState } from "react";
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

export default function PaymentPage() {
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
                DP
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
            Metode Pembayaran
          </h2>

          <p
            style={{
              color: "#666",
              lineHeight: 1.7,
            }}
          >
            Informasi pembayaran akan tersedia setelah metode
            pembayaran dikonfirmasi oleh Pajara Studio.
          </p>

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
              Pembayaran belum tersedia
            </strong>

            <p
              style={{
                color: "#777",
                marginBottom: 0,
                lineHeight: 1.6,
              }}
            >
              Detail pembayaran akan muncul di sini.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
