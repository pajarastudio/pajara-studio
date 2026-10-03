type RevisionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return [{ id: "demo" }];
}

export default async function RevisionPage({
  params,
}: RevisionPageProps) {
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
          <p className="pajara-eyebrow">REVISI PESANAN</p>

          <h1>Revisi Pesanan</h1>

          <p>
            ID Pesanan:
            <br />
            <strong>{id}</strong>
          </p>

          <div style={{ marginTop: "24px" }}>
            <h2>Status Revisi</h2>

            <p>
              Belum ada permintaan revisi untuk pesanan ini.
            </p>
          </div>

          <div style={{ marginTop: "24px" }}>
            <h2>Catatan Revisi</h2>

            <p>
              Jika ada revisi, catatan dan instruksi dari
              Pajara Studio akan muncul di halaman ini.
            </p>
          </div>

          <div style={{ marginTop: "24px" }}>
            <a
              href={`/orders/${id}`}
              className="pajara-button"
            >
              Kembali ke Pesanan
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
