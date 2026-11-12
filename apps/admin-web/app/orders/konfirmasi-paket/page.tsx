
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Payment = {
  id: string;
  subscription_id: string;
  customer_id: string;
  amount: number;
  payment_method: string | null;
  transaction_id: string | null;
  status: string;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
  customer_name?: string;
  plan_name?: string;
  proof_url?: string;
};

export default function PackagePaymentConfirmationPage() {
  const router = useRouter();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("pending");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles_v2")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      const { data: paymentData, error: paymentError } = await supabase
        .from("subscription_payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentError) throw paymentError;

      const rows = paymentData || [];

      const subscriptionIds = [
        ...new Set(rows.map((item) => item.subscription_id).filter(Boolean)),
      ];

      const customerIds = [
        ...new Set(rows.map((item) => item.customer_id).filter(Boolean)),
      ];

      const { data: subscriptions, error: subscriptionError } =
        subscriptionIds.length > 0
          ? await supabase
              .from("subscriptions")
              .select("id, plan_id")
              .in("id", subscriptionIds)
          : { data: [], error: null };

      if (subscriptionError) throw subscriptionError;

      const planIds = [
        ...new Set(
          (subscriptions || []).map((item) => item.plan_id).filter(Boolean)
        ),
      ];

      const { data: plans, error: plansError } =
        planIds.length > 0
          ? await supabase
              .from("subscription_plans")
              .select("id, name")
              .in("id", planIds)
          : { data: [], error: null };

      if (plansError) throw plansError;

      const { data: customers, error: customersError } =
        customerIds.length > 0
          ? await supabase
              .from("profiles_v2")
              .select("*")
              .in("id", customerIds)
          : { data: [], error: null };

      if (customersError) throw customersError;

      const { data: proofFiles, error: proofError } =
        rows.length > 0
          ? await supabase
              .from("subscription_payment_files")
              .select("*")
              .in(
                "payment_id",
                rows.map((item) => item.id)
              )
          : { data: [], error: null };

      if (proofError) throw proofError;

      const enriched: Payment[] = await Promise.all(
        rows.map(async (payment) => {
          const subscription = (subscriptions || []).find(
            (item) => item.id === payment.subscription_id
          );

          const plan = (plans || []).find(
            (item) => item.id === subscription?.plan_id
          );

          const customer = (customers || []).find(
            (item) => item.id === payment.customer_id
          );

          const proof = (proofFiles || []).find(
            (item) => item.payment_id === payment.id
          );

          const filePath =
            proof?.file_path ||
            proof?.storage_path ||
            proof?.path ||
            null;

          let proofUrl = "";

          if (filePath) {
            const { data } = await supabase.storage
              .from("pajara-files")
              .createSignedUrl(filePath, 3600);

            proofUrl = data?.signedUrl || "";
          }

          return {
            ...payment,
            customer_name:
              customer?.full_name ||
              customer?.name ||
              customer?.email ||
              "Customer",
            plan_name: plan?.name || "Paket Langganan",
            proof_url: proofUrl,
          };
        })
      );

      setPayments(enriched);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat konfirmasi pembayaran."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  async function updatePayment(
    paymentId: string,
    status: "verified" | "rejected"
  ) {
    const confirmation =
      status === "verified"
        ? "Verifikasi pembayaran paket ini?"
        : "Tolak pembayaran paket ini?";

    if (!window.confirm(confirmation)) return;

    setProcessingId(paymentId);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Sesi admin tidak ditemukan.");
      }

      const { error: updateError } = await supabase
        .from("subscription_payments")
        .update({
          status,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq("id", paymentId)
        .eq("status", "pending");

      if (updateError) throw updateError;

      setMessage(
        status === "verified"
          ? "Pembayaran berhasil diverifikasi."
          : "Pembayaran berhasil ditolak."
      );

      await loadPayments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui pembayaran."
      );
    } finally {
      setProcessingId(null);
    }
  }

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  const filteredPayments = payments.filter((payment) =>
    filter === "all" ? true : payment.status === filter
  );

  const pendingCount = payments.filter(
    (payment) => payment.status === "pending"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 pb-32 pt-5 sm:px-6 sm:pt-7 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#214d32] via-[#2f6b45] to-[#365f43] p-5 text-white shadow-[0_12px_32px_rgba(33,77,50,0.15)] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />

          <div className="relative">
            <button
              onClick={() => router.push("/orders")}
              className="mb-5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            >
              ← Kembali ke Kelola Pesanan
            </button>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              Verifikasi Pembayaran
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Konfirmasi Paket
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
              Periksa bukti pembayaran dan konfirmasi pembayaran paket pelanggan.
            </p>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-[#e8e5dc] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">
              Menunggu Konfirmasi
            </p>
            <p className="mt-2 text-3xl font-bold text-[#a87935]">
              {loading ? "—" : pendingCount}
            </p>
          </div>

          <div className="rounded-3xl border border-[#e8e5dc] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">
              Total Pembayaran
            </p>
            <p className="mt-2 text-3xl font-bold text-[#214d32]">
              {loading ? "—" : payments.length}
            </p>
          </div>
        </section>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#214d32]">
              Daftar Pembayaran
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {filteredPayments.length} pembayaran ditampilkan
            </p>
          </div>

          <button
            onClick={loadPayments}
            disabled={loading}
            className="rounded-xl border border-[#dce5da] bg-white px-4 py-2.5 text-xs font-semibold text-[#2f6b45] transition hover:bg-[#f0f5ef] disabled:opacity-50"
          >
            ↻ Muat Ulang
          </button>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {[
            { value: "pending", label: "Menunggu" },
            { value: "verified", label: "Terverifikasi" },
            { value: "rejected", label: "Ditolak" },
            { value: "all", label: "Semua" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === item.value
                  ? "bg-[#214d32] text-white"
                  : "border border-[#e5e2d9] bg-white text-gray-500 hover:border-[#b9cdbb]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#e8e5dc] bg-white p-10 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#dce6da] border-t-[#2f6b45]" />
            <p className="text-sm font-medium text-[#214d32]">
              Memuat pembayaran paket...
            </p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#dcded3] bg-white/70 px-5 py-12 text-center">
            <h3 className="font-semibold text-[#214d32]">
              Tidak ada pembayaran
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Belum ada pembayaran pada kategori ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <article
                key={payment.id}
                className="overflow-hidden rounded-3xl border border-[#e8e5dc] bg-white shadow-[0_4px_24px_rgba(33,77,50,0.04)]"
              >
                <div className="h-1 bg-gradient-to-r from-[#214d32] via-[#2f6b45] to-[#91a88e]" />

                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Pelanggan
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-[#214d32]">
                        {payment.customer_name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {payment.plan_name}
                      </p>
                    </div>

                    <span
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                        payment.status === "pending"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : payment.status === "verified"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {payment.status === "pending"
                        ? "Menunggu"
                        : payment.status === "verified"
                          ? "Terverifikasi"
                          : payment.status === "rejected"
                            ? "Ditolak"
                            : payment.status}
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#f5f7f1] p-4">
                    <p className="text-xs font-medium text-gray-500">
                      Jumlah Pembayaran
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#214d32]">
                      {formatRupiah(payment.amount || 0)}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-400">
                        Metode Pembayaran
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {payment.payment_method || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        ID Transaksi
                      </p>
                      <p className="mt-1 break-all text-sm font-semibold text-gray-700">
                        {payment.transaction_id || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Tanggal Pembayaran
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>

                  {payment.proof_url ? (
                    <a
                      href={payment.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 flex items-center justify-center rounded-2xl border border-[#dce5da] bg-[#f5f7f1] px-4 py-3 text-sm font-semibold text-[#2f6b45] transition hover:bg-[#eaf1e8]"
                    >
                      Lihat Bukti Pembayaran ↗
                    </a>
                  ) : (
                    <div className="mt-5 rounded-2xl bg-gray-50 px-4 py-3 text-center text-xs text-gray-400">
                      Bukti pembayaran tidak ditemukan.
                    </div>
                  )}

                  {payment.status === "pending" && (
                    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        onClick={() =>
                          updatePayment(payment.id, "rejected")
                        }
                        disabled={processingId === payment.id}
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        Tolak Pembayaran
                      </button>

                      <button
                        onClick={() =>
                          updatePayment(payment.id, "verified")
                        }
                        disabled={processingId === payment.id}
                        className="rounded-2xl bg-[#2f6b45] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#214d32] disabled:opacity-50"
                      >
                        {processingId === payment.id
                          ? "Memproses..."
                          : "Verifikasi Pembayaran"}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <footer className="mt-10 border-t border-[#e5e2d9] pt-5 text-center">
          <p className="text-xs font-medium tracking-wide text-gray-400">
            PAJARA STUDIO
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Desain yang punya arah.
          </p>
        </footer>
      </div>
    </main>
  );
}
