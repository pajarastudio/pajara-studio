
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Analytics from "./analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://pajara-website.pajarastd.workers.dev"),

  verification: {
    google: "bf5igmY7oAVkRVqJ0qISDIzdQidiyKJWV3qoK739u90",
  },

  title: {
    default: "Jasa Desain Grafis & Branding | Pajara Studio",
    template: "%s — Pajara Studio",
  },

  description:
    "Pajara Studio adalah studio desain grafis dari Tanah Pasundan yang menyediakan jasa desain logo, branding, promosi, social media, banner, kemasan, dan menu untuk membangun identitas visual brand.",

  keywords: [
    "Pajara Studio",
    "jasa desain grafis",
    "jasa desain Bogor",
    "graphic design Bogor",
    "desain logo",
    "branding",
    "desain promosi",
    "desain Instagram",
    "desain banner",
    "desain kemasan",
    "desain menu",
  ],

  authors: [
    {
      name: "Muhamad Rijik Rifa'i",
    },
  ],

  creator: "Pajara Studio",
  publisher: "Pajara Studio",
  applicationName: "Pajara Studio",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://pajara-website.pajarastd.workers.dev",
    siteName: "Pajara Studio",
    title: "Jasa Desain Grafis & Branding | Pajara Studio",
    description:
      "Studio desain grafis dari Tanah Pasundan yang menyediakan layanan logo, branding, desain promosi, social media, banner, kemasan, dan menu.",
    images: [
      {
        url: "/755809946_17926162029385149_3739923509439876817_n.jpg",
        width: 1200,
        height: 1200,
        alt: "Logo Pajara Studio",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Jasa Desain Grafis & Branding | Pajara Studio",
    description:
      "Studio desain grafis dari Tanah Pasundan. Identitas visual dan desain yang punya arah.",
    images: [
      "/755809946_17926162029385149_3739923509439876817_n.jpg",
    ],
  },

  icons: {
    icon: "/755809946_17926162029385149_3739923509439876817_n.jpg",
    apple:
      "/755809946_17926162029385149_3739923509439876817_n.jpg",
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
        <Analytics />

        <Script
          id="tawk-to"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API = Tawk_API || {};
              var Tawk_LoadStart = new Date();

              (function () {
                var s1 = document.createElement("script");
                var s0 = document.getElementsByTagName("script")[0];

                s1.async = true;
                s1.src = "https://embed.tawk.to/6aec9f43bbd10f3c33bfb25f/1k6m4s8p6";
                s1.charset = "UTF-8";
                s1.setAttribute("crossorigin", "*");

                s0.parentNode.insertBefore(s1, s0);
              })();
            `,
          }}
        />

        {children}
      </body>
    </html>
  );
}
