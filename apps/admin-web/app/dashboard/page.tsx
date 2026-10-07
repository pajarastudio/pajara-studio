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

      if (
        profileError ||
        !profile ||
        profile.role !== "admin"
      ) {
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
          fontFamily: "Arial, sans-serif",
          color: "#214d32",
        }}
      >
        Memuat Dashboard Admin...
      </main>
    );
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        fontFamily: "Arial, sans-serif",
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
          <h1
            style={{
              margin: 0,
              fontSize: "25px",
            }}
          >
            PAJARA STUDIO
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              opacity: 0.85,
              fontSize: "14px",
            }}
          >
            Admin Dashboard
          </p>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "28px 20px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "20px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#8a6a4a",
              fontSize: "14px",
            }}
          >
            Selamat datang,
          </p>

          <h2
            style={{
              margin: "6px 0 8px",
              color: "#214d32",
              fontSize: "22px",
            }}
          >
            Admin Pajara
          </h2>

          <p
            style={{
              margin: 0,
              color: "#555",
              fontSize: "14px",
            }}
          >
            {adminEmail}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ margin: 0, color: "#8a6a4a", fontSize: "13px" }}>
              Total Pesanan
            </p>

            <h3
              style={{
                margin: "8px 0 0",
                color: "#214d32",
                fontSize: "28px",
              }}
            >
              {totalOrders}
            </h3>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ margin: 0, color: "#8a6a4a", fontSize: "13px" }}>
              Pesanan Baru
            </p>

            <h3
              style={{
                margin: "8px 0 0",
                color: "#214d32",
                fontSize: "28px",
              }}
            >
              {newOrders}
            </h3>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ margin: 0, color: "#8a6a4a", fontSize: "13px" }}>
              Sedang Diproses
            </p>

            <h3
              style={{
                margin: "8px 0 0",
                color: "#214d32",
                fontSize: "28px",
              }}
            >
              {processingOrders}
            </h3>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ margin: 0, color: "#8a6a4a", fontSize: "13px" }}>
              Selesai
            </p>

            <h3
              style={{
                margin: "8px 0 0",
                color: "#214d32",
                fontSize: "28px",
              }}
            >
              {completedOrders}
            </h3>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "20px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#214d32",
                  fontSize: "19px",
                }}
              >
                Notifikasi
              </h2>

              {unreadCount > 0 && (
                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#8a6a4a",
                    fontSize: "13px",
                  }}
                >
                  {unreadCount} belum dibaca
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#2f6b45",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {notificationLoading ? (
            <p
              style={{
                margin: 0,
                color: "#777",
                fontSize: "14px",
              }}
            >
              Memuat notifikasi...
            </p>
          ) : notifications.length === 0 ? (
            <p
              style={{
                margin: 0,
                color: "#777",
                fontSize: "14px",
              }}
            >
              Belum ada notifikasi.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
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
                    padding: "15px",
                    borderRadius: "12px",
                    background: notification.is_read
                      ? "#f7f4ee"
                      : "#eef5ef",
                    border: notification.is_read
                      ? "1px solid #eee"
                      : "1px solid #cddfce",
                    cursor: notification.is_read
                      ? "default"
                      : "pointer",
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
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        {notification.title}
                      </p>

                      <p
                        style={{
                          margin: "6px 0",
                          color: "#555",
                          fontSize: "14px",
                          lineHeight: "1.5",
                        }}
                      >
                        {notification.message}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color: "#999",
                          fontSize: "12px",
                        }}
                      >
                        {formatNotificationDate(notification.created_at)}
                      </p>
                    </div>

                    {!notification.is_read && (
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: "#2f6b45",
                          flexShrink: 0,
                          marginTop: "5px",
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "20px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              color: "#214d32",
              fontSize: "19px",
            }}
          >
            Pesanan
          </h2>

          <p
            style={{
              margin: "0 0 16px",
              color: "#777",
              fontSize: "14px",
            }}
          >
            Kelola dan lihat semua pesanan pelanggan.
          </p>

          <button
            type="button"
            onClick={() => router.push("/orders")}
            style={{
              width: "100%",
              height: "48px",
              border: "none",
              borderRadius: "10px",
              background: "#2f6b45",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            Lihat Semua Pesanan
          </button>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "20px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              color: "#214d32",
              fontSize: "19px",
            }}
          >
            Aktivitas Terbaru
          </h2>

          <p
            style={{
              margin: 0,
              color: "#777",
              fontSize: "14px",
            }}
          >
            Belum ada aktivitas terbaru.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            height: "50px",
            border: "none",
            borderRadius: "10px",
            background: "#8a6a4a",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          Keluar dari Admin
        </button>
      </section>
    </main>
  );
}
