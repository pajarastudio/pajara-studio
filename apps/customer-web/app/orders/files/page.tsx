"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@pajara/supabase";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  status: string | null;
};

export default function FilesPage() {
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
          "id, order_code, service_name, design_type, status"
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
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <p style={{ color: "var(--green)" }}>
            Memuat file pesanan...
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
            FILE PESANAN
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
            {order.design_type
              ? ` • ${order.design_type}`
              : ""}
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
            File Final
          </h2>

          <p
            style={{
              color: "#666",
              lineHeight: 1.7,
            }}
          >
            File hasil desain akan tersedia di halaman ini setelah
            pesanan selesai dan file final sudah diunggah oleh tim
            Pajara Studio.
          </p>

          <div
            style={{
              marginTop: "22px",
              padding: "20px",
              borderRadius: "14px",
              background: "var(--cream)",
              border: "1px dashed #cfc5b7",
              textAlign: "center",
            }}
          >
            <strong style={{ color: "var(--green-dark)" }}>
              Belum ada file final
            </strong>

            <p
              style={{
                color: "#777",
                marginBottom: 0,
                lineHeight: 1.6,
              }}
            >
              File download akan muncul di sini setelah tersedia.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
