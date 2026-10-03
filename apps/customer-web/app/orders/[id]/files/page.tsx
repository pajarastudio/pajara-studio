type OrderFilesPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return [
    {
      id: "demo",
    },
  ];
}

export default async function OrderFiles({
  params,
}: OrderFilesPageProps) {
  const { id } = await params;

  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-brand-mark">P</span>
            <span>Pajara Studio</span>
          </a>

          <nav className="pajara-nav">
            <a href="/dashboard">Dashboard</a>
            <a href="/order">Pesan Desain</a>
          </nav>
        </div>
      </header>

      <section className="pajara-container pajara-section">
        <div className="pajara-card">
          <p className="pajara-eyebrow">FILE PESANAN</p>

          <h1>File Pesanan</h1>

          <p>
            File untuk pesanan dengan ID:
            <br />
            <strong>{id}</strong>
          </p>

          <div style={{ marginTop: "24px" }}>
            <h2>Belum ada file final</h2>

            <p>
              File final akan tersedia setelah pesanan selesai
              dan pembayaran telah dikonfirmasi.
            </p>
          </div>

          <div style={{ marginTop: "24px" }}>
            <a href={`/orders/${id}`} className="pajara-button">
              K
