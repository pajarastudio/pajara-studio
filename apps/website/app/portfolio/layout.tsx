
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio Desain Grafis & Branding",
  description:
    "Jelajahi portfolio Pajara Studio, koleksi karya desain logo, branding, promosi, social media, dan identitas visual dari Tanah Pasundan.",

  alternates: {
    canonical: "/portfolio",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    url: "https://pajara-website.pajarastd.workers.dev/portfolio",
    title: "Portfolio Desain Grafis & Branding | Pajara Studio",
    description:
      "Jelajahi koleksi karya desain dan eksplorasi identitas visual Pajara Studio.",
  },
};
 
export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
