export default function CustomerDashboard() {
  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-brand-mark">P</span>
            <span>Pajara Studio</span>
          </a>

          <nav className="pajara-nav">
            <a href="/">Website</a>

            <a
              href="/order"
              className="pajara-nav-cta"
            >
              Pesan Desain
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-dashboard">
        <div className="pajara-container">
          {/* WELCOME */}
          <div className="pajara-dashboard-header">
            <div>
              <p className="pajara-eyebrow">
                Customer Dashboard
              </p>

              <h1>
                Selamat datang di{" "}
                <span>Pajara.</span>
              </h1>

              <p>
                Dari sini Anda dapat memantau pesanan,
                pembayaran, revisi, dan file desain.
              </p>
            </div>
          </div>

          {/* INFORMATION CARDS */}
          <div className="pajara-dashboard-cards">
            <article className="pajara-dashboard-card">
              <div className="pajara-dashboard-icon">
                01
              </div>

              <div>
                <p className="pajara-dashboard-label">
                  Pesanan Aktif
                </p>

                <h3>Pesanan Anda</h3>

                <p>
                  Pesanan yang sedang diproses akan
                  muncul di bagian ini.
                </p>
              </div>
            </article>

            <article className="pajara-dashboard-card">
              <div className="pajara-dashboard-icon">
                02
              </div>

              <div>
                <p className="pajara-dashboard-label">
                  Pembayaran
                </p>

                <h3>Status Pembayaran</h3>

                <p>
                  Informasi pembayaran dan status
                  verifikasi akan ditampilkan di sini.
                </p>
              </div>
            </article>

            <article className="pajara-dashboard-card">
              <div className="pajara-dashboard-icon">
                03
              </div>

              <div>
                <p className="pajara-dashboard-label">
                  Revisi
                </p>

                <h3>Catatan Revisi</h3>

                <p>
                  Catatan revisi dan komunikasi project
                  akan tersedia di bagian ini.
                </p>
              </div>
            </article>

            <article className="pajara-dashboard-card">
              <div className="pajara-dashboard-icon">
                04
              </div>

              <div>
                <p className="pajara-dashboard-label">
                  File Final
                </p>

                <h3>File Desain</h3>

                <p>
                  File desain final dapat diakses setelah
                  project selesai.
                </p>
              </div>
            </article>
          </div>

          {/* ACTIONS */}
          <div className="pajara-dashboard-actions">
            <a
              href="/order"
              className="pajara-button pajara-button-primary"
            >
              Buat Pesanan Baru
            </a>

            <a
              href="/"
              className="pajara-button pajara-button-secondary"
            >
              Kembali ke Website
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
