import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pajara Studio",
  description: "Berakar di Tanah Pasundan.",
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
