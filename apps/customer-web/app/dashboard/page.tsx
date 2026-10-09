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

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

const whatsappLink = "https://wa.me/message/TBAFLG4D554PC1";

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
        setError("Pesanan belum dapat dimuat. Silakan muat ulang halaman.");
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

  const getOrderStatusClass = (status: string | null) => {
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

  const subscriptionStatusClass = (status: string) => {
    if (status === "Aktif") return "subscription-active";
    if (status === "Menunggu Pembayaran") return "subscription-pending";
    return "subscription-expired";
  };

  const firstOrder = orders[0];

  return (
    <main className="dashboard-page">
      <style jsx global>{`
        .dashboard-page {
          min-height: 100vh;
          background: #f7f4ee;
          color: #243b2c;
          font-family: "DM Sans", Arial, sans-serif;
        }

        .dashboard-page * {
          box-sizing: border-box;
        }

        .dashboard-page a {
          -webkit-tap-highlight-color: transparent;
        }

        .dashboard-container {
          width: min(1120px, calc(100% - 48px));
          margin: 0 auto;
        }

        .dashboard-navbar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(247, 244, 238, 0.92);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(47, 107, 69, 0.11);
        }

        .dashboard-navbar-inner {
          min-height: 76px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .dashboard-brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: #214d32;
          font-weight: 800;
          font-size: 17px;
          letter-spacing: -0.5px;
          text-decoration: none;
        }

        .dashboard-brand-logo {
          display: block;
          width: 43px;
          height: 43px;
          object-fit: cover;
          border-radius: 13px;
          box-shadow: 0 5px 15px rgba(33, 77, 50, 0.13);
        }

        .dashboard-nav {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .dashboard-nav a {
          color: #536457;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: color 180ms ease;
        }

        .dashboard-nav a:hover {
          color: #2f6b45;
        }

        .dashboard-nav .dashboard-nav-primary {
          padding: 12px 17px;
          color: white;
          background: #2f6b45;
          border-radius: 12px;
          box-shadow: 0 5px 13px rgba(47, 107, 69, 0.13);
          transition:
            transform 180ms ease,
            background 180ms ease;
        }

        .dashboard-nav .dashboard-nav-primary:hover {
          background: #214d32;
          color: white;
          transform: translateY(-2px);
        }

        .dashboard-main {
          padding: 39px 0 125px;
        }

        .dashboard-hero {
          position: relative;
          overflow: hidden;
          padding: 39px 40px;
          margin-bottom: 25px;
          border-radius: 27px;
          color: white;
          background:
            radial-gradient(
              circle at 88% 15%,
              rgba(225, 235, 207, 0.17),
              transparent 28%
            ),
            linear-gradient(125deg, #214d32 0%, #2f6b45 62%, #477b50 100%);
          box-shadow: 0 18px 42px rgba(33, 77, 50, 0.12);
          animation: dashboard-rise 650ms ease both;
        }

        .dashboard-hero::before,
        .dashboard-hero::after {
          position: absolute;
          content: "";
          pointer-events: none;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 50%;
        }

        .dashboard-hero::before {
          width: 290px;
          height: 290px;
          right: -90px;
          top: -170px;
        }

        .dashboard-hero::after {
          width: 230px;
          height: 230px;
          right: -58px;
          top: -140px;
        }

        .dashboard-hero-content {
          position: relative;
          z-index: 1;
          max-width: 670px;
        }

        .dashboard-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 0 0 15px;
          color: #d8e7d8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .dashboard-eyebrow::before {
          content: "";
          width: 23px;
          height: 1px;
          background: #c9d9b9;
        }

        .dashboard-hero h1 {
          max-width: 650px;
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(31px, 4.5vw, 48px);
          font-weight: 500;
          letter-spacing: -1.8px;
          line-height: 1.12;
        }

        .dashboard-hero h1 span {
          color: #d8e6bd;
          font-style: italic;
        }

        .dashboard-hero-description {
          max-width: 525px;
          margin: 17px 0 0;
          color: #e0e9df;
          font-size: 14px;
          line-height: 1.85;
        }

        .dashboard-hero-bottom {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 26px;
        }

        .dashboard-hero-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 13px 17px;
          border-radius: 12px;
          background: #f7f4ee;
          color: #214d32;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .dashboard-hero-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .dashboard-hero-note {
          color: #dce7da;
          font-size: 12px;
        }

        .dashboard-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          margin: 36px 0 17px;
        }

        .dashboard-section-kicker {
          margin: 0 0 7px;
          color: #8a6a4a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        .dashboard-section-heading h2 {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(24px, 3vw, 31px);
          font-weight: 500;
          letter-spacing: -0.7px;
        }

        .dashboard-section-caption {
          max-width: 340px;
          margin: 0;
          color: #777b72;
          font-size: 12px;
          line-height: 1.7;
          text-align: right;
        }

        .subscription-panel {
          position: relative;
          overflow: hidden;
          padding: 28px;
          border: 1px solid rgba(47, 107, 69, 0.13);
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 9px 28px rgba(49, 62, 47, 0.035);
          animation: dashboard-rise 700ms ease both;
        }

        .subscription-panel-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 22px;
        }

        .subscription-panel-kicker {
          margin: 0 0 9px;
          color: #8a6a4a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.6px;
        }

        .subscription-panel h3 {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 27px;
          font-weight: 500;
          letter-spacing: -0.6px;
        }

        .subscription-panel-intro {
          max-width: 520px;
          margin: 10px 0 0;
          color: #72786f;
          font-size: 13px;
          line-height: 1.8;
        }

        .subscription-decoration {
          display: flex;
          width: 49px;
          height: 49px;
          flex: 0 0 49px;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: #edf3e9;
          color: #2f6b45;
          font-family: Georgia, serif;
          font-size: 23px;
        }

        .subscription-current {
          margin-bottom: 24px;
          padding: 21px;
          border: 1px solid #dce8da;
          border-radius: 18px;
          background:
            radial-gradient(
              circle at 100% 0,
              rgba(218, 233, 211, 0.45),
              transparent 45%
            ),
            #f7f9f4;
        }

        .subscription-current-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .subscription-current-name {
          color: #214d32;
          font-size: 17px;
          font-weight: 800;
        }

        .subscription-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 800;
        }

        .subscription-badge::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .subscription-active {
          background: #e4f3e7;
          color: #246238;
        }

        .subscription-pending {
          background: #fff0d8;
          color: #89591b;
        }

        .subscription-expired {
          background: #f0eeea;
          color: #716b63;
        }

        .subscription-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 21px;
        }

        .subscription-metric {
          padding: 15px;
          border: 1px solid #e4e9df;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.8);
        }

        .subscription-metric-label {
          margin: 0;
          color: #7a8076;
          font-size: 11px;
        }

        .subscription-metric-value {
          display: block;
          margin-top: 8px;
          color: #214d32;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .subscription-metric-value.date-value {
          font-size: 13px;
          letter-spacing: 0;
          line-height: 1.6;
        }

        .dashboard-action-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          margin-top: 17px;
          padding: 11px 14px;
          border: 1px solid #dce6d9;
          border-radius: 11px;
          background: #fff;
          color: #214d32;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition:
            background 180ms ease,
            transform 180ms ease;
        }

        .dashboard-action-link:hover {
          background: #edf3e9;
          transform: translateY(-1px);
        }

        .dashboard-action-link.primary {
          border-color: #2f6b45;
          background: #2f6b45;
          color: #fff;
        }

        .dashboard-action-link.primary:hover {
          background: #214d32;
        }

        .subscription-current-note {
          margin: 12px 0 0;
          color: #72786f;
          font-size: 12px;
          line-height: 1.8;
        }

        .subscription-empty {
          margin-bottom: 23px;
          padding: 20px;
          border: 1px dashed #cbd9c8;
          border-radius: 16px;
          background: #f8faf6;
        }

        .subscription-empty strong {
          display: block;
          color: #214d32;
          font-size: 14px;
        }

        .subscription-empty p {
          margin: 7px 0 0;
          color: #73796f;
          font-size: 12px;
          line-height: 1.8;
        }

        .subscription-plan-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .subscription-plan-card {
          display: flex;
          min-width: 0;
          flex-direction: column;
          padding: 22px;
          border: 1px solid #e6e7df;
          border-radius: 17px;
          background: #fff;
          transition:
            border-color 200ms ease,
            transform 200ms ease,
            box-shadow 200ms ease;
        }

        .subscription-plan-card:hover {
          transform: translateY(-3px);
          border-color: #b7cdb5;
          box-shadow: 0 12px 25px rgba(33, 77, 50, 0.07);
        }

        .subscription-plan-label {
          margin: 0 0 9px;
          color: #8a6a4a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .subscription-plan-card h4 {
          margin: 0;
          color: #214d32;
          font-size: 19px;
          font-weight: 800;
        }

        .subscription-plan-price {
          margin: 13px 0 14px;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(21px, 3vw, 28px);
          font-weight: 500;
          letter-spacing: -0.8px;
          overflow-wrap: anywhere;
        }

        .subscription-plan-details {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .subscription-plan-detail {
          padding: 7px 9px;
          border-radius: 8px;
          background: #f3f4ef;
          color: #606a5f;
          font-size: 11px;
          font-weight: 700;
        }

        .subscription-plan-description {
          flex: 1;
          margin: 0 0 16px;
          color: #767b72;
          font-size: 12px;
          line-height: 1.8;
        }

        .subscription-plan-button {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          min-height: 43px;
          padding: 11px 13px;
          border-radius: 11px;
          background: #2f6b45;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          text-align: center;
          text-decoration: none;
          transition:
            background 180ms ease,
            transform 180ms ease;
        }

        .subscription-plan-button:hover {
          background: #214d32;
          transform: translateY(-1px);
        }

        .dashboard-alert {
          margin: 15px 0;
          padding: 13px 15px;
          border: 1px solid #f0d5a9;
          border-radius: 12px;
          background: #fff5e4;
          color: #89591b;
          font-size: 12px;
          line-height: 1.7;
        }

        .dashboard-loading {
          padding: 17px 0;
          color: #777d73;
          font-size: 13px;
        }

        .dashboard-shortcuts {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .dashboard-shortcut {
          display: flex;
          min-width: 0;
          gap: 17px;
          padding: 23px;
          border: 1px solid #e6e5dc;
          border-radius: 19px;
          background: #fff;
          color: inherit;
          text-decoration: none;
          box-shadow: 0 7px 20px rgba(49, 62, 47, 0.025);
          transition:
            transform 200ms ease,
            border-color 200ms ease,
            box-shadow 200ms ease;
          animation: dashboard-rise 650ms ease both;
        }

        .dashboard-shortcut:hover {
          transform: translateY(-3px);
          border-color: #bfd0bb;
          box-shadow: 0 13px 27px rgba(33, 77, 50, 0.07);
        }

        .dashboard-shortcut-icon {
          display: flex;
          width: 47px;
          height: 47px;
          flex: 0 0 47px;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #edf3e9;
          color: #2f6b45;
          font-family: Georgia, serif;
          font-size: 16px;
          font-weight: 700;
        }

        .dashboard-shortcut-content {
          min-width: 0;
          flex: 1;
        }

        .dashboard-shortcut-label {
          margin: 1px 0 7px;
          color: #8a6a4a;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .dashboard-shortcut h3 {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 21px;
          font-weight: 500;
          letter-spacing: -0.3px;
        }

        .dashboard-shortcut-description {
          margin: 9px 0 0;
          color: #747970;
          font-size: 12px;
          line-height: 1.8;
        }

        .dashboard-order-list {
          display: grid;
          gap: 10px;
          margin-top: 17px;
        }

        .dashboard-order-item {
          display: block;
          padding: 15px;
          border: 1px solid #e5e8df;
          border-radius: 13px;
          background: #fcfcfa;
          color: inherit;
          text-decoration: none;
          transition:
            border-color 180ms ease,
            background 180ms ease;
        }

        .dashboard-order-item:hover {
          border-color: #b8cdb5;
          background: #f6f9f3;
        }

        .dashboard-order-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
        }

        .dashboard-order-code {
          color: #214d32;
          font-size: 12px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .dashboard-order-status {
          display: inline-flex;
          padding: 6px 8px;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 800;
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

        .dashboard-order-service {
          margin: 9px 0 0;
          color: #394c3d;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.6;
        }

        .dashboard-order-meta {
          margin: 6px 0 0;
          color: #7a8076;
          font-size: 11px;
          line-height: 1.6;
        }

        .dashboard-order-arrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          color: #2f6b45;
          font-size: 11px;
          font-weight: 800;
        }

        .dashboard-empty-state {
          margin-top: 14px;
          padding: 18px;
          border: 1px dashed #d7dcd0;
          border-radius: 13px;
          background: #fafbf8;
        }

        .dashboard-empty-state strong {
          color: #214d32;
          font-size: 13px;
        }

        .dashboard-empty-state p {
          margin: 7px 0 0;
          color: #747970;
          font-size: 12px;
          line-height: 1.8;
        }

        .dashboard-empty-state a {
          display: inline-flex;
          margin-top: 12px;
          color: #2f6b45;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .dashboard-support-card {
          position: relative;
          overflow: hidden;
          border-color: #d7e5d4;
          background:
            radial-gradient(
              circle at 100% 0,
              rgba(202, 228, 201, 0.45),
              transparent 48%
            ),
            #f0f7ed;
        }

        .dashboard-support-card .dashboard-shortcut-icon {
          background: #25d366;
          color: white;
          font-family: Arial, sans-serif;
          font-size: 21px;
        }

        .dashboard-whatsapp-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 14px;
          padding: 10px 12px;
          border-radius: 10px;
          background: #25d366;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
        }

        .dashboard-bottom-cta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-top: 30px;
          padding: 25px 27px;
          border: 1px solid #e5e1d7;
          border-radius: 19px;
          background: #f0ede4;
        }

        .dashboard-bottom-cta h3 {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          font-weight: 500;
        }

        .dashboard-bottom-cta p {
          margin: 7px 0 0;
          color: #76786e;
          font-size: 12px;
          line-height: 1.7;
        }

        .dashboard-bottom-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .dashboard-bottom-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 43px;
          padding: 11px 14px;
          border: 1px solid #d8d8cd;
          border-radius: 11px;
          background: #fff;
          color: #214d32;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition:
            transform 180ms ease,
            background 180ms ease;
        }

        .dashboard-bottom-button:hover {
          transform: translateY(-2px);
          background: #edf3e9;
        }

        .dashboard-bottom-button.primary {
          border-color: #2f6b45;
          background: #2f6b45;
          color: #fff;
        }

        .dashboard-bottom-button.primary:hover {
          background: #214d32;
        }

        .dashboard-footer {
          padding: 22px 0 105px;
          border-top: 1px solid rgba(47, 107, 69, 0.12);
          color: #777c72;
          font-size: 11px;
        }

        .dashboard-footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .dashboard-footer strong {
          color: #214d32;
        }

        @keyframes dashboard-rise {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 900px) {
          .dashboard-shortcuts > :first-child {
            grid-column: span 2;
          }

          .dashboard-shortcuts > :first-child .dashboard-order-list {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .dashboard-container {
            width: min(100% - 32px, 600px);
          }

          .dashboard-navbar-inner {
            min-height: 68px;
            gap: 12px;
          }

          .dashboard-brand {
            gap: 8px;
            font-size: 15px;
          }

          .dashboard-brand-logo {
            width: 38px;
            height: 38px;
            border-radius: 11px;
          }

          .dashboard-nav {
            gap: 13px;
          }

          .dashboard-nav a {
            font-size: 11px;
          }

          .dashboard-nav .dashboard-nav-primary {
            padding: 10px 11px;
            border-radius: 10px;
          }

          .dashboard-main {
            padding-top: 25px;
            padding-bottom: 125px;
          }

          .dashboard-hero {
            padding: 29px 23px;
            border-radius: 22px;
          }

          .dashboard-hero h1 {
            font-size: clamp(31px, 8vw, 42px);
            letter-spacing: -1.3px;
          }

          .dashboard-hero-description {
            font-size: 13px;
          }

          .dashboard-section-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 8px;
            margin-top: 29px;
          }

          .dashboard-section-caption {
            text-align: left;
          }

          .subscription-panel {
            padding: 20px;
            border-radius: 20px;
          }

          .subscription-panel h3 {
            font-size: 24px;
          }

          .subscription-current {
            padding: 15px;
          }

          .subscription-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .subscription-metric:last-child {
            grid-column: span 2;
          }

          .subscription-plan-grid {
            grid-template-columns: 1fr;
          }

          .subscription-plan-card {
            padding: 19px;
          }

          .dashboard-shortcuts {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .dashboard-shortcut {
            gap: 14px;
            padding: 19px;
            border-radius: 17px;
          }

          .dashboard-shortcut h3 {
            font-size: 20px;
          }

          .dashboard-bottom-cta {
            align-items: flex-start;
            flex-direction: column;
            padding: 21px;
          }
        }

        @media (max-width: 390px) {
          .dashboard-container {
            width: calc(100% - 24px);
          }

          .dashboard-brand {
            font-size: 13px;
          }

          .dashboard-brand-logo {
            width: 34px;
            height: 34px;
          }

          .dashboard-nav {
            gap: 9px;
          }

          .dashboard-nav a {
            font-size: 10px;
          }

          .dashboard-nav .dashboard-nav-primary {
            padding: 9px;
          }

          .dashboard-hero {
            padding: 25px 19px;
          }

          .dashboard-hero-bottom {
            align-items: flex-start;
            flex-direction: column;
          }

          .subscription-panel {
            padding: 16px;
          }

          .subscription-decoration {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
            border-radius: 12px;
          }

          .subscription-metric {
            padding: 12px;
          }

          .subscription-metric-value {
            font-size: 18px;
          }

          .dashboard-shortcut {
            padding: 16px;
          }

          .dashboard-shortcut-icon {
            width: 41px;
            height: 41px;
            flex-basis: 41px;
            border-radius: 12px;
          }

          .dashboard-order-item-top {
            align-items: flex-start;
            flex-direction: column;
          }

          .dashboard-bottom-actions {
            width: 100%;
          }

          .dashboard-bottom-button {
            flex: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-page *,
          .dashboard-page *::before,
          .dashboard-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <header className="dashboard-navbar">
        <div className="dashboard-container dashboard-navbar-inner">
          <a href="/" className="dashboard-brand">
            <img
              src={logo}
              alt="Logo Pajara Studio"
              className="dashboard-brand-logo"
            />
            <span>Pajara Studio</span>
          </a>

          <nav className="dashboard-nav" aria-label="Navigasi utama">
            <a href="/">Website</a>
            <a href="/subscriptions">Paket Desain</a>
            <a href="/order" className="dashboard-nav-primary">
              + Pesan Desain
            </a>
          </nav>
        </div>
      </header>

      <section className="dashboard-main">
        <div className="dashboard-container">
          <section className="dashboard-hero">
            <div className="dashboard-hero-content">
              <p className="dashboard-eyebrow">Ruang Pelanggan Pajara</p>

              <h1>
                Selamat datang di
                <br />
                ruang kreatif <span>Anda.</span>
              </h1>

              <p className="dashboard-hero-description">
                Semua perjalanan desain Anda dimulai di sini. Pantau pesanan,
                kelola paket, dan temukan file desain dalam satu tempat.
              </p>

              <div className="dashboard-hero-bottom">
                <a href="/order" className="dashboard-hero-button">
                  Mulai Pesanan <span aria-hidden="true">↗</span>
                </a>
                <span className="dashboard-hero-note">
                  Berakar di Tanah Pasundan.
                </span>
              </div>
            </div>
          </section>

          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-section-kicker">Membership</p>
              <h2>Paket desain Anda</h2>
            </div>
            <p className="dashboard-section-caption">
              Pilih paket yang sesuai dengan perjalanan kreatif bisnis Anda.
              Satu kuota berlaku untuk satu output desain.
            </p>
          </div>

          <section className="subscription-panel">
            <div className="subscription-panel-top">
              <div>
                <p className="subscription-panel-kicker">
                  PAJARA SUBSCRIPTION
                </p>
                <h3>Ruang untuk terus berkarya.</h3>
                <p className="subscription-panel-intro">
                  Pantau masa aktif dan kuota langganan, atau temukan paket
                  yang sesuai dengan kebutuhan desain Anda.
                </p>
              </div>
              <div className="subscription-decoration" aria-hidden="true">
                ✳
              </div>
            </div>

            {subscriptionError && (
              <p className="dashboard-alert" role="alert">
                {subscriptionError}
              </p>
            )}

            {loading ? (
              <p className="dashboard-loading">
                Memuat informasi paket...
              </p>
            ) : (
              <>
                {currentSubscription && (
                  <div className="subscription-current">
                    <div className="subscription-current-header">
                      <strong className="subscription-current-name">
                        {currentPlan?.name || "Paket Langganan"}
                      </strong>

                      <span
                        className={`subscription-badge ${subscriptionStatusClass(
                          subscriptionStatusLabel(currentSubscription)
                        )}`}
                      >
                        {subscriptionStatusLabel(currentSubscription)}
                      </span>
                    </div>

                    {currentSubscription.status === "pending" ? (
                      <>
                        <p className="subscription-current-note">
                          Pembelian paket Anda belum aktif. Lanjutkan
                          pembayaran dan tunggu verifikasi Admin.
                        </p>

                        <a
                          href={`/subscriptions/payment?subscription=${encodeURIComponent(
                            currentSubscription.id
                          )}`}
                          className="dashboard-action-link primary"
                        >
                          Lanjutkan Pembayaran <span aria-hidden="true">↗</span>
                        </a>
                      </>
                    ) : (
                      <>
                        <div className="subscription-metrics">
                          <div className="subscription-metric">
                            <p className="subscription-metric-label">
                              Sisa kuota
                            </p>
                            <strong className="subscription-metric-value">
                              {remainingQuota} desain
                            </strong>
                          </div>

                          <div className="subscription-metric">
                            <p className="subscription-metric-label">
                              Kuota terpakai
                            </p>
                            <strong className="subscription-metric-value">
                              {currentSubscription.quota_used} /{" "}
                              {currentSubscription.quota_total}
                            </strong>
                          </div>

                          <div className="subscription-metric">
                            <p className="subscription-metric-label">
                              Berakhir pada
                            </p>
                            <strong className="subscription-metric-value date-value">
                              {formatDate(currentSubscription.expires_at)}
                            </strong>
                          </div>
                        </div>

                        {subscriptionStatusLabel(currentSubscription) ===
                          "Aktif" && (
                          <div>
                            <a
                              href="/subscriptions"
                              className="dashboard-action-link"
                            >
                              Lihat Paket <span aria-hidden="true">↗</span>
                            </a>

                            <a
                              href="/subscriptions/request"
                              className="dashboard-action-link primary"
                              style={{ marginLeft: 8 }}
                            >
                              Pesan Desain Paket{" "}
                              <span aria-hidden="true">↗</span>
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {!currentSubscription && (
                  <div className="subscription-empty">
                    <strong>Belum memiliki paket langganan</strong>
                    <p>
                      Pilih Paket Mingguan atau Bulanan untuk mulai mengelola
                      kebutuhan desain Anda dengan lebih terencana.
                    </p>
                  </div>
                )}

                {plans.length > 0 && (
                  <div className="subscription-plan-grid">
                    {plans.map((plan) => {
                      const isWeekly =
                        plan.duration_days === 7 ||
                        /mingguan/i.test(plan.name);

                      return (
                        <article
                          key={plan.id}
                          className="subscription-plan-card"
                        >
                          <p className="subscription-plan-label">
                            {isWeekly
                              ? "FLEKSIBEL MINGGUAN"
                              : "LANGGANAN DESAIN"}
                          </p>

                          <h4>{plan.name}</h4>

                          <p className="subscription-plan-price">
                            {formatRupiah(plan.price)}
                          </p>

                          <div className="subscription-plan-details">
                            <span className="subscription-plan-detail">
                              {plan.duration_days} hari aktif
                            </span>
                            <span className="subscription-plan-detail">
                              {plan.quota_total} kuota desain
                            </span>
                          </div>

                          {plan.description && (
                            <p className="subscription-plan-description">
                              {plan.description}
                            </p>
                          )}

                          <a
                            href="/subscriptions"
                            className="subscription-plan-button"
                          >
                            {activeSubscription
                              ? "Lihat Paket"
                              : pendingSubscription
                                ? "Lihat Pembelian"
                                : "Pilih Paket"}{" "}
                            <span aria-hidden="true">↗</span>
                          </a>
                        </article>
                      );
                    })}
                  </div>
                )}

                {!subscriptionError && plans.length === 0 && (
                  <p className="dashboard-loading">
                    Belum ada paket aktif yang tersedia.
                  </p>
                )}
              </>
            )}
          </section>

          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-section-kicker">Your Workspace</p>
              <h2>Semua dalam satu tempat.</h2>
            </div>
            <p className="dashboard-section-caption">
              Akses kebutuhan pesanan Anda dengan lebih mudah.
            </p>
          </div>

          <section className="dashboard-shortcuts">
            <article className="dashboard-shortcut">
              <div className="dashboard-shortcut-icon" aria-hidden="true">
                01
              </div>

              <div className="dashboard-shortcut-content">
                <p className="dashboard-shortcut-label">PESANAN DESAIN</p>
                <h3>Perjalanan pesanan Anda.</h3>
                <p className="dashboard-shortcut-description">
                  Pantau status dan detail setiap pesanan desain Anda.
                </p>

                {loading && (
                  <p className="dashboard-loading">Memuat pesanan...</p>
                )}

                {error && (
                  <div className="dashboard-alert" role="alert">
                    {error}
                    <p style={{ margin: "8px 0 0" }}>
                      <a
                        href="/login"
                        style={{
                          color: "#89591b",
                          fontWeight: 800,
                          textDecoration: "underline",
                        }}
                      >
                        Kembali ke halaman login
                      </a>
                    </p>
                  </div>
                )}

                {!loading && !error && orders.length === 0 && (
                  <div className="dashboard-empty-state">
                    <strong>Belum ada pesanan desain.</strong>
                    <p>
                      Mulai perjalanan kreatif Anda dengan membuat pesanan
                      pertama.
                    </p>
                    <a href="/order">
                      Buat pesanan pertama <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                )}

                {!loading && !error && orders.length > 0 && (
                  <div className="dashboard-order-list">
                    {orders.map((order) => (
                      <a
                        key={order.id}
                        href={`/orders?id=${encodeURIComponent(order.id)}`}
                        className="dashboard-order-item"
                      >
                        <div className="dashboard-order-item-top">
                          <strong className="dashboard-order-code">
                            {order.order_code}
                          </strong>

                          <span
                            className={`dashboard-order-status ${getOrderStatusClass(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        <p className="dashboard-order-service">
                          {order.service_name || "Layanan desain"}
                          {" · "}
                          {order.design_type || "Desain"}
                        </p>

                        <p className="dashboard-order-meta">
                          {order.quantity || 1} desain
                          {" · "}
                          Tenggat: {formatDate(order.deadline)}
                        </p>

                        <span className="dashboard-order-arrow">
                          Lihat detail <span aria-hidden="true">↗</span>
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>

            <a
              href={
                firstOrder
                  ? `/orders/payment?id=${encodeURIComponent(firstOrder.id)}`
                  : "/orders"
              }
              className="dashboard-shortcut"
            >
              <div className="dashboard-shortcut-icon" aria-hidden="true">
                02
              </div>
              <div className="dashboard-shortcut-content">
                <p className="dashboard-shortcut-label">PEMBAYARAN</p>
                <h3>Status pembayaran.</h3>
                <p className="dashboard-shortcut-description">
                  Lihat informasi pembayaran dan status verifikasi pesanan
                  desain Anda.
                </p>
                <span className="dashboard-order-arrow">
                  Buka pembayaran <span aria-hidden="true">↗</span>
                </span>
              </div>
            </a>

            <a
              href={
                firstOrder
                  ? `/orders/revision?id=${encodeURIComponent(firstOrder.id)}`
                  : "/orders"
              }
              className="dashboard-shortcut"
            >
              <div className="dashboard-shortcut-icon" aria-hidden="true">
                03
              </div>
              <div className="dashboard-shortcut-content">
                <p className="dashboard-shortcut-label">REVISI</p>
                <h3>Catatan revisi.</h3>
                <p className="dashboard-shortcut-description">
                  Lihat catatan revisi untuk pesanan desain Anda.
                </p>
                <span className="dashboard-order-arrow">
                  Lihat revisi <span aria-hidden="true">↗</span>
                </span>
              </div>
            </a>

            <a
              href={
                firstOrder
                  ? `/orders/files?id=${encodeURIComponent(firstOrder.id)}`
                  : "/orders"
              }
              className="dashboard-shortcut"
            >
              <div className="dashboard-shortcut-icon" aria-hidden="true">
                04
              </div>
              <div className="dashboard-shortcut-content">
                <p className="dashboard-shortcut-label">FILE FINAL</p>
                <h3>Hasil karya Anda.</h3>
                <p className="dashboard-shortcut-description">
                  Akses file desain final setelah pesanan selesai.
                </p>
                <span className="dashboard-order-arrow">
                  Buka file desain <span aria-hidden="true">↗</span>
                </span>
              </div>
            </a>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="dashboard-shortcut dashboard-support-card"
            >
              <div className="dashboard-shortcut-icon" aria-hidden="true">
                ☎
              </div>
              <div className="dashboard-shortcut-content">
                <p className="dashboard-shortcut-label">
                  BANTUAN & KONSULTASI
                </p>
                <h3>Butuh bantuan?</h3>
                <p className="dashboard-shortcut-description">
                  Ada yang ingin ditanyakan tentang pesanan atau layanan
                  desain? Hubungi tim Pajara Studio melalui WhatsApp.
                </p>
                <span className="dashboard-whatsapp-button">
                  Chat WhatsApp <span aria-hidden="true">↗</span>
                </span>
              </div>
            </a>
          </section>

          <section className="dashboard-bottom-cta">
            <div>
              <h3>Punya ide desain berikutnya?</h3>
              <p>
                Mari wujudkan ide Kang/Teh menjadi karya yang punya arah.
              </p>
            </div>

            <div className="dashboard-bottom-actions">
              <a href="/order" className="dashboard-bottom-button primary">
                Pesan Desain <span aria-hidden="true">↗</span>
              </a>
              <a href="/" className="dashboard-bottom-button">
                Website Studio
              </a>
            </div>
          </section>
        </div>
      </section>

      <footer className="dashboard-footer">
        <div className="dashboard-container dashboard-footer-inner">
          <span>
            © {new Date().getFullYear()} <strong>Pajara Studio</strong>
          </span>
          <span>Berakar di Tanah Pasundan.</span>
        </div>
      </footer>

      <CustomerBottomNav />
    </main>
  );
}
