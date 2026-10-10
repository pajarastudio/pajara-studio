
"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import PushNotification from "../push-notification";

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

type StatItem = {
  label: string;
  value: number;
  icon: string;
  detail: string;
};

const COLORS = {
  background: "#F1ECE6",
  green: "#214D32",
  greenLight: "#2F6B45",
  brown: "#8A6A4A",
  white: "#FFFFFF",
  muted: "#777D75",
  border: "#E7DFD5",
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
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async (userId: string) => {
    setNotificationLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("id, order_id, type, title, message, is_read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setNotifications(data as NotificationItem[]);
    }

    setNotificationLoading(false);
  }, []);

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase.from("orders").select("status");

    if (!error && data) {
      setTotalOrders(data.length);
      setNewOrders(
        data.filter((order) => order.status === "pending").length
      );
      setProcessingOrders(
        data.filter((order) => order.status === "processing").length
      );
      setCompletedOrders(
        data.filter((order) => order.status === "completed").length
      );
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.replace("/");
        return;
      }

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

      if (!active) return;

      setAdminEmail(user.email || "");
      await Promise.all([loadOrders(), loadNotifications(user.id)]);

      if (active) {
        setLoading(false);
      }
    }

    checkAdmin();

    return () => {
      active = false;
    };
  }, [router, loadOrders, loadNotifications]);

  async function markAsRead(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (!error) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item
        )
      );
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications
      .filter((item) => !item.is_read)
      .map((item) => item.id);

    if (unreadIds.length === 0 || markingAll) return;

    setMarkingAll(true);

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    if (!error) {
      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );
    }

    setMarkingAll(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  function formatNotificationDate(date: string) {
    return new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const stats: StatItem[] = [
    {
      label: "Total Pesanan",
      value: totalOrders,
      icon: "▤",
      detail: "Semua pesanan",
    },
    {
      label: "Pesanan Baru",
      value: newOrders,
      icon: "✳",
      detail: "Menunggu diproses",
    },
    {
      label: "Sedang Diproses",
      value: processingOrders,
      icon: "◷",
      detail: "Dalam pengerjaan",
    },
    {
      label: "Pesanan Selesai",
      value: completedOrders,
      icon: "✓",
      detail: "Berhasil diselesaikan",
    },
  ];

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: COLORS.background,
          color: COLORS.green,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "3px solid #D9E2D8",
              borderTopColor: COLORS.greenLight,
              margin: "0 auto 14px",
              animation: "pajara-spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 13, fontWeight: 700 }}>
            Menyiapkan dashboard...
          </p>
          <style>{`
            @keyframes pajara-spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </main>
    );
  }

  const cardStyle = {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    boxShadow: "0 5px 20px rgba(33,77,50,0.035)",
  } as const;

  const smallButtonStyle = {
    border: "1px solid #DCE6DC",
    borderRadius: 10,
    padding: "9px 12px",
    background: "#EDF3ED",
    color: COLORS.green,
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer",
  } as const;

  return (
    <>
      <PushNotification />

      <main
        style={{
          minHeight: "100vh",
          paddingBottom: "100px",
          background: COLORS.background,
          color: COLORS.green,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #183D27 0%, #214D32 55%, #2F6B45 100%)",
            color: COLORS.white,
            padding: "26px 22px 34px",
            borderRadius: "0 0 28px 28px",
            boxShadow: "0 12px 28px rgba(33,77,50,0.15)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 190,
              height: 190,
              right: -65,
              top: -100,
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "50%",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 125,
              height: 125,
              right: 15,
              top: -45,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "50%",
            }}
          />

          <div
            style={{
              maxWidth: 1080,
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 9px",
                  color: "#D8C5AD",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 3,
                }}
              >
                PAJARA STUDIO
              </p>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(24px, 5vw, 32px)",
                  lineHeight: 1.15,
                  letterSpacing: -1,
                  fontWeight: 800,
                }}
              >
                Admin Dashboard
              </h1>
              <p
                style={{
                  margin: "9px 0 0",
                  color: "#D9E4DA",
                  fontSize: 12,
                }}
              >
                Ruang kendali operasional Pajara.
              </p>
            </div>

            <div
              style={{
                width: 52,
                height: 52,
                flexShrink: 0,
                borderRadius: 17,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.10)",
                display: "grid",
                placeItems: "center",
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: 1,
                backdropFilter: "blur(8px)",
              }}
            >
              PS
            </div>
          </div>
        </header>

        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "22px 16px 28px",
          }}
        >
          {/* WELCOME */}
          <section
            style={{
              ...cardStyle,
              padding: 21,
              marginTop: -3,
              marginBottom: 23,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: "0 0 8px",
                  color: COLORS.brown,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Selamat datang kembali
              </p>
              <h2
                style={{
                  margin: 0,
                  fontSize: 23,
                  letterSpacing: -0.7,
                  lineHeight: 1.2,
                }}
              >
                Admin Pajara
              </h2>
              <p
                style={{
                  margin: "8px 0 0",
                  color: COLORS.muted,
                  fontSize: 12,
                  overflowWrap: "anywhere",
                }}
              >
                {adminEmail}
              </p>
            </div>

            <div
              style={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: 16,
                background: "#E8EFE7",
                color: COLORS.green,
                display: "grid",
                placeItems: "center",
                fontSize: 17,
                fontWeight: 900,
                border: "1px solid #D8E4D7",
              }}
            >
              A
            </div>
          </section>

          {/* SECTION TITLE */}
          <div style={{ marginBottom: 14 }}>
            <p
              style={{
                margin: "0 0 5px",
                color: COLORS.brown,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Ringkasan
            </p>
            <h2
              style={{
                margin: 0,
                fontSize: 21,
                letterSpacing: -0.5,
              }}
            >
              Statistik Pesanan
            </h2>
          </div>

          {/* STATISTICS */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                style={{
                  ...cardStyle,
                  padding: "17px 15px",
                  minWidth: 0,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 17,
                  }}
                >
                  <span
                    style={{
                      color: COLORS.muted,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {stat.label}
                  </span>
                  <span
                    style={{
                      width: 33,
                      height: 33,
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 11,
                      background: index === 1 ? "#F3E9DD" : "#EAF1E9",
                      color: index === 1 ? COLORS.brown : COLORS.greenLight,
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    {stat.icon}
                  </span>
                </div>

                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 33,
                    fontWeight: 850,
                    lineHeight: 1,
                    letterSpacing: -1.5,
                    color: COLORS.green,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    lineHeight: 1.4,
                    color: COLORS.muted,
                  }}
                >
                  {stat.detail}
                </p>

                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background:
                      index === 1 ? COLORS.brown : COLORS.greenLight,
                    opacity: 0.75,
                  }}
                />
              </div>
            ))}
          </section>

          {/* NOTIFICATIONS */}
          <section
            id="notifikasi"
            style={{
              ...cardStyle,
              padding: 19,
              marginBottom: 22,
              scrollMarginTop: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: 19 }}>
                    Notifikasi
                  </h2>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 99,
                        background: COLORS.green,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: COLORS.muted,
                    fontSize: 12,
                  }}
                >
                  Informasi terbaru pesanan dan sistem.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  disabled={markingAll}
                  onClick={markAllAsRead}
                  style={{
                    ...smallButtonStyle,
                    flexShrink: 0,
                    opacity: markingAll ? 0.6 : 1,
                  }}
                >
                  {markingAll ? "Memproses..." : "Baca semua"}
                </button>
              )}
            </div>

            {notificationLoading ? (
              <p
                style={{
                  margin: 0,
                  padding: "20px 0",
                  color: COLORS.muted,
                  fontSize: 13,
                }}
              >
                Memuat notifikasi...
              </p>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "27px 12px",
                  borderRadius: 15,
                  background: "#FAF8F5",
                  border: `1px dashed ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    margin: "0 auto 12px",
                    borderRadius: 15,
                    display: "grid",
                    placeItems: "center",
                    background: "#EAF1E9",
                    color: COLORS.green,
                    fontSize: 22,
                  }}
                >
                  ♧
                </div>
                <p
                  style={{
                    margin: 0,
                    color: COLORS.green,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  Semua tenang untuk sekarang
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: COLORS.muted,
                    fontSize: 11,
                  }}
                >
                  Notifikasi baru akan muncul di sini.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                }}
              >
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }

                      if (notification.order_id) {
                        router.push(
                          `/orders/detail?id=${encodeURIComponent(
                            notification.order_id
                          )}`
                        );
                      }
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 11,
                      padding: 14,
                      borderRadius: 14,
                      border: notification.is_read
                        ? "1px solid #EEE9E2"
                        : "1px solid #D5E3D4",
                      background: notification.is_read
                        ? "#FCFBF9"
                        : "#F0F5EF",
                      cursor: "pointer",
                      color: COLORS.green,
                    }}
                  >
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        borderRadius: 11,
                        display: "grid",
                        placeItems: "center",
                        background: notification.is_read
                          ? "#F0EBE4"
                          : "#DDEADC",
                        color: COLORS.green,
                        fontSize: 16,
                        fontWeight: 800,
                      }}
                    >
                      {notification.is_read ? "✓" : "•"}
                    </span>

                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 800,
                          lineHeight: 1.4,
                        }}
                      >
                        {notification.title}
                      </span>
                      <span
                        style={{
                          display: "block",
                          marginTop: 5,
                          color: "#646B64",
                          fontSize: 12,
                          lineHeight: 1.6,
                        }}
                      >
                        {notification.message}
                      </span>
                      <span
                        style={{
                          display: "block",
                          marginTop: 8,
                          color: "#92958F",
                          fontSize: 10,
                        }}
                      >
                        {formatNotificationDate(notification.created_at)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ORDER WORKSPACE */}
          <section
            style={{
              position: "relative",
              overflow: "hidden",
              padding: 23,
              borderRadius: 23,
              marginBottom: 22,
              background:
                "linear-gradient(145deg, #183D27 0%, #214D32 65%, #2F6B45 100%)",
              color: COLORS.white,
              boxShadow: "0 12px 27px rgba(33,77,50,0.12)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                right: -35,
                top: -42,
                width: 130,
                height: 130,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p
                style={{
                  margin: "0 0 9px",
                  color: "#D9C6AE",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 2,
                }}
              >
                WORKSPACE
              </p>
              <h2
                style={{
                  margin: 0,
                  fontSize: 24,
                  letterSpacing: -0.6,
                }}
              >
                Kelola Pesanan
              </h2>
              <p
                style={{
                  maxWidth: 280,
                  margin: "9px 0 21px",
                  color: "#DFE8DF",
                  fontSize: 12,
                  lineHeight: 1.7,
                }}
              >
                Pantau permintaan desain, periksa detail, dan kelola
                pekerjaan pelanggan dari satu tempat.
              </p>
              <button
                type="button"
                onClick={() => router.push("/orders")}
                style={{
                  width: "100%",
                  minHeight: 48,
                  padding: "12px 16px",
                  border: "none",
                  borderRadius: 13,
                  background: "#F1ECE6",
                  color: COLORS.green,
                  fontSize: 13,
                  fontWeight: 850,
                  cursor: "pointer",
                }}
              >
                Buka Daftar Pesanan&nbsp; →
              </button>
            </div>
          </section>

          {/* ACTIVITY */}
          <section
            style={{
              ...cardStyle,
              padding: 19,
              marginBottom: 18,
            }}
          >
            <p
              style={{
                margin: "0 0 7px",
                color: COLORS.brown,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.8,
                textTransform: "uppercase",
              }}
            >
              Ruang kerja
            </p>
            <h2
              style={{
                margin: 0,
                fontSize: 19,
                letterSpacing: -0.3,
              }}
            >
              Aktivitas Terbaru
            </h2>
            <div
              style={{
                height: 1,
                background: COLORS.border,
                margin: "16px 0",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  background: "#F3EAE0",
                  color: COLORS.brown,
                  fontSize: 18,
                }}
              >
                ◷
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Ringkasan aktivitas
                </p>
                <p
                  style={{
                    margin: "5px 0 0",
                    color: COLORS.muted,
                    fontSize: 11,
                    lineHeight: 1.5,
                  }}
                >
                  Riwayat aktivitas terperinci belum ditampilkan di
                  dashboard ini.
                </p>
              </div>
            </div>
          </section>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              minHeight: 47,
              border: "1px solid #D9CFC3",
              borderRadius: 13,
              background: "rgba(255,255,255,0.42)",
              color: COLORS.brown,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Keluar dari Admin
          </button>

          <footer
            style={{
              textAlign: "center",
              padding: "25px 8px 5px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: COLORS.green,
                fontSize: 10,
                fontWeight: 850,
                letterSpacing: 2,
              }}
            >
              PAJARA STUDIO
            </p>
            <p
              style={{
                margin: "7px 0 0",
                color: COLORS.muted,
                fontSize: 10,
                letterSpacing: 0.4,
              }}
            >
              Berakar di Tanah Pasundan.
            </p>
          </footer>
        </div>

        {/* BOTTOM NAVIGATION */}
        <nav
          aria-label="Navigasi utama"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding:
              "9px 12px calc(9px + env(safe-area-inset-bottom))",
            background: "rgba(255,255,255,0.96)",
            borderTop: "1px solid #E4DED5",
            boxShadow: "0 -8px 28px rgba(33,77,50,0.08)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            style={{
              maxWidth: 620,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 5,
            }}
          >
            {[
              { label: "Dashboard", icon: "⌂", action: "home" },
              { label: "Pesanan", icon: "▤", action: "orders" },
              {
                label: "Notifikasi",
                icon: "♧",
                action: "notifications",
              },
              { label: "Keuangan", icon: "Rp", action: "finance" },
            ].map((item) => {
              const selected = item.action === "home";

              return (
                <button
                  key={item.action}
                  type="button"
                  aria-label={item.label}
                  onClick={() => {
                    if (item.action === "home") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else if (item.action === "orders") {
                      router.push("/orders");
                    } else if (item.action === "notifications") {
                      document
                        .getElementById("notifikasi")
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else if (item.action === "finance") {
                      router.push("/finance");
                    }
                  }}
                  style={{
                    position: "relative",
                    minWidth: 0,
                    minHeight: 55,
                    padding: "7px 2px",
                    border: "none",
                    borderRadius: 13,
                    background: selected ? "#EAF1E9" : "transparent",
                    color: selected ? COLORS.green : "#777D75",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      fontSize: item.action === "finance" ? 14 : 20,
                      lineHeight: 1,
                      fontWeight: 800,
                    }}
                  >
                    {item.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      lineHeight: 1.2,
                      fontWeight: selected ? 850 : 650,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
                  {item.action === "notifications" && unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: 3,
                        right: "calc(50% - 19px)",
                        minWidth: 14,
                        height: 14,
                        padding: "0 3px",
                        borderRadius: 99,
                        display: "grid",
                        placeItems: "center",
                        background: "#B45E48",
                        color: "#fff",
                        fontSize: 8,
                        fontWeight: 900,
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </main>
    </>
  );
}
