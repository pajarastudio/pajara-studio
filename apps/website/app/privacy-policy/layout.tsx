import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Pelajari bagaimana Pajara Studio mengelola dan menjaga informasi pengunjung serta pelanggan.",

  alternates: {
    canonical: "/privacy-policy",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    url: "https://pajara-website.pajarastd.workers.dev/privacy-policy",
    title: "Kebijakan Privasi | Pajara Studio",
    description:
      "Pelajari bagaimana Pajara Studio mengelola dan menjaga informasi pengunjung serta pelanggan.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Kebijakan Privasi | Pajara Studio",
    description:
      "Pelajari bagaimana Pajara Studio mengelola dan menjaga informasi pengunjung serta pelanggan.",
  },
};

export default function PrivacyPolicyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
