"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@pajara/supabase";

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
  created_at: string | null;
};

export default function OrderDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) {
        setError("ID pesanan tidak ditemukan.");
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(
          "Sesi Anda tidak ditemukan. Silakan login kembali."
        );
        setLoading(false);
        return;
      }

      const { data, error: orderError } =
        await supabase
          .from("orders")
          .select(
            `
              id,
              order_code,
              service_name,
              design_type,
              quantity,
              brief,
              notes,
              total_amount,
              dp_amount,
              remaining_amount,
              status,
              deadline,
              created_at
            `
          )
          .eq("id", id)
          .eq("customer_id", user.id)
          .maybeSingle();

      if (orderError) {
        setError(orderError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Pesanan tidak ditemukan.");
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);
    };

    loadOrder();
  }, [id]);

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "pending":
        return "Menunggu Diproses";
      case "processing":
        return "Sedang Diproses";
      case "revision":
        return "Dalam Revisi";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status || "Menunggu";
    }
  };

  if (loading) {
    return (
      <main>
        <section className="pajara-order-detail">
          <div className="pajara-container">
            <p>Memuat detail pesanan...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main>
        <section className="pajara-order-detail">
          <div className="pajara-container">
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                PESANAN
              </p>

              <h2>
                Pesanan tidak dapat ditemukan
              </h2>

              <p>
                {error || "Pesanan tidak tersedia."}
              </p>

              <a
                href="/dashboard"
                className="pajara-button pajara-button-primary"
              >
                Kembali ke Dashboard
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <img
              src="/755809946_17926162029385149_3739923509439876817_n.jpg"
              alt="Pajara Studio"
              className="pajara-brand-logo"
            />
            <span>Pajara Studio</span>
          </a>

          <nav className="pajara-nav">
            <a href="/dashboard">Dashboard</a>

            <a
              href="/order"
              className="pajara-nav-cta"
            >
              Pesan Desain
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-order-detail">
        <div className="pajara-container">
          <div className="pajara-order-detail-header">
            <p className="pajara-eyebrow">
              DETAIL PESANAN
            </p>

            <h1>
              Pesanan <span>Pajara.</span>
            </h1>

            <p>
              Pantau status project, pembayaran,
              revisi, dan file desain Anda dari satu
              tempat.
            </p>
          </div>

          <div className="pajara-order-detail-grid">
            <div
              style={{
                display: "grid",
                gap: "20px",
              }}
            >
              <div className="pajara-order-detail-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--brown)",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      ID Pesanan
                    </p>

                    <h2
                      style={{
                        marginTop: "8px",
                        marginBottom: 0,
                      }}
                    >
                      #{order.order_code}
                    </h2>
                  </div>

                  <span className="pajara-order-status">
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  RINGKASAN
                </p>

                <h2>Informasi Pesanan</h2>

                <div
                  style={{
                    display: "grid",
                    gap: "16px",
                    marginTop: "22px",
                  }}
                >
                  <div>
                    <p>Layanan</p>
                    <strong>
                      {order.service_name ||
                        "Belum ditentukan"}
                    </strong>
                  </div>

                  <div>
                    <p>Jenis Desain</p>
                    <strong>
                      {order.design_type ||
                        "Belum ditentukan"}
                    </strong>
                  </div>

                  <div>
                    <p>Jumlah Desain</p>
                    <strong>
                      {order.quantity || 1} desain
                    </strong>
                  </div>

                  <div>
                    <p>Status Project</p>
                    <strong>
                      {getStatusLabel(order.status)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  BRIEF
                </p>

                <h2>Brief Desain</h2>

                <p
                  style={{
                    marginTop: "16px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {order.brief || "Belum ada brief."}
                </p>

                {order.notes && (
                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "20px",
                      borderTop:
                        "1px solid var(--line)",
                    }}
                  >
                    <p>Catatan Tambahan</p>

                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: "20px",
                alignContent: "start",
              }}
            >
              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  AKSES PESANAN
                </p>

                <h2>Kelola Project</h2>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    marginTop: "22px",
                  }}
                >
                  <a
                    href={`/orders/payment?id=${order.id}`}
                    className="pajara-button pajara-button-primary"
                  >
                    Pembayaran
                  </a>

                  <a
                    href={`/orders/revision?id=${order.id}`}
                    className="pajara-button pajara-button-secondary"
                  >
                    Revisi
                  </a>

                  <a
                    href={`/orders/files?id=${order.id}`}
                    className="pajara-button pajara-button-secondary"
                  >
                    File Pesanan
                  </a>
                </div>
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  PEMBAYARAN
                </p>

                <h2>Ringkasan Biaya</h2>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    marginTop: "18px",
                  }}
                >
                  <div>
                    Total: Rp{" "}
                    {(order.total_amount || 0).toLocaleString(
                      "id-ID"
                    )}
                  </div>

                  <div>
                    DP: Rp{" "}
                    {(order.dp_amount || 0).toLocaleString(
                      "id-ID"
                    )}
                  </div>

                  <div>
                    Sisa: Rp{" "}
                    {(order.remaining_amount || 0).toLocaleString(
                      "id-ID"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "28px" }}>
            <a
              href="/dashboard"
              style={{
                color: "var(--green)",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              ← Kembali ke Dashboard
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
