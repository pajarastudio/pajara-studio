export default function Home() {
  const services = [
    {
      title: "Logo & Branding",
      description:
        "Membangun identitas visual yang kuat dan mudah dikenali.",
    },
    {
      title: "Desain Promosi",
      description:
        "Visual promosi yang menarik untuk kebutuhan bisnis dan campaign.",
    },
    {
      title: "Social Media",
      description:
        "Desain feed dan story yang konsisten untuk memperkuat tampilan brand.",
    },
    {
      title: "Banner",
      description:
        "Banner digital dengan informasi yang jelas dan visual yang profesional.",
    },
    {
      title: "Kemasan & Menu",
      description:
        "Desain kemasan dan menu yang membantu produk tampil lebih bernilai.",
    },
  ];

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

      <section id="layanan" className="pajara-services">
        <div className="pajara-container">
          <p className="pajara-eyebrow">Layanan</p>

          <h2>Desain untuk kebutuhan bisnis.</h2>

          <p className="pajara-section-description">
            Dari identitas brand hingga kebutuhan promosi,
            Pajara membantu bisnis membangun visual yang
            konsisten dan profesional.
          </p>

          <div className="pajara-services-grid">
            {services.map((service) => (
              <article
                key={service.title}
                className="pajara-service-card"
              >
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
