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
      {/* =========================
          NAVBAR
      ========================= */}

      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-brand-mark">P</span>
            <span>Pajara Studio</span>
          </a>

          <nav className="pajara-nav">
            <a href="/dashboard">Dashboard</a>

            <a
              href="/order"
              className="pajara-nav-cta"
            >
              Pesan Desain
            </a>
          </nav>
        </div>
      </header>

      {/* =========================
          ORDER DETAIL
      ========================= */}

      <section className="pajara-order-detail">
        <div className="pajara-container">

          {/* HEADER */}

          <div className="pajara-order-detail-header">
            <div>
              <p className="pajara-eyebrow">
                Customer Area
              </p>

              <h1>
                Detail <span>Pesanan.</span>
              </h1>

              <p>
                Pantau perkembangan project Anda,
                mulai dari pembayaran hingga file
                desain final.
              </p>
            </div>
          </div>

          {/* ORDER SUMMARY */}

          <div className="pajara-order-summary">

            <div className="pajara-order-summary-main">
              <div>
                <p className="pajara-dashboard-label">
                  Pesanan
                </p>

                <h2>Desain Promosi</h2>

                <p className="pajara-order-id">
                  ID Pesanan: <strong>{id}</strong>
                </p>
              </div>

              <div className="pajara-order-summary-status">
                <span className="pajara-status-dot" />

                <div>
                  <small>Status Pesanan</small>

                  <strong>
                    Menunggu Konfirmasi
                  </strong>
                </div>
              </div>
            </div>

            <div className="pajara-order-summary-meta">

              <div>
                <span>Layanan</span>
                <strong>Desain Promosi</strong>
              </div>

              <div>
                <span>Jumlah</span>
                <strong>1 Desain</strong>
              </div>

              <div>
                <span>Pembayaran</span>
                <strong>Belum Dibayar</strong>
              </div>

            </div>
          </div>

          {/* PROGRESS */}

          <div className="pajara-order-progress">
            <div className="pajara-order-progress-header">
              <div>
                <p className="pajara-dashboard-label">
                  Progress Project
                </p>

                <h2>
                  Perjalanan Pesanan
                </h2>
              </div>

              <span>
                01 / 05
              </span>
            </div>

            <div className="pajara-progress-line">

              <div className="pajara-progress-step active">
                <span>01</span>

                <div>
                  <strong>
                    Pesanan Dibuat
                  </strong>

                  <small>
                    Menunggu konfirmasi
                  </small>
                </div>
              </div>

              <div className="pajara-progress-step">
                <span>02</span>

                <div>
                  <strong>
                    Produksi
                  </strong>

                  <small>
                    Belum dimulai
                  </small>
                </div>
              </div>

              <div className="pajara-progress-step">
                <span>03</span>

                <div>
                  <strong>
                    Revisi
                  </strong>

                  <small>
                    Belum tersedia
                  </small>
                </div>
              </div>

              <div className="pajara-progress-step">
                <span>04</span>

                <div>
                  <strong>
                    Persetujuan
                  </strong>

                  <small>
                    Belum tersedia
                  </small>
                </div>
              </div>

              <div className="pajara-progress-step">
                <span>05</span>

                <div>
                  <strong>
                    Selesai
                  </strong>

                  <small>
                    Belum tersedia
                  </small>
                </div>
              </div>

            </div>
          </div>

          {/* MENU */}

          <div className="pajara-order-menu">

            <div className="pajara-order-menu-header">
              <p className="pajara-dashboard-label">
                Kelola Pesanan
              </p>

              <h2>
                Akses Project
              </h2>

              <p>
                Gunakan menu berikut untuk melihat
                bagian project Anda.
              </p>
            </div>

            <div className="pajara-order-menu-grid">

              <a
                href={`/orders/${id}/payment`}
                className="pajara-order-action"
              >
                <div className="pajara-order-action-number">
                  01
                </div>

                <div className="pajara-order-action-content">
                  <span>Pembayaran</span>

                  <strong>
                    Kelola Pembayaran
                  </strong>

                  <p>
                    Lihat status dan informasi
                    pembayaran pesanan.
                  </p>
                </div>

                <div className="pajara-order-action-arrow">
                  →
                </div>
              </a>

              <a
                href={`/orders/${id}/revision`}
                className="pajara-order-action"
              >
                <div className="pajara-order-action-number">
                  02
                </div>

                <div className="pajara-order-action-content">
                  <span>Revisi</span>

                  <strong>
                    Catatan Revisi
                  </strong>

                  <p>
                    Lihat dan kirim catatan revisi
                    untuk project Anda.
                  </p>
                </div>

                <div className="pajara-order-action-arrow">
                  →
                </div>
              </a>

              <a
                href={`/orders/${id}/files`}
                className="pajara-order-action"
              >
                <div className="pajara-order-action-number">
                  03
                </div>

                <div className="pajara-order-action-content">
                  <span>File Project</span>

                  <strong>
                    File Pesanan
                  </strong>

                  <p>
                    Akses file desain yang tersedia
                    untuk pesanan Anda.
                  </p>
                </div>

                <div className="pajara-order-action-arrow">
                  →
                </div>
              </a>

            </div>
          </div>

          {/* BACK */}

          <div className="pajara-order-detail-back">
            <a href="/dashboard">
              ← Kembali ke Dashboard
            </a>
          </div>

        </div>
      </section>
    </main>
  );
}
