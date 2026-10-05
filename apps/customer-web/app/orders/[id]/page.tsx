"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function OrderDetail() {
  const params = useParams();
  const id = String(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
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

  const getStatusLabel = (
    status: string | null
  ) => {
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
        <header className="pajara-navbar">
          <div className="pajara-container pajara-navbar-inner">
            <a
              href="/"
              className="pajara-brand"
            >
              <img
                src="/755809946_17926162029385149_3739923509439876817_n.jpg"
                alt="Pajara Studio"
                className="pajara-brand-logo"
              />

              <span>Pajara Studio</span>
            </a>

            <nav className="pajara-nav">
              <a href="/dashboard">
                Dashboard
              </a>

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
            <p>Memuat detail pesanan...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main>
        <header className="pajara-navbar">
          <div className="pajara-container pajara-navbar-inner">
            <a
              href="/"
              className="pajara-brand"
            >
              <img
                src="/755809946_17926162029385149_3739923509439876817_n.jpg"
                alt="Pajara Studio"
                className="pajara-brand-logo"
              />

              <span>Pajara Studio</span>
            </a>

            <nav className="pajara-nav">
              <a href="/dashboard">
                Dashboard
              </a>

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
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                PESANAN
              </p>

              <h2>
                Pesanan tidak dapat ditemukan
              </h2>

              <p>
                {error ||
                  "Pesanan tidak tersedia."}
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
          <a
            href="/"
            className="pajara-brand"
          >
            <img
              src="/755809946_17926162029385149_3739923509439876817_n.jpg"
              alt="Pajara Studio"
              className="pajara-brand-logo"
            />

            <span>Pajara Studio</span>
          </a>

          <nav className="pajara-nav">
            <a href="/dashboard">
              Dashboard
            </a>

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
                        textTransform:
                          "uppercase",
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
                    {getStatusLabel(
                      order.status
                    )}
                  </span>
                </div>
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  RINGKASAN
                </p>

                <h2>
                  Informasi Pesanan
                </h2>

                <div
                  style={{
                    display: "grid",
                    gap: "16px",
                    marginTop: "22px",
                  }}
                >
                  <div
                    style={{
                      paddingBottom: "16px",
                      borderBottom:
                        "1px solid var(--line)",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--muted)",
                      }}
                    >
                      Layanan
                    </p>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color:
                          "var(--green-dark)",
                      }}
                    >
                      {order.service_name ||
                        "Belum ditentukan"}
                    </strong>
                  </div>

                  <div
                    style={{
                      paddingBottom: "16px",
                      borderBottom:
                        "1px solid var(--line)",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--muted)",
                      }}
                    >
                      Jenis Desain
                    </p>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color:
                          "var(--green-dark)",
                      }}
                    >
                      {order.design_type ||
                        "Belum ditentukan"}
                    </strong>
                  </div>

                  <div
                    style={{
                      paddingBottom: "16px",
                      borderBottom:
                        "1px solid var(--line)",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--muted)",
                      }}
                    >
                      Jumlah Desain
                    </p>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color:
                          "var(--green-dark)",
                      }}
                    >
                      {order.quantity || 1} desain
                    </strong>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--muted)",
                      }}
                    >
                      Status Project
                    </p>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color:
                          "var(--green-dark)",
                      }}
                    >
                      {getStatusLabel(
                        order.status
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  BRIEF
                </p>

                <h2>
                  Brief Desain
                </h2>

                <p
                  style={{
                    marginTop: "16px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {order.brief ||
                    "Belum ada brief."}
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
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--muted)",
                      }}
                    >
                      Catatan Tambahan
                    </p>

                    <p
                      style={{
                        marginTop: "8px",
                        whiteSpace:
                          "pre-wrap",
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

                <h2>
                  Kelola Project
                </h2>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    marginTop: "22px",
                  }}
                >
                  <a
                    href={`/orders/${order.id}/payment`}
                    className="pajara-button pajara-button-primary"
                    style={{
                      width: "100%",
                    }}
                  >
                    Pembayaran
                  </a>

                  <a
                    href={`/orders/${order.id}/revision`}
                    className="pajara-button pajara-button-secondary"
                    style={{
                      width: "100%",
                    }}
                  >
                    Revisi
                  </a>

                  <a
                    href={`/orders/${order.id}/files`}
                    className="pajara-button pajara-button-secondary"
                    style={{
                      width: "100%",
                    }}
                  >
                    File Pesanan
                  </a>
                </div>
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  PEMBAYARAN
                </p>

                <h2>
                  Ringkasan Biaya
                </h2>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    marginTop: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "16px",
                    }}
                  >
                    <span>
                      Total
                    </span>

                    <strong>
                      Rp{" "}
                      {(
                        order.total_amount ||
                        0
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "16px",
                    }}
                  >
                    <span>
                      DP
                    </span>

                    <strong>
                      Rp{" "}
                      {(
                        order.dp_amount ||
                        0
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "16px",
                      paddingTop: "12px",
                      borderTop:
                        "1px solid var(--line)",
                    }}
                  >
                    <span>
                      Sisa
                    </span>

                    <strong>
                      Rp{" "}
                      {(
                        order.remaining_amount ||
                        0
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  CATATAN
                </p>

                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                  }}
                >
                  Detail pesanan dan status project
                  akan diperbarui setelah pesanan
                  dikonfirmasi oleh Pajara Studio.
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "28px",
            }}
          >
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
