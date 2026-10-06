"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";

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
  brief: string | null;
  notes: string | null;
  total_amount: number | null;
  dp_amount: number | null;
  remaining_amount: number | null;
  status: string | null;
  deadline: string | null;
  created_at: string;
};

function formatRupiah(value: number | null) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "pending":
      return "Pesanan Baru";
    case "processing":
      return "Diproses";
    case "completed":
      return "Selesai";
    case "cancelled":
      return "Dibatalkan";
    default:
      return status || "-";
  }
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
        borderBottom: "1px solid #eee",
        paddingBottom: "12px",
      }}
    >
      <span
        style={{
          color: "#8a6a4a",
          fontSize: "13px",
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: "#333",
          fontSize: "14px",
          fontWeight: "600",
          textAlign: "right",
          maxWidth: "60%",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function OrderDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setErrorMessage("ID pesanan tidak ditemukan.");
        setLoading(false);
        return;
      }

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

      if (profileError || !profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_code, service_name, design_type, quantity, brief, notes, total_amount, dp_amount, remaining_amount, status, deadline, created_at"
        )
        .eq("id", orderId)
        .single();

      if (error || !data) {
        setErrorMessage(
          "Pesanan tidak ditemukan atau tidak dapat dimuat."
        );
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);
    }

    loadOrder();
  }, [orderId, router]);

  async function handleStatusChange(newStatus: string) {
    if (!order) return;

    setSavingStatus(true);
    setStatusMessage("");

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (error) {
      setSavingStatus(false);
      setStatusMessage(
        "Gagal mengubah status: " + error.message
      );
      return;
    }

    setOrder({
      ...order,
      status: newStatus,
    });

    setSavingStatus(false);
    setStatusMessage("Status pesanan berhasil diperbarui.");
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
          fontFamily: "Arial, sans-serif",
          color: "#214d32",
        }}
      >
        Memuat detail pesanan...
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f4ee",
          fontFamily: "Arial, sans-serif",
          padding: "30px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h1
            style={{
              margin: "0 0 12px",
              color: "#214d32",
              fontSize: "22px",
            }}
          >
            Detail Pesanan
          </h1>

          <p
            style={{
              color: "#777",
              marginBottom: "20px",
            }}
          >
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => router.push("/orders")}
            style={{
              width: "100%",
              height: "48px",
              border: "none",
              borderRadius: "10px",
              background: "#2f6b45",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            Kembali ke Pesanan
          </button>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        fontFamily: "Arial, sans-serif",
        paddingBottom: "40px",
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
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/orders")}
            style={{
              border: "none",
              background: "transparent",
              color: "#ffffff",
              padding: 0,
              marginBottom: "12px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ← Kembali ke Pesanan
          </button>

          <h1
            style={{
              margin: 0,
              fontSize: "25px",
            }}
          >
            Detail Pesanan
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              opacity: 0.85,
              fontSize: "14px",
            }}
          >
            {order.order_code}
          </p>
        </div>
      </header>

      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "28px 20px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "18px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
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
              margin: "6px 0 0",
              color: "#214d32",
              fontSize: "24px",
            }}
          >
            {order.order_code}
          </h2>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "18px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 18px",
              color: "#214d32",
              fontSize: "19px",
            }}
          >
            Informasi Pesanan
          </h2>

          <div
            style={{
              display: "grid",
              gap: "15px",
            }}
          >
            <InfoRow
              label="Layanan"
              value={order.service_name || "-"}
            />

            <InfoRow
              label="Jenis Desain"
              value={order.design_type || "-"}
            />

            <InfoRow
              label="Jumlah"
              value={String(order.quantity || 0)}
            />

            <InfoRow
              label="Status"
              value={getStatusLabel(order.status)}
            />

            <InfoRow
              label="Deadline"
              value={formatDate(order.deadline)}
            />

            <InfoRow
              label="Dibuat"
              value={formatDate(order.created_at)}
            />
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "18px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 18px",
              color: "#214d32",
              fontSize: "19px",
            }}
          >
            Brief & Catatan
          </h2>

          <div style={{ marginBottom: "18px" }}>
            <p
              style={{
                margin: "0 0 7px",
                color: "#8a6a4a",
                fontSize: "13px",
              }}
            >
              Brief
            </p>

            <div
              style={{
                background: "#f7f4ee",
                borderRadius: "10px",
                padding: "14px",
                color: "#444",
                fontSize: "14px",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {order.brief || "-"}
            </div>
          </div>

          <div>
            <p
              style={{
                margin: "0 0 7px",
                color: "#8a6a4a",
                fontSize: "13px",
              }}
            >
              Catatan
            </p>

            <div
              style={{
                background: "#f7f4ee",
                borderRadius: "10px",
                padding: "14px",
                color: "#444",
                fontSize: "14px",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {order.notes || "-"}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "18px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 18px",
              color: "#214d32",
              fontSize: "19px",
            }}
          >
            Pembayaran
          </h2>

          <div
            style={{
              display: "grid",
              gap: "15px",
            }}
          >
            <InfoRow
              label="Total"
              value={formatRupiah(order.total_amount)}
            />

            <InfoRow
              label="DP"
              value={formatRupiah(order.dp_amount)}
            />

            <InfoRow
              label="Sisa"
              value={formatRupiah(order.remaining_amount)}
            />
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              color: "#214d32",
              fontSize: "19px",
            }}
          >
            Status Pesanan
          </h2>

          <p
            style={{
              margin: "0 0 18px",
              color: "#777",
              fontSize: "14px",
            }}
          >
            Status saat ini:{" "}
            <strong>{getStatusLabel(order.status)}</strong>
          </p>

          <select
            value={order.status || "pending"}
            onChange={(event) =>
              handleStatusChange(event.target.value)
            }
            disabled={savingStatus}
            style={{
              width: "100%",
              height: "48px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "0 14px",
              background: "#ffffff",
              color: "#333",
              fontSize: "15px",
              fontWeight: "600",
              cursor: savingStatus ? "not-allowed" : "pointer",
              outline: "none",
            }}
          >
            <option value="pending">Pesanan Baru</option>
            <option value="processing">Diproses</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          {savingStatus && (
            <p
              style={{
                margin: "12px 0 0",
                color: "#8a6a4a",
                fontSize: "13px",
              }}
            >
              Menyimpan status...
            </p>
          )}

          {statusMessage && (
            <p
              style={{
                margin: "12px 0 0",
                color: statusMessage.startsWith("Gagal")
                  ? "#b42318"
                  : "#2f6b45",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {statusMessage}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f4ee",
        fontFamily: "Arial, sans-serif",
        color: "#214d32",
      }}
    >
      Memuat detail pesanan...
    </main>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <OrderDetailContent />
    </Suspense>
  );
}
