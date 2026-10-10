
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

type SubscriptionPayment = {
  id: string;
  subscription_id: string;
  customer_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string | null;
  status: string;
  created_at: string;
  plan_name: string;
  customer_name: string;
  customer_email: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptionOrderIds, setSubscriptionOrderIds] = useState<string[]>(
    []
  );
  const [subscriptionPayments, setSubscriptionPayments] = useState<
    SubscriptionPayment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPage() {
    setLoading(true);
    setPaymentLoading(true);
    setError("");
    setPaymentError("");

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

      if (profileError) {
        throw new Error(profileError.message);
      }

      if (profile?.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      await Promise.all([loadOrders(), loadSubscriptionPayments()]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan.";

      setError(message);
    } finally {
      setLoading(false);
      setPaymentLoading(false);
    }
  }

  async function loadOrders() {
    setError("");

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

    if (ordersError) {
      setError(`Gagal memuat pesanan: ${ordersError.message}`);
      setOrders([]);
      setSubscriptionOrderIds([]);
      return;
    }

    const loadedOrders = (data || []) as Order[];

    if (loadedOrders.length === 0) {
      setOrders([]);
      setSubscriptionOrderIds([]);
      return;
    }

    const { data: requests, error: requestsError } = await supabase
      .from("subscription_requests")
      .select("order_id")
      .not("order_id", "is", null);

    if (requestsError) {
      setError(
        `Gagal menentukan jenis pesanan paket: ${requestsError.message}. Periksa izin baca tabel subscription_requests untuk Admin.`
      );
      setOrders([]);
      setSubscriptionOrderIds([]);
      return;
    }

    const packageOrderIds = [
      ...new Set(
        (requests || [])
          .map((request) => request.order_id as string | null)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    setOrders(loadedOrders);
    setSubscriptionOrderIds(packageOrderIds);
  }

  async function loadSubscriptionPayments() {
    setPaymentError("");

    try {
      const { data: payments, error: paymentsError } = await supabase
        .from("subscription_payments")
        .select(`
          id,
          subscription_id,
          customer_id,
          amount,
          payment_method,
          transaction_id,
          status,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (paymentsError) {
        setPaymentError(
          `Gagal memuat pembayaran paket: ${paymentsError.message}`
        );
        setSubscriptionPayments([]);
        return;
      }

      if (!payments || payments.length === 0) {
        setSubscriptionPayments([]);
        return;
      }

      const subscriptionIds = [
        ...new Set(
          payments
            .map((payment) => payment.subscription_id)
            .filter(Boolean)
        ),
      ];

      const customerIds = [
        ...new Set(
          payments.map((payment) => payment.customer_id).filter(Boolean)
        ),
      ];

      const { data: subscriptions, error: subscriptionsError } =
        await supabase
          .from("subscriptions")
          .select("id, plan_id")
          .in("id", subscriptionIds);

      if (subscriptionsError) {
        setPaymentError(
          `Gagal memuat data paket: ${subscriptionsError.message}`
        );
        setSubscriptionPayments([]);
        return;
      }

      const planIds = [
        ...new Set(
          (subscriptions || [])
            .map((subscription) => subscription.plan_id)
            .filter(Boolean)
        ),
      ];

      let plans: { id: string; name: string }[] = [];

      if (planIds.length > 0) {
        const { data, error: plansError } = await supabase
          .from("subscription_plans")
          .select("id, name")
          .in("id", planIds);

        if (plansError) {
          setPaymentError(
            `Gagal memuat data paket: ${plansError.message}`
          );
          setSubscriptionPayments([]);
          return;
        }

        plans = data || [];
      }

      let customers: {
        id: string;
        full_name: string | null;
        email: string | null;
      }[] = [];

      if (customerIds.length > 0) {
        const { data, error: customersError } = await supabase
          .from("profiles_v2")
          .select("id, full_name, email")
          .in("id", customerIds);

        if (customersError) {
          setPaymentError(
            `Gagal memuat data customer: ${customersError.message}`
          );
          setSubscriptionPayments([]);
          return;
        }

        customers = data || [];
      }

      const subscriptionMap = new Map(
        (subscriptions || []).map((subscription) => [
          subscription.id,
          subscription,
        ])
      );

      const planMap = new Map(
        plans.map((plan) => [plan.id, plan])
      );

      const customerMap = new Map(
        customers.map((customer) => [customer.id, customer])
      );

      const normalizedPayments: SubscriptionPayment[] = payments.map(
        (payment) => {
          const subscription = subscriptionMap.get(
            payment.subscription_id
          );

          const plan = subscription
            ? planMap.get(subscription.plan_id)
            : null;

          const customer = customerMap.get(payment.customer_id);

          return {
            id: payment.id,
            subscription_id: payment.subscription_id,
            customer_id: payment.customer_id,
            amount: Number(payment.amount || 0),
            payment_method: payment.payment_method,
            transaction_id: payment.transaction_id,
            status: payment.status,
            created_at: payment.created_at,
            plan_name: plan?.name || "Paket Tidak Diketahui",
            customer_name:
              customer?.full_name || "Customer Tidak Diketahui",
            customer_email: customer?.email || "-",
          };
        }
      );

      setSubscriptionPayments(normalizedPayments);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan.";

      setPaymentError(`Gagal memuat pembayaran paket: ${message}`);
      setSubscriptionPayments([]);
    }
  }

  async function openPaymentProof(paymentId: string) {
    setActionLoading(paymentId);

    try {
      const { data: file, error: fileError } = await supabase
        .from("subscription_payment_files")
        .select("id, file_name, storage_path, mime_type")
        .eq("subscription_payment_id", paymentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fileError) {
        alert(`Gagal memuat bukti pembayaran: ${fileError.message}`);
        return;
      }

      if (!file) {
        alert("Bukti pembayaran belum ditemukan.");
        return;
      }

      const { data: signedUrl, error: signedUrlError } =
        await supabase.storage
          .from("pajara-files")
          .createSignedUrl(file.storage_path, 60 * 60);

      if (signedUrlError || !signedUrl?.signedUrl) {
        alert(
          `Gagal membuka bukti pembayaran: ${
            signedUrlError?.message || "URL tidak tersedia."
          }`
        );
        return;
      }

      window.open(
        signedUrl.signedUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function verifyPayment(payment: SubscriptionPayment) {
    const confirmed = window.confirm(
      `Verifikasi pembayaran ${payment.plan_name} sebesar ${formatRupiah(
        payment.amount
      )}?`
    );

    if (!confirmed) return;

    setActionLoading(payment.id);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Sesi Admin tidak ditemukan.");
        return;
      }

      const { data: updatedPayments, error: updateError } = await supabase
        .from("subscription_payments")
        .update({
          status: "verified",
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq("id", payment.id)
        .eq("status", "pending")
        .select("id");

      if (updateError) {
        alert(`Gagal memverifikasi pembayaran: ${updateError.message}`);
        return;
      }

      if (!updatedPayments || updatedPayments.length === 0) {
        alert(
          "Pembayaran tidak berubah. Mungkin sudah diproses sebelumnya atau izin pembaruan ditolak."
        );
        await loadSubscriptionPayments();
        return;
      }

      alert(
        "Pembayaran berhasil diverifikasi. Paket akan otomatis diaktifkan."
      );

      await loadSubscriptionPayments();
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectPayment(payment: SubscriptionPayment) {
    const confirmed = window.confirm(
      `Tolak pembayaran ${payment.plan_name} dari ${payment.customer_name}?`
    );

    if (!confirmed) return;

    setActionLoading(payment.id);

    try {
      const { data: updatedPayments, error: updateError } = await supabase
        .from("subscription_payments")
        .update({ status: "rejected" })
        .eq("id", payment.id)
        .eq("status", "pending")
        .select("id");

      if (updateError) {
        alert(`Gagal menolak pembayaran: ${updateError.message}`);
        return;
      }

      if (!updatedPayments || updatedPayments.length === 0) {
        alert(
          "Pembayaran tidak berubah. Mungkin sudah diproses sebelumnya atau izin pembaruan ditolak."
        );
        await loadSubscriptionPayments();
        return;
      }

      alert("Pembayaran berhasil ditolak.");
      await loadSubscriptionPayments();
    } finally {
      setActionLoading(null);
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

  function getPaymentStatusLabel(status: string) {
    switch (status) {
      case "pending":
        return "Menunggu Verifikasi";
      case "verified":
        return "Terverifikasi";
      case "rejected":
        return "Ditolak";
      default:
        return status;
    }
  }

  function getPaymentStatusClass(status: string) {
    switch (status) {
      case "verified":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "rejected":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  }

  function getOrderStatusLabel(status: string | null) {
    switch (status) {
      case "pending":
        return "Pesanan Baru";
      case "processing":
        return "Diproses";
      case "revision":
        return "Revisi";
      case "waiting_payment":
        return "Menunggu Pelunasan";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status || "-";
    }
  }

  function getOrderStatusClass(status: string | null) {
    switch (status) {
      case "completed":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "cancelled":
        return "border-red-200 bg-red-50 text-red-700";
      case "processing":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "revision":
        return "border-purple-200 bg-purple-50 text-purple-700";
      case "waiting_payment":
        return "border-orange-200 bg-orange-50 text-orange-700";
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  }

  function renderOrderCard(order: Order, isPackageOrder: boolean) {
    return (
      <article
        key={order.id}
        className="group overflow-hidden rounded-3xl border border-[#e8e5dc] bg-white shadow-[0_4px_24px_rgba(33,77,50,0.04)] transition duration-200 hover:border-[#cbd9ce] hover:shadow-[0_12px_32px_rgba(33,77,50,0.08)]"
      >
        <div className="h-1 bg-gradient-to-r from-[#214d32] via-[#2f6b45] to-[#91a88e]" />

        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="mb-2 inline-flex items-center gap-2 rounded-lg bg-[#f0f5ef] px-2.5 py-1 font-mono text-xs font-semibold text-[#2f6b45]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2f6b45]" />
                  {order.order_code}
                </p>

                <h3 className="text-lg font-bold leading-snug text-[#214d32] sm:text-xl">
                  {order.service_name || "Pesanan Desain"}
                </h3>

                <p className="mt-1.5 text-sm text-gray-500">
                  {order.design_type || "-"}{" "}
                  <span className="mx-1 text-gray-300">·</span>
                  {order.quantity || 0} desain
                </p>
              </div>

              <span
                className={`shrink-0 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold sm:text-xs ${
                  isPackageOrder
                    ? "border-purple-200 bg-purple-50 text-purple-700"
                    : "border-[#e8e5dc] bg-[#faf9f6] text-gray-600"
                }`}
              >
                {isPackageOrder ? "Paket" : "Satuan"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#f0eee8] pt-3 text-xs text-gray-500 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-4 w-4 text-[#78917c]"
                >
                  <rect x="3.5" y="5" width="17" height="15" rx="2" />
                  <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" />
                </svg>
                {formatDate(order.created_at)}
              </span>

              {order.deadline && (
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-4 w-4 text-[#78917c]"
                  >
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  Tenggat: {formatDate(order.deadline)}
                </span>
              )}
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getOrderStatusClass(
                  order.status
                )}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {getOrderStatusLabel(order.status)}
              </span>
            </div>
          </div>

          {isPackageOrder ? (
            <div className="mt-5 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                  >
                    <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z" />
                    <path d="m4.5 8.5 7.5 4 7.5-4M12 13v7M8 6.2l8 4.5" />
                  </svg>
                </div>

                <div>
                  <p className="font-semibold text-purple-900">
                    Menggunakan kuota paket
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-purple-700">
                    Pesanan ini menggunakan kuota Paket Mingguan atau
                    Bulanan. Tidak ada tagihan tambahan per desain.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {[
                {
                  label: "Total Pesanan",
                  value: formatRupiah(order.total_amount || 0),
                  style: "bg-[#f5f7f1]",
                  valueStyle: "text-[#214d32]",
                },
                {
                  label: "Pembayaran DP",
                  value: formatRupiah(order.dp_amount || 0),
                  style: "bg-[#faf8f2]",
                  valueStyle: "text-[#80623e]",
                },
                {
                  label: "Sisa Pembayaran",
                  value: formatRupiah(order.remaining_amount || 0),
                  style: "bg-[#f7f4ee]",
                  valueStyle: "text-[#214d32]",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border border-black/[0.03] p-3.5 ${item.style}`}
                >
                  <p className="text-xs font-medium text-gray-500">
                    {item.label}
                  </p>
                  <p
                    className={`mt-1.5 break-words text-base font-bold ${item.valueStyle}`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}

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
  }

  const packageOrderIdSet = new Set(subscriptionOrderIds);

  const singleOrders = orders.filter(
    (order) => !packageOrderIdSet.has(order.id)
  );

  const packageOrders = orders.filter((order) =>
    packageOrderIdSet.has(order.id)
  );

  const pendingPayments = subscriptionPayments.filter(
    (payment) => payment.status === "pending"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 pb-32 pt-5 sm:px-6 sm:pt-7 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <header className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#214d32] via-[#2f6b45] to-[#365f43] p-5 text-white shadow-[0_12px_32px_rgba(33,77,50,0.15)] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-5 h-32 w-32 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-white/[0.04]" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
              <span className="h-2 w-2 rounded-full bg-[#c7dfbd]" />
              Pajara Admin
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Kelola Pesanan
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              Pantau pesanan desain, kelola pembayaran paket, dan
              tindak lanjuti setiap pesanan customer dari satu tempat.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-white/85">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                {orders.length} pesanan desain
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                {pendingPayments} pembayaran menunggu
              </span>
            </div>
          </div>
        </header>

        {/* RINGKASAN */}
        <section className="mb-9 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-3xl border border-[#e8e5dc] bg-white p-5 shadow-[0_4px_20px_rgba(33,77,50,0.03)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Pesanan
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[#214d32]">
                  {loading ? "—" : orders.length}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Semua pesanan desain
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4ec] text-[#2f6b45]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                >
                  <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
                  <path d="M14 3.5V8h4M8.5 12h7M8.5 16h7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#e8e5dc] bg-white p-5 shadow-[0_4px_20px_rgba(33,77,50,0.03)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pesanan Satuan
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[#214d32]">
                  {loading ? "—" : singleOrders.length}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Pembayaran per pesanan
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f1e8] text-[#8a6a4a]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                >
                  <rect x="4" y="4" width="16" height="16" rx="3" />
                  <path d="M8 9h8M8 13h5M8 16h3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#e8e5dc] bg-white p-5 shadow-[0_4px_20px_rgba(33,77,50,0.03)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pesanan Paket
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[#214d32]">
                  {loading ? "—" : packageOrders.length}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Menggunakan kuota paket
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                >
                  <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                  <path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v9M8 5.3l8 4.5" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span className="font-bold">!</span>
            <p>{error}</p>
          </div>
        )}

        {/* PEMBAYARAN PAKET */}
        <section className="mb-10">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#66836b]">
                Pembayaran
              </p>
              <h2 className="text-xl font-bold tracking-tight text-[#214d32] sm:text-2xl">
                Pembayaran Paket
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-gray-500">
                Verifikasi pembayaran pembelian dan perpanjangan paket.
              </p>
            </div>

            <span className="shrink-0 rounded-xl border border-[#e8e5dc] bg-white px-3 py-2 text-xs font-semibold text-gray-600">
              {paymentLoading ? "…" : subscriptionPayments.length} transaksi
            </span>
          </div>

          {paymentError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {paymentError}
            </div>
          )}

          {paymentLoading ? (
            <div className="rounded-3xl border border-[#e8e5dc] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#dce6da] border-t-[#2f6b45]" />
              <p className="text-sm font-medium text-[#214d32]">
                Memuat pembayaran paket
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Mohon tunggu sebentar…
              </p>
            </div>
          ) : subscriptionPayments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#dcded3] bg-white/70 px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf4ec] text-[#2f6b45]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-7 w-7"
                >
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="M3 10h18M7 15h3" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-[#214d32]">
                Belum ada pembayaran paket
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-gray-500">
                Transaksi pembelian atau perpanjangan paket akan muncul
                di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptionPayments.map((payment) => (
                <article
                  key={payment.id}
                  className="overflow-hidden rounded-3xl border border-[#e8e5dc] bg-white shadow-[0_4px_24px_rgba(33,77,50,0.04)]"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf4ec] text-[#2f6b45]">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className="h-6 w-6"
                          >
                            <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" />
                            <path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v9" />
                          </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-[#214d32]">
                                {payment.plan_name}
                              </h3>
                              <p className="mt-1 text-sm font-semibold text-gray-800">
                                {payment.customer_name}
                              </p>
                              <p className="mt-0.5 break-all text-sm text-gray-500">
                                {payment.customer_email}
                              </p>
                            </div>

                            <span
                              className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getPaymentStatusClass(
                                payment.status
                              )}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {getPaymentStatusLabel(payment.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#f7f6f1] p-4">
                        <p className="text-xs font-medium text-gray-500">
                          Jumlah Pembayaran
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-[#214d32]">
                          {formatRupiah(payment.amount)}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        <div className="rounded-2xl border border-[#efede6] p-3.5">
                          <p className="text-xs text-gray-500">
                            Metode Pembayaran
                          </p>
                          <p className="mt-1.5 break-words text-sm font-semibold text-gray-800">
                            {payment.payment_method}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#efede6] p-3.5">
                          <p className="text-xs text-gray-500">
                            ID Transaksi
                          </p>
                          <p className="mt-1.5 break-all text-sm font-semibold text-gray-800">
                            {payment.transaction_id || "-"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#efede6] p-3.5">
                          <p className="text-xs text-gray-500">
                            Waktu Transaksi
                          </p>
                          <p className="mt-1.5 text-sm font-semibold leading-relaxed text-gray-800">
                            {formatDate(payment.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 border-t border-[#f0eee8] pt-4 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => openPaymentProof(payment.id)}
                          disabled={actionLoading === payment.id}
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#dce6da] bg-white px-4 py-3 text-sm font-semibold text-[#2f6b45] transition hover:bg-[#f0f5ef] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className="h-4 w-4"
                          >
                            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                            <circle cx="12" cy="12" r="2.5" />
                          </svg>
                          {actionLoading === payment.id
                            ? "Memuat bukti..."
                            : "Lihat Bukti Pembayaran"}
                        </button>

                        {payment.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => rejectPayment(payment)}
                              disabled={actionLoading === payment.id}
                              className="min-h-11 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Tolak
                            </button>

                            <button
                              type="button"
                              onClick={() => verifyPayment(payment)}
                              disabled={actionLoading === payment.id}
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2f6b45] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#214d32] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {actionLoading === payment.id ? (
                                "Memproses..."
                              ) : (
                                <>
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-4 w-4"
                                  >
                                    <path d="m5 12 4 4L19 6" />
                                  </svg>
                                  Verifikasi
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* PESANAN SATUAN */}
        <section className="mb-10">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6a4a]">
                Desain per pesanan
              </p>
              <h2 className="text-xl font-bold tracking-tight text-[#214d32] sm:text-2xl">
                Pesanan Satuan
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-gray-500">
                Pesanan desain biasa dengan pembayaran per pesanan.
              </p>
            </div>

            <span className="shrink-0 rounded-xl border border-[#e8e5dc] bg-white px-3 py-2 text-sm font-bold text-[#214d32]">
              {loading ? "…" : singleOrders.length}
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[#e8e5dc] bg-white p-10 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#dce6da] border-t-[#2f6b45]" />
              <p className="text-sm font-medium text-[#214d32]">
                Memuat pesanan satuan
              </p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[#e8e5dc] bg-white p-6 text-center text-sm text-gray-500">
              Daftar pesanan belum dapat ditampilkan.
            </div>
          ) : singleOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#dcded3] bg-white/70 px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f1e8] text-[#8a6a4a]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-7 w-7"
                >
                  <rect x="4" y="4" width="16" height="16" rx="3" />
                  <path d="M8 9h8M8 13h5M8 16h3" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-[#214d32]">
                Belum ada pesanan satuan
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Pesanan satuan customer akan tampil di bagian ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {singleOrders.map((order) =>
                renderOrderCard(order, false)
              )}
            </div>
          )}
        </section>

        {/* PESANAN PAKET */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-purple-600">
                Desain berbasis kuota
              </p>
              <h2 className="text-xl font-bold tracking-tight text-[#214d32] sm:text-2xl">
                Pesanan Paket
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-gray-500">
                Pesanan desain yang menggunakan kuota Paket Mingguan atau
                Bulanan.
              </p>
            </div>

            <span className="shrink-0 rounded-xl border border-purple-100 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700">
              {loading ? "…" : packageOrders.length}
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[#e8e5dc] bg-white p-10 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#dce6da] border-t-[#2f6b45]" />
              <p className="text-sm font-medium text-[#214d32]">
                Memuat pesanan paket
              </p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[#e8e5dc] bg-white p-6 text-center text-sm text-gray-500">
              Daftar pesanan belum dapat ditampilkan.
            </div>
          ) : packageOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#dcded3] bg-white/70 px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-7 w-7"
                >
                  <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                  <path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v9" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-[#214d32]">
                Belum ada pesanan paket
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Pesanan yang memakai kuota paket akan tampil di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {packageOrders.map((order) =>
                renderOrderCard(order, true)
              )}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-[#e5e2d9] pt-5 text-center">
          <p className="text-xs font-medium tracking-wide text-gray-400">
            PAJARA STUDIO
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Kelola dengan rapi, berkarya dengan arah.
          </p>
        </footer>
      </div>
    </main>
  );
}
