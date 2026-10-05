"use client";

import { useEffect, useState } from "react";
import { supabase } from "@pajara/supabase";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  quantity: number | null;
  status: string | null;
  deadline: string | null;
};

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError("");

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

      const { data, error: ordersError } =
        await supabase
          .from("orders")
          .select(
            "id, order_code, service_name, design_type, quantity, status, deadline"
          )
          .eq("customer_id", user.id)
          .order("created_at", {
            ascending: false,
          });

      if (ordersError) {
        setError(ordersError.message);
        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    };

    loadOrders();
  }, []);

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
            <a href="/">Website</a>

            <a
              href="/order"
              className="pajara-nav-cta"
            >
              Pesan Desain
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-dashboard">
        <div className="pajara-container">
          <div className="pajara-dashboard-header">
            <div>
              <p className="pajara-eyebrow">
                Customer Dashboard
              </p>

              <h1>
                Selamat datang di{" "}
                <span>Pajara.</span>
              </h1>

              <p>
                Dari sini Anda dapat memantau pesanan,
                pembayaran, revisi, dan file desain.
              </p>
            </div>
          </div>

          <div className="pajara-dashboard-cards">
            <div className="pajara-dashboard-card">
              <div className="pajara-dashboard-icon">
                01
              </div>

              <div>
                <p className="pajara-dashboard-label">
                  Pesanan Aktif
                </p>

                <h3>Pesanan Anda</h3>

                {loading && (
                  <p>
                    Memuat pesanan...
                  </p>
                )}

                {error && (
                  <p
                    style={{
                      color: "#8b3030",
                    }}
                  >
                    {error}
                  </p>
                )}

                {!loading &&
                  !error &&
                  orders.length === 0 && (
                    <p>
                      Belum ada pesanan. Silakan buat
                      pesanan baru.
                    </p>
                  )}

                {!loading &&
                  !error &&
                  orders.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gap: "12px",
                        marginTop: "16px",
                      }}
                    >
                      {orders.map((order) => (
                        <a
                          key={order.id}
                          href={`/orders?id=${order.id}`}
                          style={{
                            display: "block",
                            padding: "16px",
                            border: "1px solid var(--line)",
                            borderRadius: "14px",
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          <strong>
                            {order.order_code}
                          </strong>

                          <p
                            style={{
                              margin:
                                "6px 0 0",
                            }}
                          >
                            {order.service_name ||
                              "Layanan desain"}
                            {" · "}
                            {order.design_type ||
                              "Desain"}
                          </p>

                          <p
                            style={{
                              margin:
                                "6px 0 0",
                              fontSize: "14px",
                              opacity: 0.7,
                            }}
                          >
                            {getStatusLabel(
                              order.status
                            )}
                            {" · "}
                            {order.quantity || 1} desain
                          </p>
                        </a>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <a
              href={
                orders.length > 0
                  ? `/orders/payment?id=${orders[0].id}`
                  : "/orders/demo/payment"
              }
              className="pajara-dashboard-card"
            >
              <div className="pajara-dashboard-icon">
                02
              </div>

              <div>
                <p className="pajara-dashboard-label">
                  Pembayaran
                </p>

                <h3>Status Pembayaran</h3>

                <p>
                  Informasi pembayaran dan status
                  verifikasi akan ditampilkan di sini.
                </p>
              </div>
            </a>

            <a
              href={
                orders.length > 0
                  ? `/orders/revision?id=${orders[0].id}`
                  : "/orders/demo/revision"
              }
              className="pajara-dashboard-card"
            >
              <div className="pajara-dashboard-icon">
                03
              </div>

              <div>
                <p className="pajara-dashboard-label">
                  Revisi
                </p>

                <h3>Catatan Revisi</h3>

                <p>
                  Catatan revisi dan komunikasi project
                  akan tersedia di bagian ini.
                </p>
              </div>
            </a>

            <a
              href={
                orders.length > 0
                  ? `/orders/files?id=${orders[0].id}`
                  : "/orders/demo/files"
              }
              className="pajara-dashboard-card"
            >
              <div className="pajara-dashboard-icon">
                04
              </div>

              <div>
                <p className="pajara-dashboard-label">
                  File Final
                </p>

                <h3>File Desain</h3>

                <p>
                  File desain final dapat diakses setelah
                  project selesai.
                </p>
              </div>
            </a>
          </div>

          <div className="pajara-dashboard-actions">
            <a
              href="/order"
              className="pajara-button pajara-button-primary"
            >
              Buat Pesanan Baru
            </a>

            <a
              href="/"
              className="pajara-button pajara-button-secondary"
            >
              Kembali ke Website
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
