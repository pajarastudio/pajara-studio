"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Order = {
  id: string;
  order_code: string;
  service_name: string | null;
  design_type: string | null;
  quantity: number | null;
  total_amount: number | null;
  status: string | null;
  deadline: string | null;
  created_at: string | null;
};

type SubscriptionPayment = {
  id: string;
  subscription_id: string;
  customer_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string | null;
  status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  plan_name: string;
};

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<
    SubscriptionPayment[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [loadingPayments, setLoadingPayments] =
    useState(true);

  const [message, setMessage] = useState("");
  const [paymentMessage, setPaymentMessage] =
    useState("");

  const [verifyingPaymentId, setVerifyingPaymentId] =
    useState<string | null>(null);

  const [rejectingPaymentId, setRejectingPaymentId] =
    useState<string | null>(null);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    setLoadingPayments(true);
    setMessage("");
    setPaymentMessage("");

    const {
      data: sessionData,
    } = await supabase.auth.getSession();

    if (!sessionData.session?.user) {
      router.replace("/");
      return;
    }

    const user = sessionData.session.user;

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles_v2")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      profile.role !== "admin"
    ) {
      await supabase.auth.signOut();
      router.replace("/");
      return;
    }

    await Promise.all([
      loadOrders(),
      loadSubscriptionPayments(),
    ]);

    setLoading(false);
  }

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_code, service_name, design_type, quantity, total_amount, status, deadline, created_at"
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setMessage(
        "Gagal memuat pesanan: " +
          error.message
      );
      setOrders([]);
      return;
    }

    setOrders(data || []);
  }

  async function loadSubscriptionPayments() {
    setLoadingPayments(true);

    const {
      data: paymentsData,
      error: paymentsError,
    } = await supabase
      .from("subscription_payments")
      .select(
        `
          id,
          subscription_id,
          customer_id,
          amount,
          payment_method,
          transaction_id,
          status,
          created_at,
          subscriptions (
            plan_id,
            subscription_plans (
              name
            )
          ),
          profiles_v2!subscription_payments_customer_id_fkey (
            full_name,
            email
          )
        `
      )
      .order("created_at", {
        ascending: false,
      });

    if (paymentsError) {
      console.error(
        "Gagal memuat pembayaran paket:",
        paymentsError
      );

      setPaymentMessage(
        "Gagal memuat pembayaran paket: " +
          paymentsError.message
      );

      setPayments([]);
      setLoadingPayments(false);
      return;
    }

    const normalizedPayments: SubscriptionPayment[] =
      (paymentsData || []).map((payment: any) => {
        const subscription =
          Array.isArray(payment.subscriptions)
            ? payment.subscriptions[0]
            : payment.subscriptions;

        const plan =
          subscription?.subscription_plans;

        const profile =
          Array.isArray(payment.profiles_v2)
            ? payment.profiles_v2[0]
            : payment.profiles_v2;

        return {
          id: payment.id,
          subscription_id:
            payment.subscription_id,
          customer_id:
            payment.customer_id,
          amount:
            Number(payment.amount) || 0,
          payment_method:
            payment.payment_method,
          transaction_id:
            payment.transaction_id,
          status: payment.status,
          created_at:
            payment.created_at,
          customer_name:
            profile?.full_name ||
            "Customer",
          customer_email:
            profile?.email ||
            "-",
          plan_name:
            plan?.name ||
            "Paket",
        };
      });

    setPayments(normalizedPayments);
    setLoadingPayments(false);
  }

  function formatRupiah(
    value: number | null
  ) {
    if (value === null) {
      return "Rp0";
    }

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  }

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return "-";
    }

    return new Date(
      value
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(
    value: string | null
  ) {
    if (!value) {
      return "-";
    }

    return new Date(
      value
    ).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusLabel(
    status: string | null
  ) {
    if (status === "pending") {
      return "Pesanan Baru";
    }

    if (status === "processing") {
      return "Diproses";
    }

    if (status === "completed") {
      return "Selesai";
    }

    if (status === "cancelled") {
      return "Dibatalkan";
    }

    return (
      status ||
      "Tidak diketahui"
    );
  }

  function paymentMethodLabel(
    method: string | null
  ) {
    if (!method) {
      return "-";
    }

    const normalized =
      method.toLowerCase();

    if (normalized === "qris") {
      return "QRIS";
    }

    if (normalized === "dana") {
      return "DANA";
    }

    if (normalized === "gopay") {
      return "GoPay";
    }

    if (normalized === "seabank") {
      return "SeaBank";
    }

    return method;
  }

  function paymentStatusLabel(
    status: string
  ) {
    if (status === "pending") {
      return "Menunggu Verifikasi";
    }

    if (status === "verified") {
      return "Terverifikasi";
    }

    if (status === "rejected") {
      return "Ditolak";
    }

    return status;
  }

  function paymentStatusStyle(
    status: string
  ) {
    if (status === "verified") {
      return {
        background: "#e7f2e9",
        color: "#214d32",
      };
    }

    if (status === "rejected") {
      return {
        background: "#f5e4e0",
        color: "#8a3f32",
      };
    }

    return {
      background: "#f4eadf",
      color: "#8a6a4a",
    };
  }

  async function verifyPayment(
    payment: SubscriptionPayment
  ) {
    const confirmed =
      window.confirm(
        `Verifikasi pembayaran ${payment.plan_name} sebesar ${formatRupiah(
          payment.amount
        )} dari ${payment.customer_name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setVerifyingPaymentId(
        payment.id
      );
      setPaymentMessage("");

      const {
        data: {
          user,
        },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Sesi Admin tidak ditemukan."
        );
      }

      const {
        error: updateError,
      } = await supabase
        .from("subscription_payments")
        .update({
          status: "verified",
          verified_by: user.id,
          verified_at:
            new Date().toISOString(),
        })
        .eq("id", payment.id)
        .eq("status", "pending");

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      await loadSubscriptionPayments();

      setPaymentMessage(
        `Pembayaran ${payment.plan_name} berhasil diverifikasi. Paket customer akan diaktifkan otomatis oleh sistem.`
      );
    } catch (error) {
      console.error(
        "Gagal memverifikasi pembayaran:",
        error
      );

      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "Gagal memverifikasi pembayaran."
      );
    } finally {
      setVerifyingPaymentId(null);
    }
  }

  async function rejectPayment(
    payment: SubscriptionPayment
  ) {
    const confirmed =
      window.confirm(
        `Tolak pembayaran ${payment.plan_name} dari ${payment.customer_name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setRejectingPaymentId(
        payment.id
      );
      setPaymentMessage("");

      const {
        error: updateError,
      } = await supabase
        .from("subscription_payments")
        .update({
          status: "rejected",
        })
        .eq("id", payment.id)
        .eq("status", "pending");

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      await loadSubscriptionPayments();

      setPaymentMessage(
        `Pembayaran ${payment.plan_name} ditolak.`
      );
    } catch (error) {
      console.error(
        "Gagal menolak pembayaran:",
        error
      );

      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "Gagal menolak pembayaran."
      );
    } finally {
      setRejectingPaymentId(null);
    }
  }

  async function openPaymentProof(
    payment: SubscriptionPayment
  ) {
    try {
      const {
        data: files,
        error: filesError,
      } = await supabase
        .from(
          "subscription_payment_files"
        )
        .select(
          "id, file_name, storage_path, mime_type"
        )
        .eq(
          "subscription_payment_id",
          payment.id
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(1);

      if (filesError) {
        throw new Error(
          filesError.message
        );
      }

      if (
        !files ||
        files.length === 0
      ) {
        throw new Error(
          "Bukti pembayaran belum ditemukan."
        );
      }

      const file = files[0];

      const {
        data: signedData,
        error: signedError,
      } = await supabase.storage
        .from("pajara-files")
        .createSignedUrl(
          file.storage_path,
          60 * 60
        );

      if (
        signedError ||
        !signedData?.signedUrl
      ) {
        throw new Error(
          signedError?.message ||
            "Link bukti pembayaran tidak dapat dibuat."
        );
      }

      window.open(
        signedData.signedUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error(
        "Gagal membuka bukti pembayaran:",
        error
      );

      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "Bukti pembayaran gagal dibuka."
      );
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f4ee",
          color: "#214d32",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        Memuat pesanan...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <header
        style={{
          background: "#214d32",
          color: "#ffffff",
          padding: "22px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            style={{
              border: "none",
              background:
                "transparent",
              color: "#ffffff",
              padding: 0,
              marginBottom:
                "14px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ← Kembali ke Dashboard
          </button>

          <h1
            style={{
              margin: 0,
              fontSize: "25px",
            }}
          >
            Pesanan Pajara
          </h1>

          <p
            style={{
              margin:
                "6px 0 0",
              opacity: 0.85,
              fontSize: "14px",
            }}
          >
            Kelola semua pesanan
            pelanggan
          </p>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding:
            "28px 20px",
        }}
      >
        {message && (
          <div
            style={{
              background:
                "#ffffff",
              borderRadius:
                "14px",
              padding: "18px",
              marginBottom:
                "18px",
              color: "#8a6a4a",
              boxShadow:
                "0 5px 18px rgba(0,0,0,0.05)",
            }}
          >
            {message}
          </div>
        )}

        {/* PEMBAYARAN PAKET */}

        <div
          style={{
            background:
              "#ffffff",
            borderRadius:
              "18px",
            padding: "20px",
            marginBottom:
              "28px",
            boxShadow:
              "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-start",
              gap: "12px",
              flexWrap:
                "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#8a6a4a",
                  fontSize:
                    "12px",
                  fontWeight:
                    700,
                  letterSpacing:
                    "0.1em",
                }}
              >
                PEMBAYARAN
                PAKET
              </p>

              <h2
                style={{
                  margin:
                    "7px 0 0",
                  color:
                    "#214d32",
                  fontSize:
                    "22px",
                }}
              >
                Verifikasi
                Pembelian Paket
              </h2>

              <p
                style={{
                  margin:
                    "7px 0 0",
                  color:
                    "#777",
                  fontSize:
                    "14px",
                  lineHeight:
                    1.6,
                }}
              >
                Periksa bukti
                pembayaran
                sebelum
                mengaktifkan
                paket customer.
              </p>
            </div>

            <span
              style={{
                padding:
                  "7px 11px",
                borderRadius:
                  "999px",
                background:
                  "#f4eadf",
                color:
                  "#8a6a4a",
                fontSize:
                  "12px",
                fontWeight:
                  700,
              }}
            >
              {
                payments.filter(
                  (payment) =>
                    payment.status ===
                    "pending"
                ).length
              }{" "}
              Menunggu
            </span>
          </div>

          {paymentMessage && (
            <div
              style={{
                marginTop:
                  "18px",
                padding:
                  "14px 16px",
                borderRadius:
                  "12px",
                background:
                  "#f7f4ee",
                color:
                  "#214d32",
                fontSize:
                  "13px",
                lineHeight:
                  1.6,
              }}
            >
              {paymentMessage}
            </div>
          )}

          {loadingPayments ? (
            <div
              style={{
                marginTop:
                  "18px",
                padding:
                  "18px",
                borderRadius:
                  "12px",
                background:
                  "#f7f4ee",
                color:
                  "#777",
              }}
            >
              Memuat pembayaran
              paket...
            </div>
          ) : payments.length ===
            0 ? (
            <div
              style={{
                marginTop:
                  "18px",
                padding:
                  "22px",
                borderRadius:
                  "12px",
                background:
                  "#f7f4ee",
                color:
                  "#777",
                textAlign:
                  "center",
                fontSize:
                  "14px",
              }}
            >
              Belum ada
              pembayaran paket.
            </div>
          ) : (
            <div
              style={{
                display:
                  "grid",
                gap:
                  "14px",
                marginTop:
                  "20px",
              }}
            >
              {payments.map(
                (payment) => {
                  const statusStyle =
                    paymentStatusStyle(
                      payment.status
                    );

                  const isVerifying =
                    verifyingPaymentId ===
                    payment.id;

                  const isRejecting =
                    rejectingPaymentId ===
                    payment.id;

                  return (
                    <div
                      key={
                        payment.id
                      }
                      style={{
                        border:
                          "1px solid #e8e1d8",
                        borderRadius:
                          "14px",
                        padding:
                          "16px",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          gap:
                            "12px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <div
                          style={{
                            minWidth: 0,
                            flex:
                              "1 1 220px",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              color:
                                "#214d32",
                              fontWeight:
                                700,
                              fontSize:
                                "17px",
                            }}
                          >
                            {
                              payment.plan_name
                            }
                          </p>

                          <p
                            style={{
                              margin:
                                "6px 0 0",
                              color:
                                "#555",
                              fontSize:
                                "14px",
                            }}
                          >
                            {
                              payment.customer_name
                            }
                          </p>

                          <p
                            style={{
                              margin:
                                "3px 0 0",
                              color:
                                "#888",
                              fontSize:
                                "12px",
                              wordBreak:
                                "break-word",
                            }}
                          >
                            {
                              payment.customer_email
                            }
                          </p>
                        </div>

                        <span
                          style={{
                            padding:
                              "7px 10px",
                            borderRadius:
                              "999px",
                            background:
                              statusStyle.background,
                            color:
                              statusStyle.color,
                            fontSize:
                              "11px",
                            fontWeight:
                              700,
                          }}
                        >
                          {
                            paymentStatusLabel(
                              payment.status
                            )
                          }
                        </span>
                      </div>

                      <div
                        style={{
                          display:
                            "grid",
                          gap:
                            "8px",
                          marginTop:
                            "16px",
                          paddingTop:
                            "14px",
                          borderTop:
                            "1px solid #eee8df",
                          fontSize:
                            "13px",
                          color:
                            "#555",
                        }}
                      >
                        <div>
                          <strong>
                            Nominal:
                          </strong>{" "}
                          {formatRupiah(
                            payment.amount
                          )}
                        </div>

                        <div>
                          <strong>
                            Metode:
                          </strong>{" "}
                          {paymentMethodLabel(
                            payment.payment_method
                          )}
                        </div>

                        <div>
                          <strong>
                            ID Transaksi:
                          </strong>{" "}
                          {payment.transaction_id ||
                            "Tidak diisi"}
                        </div>

                        <div>
                          <strong>
                            Dikirim:
                          </strong>{" "}
                          {formatDateTime(
                            payment.created_at
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display:
                            "grid",
                          gap:
                            "10px",
                          marginTop:
                            "16px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            openPaymentProof(
                              payment
                            )
                          }
                          style={{
                            width:
                              "100%",
                            minHeight:
                              "44px",
                            border:
                              "1px solid #2f6b45",
                            borderRadius:
                              "10px",
                            background:
                              "#ffffff",
                            color:
                              "#2f6b45",
                            fontSize:
                              "14px",
                            fontWeight:
                              700,
                            cursor:
                              "pointer",
                          }}
                        >
                          Lihat Bukti
                          Pembayaran
                        </button>

                        {payment.status ===
                          "pending" && (
                          <div
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "1fr 1fr",
                              gap:
                                "10px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                rejectPayment(
                                  payment
                                )
                              }
                              disabled={
                                isRejecting ||
                                isVerifying
                              }
                              style={{
                                minHeight:
                                  "44px",
                                border:
                                  "1px solid #8a6a4a",
                                borderRadius:
                                  "10px",
                                background:
                                  "#ffffff",
                                color:
                                  "#8a6a4a",
                                fontSize:
                                  "14px",
                                fontWeight:
                                  700,
                                cursor:
                                  isRejecting ||
                                  isVerifying
                                    ? "wait"
                                    : "pointer",
                                opacity:
                                  isRejecting ||
                                  isVerifying
                                    ? 0.6
                                    : 1,
                              }}
                            >
                              {isRejecting
                                ? "Menolak..."
                                : "Tolak"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                verifyPayment(
                                  payment
                                )
                              }
                              disabled={
                                isRejecting ||
                                isVerifying
                              }
                              style={{
                                minHeight:
                                  "44px",
                                border:
                                  "none",
                                borderRadius:
                                  "10px",
                                background:
                                  "#2f6b45",
                                color:
                                  "#ffffff",
                                fontSize:
                                  "14px",
                                fontWeight:
                                  700,
                                cursor:
                                  isRejecting ||
                                  isVerifying
                                    ? "wait"
                                    : "pointer",
                                opacity:
                                  isRejecting ||
                                  isVerifying
                                    ? 0.6
                                    : 1,
                              }}
                            >
                              {isVerifying
                                ? "Memverifikasi..."
                                : "Verifikasi"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* PESANAN DESAIN */}

        <div>
          <div
            style={{
              marginBottom:
                "16px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#8a6a4a",
                fontSize:
                  "12px",
                fontWeight: 700,
                letterSpacing:
                  "0.1em",
              }}
            >
              ORDER
            </p>

            <h2
              style={{
                margin:
                  "7px 0 0",
                color:
                  "#214d32",
                fontSize:
                  "22px",
              }}
            >
              Pesanan Desain
            </h2>
          </div>

          {orders.length ===
          0 ? (
            <div
              style={{
                background:
                  "#ffffff",
                borderRadius:
                  "16px",
                padding:
                  "30px 20px",
                textAlign:
                  "center",
                boxShadow:
                  "0 6px 20px rgba(0,0,0,0.06)",
              }}
            >
              <h2
                style={{
                  margin:
                    "0 0 8px",
                  color:
                    "#214d32",
                }}
              >
                Belum ada
                pesanan
              </h2>

              <p
                style={{
                  margin: 0,
                  color:
                    "#777",
                  fontSize:
                    "14px",
                }}
              >
                Pesanan
                pelanggan akan
                muncul di sini.
              </p>
            </div>
          ) : (
            <div
              style={{
                display:
                  "grid",
                gap:
                  "16px",
              }}
            >
              {orders.map(
                (order) => (
                  <div
                    key={
                      order.id
                    }
                    style={{
                      background:
                        "#ffffff",
                      borderRadius:
                        "16px",
                      padding:
                        "20px",
                      boxShadow:
                        "0 6px 20px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap:
                          "12px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            color:
                              "#8a6a4a",
                            fontSize:
                              "13px",
                          }}
                        >
                          Kode Pesanan
                        </p>

                        <h2
                          style={{
                            margin:
                              "5px 0 0",
                            color:
                              "#214d32",
                            fontSize:
                              "20px",
                          }}
                        >
                          {
                            order.order_code
                          }
                        </h2>
                      </div>

                      <span
                        style={{
                          display:
                            "inline-block",
                          padding:
                            "7px 11px",
                          borderRadius:
                            "999px",
                          background:
                            order.status ===
                            "completed"
                              ? "#e7f2e9"
                              : "#f4eadf",
                          color:
                            "#214d32",
                          fontSize:
                            "12px",
                          fontWeight:
                            "bold",
                        }}
                      >
                        {statusLabel(
                          order.status
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop:
                          "18px",
                        display:
                          "grid",
                        gap:
                          "9px",
                        color:
                          "#555",
                        fontSize:
                          "14px",
                      }}
                    >
                      <div>
                        <strong>
                          Layanan:
                        </strong>{" "}
                        {order.service_name ||
                          "-"}
                      </div>

                      <div>
                        <strong>
                          Jenis:
                        </strong>{" "}
                        {order.design_type ||
                          "-"}
                      </div>

                      <div>
                        <strong>
                          Jumlah:
                        </strong>{" "}
                        {order.quantity ??
                          0}
                      </div>

                      <div>
                        <strong>
                          Total:
                        </strong>{" "}
                        {formatRupiah(
                          order.total_amount
                        )}
                      </div>

                      <div>
                        <strong>
                          Deadline:
                        </strong>{" "}
                        {formatDate(
                          order.deadline
                        )}
                      </div>

                      <div>
                        <strong>
                          Dibuat:
                        </strong>{" "}
                        {formatDate(
                          order.created_at
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/orders/detail?id=${order.id}`
                        )
                      }
                      style={{
                        width:
                          "100%",
                        height:
                          "46px",
                        marginTop:
                          "18px",
                        border:
                          "none",
                        borderRadius:
                          "10px",
                        background:
                          "#2f6b45",
                        color:
                          "#ffffff",
                        fontSize:
                          "14px",
                        fontWeight:
                          "bold",
                        cursor:
                          "pointer",
                        touchAction:
                          "manipulation",
                      }}
                    >
                      Lihat Detail
                      Pesanan
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
