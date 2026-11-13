
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimoni Pelanggan Pajara Studio",
  description:
    "Baca pengalaman pelanggan Pajara Studio dalam menggunakan layanan desain grafis, logo, branding, dan desain promosi.",

  alternates: {
    canonical: "/testimonials",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    url: "https://pajara-website.pajarastd.workers.dev/testimonials",
    title: "Testimoni Pelanggan | Pajara Studio",
    description:
      "Cerita dan pengalaman pelanggan yang menjadi bagian dari perjalanan Pajara Studio.",
  },
};

export default function TestimonialsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
