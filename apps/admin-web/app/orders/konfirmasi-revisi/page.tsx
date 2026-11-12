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

  const loadPayments = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles_v2")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

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
    } catch (error) {
      console.error("Gagal memuat pembayaran revisi:", error);
      alert("Gagal memuat data pembayaran revisi.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const openProof = async (payment: RevisionPayment) => {
    if (!payment.proof_file_id) {
      alert("Bukti pembayaran tidak tersedia.");
      return;
    }

    setOpeningId(payment.id);

    try {
      const { data: file, error: fileError } = await supabase
        .from("order_files")
        .select("file_path")
        .eq("id", payment.proof_file_id)
        .maybeSingle();

      if (fileError) throw fileError;

      if (!file?.file_path) {
        alert("File bukti pembayaran tidak ditemukan.");
        return;
      }

      const { data, error } = await supabase.storage
        .from("pajara-files")
        .createSignedUrl(file.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Gagal membuka bukti pembayaran:", error);
      alert("Gagal membuka bukti pembayaran.");
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

      const { data, error } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", payment.id)
        .eq("status", "pending")
        .select("id");

      if (error) throw error;

      if (!data?.length) {
        alert("Pembayaran sudah diproses atau statusnya telah berubah.");
        await loadPayments();
        return;
      }

      alert(
        status === "verified"
          ? "Pembayaran revisi berhasil diverifikasi."
          : "Pembayaran revisi berhasil ditolak."
      );

      await loadPayments();
    } catch (error) {
      console.error("Gagal memperbarui pembayaran:", error);
      alert("Gagal memperbarui status pembayaran.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayments = payments.filter((payment) =>
    filter === "all" ? true : payment.status === filter
  );

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

  return (
    <main className="min-h-screen bg-[#F1ECE6] px-4 py-6 text-[#20372A] md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7">
          <button
            onClick={() => router.push("/orders")}
            className="mb-4 text-sm font-medium text-[#8A6A4A] hover:text-[#214D32]"
          >
            ← Kembali ke Kelola Pesanan
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A4A]">
                Pajara Admin
              </p>
              <h1 className="text-2xl font-bold text-[#214D32] md:text-3xl">
                Konfirmasi Pembayaran Revisi
              </h1>
              <p className="mt-2 text-sm text-[#77736D]">
                Kelola dan verifikasi pembayaran tambahan revisi desain.
              </p>
            </div>

            <button
              onClick={loadPayments}
              disabled={loading}
              className="rounded-xl border border-[#D9D0C5] bg-white px-4 py-2.5 text-sm font-semibold text-[#214D32] transition hover:bg-[#F8F6F2] disabled:opacity-50"
            >
              {loading ? "Memuat..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              label: "Total Pembayaran",
              value: payments.length,
            },
            {
              label: "Menunggu",
              value: payments.filter((p) => p.status === "pending").length,
            },
            {
              label: "Terverifikasi",
              value: payments.filter((p) => p.status === "verified").length,
            },
            {
              label: "Ditolak",
              value: payments.filter((p) => p.status === "rejected").length,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#E7DED4] bg-white p-4"
            >
              <p className="text-xs text-[#77736D]">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-[#214D32]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { value: "pending", label: "Menunggu" },
            { value: "verified", label: "Terverifikasi" },
            { value: "rejected", label: "Ditolak" },
            { value: "all", label: "Semua" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === item.value
                  ? "bg-[#214D32] text-white"
                  : "border border-[#DED5CA] bg-white text-[#6F7069] hover:border-[#214D32]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#E7DED4] bg-white p-12 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#E7DED4] border-t-[#214D32]" />
            <p className="text-sm text-[#77736D]">
              Memuat pembayaran revisi...
            </p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="rounded-2xl border border-[#E7DED4] bg-white px-5 py-14 text-center">
            <h3 className="font-semibold text-[#214D32]">
              Tidak ada pembayaran
            </h3>
            <p className="mt-2 text-sm text-[#77736D]">
              Belum ada data pembayaran revisi pada kategori ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <article
                key={payment.id}
                className="rounded-2xl border border-[#E7DED4] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-[#8A6A4A]">
                      KODE PESANAN
                    </p>
                    <h2 className="mt-1 font-bold text-[#214D32]">
                      {payment.order_code}
                    </h2>
                    <p className="mt-1 text-sm text-[#77736D]">
                      {payment.customer_name}
                    </p>
                    <p className="text-xs text-[#99938B]">
                      {payment.customer_email}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      payment.status === "verified"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {statusLabel(payment.status)}
                  </span>
                </div>

                <div className="my-5 grid grid-cols-2 gap-4 rounded-xl bg-[#F8F6F2] p-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-[#888078]">Nominal</p>
                    <p className="mt-1 font-bold text-[#214D32]">
                      {formatRupiah(payment.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#888078]">Nomor Desain</p>
                    <p className="mt-1 font-semibold">
                      {payment.design_number ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#888078]">Tambahan Revisi</p>
                    <p className="mt-1 font-semibold">
                      {payment.extra_revisions ?? "-"} revisi
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#888078]">Metode Pembayaran</p>
                    <p className="mt-1 font-semibold">
                      {payment.payment_method || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#888078]">Jenis Pembayaran</p>
                    <p className="mt-1 font-semibold">
                      {payment.payment_type || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#888078]">Tanggal</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatDate(payment.created_at)}
                    </p>
                  </div>
                </div>

                {payment.transaction_id && (
                  <p className="mb-4 text-sm text-[#77736D]">
                    ID Transaksi:{" "}
                    <span className="font-medium text-[#20372A]">
                      {payment.transaction_id}
                    </span>
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openProof(payment)}
                    disabled={openingId === payment.id}
                    className="rounded-xl border border-[#D9D0C5] px-4 py-2.5 text-sm font-semibold text-[#214D32] transition hover:bg-[#F8F6F2] disabled:opacity-50"
                  >
                    {openingId === payment.id
                      ? "Membuka..."
                      : "Lihat Bukti Pembayaran"}
                  </button>

                  {payment.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          updatePaymentStatus(payment, "verified")
                        }
                        disabled={processingId === payment.id}
                        className="rounded-xl bg-[#214D32] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F6B45] disabled:opacity-50"
                      >
                        {processingId === payment.id
                          ? "Memproses..."
                          : "Verifikasi"}
                      </button>

                      <button
                        onClick={() =>
                          updatePaymentStatus(payment, "rejected")
                        }
                        disabled={processingId === payment.id}
                        className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
