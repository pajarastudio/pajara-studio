
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@pajara/supabase";

const REVISION_PRICE = 15000;
const EXTRA_REVISIONS = 2;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const QRIS_IMAGE =
  "/qr_ID1026470184411_08.10.26_1791447334_1791447334905.jpeg";
const LOGO_IMAGE =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

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

function formatDate(date: string) {
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRevisionStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Menunggu Diproses",
    processing: "Sedang Diproses",
    completed: "Selesai",
    rejected: "Ditolak",
  };

  return labels[status] || status;
}

function getRevisionStatusStyle(status: string): CSSProperties {
  const styles: Record<string, CSSProperties> = {
    pending: { background: "#fff3dc", color: "#8a6a4a" },
    processing: { background: "#e8f2ec", color: "#214d32" },
    completed: { background: "#e0efe5", color: "#2f6b45" },
    rejected: { background: "#fbe9e9", color: "#a33a3a" },
  };

  return styles[status] || { background: "#f0f0f0", color: "#666" };
}

const cardStyle: CSSProperties = {
  marginTop: 22,
  padding: "clamp(18px, 4vw, 28px)",
  background: "#fff",
  border: "1px solid #e8e2d8",
  borderRadius: 20,
  boxShadow: "0 8px 28px rgba(33,77,50,0.035)",
};

const headingStyle: CSSProperties = {
  color: "#214d32",
  margin: "0 0 12px",
  fontSize: 21,
  fontFamily: "Georgia, serif",
  fontWeight: 600,
};

const mutedTextStyle: CSSProperties = {
  color: "#6f716d",
  lineHeight: 1.8,
  fontSize: 14,
};

const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #ded8cd",
  borderRadius: 12,
  padding: "13px 14px",
  fontSize: 14,
  color: "#303630",
  background: "#fff",
  fontFamily: "inherit",
};

const primaryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "13px 19px",
  background: "#2f6b45",
  color: "#fff",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
};

const labelStyle: CSSProperties = {
  display: "block",
  color: "#214d32",
  fontWeight: 700,
  fontSize: 13,
  marginBottom: 8,
};

const noticeStyle: CSSProperties = {
  padding: 14,
  borderRadius: 12,
  background: "#fff5e4",
  border: "1px solid #f0dfc0",
  color: "#80613e",
  lineHeight: 1.7,
  fontSize: 13,
};

function RevisionStyles() {
  return (
    <style jsx global>{`
      .revision-page {
        min-height: 100vh;
        box-sizing: border-box;
        background: #f7f4ee;
        padding: 32px 20px;
        color: #333b34;
        font-family: "DM Sans", Arial, sans-serif;
      }

      .revision-page * {
        box-sizing: border-box;
      }

      .revision-container {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
      }

      .revision-back {
        display: flex;
        align-items: center;
        gap: 13px;
        width: 100%;
        min-height: 68px;
        padding: 13px 17px;
        color: #214d32;
        background: #fff;
        border: 1px solid #e8e2d8;
        border-radius: 16px;
        box-shadow: 0 5px 18px rgba(33,77,50,.04);
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
        transition: border-color .2s ease, background .2s ease;
      }

      .revision-back:hover {
        background: #faf8f3;
        border-color: #c9d8ca;
      }

      .revision-back-icon {
        display: flex;
        width: 40px;
        height: 40px;
        flex: 0 0 40px;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: #e8f2ec;
        color: #2f6b45;
        font-size: 20px;
      }

      .revision-back-text {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 4px;
      }

      .revision-back-text small {
        color: #85877f;
        font-size: 11px;
        font-weight: 400;
      }

      .revision-hero {
        margin-top: 22px;
        padding: 26px;
        border-radius: 20px;
        color: #fff;
        background: linear-gradient(135deg, #214d32, #34734b);
        box-shadow: 0 12px 30px rgba(33,77,50,.13);
      }

      .revision-hero-label {
        margin: 0 0 10px;
        color: #e5c9a8;
        font-size: 11px;
        letter-spacing: 2px;
        font-weight: 700;
      }

      .revision-hero h1 {
        margin: 0;
        font-family: Georgia, serif;
        font-size: clamp(25px, 5vw, 34px);
        font-weight: 500;
        overflow-wrap: anywhere;
      }

      .revision-hero p {
        margin: 9px 0 0;
        color: rgba(255,255,255,.8);
        font-size: 13px;
        line-height: 1.7;
      }

      .revision-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 13px;
        margin-top: 20px;
      }

      .revision-quota-card {
        padding: 16px;
        border: 1px solid #e8e2d8;
        border-radius: 15px;
        background: #faf8f3;
      }

      .revision-quota-card p {
        font-size: 13px;
        color: #656962;
        line-height: 1.6;
      }

      .revision-alert {
        margin-top: 20px;
        padding: 15px 17px;
        border-radius: 13px;
        line-height: 1.7;
        font-size: 13px;
        overflow-wrap: anywhere;
      }

      .revision-history-card {
        border: 1px solid #e8e2d8;
        border-radius: 15px;
        padding: 18px;
        background: #fff;
      }

      .revision-small-label {
        margin: 0 0 7px;
        color: #73766f;
        font-size: 11px;
        letter-spacing: 1px;
        font-weight: 700;
      }

      .revision-page button:disabled {
        opacity: .55;
        cursor: not-allowed;
      }

      .revision-page input:focus,
      .revision-page textarea:focus,
      .revision-page select:focus {
        outline: 2px solid rgba(47,107,69,.18);
        border-color: #2f6b45;
      }

      .revision-empty {
        padding: 22px;
        border: 1px dashed #d7cfc1;
        border-radius: 14px;
        background: #faf8f3;
      }

      .loading-page {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .loading-card {
        width: 100%;
        max-width: 370px;
        margin: 0 auto;
        padding: 32px 24px;
        text-align: center;
        background: #fff;
        border: 1px solid #e8e2d8;
        border-radius: 22px;
        box-shadow: 0 18px 50px rgba(33,77,50,.08);
      }

      .loading-logo {
        display: flex;
        width: 68px;
        height: 68px;
        flex: 0 0 68px;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        overflow: hidden;
        border-radius: 16px;
        background: #f7f4ee;
      }

      .loading-logo img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .loading-eyebrow {
        margin: 0 0 9px;
        color: #8a6a4a;
        font-size: 10px;
        letter-spacing: 2px;
        font-weight: 700;
      }

      .loading-card h1 {
        margin: 0;
        color: #214d32;
        font-family: Georgia, serif;
        font-size: 24px;
        line-height: 1.3;
        font-weight: 500;
      }

      .loading-description {
        margin: 12px 0 23px;
        color: #777b74;
        font-size: 13px;
        line-height: 1.8;
      }

      .loading-spinner {
        width: 30px;
        height: 30px;
        margin: 0 auto;
        border: 3px solid #e3eadf;
        border-top-color: #2f6b45;
        border-radius: 50%;
        animation: pajaraRevisionSpin .8s linear infinite;
      }

      .loading-footer {
        margin: 22px 0 0;
        color: #969188;
        font-size: 11px;
      }

      @keyframes pajaraRevisionSpin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 600px) {
        .revision-page {
          padding: 20px 14px;
        }

        .revision-hero {
          padding: 22px 19px;
          border-radius: 17px;
        }

        .revision-grid {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}

function RevisionLoading() {
  return (
    <main
      className="revision-page loading-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#f7f4ee",
        fontFamily: "'DM Sans', Arial, sans-serif",
      }}
    >
      <section
        className="loading-card"
        style={{
          width: "100%",
          maxWidth: 370,
          margin: "0 auto",
          padding: "32px 24px",
          textAlign: "center",
          background: "#fff",
          border: "1px solid #e8e2d8",
          borderRadius: 22,
          boxShadow: "0 18px 50px rgba(33,77,50,.08)",
        }}
      >
        <div
          className="loading-logo"
          style={{
            display: "flex",
            width: 68,
            height: 68,
            flex: "0 0 68px",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            overflow: "hidden",
            borderRadius: 16,
            background: "#f7f4ee",
          }}
        >
          <img
            src={LOGO_IMAGE}
            alt="Pajara Studio"
            width={68}
            height={68}
            style={{
              display: "block",
              width: 68,
              height: 68,
              maxWidth: 68,
              maxHeight: 68,
              objectFit: "contain",
            }}
          />
        </div>

        <p
          className="loading-eyebrow"
          style={{
            margin: "0 0 9px",
            color: "#8a6a4a",
            fontSize: 10,
            lineHeight: 1.5,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          PAJARA STUDIO
        </p>

        <h1
          style={{
            margin: 0,
            color: "#214d32",
            fontFamily: "Georgia, serif",
            fontSize: 24,
            lineHeight: 1.3,
            fontWeight: 500,
          }}
        >
          Menyiapkan revisi
        </h1>

        <p
          className="loading-description"
          style={{
            margin: "12px 0 23px",
            color: "#777b74",
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          Kami sedang menyiapkan data pesananmu. Mohon tunggu sebentar.
        </p>

        <div
          className="loading-spinner"
          role="status"
          aria-label="Memuat"
          style={{
            width: 30,
            height: 30,
            margin: "0 auto",
            border: "3px solid #e3eadf",
            borderTopColor: "#2f6b45",
            borderRadius: "50%",
            animation: "pajaraRevisionSpin .8s linear infinite",
          }}
        />

        <p
          className="loading-footer"
          style={{
            margin: "22px 0 0",
            color: "#969188",
            fontSize: 11,
          }}
        >
          Berakar di Tanah Pasundan.
        </p>
      </section>
      <RevisionStyles />
    </main>
  );
}

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
        console.error("Gagal memeriksa paket:", requestError);
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
          console.error("Gagal memeriksa langganan:", subscriptionError);
        } else if (subscription?.plan_id) {
          const { data: plan, error: planError } = await supabase
            .from("subscription_plans")
            .select("name")
            .eq("id", subscription.plan_id)
            .maybeSingle();

          if (planError) {
            console.error("Gagal mengambil detail paket:", planError);
          } else if (plan?.name) {
            const name = String(plan.name).toLowerCase();

            if (name.includes("bulanan") || name.includes("monthly")) {
              quota = 3;
              label = "Paket Bulanan";
            } else if (
              name.includes("mingguan") ||
              name.includes("weekly")
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
      console.error("Gagal mengambil pembelian kuota:", purchaseError);
      setError("Data kuota revisi belum bisa dimuat. Silakan muat ulang halaman.");
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
        console.error("Gagal memeriksa pembayaran kuota:", paymentError);
        setError(
          "Status pembayaran kuota belum bisa diperiksa. Silakan muat ulang halaman."
        );
        return;
      }

      paymentStatusById = Object.fromEntries(
        (paymentRows || []).map((payment) => [payment.id, payment.status])
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

  const loadData = useCallback(async () => {
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

      await loadPlan(orderData.id);

      const normalizedOrder: Order = {
        ...orderData,
        quantity: Math.max(1, Number(orderData.quantity) || 1),
      };

      setOrder(normalizedOrder);

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

      const { data: revisionData, error: revisionError } = await supabase
        .from("revisions")
        .select(
          "id, order_id, revision_number, customer_note, admin_note, status, created_by, created_at, updated_at, design_number"
        )
        .eq("order_id", orderData.id)
        .order("revision_number", { ascending: false });

      if (revisionError) {
        console.error("Gagal mengambil riwayat revisi:", revisionError);
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
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
    return Math.max(0, getCompletedCount(designNumber) - freeQuota);
  }

  function getVerifiedExtraQuota(designNumber: number) {
    return purchases
      .filter(
        (purchase) =>
          purchase.design_number === designNumber &&
          purchase.paymentStatus === "verified"
      )
      .reduce((total, purchase) => total + purchase.extra_revisions, 0);
  }

  function getQuotaForDesign(designNumber: number) {
    return Math.max(
      0,
      getVerifiedExtraQuota(designNumber) - getExtraQuotaUsed(designNumber)
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
      setError("Kuota revisi tambahan bisa dibeli setelah pesanan selesai.");
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
      setError("Bukti pembayaran harus berupa JPG, PNG, WEBP, atau PDF.");
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
        console.error("Gagal mengunggah bukti pembayaran:", uploadError);
        setError("Bukti pembayaran gagal diunggah. Silakan coba lagi.");
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
        console.error("Gagal menyimpan data bukti:", fileError);
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
        console.error("Gagal mencatat pembayaran:", paymentError);
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
        console.error("Gagal mencatat pembelian kuota:", quotaError);
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
      console.error("Kesalahan pembelian kuota:", purchaseError);
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
      setError("Pengajuan revisi tersedia setelah pesanan selesai.");
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
        revision.status === "pending" || revision.status === "processing"
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
              ...revisions.map((revision) => revision.revision_number || 0)
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
          insertError.message || "Revisi gagal diajukan. Silakan coba lagi."
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
      console.error("Kesalahan saat mengajukan revisi:", submitError);
      setError(
        "Terjadi kesalahan saat mengajukan revisi. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <RevisionLoading />;

  if (!id || !order) {
    return (
      <main className="revision-page">
        <div className="revision-container">
          <a href="/orders" className="revision-back">
            <span className="revision-back-icon" aria-hidden="true">←</span>
            <span className="revision-back-text">
              Kembali ke Pesanan
              <small>Lihat daftar pesananmu</small>
            </span>
            <span aria-hidden="true" style={{ color: "#8a6a4a", fontSize: 20 }}>›</span>
          </a>

          <section style={cardStyle}>
            <p className="revision-small-label">PAJARA STUDIO</p>
            <h1 style={{ color: "#214d32", fontFamily: "Georgia, serif" }}>
              Pesanan tidak ditemukan
            </h1>
            <p style={mutedTextStyle}>
              Pesanan yang kamu cari tidak tersedia atau bukan milik akun ini.
            </p>
          </section>
        </div>
        <RevisionStyles />
      </main>
    );
  }

  const activeRevision = revisions.find(
    (revision) =>
      revision.status === "pending" || revision.status === "processing"
  );

  const canSubmit = order.status === "completed" && !activeRevision;
  const selectedDesign = Number(revisionDesignNumber);
  const selectedSource = getRevisionSource(selectedDesign);
  const selectedFreeRemaining = getFreeQuotaRemaining(selectedDesign);
  const selectedExtraRemaining = getQuotaForDesign(selectedDesign);
  const revisionLocked = !canSubmit || selectedSource === "none";

  return (
    <main className="revision-page">
      <div className="revision-container">
        <a href={`/orders?id=${order.id}`} className="revision-back">
          <span className="revision-back-icon" aria-hidden="true">←</span>
          <span className="revision-back-text">
            Kembali ke Pesanan
            <small>Lihat detail dan status pesananmu</small>
          </span>
          <span aria-hidden="true" style={{ color: "#8a6a4a", fontSize: 20 }}>›</span>
        </a>

        <header className="revision-hero">
          <p className="revision-hero-label">PAJARA STUDIO · LAYANAN</p>
          <h1>Pengajuan Revisi</h1>
          <p>{order.order_code} · {order.service_name || "Layanan Pajara Studio"}</p>
          <p>Jumlah desain: {order.quantity}</p>
        </header>

        {error && (
          <div
            className="revision-alert"
            role="alert"
            style={{
              background: "#fbe9e9",
              border: "1px solid #edcaca",
              color: "#9a3333",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="revision-alert"
            role="status"
            style={{
              background: "#e8f2ec",
              border: "1px solid #c9dfd0",
              color: "#214d32",
            }}
          >
            {success}
          </div>
        )}

        <section style={cardStyle}>
          <p className="revision-small-label">RINGKASAN KUOTA</p>
          <h2 style={headingStyle}>Kuota Revisi Gratis</h2>
          <p style={mutedTextStyle}>
            Paket saat ini: <strong>{planLabel}</strong>. Kuota gratis digunakan
            terlebih dahulu untuk setiap desain. Revisi yang masih menunggu
            atau sedang diproses belum dihitung sebagai revisi selesai.
          </p>

          <div className="revision-grid">
            {Array.from({ length: order.quantity }, (_, index) => {
              const designNumber = index + 1;
              const freeRemaining = getFreeQuotaRemaining(designNumber);
              const extraRemaining = getQuotaForDesign(designNumber);
              const pending = getPendingPurchases(designNumber);
              const hasQuota = freeRemaining > 0 || extraRemaining > 0;

              return (
                <div className="revision-quota-card" key={designNumber}>
                  <strong style={{ color: "#214d32" }}>
                    Desain #{designNumber}
                  </strong>
                  <p style={{ margin: "10px 0 6px" }}>
                    Revisi gratis tersisa: <strong>{freeRemaining}</strong>
                  </p>
                  <p style={{ margin: "6px 0 12px" }}>
                    Revisi tambahan tersisa: <strong>{extraRemaining}</strong>
                  </p>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      background: hasQuota ? "#e5f1e8" : "#fbe9e9",
                      color: hasQuota ? "#214d32" : "#a33a3a",
                    }}
                  >
                    {freeRemaining > 0
                      ? "Kuota gratis aktif"
                      : extraRemaining > 0
                        ? "Kuota tambahan aktif"
                        : "Kuota habis"}
                  </span>
                  {pending > 0 && (
                    <p style={{ fontSize: 11, color: "#8a6a4a", marginBottom: 0 }}>
                      {pending} pembayaran menunggu verifikasi
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section style={cardStyle}>
          <p className="revision-small-label">FORMULIR</p>
          <h2 style={headingStyle}>Ajukan Revisi</h2>
          <p style={mutedTextStyle}>
            Pilih desain dan jelaskan perubahan yang diinginkan. Kuota gratis
            akan digunakan otomatis terlebih dahulu.
          </p>

          {!canSubmit && (
            <div style={noticeStyle}>
              {activeRevision
                ? "Masih ada revisi yang sedang berjalan. Tunggu sampai selesai sebelum mengajukan revisi berikutnya."
                : "Pengajuan revisi tersedia setelah pesanan berstatus selesai."}
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <label htmlFor="revision-design" style={labelStyle}>
              Desain yang Direvisi
            </label>
            <select
              id="revision-design"
              value={revisionDesignNumber}
              onChange={(event) => setRevisionDesignNumber(event.target.value)}
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
              marginTop: 16,
              marginBottom: 22,
              padding: 16,
              borderRadius: 13,
              background: selectedSource === "none" ? "#fbe9e9" : "#f7f4ee",
              border: `1px solid ${selectedSource === "none" ? "#edcaca" : "#e8e2d8"}`,
              color: selectedSource === "none" ? "#9a3333" : "#555",
              lineHeight: 1.7,
              fontSize: 13,
            }}
          >
            {selectedSource === "free" ? (
              <>
                <strong style={{ color: "#214d32" }}>Menggunakan revisi gratis</strong>
                <p style={{ margin: "5px 0 0" }}>
                  Desain #{selectedDesign} masih memiliki{" "}
                  <strong>{selectedFreeRemaining} revisi gratis</strong>. Kamu
                  tidak perlu melakukan pembayaran tambahan.
                </p>
              </>
            ) : selectedSource === "extra" ? (
              <>
                <strong style={{ color: "#214d32" }}>Menggunakan revisi tambahan</strong>
                <p style={{ margin: "5px 0 0" }}>
                  Tersedia <strong>{selectedExtraRemaining} revisi tambahan</strong>{" "}
                  yang sudah diverifikasi admin.
                </p>
              </>
            ) : (
              <>
                <strong>Kuota revisi desain ini habis.</strong>
                <p style={{ margin: "5px 0 0" }}>
                  Kamu boleh berhenti tanpa membeli tambahan, atau membeli 2
                  revisi tambahan seharga <strong>{formatRupiah(REVISION_PRICE)}</strong>.
                </p>
              </>
            )}
          </div>

          <label htmlFor="revision-note" style={labelStyle}>Detail Revisi</label>
          <textarea
            id="revision-note"
            value={customerNote}
            onChange={(event) => setCustomerNote(event.target.value)}
            placeholder={
              revisionLocked
                ? "Kolom revisi terkunci karena kuota habis atau pesanan belum siap."
                : "Contoh: Tolong ubah warna background menjadi lebih terang dan ganti teks judul..."
            }
            rows={6}
            disabled={submitting || revisionLocked}
            style={{
              ...inputStyle,
              resize: "vertical",
              lineHeight: 1.7,
              background: revisionLocked ? "#f3f0eb" : "#fff",
            }}
          />
          <p style={{ color: "#8b887f", fontSize: 12, lineHeight: 1.6 }}>
            Jelaskan perubahan yang diinginkan secara spesifik. Minimal 5 karakter.
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
            style={{ ...primaryButtonStyle, width: "100%", marginTop: 8 }}
          >
            {submitting
              ? "Mengajukan revisi..."
              : revisionLocked
                ? "Kuota Revisi Tidak Tersedia"
                : "Ajukan Revisi"}
          </button>
        </section>

        <section style={cardStyle}>
          <p className="revision-small-label">PEMBAYARAN OPSIONAL</p>
          <h2 style={headingStyle}>Kuota Revisi Tambahan</h2>
          <p style={mutedTextStyle}>
            Setiap paket berisi <strong>{EXTRA_REVISIONS} revisi tambahan</strong>{" "}
            untuk satu desain, seharga <strong>{formatRupiah(REVISION_PRICE)}</strong>.
            Kuota aktif setelah pembayaran diverifikasi admin.
          </p>

          {order.status !== "completed" && (
            <div style={noticeStyle}>
              Pembelian kuota tersedia setelah pesanan berstatus selesai.
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <label htmlFor="purchase-design" style={labelStyle}>Pilih Desain</label>
            <select
              id="purchase-design"
              value={purchaseDesignNumber}
              onChange={(event) => setPurchaseDesignNumber(event.target.value)}
              disabled={purchaseSubmitting || order.status !== "completed"}
              style={inputStyle}
            >
              {Array.from({ length: order.quantity }, (_, index) => (
                <option key={index + 1} value={String(index + 1)}>
                  Desain #{index + 1}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 24 }}>
            <p style={{ color: "#214d32", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
              Pembayaran melalui QRIS
            </p>
            <div
              style={{
                maxWidth: 310,
                margin: "0 auto",
                padding: 12,
                border: "1px solid #e8e2d8",
                borderRadius: 17,
                background: "#fff",
              }}
            >
              <img
                src={QRIS_IMAGE}
                alt="QRIS Pajara Studio"
                style={{ display: "block", width: "100%", height: "auto", borderRadius: 9 }}
              />
            </div>
            <p style={{ ...mutedTextStyle, fontSize: 13 }}>
              Bayar tepat sebesar {formatRupiah(REVISION_PRICE)} untuk satu
              paket kuota. Simpan bukti pembayaran sebelum melanjutkan.
            </p>
          </div>

          <div style={{ marginTop: 22 }}>
            <label htmlFor="revision-payment-proof" style={labelStyle}>
              Bukti Pembayaran
            </label>
            <input
              id="revision-payment-proof"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              disabled={purchaseSubmitting || order.status !== "completed"}
              onChange={(event) => setPaymentProof(event.target.files?.[0] || null)}
              style={{ ...inputStyle, padding: 10 }}
            />
            <p style={{ color: "#8b887f", fontSize: 12, lineHeight: 1.7 }}>
              Format JPG, PNG, WEBP, atau PDF. Maksimal 10 MB.
              {paymentProof ? ` File dipilih: ${paymentProof.name}` : ""}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid #eee7dd",
            }}
          >
            <div>
              <p style={{ margin: 0, color: "#888", fontSize: 12 }}>Total pembayaran</p>
              <strong style={{ display: "block", marginTop: 5, color: "#214d32", fontSize: 22 }}>
                {formatRupiah(REVISION_PRICE)}
              </strong>
            </div>
            <button
              type="button"
              onClick={handlePurchaseQuota}
              disabled={purchaseSubmitting || !paymentProof || order.status !== "completed"}
              style={{ ...primaryButtonStyle, flex: "1 1 200px" }}
            >
              {purchaseSubmitting ? "Mengirim pembayaran..." : "Kirim Bukti Pembayaran"}
            </button>
          </div>
        </section>

        {activeRevision && (
          <section style={cardStyle}>
            <p className="revision-small-label">STATUS SAAT INI</p>
            <h2 style={headingStyle}>Revisi Sedang Diproses</h2>
            <p style={{ ...mutedTextStyle, marginBottom: 0 }}>
              Revisi #{activeRevision.revision_number} sedang diproses oleh tim
              Pajara Studio. Tunggu sampai revisi selesai sebelum mengajukan
              revisi berikutnya.
            </p>
          </section>
        )}

        <section style={cardStyle}>
          <p className="revision-small-label">AKTIVITAS PESANAN</p>
          <h2 style={headingStyle}>Riwayat Revisi</h2>

          {revisions.length === 0 ? (
            <div className="revision-empty">
              <strong style={{ color: "#214d32" }}>Belum ada revisi</strong>
              <p style={{ color: "#777", marginBottom: 0, fontSize: 13, lineHeight: 1.7 }}>
                Riwayat pengajuan revisi akan muncul di sini.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              {revisions.map((revision) => {
                const statusStyle = getRevisionStatusStyle(revision.status);

                return (
                  <article key={revision.id} className="revision-history-card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#214d32", fontSize: 15 }}>
                          Revisi #{revision.revision_number}
                          {revision.design_number ? ` · Desain #${revision.design_number}` : ""}
                        </strong>
                        <p style={{ color: "#888", fontSize: 12, margin: "7px 0 0" }}>
                          {formatDate(revision.created_at)}
                        </p>
                      </div>
                      <span
                        style={{
                          ...statusStyle,
                          display: "inline-block",
                          padding: "7px 10px",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {getRevisionStatusLabel(revision.status)}
                      </span>
                    </div>

                    <div style={{ marginTop: 19 }}>
                      <p className="revision-small-label">PERMINTAAN REVISI</p>
                      <div
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          background: "#f7f4ee",
                          color: "#555",
                          lineHeight: 1.8,
                          fontSize: 13,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {revision.customer_note || "Tidak ada catatan revisi."}
                      </div>
                    </div>

                    {revision.admin_note && (
                      <div style={{ marginTop: 15 }}>
                        <p className="revision-small-label" style={{ color: "#214d32" }}>
                          CATATAN PAJARA STUDIO
                        </p>
                        <div
                          style={{
                            padding: 14,
                            borderRadius: 12,
                            background: "#f0f5f0",
                            color: "#3f5144",
                            lineHeight: 1.8,
                            fontSize: 13,
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
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

        <footer style={{ color: "#8b887f", fontSize: 12, textAlign: "center", padding: "28px 0 6px" }}>
          <span style={{ color: "#2f6b45", fontWeight: 700 }}>PAJARA STUDIO</span>
          <p style={{ margin: "7px 0 0" }}>Desain yang punya arah.</p>
        </footer>
      </div>
      <RevisionStyles />
    </main>
  );
}

function RevisionFallback() {
  return <RevisionLoading />;
}

export default function RevisionPage() {
  return (
    <Suspense fallback={<RevisionFallback />}>
      <RevisionContent />
    </Suspense>
  );
}
