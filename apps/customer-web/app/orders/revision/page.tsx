"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@pajara/supabase";

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  status: string | null;
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
      return {
        background: "#fff4df",
        color: "#8a6a4a",
      };

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
      return {
        background: "#fbe9e9",
        color: "#a33a3a",
      };

    default:
      return {
        background: "#f0f0f0",
        color: "#666",
      };
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

function RevisionContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [customerNote, setCustomerNote] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("id, order_code, service_name, status")
          .eq("id", id)
          .eq("customer_id", user.id)
          .maybeSingle();

        if (orderError) {
          console.error("Gagal mengambil pesanan:", orderError);
          setError("Pesanan gagal dimuat.");
          setLoading(false);
          return;
        }

        setOrder(orderData);

        if (!orderData) {
          setLoading(false);
          return;
        }

        const { data: revisionData, error: revisionError } =
          await supabase
            .from("revisions")
            .select(
              "id, order_id, revision_number, customer_note, admin_note, status, created_by, created_at, updated_at"
            )
            .eq("order_id", orderData.id)
            .order("revision_number", {
              ascending: false,
            });

        if (revisionError) {
          console.error(
            "Gagal mengambil riwayat revisi:",
            revisionError
          );

          setError("Riwayat revisi gagal dimuat.");
        } else {
          setRevisions(revisionData || []);
        }
      } catch (loadError) {
        console.error("Gagal memuat data revisi:", loadError);
        setError("Terjadi kesalahan saat memuat halaman.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function handleSubmitRevision() {
    setError(null);
    setSuccess(null);

    const trimmedNote = customerNote.trim();

    if (!trimmedNote) {
      setError("Tuliskan detail revisi terlebih dahulu.");
      return;
    }

    if (trimmedNote.length < 5) {
      setError("Detail revisi terlalu singkat.");
      return;
    }

    if (!order) {
      setError("Pesanan tidak ditemukan.");
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
        });

      if (insertError) {
        console.error(
          "Gagal mengajukan revisi:",
          insertError
        );

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

      const { data: newRevision } = await supabase
        .from("revisions")
        .select(
          "id, order_id, revision_number, customer_note, admin_note, status, created_by, created_at, updated_at"
        )
        .eq("order_id", order.id)
        .eq("revision_number", nextRevisionNumber)
        .maybeSingle();

      if (newRevision) {
        setRevisions((current) => [
          newRevision,
          ...current,
        ]);
      }

      setCustomerNote("");
      setOrder((current) =>
        current
          ? {
              ...current,
              status: "revision",
            }
          : current
      );

      setSuccess(
        `Revisi #${nextRevisionNumber} berhasil diajukan. Pajara Studio akan segera memprosesnya.`
      );
    } catch (submitError) {
      console.error(
        "Terjadi kesalahan saat mengajukan revisi:",
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
          <p
            style={{
              color: "var(--green)",
            }}
          >
            Memuat revisi...
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
          <h1
            style={{
              color: "var(--green-dark)",
            }}
          >
            Pesanan tidak ditemukan
          </h1>

          <p
            style={{
              color: "#666",
              lineHeight: 1.7,
            }}
          >
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

  const activeRevision = revisions.find(
    (revision) =>
      revision.status === "pending" ||
      revision.status === "processing"
  );

  const canSubmit =
    order.status === "completed" &&
    !activeRevision;

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

        <div
          style={{
            marginTop: "28px",
          }}
        >
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

          <p
            style={{
              color: "#666",
              marginBottom: 0,
            }}
          >
            {order.service_name || "Layanan Pajara Studio"}
          </p>
        </div>

        {error && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px 18px",
              borderRadius: "14px",
              background: "#fbe9e9",
              border: "1px solid #edcaca",
              color: "#9a3333",
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px 18px",
              borderRadius: "14px",
              background: "#e8f2ec",
              border: "1px solid #c9dfd0",
              color: "var(--green-dark)",
              lineHeight: 1.6,
            }}
          >
            {success}
          </div>
        )}

        {canSubmit && (
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
                marginBottom: "8px",
              }}
            >
              Ajukan Revisi
            </h2>

            <p
              style={{
                color: "#666",
                lineHeight: 1.7,
                marginTop: 0,
              }}
            >
              Jelaskan bagian desain yang ingin diperbaiki
              dengan jelas agar tim Pajara Studio dapat
              memproses revisi dengan tepat.
            </p>

            <label
              htmlFor="revision-note"
              style={{
                display: "block",
                color: "var(--green-dark)",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              Detail Revisi
            </label>

            <textarea
              id="revision-note"
              value={customerNote}
              onChange={(event) =>
                setCustomerNote(event.target.value)
              }
              placeholder="Contoh: Tolong ubah warna background menjadi lebih terang dan ganti teks judul..."
              rows={7}
              disabled={submitting}
              style={{
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                border: "1px solid #d9d1c6",
                borderRadius: "14px",
                padding: "14px 16px",
                fontSize: "15px",
                lineHeight: 1.6,
                color: "#333",
                background: "#fff",
                outline: "none",
                fontFamily: "inherit",
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
              Jelaskan perubahan yang diinginkan secara
              spesifik.
            </p>

            <button
              type="button"
              onClick={handleSubmitRevision}
              disabled={submitting || !customerNote.trim()}
              style={{
                marginTop: "8px",
                border: "none",
                borderRadius: "12px",
                padding: "13px 20px",
                background:
                  submitting || !customerNote.trim()
                    ? "#c9c9c9"
                    : "var(--green)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
                cursor:
                  submitting || !customerNote.trim()
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  submitting || !customerNote.trim()
                    ? 0.75
                    : 1,
              }}
            >
              {submitting
                ? "Mengajukan..."
                : "Ajukan Revisi"}
            </button>
          </section>
        )}

        {order.status !== "completed" &&
          !activeRevision && (
            <section
              style={{
                marginTop: "28px",
                background: "#fff",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid #e8e2d8",
              }}
            >
              <h2
                style={{
                  color: "var(--green-dark)",
                  marginTop: 0,
                }}
              >
                Revisi Belum Tersedia
              </h2>

              <p
                style={{
                  color: "#666",
                  lineHeight: 1.7,
                  marginBottom: 0,
                }}
              >
                Pengajuan revisi dapat dilakukan setelah
                pesanan selesai dan file final tersedia.
              </p>
            </section>
          )}

        {activeRevision && (
          <section
            style={{
              marginTop: "28px",
              background: "#fff",
              borderRadius: "18px",
              padding: "24px",
              border: "1px solid #e8e2d8",
            }}
          >
            <h2
              style={{
                color: "var(--green-dark)",
                marginTop: 0,
                marginBottom: "8px",
              }}
            >
              Revisi Sedang Diproses
            </h2>

            <p
              style={{
                color: "#666",
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              Revisi #{activeRevision.revision_number} sedang
              diproses oleh tim Pajara Studio. Tunggu sampai
              revisi selesai sebelum mengajukan revisi berikutnya.
            </p>
          </section>
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
              marginBottom: "18px",
            }}
          >
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
              <strong
                style={{
                  color: "var(--green-dark)",
                }}
              >
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
            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              {revisions.map((revision) => {
                const statusStyle =
                  getRevisionStatusStyle(
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
                        </strong>

                        <p
                          style={{
                            color: "#888",
                            fontSize: "13px",
                            margin: "6px 0 0",
                          }}
                        >
                          {formatDate(
                            revision.created_at
                          )}
                        </p>
                      </div>

                      <span
                        style={{
                          display: "inline-block",
                          padding: "7px 11px",
                          borderRadius: "999px",
                          background:
                            statusStyle.background,
                          color: statusStyle.color,
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        {getRevisionStatusLabel(
                          revision.status
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "18px",
                      }}
                    >
                      <p
                        style={{
                          color: "#555",
                          fontSize: "13px",
                          fontWeight: 700,
                          marginBottom: "7px",
                        }}
                      >
                        Permintaan Revisi
                      </p>

                      <div
                        style={{
                          background: "var(--cream)",
                          borderRadius: "12px",
                          padding: "14px",
                          color: "#555",
                          lineHeight: 1.7,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {revision.customer_note ||
                          "Tidak ada catatan revisi."}
                      </div>
                    </div>

                    {revision.admin_note && (
                      <div
                        style={{
                          marginTop: "16px",
                        }}
                      >
                        <p
                          style={{
                            color:
                              "var(--green-dark)",
                            fontSize: "13px",
                            fontWeight: 700,
                            marginBottom: "7px",
                          }}
                        >
                          Catatan Pajara Studio
                        </p>

                        <div
                          style={{
                            background: "#f5f7f5",
                            borderRadius: "12px",
                            padding: "14px",
                            color: "#555",
                            lineHeight: 1.7,
                            whiteSpace: "pre-wrap",
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
      </div>
    </main>
  );
}

function RevisionFallback() {
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
        <p
          style={{
            color: "var(--green)",
          }}
        >
          Memuat revisi...
        </p>
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
