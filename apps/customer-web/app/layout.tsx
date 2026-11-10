
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import CustomerNavigation from "./components/CustomerNavigation";
import GlobalCustomerLoading from "./components/GlobalCustomerLoading";

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
        <div id="pajara-initial-loading">
          <div className="pajara-initial-card">
            <div className="pajara-initial-logo">
              <img
                src="/755809946_17926162029385149_3739923509439876817_n.jpg"
                alt="Pajara Studio"
              />
            </div>

            <div className="pajara-initial-brand">
              PAJARA STUDIO
            </div>

            <div className="pajara-initial-title">
              Menyiapkan Halaman
            </div>

            <div className="pajara-initial-description">
              Mohon tunggu, Pajara Studio sedang menyiapkan halaman untuk Kang/Teh.
            </div>

            <div className="pajara-initial-track">
              <div className="pajara-initial-progress" />
            </div>

            <div className="pajara-initial-footer">
              DESAIN YANG PUNYA ARAH.
            </div>
          </div>
        </div>

        <GlobalCustomerLoading>
          {children}
        </GlobalCustomerLoading>

        <CustomerNavigation />

        <Script
          src="https://pajara-connect-widget.pages.dev/pajara-connect.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
