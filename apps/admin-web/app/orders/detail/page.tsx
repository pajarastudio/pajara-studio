"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@pajara/supabase";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  quantity: number | null;
  brief: string | null;
  notes: string | null;
  total_amount: number | null;
  dp_amount: number | null;
  remaining_amount: number | null;
  status: string | null;
  deadline: string | null;
  created_at: string | null;
  updated_at: string | null;
  customer_id: string | null;
};

type OrderFile = {
  id: string;
  order_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  file_category: string | null;
  created_at: string | null;
};

type ReferenceFile = OrderFile & {
  signed_url?: string;
};

function getStatusLabel(status: string | null) {
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

function formatRupiah(value: number | null | undefined) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrderDetailPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [totalAmount, setTotalAmount] = useState("");
  const [dpAmount, setDpAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");

  const [savingPrice, setSavingPrice] = useState(false);
  const [priceMessage, setPriceMessage] = useState("");

  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [finalFile, setFinalFile] = useState<File | null>(null);
  const [uploadingFinal, setUploadingFinal] = useState(false);
  const [finalMessage, setFinalMessage] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("ID pesanan tidak ditemukan.");
      setLoading(false);
      return;
    }

    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    if (!orderId) return;

    setLoading(true);
    setError("");

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
        created_at,
        updated_at,
        customer_id
        `
      )
      .eq("id", orderId)
      .single();

    if (orderError) {
      setError(orderError.message);
      setLoading(false);
      return;
    }

    setOrder(data as Order);

    setTotalAmount(String(data.total_amount || ""));
    setDpAmount(String(data.dp_amount || ""));
    setRemainingAmount(String(data.remaining_amount || ""));

    await loadReferenceFiles(orderId);

    setLoading(false);
  }

  async function loadReferenceFiles(id: string) {
    const { data, error: filesError } = await supabase
      .from("order_files")
      .select(
        `
        id,
        order_id,
        file_name,
        file_path,
        file_type,
        file_size,
        file_category,
        created_at
        `
      )
      .eq("order_id", id)
      .eq("file_category", "reference")
      .order("created_at", {
        ascending: true,
      });

    if (filesError) {
      console.error("Gagal mengambil file referensi:", filesError);
      return;
    }

    const files = (data || []) as ReferenceFile[];

    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const { data: signedData, error: signedError } =
          await supabase.storage
            .from("pajara-files")
            .createSignedUrl(file.file_path, 3600);

        if (signedError) {
          console.error(
            "Gagal membuat signed URL:",
            signedError
          );

          return file;
        }

        return {
          ...file,
          signed_url: signedData?.signedUrl,
        };
      })
    );

    setReferenceFiles(filesWithUrls);
  }

  function calculateDp(value: string) {
    const total = Number(value) || 0;
    const dp = Math.round(total * 0.5);
    const remaining = total - dp;

    setTotalAmount(value);
    setDpAmount(String(dp));
    setRemainingAmount(String(remaining));
  }

  async function handleSavePrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!order) return;

    setSavingPrice(true);
    setPriceMessage("");

    const total = Number(totalAmount) || 0;
    const dp = Math.round(total * 0.5);
    const remaining = total - dp;

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        total_amount: total,
        dp_amount: dp,
        remaining_amount: remaining,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      setPriceMessage(
        `Gagal menyimpan harga: ${updateError.message}`
      );
      setSavingPrice(false);
      return;
    }

    setDpAmount(String(dp));
    setRemainingAmount(String(remaining));

    setOrder((current) =>
      current
        ? {
            ...current,
            total_amount: total,
            dp_amount: dp,
            remaining_amount: remaining,
            updated_at: new Date().toISOString(),
          }
        : current
    );

    setPriceMessage("Harga berhasil disimpan.");
    setSavingPrice(false);
  }

  async function handleStatusChange(newStatus: string) {
    if (!order) return;

    setSavingStatus(true);
    setStatusMessage("");

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      setStatusMessage(
        `Gagal memperbarui status: ${updateError.message}`
      );
      setSavingStatus(false);
      return;
    }

    setOrder((current) =>
      current
        ? {
            ...current,
            status: newStatus,
            updated_at: new Date().toISOString(),
          }
        : current
    );

    setStatusMessage("Status pesanan berhasil diperbarui.");
    setSavingStatus(false);
  }

  function handleFinalFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] || null;

    setFinalFile(file);
    setFinalMessage("");
  }

  async function handleUploadFinalFile() {
    if (!order) return;

    if (!finalFile) {
      setFinalMessage("Pilih file final terlebih dahulu.");
      return;
    }

    setUploadingFinal(true);
    setFinalMessage("");

    try {
      const safeFileName = finalFile.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      const filePath =
        `orders/${order.id}/final/` +
        `${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("pajara-files")
        .upload(filePath, finalFile, {
          cacheControl: "3600",
          upsert: false,
          contentType:
            finalFile.type || "application/octet-stream",
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Sesi admin tidak ditemukan.");
      }

      const { error: insertError } = await supabase
        .from("order_files")
        .insert({
          order_id: order.id,
          revision_id: null,
          file_name: finalFile.name,
          file_path: filePath,
          file_type:
            finalFile.type || "application/octet-stream",
          file_size: finalFile.size,
          file_category: "final",
          uploaded_by: user.id,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setFinalMessage(
        "File final berhasil diupload."
      );

      setFinalFile(null);

      const input = document.getElementById(
        "final-file"
      ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }
    } catch (uploadError) {
      setFinalMessage(
        uploadError instanceof Error
          ? `Gagal upload file: ${uploadError.message}`
          : "Gagal upload file."
      );
    } finally {
      setUploadingFinal(false);
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "32px",
          background: "#f7f4ee",
          color: "#214d32",
        }}
      >
        <p>Memuat detail pesanan...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "32px",
          background: "#f7f4ee",
          color: "#214d32",
        }}
      >
        <h1>Detail Pesanan</h1>
        <p>{error || "Pesanan tidak ditemukan."}</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "#f7f4ee",
        color: "#214d32",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            marginBottom: "8px",
          }}
        >
          Detail Pesanan
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: "24px",
            color: "#8a6a4a",
          }}
        >
          {order.order_code}
        </p>

        <section
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid #e5e0d7",
          }}
        >
          <h2>Informasi Pesanan</h2>

          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            <div>
              <strong>Kode Order</strong>
              <div>{order.order_code}</div>
            </div>

            <div>
              <strong>Layanan</strong>
              <div>{order.service_name || "-"}</div>
            </div>

            <div>
              <strong>Jenis Desain</strong>
              <div>{order.design_type || "-"}</div>
            </div>

            <div>
              <strong>Jumlah</strong>
              <div>{order.quantity ?? "-"}</div>
            </div>

            <div>
              <strong>Brief</strong>
              <div>{order.brief || "-"}</div>
            </div>

            <div>
              <strong>Catatan</strong>
              <div>{order.notes || "-"}</div>
            </div>

            <div>
              <strong>Deadline</strong>
              <div>{formatDate(order.deadline)}</div>
            </div>

            <div>
              <strong>Dibuat</strong>
              <div>{formatDate(order.created_at)}</div>
            </div>

            <div>
              <strong>Status Saat Ini</strong>
              <div>
                {getStatusLabel(order.status)}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid #e5e0d7",
          }}
        >
          <h2>Referensi Customer</h2>

          {referenceFiles.length === 0 ? (
            <p>Belum ada file referensi.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {referenceFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    border: "1px solid #e5e0d7",
                    borderRadius: "12px",
                    padding: "14px",
                  }}
                >
                  <strong>{file.file_name}</strong>

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "14px",
                      color: "#8a6a4a",
                    }}
                  >
                    {file.file_type || "File"}{" "}
                    {file.file_size
                      ? `• ${Math.round(
                          file.file_size / 1024
                        )} KB`
                      : ""}
                  </div>

                  {file.signed_url && (
                    <a
                      href={file.signed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: "12px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "#2f6b45",
                        color: "#ffffff",
                        textDecoration: "none",
                      }}
                    >
                      Buka File
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid #e5e0d7",
          }}
        >
          <h2>Harga & Pembayaran</h2>

          <form onSubmit={handleSavePrice}>
            <div
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              <div>
                <label
                  htmlFor="totalAmount"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  Total Harga
                </label>

                <input
                  id="totalAmount"
                  type="number"
                  min="0"
                  value={totalAmount}
                  onChange={(event) =>
                    calculateDp(event.target.value)
                  }
                  placeholder="Contoh: 150000"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #d7d1c7",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  DP 50%
                </label>

                <div
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    background: "#f7f4ee",
                  }}
                >
                  {formatRupiah(Number(dpAmount) || 0)}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  Sisa
                </label>

                <div
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    background: "#f7f4ee",
                  }}
                >
                  {formatRupiah(
                    Number(remainingAmount) || 0
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPrice}
                style={{
                  padding: "12px 16px",
                  border: 0,
                  borderRadius: "10px",
                  background: "#2f6b45",
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: savingPrice
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {savingPrice
                  ? "Menyimpan..."
                  : "Simpan Harga"}
              </button>

              {priceMessage && (
                <p>{priceMessage}</p>
              )}
            </div>
          </form>
        </section>

        <section
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid #e5e0d7",
          }}
        >
          <h2>Status Pesanan</h2>

          <select
            value={order.status || "pending"}
            onChange={(event) =>
              handleStatusChange(
                event.target.value
              )
            }
            disabled={savingStatus}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d7d1c7",
              background: "#ffffff",
            }}
          >
            <option value="pending">
              Pesanan Baru
            </option>

            <option value="waiting_dp">
              Menunggu DP
            </option>

            <option value="processing">
              Diproses
            </option>

            <option value="revision">
              Revisi
            </option>

            <option value="waiting_payment">
              Menunggu Pelunasan
            </option>

            <option value="completed">
              Selesai
            </option>

            <option value="cancelled">
              Dibatalkan
            </option>
          </select>

          {savingStatus && (
            <p>Menyimpan status...</p>
          )}

          {statusMessage && (
            <p>{statusMessage}</p>
          )}
        </section>

        <section
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid #e5e0d7",
          }}
        >
          <h2>File Final</h2>

          <input
            id="final-file"
            type="file"
            onChange={handleFinalFileChange}
          />

          {finalFile && (
            <p>
              File dipilih:{" "}
              <strong>{finalFile.name}</strong>
            </p>
          )}

          <button
            type="button"
            onClick={handleUploadFinalFile}
            disabled={
              uploadingFinal || !finalFile
            }
            style={{
              marginTop: "12px",
              padding: "12px 16px",
              border: 0,
              borderRadius: "10px",
              background: "#2f6b45",
              color: "#ffffff",
              fontWeight: 600,
              cursor:
                uploadingFinal || !finalFile
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {uploadingFinal
              ? "Mengupload..."
              : "Upload File Final"}
          </button>

          {finalMessage && (
            <p>{finalMessage}</p>
          )}
        </section>
      </div>
    </main>
  );
}
