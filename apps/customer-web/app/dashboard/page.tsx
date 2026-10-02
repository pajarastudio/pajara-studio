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
        <a href="/order" className="pajara-nav-cta">
          Pesan Desain
        </a>
      </nav>
    </div>
  </header>

  <section className="pajara-services">
    <div className="pajara-container">
      <p className="pajara-eyebrow">
        Customer Dashboard
      </p>

      <h1>
        Selamat datang di <span>Pajara.</span>
      </h1>

      <p className="pajara-section-description">
        Dari sini Anda dapat memantau pesanan, pembayaran,
        revisi, dan file desain.
      </p>

      <div className="pajara-services-grid">
        <article className="pajara-service-card">
          <h3>Pesanan Aktif</h3>
          <p>
            Pesanan yang sedang diproses akan muncul di
            bagian ini.
          </p>
        </article>

        <article className="pajara-service-card">
          <h3>Pembayaran</h3>
          <p>
            Informasi pembayaran dan status verifikasi
            akan ditampilkan di sini.
          </p>
        </article>

        <article className="pajara-service-card">
          <h3>Revisi</h3>
          <p>
            Catatan revisi dan komunikasi project akan
            tersedia di bagian ini.
          </p>
        </article>

        <article className="pajara-service-card">
          <h3>File Final</h3>
          <p>
            File desain final dapat diakses setelah
            project selesai.
          </p>
        </article>
      </div>

      <div
        style={{
          marginTop: "48px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
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
