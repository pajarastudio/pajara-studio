
"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import PushNotification from "../push-notification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const COLORS = {
  background: "#F1ECE6",
  green: "#214D32",
  greenLight: "#2F6B45",
  brown: "#8A6A4A",
  white: "#FFFFFF",
  muted: "#777D75",
  border: "#E7DFD5",
};

type NotificationItem = {
  id: string;
  order_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  const loadNotifications = useCallback(async (adminId: string) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, order_id, type, title, message, is_read, created_at")
      .eq("user_id", adminId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      setErrorMessage(
        "Notifikasi gagal dimuat. Coba muat ulang halaman."
      );
      return;
    }

    setNotifications((data ?? []) as NotificationItem[]);
    setErrorMessage("");
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

      setUserId(user.id);
      await loadNotifications(user.id);

      if (active) {
        setLoading(false);
      }
    }

    checkAdmin();

    return () => {
      active = false;
    };
  }, [router, loadNotifications]);

  async function markAsRead(notification: NotificationItem) {
    if (notification.is_read) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notification.id)
      .eq("user_id", userId);

    if (error) {
      setErrorMessage(
        "Notifikasi belum berhasil ditandai dibaca."
      );
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? { ...item, is_read: true }
          : item
      )
    );
  }

  async function markAllAsRead() {
    if (!userId || unreadCount === 0 || saving) return;

    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      setErrorMessage(
        "Gagal menandai semua notifikasi sebagai dibaca."
      );
    } else {
      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );
    }

    setSaving(false);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleNotificationClick(
    notification: NotificationItem
  ) {
    await markAsRead(notification);

    if (notification.order_id) {
      router.push(
        `/orders/detail?id=${encodeURIComponent(notification.order_id)}`
      );
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  const cardStyle = {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    boxShadow: "0 5px 20px rgba(33,77,50,0.035)",
  } as const;

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
            Memuat notifikasi...
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

  return (
    <>
      <PushNotification />

      <main
        style={{
          minHeight: "100vh",
          paddingBottom: "110px",
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
            padding: "26px 22px 32px",
            borderRadius: "0 0 28px 28px",
            boxShadow: "0 12px 28px rgba(33,77,50,0.15)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              right: -60,
              top: -95,
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "50%",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
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
                fontSize: 30,
                letterSpacing: -1,
                fontWeight: 850,
              }}
            >
              Notifikasi
            </h1>

            <p
              style={{
                margin: "9px 0 0",
                color: "#D9E4DA",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              Semua informasi penting dalam satu tempat.
            </p>
          </div>
        </header>

        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "22px 16px 28px",
          }}
        >
          {/* SUMMARY */}
          <section
            style={{
              ...cardStyle,
              padding: 20,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 7px",
                  color: COLORS.brown,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Pusat informasi
              </p>

              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  letterSpacing: -0.5,
                }}
              >
                Aktivitas terbaru
              </h2>

              <p
                style={{
                  margin: "7px 0 0",
                  color: COLORS.muted,
                  fontSize: 12,
                }}
              >
                {unreadCount > 0
                  ? `${unreadCount} notifikasi belum dibaca`
                  : "Semua notifikasi sudah dibaca"}
              </p>
            </div>

            <div
              style={{
                width: 48,
                height: 48,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: 16,
                background: "#EAF1E9",
                color: COLORS.green,
                fontSize: 23,
              }}
            >
              ♧
            </div>
          </section>

          {/* LIST HEADER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18 }}>
              Semua notifikasi
            </h2>

            {unreadCount > 0 && (
              <button
                type="button"
                disabled={saving}
                onClick={markAllAsRead}
                style={{
                  border: "1px solid #DCE6DC",
                  borderRadius: 10,
                  padding: "9px 12px",
                  background: "#EDF3ED",
                  color: COLORS.green,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: saving ? "wait" : "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Memproses..." : "Baca Semua"}
              </button>
            )}
          </div>

          {errorMessage && (
            <div
              role="alert"
              style={{
                marginBottom: 14,
                padding: 13,
                borderRadius: 12,
                border: "1px solid #E5C8BC",
                background: "#FFF3ED",
                color: "#914B37",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* NOTIFICATION LIST */}
          {notifications.length === 0 ? (
            <section
              style={{
                ...cardStyle,
                padding: "38px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  margin: "0 auto 16px",
                  borderRadius: 19,
                  display: "grid",
                  placeItems: "center",
                  background: "#EAF1E9",
                  color: COLORS.green,
                  fontSize: 27,
                }}
              >
                ♧
              </div>

              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 16,
                }}
              >
                Belum ada notifikasi
              </h3>

              <p
                style={{
                  maxWidth: 270,
                  margin: "0 auto",
                  color: COLORS.muted,
                  fontSize: 12,
                  lineHeight: 1.7,
                }}
              >
                Jika ada informasi pesanan atau pembaruan sistem,
                notifikasi akan muncul di halaman ini.
              </p>
            </section>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    ...cardStyle,
                    width: "100%",
                    padding: 16,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    textAlign: "left",
                    cursor: notification.order_id ? "pointer" : "default",
                    background: notification.is_read
                      ? COLORS.white
                      : "#F0F5EF",
                    border: notification.is_read
                      ? `1px solid ${COLORS.border}`
                      : "1px solid #D5E3D4",
                    color: COLORS.green,
                  }}
                >
                  <span
                    style={{
                      width: 39,
                      height: 39,
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 13,
                      background: notification.is_read
                        ? "#F0EBE4"
                        : "#DDEADC",
                      color: COLORS.green,
                      fontSize: 17,
                      fontWeight: 800,
                    }}
                  >
                    {notification.is_read ? "✓" : "•"}
                  </span>

                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          lineHeight: 1.5,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {notification.title}
                      </span>

                      {!notification.is_read && (
                        <span
                          style={{
                            flexShrink: 0,
                            marginTop: 4,
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: COLORS.greenLight,
                          }}
                        />
                      )}
                    </span>

                    <span
                      style={{
                        display: "block",
                        marginTop: 6,
                        color: "#646B64",
                        fontSize: 12,
                        lineHeight: 1.7,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {notification.message}
                    </span>

                    <span
                      style={{
                        display: "block",
                        marginTop: 10,
                        color: "#92958F",
                        fontSize: 10,
                      }}
                    >
                      {formatDate(notification.created_at)}
                    </span>

                    {notification.order_id && (
                      <span
                        style={{
                          display: "block",
                          marginTop: 9,
                          color: COLORS.greenLight,
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        Lihat detail pesanan →
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              minHeight: 43,
              marginTop: 20,
              border: "none",
              borderRadius: 13,
              background: "transparent",
              color: COLORS.brown,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Keluar dari Admin
          </button>

          {/* FOOTER */}
          <footer
            style={{
              textAlign: "center",
              padding: "24px 8px 5px",
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
              }}
            >
              Berakar di Tanah Pasundan.
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
