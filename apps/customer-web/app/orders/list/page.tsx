
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@pajara/supabase";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  quantity: number | null;
  status: string | null;
  deadline: string | null;
  created_at: string | null;
};

function statusLabel(status: string | null) {
  const labels: Record<string, string> = {
    pending: "Menunggu Diproses",
    waiting_dp: "Menunggu DP",
    processing: "Sedang Diproses",
    revision: "Dalam Revisi",
    waiting_payment: "Menunggu Pelunasan",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return status ? labels[status] || status : "Menunggu";
}

function statusColor(status: string | null) {
  if (status === "completed") return "#e5f3e8";
  if (status === "cancelled") return "#fbe8e6";
  if (status === "revision") return "#fff1d6";
  return "#edf3ed";
}

function formatDate(value: string | null) {
  if (!value) return "Belum ditentukan";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OrderListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (authError || !user) {
        setError("Sesi Anda tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("orders")
        .select(
          "id, order_code, service_name, design_type, quantity, status, deadline, created_at"
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (queryError) {
        setError("Pesanan gagal dimuat. Silakan coba kembali.");
        console.error("Gagal memuat daftar pesanan:", queryError);
      } else {
        setOrders((data || []) as Order[]);
      }

      setLoading(false);
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        color: "#1d2a22",
        padding: "28px 16px 120px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            border: 0,
            background: "transparent",
            color: "#2f6b45",
            fontWeight: 700,
            cursor: "pointer",
            padding: "8px 0",
            marginBottom: 22,
          }}
        >
          ← Kembali ke Home
        </button>

        <p
          style={{
            color: "#8a6a4a",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.15em",
            marginBottom: 8,
          }}
        >
          PAJARA STUDIO
        </p>

        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(30px, 6vw, 42px)",
            margin: "0 0 10px",
          }}
        >
          Pesanan <span style={{ color: "#2f6b45" }}>Saya.</span>
        </h1>

        <p style={{ color: "#6d756f", lineHeight: 1.7, marginBottom: 28 }}>
          Pantau status pesanan, tenggat waktu, dan detail project desainmu.
        </p>

        {loading ? (
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 18,
            }}
          >
            Memuat daftar pesanan...
          </div>
        ) : error ? (
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 18,
              lineHeight: 1.7,
            }}
          >
            <p>{error}</p>
            <button
              onClick={() => router.push("/login")}
              style={{
                background: "#2f6b45",
                color: "#fff",
                border: 0,
                borderRadius: 12,
                padding: "12px 18px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Login Kembali
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "36px 24px",
              textAlign: "center",
              boxShadow: "0 8px 30px rgba(33,77,50,.05)",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>✳</div>
            <h2 style={{ margin: "0 0 10px", fontSize: 21 }}>
              Belum ada pesanan
            </h2>
            <p style={{ color: "#6d756f", lineHeight: 1.7 }}>
              Pesanan desainmu akan muncul di sini setelah berhasil dibuat.
            </p>
            <button
              onClick={() => router.push("/order")}
              style={{
                marginTop: 12,
                background: "#2f6b45",
                color: "#fff",
                border: 0,
                borderRadius: 12,
                padding: "13px 20px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              + Pesan Desain
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <p style={{ color: "#6d756f", fontSize: 13 }}>
              {orders.length} pesanan ditemukan
            </p>

            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() =>
                  router.push(`/orders?id=${encodeURIComponent(order.id)}`)
                }
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "#fff",
                  border: "1px solid rgba(33,77,50,.1)",
                  borderRadius: 18,
                  padding: 20,
                  cursor: "pointer",
                  color: "#1d2a22",
                  boxShadow: "0 6px 22px rgba(33,77,50,.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 7px",
                        fontSize: 12,
                        color: "#8a6a4a",
                        fontWeight: 800,
                        letterSpacing: ".08em",
                      }}
                    >
                      #{order.order_code}
                    </p>
                    <h2 style={{ margin: "0 0 6px", fontSize: 18 }}>
                      {order.service_name || "Pesanan Desain"}
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        color: "#6d756f",
                        fontSize: 14,
                      }}
                    >
                      {order.design_type || "Jenis desain belum ditentukan"}
                    </p>
                  </div>

                  <span
                    style={{
                      display: "inline-block",
                      padding: "7px 10px",
                      borderRadius: 20,
                      background: statusColor(order.status),
                      color: "#214d32",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {statusLabel(order.status)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    marginTop: 20,
                    paddingTop: 15,
                    borderTop: "1px solid rgba(33,77,50,.1)",
                    color: "#6d756f",
                    fontSize: 13,
                  }}
                >
                  <span>{order.quantity || 1} desain</span>
                  <span>
                    Tenggat: {formatDate(order.deadline)}
                  </span>
                  <span style={{ color: "#2f6b45", fontWeight: 700 }}>
                    Lihat Detail →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
