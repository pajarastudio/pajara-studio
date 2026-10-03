type OrderDetailPageProps = {
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

export default async function OrderDetail({
  params,
}: OrderDetailPageProps) {
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
          <p className="pajara-eyebrow">DETAIL PESANAN</p>

          <h1>Detail Pesanan</h1>

          <p>
            ID Pesanan:
            <br />
            <strong>{id}</strong>
          </p>

          <div style={{ marginTop: "24px" }}>
            <h2>Status Pesanan</h2>
            <p>Menunggu konfirmasi.</p>
          </div>

          <div style={{ marginTop: "24px" }}>
            <h2>Menu Pesanan</h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <a
                href={`/orders/${id}/payment`}
                className="pajara-button"
              >
                Pembayaran
              </a>

              <a
                href={`/orders/${id}/revision`}
                className="pajara-button"
              >
                Revisi
              </a>

              <a
                href={`/orders/${id}/files`}
                className="pajara-button"
              >
                File Pesanan
              </a>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <a href="/dashboard">
              ← Kembali ke Dashboard
            </a>
          </div>
        </div>
      </section>
    </main>
  );
      }
