
"use client";

import { Suspense, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@pajara/supabase";

const REVISION_PRICE = 15000;
const EXTRA_REVISIONS = 2;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const QRIS_IMAGE =
  "/qr_ID1026470184411_08.10.26_1791447334_1791447334905.jpeg";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  status: string | null;
  quantity: number;
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
  design_number: number | null;
};

type QuotaPurchase = {
  id: string;
  order_id: string;
  design_number: number;
  payment_id: string | null;
  extra_revisions: number;
  created_at: string;
  paymentStatus: string | null;
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getRevisionStatusLabel(status: string) {
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
      return status;
  }
}

function getRevisionStatusStyle(status: string) {
  switch (status) {
    case "pending":
      return { background: "#fff4df", color: "#8a6a4a" };
    case "processing":
      return {
        background: "#e8f2ec",
        color: "var(--green-dark)",
      };
    case "completed":
      return {
        background: "#e8f2ec",
        color: "var(--green)",
      };
    case "rejected":
      return { background: "#fbe9e9", color: "#a33a3a" };
    default:
      return { background: "#f0f0f0", color: "#666" };
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const cardStyle: CSSProperties = {
  marginTop: "28px",
  background: "#fff",
  borderRadius: "18px",
  padding: "28px",
  border: "1px solid #e8e2d8",
};

const headingStyle: CSSProperties = {
  color: "var(--green-dark)",
  marginTop: 0,
};

const mutedTextStyle: CSSProperties = {
  color: "#666",
  lineHeight: 1.7,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d9d1c6",
  borderRadius: "12px",
  padding: "13px 14px",
  fontSize: "14px",
  color: "#333",
  background: "#fff",
  fontFamily: "inherit",
};

const primaryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "12px",
  padding: "13px 20px",
  background: "var(--green)",
  color: "#fff",
  fontWeight: 700,
  fontSize: "14px",
  cursor: "pointer",
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "var(--cream)",
  padding: "40px 20px",
};

const containerStyle: CSSProperties = {
  maxWidth: "900px",
  margin: "0 auto",
};

const backLinkStyle: CSSProperties = {
  color: "var(--green)",
  fontSize: "14px",
  fontWeight: 700,
  textDecoration: "none",
};

const alertErrorStyle: CSSProperties = {
  marginTop: "24px",
  padding: "16px 18px",
  borderRadius: "14px",
  background: "#fbe9e9",
  border: "1px solid #edcaca",
  color: "#9a3333",
  lineHeight: 1.6,
};

const alertSuccessStyle: CSSProperties = {
  marginTop: "24px",
  padding: "16px 18px",
  borderRadius: "14px",
  background: "#e8f2ec",
  border: "1px solid #c9dfd0",
  color: "var(--green-dark)",
  lineHeight: 1.6,
};

const noticeStyle: CSSProperties = {
  padding: "13px 15px",
  borderRadius: "12px",
  background: "#fff4df",
  color: "#8a6a4a",
  lineHeight: 1.6,
  fontSize: "14px",
};

const labelStyle: CSSProperties = {
  display: "block",
  color: "var(--green-dark)",
  fontWeight: 700,
  marginBottom: "8px",
};

const noteHeadingStyle: CSSProperties = {
  color: "#555",
  fontSize: "13px",
  fontWeight: 700,
  marginBottom: "7px",
};

const noteBoxStyle: CSSProperties = {
  background: "var(--cream)",
  borderRadius: "12px",
  padding: "14px",
  color: "#555",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
};

function RevisionContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [purchases, setPurchases] = useState<QuotaPurchase[]>([]);

  const [freeQuota, setFreeQuota] = useState(2);
  const [planLabel, setPlanLabel] = useState("Pesanan biasa");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [purchaseSubmitting, setPurchaseSubmitting] = useState(false);

  const [customerNote, setCustomerNote] = useState("");
  const [revisionDesignNumber, setRevisionDesignNumber] = useState("1");
  const [purchaseDesignNumber, setPurchaseDesignNumber] = useState("1");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Kuota ditentukan berdasarkan pesanan yang sedang dibuka.
  // Pesanan biasa: 2 revisi gratis per desain.
  // Paket Mingguan: 2 revisi gratis per desain.
  // Paket Bulanan: 3 revisi gratis per desain.
  async function loadPlan(orderId: string) {
    let quota = 2;
    let label = "Pesanan biasa";

    try {
      const { data: request, error: requestError } = await supabase
        .from("subscription_requests")
        .select("subscription_id")
        .eq("order_id", orderId)
        .not("subscription_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (requestError) {
        console.error(
          "Gagal memeriksa paket untuk pesanan:",
          requestError
        );
      } else if (request?.subscription_id) {
        const { data: subscription, error: subscriptionError } =
          await supabase
            .from("subscriptions")
            .select("id, plan_id, status, expires_at")
            .eq("id", request.subscription_id)
            .eq("status", "active")
            .gt("expires_at", new Date().toISOString())
            .maybeSingle();

        if (subscriptionError) {
          console.error(
            "Gagal memeriksa langganan pesanan:",
            subscriptionError
          );
        } else if (subscription?.plan_id) {
          const { data: plan, error: planError } = await supabase
            .from("subscription_plans")
            .select("name")
            .eq("id", subscription.plan_id)
            .maybeSingle();

          if (planError) {
            console.error(
              "Gagal mengambil detail paket:",
              planError
            );
          } else if (plan?.name) {
            const planName = String(plan.name).toLowerCase();

            if (
              planName.includes("bulanan") ||
              planName.includes("monthly")
            ) {
              quota = 3;
              label = "Paket Bulanan";
            } else if (
              planName.includes("mingguan") ||
              planName.includes("weekly")
            ) {
              quota = 2;
              label = "Paket Mingguan";
            } else {
              label = String(plan.name);
            }
          }
        }
      }
    } catch (planError) {
      console.error("Gagal menentukan kuota revisi:", planError);
    }

    setFreeQuota(quota);
    setPlanLabel(label);
  }

  async function loadPurchases(orderId: string) {
    const { data, error: purchaseError } = await supabase
      .from("revision_quota_purchases")
      .select(
        "id, order_id, design_number, payment_id, extra_revisions, created_at"
      )
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (purchaseError) {
      console.error(
        "Gagal mengambil pembelian kuota:",
        purchaseError
      );
      setError(
        "Data kuota revisi belum bisa dimuat. Silakan muat ulang halaman."
      );
      return;
    }

    const rows = data || [];
    const paymentIds = [
      ...new Set(
        rows
          .map((purchase) => purchase.payment_id)
          .filter((paymentId): paymentId is string => Boolean(paymentId))
      ),
    ];

    let paymentStatusById: Record<string, string> = {};

    if (paymentIds.length > 0) {
      const { data: paymentRows, error: paymentError } = await supabase
        .from("payments")
        .select("id, status")
        .in("id", paymentIds);

      if (paymentError) {
        console.error(
          "Gagal memeriksa pembayaran kuota:",
          paymentError
        );
        setError(
          "Status pembayaran kuota belum bisa diperiksa. Silakan muat ulang halaman."
        );
        return;
      }

      paymentStatusById = Object.fromEntries(
        (paymentRows || []).map((payment) => [
          payment.id,
          payment.status,
        ])
      );
    }

    setPurchases(
      rows.map((purchase) => ({
        ...purchase,
        paymentStatus: purchase.payment_id
          ? paymentStatusById[purchase.payment_id] || null
          : null,
      }))
    );
  }

  async function loadData() {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Sesi login tidak ditemukan. Silakan login kembali.");
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id, order_code, service_name, status, quantity")
        .eq("id", id)
        .eq("customer_id", user.id)
        .maybeSingle();

      if (orderError) {
        console.error("Gagal mengambil pesanan:", orderError);
        setError("Pesanan gagal dimuat.");
        return;
      }

      if (!orderData) {
        setOrder(null);
        return;
      }

      // Paket diperiksa setelah pesanan ditemukan,
      // berdasarkan hubungan subscription_requests.order_id.
      await loadPlan(orderData.id);

      const normalizedOrder: Order = {
        ...orderData,
        quantity: Math.max(1, Number(orderData.quantity) || 1),
      };

      setOrder(normalizedOrder);

      // Jaga pilihan desain agar tetap valid jika halaman dimuat ulang.
      setRevisionDesignNumber((current) => {
        const number = Number(current);
        return number >= 1 && number <= normalizedOrder.quantity
          ? current
          : "1";
      });

      setPurchaseDesignNumber((current) => {
        const number = Number(current);
        return number >= 1 && number <= normalizedOrder.quantity
          ? current
          : "1";
      });

      const { data: revisionData, error: revisionError } =
        await supabase
          .from("revisions")
          .select(
            "id, order_id, revision_number, customer_note, admin_note, status, created_by, created_at, updated_at, design_number"
          )
          .eq("order_id", orderData.id)
          .order("revision_number", { ascending: false });

      if (revisionError) {
        console.error(
          "Gagal mengambil riwayat revisi:",
          revisionError
        );
        setError("Riwayat revisi gagal dimuat.");
      } else {
        setRevisions((revisionData || []) as Revision[]);
      }

      await loadPurchases(orderData.id);
    } catch (loadError) {
      console.error("Gagal memuat data revisi:", loadError);
      setError("Terjadi kesalahan saat memuat halaman.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function getCompletedCount(designNumber: number) {
    return revisions.filter(
      (revision) =>
        revision.design_number === designNumber &&
        revision.status === "completed"
    ).length;
  }

  function getFreeQuotaRemaining(designNumber: number) {
    return Math.max(0, freeQuota - getCompletedCount(designNumber));
  }

  function getExtraQuotaUsed(designNumber: number) {
    return Math.max(
      0,
      getCompletedCount(designNumber) - freeQuota
    );
  }

  function getVerifiedExtraQuota(designNumber: number) {
    return purchases
      .filter(
        (purchase) =>
          purchase.design_number === designNumber &&
          purchase.paymentStatus === "verified"
      )
      .reduce(
        (total, purchase) => total + purchase.extra_revisions,
        0
      );
  }

  function getQuotaForDesign(designNumber: number) {
    return Math.max(
      0,
      getVerifiedExtraQuota(designNumber) -
        getExtraQuotaUsed(designNumber)
    );
  }

  function getPendingPurchases(designNumber: number) {
    return purchases.filter(
      (purchase) =>
        purchase.design_number === designNumber &&
        purchase.paymentStatus !== "verified"
    ).length;
  }

  function getRevisionSource(designNumber: number) {
    if (getFreeQuotaRemaining(designNumber) > 0) return "free";
    if (getQuotaForDesign(designNumber) > 0) return "extra";
    return "none";
  }

  async function handlePurchaseQuota() {
    setError(null);
    setSuccess(null);

    if (!order) {
      setError("Pesanan tidak ditemukan.");
      return;
    }

    if (order.status !== "completed") {
      setError(
        "Kuota revisi tambahan bisa dibeli setelah pesanan selesai."
      );
      return;
    }

    if (!paymentProof) {
      setError("Unggah bukti pembayaran terlebih dahulu.");
      return;
    }

    if (paymentProof.size > MAX_FILE_SIZE) {
      setError("Ukuran bukti pembayaran maksimal 10 MB.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(paymentProof.type)) {
      setError(
        "Bukti pembayaran harus berupa JPG, PNG, WEBP, atau PDF."
      );
      return;
    }

    const designNumber = Number(purchaseDesignNumber);

    if (
      !Number.isInteger(designNumber) ||
      designNumber < 1 ||
      designNumber > order.quantity
    ) {
      setError("Pilih nomor desain yang valid.");
      return;
    }

    try {
      setPurchaseSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Sesi login tidak ditemukan. Silakan login kembali.");
        return;
      }

      const safeFileName = paymentProof.name.replace(/[^\w.-]+/g, "-");
      const filePath =
        `orders/${order.id}/payment-proof/` +
        `${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("pajara-files")
        .upload(filePath, paymentProof, {
          cacheControl: "3600",
          upsert: false,
          contentType: paymentProof.type,
        });

      if (uploadError) {
        console.error(
          "Gagal mengunggah bukti pembayaran:",
          uploadError
        );
        setError(
          "Bukti pembayaran gagal diunggah. Silakan coba lagi."
        );
        return;
      }

      const { data: fileRecord, error: fileError } = await supabase
        .from("order_files")
        .insert({
          order_id: order.id,
          file_name: paymentProof.name,
          file_path: filePath,
          file_type: paymentProof.type,
          file_size: paymentProof.size,
          file_category: "payment_proof",
        })
        .select("id")
        .single();

      if (fileError || !fileRecord) {
        console.error(
          "Gagal menyimpan data bukti:",
          fileError
        );
        setError(
          "File sudah diunggah, tetapi data buktinya gagal disimpan. Hubungi admin sebelum mengulangi pembayaran."
        );
        return;
      }

      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          order_id: order.id,
          payment_method: "QRIS",
          payment_type: "Revisi Tambahan",
          amount: REVISION_PRICE,
          proof_file_id: fileRecord.id,
          status: "pending",
          notes:
            `Pembelian ${EXTRA_REVISIONS} revisi tambahan ` +
            `untuk desain #${designNumber}.`,
        })
        .select("id")
        .single();

      if (paymentError || !payment) {
        console.error(
          "Gagal mencatat pembayaran:",
          paymentError
        );
        setError(
          "Bukti pembayaran tersimpan, tetapi transaksi gagal dicatat. Hubungi admin sebelum membayar ulang."
        );
        return;
      }

      const { error: quotaError } = await supabase
        .from("revision_quota_purchases")
        .insert({
          order_id: order.id,
          design_number: designNumber,
          payment_id: payment.id,
          extra_revisions: EXTRA_REVISIONS,
        });

      if (quotaError) {
        console.error(
          "Gagal mencatat pembelian kuota:",
          quotaError
        );
        setError(
          "Pembayaran tercatat, tetapi pengaitan kuota gagal. Jangan membayar ulang; hubungi admin."
        );
        return;
      }

      setPaymentProof(null);

      const fileInput = document.getElementById(
        "revision-payment-proof"
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = "";

      await loadPurchases(order.id);

      setSuccess(
        `Bukti pembayaran untuk desain #${designNumber} berhasil dikirim. Kuota tambahan aktif setelah diverifikasi admin.`
      );
    } catch (purchaseError) {
      console.error(
        "Kesalahan pembelian kuota:",
        purchaseError
      );
      setError(
        "Terjadi kesalahan saat mengirim pembayaran. Periksa riwayat pembayaran sebelum mencoba kembali."
      );
    } finally {
      setPurchaseSubmitting(false);
    }
  }

  async function handleSubmitRevision() {
    setError(null);
    setSuccess(null);

    const trimmedNote = customerNote.trim();
    const selectedDesign = Number(revisionDesignNumber);

    if (!order) {
      setError("Pesanan tidak ditemukan.");
      return;
    }

    if (!trimmedNote || trimmedNote.length < 5) {
      setError("Tuliskan detail revisi minimal 5 karakter.");
      return;
    }

    if (order.status !== "completed") {
      setError(
        "Pengajuan revisi tersedia setelah pesanan selesai."
      );
      return;
    }

    if (
      !Number.isInteger(selectedDesign) ||
      selectedDesign < 1 ||
      selectedDesign > order.quantity
    ) {
      setError("Pilih nomor desain yang valid.");
      return;
    }

    const activeRevision = revisions.find(
      (revision) =>
        revision.status === "pending" ||
        revision.status === "processing"
    );

    if (activeRevision) {
      setError(
        "Selesaikan revisi yang sedang berjalan sebelum mengajukan revisi berikutnya."
      );
      return;
    }

    const source = getRevisionSource(selectedDesign);

    if (source === "none") {
      setError(
        `Kuota revisi desain #${selectedDesign} sudah habis. Kamu bisa berhenti atau membeli 2 revisi tambahan seharga ${formatRupiah(REVISION_PRICE)}.`
      );
      return;
    }

    try {
      setSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Sesi login tidak ditemukan. Silakan login kembali.");
        return;
      }

      const nextRevisionNumber =
        revisions.length > 0
          ? Math.max(
              ...revisions.map(
                (revision) => revision.revision_number || 0
              )
            ) + 1
          : 1;

      const { error: insertError } = await supabase
        .from("revisions")
        .insert({
          order_id: order.id,
          revision_number: nextRevisionNumber,
          customer_note: trimmedNote,
          admin_note: null,
          status: "pending",
          created_by: user.id,
          design_number: selectedDesign,
        });

      if (insertError) {
        console.error("Gagal mengajukan revisi:", insertError);
        setError(
          insertError.message ||
            "Revisi gagal diajukan. Silakan coba lagi."
        );
        return;
      }

      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({
          status: "revision",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("customer_id", user.id);

      if (orderUpdateError) {
        console.error(
          "Gagal memperbarui status pesanan:",
          orderUpdateError
        );
      }

      setCustomerNote("");

      setSuccess(
        source === "free"
          ? `Revisi #${nextRevisionNumber} untuk desain #${selectedDesign} berhasil diajukan menggunakan kuota gratis.`
          : `Revisi #${nextRevisionNumber} untuk desain #${selectedDesign} berhasil diajukan menggunakan kuota tambahan.`
      );

      await loadData();
    } catch (submitError) {
      console.error(
        "Kesalahan saat mengajukan revisi:",
        submitError
      );
      setError(
        "Terjadi kesalahan saat mengajukan revisi. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <p style={{ color: "var(--green)" }}>Memuat revisi...</p>
        </div>
      </main>
    );
  }

  if (!id || !order) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <h1 style={{ color: "var(--green-dark)" }}>
            Pesanan tidak ditemukan
          </h1>
          <p style={mutedTextStyle}>
            Pesanan yang kamu cari tidak tersedia atau bukan milik akun
            ini.
          </p>
          <a href="/orders" style={backLinkStyle}>
            ← Kembali ke Pesanan
          </a>
        </div>
      </main>
    );
  }

  const activeRevision = revisions.find(
    (revision) =>
      revision.status === "pending" ||
      revision.status === "processing"
  );

  const canSubmit =
    order.status === "completed" && !activeRevision;

  const selectedDesign = Number(revisionDesignNumber);
  const selectedSource = getRevisionSource(selectedDesign);
  const selectedFreeRemaining =
    getFreeQuotaRemaining(selectedDesign);
  const selectedExtraRemaining =
    getQuotaForDesign(selectedDesign);

  const revisionLocked =
    !canSubmit || selectedSource === "none";

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <a
          href={`/orders?id=${order.id}`}
          style={backLinkStyle}
        >
          ← Kembali ke Pesanan
        </a>

        <div style={{ marginTop: "28px" }}>
          <p
            style={{
              color: "var(--brown)",
              fontWeight: 700,
              marginBottom: "8px",
              letterSpacing: "0.08em",
            }}
          >
            REVISI
          </p>

          <h1
            style={{
              color: "var(--green-dark)",
              marginBottom: "8px",
            }}
          >
            {order.order_code}
          </h1>

          <p style={{ color: "#666", marginBottom: 0 }}>
            {order.service_name || "Layanan Pajara Studio"}
          </p>

          <p style={{ color: "#888", fontSize: "13px" }}>
            Jumlah desain: {order.quantity}
          </p>
        </div>

        {error && <div style={alertErrorStyle}>{error}</div>}
        {success && <div style={alertSuccessStyle}>{success}</div>}

        <section style={cardStyle}>
          <h2 style={headingStyle}>Kuota Revisi Gratis</h2>

          <p style={mutedTextStyle}>
            Paket saat ini: <strong>{planLabel}</strong>. Kuota gratis
            digunakan terlebih dahulu untuk setiap desain. Revisi yang
            masih menunggu atau sedang diproses belum dihitung sebagai
            revisi selesai.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "14px",
              marginTop: "20px",
            }}
          >
            {Array.from({ length: order.quantity }, (_, index) => {
              const designNumber = index + 1;
              const freeRemaining =
                getFreeQuotaRemaining(designNumber);
              const extraRemaining =
                getQuotaForDesign(designNumber);
              const pending = getPendingPurchases(designNumber);

              return (
                <div
                  key={designNumber}
                  style={{
                    border: "1px solid #e8e2d8",
                    borderRadius: "14px",
                    padding: "16px",
                    background: "var(--cream)",
                  }}
                >
                  <strong style={{ color: "var(--green-dark)" }}>
                    Desain #{designNumber}
                  </strong>

                  <p
                    style={{
                      fontSize: "14px",
                      color: "#555",
                      margin: "9px 0",
                    }}
                  >
                    Revisi gratis tersisa:{" "}
                    <strong>{freeRemaining}</strong>
                  </p>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "#555",
                      margin: "6px 0",
                    }}
                  >
                    Revisi tambahan tersisa:{" "}
                    <strong>{extraRemaining}</strong>
                  </p>

                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      padding: "6px 9px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 700,
                      background:
                        freeRemaining > 0 || extraRemaining > 0
                          ? "#e8f2ec"
                          : "#fbe9e9",
                      color:
                        freeRemaining > 0 || extraRemaining > 0
                          ? "var(--green-dark)"
                          : "#a33a3a",
                    }}
                  >
                    {freeRemaining > 0
                      ? "Kuota gratis aktif"
                      : extraRemaining > 0
                        ? "Kuota tambahan aktif"
                        : "Kuota habis"}
                  </span>

                  {pending > 0 && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#8a6a4a",
                        marginBottom: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {pending} pembayaran menunggu verifikasi
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={headingStyle}>Ajukan Revisi</h2>

          <p style={mutedTextStyle}>
            Pilih desain dan jelaskan perubahan yang diinginkan. Kuota
            gratis akan digunakan otomatis terlebih dahulu.
          </p>

          {!canSubmit && (
            <div style={noticeStyle}>
              {activeRevision
                ? "Masih ada revisi yang sedang berjalan. Tunggu sampai selesai sebelum mengajukan revisi berikutnya."
                : "Pengajuan revisi tersedia setelah pesanan berstatus selesai."}
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <label htmlFor="revision-design" style={labelStyle}>
              Desain yang Direvisi
            </label>

            <select
              id="revision-design"
              value={revisionDesignNumber}
              onChange={(event) =>
                setRevisionDesignNumber(event.target.value)
              }
              style={inputStyle}
              disabled={submitting || !canSubmit}
            >
              {Array.from({ length: order.quantity }, (_, index) => {
                const number = index + 1;
                const free = getFreeQuotaRemaining(number);
                const extra = getQuotaForDesign(number);

                return (
                  <option key={number} value={String(number)}>
                    Desain #{number} —{" "}
                    {free > 0
                      ? `${free} revisi gratis tersisa`
                      : extra > 0
                        ? `${extra} revisi tambahan tersisa`
                        : "Kuota habis"}
                  </option>
                );
              })}
            </select>
          </div>

          <div
            style={{
              marginTop: "16px",
              marginBottom: "20px",
              padding: "15px",
              borderRadius: "12px",
              background:
                selectedSource === "none"
                  ? "#fbe9e9"
                  : "var(--cream)",
              border:
                selectedSource === "none"
                  ? "1px solid #edcaca"
                  : "1px solid #e8e2d8",
              color:
                selectedSource === "none" ? "#9a3333" : "#555",
              lineHeight: 1.7,
            }}
          >
            {selectedSource === "free" ? (
              <>
                <strong style={{ color: "var(--green-dark)" }}>
                  Menggunakan revisi gratis
                </strong>
                <p style={{ margin: "5px 0 0" }}>
                  Desain #{selectedDesign} masih memiliki{" "}
                  <strong>
                    {selectedFreeRemaining} revisi gratis
                  </strong>
                  . Kamu tidak perlu melakukan pembayaran tambahan.
                </p>
              </>
            ) : selectedSource === "extra" ? (
              <>
                <strong style={{ color: "var(--green-dark)" }}>
                  Menggunakan revisi tambahan
                </strong>
                <p style={{ margin: "5px 0 0" }}>
                  Kuota gratis desain ini sudah habis. Tersedia{" "}
                  <strong>
                    {selectedExtraRemaining} revisi tambahan
                  </strong>{" "}
                  yang sudah diverifikasi admin.
                </p>
              </>
            ) : (
              <>
                <strong>Kuota revisi desain ini habis.</strong>
                <p style={{ margin: "5px 0 0" }}>
                  Kolom revisi dikunci. Kamu boleh berhenti tanpa
                  membeli tambahan, atau membeli 2 revisi tambahan
                  seharga{" "}
                  <strong>{formatRupiah(REVISION_PRICE)}</strong>.
                </p>
              </>
            )}
          </div>

          <label htmlFor="revision-note" style={labelStyle}>
            Detail Revisi
          </label>

          <textarea
            id="revision-note"
            value={customerNote}
            onChange={(event) => setCustomerNote(event.target.value)}
            placeholder={
              revisionLocked
                ? "Kolom revisi terkunci karena kuota habis atau pesanan belum siap."
                : "Contoh: Tolong ubah warna background menjadi lebih terang dan ganti teks judul..."
            }
            rows={7}
            disabled={submitting || revisionLocked}
            style={{
              ...inputStyle,
              resize: "vertical",
              lineHeight: 1.6,
              background: revisionLocked ? "#f3f0eb" : "#fff",
              cursor: revisionLocked ? "not-allowed" : "text",
            }}
          />

          <p
            style={{
              color: "#888",
              fontSize: "13px",
              lineHeight: 1.5,
              marginTop: "8px",
            }}
          >
            Jelaskan perubahan yang diinginkan secara spesifik.
          </p>

          <button
            type="button"
            onClick={handleSubmitRevision}
            disabled={
              submitting ||
              revisionLocked ||
              !customerNote.trim() ||
              customerNote.trim().length < 5
            }
            style={{
              ...primaryButtonStyle,
              marginTop: "8px",
              opacity:
                submitting ||
                revisionLocked ||
                !customerNote.trim() ||
                customerNote.trim().length < 5
                  ? 0.55
                  : 1,
              cursor:
                submitting ||
                revisionLocked ||
                !customerNote.trim() ||
                customerNote.trim().length < 5
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {submitting
              ? "Mengajukan..."
              : revisionLocked
                ? "Kuota Revisi Tidak Tersedia"
                : "Ajukan Revisi"}
          </button>
        </section>

        <section style={cardStyle}>
          <h2 style={headingStyle}>Kuota Revisi Tambahan</h2>

          <p style={mutedTextStyle}>
            Pembelian bersifat opsional. Setiap paket berisi{" "}
            <strong>{EXTRA_REVISIONS} revisi tambahan per desain</strong>{" "}
            seharga <strong>{formatRupiah(REVISION_PRICE)}</strong>.
            Kuota baru aktif setelah pembayaran diverifikasi admin.
          </p>

          {order.status !== "completed" && (
            <div style={noticeStyle}>
              Pembelian kuota tersedia setelah pesanan berstatus selesai.
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "18px",
              marginTop: "20px",
            }}
          >
            <div>
              <label htmlFor="purchase-design" style={labelStyle}>
                Pilih Desain
              </label>
              <select
                id="purchase-design"
                value={purchaseDesignNumber}
                onChange={(event) =>
                  setPurchaseDesignNumber(event.target.value)
                }
                disabled={
                  purchaseSubmitting || order.status !== "completed"
                }
                style={inputStyle}
              >
                {Array.from({ length: order.quantity }, (_, index) => (
                  <option
                    key={index + 1}
                    value={String(index + 1)}
                  >
                    Desain #{index + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p
                style={{
                  color: "var(--green-dark)",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                Pembayaran QRIS
              </p>

              <div
                style={{
                  maxWidth: "280px",
                  border: "1px solid #e8e2d8",
                  borderRadius: "14px",
                  padding: "12px",
                  background: "#fff",
                }}
              >
                <img
                  src={QRIS_IMAGE}
                  alt="QRIS Pajara Studio"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <p style={{ ...mutedTextStyle, fontSize: "13px" }}>
                Bayar tepat sebesar {formatRupiah(REVISION_PRICE)} untuk
                satu paket kuota revisi tambahan. Simpan bukti pembayaran
                sebelum melanjutkan.
              </p>
            </div>

            <div>
              <label
                htmlFor="revision-payment-proof"
                style={labelStyle}
              >
                Bukti Pembayaran
              </label>

              <input
                id="revision-payment-proof"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                disabled={
                  purchaseSubmitting || order.status !== "completed"
                }
                onChange={(event) =>
                  setPaymentProof(event.target.files?.[0] || null)
                }
                style={{ ...inputStyle, padding: "11px" }}
              />

              <p
                style={{
                  color: "#888",
                  fontSize: "12px",
                  lineHeight: 1.6,
                }}
              >
                JPG, PNG, WEBP, atau PDF. Maksimal 10 MB.
                {paymentProof
                  ? ` File dipilih: ${paymentProof.name}`
                  : ""}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                paddingTop: "18px",
                borderTop: "1px solid #eee7dd",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#777",
                    fontSize: "13px",
                  }}
                >
                  Total pembayaran
                </p>
                <strong
                  style={{
                    display: "block",
                    marginTop: "4px",
                    color: "var(--green-dark)",
                    fontSize: "22px",
                  }}
                >
                  {formatRupiah(REVISION_PRICE)}
                </strong>
              </div>

              <button
                type="button"
                onClick={handlePurchaseQuota}
                disabled={
                  purchaseSubmitting ||
                  !paymentProof ||
                  order.status !== "completed"
                }
                style={{
                  ...primaryButtonStyle,
                  opacity:
                    purchaseSubmitting ||
                    !paymentProof ||
                    order.status !== "completed"
                      ? 0.6
                      : 1,
                  cursor:
                    purchaseSubmitting ||
                    !paymentProof ||
                    order.status !== "completed"
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {purchaseSubmitting
                  ? "Mengirim Pembayaran..."
                  : "Kirim Bukti Pembayaran"}
              </button>
            </div>
          </div>
        </section>

        {activeRevision && (
          <section style={cardStyle}>
            <h2 style={headingStyle}>Revisi Sedang Diproses</h2>
            <p style={{ ...mutedTextStyle, marginBottom: 0 }}>
              Revisi #{activeRevision.revision_number} sedang diproses
              oleh tim Pajara Studio. Tunggu sampai revisi selesai
              sebelum mengajukan revisi berikutnya.
            </p>
          </section>
        )}

        <section style={cardStyle}>
          <h2 style={{ ...headingStyle, marginBottom: "18px" }}>
            Riwayat Revisi
          </h2>

          {revisions.length === 0 ? (
            <div
              style={{
                padding: "20px",
                borderRadius: "14px",
                background: "var(--cream)",
                border: "1px dashed #cfc5b7",
              }}
            >
              <strong style={{ color: "var(--green-dark)" }}>
                Belum ada revisi
              </strong>
              <p
                style={{
                  color: "#777",
                  marginBottom: 0,
                  lineHeight: 1.6,
                }}
              >
                Riwayat pengajuan revisi akan muncul di sini.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {revisions.map((revision) => {
                const statusStyle = getRevisionStatusStyle(
                  revision.status
                );

                return (
                  <article
                    key={revision.id}
                    style={{
                      border: "1px solid #e8e2d8",
                      borderRadius: "16px",
                      padding: "20px",
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            color: "var(--green-dark)",
                            fontSize: "16px",
                          }}
                        >
                          Revisi #{revision.revision_number}
                          {revision.design_number
                            ? ` · Desain #${revision.design_number}`
                            : ""}
                        </strong>

                        <p
                          style={{
                            color: "#888",
                            fontSize: "13px",
                            margin: "6px 0 0",
                          }}
                        >
                          {formatDate(revision.created_at)}
                        </p>
                      </div>

                      <span
                        style={{
                          display: "inline-block",
                          padding: "7px 11px",
                          borderRadius: "999px",
                          background: statusStyle.background,
                          color: statusStyle.color,
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        {getRevisionStatusLabel(revision.status)}
                      </span>
                    </div>

                    <div style={{ marginTop: "18px" }}>
                      <p style={noteHeadingStyle}>Permintaan Revisi</p>
                      <div style={noteBoxStyle}>
                        {revision.customer_note ||
                          "Tidak ada catatan revisi."}
                      </div>
                    </div>

                    {revision.admin_note && (
                      <div style={{ marginTop: "16px" }}>
                        <p
                          style={{
                            ...noteHeadingStyle,
                            color: "var(--green-dark)",
                          }}
                        >
                          Catatan Pajara Studio
                        </p>
                        <div
                          style={{
                            ...noteBoxStyle,
                            background: "#f5f7f5",
                          }}
                        >
                          {revision.admin_note}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p
          style={{
            color: "#8b887f",
            fontSize: "12px",
            textAlign: "center",
            marginTop: "30px",
          }}
        >
          Desain yang punya arah.
        </p>
      </div>
    </main>
  );
}

function RevisionFallback() {
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <p style={{ color: "var(--green)" }}>Memuat revisi...</p>
      </div>
    </main>
  );
}

export default function RevisionPage() {
  return (
    <Suspense fallback={<RevisionFallback />}>
      <RevisionContent />
    </Suspense>
  );
}
