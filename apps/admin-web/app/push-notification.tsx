"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}

export default function PushNotification() {
  const [status, setStatus] = useState("Memeriksa push notification...");

  useEffect(() => {
    async function setupPushNotification() {
      try {
        setStatus("1. Mengecek dukungan browser...");

        if (
          !("serviceWorker" in navigator) ||
          !("PushManager" in window) ||
          !("Notification" in window)
        ) {
          setStatus(
            "❌ Browser HP tidak mendukung push notification."
          );
          return;
        }

        setStatus("2. Mengecek login admin...");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setStatus("❌ Admin belum login.");
          return;
        }

        setStatus("3. Admin terdeteksi. Mengecek izin notifikasi...");

        if (Notification.permission !== "granted") {
          setStatus("⚠️ Izin notifikasi belum aktif.");

          const permission =
            await Notification.requestPermission();

          if (permission !== "granted") {
            setStatus(
              "❌ Izin notifikasi ditolak atau belum diberikan."
            );
            return;
          }
        }

        setStatus("4. Izin OK. Menunggu Service Worker...");

        const registration =
          await navigator.serviceWorker.ready;

        setStatus("5. Service Worker aktif.");

        const existingSubscription =
          await registration.pushManager.getSubscription();

        setStatus(
          existingSubscription
            ? "6. Subscription lama ditemukan."
            : "6. Membuat subscription baru..."
        );

        const subscription =
          existingSubscription ||
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
            ),
          }));

        const subscriptionJson = subscription.toJSON();

        if (
          !subscriptionJson.endpoint ||
          !subscriptionJson.keys?.p256dh ||
          !subscriptionJson.keys?.auth
        ) {
          setStatus(
            "❌ Subscription terbentuk tetapi datanya tidak lengkap."
          );
          return;
        }

        setStatus("7. Subscription berhasil. Menyimpan ke database...");

        const { error } = await supabase
          .from("push_subscriptions")
          .upsert(
            {
              user_id: user.id,
              endpoint: subscriptionJson.endpoint,
              p256dh: subscriptionJson.keys.p256dh,
              auth: subscriptionJson.keys.auth,
            },
            {
              onConflict: "endpoint",
            }
          );

        if (error) {
          setStatus(
            `❌ Gagal menyimpan database: ${error.message}`
          );
          return;
        }

        setStatus(
          "✅ PUSH AKTIF. Subscription berhasil tersimpan."
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        setStatus(`❌ ERROR: ${message}`);
      }
    }

    setupPushNotification();
  }, []);

  return (
    <div
      style={{
        margin: "12px 16px",
        padding: "12px 14px",
        borderRadius: "10px",
        background: "#f7f4ee",
        border: "1px solid #d8d0c5",
        color: "#214d32",
        fontSize: "13px",
        lineHeight: 1.5,
      }}
    >
      <strong>Status Push:</strong>
      <div>{status}</div>
    </div>
  );
}
