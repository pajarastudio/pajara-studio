"use client";

import { useEffect } from "react";
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

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function PushNotification() {
  useEffect(() => {
    async function setupPushNotification() {
      try {
        if (
          !("serviceWorker" in navigator) ||
          !("PushManager" in window) ||
          !("Notification" in window)
        ) {
          console.log("Push notification tidak didukung.");
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.log("Admin belum login.");
          return;
        }

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          console.log("Izin notifikasi belum diberikan.");
          return;
        }

        const registration =
          await navigator.serviceWorker.ready;

        const existingSubscription =
          await registration.pushManager.getSubscription();

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
          console.error("Data subscription tidak lengkap.");
          return;
        }

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
          console.error(
            "Gagal menyimpan subscription:",
            error
          );
          return;
        }

        console.log(
          "Pajara Push Notification berhasil aktif."
        );
      } catch (error) {
        console.error(
          "Push notification error:",
          error
        );
      }
    }

    setupPushNotification();
  }, []);

  return null;
}
