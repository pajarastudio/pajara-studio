
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@pajara/supabase";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  quantity: number | null;
  brief: string | null;
  notes: string | null;
  deadline: string | null;
  status: string | null;
  created_at: string;
};

function BriefContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          window.location.href = "/login";
          return;
        }

        if (!id) {
          setError("ID pesanan tidak ditemukan.");
          return;
        }

        const { data, error: orderError } = await supabase
          .from("orders")
          .select(
            "id, order_code, service_name, design_type, quantity, brief, notes, deadline, status, created_at"
          )
          .eq("id", id)
          .eq("customer_id", user.id)
          .maybeSingle();

        if (orderError) throw orderError;

        if (!data) {
          setError("Pesanan tidak ditemukan atau tidak dapat diakses.");
          return;
        }

        if (active) setOrder(data as Order);
      } catch {
        if (active) setError("Brief pesanan gagal dimuat. Silakan coba lagi.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [id]);

  const pageStyle = {
    minHeight: "100vh",
    background: "#f7f4ee",
    color: "#26352a",
    padding: "32px 16px 56px",
  } as const;

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e8e4dc",
    borderRadius: 22,
    padding: "clamp(20px, 5vw, 32px)",
    boxShadow: "0 12px 35px rgba(33,77,50,0.05)",
  } as const;

  const labelStyle = {
    fontSize: 12,
    fontWeight: 700,
    color: "#718075",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: 8,
  };

  const valueStyle = {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#26352a",
    whiteSpace: "pre-wrap" as const,
    overflowWrap: "anywhere" as const,
  };

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "12px 17px",
    background: "#2f6b45",
    color: "#ffffff",
    borderRadius: 12,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 700,
  } as const;

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Link
          href={id ? `/orders?id=${encodeURIComponent(id)}` : "/orders"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            color: "#2f6b45",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 24,
            padding: "11px 15px",
            background: "#ffffff",
            border: "1px solid #e8e4dc",
            borderRadius: 12,
          }}
        >
          <span aria-hidden="true">←</span>
          Kembali ke Pesanan
        </Link>

        <header style={{ marginBottom: 24 }}>
          <p
            style={{
              color: "#8a6a4a",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.14em",
              margin: "0 0 10px",
            }}
          >
            DETAIL PROJECT
          </p>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(28px, 6vw, 38px)",
              lineHeight: 1.2,
              margin: "0 0 10px",
              color: "#214d32",
            }}
          >
            Brief Desain
          </h1>
          <p style={{ color: "#718075", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            Lihat kembali arahan dan informasi yang dikirim untuk pesanan desain Anda.
          </p>
        </header>

        {loading ? (
          <div style={cardStyle} aria-live="polite">
            <div
              style={{
                width: 34,
                height: 34,
                border: "3px solid #e4eadf",
                borderTopColor: "#2f6b45",
                borderRadius: "50%",
                animation: "pajaraBriefSpin 0.8s linear infinite",
                marginBottom: 16,
              }}
            />
            <p style={{ margin: 0, color: "#718075", fontSize: 14 }}>
              Memuat brief desain...
            </p>
            <style>{`@keyframes pajaraBriefSpin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={cardStyle}>
            <p style={{ color: "#a13b32", lineHeight: 1.7, marginTop: 0 }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                ...buttonStyle,
                border: 0,
                cursor: "pointer",
              }}
            >
              Coba Lagi
            </button>
          </div>
        ) : order ? (
          <div style={{ display: "grid", gap: 18 }}>
            <section style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                  paddingBottom: 20,
                  borderBottom: "1px solid #eeeae3",
                  marginBottom: 22,
                }}
              >
                <div>
                  <p style={{ ...labelStyle, marginTop: 0 }}>Kode Pesanan</p>
                  <h2
                    style={{
                      fontSize: 20,
                      color: "#214d32",
                      margin: 0,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {order.order_code}
                  </h2>
                </div>
                <span
                  style={{
                    background: "#edf4eb",
                    color: "#2f6b45",
                    borderRadius: 999,
                    padding: "7px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {order.status || "Dalam proses"}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 22,
                }}
              >
                <div>
                  <p style={labelStyle}>Layanan</p>
                  <p style={valueStyle}>{order.service_name || "—"}</p>
                </div>
                <div>
                  <p style={labelStyle}>Jenis Desain</p>
                  <p style={valueStyle}>{order.design_type || "—"}</p>
                </div>
                <div>
                  <p style={labelStyle}>Jumlah Desain</p>
                  <p style={valueStyle}>{order.quantity ?? "—"}</p>
                </div>
                <div>
                  <p style={labelStyle}>Deadline</p>
                  <p style={valueStyle}>
                    {order.deadline
                      ? new Date(`${order.deadline}T00:00:00`).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "Belum ditentukan"}
                  </p>
                </div>
              </div>
            </section>

            <section style={cardStyle}>
              <p style={{ ...labelStyle, marginTop: 0 }}>Arahan Desain</p>
              <h2
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 22,
                  color: "#214d32",
                  margin: "0 0 14px",
                }}
              >
                Brief Utama
              </h2>
              <div
                style={{
                  ...valueStyle,
                  background: "#faf9f6",
                  border: "1px solid #eeeae3",
                  borderRadius: 14,
                  padding: 18,
                  minHeight: 100,
                }}
              >
                {order.brief?.trim() || "Belum ada brief utama yang tercatat."}
              </div>

              <p style={{ ...labelStyle, marginTop: 24 }}>Catatan Tambahan</p>
              <div
                style={{
                  ...valueStyle,
                  background: "#faf9f6",
                  border: "1px solid #eeeae3",
                  borderRadius: 14,
                  padding: 18,
                  minHeight: 72,
                }}
              >
                {order.notes?.trim() || "Tidak ada catatan tambahan."}
              </div>
            </section>

            <p
              style={{
                color: "#718075",
                fontSize: 12,
                lineHeight: 1.8,
                textAlign: "center",
                margin: 0,
              }}
            >
              Pajara Studio · Desain yang punya arah.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function BriefPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#f7f4ee",
            color: "#718075",
            fontSize: 14,
          }}
        >
          Memuat halaman...
        </main>
      }
    >
      <BriefContent />
    </Suspense>
  );
}
