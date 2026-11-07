import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import CustomerNavigation from "./components/CustomerNavigation";

export const metadata: Metadata = {
  title: "Pajara Studio — Customer",
  description: "Kelola pesanan desain Pajara Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
        <CustomerNavigation />

        <Script
          src="https://pajara-connect-widget.pages.dev/pajara-connect.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
