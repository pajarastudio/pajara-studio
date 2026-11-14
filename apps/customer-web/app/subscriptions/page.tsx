
"use client";

import "./subscriptions.css";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@pajara/supabase";
import CustomerLoading from "../components/CustomerLoading";

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  quota_total: number;
};

const logo = "/755809946_17926162029385149_3739923509439876817_n.jpg";

export default function SubscriptionsPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasAvailableQuota, setHasAvailableQuota] = useState(false);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("subscription_plans")
        .select("id, name, description, price, duration_days, quota_total")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (queryError) {
        console.error("Gagal memuat paket:", queryError);
        setError("Paket belum dapat dimuat. Silakan coba kembali.");
        return;
      }

      setPlans((data || []) as SubscriptionPlan[]);
    } catch (err) {
      console.error("Kesalahan saat memuat paket:", err);
      setError("Terjadi kendala koneksi. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadQuotaAvailability = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setHasAvailableQuota(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("subscriptions")
        .select(
          "id, quota_total, quota_used, status, started_at, expires_at"
        )
        .eq("customer_id", user.id)
        .eq("status", "active")
        .order("expires_at", { ascending: true });

      if (queryError) {
        console.error("Gagal memeriksa kuota:", queryError);
        setHasAvailableQuota(false);
        return;
      }

      const now = Date.now();

      const activeSubscription = (data || []).find((item) => {
        const started = item.started_at
          ? new Date(item.started_at).getTime()
          : Infinity;

        const expires = item.expires_at
          ? new Date(item.expires_at).getTime()
          : 0;

        return (
          started <= now &&
          expires > now &&
          item.quota_used < item.quota_total
        );
      });

      setHasAvailableQuota(Boolean(activeSubscription));
    } catch (err) {
      console.error("Kesalahan saat memeriksa kuota:", err);
      setHasAvailableQuota(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
    loadQuotaAvailability();
  }, [loadPlans, loadQuotaAvailability]);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  async function choosePlan(planId: string) {
    if (selecting !== null) return;

    setSelecting(planId);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Silakan login terlebih dahulu.");
        return;
      }

      const { data, error: rpcError } = await supabase.rpc(
        "create_pending_subscription",
        {
          p_plan_id: planId,
        }
      );

      if (rpcError) {
        console.error("Gagal memilih paket:", rpcError);
        setError(rpcError.message || "Gagal memilih paket.");
        return;
      }

      if (!data) {
        setError("ID langganan tidak ditemukan. Silakan coba kembali.");
        return;
      }

      router.push(
        `/subscriptions/payment?subscription=${encodeURIComponent(String(data))}`
      );
    } catch (err) {
      console.error("Kesalahan saat memilih paket:", err);
      setError("Terjadi kendala. Silakan coba kembali.");
    } finally {
      setSelecting(null);
    }
  }

  function isMonthly(plan: SubscriptionPlan) {
    return plan.duration_days >= 30;
  }

  if (loading) {
    return (
      <CustomerLoading
        title="Menyiapkan Paket Desain"
        description="Sebentar, kami sedang menyiapkan pilihan paket untuk Kang/Teh."
      />
    );
  }

  return (
    <main className="subscriptions-page">
      <nav className="dashboard-navbar">
        <div className="dashboard-navbar-inner">
          <a href="/" className="dashboard-brand">
            <img
              src={logo}
              alt="Logo Pajara Studio"
              className="dashboard-brand-logo"
            />
            <span className="dashboard-brand-name">Pajara Studio</span>
          </a>

          <div className="dashboard-navbar-actions">
            <button
              type="button"
              className={`dashboard-menu-button ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
            </button>

            {hasAvailableQuota && (
              <button
                type="button"
                className="dashboard-order-button"
                onClick={() => router.push("/subscriptions/request")}
              >
                Gunakan Kuota ↗
              </button>
            )}

            <button
              type="button"
              className="dashboard-order-button"
              onClick={() => router.push("/order")}
            >
              Pesan Desain ↗
            </button>
          </div>

          {menuOpen && (
            <div className="dashboard-menu">
              <p className="dashboard-menu-label">MENU PELANGGAN</p>

              <a
                href="/dashboard"
                className="dashboard-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </a>

              <a
                href="/orders/list"
                className="dashboard-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                Pesanan Saya
              </a>

              <a
                href="/subscriptions"
                className="dashboard-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                Paket Desain
              </a>

              {hasAvailableQuota && (
                <a
                  href="/subscriptions/request"
                  className="dashboard-menu-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Gunakan Kuota
                </a>
              )}

              <a
                href="/payments"
                className="dashboard-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                Pembayaran
              </a>
            </div>
          )}
        </div>
      </nav>

      <div className="page-container">
        <header className="hero">
          <p className="eyebrow">PAJARA STUDIO · MEMBERSHIP</p>

          <h1 className="page-title">
            Ruang untuk
            <br />
            <span>ide yang tumbuh.</span>
          </h1>

          <p className="hero-description">
            Pilih paket desain yang sesuai dengan kebutuhan Kang/Teh.
            Nikmati proses kreatif yang lebih terencana dengan kuota desain
            dan masa aktif yang jelas.
          </p>

          <div className="hero-note">
            <span className="note-icon" aria-hidden="true">
              ✓
            </span>
            <span>
              Pembayaran dilakukan penuh di awal. Masa aktif paket dimulai
              setelah pembayaran diverifikasi oleh Admin Pajara Studio.
            </span>
          </div>

          {hasAvailableQuota && (
            <div style={{ marginTop: "22px" }}>
              <button
                type="button"
                className="choose-button"
                onClick={() => router.push("/subscriptions/request")}
              >
                Gunakan Kuota Paket
                <span className="button-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          )}
        </header>

        {error && (
          <div className="error-card" role="alert">
            <span className="error-icon" aria-hidden="true">
              !
            </span>
            <div>{error}</div>
          </div>
        )}

        <section>
          <div className="section-heading">
            <div>
              <h2 className="section-title">Pilih paketmu</h2>
              <p className="section-caption">
                Sesuaikan dengan ritme dan kebutuhan desainmu.
              </p>
            </div>

            {!loading && plans.length > 0 && (
              <span className="plan-count">
                {plans.length} paket tersedia
              </span>
            )}
          </div>

          {plans.length === 0 ? (
            <div className="state-card">
              <div className="state-icon">✳</div>
              <h3 className="state-title">Paket belum tersedia</h3>
              <p className="state-description">
                Saat ini belum ada paket aktif yang dapat dipilih. Silakan
                coba lagi beberapa saat nanti.
              </p>
              <button
                type="button"
                className="retry-button"
                onClick={loadPlans}
              >
                Muat Ulang
              </button>
            </div>
          ) : (
            <div className="plan-grid">
              {plans.map((plan) => {
                const featured = isMonthly(plan);

                return (
                  <article
                    key={plan.id}
                    className={`plan-card ${featured ? "featured" : ""}`}
                  >
                    {featured && (
                      <span className="featured-label">
                        PILIHAN BULANAN
                      </span>
                    )}

                    <div className="plan-symbol" aria-hidden="true">
                      {featured ? "✳" : "◇"}
                    </div>

                    <p className="plan-label">
                      {featured
                        ? "Untuk kebutuhan rutin"
                        : "Untuk mulai berkarya"}
                    </p>

                    <h3 className="plan-name">{plan.name}</h3>

                    <p className="plan-description">
                      {plan.description ||
                        `Paket desain dengan ${plan.quota_total} kuota selama ${plan.duration_days} hari.`}
                    </p>

                    <div className="price-area">
                      <div className="price">
                        {formatRupiah(plan.price)}
                      </div>
                      <div className="price-period">
                        untuk {plan.duration_days} hari
                      </div>
                    </div>

                    <ul className="benefits">
                      <li className="benefit">
                        <span className="check-icon" aria-hidden="true">
                          ✓
                        </span>
                        <span>
                          Masa aktif {plan.duration_days} hari setelah
                          pembayaran diverifikasi
                        </span>
                      </li>

                      <li className="benefit">
                        <span className="check-icon" aria-hidden="true">
                          ✓
                        </span>
                        <span>
                          {plan.quota_total} kuota output desain
                        </span>
                      </li>

                      <li className="benefit">
                        <span className="check-icon" aria-hidden="true">
                          ✓
                        </span>
                        <span>
                          Pembayaran satu kali di awal, tanpa sistem DP
                        </span>
                      </li>
                    </ul>

                    <div className="quota-box">
                      <div>
                        <p className="quota-caption">Kuota tersedia</p>
                        <p className="quota-number">{plan.quota_total}</p>
                      </div>
                      <div className="quota-unit">
                        kuota
                        <br />
                        desain
                      </div>
                    </div>

                    <button
                      type="button"
                      className="choose-button"
                      onClick={() => choosePlan(plan.id)}
                      disabled={selecting !== null}
                    >
                      {selecting === plan.id ? (
                        "Memproses pilihan..."
                      ) : selecting !== null ? (
                        "Tunggu sebentar..."
                      ) : (
                        <>
                          Pilih Paket
                          <span className="button-arrow" aria-hidden="true">
                            →
                          </span>
                        </>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="policy-card">
          <span className="policy-icon" aria-hidden="true">
            ◈
          </span>
          <div>
            <h3 className="policy-title">Sebelum memilih paket</h3>
            <p className="policy-description">
              Setiap kuota berlaku untuk satu output desain, bukan satu
              pesanan tanpa batas. Paket dibayar 100% di awal dan tidak
              menggunakan sistem DP. Masa aktif dimulai setelah pembayaran
              diverifikasi oleh Admin Pajara Studio.
            </p>
          </div>
        </aside>

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
            <small>© 2026 Pajara Studio. Desain yang punya arah.</small>
          </div>
        </footer>
      </div>
    </main>
  );
}
