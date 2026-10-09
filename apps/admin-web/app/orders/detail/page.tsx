
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

type Revision = {
  id: string;
  order_id: string;
  revision_number: number;
  customer_note: string | null;
  admin_note: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
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
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

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

function getRevisionStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "pending":
      return "Menunggu Diproses";
    case "processing":
      return "Sedang Diproses";
    case "completed":
      return "Selesai";
    case "rejected":
      return "Ditolak";
    default:
      return status || "-";
  }
}

function getRevisionStatusClass(status: string | null | undefined) {
  switch (status) {
    case "completed":
      return "border-green-200 bg-green-100 text-green-700";
    case "processing":
      return "border-blue-200 bg-blue-100 text-blue-700";
    case "rejected":
      return "border-red-200 bg-red-100 text-red-700";
    case "pending":
    default:
      return "border-yellow-200 bg-yellow-100 text-yellow-700";
  }
}

function isImageFile(fileType: string | null | undefined, fileName: string) {
  if (fileType?.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
}

function isPdfFile(fileType: string | null | undefined, fileName: string) {
  if (fileType === "application/pdf") return true;
  return /\.pdf$/i.test(fileName);
}

function isSettlement(payment: Payment | null) {
  return payment?.payment_type?.trim().toLowerCase() === "pelunasan";
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
  const [isPackageOrder, setIsPackageOrder] = useState(false);

  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [paymentProof, setPaymentProof] = useState<PaymentProof | null>(null);

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});
  const [revisionActions, setRevisionActions] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [totalInput, setTotalInput] = useState("");

  const [savingPrice, setSavingPrice] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [paymentAction, setPaymentAction] = useState<"verify" | "reject" | null>(null);
  const [uploadingFinal, setUploadingFinal] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("ID pesanan tidak ditemukan.");
      setLoading(false);
      return;
    }

    void loadOrder(orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (!user) return;

      const { data, error: orderError } = await supabase
        .from("orders")
        .select(`
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
        `)
        .eq("id", id)
        .single();

      if (orderError) throw orderError;

      const {
        data: subscriptionRequest,
        error: subscriptionRequestError,
      } = await supabase
        .from("subscription_requests")
        .select("id")
        .eq("order_id", id)
        .limit(1)
        .maybeSingle();

      if (subscriptionRequestError) {
        throw new Error(
          `Gagal memeriksa jenis pesanan paket: ${subscriptionRequestError.message}`
        );
      }

      const packageOrder = Boolean(subscriptionRequest);

      setOrder(data);
      setIsPackageOrder(packageOrder);
      setTotalInput(String(data.total_amount ?? ""));

      if (packageOrder) {
        setPayment(null);
        setPaymentProof(null);
        setLoadingPayment(false);

        await Promise.all([
          loadReferenceFiles(id),
          loadRevisions(id),
        ]);
      } else {
        await Promise.all([
          loadReferenceFiles(id),
          loadPayment(id, data.status),
          loadRevisions(id),
        ]);
      }
    } catch (err: any) {
      setError(err?.message || "Gagal memuat detail pesanan.");
    } finally {
      setLoading(false);
    }
  }

  async function loadReferenceFiles(id: string) {
    const { data, error: filesError } = await supabase
      .from("order_files")
      .select(`
        id,
        file_name,
        file_path,
        file_type,
        file_size,
        created_at
      `)
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

  /*
   * Pembayaran diambil berdasarkan tahap pesanan:
   * waiting_dp     -> DP
   * waiting_payment -> Pelunasan
   *
   * Untuk pesanan yang sudah selesai, tampilkan pelunasan
   * jika tersedia; jika tidak, tampilkan data DP.
   */
  async function loadPayment(id: string, orderStatus: string) {
    try {
      setLoadingPayment(true);
      setPayment(null);
      setPaymentProof(null);

      const { data: paymentRows, error: paymentError } = await supabase
        .from("payments")
        .select(`
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
        `)
        .eq("order_id", id)
        .order("created_at", { ascending: false });

      if (paymentError) throw paymentError;

      const rows = (paymentRows || []) as Payment[];

      const dpPayment = rows.find(
        (item) => item.payment_type?.trim().toLowerCase() === "dp"
      );

      const settlementPayment = rows.find(
        (item) => item.payment_type?.trim().toLowerCase() === "pelunasan"
      );

      let selectedPayment: Payment | undefined;

      if (orderStatus === "waiting_payment") {
        selectedPayment = settlementPayment;
      } else if (orderStatus === "completed") {
        selectedPayment = settlementPayment || dpPayment;
      } else {
        selectedPayment = dpPayment;
      }

      if (!selectedPayment) {
        setPayment(null);
        setPaymentProof(null);
        return;
      }

      setPayment(selectedPayment);

      if (!selectedPayment.proof_file_id) {
        setPaymentProof(null);
        return;
      }

      const { data: proofData, error: proofError } = await supabase
        .from("order_files")
        .select(`
          id,
          file_name,
          file_path,
          file_type,
          file_size,
          created_at
        `)
        .eq("id", selectedPayment.proof_file_id)
        .maybeSingle();

      if (proofError) throw proofError;

      if (!proofData) {
        setPaymentProof(null);
        return;
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from("pajara-files")
        .createSignedUrl(proofData.file_path, 60 * 60);

      if (signedError) {
        console.error("Gagal membuat signed URL bukti pembayaran:", signedError);
      }

      setPaymentProof({
        ...proofData,
        url: signedData?.signedUrl || null,
      });
    } catch (err: any) {
      console.error("Gagal memuat pembayaran:", err);
      setPayment(null);
      setPaymentProof(null);
      setError(
        `Gagal memuat data pembayaran: ${err?.message || "Kesalahan tidak diketahui"}`
      );
    } finally {
      setLoadingPayment(false);
    }
  }

  async function loadRevisions(id: string) {
    try {
      setLoadingRevisions(true);

      const { data, error: revisionsError } = await supabase
        .from("revisions")
        .select(`
          id,
          order_id,
          revision_number,
          customer_note,
          admin_note,
          status,
          created_by,
          created_at,
          updated_at
        `)
        .eq("order_id", id)
        .order("revision_number", { ascending: false });

      if (revisionsError) {
        console.error("Gagal memuat revisi:", revisionsError);
        setRevisions([]);
        return;
      }

      setRevisions(data || []);

      const notes: Record<string, string> = {};
      (data || []).forEach((revision) => {
        notes[revision.id] = revision.admin_note || "";
      });
      setRevisionNotes(notes);
    } catch (err) {
      console.error("Gagal memuat revisi:", err);
      setRevisions([]);
    } finally {
      setLoadingRevisions(false);
    }
  }

  async function handleRevisionStatusChange(
    revision: Revision,
    newStatus: string
  ) {
    if (!order) return;

    try {
      setRevisionActions((current) => ({ ...current, [revision.id]: true }));
      setError("");
      setMessage("");

      const adminNote = revisionNotes[revision.id]?.trim() || null;

      const { error: revisionError } = await supabase
        .from("revisions")
        .update({
          status: newStatus,
          admin_note: adminNote,
          updated_at: new Date().toISOString(),
        })
        .eq("id", revision.id);

      if (revisionError) throw revisionError;

      if (newStatus === "completed" || newStatus === "rejected") {
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (orderError) throw orderError;

        setOrder((current) =>
          current ? { ...current, status: "completed" } : current
        );
      } else if (newStatus === "processing" && order.status !== "revision") {
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            status: "revision",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (orderError) throw orderError;

        setOrder((current) =>
          current ? { ...current, status: "revision" } : current
        );
      }

      setRevisions((current) =>
        current.map((item) =>
          item.id === revision.id
            ? {
                ...item,
                status: newStatus,
                admin_note: adminNote,
                updated_at: new Date().toISOString(),
              }
            : item
        )
      );

      setMessage(
        `Revisi #${revision.revision_number} berhasil diubah menjadi ${getRevisionStatusLabel(newStatus)}.`
      );
    } catch (err: any) {
      setError(err?.message || "Gagal memperbarui status revisi.");
    } finally {
      setRevisionActions((current) => ({ ...current, [revision.id]: false }));
    }
  }

  async function handleSaveRevisionNote(revision: Revision) {
    try {
      setRevisionActions((current) => ({ ...current, [revision.id]: true }));
      setError("");
      setMessage("");

      const adminNote = revisionNotes[revision.id]?.trim() || null;

      const { data, error: updateError } = await supabase
        .from("revisions")
        .update({
          admin_note: adminNote,
          updated_at: new Date().toISOString(),
        })
        .eq("id", revision.id)
        .select(`
          id,
          order_id,
          revision_number,
          customer_note,
          admin_note,
          status,
          created_by,
          created_at,
          updated_at
        `)
        .single();

      if (updateError) throw updateError;

      setRevisions((current) =>
        current.map((item) => (item.id === revision.id ? data : item))
      );

      setMessage(`Catatan revisi #${revision.revision_number} berhasil disimpan.`);
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan catatan revisi.");
    } finally {
      setRevisionActions((current) => ({ ...current, [revision.id]: false }));
    }
  }

  async function handleSavePrice() {
    if (!order || isPackageOrder) return;

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
        .select(`
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
        `)
        .single();

      if (updateError) throw updateError;

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

      if (updateError) throw updateError;

      setOrder((current) =>
        current ? { ...current, status: newStatus } : current
      );

      // Saat status berubah ke Menunggu Pelunasan,
      // muat pembayaran Pelunasan, bukan data DP.
      if (!isPackageOrder) {
        await loadPayment(order.id, newStatus);
      }

      setMessage(`Status pesanan diubah menjadi ${getStatusLabel(newStatus)}.`);
    } catch (err: any) {
      setError(err?.message || "Gagal mengubah status pesanan.");
    } finally {
      setChangingStatus(false);
    }
  }

  async function handlePaymentAction(action: "verify" | "reject") {
    if (!order || !payment || isPackageOrder) return;

    if (!payment.proof_file_id) {
      setError("Bukti pembayaran belum tersedia.");
      return;
    }

    try {
      setPaymentAction(action);
      setError("");
      setMessage("");

      const user = await checkAdmin();
      if (!user) return;

      const newStatus = action === "verify" ? "verified" : "rejected";
      const processedAt = new Date().toISOString();
      const settlement = isSettlement(payment);

      const { data: updatedPayment, error: paymentError } = await supabase
        .from("payments")
        .update({
          status: newStatus,
          verified_by: user.id,
          verified_at: processedAt,
        })
        .eq("id", payment.id)
        .select(`
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
        `)
        .single();

      if (paymentError) throw paymentError;

      setPayment(updatedPayment);

      if (action === "verify") {
        if (settlement) {
          // Pelunasan yang terverifikasi menuntaskan pesanan.
          const { error: orderError } = await supabase
            .from("orders")
            .update({
              status: "completed",
              updated_at: processedAt,
            })
            .eq("id", order.id);

          if (orderError) {
            setError(
              `Pelunasan terverifikasi, tetapi status pesanan gagal diubah: ${orderError.message}`
            );
            return;
          }

          setOrder((current) =>
            current ? { ...current, status: "completed" } : current
          );

          setMessage("Pembayaran pelunasan berhasil diverifikasi. Pesanan sekarang Selesai.");
        } else if (order.status === "waiting_dp") {
          const { error: orderError } = await supabase
            .from("orders")
            .update({
              status: "processing",
              updated_at: processedAt,
            })
            .eq("id", order.id);

          if (orderError) {
            setError(
              `DP berhasil diverifikasi, tetapi status pesanan gagal diubah: ${orderError.message}`
            );
            return;
          }

          setOrder((current) =>
            current ? { ...current, status: "processing" } : current
          );

          setMessage("Pembayaran DP berhasil diverifikasi. Pesanan sekarang Diproses.");
        } else {
          setMessage(
            `Pembayaran ${payment.payment_type || ""} berhasil diverifikasi.`
          );
        }
      } else {
        setMessage(
          `Pembayaran ${payment.payment_type || ""} berhasil ditolak. Status pesanan tidak diubah.`
        );
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
    if (!file) return;

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

      if (!session?.user) throw new Error("Sesi admin tidak ditemukan.");

      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const filePath = `orders/${order.id}/final/${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("pajara-files")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type || "application/octet-stream",
        });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("order_files").insert({
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
            <p className="text-sm text-[#777166]">Memuat detail pesanan...</p>
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

  const settlementPayment = isSettlement(payment);
  const paymentTitle = settlementPayment ? "Pembayaran Pelunasan" : "Pembayaran DP";
  const paymentAmountLabel = settlementPayment ? "Nominal Pelunasan" : "Nominal DP";

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
            <p className="mt-1 text-sm text-[#777166]">{order.order_code}</p>
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
              <InfoRow label="Deadline" value={formatDate(order.deadline)} />
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
                <p className="text-sm text-[#777166]">Belum ada file referensi.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {referenceFiles.map((file) => (
                  <div
                    key={file.id}
                    className="overflow-hidden rounded-2xl border border-[#e9e3d8] bg-[#faf8f4]"
                  >
                    {file.url && isImageFile(file.file_type, file.file_name) ? (
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="block">
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
                            <p className="text-sm text-[#777166]">Preview tidak tersedia</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-[#e9e3d8] p-4">
                      <p className="truncate text-sm font-semibold">{file.file_name}</p>
                      <p className="mt-1 text-xs text-[#777166]">
                        {formatFileSize(file.file_size)} · {formatDate(file.created_at)}
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
                <p className="mb-2 text-sm font-semibold text-[#4c483f]">Brief</p>
                <div className="rounded-2xl bg-[#faf8f4] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#5e594f]">
                    {order.brief || "Tidak ada brief."}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-[#4c483f]">Catatan</p>
                <div className="rounded-2xl bg-[#faf8f4] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#5e594f]">
                    {order.notes || "Tidak ada catatan."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* REVISI */}
          <section className="rounded-3xl border border-[#e9e3d8] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Revisi Customer</h2>
              <p className="mt-1 text-sm text-[#777166]">
                Kelola pengajuan revisi yang dikirim oleh customer.
              </p>
            </div>

            {loadingRevisions ? (
              <div className="rounded-2xl bg-[#faf8f4] p-5">
                <p className="text-sm text-[#777166]">Memuat riwayat revisi...</p>
              </div>
            ) : revisions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#dcd5ca] bg-[#faf8f4] p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#edf5ef]">
                  ↻
                </div>
                <p className="text-sm font-semibold text-[#4c483f]">
                  Belum ada pengajuan revisi
                </p>
                <p className="mt-1 text-xs text-[#777166]">
                  Riwayat revisi customer akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {revisions.map((revision) => {
                  const actionLoading = revisionActions[revision.id] === true;

                  return (
                    <div key={revision.id} className="rounded-2xl border border-[#e9e3d8] bg-[#faf8f4] p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold">
                              Revisi #{revision.revision_number}
                            </span>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRevisionStatusClass(revision.status)}`}>
                              {getRevisionStatusLabel(revision.status)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#777166]">
                            Diajukan {formatDate(revision.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="mb-2 text-sm font-semibold text-[#4c483f]">
                          Permintaan Customer
                        </p>
                        <div className="rounded-2xl border border-[#e9e3d8] bg-white p-4">
                          <p className="whitespace-pre-wrap text-sm leading-6 text-[#5e594f]">
                            {revision.customer_note || "Tidak ada catatan revisi."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="mb-2 block text-sm font-semibold text-[#4c483f]">
                          Catatan Admin
                        </label>
                        <textarea
                          value={revisionNotes[revision.id] || ""}
                          onChange={(event) =>
                            setRevisionNotes((current) => ({
                              ...current,
                              [revision.id]: event.target.value,
                            }))
                          }
                          placeholder="Tambahkan catatan untuk revisi ini..."
                          rows={4}
                          className="w-full resize-y rounded-xl border border-[#dcd5ca] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#2f6b45] focus:ring-2 focus:ring-[#2f6b45]/10"
                        />
                      </div>

                      <div className="mt-4 space-y-3">
                        <button
                          type="button"
                          onClick={() => handleSaveRevisionNote(revision)}
                          disabled={actionLoading}
                          className="w-full rounded-xl border border-[#dcd5ca] bg-white px-4 py-3 text-sm font-semibold text-[#4c483f] transition hover:bg-[#f4f1eb] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoading ? "Menyimpan..." : "Simpan Catatan"}
                        </button>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {revision.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleRevisionStatusChange(revision, "processing")}
                              disabled={actionLoading}
                              className="rounded-xl bg-[#2f6b45] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#245537] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actionLoading ? "Memproses..." : "Mulai Proses"}
                            </button>
                          )}

                          {revision.status === "processing" && (
                            <button
                              type="button"
                              onClick={() => handleRevisionStatusChange(revision, "completed")}
                              disabled={actionLoading}
                              className="rounded-xl bg-[#2f6b45] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#245537] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actionLoading ? "Menyelesaikan..." : "✓ Tandai Selesai"}
                            </button>
                          )}

                          {(revision.status === "pending" || revision.status === "processing") && (
                            <button
                              type="button"
                              onClick={() => handleRevisionStatusChange(revision, "rejected")}
                              disabled={actionLoading}
                              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actionLoading ? "Memproses..." : "Tolak Revisi"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* PEMBAYARAN */}
          {isPackageOrder ? (
            <section className="rounded-3xl border border-[#d8e6dc] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-4 rounded-2xl border border-[#d8e6dc] bg-[#edf5ef] p-5 sm:p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl">
                  🎟️
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#214d32]">
                    Pesanan Menggunakan Paket
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#4c6652]">
                    Pesanan ini menggunakan kuota paket customer. Tidak ada
                    tagihan tambahan per desain.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#667066]">
                    Pembayaran paket dikelola melalui bagian Pembayaran Paket
                    di halaman pesanan.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-3xl border border-[#e9e3d8] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold">Pembayaran</h2>
                <p className="mt-1 text-sm text-[#777166]">
                  Harga pesanan dan verifikasi pembayaran customer.
                </p>
              </div>

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
                    <p className="text-xs text-[#777166]">Sisa Pelunasan</p>
                    <p className="mt-1 text-base font-bold">
                      {formatRupiah(order.remaining_amount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#e9e3d8] bg-white p-4 sm:p-5">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#4c483f]">
                      {paymentTitle}
                    </h3>
                    <p className="mt-1 text-xs text-[#777166]">
                      {order.status === "waiting_payment"
                        ? "Menampilkan pembayaran pelunasan untuk pesanan ini."
                        : "Detail pembayaran yang dikirim customer."}
                    </p>
                  </div>
                  {payment && (
                    <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${getPaymentStatusClass(payment.status)}`}>
                      {getPaymentStatusLabel(payment.status)}
                    </span>
                  )}
                </div>

                {loadingPayment ? (
                  <div className="rounded-2xl bg-[#faf8f4] p-5">
                    <p className="text-sm text-[#777166]">Memuat data pembayaran...</p>
                  </div>
                ) : !payment ? (
                  <div className="rounded-2xl border border-dashed border-[#dcd5ca] bg-[#faf8f4] p-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0ece4]">
                      💳
                    </div>
                    <p className="text-sm font-semibold text-[#4c483f]">
                      {order.status === "waiting_payment"
                        ? "Belum ada pembayaran pelunasan"
                        : "Belum ada pembayaran DP"}
                    </p>
                    <p className="mt-1 text-xs text-[#777166]">
                      {order.status === "waiting_payment"
                        ? "Pastikan customer sudah mengirim pembayaran pelunasan melalui Customer Web."
                        : "Customer belum membuat pembayaran DP."}
                    </p>
                    <button
                      type="button"
                      onClick={() => loadPayment(order.id, order.status)}
                      className="mt-4 rounded-xl border border-[#dcd5ca] bg-white px-4 py-2.5 text-sm font-semibold text-[#4c483f] hover:bg-[#f4f1eb]"
                    >
                      Muat Ulang Pembayaran
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#faf8f4] p-4">
                        <p className="text-xs text-[#777166]">Metode Pembayaran</p>
                        <p className="mt-1 text-sm font-bold">
                          {payment.payment_method || "-"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#faf8f4] p-4">
                        <p className="text-xs text-[#777166]">Jenis Pembayaran</p>
                        <p className="mt-1 text-sm font-bold">
                          {payment.payment_type || "-"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#faf8f4] p-4">
                        <p className="text-xs text-[#777166]">{paymentAmountLabel}</p>
                        <p className="mt-1 text-lg font-bold text-[#2f6b45]">
                          {formatRupiah(payment.amount)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#faf8f4] p-4">
                        <p className="text-xs text-[#777166]">Waktu Pembayaran</p>
                        <p className="mt-1 text-sm font-bold">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold">Bukti Pembayaran</h4>
                          {paymentProof && (
                            <p className="mt-1 text-xs text-[#777166]">
                              {paymentProof.file_name} · {formatFileSize(paymentProof.file_size)}
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
                            Bukti pembayaran terhubung, tetapi file belum dapat ditampilkan.
                          </p>
                          <button
                            type="button"
                            onClick={() => loadPayment(order.id, order.status)}
                            className="mt-3 rounded-xl border border-yellow-300 bg-white px-4 py-2 text-sm font-semibold text-yellow-800"
                          >
                            Muat Ulang Bukti
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-[#e9e3d8] bg-[#faf8f4]">
                          {paymentProof.url && isImageFile(paymentProof.file_type, paymentProof.file_name) ? (
                            <div className="bg-[#f1eee8] p-3">
                              <a href={paymentProof.url} target="_blank" rel="noopener noreferrer" className="block">
                                <img
                                  src={paymentProof.url}
                                  alt={`Bukti pembayaran ${paymentProof.file_name}`}
                                  className="mx-auto max-h-[600px] w-full rounded-xl object-contain"
                                />
                              </a>
                            </div>
                          ) : paymentProof.url && isPdfFile(paymentProof.file_type, paymentProof.file_name) ? (
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
                              <p className="text-sm font-semibold">{paymentProof.file_name}</p>
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
                              <p className="text-sm font-semibold">{paymentProof.file_name}</p>
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

                    {payment.status === "pending" && payment.proof_file_id && (
                      <div className="rounded-2xl border border-[#dfe9e1] bg-[#f4f8f5] p-4 sm:p-5">
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-[#2f6b45]">
                            Verifikasi {settlementPayment ? "Pelunasan" : "DP"}
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
                              : `✓ Verifikasi ${settlementPayment ? "Pelunasan" : "DP"}`}
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePaymentAction("reject")}
                            disabled={paymentAction !== null}
                            className="flex-1 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {paymentAction === "reject"
                              ? "Menolak..."
                              : `✕ Tolak ${settlementPayment ? "Pelunasan" : "DP"}`}
                          </button>
                        </div>
                      </div>
                    )}

                    {payment.status === "verified" && (
                      <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                        <p className="text-sm font-semibold text-green-800">
                          ✓ {settlementPayment ? "Pembayaran pelunasan" : "Pembayaran DP"} sudah terverifikasi
                        </p>
                        {payment.verified_at && (
                          <p className="mt-1 text-xs text-green-700">
                            Diverifikasi pada {formatDate(payment.verified_at)}
                          </p>
                        )}
                      </div>
                    )}

                    {payment.status === "rejected" && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-800">
                          Pembayaran {settlementPayment ? "pelunasan" : "DP"} ditolak
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
          )}

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
              <option value="waiting_payment">Menunggu Pelunasan</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            {changingStatus && (
              <p className="mt-2 text-xs text-[#777166]">Menyimpan perubahan status...</p>
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
                {uploadingFinal ? "Mengupload file..." : "Pilih file final"}
              </span>
              <span className="mt-1 text-xs text-[#777166]">Maksimal 20 MB</span>
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
              <p className="text-sm text-[#777166]">Memuat halaman...</p>
            </div>
          </div>
        </main>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}
