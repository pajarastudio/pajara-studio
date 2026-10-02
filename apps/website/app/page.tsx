export default function Home() {
  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="#" className="pajara-brand">
            <span className="pajara-brand-mark">P</span>
            <span>Pajara Studio</span>
          </a>

          <nav className="pajara-nav">
            <a href="#layanan">Layanan</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#tentang">Tentang</a>
            <a href="#kontak">Kontak</a>
            <a href="#pesan" className="pajara-nav-cta">
              Pesan Desain
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-hero">
        <div className="pajara-container">
          <div className="pajara-hero-content">
            <p className="pajara-eyebrow">
              Studio Desain Grafis
            </p>

            <h1>
              Pajara <span>Studio.</span>
            </h1>

            <p className="pajara-hero-description">
              Membangun identitas visual yang punya arah,
              karakter, dan nilai untuk bisnis yang ingin
              tampil lebih profesional.
            </p>

            <div className="pajara-hero-actions">
              <a
                href="#pesan"
                className="pajara-button pajara-button-primary"
              >
                Pesan Desain
              </a>

              <a
                href="#portfolio"
                className="pajara-button pajara-button-secondary"
              >
                Lihat Portfolio
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
