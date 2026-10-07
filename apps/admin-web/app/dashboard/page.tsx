"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type NotificationItem = {
  id: string;
  order_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  const [totalOrders, setTotalOrders] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [processingOrders, setProcessingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.user) {
        router.replace("/");
        return;
      }

      const user = sessionData.session.user;

      const { data: profile, error: profileError } = await supabase
        .from("profiles_v2")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        router.replace("/");
        return;
      }

      setAdminEmail(user.email || "");

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("status");

      if (!ordersError && orders) {
        setTotalOrders(orders.length);

        setNewOrders(
          orders.filter((order) => order.status === "pending").length
        );

        setProcessingOrders(
          orders.filter((order) => order.status === "processing").length
        );

        setCompletedOrders(
          orders.filter((order) => order.status === "completed").length
        );
      }

      await loadNotifications(user.id);
      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  async function loadNotifications(userId: string) {
    setNotificationLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select(
        "id, order_id, type, title, message, is_read, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setNotifications(data);
    }

    setNotificationLoading(false);
  }

  async function markAsRead(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (!error) {
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications
      .filter((notification) => !notification.is_read)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) {
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    if (!error) {
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  function formatNotificationDate(date: string) {
    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });
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
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "3px solid #dfe8e1",
              borderTopColor: "#2f6b45",
              margin: "0 auto 14px",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Memuat Pajara Admin...
          </p>
        </div>
      </main>
    );
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const stats = [
    {
      label: "Total Pesanan",
      value: totalOrders,
      symbol: "01",
    },
    {
      label: "Pesanan Baru",
      value: newOrders,
      symbol: "02",
    },
    {
      label: "Diproses",
      value: processingOrders,
      symbol: "03",
    },
    {
      label: "Selesai",
      value: completedOrders,
      symbol: "04",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        color: "#214d32",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <header
        style={{
          background: "#214d32",
          color: "#ffffff",
          padding: "18px 20px",
          position: "sticky",
          top: 0,
          zIndex: 20,
          boxShadow: "0 8px 30px rgba(33,77,50,0.12)",
        }}
      >
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                letterSpacing: "2px",
                fontWeight: 700,
                opacity: 0.7,
              }}
            >
              PAJARA STUDIO
            </p>

            <h1
              style={{
                margin: "3px 0 0",
                fontSize: "21px",
                letterSpacing: "-0.4px",
              }}
            >
              Admin Dashboard
            </h1>
          </div>

          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: 800,
            }}
          >
            PS
          </div>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "28px 20px 40px",
        }}
      >
        <section
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #f4f7f2 100%)",
            borderRadius: "22px",
            padding: "24px",
            marginBottom: "18px",
            border: "1px solid #e6ebe5",
            boxShadow: "0 12px 35px rgba(33,77,50,0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "18px",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#8a6a4a",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                }}
              >
                Selamat datang kembali
              </p>

              <h2
                style={{
                  margin: "7px 0 6px",
                  color: "#214d32",
                  fontSize: "25px",
                  lineHeight: 1.15,
                  letterSpacing: "-0.6px",
                }}
              >
                Admin Pajara
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#737973",
                  fontSize: "13px",
                  wordBreak: "break-word",
                }}
              >
                {adminEmail}
              </p>
            </div>

            <div
              style={{
                minWidth: "48px",
                height: "48px",
                borderRadius: "15px",
                background: "#e8f0e9",
                color: "#2f6b45",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "15px",
              }}
            >
              A
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "18px",
                border: "1px solid #e8ebe7",
                boxShadow: "0 8px 24px rgba(33,77,50,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    color: "#8a6a4a",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                  }}
                >
                  {stat.symbol}
                </span>

                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#2f6b45",
                  }}
                />
              </div>

              <p
                style={{
                  margin: "15px 0 5px",
                  color: "#747a75",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {stat.label}
              </p>

              <h3
                style={{
                  margin: 0,
                  color: "#214d32",
                  fontSize: "29px",
                  lineHeight: 1,
                  letterSpacing: "-1px",
                }}
              >
                {stat.value}
              </h3>
            </div>
          ))}
        </section>

        <section
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "21px",
            marginBottom: "18px",
            border: "1px solid #e8ebe7",
            boxShadow: "0 8px 26px rgba(33,77,50,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "15px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#214d32",
                    fontSize: "18px",
                    letterSpacing: "-0.2px",
                  }}
                >
                  Notifikasi
                </h2>

                {unreadCount > 0 && (
                  <span
                    style={{
                      minWidth: "22px",
                      height: "22px",
                      padding: "0 6px",
                      borderRadius: "999px",
                      background: "#2f6b45",
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 800,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#8a908b",
                  fontSize: "12px",
                }}
              >
                Pembaruan terbaru sistem
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                style={{
                  border: "none",
                  background: "#eef4ef",
                  color: "#2f6b45",
                  borderRadius: "9px",
                  padding: "9px 11px",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Tandai dibaca
              </button>
            )}
          </div>

          {notificationLoading ? (
            <div
              style={{
                padding: "20px 0",
                color: "#858b86",
                fontSize: "13px",
              }}
            >
              Memuat notifikasi...
            </div>
          ) : notifications.length === 0 ? (
            <div
              style={{
                padding: "25px 16px",
                textAlign: "center",
                background: "#fafbf9",
                borderRadius: "14px",
                border: "1px dashed #dfe5df",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  marginBottom: "7px",
                }}
              >
                —
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#777d78",
                  fontSize: "13px",
                }}
              >
                Belum ada notifikasi.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "9px",
              }}
            >
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                  }}
                  style={{
                    padding: "14px",
                    borderRadius: "14px",
                    background: notification.is_read
                      ? "#fafbf9"
                      : "#eef5ef",
                    border: notification.is_read
                      ? "1px solid #edf0ec"
                      : "1px solid #cddfce",
                    cursor: notification.is_read
                      ? "default"
                      : "pointer",
                    transition: "0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: 0,
                          color: "#214d32",
                          fontWeight: 800,
                          fontSize: "13px",
                        }}
                      >
                        {notification.title}
                      </p>

                      <p
                        style={{
                          margin: "5px 0",
                          color: "#5f665f",
                          fontSize: "13px",
                          lineHeight: 1.5,
                        }}
                      >
                        {notification.message}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color: "#9a9e9a",
                          fontSize: "11px",
                        }}
                      >
                        {formatNotificationDate(
                          notification.created_at
                        )}
                      </p>
                    </div>

                    {!notification.is_read && (
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#2f6b45",
                          flexShrink: 0,
                          marginTop: "4px",
                          boxShadow: "0 0 0 4px #dcebdd",
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          style={{
            background: "#214d32",
            color: "#ffffff",
            borderRadius: "20px",
            padding: "22px",
            marginBottom: "18px",
            boxShadow: "0 10px 30px rgba(33,77,50,0.13)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "16px",
              marginBottom: "18px",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#c9d9cc",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                }}
              >
                Workspace
              </p>

              <h2
                style={{
                  margin: "6px 0 5px",
                  fontSize: "20px",
                  letterSpacing: "-0.3px",
                }}
              >
                Pesanan
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#d8e2d9",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                Kelola dan lihat semua pesanan pelanggan.
              </p>
            </div>

            <span
              style={{
                fontSize: "22px",
                opacity: 0.7,
              }}
            >
              →
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/orders")}
            style={{
              width: "100%",
              height: "48px",
              border: "none",
              borderRadius: "12px",
              background: "#ffffff",
              color: "#214d32",
              fontSize: "14px",
              fontWeight: 800,
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            Lihat Semua Pesanan
          </button>
        </section>

        <section
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "21px",
            marginBottom: "18px",
            border: "1px solid #e8ebe7",
            boxShadow: "0 8px 26px rgba(33,77,50,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#8a6a4a",
              }}
            />

            <h2
              style={{
                margin: 0,
                color: "#214d32",
                fontSize: "18px",
              }}
            >
              Aktivitas Terbaru
            </h2>
          </div>

          <p
            style={{
              margin: 0,
              color: "#858b86",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            Belum ada aktivitas terbaru.
          </p>
        </section>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            height: "48px",
            border: "1px solid #d8cfc6",
            borderRadius: "12px",
            background: "transparent",
            color: "#8a6a4a",
            fontSize: "13px",
            fontWeight: 800,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          Keluar dari Admin
        </button>

        <p
          style={{
            margin: "22px 0 0",
            textAlign: "center",
            color: "#9b9d99",
            fontSize: "10px",
            letterSpacing: "0.8px",
          }}
        >
          PAJARA STUDIO • BERAKAR DI TANAH PASUNDAN
        </p>
      </section>
    </main>
  );
}
