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

type SubscriptionPlan = {
id: string;
name: string;
description: string | null;
price: number;
duration_days: number;
quota_total: number;
};

type Subscription = {
id: string;
plan_id: string;
started_at: string | null;
expires_at: string | null;
quota_total: number;
quota_used: number;
status: string;
created_at: string;
};

export default function CustomerDashboard() {
const [orders, setOrders] = useState<Order[]>([]);
const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [subscriptionError, setSubscriptionError] = useState("");

useEffect(() => {
let mounted = true;

const loadDashboard = async () => {
  setLoading(true);
  setError("");
  setSubscriptionError("");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    if (mounted) {
      setError("Sesi Anda tidak ditemukan. Silakan login kembali.");
      setLoading(false);
    }
    return;
  }

  const [ordersResult, plansResult, subscriptionsResult] =
    await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, order_code, service_name, design_type, quantity, status, deadline"
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("subscription_plans")
        .select(
          "id, name, description, price, duration_days, quota_total"
        )
        .eq("is_active", true)
        .order("price", { ascending: true }),

      supabase
        .from("subscriptions")
        .select(
          "id, plan_id, started_at, expires_at, quota_total, quota_used, status, created_at"
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  if (!mounted) return;

  if (ordersResult.error) {
    setError(ordersResult.error.message);
  } else {
    setOrders(ordersResult.data || []);
  }

  if (plansResult.error) {
    setSubscriptionError(
      "Paket belum dapat dimuat. Silakan muat ulang halaman."
    );
  } else {
    setPlans(plansResult.data || []);
  }

  if (subscriptionsResult.error) {
    setSubscriptionError(
      "Informasi langganan belum dapat dimuat. Silakan muat ulang halaman."
    );
  } else {
    setSubscriptions(subscriptionsResult.data || []);
  }

  setLoading(false);
};

loadDashboard();

return () => {
  mounted = false;
};

}, []);

const getStatusLabel = (status: string | null) => {
switch (status) {
case "pending":
return "Menunggu Diproses";
case "waiting_dp":
return "Menunggu Pembayaran DP";
case "processing":
return "Sedang Diproses";
case "revision":
return "Dalam Revisi";
case "waiting_payment":
return "Menunggu Pelunasan";
case "completed":
return "Selesai";
case "cancelled":
return "Dibatalkan";
default:
return status || "Menunggu";
}
};

const formatRupiah = (amount: number) =>
new Intl.NumberFormat("id-ID", {
style: "currency",
currency: "IDR",
maximumFractionDigits: 0,
}).format(amount);

const formatDate = (date: string | null) => {
if (!date) return "Belum tersedia";

return new Date(date).toLocaleDateString("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

};

const now = Date.now();

const activeSubscription = subscriptions.find(
(subscription) =>
subscription.status === "active" &&
subscription.expires_at !== null &&
new Date(subscription.expires_at).getTime() > now
);

const pendingSubscription = subscriptions.find(
(subscription) => subscription.status === "pending"
);

const currentSubscription =
activeSubscription || pendingSubscription || null;

const currentPlan = currentSubscription
? plans.find((plan) => plan.id === currentSubscription.plan_id)
: undefined;

const remainingQuota = currentSubscription
? Math.max(
0,
currentSubscription.quota_total - currentSubscription.quota_used
)
: 0;

const subscriptionStatusLabel = (subscription: Subscription) => {
if (
subscription.status === "active" &&
subscription.expires_at &&
new Date(subscription.expires_at).getTime() > Date.now()
) {
return "Aktif";
}

if (
  subscription.status === "active" ||
  (subscription.expires_at &&
    new Date(subscription.expires_at).getTime() <= Date.now())
) {
  return "Kedaluwarsa";
}

switch (subscription.status) {
  case "pending":
    return "Menunggu Pembayaran";
  case "expired":
    return "Kedaluwarsa";
  case "cancelled":
    return "Dibatalkan";
  default:
    return subscription.status;
}

};

const subscriptionStatusColor = (status: string) => {
if (status === "Aktif") {
return {
background: "#e4f3e7",
color: "#246238",
};
}

if (status === "Menunggu Pembayaran") {
  return {
    background: "#fff0d8",
    color: "#89591b",
  };
}

return {
  background: "#f0eeea",
  color: "#716b63",
};

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
        <a href="/subscriptions">Paket Desain</a>
        <a href="/order" className="pajara-nav-cta">
          Pesan Desain
        </a>
      </nav>
    </div>
  </header>

  <section className="pajara-dashboard">
    <div className="pajara-container">
      <div className="pajara-dashboard-header">
        <div>
          <p className="pajara-eyebrow">Customer Dashboard</p>
          <h1>
            Selamat datang di <span>Pajara.</span>
          </h1>
          <p>
            Pantau pesanan, paket langganan, pembayaran, revisi,
            dan file desain Anda di satu tempat.
          </p>
        </div>
      </div>

      {/* PAKET LANGGANAN */}
      <section
        style={{
          marginBottom: "28px",
          padding: "24px",
          borderRadius: "22px",
          background:
            "linear-gradient(135deg, #214d32 0%, #2f6b45 100%)",
          color: "#fff",
          boxShadow: "0 12px 30px rgba(33,77,50,0.13)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "1.5px",
            color: "#d5e5d7",
          }}
        >
          PAJARA SUBSCRIPTION
        </p>

        <h2
          style={{
            margin: "8px 0",
            fontSize: "24px",
            lineHeight: 1.3,
          }}
        >
          Paket Desain Anda
        </h2>

        <p
          style={{
            margin: "0 0 20px",
            color: "#e0e9e1",
            fontSize: "13px",
            lineHeight: 1.7,
          }}
        >
          Pilih paket sesuai kebutuhan desain. Setiap kuota berlaku
          untuk satu output desain.
        </p>

        {subscriptionError && (
          <p
            role="alert"
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "#fff0d8",
              color: "#75491b",
              fontSize: "13px",
            }}
          >
            {subscriptionError}
          </p>
        )}

        {loading ? (
          <p style={{ color: "#e0e9e1", fontSize: "13px" }}>
            Memuat informasi paket...
          </p>
        ) : (
          <>
            {currentSubscription && (
              <div
                style={{
                  padding: "17px",
                  marginBottom: "18px",
                  borderRadius: "15px",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <strong style={{ fontSize: "16px" }}>
                    {currentPlan?.name || "Paket Langganan"}
                  </strong>

                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 800,
                      background:
                        subscriptionStatusColor(
                          subscriptionStatusLabel(currentSubscription)
                        ).background,
                      color:
                        subscriptionStatusColor(
                          subscriptionStatusLabel(currentSubscription)
                        ).color,
                    }}
                  >
                    {subscriptionStatusLabel(currentSubscription)}
                  </span>
                </div>

                {currentSubscription.status === "pending" ? (
                  <div>
                    <p
                      style={{
                        margin: "12px 0",
                        fontSize: "13px",
                        color: "#edf4ed",
                        lineHeight: 1.6,
                      }}
                    >
                      Pembelian paket Anda belum aktif. Lanjutkan
                      pembayaran dan tunggu verifikasi Admin.
                    </p>

                    <a
                      href={`/subscriptions/payment?subscription=${encodeURIComponent(
                        currentSubscription.id
                      )}`}
                      style={{
                        display: "inline-block",
                        padding: "11px 15px",
                        borderRadius: "10px",
                        background: "#fff",
                        color: "#214d32",
                        fontWeight: 800,
                        fontSize: "13px",
                        textDecoration: "none",
                      }}
                    >
                      Lanjutkan Pembayaran
                    </a>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(125px, 1fr))",
                        gap: "10px",
                        marginTop: "18px",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "11px",
                            color: "#d5e5d7",
                          }}
                        >
                          Sisa Kuota
                        </p>
                        <strong
                          style={{
                            display: "block",
                            marginTop: "5px",
                            fontSize: "22px",
                          }}
                        >
                          {remainingQuota} desain
                        </strong>
                      </div>

                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "11px",
                            color: "#d5e5d7",
                          }}
                        >
                          Kuota Terpakai
                        </p>
                        <strong
                          style={{
                            display: "block",
                            marginTop: "5px",
                            fontSize: "22px",
                          }}
                        >
                          {currentSubscription.quota_used} /{" "}
                          {currentSubscription.quota_total}
                        </strong>
                      </div>

                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "11px",
                            color: "#d5e5d7",
                          }}
                        >
                          Berakhir Pada
                        </p>
                        <strong
                          style={{
                            display: "block",
                            marginTop: "5px",
                            fontSize: "13px",
                          }}
                        >
                          {formatDate(currentSubscription.expires_at)}
                        </strong>
                      </div>
                    </div>

                    {subscriptionStatusLabel(currentSubscription) ===
                      "Aktif" && (
                      <>
                        <a
                          href="/subscriptions"
                          style={{
                            display: "inline-block",
                            marginTop: "18px",
                            padding: "11px 15px",
                            borderRadius: "10px",
                            background: "#fff",
                            color: "#214d32",
                            fontWeight: 800,
                            fontSize: "13px",
                            textDecoration: "none",
                          }}
                        >
                          Lihat Paket
                        </a>

                        <a
                          href="/subscriptions/request"
                          style={{
                            display: "inline-block",
                            marginTop: "18px",
                            marginLeft: "8px",
                            padding: "11px 15px",
                            borderRadius: "10px",
                            background: "#f7f4ee",
                            color: "#214d32",
                            fontWeight: 800,
                            fontSize: "13px",
                            textDecoration: "none",
                          }}
                        >
                          Pesan Desain Paket
                        </a>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {!currentSubscription && (
              <div
                style={{
                  padding: "16px",
                  marginBottom: "18px",
                  borderRadius: "15px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <strong>Belum memiliki paket aktif</strong>
                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#e0e9e1",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  Pilih Paket Mingguan atau Bulanan untuk memulai
                  langganan desain Anda.
                </p>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "12px",
              }}
            >
              {plans.map((plan) => {
                const isWeekly =
                  plan.duration_days === 7 || /mingguan/i.test(plan.name);

                return (
                  <div
                    key={plan.id}
                    style={{
                      padding: "18px",
                      borderRadius: "16px",
                      background: "#fff",
                      color: "#214d32",
                      border: "1px solid #e5ebe5",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#8a6a4a",
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "1px",
                      }}
                    >
                      {isWeekly
                        ? "FLEKSIBEL MINGGUAN"
                        : "LANGGANAN DESAIN"}
                    </p>

                    <h3
                      style={{
                        margin: "8px 0",
                        fontSize: "19px",
                      }}
                    >
                      {plan.name}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 12px",
                        fontSize: "23px",
                        fontWeight: 900,
                      }}
                    >
                      {formatRupiah(plan.price)}
                    </p>

                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: "13px",
                        color: "#626a63",
                      }}
                    >
                      {plan.duration_days} hari masa aktif
                    </p>

                    <p
                      style={{
                        margin: "5px 0 12px",
                        fontSize: "13px",
                        color: "#626a63",
                      }}
                    >
                      {plan.quota_total} kuota desain
                    </p>

                    {plan.description && (
                      <p
                        style={{
                          margin: "0 0 15px",
                          fontSize: "12px",
                          lineHeight: 1.6,
                          color: "#737a74",
                        }}
                      >
                        {plan.description}
                      </p>
                    )}

                    <a
                      href="/subscriptions"
                      style={{
                        display: "block",
                        padding: "11px 12px",
                        textAlign: "center",
                        borderRadius: "10px",
                        background: "#2f6b45",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: 800,
                        textDecoration: "none",
                      }}
                    >
                      {activeSubscription
                        ? "Lihat Paket"
                        : pendingSubscription
                          ? "Lihat Pembelian"
                          : "Pilih Paket"}
                    </a>
                  </div>
                );
              })}
            </div>

            {!subscriptionError && plans.length === 0 && (
              <p
                style={{
                  marginTop: "14px",
                  fontSize: "13px",
                  color: "#e0e9e1",
                }}
              >
                Belum ada paket aktif yang tersedia.
              </p>
            )}
          </>
        )}
      </section>

      {/* PESANAN DESAIN BIASA */}
      <div className="pajara-dashboard-cards">
        <div className="pajara-dashboard-card">
          <div className="pajara-dashboard-icon">01</div>

          <div>
            <p className="pajara-dashboard-label">Pesanan Aktif</p>
            <h3>Pesanan Anda</h3>

            {loading && <p>Memuat pesanan...</p>}

            {error && (
              <p style={{ color: "#8b3030" }}>{error}</p>
            )}

            {!loading && !error && orders.length === 0 && (
              <p>
                Belum ada pesanan. Silakan buat pesanan baru.
              </p>
            )}

            {!loading && !error && orders.length > 0 && (
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
                    <strong>{order.order_code}</strong>

                    <p style={{ margin: "6px 0 0" }}>
                      {order.service_name || "Layanan desain"}
                      {" · "}
                      {order.design_type || "Desain"}
                    </p>

                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "14px",
                        opacity: 0.7,
                      }}
                    >
                      {getStatusLabel(order.status)}
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
              : "/orders"
          }
          className="pajara-dashboard-card"
        >
          <div className="pajara-dashboard-icon">02</div>
          <div>
            <p className="pajara-dashboard-label">Pembayaran</p>
            <h3>Status Pembayaran</h3>
            <p>
              Lihat informasi pembayaran dan status verifikasi
              pesanan desain Anda.
            </p>
          </div>
        </a>

        <a
          href={
            orders.length > 0
              ? `/orders/revision?id=${orders[0].id}`
              : "/orders"
          }
          className="pajara-dashboard-card"
        >
          <div className="pajara-dashboard-icon">03</div>
          <div>
            <p className="pajara-dashboard-label">Revisi</p>
            <h3>Catatan Revisi</h3>
            <p>
              Lihat catatan revisi untuk pesanan desain Anda.
            </p>
          </div>
        </a>

        <a
          href={
            orders.length > 0
              ? `/orders/files?id=${orders[0].id}`
              : "/orders"
          }
          className="pajara-dashboard-card"
        >
          <div className="pajara-dashboard-icon">04</div>
          <div>
            <p className="pajara-dashboard-label">File Final</p>
            <h3>File Desain</h3>
            <p>
              Akses file desain final setelah pesanan selesai.
            </p>
          </div>
        </a>

        {/* WHATSAPP PAJARA STUDIO */}
        <a
          href="https://wa.me/message/TBAFLG4D554PC1"
          target="_blank"
          rel="noopener noreferrer"
          className="pajara-dashboard-card"
          style={{
            textDecoration: "none",
            color: "inherit",
            border: "1px solid #d7eadb",
            background:
              "linear-gradient(135deg, #ffffff 0%, #f0f8f1 100%)",
          }}
        >
          <div
            className="pajara-dashboard-icon"
            style={{
              background: "#25D366",
              color: "#ffffff",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            ☎
          </div>

          <div>
            <p
              className="pajara-dashboard-label"
              style={{ color: "#2f6b45" }}
            >
              BANTUAN & KONSULTASI
            </p>
            <h3>Butuh Bantuan?</h3>
            <p>
              Ada yang ingin ditanyakan tentang pesanan atau layanan
              desain? Hubungi Pajara Studio melalui WhatsApp.
            </p>
            <span
              style={{
                display: "inline-block",
                marginTop: "12px",
                padding: "9px 13px",
                borderRadius: "9px",
                background: "#25D366",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              Chat WhatsApp ↗
            </span>
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
