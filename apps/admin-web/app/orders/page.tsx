"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  quantity: number | null;
  total_amount: number | null;
  status: string | null;
  deadline: string | null;
  created_at: string | null;
};

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOrders() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.user) {
        router.replace("/");
        return;
      }

      const user = sessionData.session.user;

      const { data: profile, error: profileError } = await supabase
        .from("profiles_v2")
        .select("role")
        .eq("id", user.id)
        .single();

      if (
        profileError ||
        !profile ||
        profile.role !== "admin"
      ) {
        await supabase.auth.signOut();
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_code, service_name, design_type, quantity, total_amount, status, deadline, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("Gagal memuat pesanan: " + error.message);
        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    }

    loadOrders();
  }, [router]);

  function formatRupiah(value: number | null) {
    if (value === null) return "Rp0";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value: string | null) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function statusLabel(status: string | null) {
    if (status === "pending") return "Pesanan Baru";
    if (status === "processing") return "Diproses";
    if (status === "completed") return "Selesai";
    if (status === "cancelled") return "Dibatalkan";

    return status || "Tidak diketahui";
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f4ee",
          color: "#214d32",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Memuat pesanan...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          background: "#214d32",
          color: "#ffffff",
          padding: "22px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            style={{
              border: "none",
              background: "transparent",
              color: "#ffffff",
              padding: 0,
              marginBottom: "14px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ← Kembali ke Dashboard
          </button>

          <h1
            style={{
              margin: 0,
              fontSize: "25px",
            }}
          >
            Pesanan Pajara
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              opacity: 0.85,
              fontSize: "14px",
            }}
          >
            Kelola semua pesanan pelanggan
          </p>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "28px 20px",
        }}
      >
        {message && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "18px",
              marginBottom: "18px",
              color: "#8a6a4a",
              boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
            }}
          >
            {message}
          </div>
        )}

        {orders.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "30px 20px",
              textAlign: "center",
              boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px",
                color: "#214d32",
              }}
            >
              Belum ada pesanan
            </h2>

            <p
              style={{
                margin: 0,
                color: "#777",
                fontSize: "14px",
              }}
            >
              Pesanan pelanggan akan muncul di sini.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "#8a6a4a",
                        fontSize: "13px",
                      }}
                    >
                      Kode Pesanan
                    </p>

                    <h2
                      style={{
                        margin: "5px 0 0",
                        color: "#214d32",
                        fontSize: "20px",
                      }}
                    >
                      {order.order_code}
                    </h2>
                  </div>

                  <span
                    style={{
                      display: "inline-block",
                      padding: "7px 11px",
                      borderRadius: "999px",
                      background:
                        order.status === "completed"
                          ? "#e7f2e9"
                          : "#f4eadf",
                      color: "#214d32",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {statusLabel(order.status)}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "18px",
                    display: "grid",
                    gap: "9px",
                    color: "#555",
                    fontSize: "14px",
                  }}
                >
                  <div>
                    <strong>Layanan:</strong>{" "}
                    {order.service_name || "-"}
                  </div>

                  <div>
                    <strong>Jenis:</strong>{" "}
                    {order.design_type || "-"}
                  </div>

                  <div>
                    <strong>Jumlah:</strong>{" "}
                    {order.quantity ?? 0}
                  </div>

                  <div>
                    <strong>Total:</strong>{" "}
                    {formatRupiah(order.total_amount)}
                  </div>

                  <div>
                    <strong>Deadline:</strong>{" "}
                    {formatDate(order.deadline)}
                  </div>

                  <div>
                    <strong>Dibuat:</strong>{" "}
                    {formatDate(order.created_at)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(`/orders/detail?id=${order.id}`)
                  }
                  style={{
                    width: "100%",
                    height: "46px",
                    marginTop: "18px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#2f6b45",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    touchAction: "manipulation",
                  }}
                >
                  Lihat Detail Pesanan
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
