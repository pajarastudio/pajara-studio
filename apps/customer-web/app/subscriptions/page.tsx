
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@pajara/supabase";

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  quota_total: number;
};

const COLORS = {
  green: "#2f6b45",
  darkGreen: "#214d32",
  brown: "#8a6a4a",
  cream: "#f7f4ee",
  white: "#ffffff",
  text: "#243329",
  muted: "#778078",
  border: "rgba(33,77,50,.11)",
};

export default function SubscriptionsPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("subscription_plans")
        .select(
          "id, name, description, price, duration_days, quota_total"
        )
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

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

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
        setError(
          "ID langganan tidak ditemukan. Silakan coba kembali."
        );
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

  return (
    <main className="subscriptions-page">
      <style jsx>{`
        .subscriptions-page {
          min-height: 100vh;
          padding: 24px 16px 40px;
          background: ${COLORS.cream};
          color: ${COLORS.text};
          font-family: "DM Sans", Arial, sans-serif;
        }

        .page-container {
          width: 100%;
          max-width: 850px;
          margin: 0 auto;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          margin: 0 0 29px;
          padding: 10px 16px 10px 10px;
          border: 1px solid ${COLORS.border};
          border-radius: 16px;
          background: ${COLORS.white};
          color: ${COLORS.darkGreen};
          box-shadow: 0 5px 18px rgba(33, 77, 50, 0.05);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 160ms ease,
            box-shadow 160ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .back-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(33, 77, 50, 0.09);
        }

        .back-icon {
          display: grid;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 11px;
          background: #edf4ee;
          color: ${COLORS.green};
          font-size: 19px;
        }

        .hero {
          position: relative;
          overflow: hidden;
          margin-bottom: 28px;
          padding: 29px 25px;
          border: 1px solid rgba(33, 77, 50, 0.08);
          border-radius: 25px;
          background: linear-gradient(135deg, #ffffff 0%, #f0f4ec 100%);
          box-shadow: 0 8px 28px rgba(33, 77, 50, 0.035);
        }

        .hero::after {
          position: absolute;
          top: -66px;
          right: -54px;
          width: 180px;
          height: 180px;
          border: 1px solid rgba(47, 107, 69, 0.10);
          border-radius: 50%;
          content: "";
          pointer-events: none;
        }

        .hero::before {
          position: absolute;
          top: -35px;
          right: -23px;
          width: 115px;
          height: 115px;
          border: 1px solid rgba(47, 107, 69, 0.10);
          border-radius: 50%;
          content: "";
          pointer-events: none;
        }

        .eyebrow {
          position: relative;
          z-index: 1;
          margin: 0 0 12px;
          color: ${COLORS.brown};
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .page-title {
          position: relative;
          z-index: 1;
          margin: 0;
          color: ${COLORS.darkGreen};
          font-family: Georgia, serif;
          font-size: clamp(34px, 7vw, 49px);
          font-weight: 500;
          letter-spacing: -1.5px;
          line-height: 1.12;
        }

        .page-title span {
          color: ${COLORS.green};
          font-style: italic;
        }

        .hero-description {
          position: relative;
          z-index: 1;
          max-width: 560px;
          margin: 15px 0 0;
          color: #686c63;
          font-size: 13px;
          line-height: 1.9;
        }

        .hero-note {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 20px;
          padding-top: 17px;
          border-top: 1px solid rgba(33, 77, 50, 0.10);
          color: ${COLORS.darkGreen};
          font-size: 11px;
          line-height: 1.7;
        }

        .note-icon {
          display: grid;
          width: 25px;
          height: 25px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 9px;
          background: #e4eee3;
          font-size: 13px;
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          margin: 0 0 16px;
        }

        .section-title {
          margin: 0;
          color: ${COLORS.darkGreen};
          font-family: Georgia, serif;
          font-size: 25px;
          font-weight: 500;
        }

        .section-caption {
          margin: 5px 0 0;
          color: ${COLORS.muted};
          font-size: 11px;
          line-height: 1.7;
        }

        .plan-count {
          flex-shrink: 0;
          padding: 7px 10px;
          border: 1px solid ${COLORS.border};
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.65);
          color: ${COLORS.muted};
          font-size: 10px;
          font-weight: 700;
        }

        .plan-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-items: stretch;
          gap: 15px;
        }

        .plan-card {
          position: relative;
          display: flex;
          min-width: 0;
          flex-direction: column;
          padding: 21px;
          border: 1px solid ${COLORS.border};
          border-radius: 23px;
          background: ${COLORS.white};
          box-shadow: 0 8px 25px rgba(33, 77, 50, 0.045);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .plan-card:hover {
          transform: translateY(-3px);
          border-color: rgba(47, 107, 69, 0.25);
          box-shadow: 0 14px 30px rgba(33, 77, 50, 0.075);
        }

        .plan-card.featured {
          border-color: ${COLORS.darkGreen};
          background: linear-gradient(155deg, #ffffff 0%, #f4f7f1 100%);
        }

        .featured-label {
          position: absolute;
          top: 14px;
          right: 14px;
          padding: 7px 9px;
          border-radius: 30px;
          background: ${COLORS.darkGreen};
          color: white;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .plan-symbol {
          display: grid;
          width: 43px;
          height: 43px;
          place-items: center;
          margin-bottom: 18px;
          border: 1px solid rgba(47, 107, 69, 0.10);
          border-radius: 14px;
          background: #edf4ee;
          color: ${COLORS.green};
          font-family: Georgia, serif;
          font-size: 21px;
        }

        .plan-label {
          margin: 0 0 7px;
          color: ${COLORS.brown};
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .plan-name {
          margin: 0;
          padding-right: 4px;
          color: ${COLORS.darkGreen};
          font-family: Georgia, serif;
          font-size: clamp(22px, 4vw, 29px);
          font-weight: 500;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .plan-description {
          min-height: 40px;
          margin: 9px 0 18px;
          color: ${COLORS.muted};
          font-size: 11px;
          line-height: 1.8;
        }

        .price-area {
          padding: 17px 0;
          border-top: 1px solid ${COLORS.border};
          border-bottom: 1px solid ${COLORS.border};
        }

        .price {
          color: ${COLORS.darkGreen};
          font-family: Georgia, serif;
          font-size: clamp(24px, 4vw, 31px);
          font-weight: 500;
          letter-spacing: -0.8px;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .price-period {
          margin-top: 5px;
          color: ${COLORS.muted};
          font-size: 10px;
        }

        .benefits {
          display: grid;
          gap: 13px;
          margin: 19px 0;
          padding: 0;
          list-style: none;
        }

        .benefit {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: #555f55;
          font-size: 11px;
          line-height: 1.6;
        }

        .check-icon {
          display: grid;
          width: 19px;
          height: 19px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 7px;
          background: #edf4ee;
          color: ${COLORS.green};
          font-size: 11px;
          font-weight: 800;
        }

        .quota-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: auto;
          padding: 14px;
          border: 1px solid rgba(33, 77, 50, 0.07);
          border-radius: 15px;
          background: ${COLORS.cream};
        }

        .quota-caption {
          margin: 0 0 4px;
          color: ${COLORS.muted};
          font-size: 10px;
        }

        .quota-number {
          margin: 0;
          color: ${COLORS.darkGreen};
          font-family: Georgia, serif;
          font-size: 24px;
          font-weight: 500;
          line-height: 1.1;
        }

        .quota-unit {
          flex-shrink: 0;
          color: ${COLORS.muted};
          font-size: 10px;
          text-align: right;
          line-height: 1.6;
        }

        .choose-button {
          display: flex;
          width: 100%;
          min-height: 48px;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 15px;
          padding: 13px 15px;
          border: 1px solid ${COLORS.green};
          border-radius: 14px;
          background: ${COLORS.green};
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition:
            background 160ms ease,
            transform 160ms ease,
            opacity 160ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .choose-button:hover:not(:disabled) {
          background: ${COLORS.darkGreen};
          transform: translateY(-1px);
        }

        .choose-button:active:not(:disabled) {
          transform: scale(0.98);
        }

        .choose-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .button-arrow {
          font-size: 17px;
          line-height: 1;
        }

        .error-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 18px;
          padding: 15px 16px;
          border: 1px solid #e8caca;
          border-radius: 15px;
          background: #fff4f2;
          color: #923f36;
          font-size: 12px;
          line-height: 1.7;
        }

        .error-icon {
          display: grid;
          width: 27px;
          height: 27px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 9px;
          background: #f9e4e1;
          font-weight: 800;
        }

        .state-card {
          padding: 32px 22px;
          border: 1px solid ${COLORS.border};
          border-radius: 22px;
          background: ${COLORS.white};
          text-align: center;
          box-shadow: 0 8px 25px rgba(33, 77, 50, 0.035);
        }

        .state-icon {
          display: grid;
          width: 53px;
          height: 53px;
          place-items: center;
          margin: 0 auto 15px;
          border-radius: 17px;
          background: #edf4ee;
          color: ${COLORS.green};
          font-family: Georgia, serif;
          font-size: 24px;
        }

        .state-title {
          margin: 0 0 8px;
          color: ${COLORS.darkGreen};
          font-family: Georgia, serif;
          font-size: 23px;
          font-weight: 500;
        }

        .state-description {
          max-width: 360px;
          margin: 0 auto 18px;
          color: ${COLORS.muted};
          font-size: 12px;
          line-height: 1.8;
        }

        .retry-button {
          min-height: 43px;
          padding: 11px 17px;
          border: 0;
          border-radius: 12px;
          background: ${COLORS.green};
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .skeleton {
          height: 15px;
          margin: 13px auto;
          border-radius: 8px;
          background: #e9eee8;
          animation: pulse 1.2s ease-in-out infinite alternate;
        }

        .skeleton.short {
          width: 58%;
        }

        .policy-card {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-top: 24px;
          padding: 19px;
          border: 1px solid rgba(138, 106, 74, 0.15);
          border-radius: 19px;
          background: rgba(255, 255, 255, 0.78);
        }

        .policy-icon {
          display: grid;
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 12px;
          background: #f2ebe2;
          color: ${COLORS.brown};
          font-size: 15px;
        }

        .policy-title {
          margin: 0 0 5px;
          color: ${COLORS.darkGreen};
          font-size: 12px;
          font-weight: 800;
        }

        .policy-description {
          margin: 0;
          color: ${COLORS.muted};
          font-size: 11px;
          line-height: 1.8;
        }

        .footer {
          margin: 25px 0 0;
          color: ${COLORS.muted};
          font-size: 10px;
          line-height: 1.9;
          text-align: center;
        }

        .footer-brand {
          color: ${COLORS.darkGreen};
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        @keyframes pulse {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 600px) {
          .subscriptions-page {
            padding: 18px 13px 32px;
          }

          .back-button {
            margin-bottom: 21px;
          }

          .hero {
            padding: 24px 19px;
            border-radius: 21px;
          }

          .hero-description {
            font-size: 12px;
          }

          .section-heading {
            align-items: flex-start;
          }

          .section-title {
            font-size: 23px;
          }

          .plan-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 15px;
          }

          .plan-card {
            padding: 21px;
          }

          .plan-card.featured {
            border-width: 1.5px;
          }

          .plan-name {
            font-size: 27px;
          }

          .price {
            font-size: 30px;
          }

          .plan-description {
            min-height: 0;
          }

          .quota-box {
            padding: 15px;
          }

          .policy-card {
            padding: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .back-button,
          .plan-card,
          .choose-button,
          .skeleton {
            animation: none;
            transition: none;
          }
        }
      `}</style>

      <div className="page-container">
        <button
          type="button"
          className="back-button"
          onClick={() => router.push("/dashboard")}
        >
          <span className="back-icon" aria-hidden="true">
            ←
          </span>
          Kembali ke Beranda
        </button>

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

          {loading ? (
            <div className="plan-grid">
              {[1, 2].map((item) => (
                <div className="state-card" key={item}>
                  <div className="state-icon">✳</div>
                  <div className="skeleton short" />
                  <div className="skeleton" />
                  <div className="skeleton" />
                  <div className="skeleton short" />
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
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
                      {featured ? "Untuk kebutuhan rutin" : "Untuk mulai berkarya"}
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

        <footer className="footer">
          <div className="footer-brand">PAJARA STUDIO</div>
          <div>Berakar di Tanah Pasundan.</div>
        </footer>
      </div>
    </main>
  );
}
