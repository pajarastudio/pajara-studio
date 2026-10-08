"use client";

import { useEffect, useState } from "react";
import { supabase } from "@pajara/supabase";

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  quota_total: number;
};

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("subscription_plans")
      .select(
        "id, name, description, price, duration_days, quota_total"
      )
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error) {
      console.error(error);
      setError("Paket belum dapat dimuat.");
      setLoading(false);
      return;
    }

    setPlans(data || []);
    setLoading(false);
  }

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  async function choosePlan(planId: string) {
    setSelecting(planId);
    setError("");
    setSuccess("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Silakan login terlebih dahulu.");
      setSelecting(null);
      return;
    }

    const { data, error } = await supabase.rpc(
      "create_pending_subscription",
      {
        p_plan_id: planId,
      }
    );

    if (error) {
      console.error(error);
      setError(error.message || "Gagal memilih paket.");
      setSelecting(null);
      return;
    }

    console.log("Subscription dibuat:", data);

    setSuccess(
      "Paket berhasil dipilih. Lanjutkan ke pembayaran."
    );

    setSelecting(null);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        padding: "32px 20px 60px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: 32,
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#2f6b45",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Paket Pajara Studio
          </p>

          <h1
            style={{
              margin: "8px 0 10px",
              color: "#214d32",
              fontSize: "clamp(30px, 7vw, 48px)",
              lineHeight: 1.1,
              fontWeight: 800,
            }}
          >
            Pilih Paket
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 620,
              color: "#5f5a52",
              fontSize: 16,
              lineHeight: 1.7,
            }}
          >
            Pilih paket desain sesuai kebutuhan Kang/Teh.
            Pembayaran paket dilakukan penuh di awal dan masa
            aktif dimulai setelah pembayaran diverifikasi oleh
            Admin Pajara Studio.
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 16px",
              borderRadius: 14,
              background: "#fff1f1",
              border: "1px solid #e2b8b8",
              color: "#9b2c2c",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 16px",
              borderRadius: 14,
              background: "#edf7f0",
              border: "1px solid #b8d7c0",
              color: "#214d32",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {success}
          </div>
        )}

        {loading ? (
          <div
            style={{
              padding: 30,
              textAlign: "center",
              color: "#5f5a52",
            }}
          >
            Memuat paket...
          </div>
        ) : plans.length === 0 ? (
          <div
            style={{
              padding: 30,
              borderRadius: 20,
              background: "#ffffff",
              color: "#5f5a52",
              textAlign: "center",
            }}
          >
            Belum ada paket yang tersedia.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {plans.map((plan) => (
              <section
                key={plan.id}
                style={{
                  background: "#ffffff",
                  borderRadius: 24,
                  padding: 24,
                  border: "1px solid rgba(33, 77, 50, 0.10)",
                  boxShadow:
                    "0 10px 30px rgba(33, 77, 50, 0.07)",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    padding: "7px 11px",
                    borderRadius: 999,
                    background: "#edf5ef",
                    color: "#2f6b45",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {plan.duration_days} Hari
                </div>

                <h2
                  style={{
                    margin: "18px 0 8px",
                    color: "#214d32",
                    fontSize: 26,
                  }}
                >
                  {plan.name}
                </h2>

                <div
                  style={{
                    marginBottom: 16,
                    color: "#2f6b45",
                    fontSize: 28,
                    fontWeight: 800,
                  }}
                >
                  {formatRupiah(plan.price)}
                </div>

                {plan.description && (
                  <p
                    style={{
                      margin: "0 0 20px",
                      color: "#6b665e",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    {plan.description}
                  </p>
                )}

                <div
                  style={{
                    padding: "14px 16px",
                    marginBottom: 20,
                    borderRadius: 14,
                    background: "#f7f4ee",
                  }}
                >
                  <div
                    style={{
                      color: "#214d32",
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    {plan.quota_total} kuota desain
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      color: "#6b665e",
                      fontSize: 13,
                    }}
                  >
                    1 kuota = 1 output desain
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => choosePlan(plan.id)}
                  disabled={selecting !== null}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 14,
                    padding: "14px 18px",
                    background:
                      selecting === plan.id
                        ? "#8a6a4a"
                        : "#2f6b45",
                    color: "#ffffff",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor:
                      selecting !== null
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      selecting !== null &&
                      selecting !== plan.id
                        ? 0.6
                        : 1,
                  }}
                >
                  {selecting === plan.id
                    ? "Memproses..."
                    : "Pilih Paket"}
                </button>
              </section>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: 28,
            padding: 18,
            borderRadius: 18,
            background: "#ffffff",
            border: "1px solid rgba(138, 106, 74, 0.15)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#5f5a52",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: "#214d32" }}>
              Catatan:
            </strong>{" "}
            Paket berbeda dengan pesanan desain satuan.
            Paket dibayar 100% di awal dan tidak menggunakan
            sistem DP.
          </p>
        </div>
      </div>
    </main>
  );
}
