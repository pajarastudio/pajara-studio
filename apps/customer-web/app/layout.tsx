import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
