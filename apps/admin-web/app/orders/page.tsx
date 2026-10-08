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
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
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
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setOrders((data || []) as Order[]);
  }

  async function loadSubscriptionPayments() {
    setPaymentError("");

    try {
      const { data: payments, error: paymentsError } = await supabase
        .from("subscription_payments")
        .select(
          `
            id,
            subscription_id,
            customer_id,
            amount,
            payment_method,
            transaction_id,
            status,
            created_at
          `
        )
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
          .select(
            `
              id,
              plan_id
            `
          )
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

      const { data: plans, error: plansError } = await supabase
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

      const { data: customers, error: customersError } = await supabase
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

      const subscriptionMap = new Map(
        (subscriptions || []).map((subscription) => [
          subscription.id,
          subscription,
        ])
      );

      const planMap = new Map(
        (plans || []).map((plan) => [plan.id, plan])
      );

      const customerMap = new Map(
        (customers || []).map((customer) => [customer.id, customer])
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
        .select(
          `
            id,
            file_name,
            storage_path,
            mime_type
          `
        )
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

      const { error: updateError } = await supabase
        .from("subscription_payments")
        .update({
          status: "verified",
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq("id", payment.id)
        .eq("status", "pending");

      if (updateError) {
        alert(`Gagal memverifikasi pembayaran: ${updateError.message}`);
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
      const { error: updateError } = await supabase
        .from("subscription_payments")
        .update({
          status: "rejected",
        })
        .eq("id", payment.id)
        .eq("status", "pending");

      if (updateError) {
        alert(`Gagal menolak pembayaran: ${updateError.message}`);
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
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
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
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "revision":
        return "bg-purple-100 text-purple-700";
      case "waiting_payment":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#2f6b45]">
              Pajara Admin
            </p>

            <h1 className="text-3xl font-bold text-[#214d32]">
              Pesanan
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Kelola pembayaran paket dan pesanan desain customer.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-[#2f6b45]/20 bg-white px-4 py-2 text-sm font-semibold text-[#2f6b45] shadow-sm transition hover:bg-[#2f6b45] hover:text-white"
          >
            Kembali ke Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* PEMBAYARAN PAKET */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#214d32]">
              Pembayaran Paket
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Verifikasi pembayaran Paket Mingguan dan Paket Bulanan.
            </p>
          </div>

          {paymentError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {paymentError}
            </div>
          )}

          {paymentLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
              Memuat pembayaran paket...
            </div>
          ) : subscriptionPayments.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
              Belum ada pembayaran paket.
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptionPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-[#214d32]">
                          {payment.plan_name}
                        </h3>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {payment.customer_name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {payment.customer_email}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClass(
                          payment.status
                        )}`}
                      >
                        {getPaymentStatusLabel(payment.status)}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl bg-[#f7f4ee] p-3">
                        <p className="text-xs text-gray-500">
                          Jumlah
                        </p>

                        <p className="mt-1 font-bold text-[#214d32]">
                          {formatRupiah(payment.amount)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f7f4ee] p-3">
                        <p className="text-xs text-gray-500">
                          Metode
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {payment.payment_method}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f7f4ee] p-3">
                        <p className="text-xs text-gray-500">
                          ID Transaksi
                        </p>

                        <p className="mt-1 break-all font-semibold text-gray-800">
                          {payment.transaction_id || "-"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f7f4ee] p-3">
                        <p className="text-xs text-gray-500">
                          Waktu
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => openPaymentProof(payment.id)}
                        disabled={actionLoading === payment.id}
                        className="rounded-xl border border-[#2f6b45]/20 bg-white px-4 py-3 text-sm font-semibold text-[#2f6b45] transition hover:bg-[#2f6b45] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading === payment.id
                          ? "Memuat..."
                          : "Lihat Bukti Pembayaran"}
                      </button>

                      {payment.status === "pending" && (
                        <>
                          <button
                            onClick={() => rejectPayment(payment)}
                            disabled={actionLoading === payment.id}
                            className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Tolak
                          </button>

                          <button
                            onClick={() => verifyPayment(payment)}
                            disabled={actionLoading === payment.id}
                            className="rounded-xl bg-[#2f6b45] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#214d32] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Verifikasi
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PESANAN DESAIN */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#214d32]">
              Pesanan Desain
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Daftar pesanan desain dari customer.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
              Memuat pesanan...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
              Belum ada pesanan desain.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#2f6b45]">
                        {order.order_code}
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-[#214d32]">
                        {order.service_name || "Pesanan Desain"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {order.design_type || "-"} ·{" "}
                        {order.quantity || 0} desain
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        Dibuat: {formatDate(order.created_at)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getOrderStatusClass(
                        order.status
                      )}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-[#f7f4ee] p-3">
                      <p className="text-xs text-gray-500">
                        Total
                      </p>

                      <p className="mt-1 font-bold text-[#214d32]">
                        {formatRupiah(order.total_amount || 0)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#f7f4ee] p-3">
                      <p className="text-xs text-gray-500">
                        DP
                      </p>

                      <p className="mt-1 font-bold text-[#214d32]">
                        {formatRupiah(order.dp_amount || 0)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#f7f4ee] p-3">
                      <p className="text-xs text-gray-500">
                        Sisa
                      </p>

                      <p className="mt-1 font-bold text-[#214d32]">
                        {formatRupiah(order.remaining_amount || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() =>
                        router.push(
                          `/orders/detail?id=${encodeURIComponent(
                            order.id
                          )}`
                        )
                      }
                      className="w-full rounded-xl bg-[#2f6b45] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#214d32]"
                    >
                      Lihat Detail Pesanan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
