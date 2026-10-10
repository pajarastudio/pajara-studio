
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@pajara/supabase";
import CustomerBottomNav from "../components/CustomerBottomNav";

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

const whatsappLink = "https://wa.me/message/TBAFLG4D554PC1";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");

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

  return (
    <main className="dashboard-page">
      <style jsx global>{`
        .dashboard-page {
          min-height: 100vh;
          padding-bottom: 90px;
          background: #f7f4ee;
          color: #243b2c;
          font-family: "DM Sans", Arial, sans-serif;
        }

        .dashboard-page *,
        .dashboard-page *::before,
        .dashboard-page *::after {
          box-sizing: border-box;
        }

        .dashboard-page a {
          -webkit-tap-highlight-color: transparent;
        }

        .dashboard-container {
          width: min(100% - 32px, 680px);
          margin: 0 auto;
        }

        .dashboard-header {
          position: sticky;
          top: 0;
          z-index: 20;
          border-bottom: 1px solid rgba(47, 107, 69, 0.1);
          background: rgba(247, 244, 238, 0.94);
          backdrop-filter: blur(16px);
        }

        .dashboard-header-inner {
          display: flex;
          min-height: 66px;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .dashboard-brand {
          display: inline-flex;
          min-width: 0;
          align-items: center;
          gap: 10px;
          color: #214d32;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
        }

        .dashboard-logo {
          display: block !important;
          width: 39px !important;
          height: 39px !important;
          min-width: 39px !important;
          max-width: 39px !important;
          min-height: 39px !important;
          max-height: 39px !important;
          flex: 0 0 39px !important;
          border-radius: 12px;
          object-fit: cover;
        }

        .dashboard-header-link {
          flex-shrink: 0;
          color: #536457;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
        }

        .dashboard-header-link.primary {
          padding: 10px 13px;
          border-radius: 10px;
          background: #2f6b45;
          color: #fff;
        }

        .dashboard-main {
          padding-top: 22px;
        }

        .dashboard-welcome {
          position: relative;
          overflow: hidden;
          padding: 25px 22px;
          border-radius: 22px;
          background: linear-gradient(130deg, #214d32, #2f6b45 72%, #477b50);
          color: #fff;
        }

        .dashboard-welcome::after {
          position: absolute;
          top: -55px;
          right: -55px;
          width: 170px;
          height: 170px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          content: "";
          pointer-events: none;
        }

        .dashboard-eyebrow {
          position: relative;
          z-index: 1;
          margin: 0 0 12px;
          color: #d8e7d8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }

        .dashboard-welcome h1 {
          position: relative;
          z-index: 1;
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(27px, 7vw, 35px);
          font-weight: 500;
          letter-spacing: -1px;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .dashboard-welcome h1 span {
          color: #d8e6bd;
          font-style: italic;
        }

        .dashboard-welcome p.description {
          position: relative;
          z-index: 1;
          margin: 11px 0 0;
          color: #e0e9df;
          font-size: 12px;
          line-height: 1.8;
        }

        .dashboard-welcome-actions {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }

        .dashboard-button {
          display: inline-flex;
          min-height: 42px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 14px;
          border-radius: 11px;
          background: #f7f4ee;
          color: #214d32;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .dashboard-button.secondary {
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: transparent;
          color: #fff;
        }

        .dashboard-section {
          margin-top: 27px;
        }

        .dashboard-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 13px;
        }

        .dashboard-section-heading h2 {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          font-weight: 500;
          letter-spacing: -0.5px;
        }

        .dashboard-section-heading p {
          margin: 5px 0 0;
          color: #7a8076;
          font-size: 11px;
          line-height: 1.6;
        }

        .dashboard-text-link {
          flex-shrink: 0;
          color: #2f6b45;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
        }

        .dashboard-summary-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .dashboard-summary-card {
          min-width: 0;
          padding: 17px;
          border: 1px solid #e6e5dc;
          border-radius: 17px;
          background: #fff;
          text-decoration: none;
          color: inherit;
        }

        .dashboard-summary-label {
          margin: 0;
          color: #777d73;
          font-size: 11px;
          line-height: 1.6;
        }

        .dashboard-summary-value {
          display: block;
          margin-top: 7px;
          color: #214d32;
          font-size: 27px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .dashboard-summary-note {
          margin: 6px 0 0;
          color: #777d73;
          font-size: 10px;
          line-height: 1.7;
        }

        .dashboard-card {
          padding: 18px;
          border: 1px solid #e6e5dc;
          border-radius: 18px;
          background: #fff;
        }

        .dashboard-order-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .dashboard-order-code {
          margin: 0;
          color: #8a6a4a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.7px;
          overflow-wrap: anywhere;
        }

        .dashboard-order-name {
          margin: 8px 0 0;
          color: #214d32;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .dashboard-order-meta {
          margin: 6px 0 0;
          color: #777d73;
          font-size: 11px;
          line-height: 1.7;
        }

        .dashboard-status {
          display: inline-flex;
          flex-shrink: 0;
          max-width: 155px;
          padding: 7px 9px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          line-height: 1.5;
        }

        .status-pending {
          background: #f5eddb;
          color: #86601e;
        }

        .status-payment {
          background: #fff0d8;
          color: #89591b;
        }

        .status-processing {
          background: #e8efff;
          color: #38588d;
        }

        .status-revision {
          background: #f4e9fa;
          color: #78508d;
        }

        .status-completed {
          background: #e4f3e7;
          color: #246238;
        }

        .status-cancelled {
          background: #f8e8e6;
          color: #9a4339;
        }

        .dashboard-card-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 15px;
          color: #2f6b45;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .dashboard-empty {
          padding: 19px;
          border: 1px dashed #cbd9c8;
          border-radius: 15px;
          background: #fafbf8;
        }

        .dashboard-empty strong {
          display: block;
          color: #214d32;
          font-size: 13px;
        }

        .dashboard-empty p {
          margin: 7px 0 0;
          color: #747970;
          font-size: 12px;
          line-height: 1.8;
        }

        .dashboard-subscription {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .dashboard-subscription-icon {
          display: flex;
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #edf3e9;
          color: #2f6b45;
          font-family: Georgia, serif;
          font-size: 23px;
        }

        .dashboard-subscription-content {
          min-width: 0;
          flex: 1;
        }

        .dashboard-subscription-content strong {
          display: block;
          color: #214d32;
          font-size: 14px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .dashboard-subscription-content p {
          margin: 5px 0 0;
          color: #777d73;
          font-size: 11px;
          line-height: 1.7;
        }

        .dashboard-alert {
          margin: 13px 0;
          padding: 12px 13px;
          border: 1px solid #f0d5a9;
          border-radius: 11px;
          background: #fff5e4;
          color: #89591b;
          font-size: 12px;
          line-height: 1.7;
        }

        .dashboard-support {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 16px;
          border: 1px solid #d7e5d4;
          border-radius: 17px;
          background: #f0f7ed;
          color: inherit;
          text-decoration: none;
        }

        .dashboard-support-icon {
          display: flex;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #25d366;
          color: #fff;
          font-size: 21px;
        }

        .dashboard-support-content {
          min-width: 0;
          flex: 1;
        }

        .dashboard-support-content strong {
          color: #214d32;
          font-size: 13px;
        }

        .dashboard-support-content p {
          margin: 5px 0 0;
          color: #687366;
          font-size: 11px;
          line-height: 1.7;
        }

        .dashboard-footer {
          padding: 24px 0 20px;
          color: #777c72;
          font-size: 10px;
        }

        .dashboard-footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .dashboard-footer strong {
          color: #214d32;
        }

        @media (max-width: 380px) {
          .dashboard-container {
            width: calc(100% - 24px);
          }

          .dashboard-welcome {
            padding: 22px 18px;
          }

          .dashboard-summary-grid {
            gap: 9px;
          }

          .dashboard-summary-card {
            padding: 13px;
          }

          .dashboard-summary-value {
            font-size: 24px;
          }

          .dashboard-card {
            padding: 15px;
          }

          .dashboard-status {
            max-width: 120px;
            font-size: 9px;
          }

          .dashboard-subscription {
            align-items: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-page *,
          .dashboard-page *::before,
          .dashboard-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <header className="dashboard-header">
        <div className="dashboard-container dashboard-header-inner">
          <a href="/" className="dashboard-brand">
            <img
              src={logo}
              alt="Logo Pajara Studio"
              className="dashboard-logo"
              width={39}
              height={39}
              style={{
                display: "block",
                width: "39px",
                height: "39px",
                minWidth: "39px",
                maxWidth: "39px",
                minHeight: "39px",
                maxHeight: "39px",
                objectFit: "cover",
                borderRadius: "12px",
                flexShrink: 0,
              }}
            />
            <span>Pajara Studio</span>
          </a>

          <a href="/order" className="dashboard-header-link primary">
            + Pesan Desain
          </a>
        </div>
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
              <a
                href="/login"
                style={{ color: "inherit", fontWeight: 800 }}
              >
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
                  {loading ? "—" : activeOrders.length}
                </strong>
                <p className="dashboard-summary-note">
                  Pesanan yang masih berjalan
                </p>
              </a>

              <a
                href={
                  paymentOrders[0]
                    ? `/orders/payment?id=${encodeURIComponent(paymentOrders[0].id)}`
                    : "/payments"
                }
                className="dashboard-summary-card"
              >
                <p className="dashboard-summary-label">Perlu pembayaran</p>
                <strong className="dashboard-summary-value">
                  {loading ? "—" : paymentOrders.length}
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

            {loading ? (
              <div className="dashboard-card">
                <p className="dashboard-order-meta">Memuat pesanan...</p>
              </div>
            ) : latestOrder ? (
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
              {loading ? (
                <p className="dashboard-order-meta">
                  Memuat informasi paket...
                </p>
              ) : currentSubscription ? (
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

          <section className="dashboard-section">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="dashboard-support"
            >
              <span className="dashboard-support-icon" aria-hidden="true">
                ☎
              </span>

              <span className="dashboard-support-content">
                <strong>Butuh bantuan atau konsultasi?</strong>
                <p>
                  Hubungi tim Pajara Studio melalui WhatsApp.{" "}
                  <span style={{ color: "#2f6b45", fontWeight: 800 }}>
                    Chat sekarang ↗
                  </span>
                </p>
              </span>
            </a>
          </section>

          <footer className="dashboard-footer">
            <div className="dashboard-footer-inner">
              <span>
                © {new Date().getFullYear()} <strong>Pajara Studio</strong>
              </span>
              <span>Berakar di Tanah Pasundan.</span>
            </div>
          </footer>
        </div>
      </section>

      <CustomerBottomNav />
    </main>
  );
}
