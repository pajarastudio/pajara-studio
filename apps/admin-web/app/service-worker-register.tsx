"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log("Pajara Service Worker aktif.");
        })
        .catch((error) => {
          console.error(
            "Pajara Service Worker gagal:",
            error
          );
        });
    }
  }, []);

  return null;
}
