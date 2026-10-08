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

const PAYMENT_METHODS = [
  {
    name: "QRIS",
    description: "Bayar menggunakan QRIS",
    account: "A/N Pajara Studio",
    note: "Kode QRIS akan tersedia pada tahap berikutnya.",
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

function PaymentContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);

  const [selectedMethod, setSelectedMethod] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: orderData } = await supabase
        .from("orders")
        .select(
          "id, order_code, service_name, total_amount, dp_amount, remaining_amount, status"
        )
        .eq("id", id)
        .eq("customer_id", user.id)
        .maybeSingle();

      if (!orderData) {
        setLoading(false);
        return;
      }

      setOrder(orderData);

      const { data: paymentData } = await supabase
        .from("payments")
        .select(
          "id, order_id, payment_method, payment_type, amount, proof_file_id, status, created_at"
        )
        .eq("order_id", orderData.id)
        .eq("payment_type", "DP")
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (paymentData) {
        setPayment(paymentData);
        setSelectedMethod(paymentData.payment_method || "");
      }

      setLoading(false);
    }

    loadData();
  }, [id]);

  async function createPayment() {
    if (!order) return null;

    if (!selectedMethod) {
      setError("Silakan pilih metode pembayaran terlebih dahulu.");
      return null;
    }

    if (!order.dp_amount || order.dp_amount <= 0) {
      setError(
        "Nominal DP belum tersedia. Silakan tunggu Pajara Studio menetapkan harga."
      );
      return null;
    }

    const { data: existingPayment, error: existingError } =
      await supabase
        .from("payments")
        .select(
          "id, order_id, payment_method, payment_type, amount, proof_file_id, status, created_at"
        )
        .eq("order_id", order.id)
        .eq("payment_type", "DP")
        .order("created_at", {
          ascending: false,
        })
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
        payment_type: "DP",
        amount: order.dp_amount,
        status: "pending",
      })
      .select(
        "id, order_id, payment_method, payment_type, amount, proof_file_id, status, created_at"
      )
      .single();

    if (insertError) {
      setError(
        insertError.message ||
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

    const createdPayment = await createPayment();

    if (createdPayment) {
      setMessage(
        "Metode pembayaran berhasil disimpan. Silakan lakukan pembayaran sesuai metode yang dipilih, kemudian upload bukti pembayaran."
      );
    }

    setSaving(false);
  }

  async function handleUploadProof() {
    if (!order) return;

    if (!payment) {
      setError(
        "Silakan pilih metode pembayaran dan buat pembayaran terlebih dahulu."
      );
      return;
    }

    if (!proofFile) {
      setError("Silakan pilih bukti pembayaran terlebih dahulu.");
      return;
    }

    if (
      proofFile.type !== "image/jpeg" &&
      proofFile.type !== "image/png" &&
      proofFile.type !== "image/webp" &&
      proofFile.type !== "application/pdf"
    ) {
      setError(
        "Format bukti pembayaran harus JPG, PNG, WEBP, atau PDF."
      );
      return;
    }

    if (proofFile.size > 10 * 1024 * 1024) {
      setError("Ukuran bukti pembayaran maksimal 10 MB.");
      return;
    }

    setUploadingProof(true);
    setError("");
    setMessage("");

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
        contentType:
          proofFile.type || "application/octet-stream",
      });

    if (uploadError) {
      setError(
        uploadError.message ||
          "Bukti pembayaran gagal diupload."
      );
      setUploadingProof(false);
      return;
    }

    const { data: orderFile, error: orderFileError } =
      await supabase
        .from("order_files")
        .insert({
          order_id: order.id,
          revision_id: null,
          file_name: proofFile.name,
          file_path: filePath,
          file_type:
            proofFile.type || "application/octet-stream",
          file_size: proofFile.size,
          file_category: "payment_proof",
        })
        .select("id")
        .single();

    if (orderFileError || !orderFile) {
      await supabase.storage
        .from("pajara-files")
        .remove([filePath]);

      setError(
        orderFileError?.message ||
          "Data bukti pembayaran gagal disimpan."
      );
      setUploadingProof(false);
      return;
    }

    const {
      data: updatedPayment,
      error: updatePaymentError,
    } = await supabase
      .from("payments")
      .update({
        proof_file_id: orderFile.id,
      })
      .eq("id", payment.id)
      .select(
        "id, order_id, payment_method, payment_type, amount, proof_file_id, status, created_at"
      )
      .single();

    if (updatePaymentError || !updatedPayment) {
      await supabase
        .from("order_files")
        .delete()
        .eq("id", orderFile.id);

      await supabase.storage
        .from("pajara-files")
        .remove([filePath]);

      setError(
        updatePaymentError?.message ||
          "Bukti pembayaran gagal dikaitkan dengan pembayaran."
      );
      setUploadingProof(false);
      return;
    }

    setPayment(updatedPayment);
    setProofFile(null);

    setMessage(
      "Bukti pembayaran berhasil diupload. Pembayaran menunggu verifikasi Admin Pajara Studio."
    );

    setUploadingProof(false);
  }

  const selectedPaymentMethod = PAYMENT_METHODS.find(
    (method) => method.name === selectedMethod
  );

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--cream)",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <p style={{ color: "var(--green)" }}>
            Memuat pembayaran...
          </p>
        </div>
      </main>
    );
  }

  if (!id || !order) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--cream)",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h1 style={{ color: "var(--green-dark)" }}>
            Pesanan tidak ditemukan
          </h1>

          <p style={{ color: "#666" }}>
            Pesanan yang kamu cari tidak tersedia atau bukan
            milik akun ini.
          </p>

          <a
            href="/orders"
            style={{
              color: "var(--green)",
              fontWeight: 700,
            }}
          >
            ← Kembali ke Pesanan
          </a>
        </div>
      </main>
    );
  }

  const isWaitingDP = order.status === "waiting_dp";
  const paymentStatus = getPaymentStatus(payment);
  const hasProof = Boolean(payment?.proof_file_id);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <a
          href={`/orders?id=${order.id}`}
          style={{
            color: "var(--green)",
            fontSize: "14px",
            fontWeight: 700,
          }}
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
          <div
            style={{
              marginTop: "20px",
              padding: "16px 18px",
              borderRadius: "14px",
              background: "#edf6ef",
              border: "1px solid #c8dfcc",
              color: "var(--green-dark)",
              lineHeight: 1.6,
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px 18px",
              borderRadius: "14px",
              background: "#fff3f0",
              border: "1px solid #ead0c9",
              color: "#8a3d2f",
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            marginTop: "28px",
            background: "#fff",
            borderRadius: "18px",
            padding: "28px",
            border: "1px solid #e8e2d8",
          }}
        >
          <h2
            style={{
              color: "var(--green-dark)",
              marginTop: 0,
            }}
          >
            Ringkasan Pembayaran
          </h2>

          <div
            style={{
              display: "grid",
              gap: "14px",
              marginTop: "22px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <span style={{ color: "#666" }}>
                Total Pesanan
              </span>

              <strong style={{ color: "var(--green-dark)" }}>
                {formatRupiah(order.total_amount)}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <span style={{ color: "#666" }}>
                DP 50%
              </span>

              <strong style={{ color: "var(--green-dark)" }}>
                {formatRupiah(order.dp_amount)}
              </strong>
            </div>

            <div
              style={{
                height: "1px",
                background: "#e8e2d8",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <span style={{ color: "#666" }}>
                Sisa Pembayaran
              </span>

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

        {payment && (
          <section
            style={{
              marginTop: "18px",
              background: "#fff",
              borderRadius: "18px",
              padding: "28px",
              border: "1px solid #e8e2d8",
            }}
          >
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
              PEMBAYARAN DP
            </p>

            <h2
              style={{
                color: "var(--green-dark)",
                marginTop: 0,
              }}
            >
              {formatRupiah(payment.amount)}
            </h2>

            <div
              style={{
                display: "grid",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                <span style={{ color: "#666" }}>
                  Metode
                </span>

                <strong style={{ color: "var(--green-dark)" }}>
                  {payment.payment_method || "-"}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                <span style={{ color: "#666" }}>
                  Status
                </span>

                <strong style={{ color: "var(--green-dark)" }}>
                  {paymentStatus}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                <span style={{ color: "#666" }}>
                  Bukti Pembayaran
                </span>

                <strong
                  style={{
                    color: hasProof
                      ? "var(--green)"
                      : "var(--brown)",
                  }}
                >
                  {hasProof
                    ? "Sudah Diupload"
                    : "Belum Diupload"}
                </strong>
              </div>
            </div>
          </section>
        )}

        {isWaitingDP && !payment && (
          <section
            style={{
              marginTop: "18px",
              background: "#fff",
              borderRadius: "18px",
              padding: "28px",
              border: "1px solid #e8e2d8",
            }}
          >
            <h2
              style={{
                color: "var(--green-dark)",
                marginTop: 0,
              }}
            >
              Pilih Metode Pembayaran
            </h2>

            <p
              style={{
                color: "#666",
                lineHeight: 1.7,
              }}
            >
              Pilih metode yang akan digunakan untuk pembayaran
              DP sebesar{" "}
              <strong style={{ color: "var(--green-dark)" }}>
                {formatRupiah(order.dp_amount)}
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
                const selected =
                  selectedMethod === method.name;

                return (
                  <button
                    key={method.name}
                    type="button"
                    onClick={() =>
                      setSelectedMethod(method.name)
                    }
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "18px",
                      borderRadius: "14px",
                      border: selected
                        ? "2px solid var(--green)"
                        : "1px solid #ddd5c9",
                      background: selected
                        ? "#f1f7f2"
                        : "#fff",
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
              <div
                style={{
                  marginTop: "18px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#edf6ef",
                  border: "1px solid #c8dfcc",
                  color: "var(--green-dark)",
                  lineHeight: 1.6,
                  fontSize: "14px",
                }}
              >
                <strong>
                  Metode dipilih:{" "}
                  {selectedPaymentMethod.name}
                </strong>

                <div style={{ marginTop: "5px" }}>
                  Silakan lakukan pembayaran sebesar{" "}
                  <strong>
                    {formatRupiah(order.dp_amount)}
                  </strong>{" "}
                  menggunakan metode tersebut.
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleCreatePayment}
              disabled={saving}
              style={{
                width: "100%",
                marginTop: "22px",
                padding: "15px 20px",
                border: "none",
                borderRadius: "12px",
                background: "var(--green)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                cursor: saving ? "wait" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving
                ? "Menyimpan..."
                : "Lanjutkan Pembayaran"}
            </button>
          </section>
        )}

        {payment && !hasProof && payment.status !== "verified" && (
          <section
            style={{
              marginTop: "18px",
              background: "#fff",
              borderRadius: "18px",
              padding: "28px",
              border: "1px solid #e8e2d8",
            }}
          >
            <h2
              style={{
                color: "var(--green-dark)",
                marginTop: 0,
              }}
            >
              Upload Bukti Pembayaran
            </h2>

            <p
              style={{
                color: "#666",
                lineHeight: 1.7,
              }}
            >
              Setelah melakukan pembayaran sebesar{" "}
              <strong style={{ color: "var(--green-dark)" }}>
                {formatRupiah(payment.amount)}
              </strong>
              , upload bukti pembayaran di sini.
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
                  setProofFile(
                    event.target.files?.[0] || null
                  );
                  setError("");
                  setMessage("");
                }}
                style={{
                  width: "100%",
                }}
              />

              <p
                style={{
                  color: "#777",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  marginBottom: 0,
                }}
              >
                Format: JPG, PNG, WEBP, atau PDF. Maksimal
                10 MB.
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
              disabled={uploadingProof}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "15px 20px",
                border: "none",
                borderRadius: "12px",
                background: "var(--green)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                cursor: uploadingProof
                  ? "wait"
                  : "pointer",
                opacity: uploadingProof ? 0.7 : 1,
              }}
            >
              {uploadingProof
                ? "Mengupload..."
                : "Upload Bukti Pembayaran"}
            </button>
          </section>
        )}

        {payment && hasProof && payment.status === "pending" && (
          <section
            style={{
              marginTop: "18px",
              background: "#fff",
              borderRadius: "18px",
              padding: "28px",
              border: "1px solid #e8e2d8",
            }}
          >
            <h2
              style={{
                color: "var(--green-dark)",
                marginTop: 0,
              }}
            >
              Menunggu Verifikasi
            </h2>

            <p
              style={{
                color: "#666",
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              Bukti pembayaran sudah diterima. Pajara Studio
              akan melakukan verifikasi pembayaran Anda.
            </p>
          </section>
        )}

        {payment && payment.status === "verified" && (
          <section
            style={{
              marginTop: "18px",
              background: "#edf6ef",
              borderRadius: "18px",
              padding: "28px",
              border: "1px solid #c8dfcc",
            }}
          >
            <h2
              style={{
                color: "var(--green-dark)",
                marginTop: 0,
              }}
            >
              Pembayaran Terverifikasi
            </h2>

            <p
              style={{
                color: "var(--green-dark)",
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              Pembayaran DP Anda sudah diverifikasi oleh
              Pajara Studio.
            </p>
          </section>
        )}

        {payment && payment.status === "rejected" && (
          <section
            style={{
              marginTop: "18px",
              background: "#fff3f0",
              borderRadius: "18px",
              padding: "28px",
              border: "1px solid #ead0c9",
            }}
          >
            <h2
              style={{
                color: "#8a3d2f",
                marginTop: 0,
              }}
            >
              Pembayaran Ditolak
            </h2>

            <p
              style={{
                color: "#8a3d2f",
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              Pembayaran perlu diperiksa kembali. Silakan
              hubungi Pajara Studio untuk informasi lebih lanjut.
            </p>
          </section>
        )}

        {!isWaitingDP && !payment && (
          <section
            style={{
              marginTop: "18px",
              background: "#fff",
              borderRadius: "18px",
              padding: "28px",
              border: "1px solid #e8e2d8",
            }}
          >
            <h2
              style={{
                color: "var(--green-dark)",
                marginTop: 0,
              }}
            >
              Pembayaran
            </h2>

            <p
              style={{
                color: "#666",
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              Pembayaran belum dapat dilakukan pada tahap
              pesanan saat ini.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function PaymentFallback() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <p style={{ color: "var(--green)" }}>
          Memuat pembayaran...
        </p>
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
