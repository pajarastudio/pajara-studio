import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pajara Admin",
  description: "Dashboard Admin Pajara Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
