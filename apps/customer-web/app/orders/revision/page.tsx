
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@pajara/supabase";
import CustomerLoading from "../components/CustomerLoading";

const REVISION_PRICE = 15000;
const EXTRA_REVISIONS = 2;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const QRIS_IMAGE =
  "/qr_ID1026470184411_08.10.26_1791447334_1791447334905.jpeg";

const LOGO =
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

/* =========================
   SHARED STYLES
========================= */

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f7f4ee",
  padding: "0 18px 55px",
  boxSizing: "border-box",
  color: "#1d2a22",
  fontFamily: '"DM Sans", Arial, sans-serif',
};

const containerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 760,
  margin: "0 auto",
  paddingTop: 30,
};

const navbarStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  width: "calc(100% + 36px)",
  marginLeft: -18,
  borderBottom: "1px solid rgba(47,107,69,.1)",
  background: "rgba(247,244,238,.88)",
  backdropFilter: "blur(22px) saturate(160%)",
  WebkitBackdropFilter: "blur(22px) saturate(160%)",
};

const navbarInnerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 796,
  minHeight: 66,
  padding: "0 18px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  boxSizing: "border-box",
};

const navbarBrandStyle: CSSProperties = {
  display: "inline-flex",
  minWidth: 0,
  alignItems: "center",
  gap: 10,
  color: "#214d32",
  fontSize: 15,
  fontWeight: 800,
  textDecoration: "none",
};

const navbarLogoStyle: CSSProperties = {
  display: "block",
  width: 39,
  height: 39,
  minWidth: 39,
  borderRadius: 12,
  objectFit: "cover",
};

const navbarBackStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  flexShrink: 0,
  padding: "10px 13px",
  border: "1px solid rgba(47,107,69,.16)",
  borderRadius: 10,
  background: "rgba(255,255,255,.72)",
  color: "#214d32",
  fontSize: 11,
  fontWeight: 800,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const cardStyle: CSSProperties = {
  marginTop: 20,
  padding: 26,
  background: "#fff",
  borderRadius: 20,
  border: "1px solid #e8e2d8",
  boxShadow: "0 6px 22px rgba(33,77,50,.035)",
};

const pageHeaderStyle: CSSProperties = {
  margin: "0 0 24px",
};

const eyebrowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "0 0 10px",
  color: "#8a6a4a",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.18em",
};

const eyebrowDotStyle: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: "#2f6b45",
};

const pageHeadingStyle: CSSProperties = {
  margin: "0 0 9px",
  color: "#214d32",
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: "clamp(30px, 6vw, 39px)",
  lineHeight: 1.25,
  fontWeight: 600,
};

const bodyTextStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#707970",
  fontSize: 13,
  lineHeight: 1.8,
};

const sectionEyebrowStyle: CSSProperties = {
  margin: "0 0 7px",
  color: "#8a6a4a",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.14em",
};

const sectionHeadingStyle: CSSProperties = {
  margin: "0 0 15px",
  color: "#214d32",
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: 22,
  lineHeight: 1.35,
  fontWeight: 600,
};

const mutedTextStyle: CSSProperties = {
  color: "#707970",
  fontSize: 13,
  lineHeight: 1.8,
};

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: 8,
  color: "#214d32",
  fontSize: 13,
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  border: "1px solid #ded8cd",
  borderRadius: 12,
  background: "#fff",
  color: "#303630",
  fontFamily: "inherit",
  fontSize: 13,
};

const primaryButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: 48,
  padding: "14px 18px",
  border: "1px solid #2f6b45",
  borderRadius: 12,
  background: "#2f6b45",
  color: "#fff",
  fontSize: 13,
  fontWeight: 800,
  textAlign: "center",
  cursor: "pointer",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const noticeTextStyle: CSSProperties = {
  margin: "6px 0 0",
  fontSize: 13,
  lineHeight: 1.8,
};

const successStyle: CSSProperties = {
  marginTop: 18,
  padding: "16px 18px",
  borderRadius: 14,
  background: "#edf6ef",
  border: "1px solid #c8dfcc",
  color: "#214d32",
  fontSize: 13,
  lineHeight: 1.7,
};

const errorStyle: CSSProperties = {
  marginTop: 18,
  padding: "16px 18px",
  borderRadius: 14,
  background: "#fff3f0",
  border: "1px solid #ead0c9",
  color: "#8a3d2f",
  fontSize: 13,
  lineHeight: 1.7,
};

const footerStyle: CSSProperties = {
  borderTop: "1px solid #e4ddd1",
  paddingTop: 22,
  marginTop: 36,
};

const footerBrandRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 13,
};

const footerLogoStyle: CSSProperties = {
  width: 43,
  height: 43,
  flexShrink: 0,
  objectFit: "contain",
  borderRadius: 10,
  background: "#fff",
};

const footerTitleStyle: CSSProperties = {
  color: "#214d32",
  fontSize: 13,
};

const footerTaglineStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "#8a6a4a",
  fontSize: 11,
};

const footerCopyrightStyle: CSSProperties = {
  margin: "20px 0 0",
  paddingTop: 14,
  borderTop: "1px solid #e9e3d9",
  color: "#999387",
  fontSize: 10,
  lineHeight: 1.7,
};

/* =========================
   NAVBAR
========================= */

function RevisionNavbar({ orderId = "" }: { orderId?: string }) {
  return (
    <nav style={navbarStyle}>
      <div style={navbarInnerStyle}>
        <a href="/dashboard" style={navbarBrandStyle}>
          <Image
            src={LOGO}
            alt="Logo Pajara Studio"
            width={39}
            height={39}
            priority
            unoptimized
            style={navbarLogoStyle}
          />
          <span>Pajara Studio</span>
        </a>

        <a
          href={orderId ? `/orders?id=${orderId}` : "/orders"}
          style={navbarBackStyle}
        >
          <span aria-hidden="true">←</span>
          Kembali ke Pesanan
        </a>
      </div>
    </nav>
  );
}

/* =========================
   LOADING PAJARA
========================= */

function RevisionLoading() {
  return (
    <CustomerLoading
      title="Menyiapkan Revisi"
      description="Sebentar, kami sedang menyiapkan informasi revisimu."
    />
  );
}

/* =========================
   GLOBAL STYLES
========================= */

function RevisionGlobalStyles() {
  return (
    <style jsx global>{`
      .revision-page * {
        box-sizing: border-box;
      }

      .revision-quota-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: 22px;
      }

      .revision-quota-card {
        min-width: 0;
        padding: 17px;
        border: 1px solid #e8e2d8;
        border-radius: 15px;
        background: #faf8f3;
      }

      .revision-quota-card p {
        margin: 9px 0 0;
        color: #777970;
        font-size: 12px;
        line-height: 1.7;
      }

      .revision-quota-number {
        display: block;
        margin-top: 12px;
        color: #214d32;
        font-family: Georgia, serif;
        font-size: 29px;
        line-height: 1.2;
      }

      .revision-history-card {
        padding: 18px;
        border: 1px solid #e8e2d8;
        border-radius: 15px;
        background: #fff;
      }

      .revision-small-label {
        margin: 0 0 7px;
        color: #8a6a4a;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .12em;
      }

      .revision-empty {
        padding: 22px;
        border: 1px dashed #d7cfc1;
        border-radius: 14px;
        background: #faf8f3;
      }

      .revision-page input:focus,
      .revision-page textarea:focus,
      .revision-page select:focus {
        outline: 2px solid rgba(47,107,69,.18);
        border-color: #2f6b45;
      }

      .revision-page button:disabled {
        opacity: .55;
        cursor: not-allowed;
      }

      .revision-page button,
      .revision-page a {
        -webkit-tap-highlight-color: transparent;
        transition:
          background 160ms ease,
          border-color 160ms ease,
          box-shadow 160ms ease,
          transform 160ms ease;
      }

      .revision-page button:active,
      .revision-page a:active {
        transform: scale(.99);
      }

      @media (hover: hover) {
        .revision-page button:hover:not(:disabled),
        .revision-page a:hover {
          box-shadow: 0 7px 20px rgba(33,77,50,.08);
        }
      }

      @media (max-width: 600px) {
        .revision-container {
          padding-top: 24px !important;
        }

        .revision-card {
          padding: 20px !important;
          border-radius: 17px !important;
        }

        .revision-quota-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 420px) {
        .revision-navbar-inner {
          gap: 8px !important;
        }

        .revision-navbar-brand span {
          font-size: 13px;
        }

        .revision-navbar-back {
          padding: 9px 10px !important;
          font-size: 10px !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: .01ms !important;
          transition-duration: .01ms !important;
        }
      }
    `}</style>
  );
}

/* =========================
   MAIN CONTENT
========================= */

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
      <main style={pageStyle} className="revision-page">
        <RevisionNavbar />

        <div style={containerStyle} className="revision-container">
          <section style={cardStyle} className="revision-card">
            <p style={sectionEyebrowStyle}>PAJARA STUDIO</p>
            <h1 style={pageHeadingStyle}>Pesanan tidak ditemukan</h1>
            <p style={bodyTextStyle}>
              {error ||
                "Pesanan yang kamu cari tidak tersedia atau bukan milik akun ini."}
            </p>

            <a
              href="/orders"
              style={{
                ...primaryButtonStyle,
                marginTop: 22,
                textDecoration: "none",
              }}
            >
              Buka Daftar Pesanan →
            </a>
          </section>
        </div>

        <RevisionGlobalStyles />
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
    <main className="revision-page" style={pageStyle}>
      <RevisionNavbar orderId={order.id} />

      <div style={containerStyle} className="revision-container">
        <header style={pageHeaderStyle}>
          <p style={eyebrowStyle}>
            <span style={eyebrowDotStyle} />
            PAJARA STUDIO
          </p>

          <h1 style={pageHeadingStyle}>Pengajuan Revisi</h1>

          <p style={bodyTextStyle}>
            Ajukan perubahan desain dan pantau proses revisimu melalui halaman
            ini.
          </p>
        </header>

        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: 18,
            marginBottom: 20,
            border: "1px solid #e8e2d8",
            borderRadius: 18,
            background: "#fff",
            boxShadow: "0 5px 17px rgba(33,77,50,.035)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              borderRadius: 15,
              background: "#edf3ec",
              color: "#2f6b45",
            }}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M8 8h8M8 12h8M8 16h4" />
            </svg>
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                margin: "0 0 5px",
                color: "#8a6a4a",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: ".09em",
              }}
            >
              {order.order_code}
            </p>

            <h2
              style={{
                margin: 0,
                color: "#214d32",
                fontSize: 16,
                lineHeight: 1.5,
                fontWeight: 800,
              }}
            >
              {order.service_name || "Layanan Pajara Studio"}
            </h2>

            <p style={{ margin: "4px 0 0", color: "#777970", fontSize: 11 }}>
              {order.quantity} desain
            </p>
          </div>
        </section>

        {error && (
          <div style={errorStyle} role="alert">
            <strong>Perlu diperhatikan</strong>
            <p style={noticeTextStyle}>{error}</p>
          </div>
        )}

        {success && (
          <div style={successStyle} role="status">
            <strong>Informasi</strong>
            <p style={noticeTextStyle}>{success}</p>
          </div>
        )}

        <section style={cardStyle} className="revision-card">
          <p style={sectionEyebrowStyle}>RINGKASAN</p>
          <h2 style={sectionHeadingStyle}>Kuota Revisi</h2>

          <p style={bodyTextStyle}>
            Paket saat ini:{" "}
            <strong style={{ color: "#214d32" }}>{planLabel}</strong>. Setiap
            desain memiliki kuota revisi masing-masing. Kuota gratis digunakan
            terlebih dahulu.
          </p>

          <div className="revision-quota-grid">
            {Array.from({ length: order.quantity }, (_, index) => {
              const designNumber = index + 1;
              const freeRemaining = getFreeQuotaRemaining(designNumber);
              const extraRemaining = getQuotaForDesign(designNumber);
              const pending = getPendingPurchases(designNumber);
              const hasQuota = freeRemaining > 0 || extraRemaining > 0;

              return (
                <div className="revision-quota-card" key={designNumber}>
                  <p className="revision-small-label">RINGKASAN DESAIN</p>

                  <strong style={{ color: "#214d32", fontSize: 14 }}>
                    Desain #{designNumber}
                  </strong>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginTop: 14,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: "block",
                          color: "#85877f",
                          fontSize: 10,
                          lineHeight: 1.5,
                        }}
                      >
                        Gratis tersisa
                      </span>
                      <strong className="revision-quota-number">
                        {freeRemaining}
                      </strong>
                    </div>

                    <div>
                      <span
                        style={{
                          display: "block",
                          color: "#85877f",
                          fontSize: 10,
                          lineHeight: 1.5,
                        }}
                      >
                        Tambahan tersisa
                      </span>
                      <strong className="revision-quota-number">
                        {extraRemaining}
                      </strong>
                    </div>
                  </div>

                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 14,
                      padding: "6px 10px",
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 800,
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
                    <p style={{ marginTop: 10, color: "#8a6a4a" }}>
                      {pending} pembayaran menunggu verifikasi
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 12,
              background: "#f7f4ee",
              border: "1px solid #e8e2d8",
              color: "#777970",
              fontSize: 12,
              lineHeight: 1.8,
            }}
          >
            <strong style={{ color: "#214d32" }}>Informasi kuota</strong>
            <p style={{ margin: "5px 0 0" }}>
              Revisi yang masih menunggu atau sedang diproses belum dihitung
              sebagai revisi selesai.
            </p>
          </div>
        </section>

        <section style={cardStyle} className="revision-card">
          <p style={sectionEyebrowStyle}>LANGKAH 01</p>
          <h2 style={sectionHeadingStyle}>Ajukan Revisi</h2>

          <p style={bodyTextStyle}>
            Pilih desain yang ingin diperbaiki, lalu jelaskan perubahan yang
            kamu inginkan secara terperinci.
          </p>

          {!canSubmit && (
            <div
              style={{
                marginTop: 18,
                padding: 15,
                borderRadius: 12,
                background: "#fff5e4",
                border: "1px solid #f0dfc0",
                color: "#80613e",
                fontSize: 12,
                lineHeight: 1.8,
              }}
            >
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
              marginTop: 16,
              marginBottom: 22,
              padding: 16,
              borderRadius: 13,
              background:
                selectedSource === "none" ? "#fff3f0" : "#f1f7f2",
              border: `1px solid ${
                selectedSource === "none" ? "#ead0c9" : "#c8dfcc"
              }`,
              color: selectedSource === "none" ? "#8a3d2f" : "#435b48",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            {selectedSource === "free" ? (
              <>
                <strong style={{ color: "#214d32" }}>
                  Menggunakan kuota revisi gratis
                </strong>
                <p style={{ margin: "5px 0 0" }}>
                  Desain #{selectedDesign} masih memiliki{" "}
                  <strong>{selectedFreeRemaining} revisi gratis</strong>.
                  Kamu tidak perlu melakukan pembayaran tambahan.
                </p>
              </>
            ) : selectedSource === "extra" ? (
              <>
                <strong style={{ color: "#214d32" }}>
                  Menggunakan kuota revisi tambahan
                </strong>
                <p style={{ margin: "5px 0 0" }}>
                  Tersedia{" "}
                  <strong>{selectedExtraRemaining} revisi tambahan</strong>{" "}
                  yang sudah diverifikasi admin.
                </p>
              </>
            ) : (
              <>
                <strong>Kuota revisi desain ini habis.</strong>
                <p style={{ margin: "5px 0 0" }}>
                  Kamu bisa berhenti tanpa membeli tambahan, atau membeli{" "}
                  {EXTRA_REVISIONS} revisi tambahan seharga{" "}
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
            rows={6}
            disabled={submitting || revisionLocked}
            style={{
              ...inputStyle,
              resize: "vertical",
              lineHeight: 1.7,
              background: revisionLocked ? "#f3f0eb" : "#fff",
            }}
          />

          <p
            style={{
              margin: "8px 0 0",
              color: "#8b887f",
              fontSize: 11,
              lineHeight: 1.7,
            }}
          >
            Jelaskan perubahan yang diinginkan secara spesifik. Minimal 5
            karakter.
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
              marginTop: 20,
            }}
          >
            {submitting
              ? "Mengajukan revisi..."
              : revisionLocked
                ? "Kuota Revisi Tidak Tersedia"
                : "Ajukan Revisi →"}
          </button>
        </section>

        <section style={cardStyle} className="revision-card">
          <p style={sectionEyebrowStyle}>LANGKAH 02 · OPSIONAL</p>
          <h2 style={sectionHeadingStyle}>Beli Kuota Tambahan</h2>

          <p style={bodyTextStyle}>
            Jika kuota revisi gratis sudah habis, kamu dapat membeli kuota
            tambahan untuk desain tertentu.
          </p>

          <div
            style={{
              marginTop: 18,
              padding: 17,
              borderRadius: 14,
              background: "#f7f4ee",
              border: "1px solid #e8e2d8",
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                color: "#8a6a4a",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: ".12em",
              }}
            >
              PAKET REVISI TAMBAHAN
            </p>

            <strong
              style={{
                display: "block",
                color: "#214d32",
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 27,
              }}
            >
              {formatRupiah(REVISION_PRICE)}
            </strong>

            <p
              style={{
                margin: "5px 0 0",
                color: "#777970",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              Mendapatkan {EXTRA_REVISIONS} kali revisi tambahan untuk satu
              desain.
            </p>
          </div>

          {order.status !== "completed" && (
            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 12,
                background: "#fff5e4",
                border: "1px solid #f0dfc0",
                color: "#80613e",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              Pembelian kuota tersedia setelah pesanan berstatus selesai.
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <label htmlFor="purchase-design" style={labelStyle}>
              Kuota untuk Desain
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
                <option key={index + 1} value={String(index + 1)}>
                  Desain #{index + 1}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 24 }}>
            <p
              style={{
                margin: "0 0 12px",
                color: "#214d32",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Pembayaran melalui QRIS
            </p>

            <div
              style={{
                maxWidth: 360,
                margin: "0 auto",
                padding: 12,
                border: "1px solid #e8e2d8",
                borderRadius: 14,
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
                  borderRadius: 10,
                }}
              />
            </div>

            <p style={{ ...bodyTextStyle, fontSize: 12 }}>
              Scan QRIS di atas dan bayar tepat sebesar{" "}
              <strong style={{ color: "#214d32" }}>
                {formatRupiah(REVISION_PRICE)}
              </strong>
              . Simpan bukti pembayaran sebelum melanjutkan.
            </p>
          </div>

          <div style={{ marginTop: 22 }}>
            <label htmlFor="revision-payment-proof" style={labelStyle}>
              Bukti Pembayaran
            </label>

            <div
              style={{
                padding: 17,
                borderRadius: 14,
                background: "#f7f4ee",
                border: "1px dashed #cfc5b7",
              }}
            >
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
                style={{ width: "100%", fontSize: 12 }}
              />

              <p
                style={{
                  margin: "10px 0 0",
                  color: "#777970",
                  fontSize: 11,
                  lineHeight: 1.7,
                }}
              >
                Format JPG, PNG, WEBP, atau PDF. Maksimal 10 MB.
              </p>
            </div>

            {paymentProof && (
              <div
                style={{
                  display: "grid",
                  gap: 5,
                  marginTop: 12,
                  padding: 13,
                  borderRadius: 11,
                  background: "#edf6ef",
                  color: "#214d32",
                  fontSize: 12,
                  overflowWrap: "anywhere",
                }}
              >
                <span>File dipilih</span>
                <strong>{paymentProof.name}</strong>
              </div>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gap: 14,
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid #eee7dd",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ color: "#777970", fontSize: 12 }}>
                Total pembayaran
              </span>

              <strong
                style={{
                  color: "#214d32",
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 22,
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
              style={primaryButtonStyle}
            >
              {purchaseSubmitting
                ? "Mengirim pembayaran..."
                : "Kirim Bukti Pembayaran →"}
            </button>

            <p
              style={{
                margin: 0,
                color: "#8b887f",
                fontSize: 11,
                lineHeight: 1.7,
                textAlign: "center",
              }}
            >
              Kuota tambahan akan aktif setelah pembayaran diverifikasi oleh
              Admin Pajara Studio.
            </p>
          </div>
        </section>

        {activeRevision && (
          <section
            style={{
              ...cardStyle,
              background: "#f1f7f2",
              borderColor: "#c8dfcc",
            }}
            className="revision-card"
          >
            <p style={sectionEyebrowStyle}>STATUS SAAT INI</p>

            <h2 style={sectionHeadingStyle}>Revisi Sedang Diproses</h2>

            <p style={bodyTextStyle}>
              Revisi #{activeRevision.revision_number}
              {activeRevision.design_number
                ? ` untuk Desain #${activeRevision.design_number}`
                : ""}{" "}
              sedang diproses oleh tim Pajara Studio. Tunggu sampai revisi
              selesai sebelum mengajukan revisi berikutnya.
            </p>

            <div
              style={{
                display: "inline-block",
                marginTop: 15,
                padding: "7px 11px",
                borderRadius: 99,
                background: "#e0efe5",
                color: "#214d32",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {getRevisionStatusLabel(activeRevision.status)}
            </div>
          </section>
        )}

        <section style={cardStyle} className="revision-card">
          <p style={sectionEyebrowStyle}>AKTIVITAS PESANAN</p>
          <h2 style={sectionHeadingStyle}>Riwayat Revisi</h2>

          <p style={bodyTextStyle}>
            Semua pengajuan dan perkembangan revisi pesananmu tercatat di sini.
          </p>

          {revisions.length === 0 ? (
            <div className="revision-empty" style={{ marginTop: 20 }}>
              <strong style={{ color: "#214d32", fontSize: 13 }}>
                Belum ada revisi
              </strong>

              <p
                style={{
                  color: "#777970",
                  margin: "6px 0 0",
                  fontSize: 12,
                  lineHeight: 1.7,
                }}
              >
                Riwayat pengajuan revisi akan muncul di sini setelah kamu
                mengirim pengajuan pertama.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 14,
                marginTop: 20,
              }}
            >
              {revisions.map((revision) => {
                const statusStyle = getRevisionStatusStyle(revision.status);

                return (
                  <article
                    key={revision.id}
                    className="revision-history-card"
                  >
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
                        <strong
                          style={{
                            color: "#214d32",
                            fontSize: 14,
                          }}
                        >
                          Revisi #{revision.revision_number}
                        </strong>

                        {revision.design_number && (
                          <p
                            style={{
                              margin: "5px 0 0",
                              color: "#8a6a4a",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            Desain #{revision.design_number}
                          </p>
                        )}

                        <p
                          style={{
                            color: "#888",
                            fontSize: 11,
                            margin: "7px 0 0",
                          }}
                        >
                          {formatDate(revision.created_at)}
                        </p>
                      </div>

                      <span
                        style={{
                          ...statusStyle,
                          display: "inline-block",
                          padding: "7px 10px",
                          borderRadius: 99,
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        {getRevisionStatusLabel(revision.status)}
                      </span>
                    </div>

                    <div style={{ marginTop: 18 }}>
                      <p className="revision-small-label">
                        PERMINTAAN REVISI
                      </p>

                      <div
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          background: "#f7f4ee",
                          color: "#555",
                          lineHeight: 1.8,
                          fontSize: 12,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {revision.customer_note ||
                          "Tidak ada catatan revisi."}
                      </div>
                    </div>

                    {revision.admin_note && (
                      <div style={{ marginTop: 15 }}>
                        <p
                          className="revision-small-label"
                          style={{ color: "#214d32" }}
                        >
                          CATATAN PAJARA STUDIO
                        </p>

                        <div
                          style={{
                            padding: 14,
                            borderRadius: 12,
                            background: "#f0f5f0",
                            color: "#3f5144",
                            lineHeight: 1.8,
                            fontSize: 12,
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

        <footer style={footerStyle}>
          <div style={footerBrandRowStyle}>
            <Image
              src={LOGO}
              alt="Logo Pajara Studio"
              width={43}
              height={43}
              unoptimized
              style={footerLogoStyle}
            />

            <div>
              <strong style={footerTitleStyle}>Pajara Studio</strong>

              <p style={footerTaglineStyle}>
                Berakar di Tanah Pasundan.
              </p>
            </div>
          </div>

          <p style={footerCopyrightStyle}>
            © 2026 Pajara Studio. Desain yang punya arah.
          </p>
        </footer>
      </div>

      <RevisionGlobalStyles />
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
