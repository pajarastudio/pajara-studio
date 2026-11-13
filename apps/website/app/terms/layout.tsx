
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ketentuan Layanan",
  description:
    "Pelajari ketentuan penggunaan layanan desain dan pemesanan di Pajara Studio.",

  alternates: {
    canonical: "/terms",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    url: "https://pajara-website.pajarastd.workers.dev/terms",
    title: "Ketentuan Layanan | Pajara Studio",
    description:
      "Pelajari ketentuan penggunaan layanan desain dan pemesanan di Pajara Studio.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Ketentuan Layanan | Pajara Studio",
    description:
      "Pelajari ketentuan penggunaan layanan desain dan pemesanan di Pajara Studio.",
  },
};

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
