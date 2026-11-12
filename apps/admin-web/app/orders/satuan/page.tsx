
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

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

const STATUS: Record<string, { label: string; style: string }> = {
  pending: {
    label: "Pesanan Baru",
    style: "border-amber-200 bg-amber-50 text-amber-700",
  },
  waiting_dp: {
    label: "Menunggu DP",
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

export default function SingleOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
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
        (requests || []).map((item) => item.order_id).filter(Boolean)
      );

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
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(
        ((data || []) as Order[]).filter(
          (order) => !packageIds.has(order.id)
        )
      );
    } catch (err) {
      console.error("Gagal memuat pesanan satuan:", err);
      setError(
        err instanceof Error ? err.message : "Gagal memuat pesanan."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function formatRupiah(value: number | null) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  function formatDate(value: string | null) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function getStatus(status: string | null) {
    return STATUS[status || ""] || {
      label: status || "-",
      style: "border-gray-200 bg-gray-50 text-gray-600",
    };
  }

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 pb-32 pt-5 text-[#27382d] sm:px-6 sm:pt-7 md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#214d32] via-[#2f6b45] to-[#365f43] p-5 text-white shadow-[0_12px_32px_rgba(33,77,50,0.15)] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-24 h-40 w-40 rounded-full border border-white/10" />

          <div className="relative">
            <button
              onClick={() => router.push("/orders")}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Kembali ke Kelola Pesanan
            </button>

            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/65">
              Manajemen Pesanan
            </p>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Pesanan Satuan
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
                  Kelola pesanan desain dengan sistem pembayaran per pesanan.
                </p>
              </div>

              <button
                onClick={loadOrders}
                disabled={loading}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                ↻ Muat Ulang
              </button>
            </div>
          </div>
        </header>

        {/* STATISTICS */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#e8e5dc] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-gray-500">
                Total Pesanan Satuan
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f5ef] text-[#2f6b45]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                  <path d="M7 3h10l4 4v14H3V3h4Z" />
                  <path d="M7 3v5h10V3M7 13h10M7 17h6" />
                </svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#214d32]">
              {loading ? "—" : orders.length}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Pesanan dengan pembayaran per desain
            </p>
          </div>

          <div className="rounded-3xl border border-[#e8e5dc] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-gray-500">
                Pesanan Aktif
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#faf4e9] text-[#a87935]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#a87935]">
              {loading
                ? "—"
                : orders.filter(
                    (order) =>
                      !["completed", "cancelled"].includes(order.status || "")
                  ).length}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Pesanan yang belum selesai
            </p>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Gagal memuat pesanan</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* SECTION TITLE */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#214d32]">
              Daftar Pesanan
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {loading ? "Memuat data..." : `${orders.length} pesanan ditampilkan`}
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="rounded-3xl border border-[#e8e5dc] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-[#dce6da] border-t-[#2f6b45]" />
            <p className="text-sm font-semibold text-[#214d32]">
              Memuat pesanan satuan...
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Mohon tunggu sebentar
            </p>
          </div>
        ) : error ? null : orders.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-3xl border border-dashed border-[#dcded3] bg-white px-5 py-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0f5ef] text-[#2f6b45]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
                <path d="M7 3h10l4 4v14H3V3h4Z" />
                <path d="M7 3v5h10V3M8 14h8" />
              </svg>
            </div>
            <h3 className="font-bold text-[#214d32]">
              Belum Ada Pesanan Satuan
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
              Pesanan satuan customer akan tampil di sini ketika tersedia.
            </p>
          </div>
        ) : (
          /* ORDER LIST */
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
                        <p className="mb-2 inline-flex rounded-lg bg-[#f0f5ef] px-2.5 py-1 font-mono text-xs font-bold text-[#2f6b45]">
                          {order.order_code}
                        </p>

                        <h3 className="text-lg font-bold text-[#214d32] sm:text-xl">
                          {order.service_name || "Pesanan Desain"}
                        </h3>

                        <p className="mt-1.5 text-sm text-gray-500">
                          {order.design_type || "-"} · {order.quantity || 0} desain
                        </p>
                      </div>

                      <span className={`w-fit shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold ${status.style}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#f0eee8] pt-4 text-xs text-gray-500 sm:text-sm">
                      <span>
                        Dibuat: {formatDate(order.created_at)}
                      </span>
                      {order.deadline && (
                        <span>
                          Tenggat: {formatDate(order.deadline)}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      {[
                        {
                          label: "Total Pesanan",
                          value: formatRupiah(order.total_amount),
                          style: "bg-[#f5f7f1]",
                          text: "text-[#214d32]",
                        },
                        {
                          label: "Pembayaran DP",
                          value: formatRupiah(order.dp_amount),
                          style: "bg-[#faf8f2]",
                          text: "text-[#80623e]",
                        },
                        {
                          label: "Sisa Pembayaran",
                          value: formatRupiah(order.remaining_amount),
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

        {/* FOOTER */}
        <footer className="mt-10 border-t border-[#e5e2d9] pt-5 text-center">
          <p className="text-xs font-bold tracking-[0.16em] text-gray-400">
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
