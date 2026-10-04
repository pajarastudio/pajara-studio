import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pajara-website.pajarastd.workers.dev"),

  title: {
    default: "Pajara Studio — Desain yang Punya Arah",
    template: "%s — Pajara Studio",
  },

  description:
    "Pajara Studio adalah studio desain grafis dari Tanah Pasundan yang membantu usaha dan brand membangun identitas visual, desain promosi, social media, banner, kemasan, dan menu yang punya arah.",

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
    title: "Pajara Studio — Desain yang Punya Arah",
    description:
      "Studio desain grafis dari Tanah Pasundan. Identitas visual, branding, desain promosi, social media, banner, kemasan, dan menu.",
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
    title: "Pajara Studio — Desain yang Punya Arah",
    description:
      "Studio desain grafis dari Tanah Pasundan. Desain yang punya arah.",
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
      <body>{children}</body>
    </html>
  );
}
