
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
          <strong style={{ color: "var(--green-dark)" }}>
            {formatRupiah(amount)}
          </strong>
          .<br />
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
          color: "var(--green-dark)",
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
        <strong style={{ color: "var(--green-dark)" }}>
          {formatRupiah(amount)}
        </strong>
      </p>
    </div>
  );
}

const detailBox = {
  marginTop: "24px",
  padding: "20px",
  borderRadius: "14px",
  background: "#f7f4ee",
  border: "1px solid #e8e2d8",
  textAlign: "center" as const,
};

const detailTitle = {
  marginTop: 0,
  marginBottom: "14px",
  color: "var(--green-dark)",
  fontWeight: 700,
};

const detailDescription = {
  marginTop: "14px",
  marginBottom: 0,
  color: "#666",
  fontSize: "13px",
  lineHeight: 1.7,
};

const cardStyle = {
  marginTop: "18px",
  background: "#fff",
  borderRadius: "18px",
  padding: "28px",
  border: "1px solid #e8e2d8",
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

      const { data: subscriptionRequest, error: subscriptionError } =
        await supabase
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

    loadData();

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
    if (!order || !paymentType || amountDue === null || amountDue === undefined) {
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

    // Periksa ulang status di database sebelum membuat tagihan.
    const { data: latestOrder, error: latestOrderError } = await supabase
      .from("orders")
      .select("status, dp_amount, remaining_amount")
      .eq("id", order.id)
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
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <p style={{ color: "var(--green)" }}>Memuat pembayaran...</p>
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
          <p style={{ color: "#666" }}>
            {error || "Pesanan tidak tersedia atau bukan milik akun ini."}
          </p>
          <a href="/orders" style={linkStyle}>
            ← Kembali ke Pesanan
          </a>
        </div>
      </main>
    );
  }

  if (isSubscriptionOrder) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <h1 style={{ color: "var(--green-dark)" }}>Pesanan Paket</h1>
          <section style={cardStyle}>
            <p style={{ color: "#666", lineHeight: 1.7 }}>
              Pesanan ini menggunakan kuota paket. Tidak ada pembayaran
              tambahan per desain melalui halaman ini.
            </p>
            <a href={`/orders?id=${order.id}`} style={linkStyle}>
              ← Kembali ke Pesanan
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
        <a href={`/orders?id=${order.id}`} style={linkStyle}>
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
            PEMBAYARAN
          </p>
          <h1
            style={{
              color: "var(--green-dark)",
              marginBottom: "8px",
            }}
          >
            {order.order_code}
          </h1>
          <p style={{ color: "#666" }}>
            {order.service_name || "Layanan Pajara Studio"}
          </p>
        </div>

        {message && (
          <div style={successStyle}>{message}</div>
        )}

        {error && (
          <div style={errorStyle}>{error}</div>
        )}

        <section style={{ ...cardStyle, marginTop: "28px" }}>
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
              <strong
                style={{
                  color: "var(--brown)",
                  fontSize: "18px",
                }}
              >
                {formatRupiah(order.remaining_amount)}
              </strong>
            </div>
          </div>
        </section>

        {canStartPayment && !payment && (
          <section style={cardStyle}>
            <h2 style={sectionHeading}>
              {isWaitingDP ? "Pembayaran DP" : "Pembayaran Pelunasan"}
            </h2>

            <p style={{ color: "#666", lineHeight: 1.7 }}>
              {isWaitingDP
                ? "Pilih metode untuk membayar DP sebesar "
                : "Desain final sudah memasuki tahap pelunasan. Pilih metode untuk membayar sisa tagihan sebesar "}
              <strong style={strongText}>
                {formatRupiah(amountDue ?? 0)}
              </strong>
              .
            </p>

            <div
              style={{
                display: "grid",
                gap: "12px",
                marginTop: "22px",
              }}
            >
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
                      width: "100%",
                      textAlign: "left",
                      padding: "18px",
                      borderRadius: "14px",
                      border: selected
                        ? "2px solid var(--green)"
                        : "1px solid #ddd5c9",
                      background: selected ? "#f1f7f2" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <strong
                          style={{
                            color: "var(--green-dark)",
                            fontSize: "16px",
                          }}
                        >
                          {method.name}
                        </strong>

                        <div
                          style={{
                            marginTop: "5px",
                            color: "#777",
                            fontSize: "13px",
                          }}
                        >
                          {method.description}
                        </div>

                        <div
                          style={{
                            marginTop: "12px",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            background: "#f7f4ee",
                          }}
                        >
                          <div
                            style={{
                              color: "var(--green-dark)",
                              fontWeight: 700,
                              fontSize: "14px",
                              wordBreak: "break-word",
                            }}
                          >
                            {method.account}
                          </div>

                          {method.owner && (
                            <div
                              style={{
                                marginTop: "3px",
                                color: "#777",
                                fontSize: "12px",
                              }}
                            >
                              {method.owner}
                            </div>
                          )}

                          {method.note && (
                            <div
                              style={{
                                marginTop: "4px",
                                color: "#777",
                                fontSize: "12px",
                                lineHeight: 1.5,
                              }}
                            >
                              {method.note}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border: selected
                            ? "6px solid var(--green)"
                            : "2px solid #c9c0b4",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPaymentMethod && (
              <div style={successStyle}>
                <strong>Metode dipilih: {selectedPaymentMethod.name}</strong>
                <div style={{ marginTop: "5px" }}>
                  Nominal {typeLabel.toLowerCase()}:{" "}
                  <strong>{formatRupiah(amountDue ?? 0)}</strong>
                </div>
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
                opacity: saving || !selectedMethod ? 0.7 : 1,
                cursor: saving || !selectedMethod ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Menyimpan..." : "Lanjutkan Pembayaran"}
            </button>
          </section>
        )}

        {payment && (
          <section style={cardStyle}>
            <p
              style={{
                color: "var(--brown)",
                fontWeight: 700,
                marginTop: 0,
                marginBottom: "8px",
                fontSize: "13px",
                letterSpacing: "0.06em",
              }}
            >
              {payment.payment_type === "Pelunasan"
                ? "PEMBAYARAN PELUNASAN"
                : "PEMBAYARAN DP"}
            </p>

            <h2 style={sectionHeading}>
              {formatRupiah(payment.amount)}
            </h2>

            <div style={summaryListStyle}>
              <div style={summaryRowStyle}>
                <span style={mutedText}>Metode</span>
                <strong style={strongText}>
                  {payment.payment_method || "-"}
                </strong>
              </div>

              <div style={summaryRowStyle}>
                <span style={mutedText}>Status</span>
                <strong style={strongText}>
                  {paymentStatus}
                </strong>
              </div>

              <div style={summaryRowStyle}>
                <span style={mutedText}>Bukti Pembayaran</span>
                <strong
                  style={{
                    color: hasProof ? "var(--green)" : "var(--brown)",
                  }}
                >
                  {hasProof ? "Sudah Diupload" : "Belum Diupload"}
                </strong>
              </div>
            </div>

            {payment.payment_method && (
              <PaymentMethodDetails
                method={payment.payment_method}
                amount={payment.amount}
                typeLabel={
                  payment.payment_type === "Pelunasan"
                    ? "Pelunasan"
                    : "DP"
                }
              />
            )}
          </section>
        )}

        {payment &&
          payment.status !== "verified" &&
          (!hasProof || payment.status === "rejected") && (
            <section style={cardStyle}>
              <h2 style={sectionHeading}>Upload Bukti Pembayaran</h2>

              <p style={{ color: "#666", lineHeight: 1.7 }}>
                Setelah membayar sebesar{" "}
                <strong style={strongText}>
                  {formatRupiah(payment.amount)}
                </strong>
                , unggah bukti pembayaran di bawah ini.
                {payment.status === "rejected" &&
                  " Bukti sebelumnya ditolak. Silakan unggah bukti yang benar."}
              </p>

              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  borderRadius: "14px",
                  background: "var(--cream)",
                  border: "1px dashed #cfc5b7",
                }}
              >
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

                <p
                  style={{
                    color: "#777",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    marginBottom: 0,
                  }}
                >
                  Format: JPG, PNG, WEBP, atau PDF. Maksimal 10 MB.
                </p>
              </div>

              {proofFile && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#f7f4ee",
                    color: "var(--green-dark)",
                    fontSize: "14px",
                  }}
                >
                  File dipilih: <strong>{proofFile.name}</strong>
                </div>
              )}

              <button
                type="button"
                onClick={handleUploadProof}
                disabled={uploadingProof || !proofFile}
                style={{
                  ...primaryButtonStyle,
                  marginTop: "18px",
                  opacity: uploadingProof || !proofFile ? 0.7 : 1,
                  cursor:
                    uploadingProof || !proofFile ? "not-allowed" : "pointer",
                }}
              >
                {uploadingProof
                  ? "Mengupload..."
                  : "Upload Bukti Pembayaran"}
              </button>
            </section>
          )}

        {payment && hasProof && payment.status === "pending" && (
          <section style={cardStyle}>
            <h2 style={sectionHeading}>Menunggu Verifikasi</h2>
            <p style={{ color: "#666", lineHeight: 1.7, marginBottom: 0 }}>
              Bukti {payment.payment_type === "Pelunasan" ? "pelunasan" : "DP"}{" "}
              sudah diterima. Pajara Studio akan memverifikasi pembayaran Anda.
            </p>
          </section>
        )}

        {payment && payment.status === "verified" && (
          <section
            style={{
              ...cardStyle,
              background: "#edf6ef",
              borderColor: "#c8dfcc",
            }}
          >
            <h2 style={sectionHeading}>Pembayaran Terverifikasi</h2>
            <p
              style={{
                color: "var(--green-dark)",
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              Pembayaran{" "}
              {payment.payment_type === "Pelunasan" ? "pelunasan" : "DP"}{" "}
              Anda sudah diverifikasi oleh Pajara Studio.
            </p>
          </section>
        )}

        {!paymentType && !payment && (
          <section style={cardStyle}>
            <h2 style={sectionHeading}>Pembayaran</h2>
            <p style={{ color: "#666", lineHeight: 1.7, marginBottom: 0 }}>
              {order.status === "completed"
                ? "Pesanan sudah selesai. Tidak ada tagihan baru pada tahap ini."
                : "Pembayaran belum dapat dilakukan pada tahap pesanan saat ini."}
            </p>
          </section>
        )}

        <div style={{ marginTop: "28px" }}>
          <a href="/orders" style={linkStyle}>
            ← Kembali ke Pesanan
          </a>
        </div>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "var(--cream)",
  padding: "40px 20px",
};

const containerStyle = {
  maxWidth: "900px",
  margin: "0 auto",
};

const linkStyle = {
  color: "var(--green)",
  fontSize: "14px",
  fontWeight: 700,
};

const sectionHeading = {
  color: "var(--green-dark)",
  marginTop: 0,
};

const summaryListStyle = {
  display: "grid",
  gap: "14px",
  marginTop: "22px",
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  alignItems: "flex-start",
};

const mutedText = {
  color: "#666",
};

const strongText = {
  color: "var(--green-dark)",
};

const separatorStyle = {
  height: "1px",
  background: "#e8e2d8",
};

const successStyle = {
  marginTop: "20px",
  padding: "16px 18px",
  borderRadius: "14px",
  background: "#edf6ef",
  border: "1px solid #c8dfcc",
  color: "var(--green-dark)",
  lineHeight: 1.6,
};

const errorStyle = {
  marginTop: "20px",
  padding: "16px 18px",
  borderRadius: "14px",
  background: "#fff3f0",
  border: "1px solid #ead0c9",
  color: "#8a3d2f",
  lineHeight: 1.6,
};

const primaryButtonStyle = {
  width: "100%",
  padding: "15px 20px",
  border: "none",
  borderRadius: "12px",
  background: "var(--green)",
  color: "#fff",
  fontWeight: 700,
  fontSize: "15px",
};

function PaymentFallback() {
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <p style={{ color: "var(--green)" }}>Memuat pembayaran...</p>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentContent />
    </Suspense>
  );
}
