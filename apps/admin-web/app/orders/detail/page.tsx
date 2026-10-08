"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Order = {
  id: string;
  order_code: string;
  service_name: string;
  design_type: string | null;
  quantity: number | null;
  brief: string | null;
  notes: string | null;
  total_amount: number | null;
  dp_amount: number | null;
  remaining_amount: number | null;
  status: string;
  deadline: string | null;
  created_at: string;
};

type ReferenceFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  url: string | null;
};

type Payment = {
  id: string;
  order_id: string;
  payment_method: string | null;
  payment_type: string | null;
  amount: number | null;
  transaction_id: string | null;
  proof_file_id: string | null;
  status: string | null;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
};

type PaymentProof = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  url: string | null;
};

function formatRupiah(value: number | null | undefined) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return "-";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "pending":
      return "Pesanan Baru";

    case "waiting_dp":
      return "Menunggu DP";

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

function getPaymentStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "pending":
      return "Menunggu Verifikasi";

    case "verified":
      return "Pembayaran Terverifikasi";

    case "rejected":
      return "Pembayaran Ditolak";

    default:
      return status || "-";
  }
}

function getPaymentStatusClass(status: string | null | undefined) {
  switch (status) {
    case "verified":
      return "bg-green-100 text-green-700 border-green-200";

    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";

    case "pending":
    default:
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
}

function isImageFile(fileType: string | null | undefined, fileName: string) {
  if (fileType?.startsWith("image/")) {
    return true;
  }

  return /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
}

function isPdfFile(fileType: string | null | undefined, fileName: string) {
  if (fileType === "application/pdf") {
    return true;
  }

  return /\.pdf$/i.test(fileName);
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-[#eee9df] py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <span className="text-sm text-[#7b756c]">{label}</span>

      <span className="text-sm font-medium text-[#292821] sm:text-right">
        {value}
      </span>
    </div>
  );
}

function OrderDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);

  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);

  const [payment, setPayment] = useState<Payment | null>(null);
  const [paymentProof, setPaymentProof] = useState<PaymentProof | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [totalInput, setTotalInput] = useState("");

  const [savingPrice, setSavingPrice] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const [paymentAction, setPaymentAction] = useState<
    "verify" | "reject" | null
  >(null);

  const [uploadingFinal, setUploadingFinal] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("ID pesanan tidak ditemukan.");
      setLoading(false);
      return;
    }

    loadOrder(orderId);
  }, [orderId]);

  async function checkAdmin() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      router.replace("/");
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles_v2")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      await supabase.auth.signOut();
      router.replace("/");
      return null;
    }

    return session.user;
  }

  async function loadOrder(id: string) {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const user = await checkAdmin();

      if (!user) {
        return;
      }

      const { data, error: orderError } = await supabase
        .from("orders")
        .select(
          `
          id,
          order_code,
          service_name,
          design_type,
          quantity,
          brief,
          notes,
          total_amount,
          dp_amount,
          remaining_amount,
          status,
          deadline,
          created_at
        `
        )
        .eq("id", id)
        .single();

      if (orderError) {
        throw orderError;
      }

      setOrder(data);
      setTotalInput(String(data.total_amount ?? ""));

      await Promise.all([
        loadReferenceFiles(id),
        loadPayment(id),
      ]);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat detail pesanan.");
    } finally {
      setLoading(false);
    }
  }

  async function loadReferenceFiles(id: string) {
    const { data, error: filesError } = await supabase
      .from("order_files")
      .select(
        `
        id,
        file_name,
        file_path,
        file_type,
        file_size,
        created_at
      `
      )
      .eq("order_id", id)
      .eq("file_category", "reference")
      .order("created_at", { ascending: false });

    if (filesError) {
      console.error("Gagal memuat file referensi:", filesError);
      return;
    }

    if (!data || data.length === 0) {
      setReferenceFiles([]);
      return;
    }

    const filesWithUrls = await Promise.all(
      data.map(async (file) => {
        const { data: signedData } = await supabase.storage
          .from("pajara-files")
          .createSignedUrl(file.file_path, 60 * 60);

        return {
          ...file,
          url: signedData?.signedUrl || null,
        };
      })
    );

    setReferenceFiles(filesWithUrls);
  }

  async function loadPayment(id: string) {
    try {
      setLoadingPayment(true);

      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .select(
          `
          id,
          order_id,
          payment_method,
          payment_type,
          amount,
          transaction_id,
          proof_file_id,
          status,
          verified_by,
          verified_at,
          notes,
          created_at
        `
        )
        .eq("order_id", id)
        .eq("payment_type", "DP")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (paymentError) {
        console.error("Gagal memuat pembayaran:", paymentError);
        setPayment(null);
        setPaymentProof(null);
        return;
      }

      setPayment(paymentData || null);

      if (!paymentData?.proof_file_id) {
        setPaymentProof(null);
        return;
      }

      const { data: proofData, error: proofError } = await supabase
        .from("order_files")
        .select(
          `
          id,
          file_name,
          file_path,
          file_type,
          file_size,
          created_at
        `
        )
        .eq("id", paymentData.proof_file_id)
        .maybeSingle();

      if (proofError) {
        console.error("Gagal memuat bukti pembayaran:", proofError);
        setPaymentProof(null);
        return;
      }

      if (!proofData) {
        setPaymentProof(null);
        return;
      }

      const { data: signedData, error: signedError } =
        await supabase.storage
          .from("pajara-files")
          .createSignedUrl(proofData.file_path, 60 * 60);

      if (signedError) {
        console.error("Gagal membuat signed URL:", signedError);
      }

      setPaymentProof({
        ...proofData,
        url: signedData?.signedUrl || null,
      });
    } finally {
      setLoadingPayment(false);
    }
  }

  async function handleSavePrice() {
    if (!order) return;

    setMessage("");
    setError("");

    const total = Number(totalInput);

    if (!Number.isFinite(total) || total < 0) {
      setError("Masukkan total harga yang valid.");
      return;
    }

    try {
      setSavingPrice(true);

      const dp = Math.floor(total / 2);
      const remaining = total - dp;

      const { data, error: updateError } = await supabase
        .from("orders")
        .update({
          total_amount: total,
          dp_amount: dp,
          remaining_amount: remaining,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .select(
          `
          id,
          order_code,
          service_name,
          design_type,
          quantity,
          brief,
          notes,
          total_amount,
          dp_amount,
          remaining_amount,
          status,
          deadline,
          created_at
        `
        )
        .single();

      if (updateError) {
        throw updateError;
      }

      setOrder(data);
      setTotalInput(String(data.total_amount ?? ""));

      setMessage("Harga pesanan berhasil disimpan.");
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan harga.");
    } finally {
      setSavingPrice(false);
    }
  }

  async function handleStatusChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    if (!order) return;

    const newStatus = event.target.value;

    try {
      setChangingStatus(true);
      setError("");
      setMessage("");

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) {
        throw updateError;
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              status: newStatus,
            }
          : current
      );

      setMessage(`Status pesanan diubah menjadi ${getStatusLabel(newStatus)}.`);
    } catch (err: any) {
      setError(err?.message || "Gagal mengubah status pesanan.");
    } finally {
      setChangingStatus(false);
    }
  }

  async function handlePaymentAction(action: "verify" | "reject") {
    if (!order || !payment) return;

    if (!payment.proof_file_id) {
      setError("Bukti pembayaran belum tersedia.");
      return;
    }

    try {
      setPaymentAction(action);
      setError("");
      setMessage("");

      const user = await checkAdmin();

      if (!user) {
        return;
      }

      const newStatus = action === "verify" ? "verified" : "rejected";
      const verifiedAt = new Date().toISOString();

      const { data: updatedPayment, error: paymentError } =
        await supabase
          .from("payments")
          .update({
            status: newStatus,
            verified_by: user.id,
            verified_at: verifiedAt,
          })
          .eq("id", payment.id)
          .select(
            `
            id,
            order_id,
            payment_method,
            payment_type,
            amount,
            transaction_id,
            proof_file_id,
            status,
            verified_by,
            verified_at,
            notes,
            created_at
          `
          )
          .single();

      if (paymentError) {
        throw paymentError;
      }

      setPayment(updatedPayment);

      if (action === "verify") {
        /*
         * Setelah DP diverifikasi, jika pesanan masih berada
         * pada status "waiting_dp", otomatis ubah menjadi
         * "processing" / "Diproses".
         */
        if (order.status === "waiting_dp") {
          const { error: orderError } = await supabase
            .from("orders")
            .update({
              status: "processing",
              updated_at: verifiedAt,
            })
            .eq("id", order.id);

          if (orderError) {
            setError(
              `Pembayaran berhasil diverifikasi, tetapi status pesanan gagal diubah: ${orderError.message}`
            );
            return;
          }

          setOrder((current) =>
            current
              ? {
                  ...current,
                  status: "processing",
                }
              : current
          );
        }

        setMessage(
          "Pembayaran DP berhasil diverifikasi. Pesanan sekarang Diproses."
        );
      } else {
        setMessage("Pembayaran DP berhasil ditolak.");
      }
    } catch (err: any) {
      setError(err?.message || "Gagal memproses pembayaran.");
    } finally {
      setPaymentAction(null);
    }
  }

  async function handleUploadFinalFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!order) return;

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    if (file.size > 20 * 1024 * 1024) {
      setError("Ukuran file maksimal 20 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingFinal(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("Sesi admin tidak ditemukan.");
      }

      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

      const filePath = `orders/${order.id}/final/${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("pajara-files")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type || "application/octet-stream",
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: insertError } = await supabase
        .from("order_files")
        .insert({
          order_id: order.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type || null,
          file_size: file.size,
          file_category: "final",
          revision_id: null,
          uploaded_by: session.user.id,
        });

      if (insertError) {
        await supabase.storage.from("pajara-files").remove([filePath]);
        throw insertError;
      }

      setMessage("File final berhasil diupload.");
    } catch (err: any) {
      setError(err?.message || "Gagal mengupload file final.");
    } finally {
      setUploadingFinal(false);
      event.target.value = "";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-4 py-8 text-[#292821]">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-[#e9e3d8] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#777166]">
              Memuat detail pesanan...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-4 py-8 text-[#292821]">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
            <p className="font-medium text-red-600">
              {error || "Pesanan tidak ditemukan."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/orders")}
              className="mt-5 rounded-xl bg-[#2f6b45] px-5 py-3 text-sm font-semibold text-white"
            >
              Kembali ke Pesanan
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-6 text-[#292821] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/orders")}
              className="mb-3 text-sm font-medium text-[#2f6b45] hover:underline"
            >
              ← Kembali ke Pesanan
            </button>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Detail Pesanan
            </h1>

            <p className="mt-1 text-sm text-[#777166]">
              {order.order_code}
            </p>
          </div>

          <div className="rounded-full border border-[#d8e6dc] bg-[#edf5ef] px-4 py-2 text-sm font-semibold text-[#2f6b45]">
            {getStatusLabel(order.status)}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="space-y-5">
          {/* INFORMASI PESANAN */}
          <section className="rounded-3xl border border-[#e9e3d8] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold">Informasi Pesanan</h2>
              <p className="mt-1 text-sm text-[#777166]">
                Informasi dasar pesanan customer.
              </p>
            </div>

            <div>
              <InfoRow label="Kode Pesanan" value={order.order_code} />
              <InfoRow label="Layanan" value={order.service_name || "-"} />
              <InfoRow label="Jenis Desain" value={order.design_type || "-"} />
              <InfoRow label="Jumlah" value={order.quantity ?? "-"} />
              <InfoRow label="Tanggal Pesanan" value={formatDate(order.created_at)} />
              <InfoRow
                label="Deadline"
                value={formatDate(order.deadline)}
              />
            </div>
          </section>

          {/* REFERENSI CUSTOMER */}
          <section className="rounded-3xl border border-[#e9e3d8] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Referensi Customer</h2>
              <p className="mt-1 text-sm text-[#777166]">
                File referensi yang dikirim oleh customer.
              </p>
            </div>

            {referenceFiles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#dcd5ca] bg-[#faf8f4] p-6 text-center">
                <p className="text-sm text-[#777166]">
                  Belum ada file referensi.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {referenceFiles.map((file) => (
                  <div
                    key={file.id}
                    className="overflow-hidden rounded-2xl border border-[#e9e3d8] bg-[#faf8f4]"
                  >
                    {file.url &&
                    isImageFile(file.file_type, file.file_name) ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={file.url}
                          alt={file.file_name}
                          className="h-56 w-full object-cover"
                        />
                      </a>
                    ) : (
                      <div className="flex h-56 items-center justify-center p-6">
                        <div className="text-center">
                          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5ef] text-2xl">
                            📄
                          </div>

                          {file.url ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-[#2f6b45] hover:underline"
                            >
                              Buka File
                            </a>
                          ) : (
                            <p className="text-sm text-[#777166]">
                              Preview tidak tersedia
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-[#e9e3d8] p-4">
                      <p className="truncate text-sm font-semibold">
                        {file.file_name}
                      </p>

                      <p className="mt-1 text-xs text-[#777166]">
                        {formatFileSize(file.file_size)} ·{" "}
                        {formatDate(file.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* BRIEF & CATATAN */}
          <section className="rounded-3xl border border-[#e9e3d8] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold">Brief & Catatan</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-[#4c483f]">
                  Brief
                </p>

                <div className="rounded-2xl bg-[#faf8f4] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#5e594f]">
                    {order.brief || "Tidak ada brief."}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#4c483f]">
                  Catatan
                </p>

                <div className="rounded-2xl bg-[#faf8f4] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#5e594f]">
                    {order.notes || "Tidak ada catatan."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* PEMBAYARAN */}
          <section className="rounded-3xl border border-[#e9e3d8] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Pembayaran</h2>
              <p className="mt-1 text-sm text-[#777166]">
                Harga pesanan dan verifikasi pembayaran customer.
              </p>
            </div>

            {/* HARGA */}
            <div className="rounded-2xl border border-[#e9e3d8] bg-[#faf8f4] p-4 sm:p-5">
              <h3 className="mb-4 text-sm font-bold text-[#4c483f]">
                Harga Pesanan
              </h3>

              <label className="mb-2 block text-sm font-medium text-[#5e594f]">
                Total Harga
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="number"
                  min="0"
                  value={totalInput}
                  onChange={(event) => setTotalInput(event.target.value)}
                  placeholder="Contoh: 150000"
                  className="w-full rounded-xl border border-[#dcd5ca] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2f6b45] focus:ring-2 focus:ring-[#2f6b45]/10"
                />

                <button
                  type="button"
                  onClick={handleSavePrice}
                  disabled={savingPrice}
                  className="rounded-xl bg-[#2f6b45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245537] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingPrice ? "Menyimpan..." : "Simpan Harga"}
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#e9e3d8] bg-white p-4">
                  <p className="text-xs text-[#777166]">Total</p>
                  <p className="mt-1 text-base font-bold">
                    {formatRupiah(order.total_amount)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e9e3d8] bg-white p-4">
                  <p className="text-xs text-[#777166]">DP 50%</p>
                  <p className="mt-1 text-base font-bold text-[#2f6b45]">
                    {formatRupiah(order.dp_amount)}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e9e3d8] bg-white p-4">
                  <p className="text-xs text-[#777166]">Sisa</p>
                  <p className="mt-1 text-base font-bold">
                    {formatRupiah(order.remaining_amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* PAYMENT */}
            <div className="mt-5 rounded-2xl border border-[#e9e3d8] bg-white p-4 sm:p-5">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#4c483f]">
                    Pembayaran DP
                  </h3>

                  <p className="mt-1 text-xs text-[#777166]">
                    Detail pembayaran yang dikirim customer.
                  </p>
                </div>

                {payment && (
                  <span
                    className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${getPaymentStatusClass(
                      payment.status
                    )}`}
                  >
                    {getPaymentStatusLabel(payment.status)}
                  </span>
                )}
              </div>

              {loadingPayment ? (
                <div className="rounded-2xl bg-[#faf8f4] p-5">
                  <p className="text-sm text-[#777166]">
                    Memuat data pembayaran...
                  </p>
                </div>
              ) : !payment ? (
                <div className="rounded-2xl border border-dashed border-[#dcd5ca] bg-[#faf8f4] p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0ece4]">
                    💳
                  </div>

                  <p className="text-sm font-semibold text-[#4c483f]">
                    Belum ada pembayaran DP
                  </p>

                  <p className="mt-1 text-xs text-[#777166]">
                    Customer belum membuat pembayaran DP.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* DETAIL PAYMENT */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#faf8f4] p-4">
                      <p className="text-xs text-[#777166]">
                        Metode Pembayaran
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        {payment.payment_method || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#faf8f4] p-4">
                      <p className="text-xs text-[#777166]">
                        Jenis Pembayaran
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        {payment.payment_type || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#faf8f4] p-4">
                      <p className="text-xs text-[#777166]">
                        Nominal Pembayaran
                      </p>

                      <p className="mt-1 text-lg font-bold text-[#2f6b45]">
                        {formatRupiah(payment.amount)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#faf8f4] p-4">
                      <p className="text-xs text-[#777166]">
                        Waktu Pembayaran
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* BUKTI PEMBAYARAN */}
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold">
                          Bukti Pembayaran
                        </h4>

                        {paymentProof && (
                          <p className="mt-1 text-xs text-[#777166]">
                            {paymentProof.file_name} ·{" "}
                            {formatFileSize(paymentProof.file_size)}
                          </p>
                        )}
                      </div>
                    </div>

                    {!payment.proof_file_id ? (
                      <div className="rounded-2xl border border-dashed border-[#dcd5ca] bg-[#faf8f4] p-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0ece4]">
                          📎
                        </div>

                        <p className="text-sm font-semibold text-[#4c483f]">
                          Bukti pembayaran belum diupload
                        </p>

                        <p className="mt-1 text-xs text-[#777166]">
                          Menunggu customer mengirim bukti pembayaran.
                        </p>
                      </div>
                    ) : !paymentProof ? (
                      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                        <p className="text-sm font-medium text-yellow-800">
                          Bukti pembayaran terhubung, tetapi file belum dapat
                          ditampilkan.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-[#e9e3d8] bg-[#faf8f4]">
                        {paymentProof.url &&
                        isImageFile(
                          paymentProof.file_type,
                          paymentProof.file_name
                        ) ? (
                          <div className="bg-[#f1eee8] p-3">
                            <a
                              href={paymentProof.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={paymentProof.url}
                                alt={`Bukti pembayaran ${paymentProof.file_name}`}
                                className="mx-auto max-h-[600px] w-full rounded-xl object-contain"
                              />
                            </a>
                          </div>
                        ) : paymentProof.url &&
                          isPdfFile(
                            paymentProof.file_type,
                            paymentProof.file_name
                          ) ? (
                          <div className="p-3">
                            <iframe
                              src={paymentProof.url}
                              title={`Bukti pembayaran ${paymentProof.file_name}`}
                              className="h-[600px] w-full rounded-xl border border-[#e9e3d8] bg-white"
                            />
                          </div>
                        ) : (
                          <div className="flex min-h-52 flex-col items-center justify-center p-6 text-center">
                            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf5ef] text-3xl">
                              📄
                            </div>

                            <p className="text-sm font-semibold">
                              {paymentProof.file_name}
                            </p>

                            {paymentProof.url && (
                              <a
                                href={paymentProof.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 rounded-xl bg-[#2f6b45] px-4 py-2 text-sm font-semibold text-white"
                              >
                                Buka Bukti
                              </a>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col gap-3 border-t border-[#e9e3d8] p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold">
                              {paymentProof.file_name}
                            </p>

                            <p className="mt-1 text-xs text-[#777166]">
                              Diupload {formatDate(paymentProof.created_at)}
                            </p>
                          </div>

                          {paymentProof.url && (
                            <a
                              href={paymentProof.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl border border-[#dcd5ca] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#4c483f] hover:bg-[#faf8f4]"
                            >
                              Buka File
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTION PAYMENT */}
                  {payment.status === "pending" &&
                    payment.proof_file_id && (
                      <div className="rounded-2xl border border-[#dfe9e1] bg-[#f4f8f5] p-4 sm:p-5">
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-[#2f6b45]">
                            Verifikasi Pembayaran
                          </h4>

                          <p className="mt-1 text-xs leading-5 text-[#667066]">
                            Pastikan nominal dan bukti pembayaran sudah sesuai
                            sebelum melakukan verifikasi.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => handlePaymentAction("verify")}
                            disabled={paymentAction !== null}
                            className="flex-1 rounded-xl bg-[#2f6b45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245537] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {paymentAction === "verify"
                              ? "Memverifikasi..."
                              : "✓ Verifikasi Pembayaran"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePaymentAction("reject")}
                            disabled={paymentAction !== null}
                            className="flex-1 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {paymentAction === "reject"
                              ? "Menolak..."
                              : "✕ Tolak Pembayaran"}
                          </button>
                        </div>
                      </div>
                    )}

                  {/* VERIFIED */}
                  {payment.status === "verified" && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                      <p className="text-sm font-semibold text-green-800">
                        ✓ Pembayaran DP sudah terverifikasi
                      </p>

                      {payment.verified_at && (
                        <p className="mt-1 text-xs text-green-700">
                          Diverifikasi pada {formatDate(payment.verified_at)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* REJECTED */}
                  {payment.status === "rejected" && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-semibold text-red-800">
                        Pembayaran DP ditolak
                      </p>

                      {payment.verified_at && (
                        <p className="mt-1 text-xs text-red-700">
                          Diproses pada {formatDate(payment.verified_at)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* STATUS PESANAN */}
          <section className="rounded-3xl border border-[#e9e3d8] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold">Status Pesanan</h2>

              <p className="mt-1 text-sm text-[#777166]">
                Ubah status pesanan secara manual jika diperlukan.
              </p>
            </div>

            <select
              value={order.status}
              onChange={handleStatusChange}
              disabled={changingStatus}
              className="w-full rounded-xl border border-[#dcd5ca] bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#2f6b45] focus:ring-2 focus:ring-[#2f6b45]/10"
            >
              <option value="pending">Pesanan Baru</option>
              <option value="waiting_dp">Menunggu DP</option>
              <option value="processing">Diproses</option>
              <option value="revision">Revisi</option>
              <option value="waiting_payment">
                Menunggu Pelunasan
              </option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            {changingStatus && (
              <p className="mt-2 text-xs text-[#777166]">
                Menyimpan perubahan status...
              </p>
            )}
          </section>

          {/* FINAL FILE */}
          <section className="rounded-3xl border border-[#e9e3d8] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Final File</h2>

              <p className="mt-1 text-sm text-[#777166]">
                Upload hasil desain final untuk customer.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#dcd5ca] bg-[#faf8f4] px-5 py-10 text-center transition hover:border-[#2f6b45] hover:bg-[#f4f8f5]">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5ef] text-2xl">
                ↑
              </div>

              <span className="text-sm font-semibold text-[#2f6b45]">
                {uploadingFinal
                  ? "Mengupload file..."
                  : "Pilih file final"}
              </span>

              <span className="mt-1 text-xs text-[#777166]">
                Maksimal 20 MB
              </span>

              <input
                type="file"
                onChange={handleUploadFinalFile}
                disabled={uploadingFinal}
                className="hidden"
              />
            </label>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f4ee] px-4 py-8 text-[#292821]">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-3xl border border-[#e9e3d8] bg-white p-6 shadow-sm">
              <p className="text-sm text-[#777166]">
                Memuat halaman...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}
