import type { Metadata } from "next";
import ServiceWorkerRegister from "./service-worker-register";
import BottomNavigation from "./bottom-navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pajara Admin",
  description: "Panel administrasi Pajara Studio",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <ServiceWorkerRegister />
        {children}
        <BottomNavigation />
      </body>
    </html>
  );
}
