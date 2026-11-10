
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@pajara/supabase";
import CustomerBottomNav from "../components/CustomerBottomNav";
import "./dashboard.css";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  quantity: number | null;
  status: string | null;
  deadline: string | null;
};

type Subscription = {
  id: string;
  plan_id: string;
  expires_at: string | null;
  quota_total: number;
  quota_used: number;
  status: string;
};

type SubscriptionPlan = {
  id: string;
  name: string;
};

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (mounted) {
          setError("Sesi login tidak ditemukan. Silakan login kembali.");
          setLoading(false);
        }
        return;
      }

      if (mounted) {
        setCustomerName(
          user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "Pelanggan Pajara"
        );
      }

      const [ordersResult, subscriptionsResult, plansResult] =
        await Promise.all([
          supabase
            .from("orders")
            .select(
              "id, order_code, service_name, design_type, quantity, status, deadline"
            )
            .eq("customer_id", user.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("subscriptions")
            .select(
              "id, plan_id, expires_at, quota_total, quota_used, status"
            )
            .eq("customer_id", user.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("subscription_plans")
            .select("id, name")
            .eq("is_active", true)
            .order("price", { ascending: true }),
        ]);

      if (!mounted) return;

      if (ordersResult.error) {
        setError("Pesanan belum dapat dimuat. Silakan muat ulang halaman.");
      } else {
        setOrders(ordersResult.data || []);
      }

      setSubscriptions(
        subscriptionsResult.error ? [] : subscriptionsResult.data || []
      );
      setPlans(plansResult.error ? [] : plansResult.data || []);

      setLoading(false);
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const statusLabel = (status: string | null) => {
    switch (status) {
      case "pending":
        return "Pesanan Baru";
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

  const statusClass = (status: string | null) => {
    switch (status) {
      case "completed":
        return "status-completed";
      case "processing":
        return "status-processing";
      case "revision":
        return "status-revision";
      case "cancelled":
        return "status-cancelled";
      case "waiting_payment":
      case "waiting_dp":
        return "status-payment";
      default:
        return "status-pending";
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Belum ditentukan";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const now = Date.now();

  const currentSubscription =
    subscriptions.find(
      (item) =>
        item.status === "active" &&
        !!item.expires_at &&
        new Date(item.expires_at).getTime() > now
    ) ||
    subscriptions.find((item) => item.status === "pending") ||
    null;

  const currentPlan = currentSubscription
    ? plans.find((plan) => plan.id === currentSubscription.plan_id)
    : undefined;

  const isSubscriptionPending = currentSubscription?.status === "pending";

  const isSubscriptionActive =
    currentSubscription?.status === "active" &&
    !!currentSubscription.expires_at &&
    new Date(currentSubscription.expires_at).getTime() > now;

  const remainingQuota = currentSubscription
    ? Math.max(
        0,
        currentSubscription.quota_total - currentSubscription.quota_used
      )
    : 0;

  const activeOrders = orders.filter(
    (order) =>
      order.status !== "completed" && order.status !== "cancelled"
  );

  const paymentOrders = orders.filter(
    (order) =>
      order.status === "waiting_dp" ||
      order.status === "waiting_payment"
  );

  const latestOrder = orders[0] || null;

  if (loading) {
    return (
      <main className="pajara-loading-screen">
        <div className="pajara-loading-orb pajara-loading-orb-one" />
        <div className="pajara-loading-orb pajara-loading-orb-two" />
        <div className="pajara-loading-orb pajara-loading-orb-three" />

        <div className="pajara-loading-glass">
          <div className="pajara-loading-logo-wrap">
            <img
              src={logo}
              alt="Pajara Studio"
              className="pajara-loading-logo"
            />
          </div>

          <p className="pajara-loading-brand">PAJARA STUDIO</p>

          <h1 className="pajara-loading-title">
            Menyiapkan Dashboard
          </h1>

          <p className="pajara-loading-description">
            Sebentar, kami sedang menyiapkan ruang pelanggan Kang/Teh.
          </p>

          <div className="pajara-loading-track">
            <div className="pajara-loading-progress" />
          </div>

          <div className="pajara-loading-footer">
            DESAIN YANG PUNYA ARAH.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-container dashboard-header-inner">
          <a href="/" className="dashboard-brand">
            <img
              src={logo}
              alt="Logo Pajara Studio"
              className="dashboard-logo"
              width={39}
              height={39}
            />
            <span>Pajara Studio</span>
          </a>

          <div className="dashboard-header-actions">
            <button
              type="button"
              className={`dashboard-menu-button ${
                menuOpen ? "is-open" : ""
              }`}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              <span />
              <span />
            </button>

            <a href="/order" className="dashboard-header-link">
              Pesan Desain <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        {menuOpen && (
          <nav className="dashboard-menu" aria-label="Navigasi dashboard">
            <p className="dashboard-menu-label">MENU PELANGGAN</p>

            <a href="/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard <span>↗</span>
            </a>

            <a href="/orders/list" onClick={() => setMenuOpen(false)}>
              Pesanan Saya <span>↗</span>
            </a>

            <a href="/subscriptions" onClick={() => setMenuOpen(false)}>
              Paket Desain <span>↗</span>
            </a>

            <a href="/payments" onClick={() => setMenuOpen(false)}>
              Pembayaran <span>↗</span>
            </a>
          </nav>
        )}
      </header>

      <section className="dashboard-main">
        <div className="dashboard-container">
          <section className="dashboard-welcome">
            <p className="dashboard-eyebrow">Ruang Pelanggan Pajara</p>

            <h1>
              Wilujeng sumping,
              <br />
              <span>{customerName}.</span>
            </h1>

            <p className="description">
              Pantau pesanan dan kebutuhan desain Kang/Teh, semua dari satu
              tempat.
            </p>

            <div className="dashboard-welcome-actions">
              <a href="/order" className="dashboard-button">
                Pesan Desain <span aria-hidden="true">↗</span>
              </a>

              <a href="/orders/list" className="dashboard-button secondary">
                Lihat Pesanan
              </a>
            </div>
          </section>

          {error && (
            <div className="dashboard-alert" role="alert">
              {error}{" "}
              <a href="/login" className="dashboard-alert-link">
                Login kembali
              </a>
            </div>
          )}

          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>Ringkasan Anda</h2>
                <p>Informasi penting tanpa perlu membuka banyak menu.</p>
              </div>
            </div>

            <div className="dashboard-summary-grid">
              <a href="/orders/list" className="dashboard-summary-card">
                <p className="dashboard-summary-label">Pesanan aktif</p>
                <strong className="dashboard-summary-value">
                  {activeOrders.length}
                </strong>
                <p className="dashboard-summary-note">
                  Pesanan yang masih berjalan
                </p>
              </a>

              <a
                href={
                  paymentOrders[0]
                    ? `/orders/payment?id=${encodeURIComponent(
                        paymentOrders[0].id
                      )}`
                    : "/payments"
                }
                className="dashboard-summary-card"
              >
                <p className="dashboard-summary-label">Perlu pembayaran</p>
                <strong className="dashboard-summary-value">
                  {paymentOrders.length}
                </strong>
                <p className="dashboard-summary-note">
                  Pesanan menunggu DP atau pelunasan
                </p>
              </a>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>Pesanan terbaru</h2>
                <p>Lihat perkembangan pesanan terakhir Kang/Teh.</p>
              </div>

              <a href="/orders/list" className="dashboard-text-link">
                Semua pesanan ↗
              </a>
            </div>

            {latestOrder ? (
              <article className="dashboard-card">
                <div className="dashboard-order-top">
                  <div>
                    <p className="dashboard-order-code">
                      {latestOrder.order_code}
                    </p>
                    <h3 className="dashboard-order-name">
                      {latestOrder.service_name || "Layanan desain"}
                    </h3>
                  </div>

                  <span
                    className={`dashboard-status ${statusClass(
                      latestOrder.status
                    )}`}
                  >
                    {statusLabel(latestOrder.status)}
                  </span>
                </div>

                <p className="dashboard-order-meta">
                  {latestOrder.design_type || "Desain"} ·{" "}
                  {latestOrder.quantity || 1} desain
                </p>

                <p className="dashboard-order-meta">
                  Tenggat: {formatDate(latestOrder.deadline)}
                </p>

                <a
                  href={`/orders?id=${encodeURIComponent(latestOrder.id)}`}
                  className="dashboard-card-link"
                >
                  Lihat detail pesanan <span aria-hidden="true">↗</span>
                </a>
              </article>
            ) : (
              <div className="dashboard-empty">
                <strong>Belum ada pesanan desain.</strong>
                <p>
                  Saat Kang/Teh siap, buat pesanan pertama dan pantau
                  perkembangannya dari dashboard ini.
                </p>
                <a href="/order" className="dashboard-card-link">
                  Buat pesanan pertama ↗
                </a>
              </div>
            )}
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>Paket desain</h2>
                <p>Ringkasan langganan Kang/Teh.</p>
              </div>

              <a href="/subscriptions" className="dashboard-text-link">
                Lihat paket ↗
              </a>
            </div>

            <div className="dashboard-card">
              {currentSubscription ? (
                <div className="dashboard-subscription">
                  <div className="dashboard-subscription-icon">✳</div>

                  <div className="dashboard-subscription-content">
                    <strong>
                      {currentPlan?.name ||
                        (isSubscriptionPending
                          ? "Paket menunggu pembayaran"
                          : "Paket langganan")}
                    </strong>

                    {isSubscriptionPending ? (
                      <>
                        <p>
                          Paket belum aktif. Lanjutkan pembayaran agar dapat
                          digunakan setelah diverifikasi.
                        </p>
                        <a
                          href={`/subscriptions/payment?subscription=${encodeURIComponent(
                            currentSubscription.id
                          )}`}
                          className="dashboard-card-link"
                        >
                          Lanjutkan pembayaran ↗
                        </a>
                      </>
                    ) : isSubscriptionActive ? (
                      <>
                        <p>
                          Sisa kuota: {remainingQuota} dari{" "}
                          {currentSubscription.quota_total} desain.
                        </p>
                        <p>
                          Berakhir: {formatDate(currentSubscription.expires_at)}
                        </p>
                        <a
                          href="/subscriptions/request"
                          className="dashboard-card-link"
                        >
                          Pesan desain dengan paket ↗
                        </a>
                      </>
                    ) : (
                      <p>
                        Paket ini sudah tidak aktif. Lihat pilihan paket
                        terbaru untuk melanjutkan.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="dashboard-subscription">
                  <div className="dashboard-subscription-icon">✳</div>

                  <div className="dashboard-subscription-content">
                    <strong>Belum berlangganan paket</strong>
                    <p>
                      Paket mingguan dan bulanan tersedia untuk kebutuhan
                      desain yang berkelanjutan.
                    </p>
                    <a href="/subscriptions" className="dashboard-card-link">
                      Lihat pilihan paket ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          <footer className="dashboard-footer">
            <img
              src={logo}
              alt="Logo Pajara Studio"
              width={43}
              height={43}
              className="dashboard-footer-logo"
            />

            <div className="dashboard-footer-copy">
              <strong>Pajara Studio</strong>
              <p>Berakar di Tanah Pasundan.</p>
              <small>
                © 2026 Pajara Studio. Desain yang punya arah.
              </small>
            </div>
          </footer>
        </div>
      </section>

      <CustomerBottomNav />
    </main>
  );
}
