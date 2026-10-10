
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
  background: "#F7F4EE",
  green: "#214D32",
  greenLight: "#2F6B45",
  brown: "#8A6A4A",
  white: "#FFFFFF",
  muted: "#777D75",
  border: "#E7DFD5",
  softGreen: "#EDF4EB",
  softBrown: "#F4EEE6",
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

  const cardStyle = {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    boxShadow: "0 5px 20px rgba(33,77,50,0.035)",
  } as const;

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
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          router.replace("/");
          return;
        }

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

        if (
          profileError ||
          !profile ||
          profile.role !== "admin"
        ) {
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
      } catch {
        if (active) {
          setErrorMessage(
            "Terjadi kendala saat memeriksa akun. Coba muat ulang halaman."
          );
          setLoading(false);
        }
      }
    }

    checkAdmin();

    return () => {
      active = false;
    };
  }, [router, loadNotifications]);

  async function markAsRead(notification: NotificationItem) {
    if (notification.is_read || !userId) return;

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

    setErrorMessage("");
  }

  async function markAllAsRead() {
    if (!userId || unreadCount === 0 || saving) return;

    setSaving(true);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) {
        setErrorMessage(
          "Gagal menandai semua notifikasi sebagai dibaca."
        );
        return;
      }

      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Waktu tidak tersedia";
    }

    return parsedDate.toLocaleString("id-ID", {
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
    if (notification.order_id) {
      await markAsRead(notification);

      router.push(
        `/orders/detail?id=${encodeURIComponent(notification.order_id)}`
      );
      return;
    }

    await markAsRead(notification);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: COLORS.background,
          color: COLORS.green,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "3px solid #D9E2D8",
              borderTopColor: COLORS.greenLight,
              margin: "0 auto 14px",
              animation: "pajara-notification-spin 0.8s linear infinite",
            }}
          />

          <p style={{ fontSize: 13, fontWeight: 700 }}>
            Memuat notifikasi...
          </p>

          <style>{`
            @keyframes pajara-notification-spin {
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
          paddingBottom: 112,
          background: COLORS.background,
          color: COLORS.green,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <header
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #183D27 0%, #214D32 55%, #2F6B45 100%)",
            color: COLORS.white,
            padding: "28px 22px 34px",
            borderRadius: "0 0 28px 28px",
            boxShadow: "0 12px 28px rgba(33,77,50,0.15)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 210,
              height: 210,
              right: -90,
              top: -115,
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "50%",
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 125,
              height: 125,
              right: -35,
              top: -70,
              border: "1px solid rgba(255,255,255,0.08)",
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
                fontSize: "clamp(27px, 6vw, 32px)",
                letterSpacing: -1,
                fontWeight: 850,
              }}
            >
              Notifikasi
            </h1>

            <p
              style={{
                maxWidth: 300,
                margin: "9px 0 0",
                color: "#D9E4DA",
                fontSize: 12,
                lineHeight: 1.8,
              }}
            >
              Semua informasi penting dan pembaruan aktivitas Pajara
              dalam satu tempat.
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 20,
                padding: "9px 12px",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: unreadCount > 0 ? "#E6C49A" : "#B8D5B7",
                }}
              />

              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: COLORS.white,
                }}
              >
                {unreadCount > 0
                  ? `${unreadCount} belum dibaca`
                  : "Semua sudah dibaca"}
              </span>
            </div>
          </div>
        </header>

        <div
          style={{
            width: "100%",
            maxWidth: 760,
            boxSizing: "border-box",
            margin: "0 auto",
            padding: "22px 16px 28px",
          }}
        >
          <section
            style={{
              ...cardStyle,
              padding: 19,
              marginBottom: 25,
              display: "flex",
              alignItems: "center",
              gap: 15,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: 17,
                background: COLORS.softGreen,
                color: COLORS.green,
              }}
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: "0 0 5px",
                  color: COLORS.brown,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                }}
              >
                Pusat informasi
              </p>

              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  letterSpacing: -0.4,
                  fontWeight: 800,
                }}
              >
                Aktivitas terbaru
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: COLORS.muted,
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                {notifications.length} notifikasi tersimpan
              </p>
            </div>

            <div
              style={{
                minWidth: 42,
                height: 42,
                padding: "0 8px",
                boxSizing: "border-box",
                display: "grid",
                placeItems: "center",
                borderRadius: 14,
                background:
                  unreadCount > 0 ? COLORS.green : COLORS.softGreen,
                color: unreadCount > 0 ? COLORS.white : COLORS.green,
                fontSize: 16,
                fontWeight: 850,
              }}
            >
              {unreadCount}
            </div>
          </section>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 850,
                  letterSpacing: -0.4,
                }}
              >
                Semua notifikasi
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: COLORS.muted,
                  fontSize: 11,
                }}
              >
                Maksimal 50 notifikasi terbaru
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                disabled={saving}
                onClick={markAllAsRead}
                style={{
                  flexShrink: 0,
                  border: "1px solid #DCE6DC",
                  borderRadius: 11,
                  padding: "10px 12px",
                  background: COLORS.softGreen,
                  color: COLORS.green,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: saving ? "wait" : "pointer",
                  opacity: saving ? 0.65 : 1,
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
                borderRadius: 13,
                border: "1px solid #E5C8BC",
                background: "#FFF3ED",
                color: "#914B37",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              {errorMessage}
            </div>
          )}

          {notifications.length === 0 ? (
            <section
              style={{
                ...cardStyle,
                padding: "38px 22px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 66,
                  height: 66,
                  margin: "0 auto 17px",
                  borderRadius: 22,
                  display: "grid",
                  placeItems: "center",
                  background: COLORS.softGreen,
                  color: COLORS.green,
                }}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
              </div>

              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                Belum ada notifikasi
              </h3>

              <p
                style={{
                  maxWidth: 285,
                  margin: "0 auto",
                  color: COLORS.muted,
                  fontSize: 12,
                  lineHeight: 1.8,
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
                gap: 11,
              }}
            >
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  aria-label={`Notifikasi: ${notification.title}`}
                  style={{
                    ...cardStyle,
                    position: "relative",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "16px 15px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    textAlign: "left",
                    cursor: "pointer",
                    background: notification.is_read
                      ? COLORS.white
                      : "#F1F6EF",
                    border: notification.is_read
                      ? `1px solid ${COLORS.border}`
                      : "1px solid #D1E1CF",
                    color: COLORS.green,
                    transition:
                      "background 0.2s ease, border-color 0.2s ease",
                  }}
                >
                  {!notification.is_read && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 15,
                        bottom: 15,
                        width: 3,
                        borderRadius: "0 4px 4px 0",
                        background: COLORS.greenLight,
                      }}
                    />
                  )}

                  <span
                    style={{
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 14,
                      background: notification.is_read
                        ? COLORS.softBrown
                        : "#DDEADC",
                      color: COLORS.green,
                    }}
                  >
                    {notification.is_read ? (
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m5 12 4 4L19 6" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                        <path d="M10 21h4" />
                      </svg>
                    )}
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
                          fontWeight: notification.is_read ? 700 : 850,
                          lineHeight: 1.55,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {notification.title}
                      </span>

                      {!notification.is_read && (
                        <span
                          style={{
                            flexShrink: 0,
                            marginTop: 6,
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
                        lineHeight: 1.75,
                        overflowWrap: "anywhere",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {notification.message}
                    </span>

                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 11,
                        color: "#92958F",
                        fontSize: 10,
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>

                      {formatDate(notification.created_at)}
                    </span>

                    {notification.order_id && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          marginTop: 11,
                          color: COLORS.greenLight,
                          fontSize: 11,
                          fontWeight: 850,
                        }}
                      >
                        Lihat detail pesanan
                        <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              minHeight: 44,
              marginTop: 22,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 13,
              background: "rgba(255,255,255,0.55)",
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
              padding: "25px 8px 8px",
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
