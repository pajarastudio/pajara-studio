
"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type RevisionPayment = {
  id: string;
  order_id: string;
  payment_method: string | null;
  payment_type: string | null;
  amount: number | null;
  transaction_id: string | null;
  proof_file_id: string | null;
  status: string | null;
  created_at: string | null;
  order_code: string;
  customer_name: string;
  customer_email: string;
  design_number: number | null;
  extra_revisions: number | null;
};

export default function KonfirmasiPembayaranRevisiPage() {
  const router = useRouter();

  const [payments, setPayments] = useState<RevisionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
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

      const { data: revisions, error: revisionError } = await supabase
        .from("revision_quota_purchases")
        .select(
          "id, order_id, design_number, payment_id, extra_revisions, created_at"
        )
        .order("created_at", { ascending: false });

      if (revisionError) throw revisionError;

      if (!revisions?.length) {
        setPayments([]);
        return;
      }

      const paymentIds = revisions
        .map((item) => item.payment_id)
        .filter((id): id is string => Boolean(id));

      if (!paymentIds.length) {
        setPayments([]);
        return;
      }

      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .select(
          "id, order_id, payment_method, payment_type, amount, transaction_id, proof_file_id, status, created_at"
        )
        .in("id", paymentIds)
        .order("created_at", { ascending: false });

      if (paymentError) throw paymentError;

      if (!paymentData?.length) {
        setPayments([]);
        return;
      }

      const orderIds = [
        ...new Set(paymentData.map((item) => item.order_id).filter(Boolean)),
      ];

      const { data: orders, error: orderError } = await supabase
        .from("orders")
        .select("id, order_code, customer_id")
        .in("id", orderIds);

      if (orderError) throw orderError;

      const customerIds = [
        ...new Set(
          (orders || []).map((item) => item.customer_id).filter(Boolean)
        ),
      ];

      const { data: customers, error: customerError } = await supabase
        .from("profiles_v2")
        .select("id, full_name, email")
        .in("id", customerIds);

      if (customerError) throw customerError;

      const result: RevisionPayment[] = paymentData.map((payment) => {
        const revision = revisions.find(
          (item) => item.payment_id === payment.id
        );

        const order = orders?.find(
          (item) => item.id === payment.order_id
        );

        const customer = customers?.find(
          (item) => item.id === order?.customer_id
        );

        return {
          ...payment,
          order_code: order?.order_code || "-",
          customer_name: customer?.full_name || "Customer",
          customer_email: customer?.email || "-",
          design_number: revision?.design_number ?? null,
          extra_revisions: revision?.extra_revisions ?? null,
        };
      });

      setPayments(result);
    } catch (err) {
      console.error("Gagal memuat pembayaran revisi:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data pembayaran revisi."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const openProof = async (payment: RevisionPayment) => {
    if (!payment.proof_file_id) {
      setError("Bukti pembayaran tidak tersedia.");
      return;
    }

    setOpeningId(payment.id);
    setError("");

    try {
      const { data: file, error: fileError } = await supabase
        .from("order_files")
        .select("file_path")
        .eq("id", payment.proof_file_id)
        .maybeSingle();

      if (fileError) throw fileError;

      if (!file?.file_path) {
        throw new Error("File bukti pembayaran tidak ditemukan.");
      }

      const { data, error: storageError } = await supabase.storage
        .from("pajara-files")
        .createSignedUrl(file.file_path, 3600);

      if (storageError) throw storageError;

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Gagal membuka bukti pembayaran:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal membuka bukti pembayaran."
      );
    } finally {
      setOpeningId(null);
    }
  };

  const updatePaymentStatus = async (
    payment: RevisionPayment,
    status: "verified" | "rejected"
  ) => {
    const confirmation =
      status === "verified"
        ? "Verifikasi pembayaran revisi ini?"
        : "Tolak pembayaran revisi ini?";

    if (!window.confirm(confirmation)) return;

    setProcessingId(payment.id);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const updateData: {
        status: string;
        verified_by?: string;
        verified_at?: string;
      } = { status };

      if (status === "verified") {
        updateData.verified_by = user.id;
        updateData.verified_at = new Date().toISOString();
      }

      const { data, error: updateError } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", payment.id)
        .eq("status", "pending")
        .select("id");

      if (updateError) throw updateError;

      if (!data?.length) {
        setMessage("Pembayaran sudah diproses atau statusnya telah berubah.");
        await loadPayments();
        return;
      }

      setMessage(
        status === "verified"
          ? "Pembayaran revisi berhasil diverifikasi."
          : "Pembayaran revisi berhasil ditolak."
      );

      await loadPayments();
    } catch (err) {
      console.error("Gagal memperbarui pembayaran:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui status pembayaran."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayments = payments.filter((payment) =>
    filter === "all" ? true : payment.status === filter
  );

  const pendingCount = payments.filter(
    (payment) => payment.status === "pending"
  ).length;

  const verifiedCount = payments.filter(
    (payment) => payment.status === "verified"
  ).length;

  const rejectedCount = payments.filter(
    (payment) => payment.status === "rejected"
  ).length;

  const formatRupiah = (amount: number | null) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const statusLabel = (status: string | null) => {
    switch (status) {
      case "pending":
        return "Menunggu Konfirmasi";
      case "verified":
        return "Terverifikasi";
      case "rejected":
        return "Ditolak";
      default:
        return status || "Tidak diketahui";
    }
  };

  const statusStyle = (status: string | null) => {
    switch (status) {
      case "pending":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "verified":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "rejected":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-600";
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 pb-32 pt-5 sm:px-6 sm:pt-7 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <header className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#214d32] via-[#2f6b45] to-[#365f43] p-5 text-white shadow-[0_12px_32px_rgba(33,77,50,0.15)] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full border border-white/10" />

          <div className="relative">
            <button
              type="button"
              onClick={() => router.push("/orders")}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/20"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Kembali ke Kelola Pesanan
            </button>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              Verifikasi Pembayaran
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Konfirmasi Revisi
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
              Periksa bukti pembayaran dan konfirmasi pembayaran tambahan
              revisi desain pelanggan Pajara Studio.
            </p>
          </div>
        </header>

        {/* STATISTICS */}
        <section className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-3xl border border-[#e8e5dc] bg-white p-5 shadow-[0_4px_24px_rgba(33,77,50,0.04)]">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#f0f5ef]" />
            <div className="relative">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f0f5ef] text-[#2f6b45]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-500">
                Total Pembayaran
              </p>
              <p className="mt-1.5 text-3xl font-bold tracking-tight text-[#214d32]">
                {loading ? "—" : payments.length}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Seluruh pembayaran revisi
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#e8e5dc] bg-white p-5 shadow-[0_4px_24px_rgba(33,77,50,0.04)]">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#faf4e9]" />
            <div className="relative">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#faf4e9] text-[#a87935]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-500">
                Menunggu Konfirmasi
              </p>
              <p className="mt-1.5 text-3xl font-bold tracking-tight text-[#a87935]">
                {loading ? "—" : pendingCount}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Perlu diperiksa admin
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#e8e5dc] bg-white p-5 shadow-[0_4px_24px_rgba(33,77,50,0.04)]">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#f0f5ef]" />
            <div className="relative">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f0f5ef] text-[#2f6b45]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8 12 3 3 5-6" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-500">
                Terverifikasi
              </p>
              <p className="mt-1.5 text-3xl font-bold tracking-tight text-[#214d32]">
                {loading ? "—" : verifiedCount}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Berhasil dikonfirmasi
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#e8e5dc] bg-white p-5 shadow-[0_4px_24px_rgba(33,77,50,0.04)]">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#fbefed]" />
            <div className="relative">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fbefed] text-red-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="m9 9 6 6m0-6-6 6" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-500">
                Ditolak
              </p>
              <p className="mt-1.5 text-3xl font-bold tracking-tight text-[#214d32]">
                {loading ? "—" : rejectedCount}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Pembayaran ditolak
              </p>
            </div>
          </div>
        </section>

        {/* NOTIFICATIONS */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 h-4 w-4 shrink-0"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5m0 3h.01" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <div className="flex items-start gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 h-4 w-4 shrink-0"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
              <p>{message}</p>
            </div>
          </div>
        )}

        {/* LIST HEADER */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#214d32]">
              Daftar Pembayaran Revisi
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {filteredPayments.length} pembayaran ditampilkan
            </p>
          </div>

          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#dce5da] bg-white px-4 py-2.5 text-xs font-semibold text-[#2f6b45] transition hover:bg-[#f0f5ef] disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            >
              <path d="M20 7v5h-5M4 17v-5h5" />
              <path d="M5.6 9a7 7 0 0 1 12-2L20 12M4 12l2.4 5a7 7 0 0 0 12-2" />
            </svg>
            Muat Ulang
          </button>
        </div>

        {/* FILTER */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {[
            { value: "pending", label: "Menunggu" },
            { value: "verified", label: "Terverifikasi" },
            { value: "rejected", label: "Ditolak" },
            { value: "all", label: "Semua" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === item.value
                  ? "bg-[#214d32] text-white shadow-sm"
                  : "border border-[#e5e2d9] bg-white text-gray-500 hover:border-[#b9cdbb] hover:text-[#214d32]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="rounded-3xl border border-[#e8e5dc] bg-white px-5 py-14 text-center shadow-[0_4px_24px_rgba(33,77,50,0.04)]">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-[#e2e9df] border-t-[#2f6b45]" />
            <p className="text-sm font-semibold text-[#214d32]">
              Memuat pembayaran revisi...
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Mohon tunggu sebentar.
            </p>
          </div>
        ) : filteredPayments.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-3xl border border-dashed border-[#dcded3] bg-white/70 px-5 py-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0f5ef] text-[#2f6b45]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-7 w-7"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18M7 15h4" />
              </svg>
            </div>

            <h3 className="font-semibold text-[#214d32]">
              Tidak Ada Pembayaran
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-gray-500">
              Belum ada pembayaran revisi pada kategori yang dipilih.
            </p>
          </div>
        ) : (
          /* PAYMENT LIST */
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <article
                key={payment.id}
                className="overflow-hidden rounded-3xl border border-[#e8e5dc] bg-white shadow-[0_4px_24px_rgba(33,77,50,0.04)] transition hover:border-[#cbd9ce] hover:shadow-md"
              >
                <div className="h-1 bg-gradient-to-r from-[#214d32] via-[#2f6b45] to-[#91a88e]" />

                <div className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                        Kode Pesanan
                      </p>

                      <h3 className="text-lg font-bold text-[#214d32] sm:text-xl">
                        {payment.order_code}
                      </h3>

                      <p className="mt-1.5 text-sm font-medium text-gray-600">
                        {payment.customer_name}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {payment.customer_email}
                      </p>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold ${statusStyle(payment.status)}`}
                    >
                      {statusLabel(payment.status)}
                    </span>
                  </div>

                  {/* AMOUNT */}
                  <div className="mt-5 rounded-2xl border border-[#e8eadf] bg-[#f5f7f1] p-4">
                    <p className="text-xs font-medium text-gray-500">
                      Jumlah Pembayaran
                    </p>
                    <p className="mt-1.5 break-words text-2xl font-bold text-[#214d32]">
                      {formatRupiah(payment.amount)}
                    </p>
                  </div>

                  {/* PAYMENT DETAILS */}
                  <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#f0eee8] pt-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Nomor Desain
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-gray-700">
                        {payment.design_number ?? "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Tambahan Revisi
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-gray-700">
                        {payment.extra_revisions ?? "-"} revisi
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Metode Pembayaran
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-gray-700">
                        {payment.payment_method || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Jenis Pembayaran
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-gray-700">
                        {payment.payment_type || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Tanggal Pembayaran
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-gray-700">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        ID Transaksi
                      </p>
                      <p className="mt-1.5 break-all text-sm font-semibold text-gray-700">
                        {payment.transaction_id || "-"}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-5 border-t border-[#f0eee8] pt-4">
                    <button
                      type="button"
                      onClick={() => openProof(payment)}
                      disabled={openingId === payment.id}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#dce5da] bg-[#f5f7f1] px-4 py-3.5 text-sm font-semibold text-[#2f6b45] transition hover:bg-[#eaf1e8] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                      >
                        <path d="M14 3h7v7M10 14 21 3" />
                        <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
                      </svg>
                      {openingId === payment.id
                        ? "Membuka Bukti Pembayaran..."
                        : "Lihat Bukti Pembayaran"}
                    </button>

                    {payment.status === "pending" && (
                      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() =>
                            updatePaymentStatus(payment, "rejected")
                          }
                          disabled={processingId === payment.id}
                          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {processingId === payment.id
                            ? "Memproses..."
                            : "Tolak Pembayaran"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updatePaymentStatus(payment, "verified")
                          }
                          disabled={processingId === payment.id}
                          className="rounded-2xl bg-[#2f6b45] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#214d32] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {processingId === payment.id
                            ? "Memproses..."
                            : "Verifikasi Pembayaran"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* FOOTER */}
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
