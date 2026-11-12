
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  quantity: number | null;
  total_amount: number | null;
  dp_amount: number | null;
  remaining_amount: number | null;
  status: string | null;
  deadline: string | null;
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function PackageOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOrders() {
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

      const { data: requests, error: requestsError } = await supabase
        .from("subscription_requests")
        .select("order_id")
        .not("order_id", "is", null);

      if (requestsError) throw requestsError;

      const packageIds = new Set(
        (requests || [])
          .map((item) => item.order_id)
          .filter(Boolean)
      );

      if (packageIds.size === 0) {
        setOrders([]);
        return;
      }

      const { data, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          order_code,
          service_name,
          design_type,
          quantity,
          total_amount,
          dp_amount,
          remaining_amount,
          status,
          deadline,
          created_at
        `)
        .in("id", Array.from(packageIds))
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      setOrders((data || []) as Order[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat pesanan paket."
      );
    } finally {
      setLoading(false);
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

  function getStatus(status: string | null) {
    const statuses: Record<string, { label: string; style: string }> = {
      pending: {
        label: "Pesanan Baru",
        style: "border-amber-200 bg-amber-50 text-amber-700",
      },
      processing: {
        label: "Diproses",
        style: "border-blue-200 bg-blue-50 text-blue-700",
      },
      revision: {
        label: "Revisi",
        style: "border-purple-200 bg-purple-50 text-purple-700",
      },
      waiting_payment: {
        label: "Menunggu Pelunasan",
        style: "border-orange-200 bg-orange-50 text-orange-700",
      },
      completed: {
        label: "Selesai",
        style: "border-emerald-200 bg-emerald-50 text-emerald-700",
      },
      cancelled: {
        label: "Dibatalkan",
        style: "border-red-200 bg-red-50 text-red-700",
      },
    };

    return statuses[status || ""] || {
      label: status || "-",
      style: "border-gray-200 bg-gray-50 text-gray-600",
    };
  }

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
              Manajemen Pesanan
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pesanan Paket
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
              Kelola pesanan pelanggan yang menggunakan layanan berlangganan atau paket.
            </p>
          </div>
        </header>

        <section className="mb-6 rounded-3xl border border-[#e8e5dc] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Pesanan Paket
          </p>
          <p className="mt-2 text-3xl font-bold text-[#214d32]">
            {loading ? "—" : orders.length}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Pesanan yang terdaftar melalui sistem paket
          </p>
        </section>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-[#e8e5dc] bg-white p-10 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#dce6da] border-t-[#2f6b45]" />
            <p className="text-sm font-medium text-[#214d32]">
              Memuat pesanan paket...
            </p>
          </div>
        ) : error ? null : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#dcded3] bg-white/70 px-5 py-12 text-center">
            <h3 className="font-semibold text-[#214d32]">
              Belum ada pesanan paket
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Pesanan paket pelanggan akan tampil di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = getStatus(order.status);

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-[#e8e5dc] bg-white shadow-[0_4px_24px_rgba(33,77,50,0.04)] transition hover:border-[#cbd9ce] hover:shadow-md"
                >
                  <div className="h-1 bg-gradient-to-r from-[#214d32] via-[#2f6b45] to-[#91a88e]" />

                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="mb-2 inline-flex rounded-lg bg-[#f0f5ef] px-2.5 py-1 font-mono text-xs font-semibold text-[#2f6b45]">
                          {order.order_code}
                        </p>

                        <h2 className="text-lg font-bold text-[#214d32] sm:text-xl">
                          {order.service_name || "Pesanan Paket"}
                        </h2>

                        <p className="mt-1.5 text-sm text-gray-500">
                          {order.design_type || "-"} · {order.quantity || 0} desain
                        </p>
                      </div>

                      <span className={`w-fit shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold ${status.style}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#f0eee8] pt-3 text-xs text-gray-500 sm:text-sm">
                      <span>Dibuat: {formatDate(order.created_at)}</span>
                      {order.deadline && (
                        <span>Tenggat: {formatDate(order.deadline)}</span>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      {[
                        {
                          label: "Total Pesanan",
                          value: formatRupiah(order.total_amount || 0),
                          style: "bg-[#f5f7f1]",
                          text: "text-[#214d32]",
                        },
                        {
                          label: "Pembayaran DP",
                          value: formatRupiah(order.dp_amount || 0),
                          style: "bg-[#faf8f2]",
                          text: "text-[#80623e]",
                        },
                        {
                          label: "Sisa Pembayaran",
                          value: formatRupiah(order.remaining_amount || 0),
                          style: "bg-[#f7f4ee]",
                          text: "text-[#214d32]",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`rounded-2xl border border-black/[0.03] p-3.5 ${item.style}`}
                        >
                          <p className="text-xs font-medium text-gray-500">
                            {item.label}
                          </p>
                          <p className={`mt-1.5 break-words text-base font-bold ${item.text}`}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/orders/detail?id=${encodeURIComponent(order.id)}`
                        )
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f6b45] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#214d32] active:scale-[0.99]"
                    >
                      Lihat Detail Pesanan
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                </article>
              );
            })}
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
