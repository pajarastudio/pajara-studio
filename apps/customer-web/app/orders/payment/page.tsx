"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@pajara/supabase";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  total_amount: number | null;
  dp_amount: number | null;
  remaining_amount: number | null;
  status: string | null;
};

type Payment = {
  id: string;
  order_id: string;
  payment_method: string | null;
  payment_type: string | null;
  amount: number | null;
  proof_file_id: string | null;
  status: string | null;
  created_at: string | null;
};

const LOGO =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

const QRIS_IMAGE =
  "/qr_ID1026470184411_08.10.26_1791447334_1791447334905.jpeg";

const PAYMENT_METHODS = [
  {
    name: "QRIS",
    description: "Bayar menggunakan QRIS",
    account: "A/N Pajara Studio",
    note: "Scan QRIS Pajara Studio untuk melakukan pembayaran.",
  },
  {
    name: "DANA",
    description: "Bayar menggunakan DANA",
    account: "0858-8242-1145",
    owner: "A/N TUTI",
  },
  {
    name: "GoPay",
    description: "Bayar menggunakan GoPay",
    account: "0858-8242-1145",
    owner: "A/N TUTI",
  },
  {
    name: "SeaBank",
    description: "Transfer melalui SeaBank",
    account: "901052450932",
    owner: "A/N TUTI",
  },
];

function formatRupiah(value: number | null) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getPaymentStatus(payment: Payment | null) {
  if (!payment) return null;

  switch (payment.status) {
    case "pending":
      return "Menunggu Verifikasi";
    case "verified":
      return "Pembayaran Terverifikasi";
    case "rejected":
      return "Pembayaran Ditolak";
    default:
      return payment.status || "Menunggu";
  }
}

function PaymentLoading() {
  return (
    <main style={pageStyle}>
      <section style={loadingCardStyle}>
        <div style={loadingLogoFrameStyle}>
          <Image
            src={LOGO}
            alt="Logo Pajara Studio"
            width={76}
            height={76}
            priority
            unoptimized
            style={loadingLogoStyle}
          />
        </div>

        <p style={loadingEyebrowStyle}>PAJARA STUDIO</p>
        <h1 style={loadingTitleStyle}>Menyiapkan pembayaran</h1>
        <div style={loadingSpinnerStyle} />

        <p style={loadingTextStyle}>
          Sebentar, kami sedang menyiapkan informasi pembayaranmu.
        </p>

        <div style={loadingDividerStyle} />

        <p style={loadingTaglineStyle}>Berakar di Tanah Pasundan.</p>
      </section>

      <style jsx>{`
        @keyframes paymentSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes paymentFade {
          from {
            opacity: 0;
            transform: translateY(9px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

function BackToOrders({ orderId }: { orderId: string }) {
  return (
    <a href={orderId ? `/orders?id=${orderId}` : "/orders"} style={backCardStyle}>
      <span style={backIconStyle} aria-hidden="true">
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
          <path d="M9 12h11" />
        </svg>
      </span>

      <span style={{ flex: 1 }}>
        <span style={backCaptionStyle}>NAVIGASI PESANAN</span>
        <span style={backTitleStyle}>Kembali ke Pesanan</span>
      </span>

      <span style={backArrowStyle} aria-hidden="true">
        →
      </span>
    </a>
  );
}

function PaymentMethodDetails({
  method,
  amount,
  typeLabel,
}: {
  method: string;
  amount: number | null;
  typeLabel: string;
}) {
  if (method === "QRIS") {
    return (
      <div style={detailBox}>
        <p style={detailTitle}>QRIS Pajara Studio</p>

        <img
          src={QRIS_IMAGE}
          alt="QRIS Pajara Studio"
          style={{
            display: "block",
            width: "100%",
            maxWidth: "360px",
            height: "auto",
            margin: "0 auto",
            borderRadius: "12px",
            background: "#fff",
          }}
        />

        <p style={detailDescription}>
          Scan QRIS untuk membayar {typeLabel.toLowerCase()} sebesar{" "}
          <strong style={{ color: "#214d32" }}>
            {formatRupiah(amount)}
          </strong>
          .
          <br />
          A/N Pajara Studio
        </p>
      </div>
    );
  }

  const account =
    method === "DANA" || method === "GoPay"
      ? "0858-8242-1145"
      : method === "SeaBank"
        ? "901052450932"
        : null;

  if (!account) return null;

  return (
    <div style={detailBox}>
      <p style={detailTitle}>Detail {method}</p>

      <div
        style={{
          color: "#214d32",
          fontSize: "18px",
          fontWeight: 700,
          wordBreak: "break-word",
        }}
      >
        {account}
      </div>

      <div
        style={{
          marginTop: "4px",
          color: "#777",
          fontSize: "13px",
        }}
      >
        A/N TUTI
      </div>

      <p style={detailDescription}>
        Nominal {typeLabel.toLowerCase()}:{" "}
        <strong style={{ color: "#214d32" }}>
          {formatRupiah(amount)}
        </strong>
      </p>
    </div>
  );
}

const detailBox: React.CSSProperties = {
  marginTop: "24px",
  padding: "20px",
  borderRadius: "14px",
  background: "#f7f4ee",
  border: "1px solid #e8e2d8",
  textAlign: "center",
};

const detailTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "14px",
  color: "#214d32",
  fontWeight: 700,
};

const detailDescription: React.CSSProperties = {
  marginTop: "14px",
  marginBottom: 0,
  color: "#666",
  fontSize: "13px",
  lineHeight: 1.7,
};

const cardStyle: React.CSSProperties = {
  marginTop: "20px",
  background: "#fff",
  borderRadius: "20px",
  padding: "26px",
  border: "1px solid #e8e2d8",
  boxShadow: "0 6px 22px rgba(33,77,50,.035)",
};

function PaymentContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isSubscriptionOrder, setIsSubscriptionOrder] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError("");

      if (!id) {
        if (mounted) {
          setError("ID pesanan tidak ditemukan.");
          setLoading(false);
        }
        return;
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (authError || !user) {
        setError("Sesi login tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          "id, order_code, service_name, total_amount, dp_amount, remaining_amount, status"
        )
        .eq("id", id)
        .eq("customer_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (orderError || !orderData) {
        setError(
          orderError?.message ||
            "Pesanan tidak ditemukan atau bukan milik akun ini."
        );
        setLoading(false);
        return;
      }

      const {
        data: subscriptionRequest,
        error: subscriptionError,
      } = await supabase
        .from("subscription_requests")
        .select("id")
        .eq("order_id", orderData.id)
        .maybeSingle();

      if (!mounted) return;

      if (subscriptionError) {
        setError(
          "Jenis pesanan belum dapat diverifikasi. Silakan muat ulang halaman."
        );
        setLoading(false);
        return;
      }

      if (subscriptionRequest) {
        setIsSubscriptionOrder(true);
        setOrder(orderData);
        setPayment(null);
        setLoading(false);
        return;
      }

      setIsSubscriptionOrder(false);
      setOrder(orderData);

      const paymentType =
        orderData.status === "waiting_dp"
          ? "DP"
          : orderData.status === "waiting_payment"
            ? "Pelunasan"
            : null;

      if (paymentType) {
        const { data: paymentData, error: paymentError } = await supabase
          .from("payments")
          .select(
            "id, order_id, payment_method, payment_type, amount, proof_file_id, status, created_at"
          )
          .eq("order_id", orderData.id)
          .eq("payment_type", paymentType)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!mounted) return;

        if (paymentError) {
          setError(
            "Data pembayaran belum dapat dimuat: " + paymentError.message
          );
          setLoading(false);
          return;
        }

        setPayment(paymentData || null);
        setSelectedMethod(paymentData?.payment_method || "");
      } else {
        setPayment(null);
        setSelectedMethod("");
      }

      setLoading(false);
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, [id]);

  const isWaitingDP = order?.status === "waiting_dp";
  const isWaitingSettlement = order?.status === "waiting_payment";

  const paymentType = isWaitingDP
    ? "DP"
    : isWaitingSettlement
      ? "Pelunasan"
      : null;

  const typeLabel = isWaitingDP ? "Pembayaran DP" : "Pelunasan";

  const amountDue = isWaitingDP
    ? order?.dp_amount
    : isWaitingSettlement
      ? order?.remaining_amount
      : null;

  const paymentStatus = getPaymentStatus(payment);
  const hasProof = Boolean(payment?.proof_file_id);

  const selectedPaymentMethod = PAYMENT_METHODS.find(
    (method) => method.name === selectedMethod
  );

  async function createPayment() {
    if (
      !order ||
      !paymentType ||
      amountDue === null ||
      amountDue === undefined
    ) {
      setError("Tahap pembayaran tidak valid. Silakan muat ulang halaman.");
      return null;
    }

    if (amountDue <= 0) {
      setError("Nominal pembayaran belum tersedia. Hubungi Pajara Studio.");
      return null;
    }

    if (!selectedMethod) {
      setError("Silakan pilih metode pembayaran terlebih dahulu.");
      return null;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Sesi login tidak ditemukan. Silakan login kembali.");
      return null;
    }

    const { data: latestOrder, error: latestOrderError } = await supabase
      .from("orders")
      .select("status, dp_amount, remaining_amount")
      .eq("id", order.id)
      .eq("customer_id", user.id)
      .maybeSingle();

    if (latestOrderError || !latestOrder) {
      setError("Status pesanan gagal diperiksa. Silakan coba lagi.");
      return null;
    }

    const statusMatches =
      (paymentType === "DP" && latestOrder.status === "waiting_dp") ||
      (paymentType === "Pelunasan" &&
        latestOrder.status === "waiting_payment");

    if (!statusMatches) {
      setError(
        "Status pesanan sudah berubah. Muat ulang halaman sebelum melanjutkan."
      );
      return null;
    }

    const latestAmount =
      paymentType === "DP"
        ? latestOrder.dp_amount
        : latestOrder.remaining_amount;

    if (!latestAmount || latestAmount <= 0) {
      setError("Nominal tagihan belum tersedia. Hubungi Pajara Studio.");
      return null;
    }

    const { data: existingPayment, error: existingError } = await supabase
      .from("payments")
      .select(
        "id, order_id, payment_method, payment_type, amount, proof_file_id, status, created_at"
      )
      .eq("order_id", order.id)
      .eq("payment_type", paymentType)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      setError(existingError.message);
      return null;
    }

    if (existingPayment) {
      setPayment(existingPayment);
      setSelectedMethod(existingPayment.payment_method || "");
      return existingPayment;
    }

    const { data, error: insertError } = await supabase
      .from("payments")
      .insert({
        order_id: order.id,
        payment_method: selectedMethod,
        payment_type: paymentType,
        amount: latestAmount,
        status: "pending",
      })
      .select(
        "id, order_id, payment_method, payment_type, amount, proof_file_id, status, created_at"
      )
      .single();

    if (insertError || !data) {
      setError(
        insertError?.message ||
          "Pembayaran gagal dibuat. Silakan coba lagi."
      );
      return null;
    }

    setPayment(data);
    return data;
  }

  async function handleCreatePayment() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const createdPayment = await createPayment();

      if (createdPayment) {
        setMessage(
          "Metode pembayaran berhasil disimpan. Silakan bayar sesuai nominal, lalu unggah bukti pembayaran."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat pembayaran."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadProof() {
    if (!order || !payment) {
      setError("Buat pembayaran terlebih dahulu sebelum mengunggah bukti.");
      return;
    }

    if (!proofFile) {
      setError("Silakan pilih bukti pembayaran terlebih dahulu.");
      return;
    }

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ].includes(proofFile.type)
    ) {
      setError("Format bukti pembayaran harus JPG, PNG, WEBP, atau PDF.");
      return;
    }

    if (proofFile.size > 10 * 1024 * 1024) {
      setError("Ukuran bukti pembayaran maksimal 10 MB.");
      return;
    }

    if (payment.status === "verified") {
      setError("Pembayaran ini sudah terverifikasi.");
      return;
    }

    setUploadingProof(true);
    setError("");
    setMessage("");

    let uploadedPath: string | null = null;
    let orderFileId: string | null = null;

    try {
      const safeFileName = proofFile.name
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-");

      const filePath =
        `orders/${order.id}/payment-proof/` +
        `${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("pajara-files")
        .upload(filePath, proofFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: proofFile.type,
        });

      if (uploadError) throw uploadError;
      uploadedPath = filePath;

      const { data: orderFile, error: orderFileError } = await supabase
        .from("order_files")
        .insert({
          order_id: order.id,
          revision_id: null,
          file_name: proofFile.name,
          file_path: filePath,
          file_type: proofFile.type,
          file_size: proofFile.size,
          file_category: "payment_proof",
        })
        .select("id")
        .single();

      if (orderFileError || !orderFile) {
        throw new Error(
          orderFileError?.message || "Data bukti pembayaran gagal disimpan."
        );
      }

      orderFileId = orderFile.id;

      const { data: updatedPayment, error: updatePaymentError } =
        await supabase
          .from("payments")
          .update({
            proof_file_id: orderFile.id,
            status: "pending",
          })
          .eq("id", payment.id)
          .neq("status", "verified")
          .select(
            "id, order_id, payment_method, payment_type, amount, proof_file_id, status, created_at"
          )
          .maybeSingle();

      if (updatePaymentError || !updatedPayment) {
        throw new Error(
          updatePaymentError?.message ||
            "Bukti gagal dikaitkan. Pembayaran mungkin sudah diverifikasi."
        );
      }

      setPayment(updatedPayment);
      setProofFile(null);
      setMessage(
        "Bukti pembayaran berhasil diunggah. Pembayaran menunggu verifikasi Admin Pajara Studio."
      );
    } catch (err) {
      if (orderFileId) {
        await supabase.from("order_files").delete().eq("id", orderFileId);
      }

      if (uploadedPath) {
        await supabase.storage.from("pajara-files").remove([uploadedPath]);
      }

      setError(
        err instanceof Error
          ? err.message
          : "Bukti pembayaran gagal diunggah. Silakan coba lagi."
      );
    } finally {
      setUploadingProof(false);
    }
  }

  if (loading) {
    return <PaymentLoading />;
  }

  if (!id || !order) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <BackToOrders orderId="" />

          <section style={cardStyle}>
            <h1 style={pageHeadingStyle}>Pesanan tidak ditemukan</h1>
            <p style={bodyTextStyle}>
              {error || "Pesanan tidak tersedia atau bukan milik akun ini."}
            </p>
            <a href="/orders" style={secondaryButtonStyle}>
              Buka Daftar Pesanan →
            </a>
          </section>
        </div>
      </main>
    );
  }

  if (isSubscriptionOrder) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <BackToOrders orderId={order.id} />

          <section style={cardStyle}>
            <p style={eyebrowStyle}>PAJARA PACKAGE</p>
            <h1 style={pageHeadingStyle}>Pesanan Paket</h1>

            <p style={bodyTextStyle}>
              Pesanan ini menggunakan kuota paket. Tidak ada pembayaran
              tambahan per desain melalui halaman ini.
            </p>

            <a href="/subscriptions" style={primaryButtonStyle}>
              Lihat Paket Saya →
            </a>
          </section>
        </div>
      </main>
    );
  }

  const canStartPayment =
    Boolean(paymentType) &&
    amountDue !== null &&
    amountDue !== undefined &&
    amountDue > 0;

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <BackToOrders orderId={order.id} />

        <header style={pageHeaderStyle}>
          <p style={eyebrowStyle}>
            <span style={eyebrowDotStyle} />
            PAJARA STUDIO
          </p>

          <h1 style={pageHeadingStyle}>Pembayaran</h1>

          <p style={bodyTextStyle}>
            Selesaikan pembayaran pesanan dengan langkah yang mudah dan jelas.
          </p>
        </header>

        <section style={orderIdentityCardStyle}>
          <div style={orderIdentityIconStyle}>
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
            <p style={orderCodeStyle}>{order.order_code}</p>
            <h2 style={orderServiceStyle}>
              {order.service_name || "Layanan Pajara Studio"}
            </h2>
          </div>
        </section>

        {message && (
          <div style={successStyle}>
            <strong>Informasi</strong>
            <p style={noticeTextStyle}>{message}</p>
          </div>
        )}

        {error && (
          <div style={errorStyle}>
            <strong>Perlu diperhatikan</strong>
            <p style={noticeTextStyle}>{error}</p>
          </div>
        )}

        <section style={cardStyle}>
          <p style={sectionEyebrowStyle}>RINGKASAN</p>
          <h2 style={sectionHeading}>Ringkasan Pembayaran</h2>

          <div style={summaryListStyle}>
            <div style={summaryRowStyle}>
              <span style={mutedText}>Total Pesanan</span>
              <strong style={strongText}>
                {formatRupiah(order.total_amount)}
              </strong>
            </div>

            <div style={summaryRowStyle}>
              <span style={mutedText}>DP 50%</span>
              <strong style={strongText}>
                {formatRupiah(order.dp_amount)}
              </strong>
            </div>

            <div style={separatorStyle} />

            <div style={summaryRowStyle}>
              <span style={mutedText}>Sisa Pembayaran</span>
              <strong style={highlightAmountStyle}>
                {formatRupiah(order.remaining_amount)}
              </strong>
            </div>
          </div>
        </section>

        {canStartPayment && !payment && (
          <section style={cardStyle}>
            <p style={sectionEyebrowStyle}>LANGKAH 01</p>
            <h2 style={sectionHeading}>
              {isWaitingDP ? "Pembayaran DP" : "Pembayaran Pelunasan"}
            </h2>

            <p style={bodyTextStyle}>
              {isWaitingDP
                ? "Pilih metode untuk membayar DP sebesar "
                : "Pilih metode untuk membayar sisa tagihan sebesar "}
              <strong style={strongText}>
                {formatRupiah(amountDue ?? 0)}
              </strong>
              .
            </p>

            <div style={paymentMethodListStyle}>
              {PAYMENT_METHODS.map((method) => {
                const selected = selectedMethod === method.name;

                return (
                  <button
                    key={method.name}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(method.name);
                      setError("");
                      setMessage("");
                    }}
                    style={{
                      ...paymentMethodCardStyle,
                      border: selected
                        ? "2px solid #2f6b45"
                        : "1px solid #e5ded3",
                      background: selected ? "#f1f7f2" : "#fff",
                    }}
                  >
                    <div style={methodTopStyle}>
                      <div style={{ minWidth: 0 }}>
                        <strong style={methodNameStyle}>{method.name}</strong>
                        <p style={methodDescriptionStyle}>
                          {method.description}
                        </p>
                      </div>

                      <span
                        style={{
                          ...radioStyle,
                          border: selected
                            ? "6px solid #2f6b45"
                            : "2px solid #c9c0b4",
                        }}
                      />
                    </div>

                    <div style={accountBoxStyle}>
                      <span style={accountLabelStyle}>
                        {method.name === "QRIS"
                          ? "PENERIMA"
                          : "NOMOR / REKENING"}
                      </span>

                      <strong style={accountTextStyle}>
                        {method.account}
                      </strong>

                      {method.owner && (
                        <span style={accountOwnerStyle}>{method.owner}</span>
                      )}

                      {method.note && (
                        <span style={accountOwnerStyle}>{method.note}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPaymentMethod && (
              <div style={selectedMethodNoticeStyle}>
                <strong>Metode dipilih: {selectedPaymentMethod.name}</strong>
                <p style={noticeTextStyle}>
                  Nominal {typeLabel.toLowerCase()}:{" "}
                  {formatRupiah(amountDue ?? 0)}
                </p>
              </div>
            )}

            {selectedMethod && (
              <PaymentMethodDetails
                method={selectedMethod}
                amount={amountDue ?? 0}
                typeLabel={typeLabel}
              />
            )}

            <button
              type="button"
              onClick={handleCreatePayment}
              disabled={saving || !selectedMethod}
              style={{
                ...primaryButtonStyle,
                marginTop: "22px",
                opacity: saving || !selectedMethod ? 0.65 : 1,
                cursor:
                  saving || !selectedMethod ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Menyimpan pembayaran..." : "Lanjutkan Pembayaran →"}
            </button>
          </section>
        )}

        {payment && (
          <section style={cardStyle}>
            <p style={sectionEyebrowStyle}>STATUS PEMBAYARAN</p>

            <div style={paymentAmountPanelStyle}>
              <span style={mutedText}>
                {payment.payment_type === "Pelunasan"
                  ? "TAGIHAN PELUNASAN"
                  : "TAGIHAN DP"}
              </span>

              <h2 style={paymentAmountStyle}>
                {formatRupiah(payment.amount)}
              </h2>
            </div>

            <div style={summaryListStyle}>
              <div style={summaryRowStyle}>
                <span style={mutedText}>Metode</span>
                <strong style={strongText}>
                  {payment.payment_method || "-"}
                </strong>
              </div>

              <div style={summaryRowStyle}>
                <span style={mutedText}>Status</span>
                <strong
                  style={{
                    color:
                      payment.status === "verified"
                        ? "#2f6b45"
                        : payment.status === "rejected"
                          ? "#a13f31"
                          : "#8a6a4a",
                    textAlign: "right",
                  }}
                >
                  {paymentStatus}
                </strong>
              </div>

              <div style={summaryRowStyle}>
                <span style={mutedText}>Bukti Pembayaran</span>
                <strong style={{ color: hasProof ? "#2f6b45" : "#8a6a4a" }}>
                  {hasProof ? "Sudah Diupload" : "Belum Diupload"}
                </strong>
              </div>
            </div>

            {payment.payment_method && (
              <PaymentMethodDetails
                method={payment.payment_method}
                amount={payment.amount}
                typeLabel={
                  payment.payment_type === "Pelunasan" ? "Pelunasan" : "DP"
                }
              />
            )}
          </section>
        )}

        {payment &&
          payment.status !== "verified" &&
          (!hasProof || payment.status === "rejected") && (
            <section style={cardStyle}>
              <p style={sectionEyebrowStyle}>LANGKAH 02</p>
              <h2 style={sectionHeading}>Upload Bukti Pembayaran</h2>

              <p style={bodyTextStyle}>
                Setelah membayar sebesar{" "}
                <strong style={strongText}>
                  {formatRupiah(payment.amount)}
                </strong>
                , unggah bukti pembayaran di bawah ini.
                {payment.status === "rejected" &&
                  " Bukti sebelumnya ditolak. Silakan unggah bukti yang benar."}
              </p>

              <div style={fileInputBoxStyle}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(event) => {
                    setProofFile(event.target.files?.[0] || null);
                    setError("");
                    setMessage("");
                  }}
                  style={{ width: "100%" }}
                />

                <p style={fileHelpStyle}>
                  Format: JPG, PNG, WEBP, atau PDF. Maksimal 10 MB.
                </p>
              </div>

              {proofFile && (
                <div style={selectedFileStyle}>
                  <span>File dipilih</span>
                  <strong>{proofFile.name}</strong>
                </div>
              )}

              <button
                type="button"
                onClick={handleUploadProof}
                disabled={uploadingProof || !proofFile}
                style={{
                  ...primaryButtonStyle,
                  marginTop: "18px",
                  opacity: uploadingProof || !proofFile ? 0.65 : 1,
                  cursor:
                    uploadingProof || !proofFile ? "not-allowed" : "pointer",
                }}
              >
                {uploadingProof
                  ? "Mengunggah bukti..."
                  : "Upload Bukti Pembayaran →"}
              </button>
            </section>
          )}

        {payment && hasProof && payment.status === "pending" && (
          <section style={noticeCardStyle}>
            <div style={noticeIconStyle}>✓</div>
            <div>
              <h2 style={noticeHeadingStyle}>Menunggu Verifikasi</h2>
              <p style={noticeTextStyle}>
                Bukti{" "}
                {payment.payment_type === "Pelunasan" ? "pelunasan" : "DP"}{" "}
                sudah diterima. Pajara Studio akan memverifikasi pembayaranmu.
              </p>
            </div>
          </section>
        )}

        {payment && payment.status === "verified" && (
          <section
            style={{
              ...noticeCardStyle,
              background: "#edf6ef",
              borderColor: "#c8dfcc",
            }}
          >
            <div style={noticeIconStyle}>✓</div>
            <div>
              <h2 style={noticeHeadingStyle}>Pembayaran Terverifikasi</h2>
              <p style={noticeTextStyle}>
                Pembayaran{" "}
                {payment.payment_type === "Pelunasan" ? "pelunasan" : "DP"}{" "}
                kamu sudah diverifikasi oleh Pajara Studio.
              </p>
            </div>
          </section>
        )}

        {!paymentType && !payment && (
          <section style={cardStyle}>
            <h2 style={sectionHeading}>Pembayaran</h2>
            <p style={bodyTextStyle}>
              {order.status === "completed"
                ? "Pesanan sudah selesai. Tidak ada tagihan baru pada tahap ini."
                : "Pembayaran belum dapat dilakukan pada tahap pesanan saat ini."}
            </p>
          </section>
        )}

        <footer style={footerStyle}>
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
            <p style={footerTaglineStyle}>Berakar di Tanah Pasundan.</p>
            <p style={footerSmallStyle}>Desain yang punya arah.</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        a,
        button {
          -webkit-tap-highlight-color: transparent;
          transition:
            background 160ms ease,
            border-color 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease;
        }

        button:active,
        a:active {
          transform: scale(0.99);
        }

        @media (hover: hover) {
          a:hover,
          button:hover {
            box-shadow: 0 7px 20px rgba(33, 77, 50, 0.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "var(--cream, #f7f4ee)",
  padding: "30px 18px 55px",
  boxSizing: "border-box",
  color: "var(--text, #1d2a22)",
  fontFamily: '"DM Sans", Arial, sans-serif',
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "760px",
  margin: "0 auto",
};

const loadingCardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "390px",
  boxSizing: "border-box",
  padding: "34px 24px 28px",
  margin: "min(12vh, 90px) auto 0",
  borderRadius: "24px",
  background: "#fff",
  border: "1px solid rgba(33,77,50,.12)",
  boxShadow: "0 18px 45px rgba(33,77,50,.08)",
  textAlign: "center",
  animation: "paymentFade 400ms ease both",
};

const loadingLogoFrameStyle: React.CSSProperties = {
  width: "86px",
  height: "86px",
  margin: "0 auto 20px",
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  borderRadius: "20px",
  background: "#f7f4ee",
  border: "1px solid #e8e2d8",
};

const loadingLogoStyle: React.CSSProperties = {
  width: "76px",
  height: "76px",
  objectFit: "contain",
};

const loadingEyebrowStyle: React.CSSProperties = {
  margin: "0 0 9px",
  color: "#8a6a4a",
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: "0.2em",
};

const loadingTitleStyle: React.CSSProperties = {
  margin: "0 0 23px",
  color: "#214d32",
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: "25px",
  lineHeight: 1.35,
  fontWeight: 600,
};

const loadingSpinnerStyle: React.CSSProperties = {
  width: "30px",
  height: "30px",
  margin: "0 auto 17px",
  border: "3px solid #e4ebe2",
  borderTopColor: "#2f6b45",
  borderRadius: "50%",
  animation: "paymentSpin 800ms linear infinite",
};

const loadingTextStyle: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "270px",
  color: "#747d74",
  fontSize: "13px",
  lineHeight: 1.8,
};

const loadingDividerStyle: React.CSSProperties = {
  width: "42px",
  height: "2px",
  margin: "22px auto 14px",
  background: "#d8e4d7",
  borderRadius: "10px",
};

const loadingTaglineStyle: React.CSSProperties = {
  margin: 0,
  color: "#8a6a4a",
  fontSize: "11px",
  fontWeight: 600,
};

const backCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "13px 15px",
  marginBottom: "28px",
  border: "1px solid rgba(33,77,50,.12)",
  borderRadius: "16px",
  background: "#fff",
  boxShadow: "0 5px 18px rgba(33,77,50,.045)",
  color: "#214d32",
  textDecoration: "none",
  boxSizing: "border-box",
};

const backIconStyle: React.CSSProperties = {
  width: "39px",
  height: "39px",
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  borderRadius: "12px",
  background: "#edf4ee",
  color: "#2f6b45",
};

const backCaptionStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "3px",
  color: "#8a6a4a",
  fontSize: "9px",
  fontWeight: 800,
  letterSpacing: "0.13em",
};

const backTitleStyle: React.CSSProperties = {
  display: "block",
  color: "#214d32",
  fontSize: "13px",
  fontWeight: 700,
};

const backArrowStyle: React.CSSProperties = {
  color: "#8a6a4a",
  fontSize: "18px",
};

const pageHeaderStyle: React.CSSProperties = {
  margin: "0 0 24px",
};

const eyebrowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  margin: "0 0 10px",
  color: "#8a6a4a",
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: "0.18em",
};

const eyebrowDotStyle: React.CSSProperties = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#2f6b45",
};

const pageHeadingStyle: React.CSSProperties = {
  margin: "0 0 9px",
  color: "#214d32",
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: "clamp(30px, 6vw, 39px)",
  lineHeight: 1.25,
  fontWeight: 600,
};

const bodyTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#707970",
  fontSize: "13px",
  lineHeight: 1.8,
};

const orderIdentityCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "18px",
  marginBottom: "20px",
  border: "1px solid #e8e2d8",
  borderRadius: "18px",
  background: "#fff",
  boxShadow: "0 5px 17px rgba(33,77,50,.035)",
};

const orderIdentityIconStyle: React.CSSProperties = {
  width: "48px",
  height: "48px",
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  borderRadius: "15px",
  background: "#edf3ec",
  color: "#2f6b45",
};

const orderCodeStyle: React.CSSProperties = {
  margin: "0 0 5px",
  color: "#8a6a4a",
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: "0.09em",
};

const orderServiceStyle: React.CSSProperties = {
  margin: 0,
  color: "#214d32",
  fontSize: "16px",
  lineHeight: 1.5,
  fontWeight: 800,
};

const sectionEyebrowStyle: React.CSSProperties = {
  margin: "0 0 7px",
  color: "#8a6a4a",
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: "0.14em",
};

const sectionHeading: React.CSSProperties = {
  margin: "0 0 15px",
  color: "#214d32",
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: "22px",
  lineHeight: 1.35,
  fontWeight: 600,
};

const summaryListStyle: React.CSSProperties = {
  display: "grid",
  gap: "15px",
  marginTop: "22px",
};

const summaryRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "flex-start",
  fontSize: "13px",
  lineHeight: 1.7,
};

const mutedText: React.CSSProperties = {
  color: "#777970",
};

const strongText: React.CSSProperties = {
  color: "#214d32",
  fontWeight: 800,
  textAlign: "right",
  overflowWrap: "anywhere",
};

const highlightAmountStyle: React.CSSProperties = {
  color: "#8a6a4a",
  fontSize: "17px",
  fontWeight: 800,
  textAlign: "right",
  overflowWrap: "anywhere",
};

const separatorStyle: React.CSSProperties = {
  height: "1px",
  background: "#e8e2d8",
};

const paymentMethodListStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
  marginTop: "22px",
};

const paymentMethodCardStyle: React.CSSProperties = {
  width: "100%",
  padding: "17px",
  borderRadius: "15px",
  cursor: "pointer",
  textAlign: "left",
  boxSizing: "border-box",
};

const methodTopStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
};

const methodNameStyle: React.CSSProperties = {
  color: "#214d32",
  fontSize: "15px",
  fontWeight: 800,
};

const methodDescriptionStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#777970",
  fontSize: "12px",
  lineHeight: 1.6,
};

const radioStyle: React.CSSProperties = {
  width: "20px",
  height: "20px",
  flexShrink: 0,
  borderRadius: "50%",
  boxSizing: "border-box",
};

const accountBoxStyle: React.CSSProperties = {
  display: "grid",
  gap: "5px",
  marginTop: "14px",
  padding: "12px",
  borderRadius: "11px",
  background: "#f7f4ee",
};

const accountLabelStyle: React.CSSProperties = {
  color: "#8a6a4a",
  fontSize: "9px",
  fontWeight: 800,
  letterSpacing: "0.1em",
};

const accountTextStyle: React.CSSProperties = {
  color: "#214d32",
  fontSize: "14px",
  fontWeight: 800,
  overflowWrap: "anywhere",
};

const accountOwnerStyle: React.CSSProperties = {
  color: "#777970",
  fontSize: "11px",
  lineHeight: 1.6,
};

const selectedMethodNoticeStyle: React.CSSProperties = {
  marginTop: "18px",
  padding: "15px",
  borderRadius: "12px",
  background: "#edf6ef",
  border: "1px solid #c8dfcc",
  color: "#214d32",
  fontSize: "13px",
  lineHeight: 1.6,
};

const primaryButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  width: "100%",
  minHeight: "48px",
  padding: "14px 18px",
  border: "1px solid #2f6b45",
  borderRadius: "12px",
  background: "#2f6b45",
  color: "#fff",
  fontWeight: 800,
  fontSize: "13px",
  textAlign: "center",
  textDecoration: "none",
  boxSizing: "border-box",
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  minHeight: "46px",
  padding: "12px 16px",
  border: "1px solid #dce5da",
  borderRadius: "12px",
  background: "#f7faf6",
  color: "#214d32",
  fontSize: "13px",
  fontWeight: 800,
  textDecoration: "none",
  boxSizing: "border-box",
};

const paymentAmountPanelStyle: React.CSSProperties = {
  padding: "18px",
  borderRadius: "14px",
  background: "#f7f4ee",
  border: "1px solid #e8e2d8",
};

const paymentAmountStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#214d32",
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: "clamp(26px, 6vw, 34px)",
  overflowWrap: "anywhere",
};

const fileInputBoxStyle: React.CSSProperties = {
  marginTop: "20px",
  padding: "18px",
  borderRadius: "14px",
  background: "#f7f4ee",
  border: "1px dashed #cfc5b7",
};

const fileHelpStyle: React.CSSProperties = {
  color: "#777970",
  fontSize: "12px",
  lineHeight: 1.7,
  marginBottom: 0,
};

const selectedFileStyle: React.CSSProperties = {
  display: "grid",
  gap: "5px",
  marginTop: "14px",
  padding: "13px 14px",
  borderRadius: "11px",
  background: "#f7f4ee",
  color: "#214d32",
  fontSize: "12px",
  overflowWrap: "anywhere",
};

const successStyle: React.CSSProperties = {
  marginTop: "18px",
  padding: "16px 18px",
  borderRadius: "14px",
  background: "#edf6ef",
  border: "1px solid #c8dfcc",
  color: "#214d32",
  fontSize: "13px",
  lineHeight: 1.7,
};

const errorStyle: React.CSSProperties = {
  marginTop: "18px",
  padding: "16px 18px",
  borderRadius: "14px",
  background: "#fff3f0",
  border: "1px solid #ead0c9",
  color: "#8a3d2f",
  fontSize: "13px",
  lineHeight: 1.7,
};

const noticeTextStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: "13px",
  lineHeight: 1.8,
};

const noticeCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
  marginTop: "20px",
  padding: "20px",
  border: "1px solid #c8dfcc",
  borderRadius: "17px",
  background: "#f1f7f2",
};

const noticeIconStyle: React.CSSProperties = {
  width: "34px",
  height: "34px",
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  borderRadius: "11px",
  background: "#dcebdd",
  color: "#2f6b45",
  fontWeight: 800,
};

const noticeHeadingStyle: React.CSSProperties = {
  margin: "2px 0 0",
  color: "#214d32",
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: "19px",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "13px",
  borderTop: "1px solid #e4ddd1",
  paddingTop: "22px",
  marginTop: "36px",
};

const footerLogoStyle: React.CSSProperties = {
  width: "43px",
  height: "43px",
  flexShrink: 0,
  objectFit: "contain",
  borderRadius: "10px",
  background: "#fff",
};

const footerTitleStyle: React.CSSProperties = {
  color: "#214d32",
  fontSize: "13px",
};

const footerTaglineStyle: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#8a6a4a",
  fontSize: "11px",
};

const footerSmallStyle: React.CSSProperties = {
  margin: "3px 0 0",
  color: "#999387",
  fontSize: "10px",
};

function PaymentFallback() {
  return <PaymentLoading />;
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentContent />
    </Suspense>
  );
}
