const services = [
  {
    title: "Logo & Branding",
    text: "Membangun identitas visual yang jelas, konsisten, dan mudah diingat.",
  },
  {
    title: "Desain Promosi",
    text: "Poster dan materi promosi untuk membantu produk atau usaha tampil lebih menarik.",
  },
  {
    title: "Social Media",
    text: "Konten visual untuk Instagram dan media sosial dengan tampilan yang rapi.",
  },
  {
    title: "Banner",
    text: "Desain banner untuk kebutuhan promosi online maupun offline.",
  },
  {
    title: "Kemasan & Menu",
    text: "Visual kemasan dan menu yang disesuaikan dengan karakter usaha.",
  },
];

const portfolio = [
  {
    title: "Nescafé",
    category: "Desain Promosi",
  },
  {
    title: "Kobie",
    category: "Social Media",
  },
  {
    title: "Identitas Pajara",
    category: "Branding",
  },
];

export default function Home() {
  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-brand-mark">P</span>

            <span>
              <strong>Pajara</strong>
              <small>Studio</small>
            </span>
          </a>

          <nav className="pajara-nav">
            <a href="#layanan">Layanan</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#tentang">Tentang</a>
            <a href="/links">Links</a>
          </nav>

          <a href="/customer" className="pajara-nav-button">
            Pesan Desain
          </a>
        </div>
      </header>

      <section className="pajara-hero">
        <div className="pajara-container pajara-hero-grid">
          <div className="pajara-hero-content">
            <p className="pajara-eyebrow">PAJARA STUDIO</p>

            <h1>
              Desain yang
              <br />
              <span>punya arah.</span>
            </h1>

            <p className="pajara-hero-text">
              Pajara Studio membantu UMKM, brand, dan kebutuhan personal
              membangun visual yang rapi, berkarakter, dan punya tujuan.
            </p>

            <div className="pajara-actions">
              <a href="/customer" className="pajara-button">
                Pesan Desain
              </a>

              <a href="#portfolio" className="pajara-button-outline">
                Lihat Portfolio
              </a>
            </div>

            <div className="pajara-hero-note">
              <span>●</span>
              Berakar di Tanah Pasundan.
            </div>
          </div>

          <div className="pajara-hero-card">
            <div className="pajara-hero-card-top">
              <span>01</span>
              <span>EST. PAJARA</span>
            </div>

            <div className="pajara-symbol">P</div>

            <div className="pajara-hero-card-bottom">
              <strong>Pajara Studio</strong>
              <span>Desain & Visual</span>
            </div>
          </div>
        </div>
      </section>

      <section id="layanan" className="pajara-section">
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <div>
              <p className="pajara-eyebrow">LAYANAN</p>
              <h2>Yang bisa kami bantu.</h2>
            </div>

            <p>
              Dari identitas brand sampai kebutuhan promosi sehari-hari,
              Pajara membantu menerjemahkan ide menjadi visual.
            </p>
          </div>

          <div className="pajara-service-grid">
            {services.map((service, index) => (
              <article className="pajara-service-card" key={service.title}>
                <span className="pajara-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3>{service.title}</h3>

                <p>{service.text}</p>

                <span className="pajara-arrow">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="pajara-section pajara-portfolio">
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <div>
              <p className="pajara-eyebrow">PORTFOLIO</p>
              <h2>Beberapa karya kami.</h2>
            </div>

            <a href="/links" className="pajara-text-link">
              Lihat selengkapnya →
            </a>
          </div>

          <div className="pajara-portfolio-grid">
            {portfolio.map((item, index) => (
              <article className="pajara-portfolio-card" key={item.title}>
                <div className="pajara-portfolio-image">
                  {index === 2 ? (
                    <div className="pajara-portfolio-logo">P</div>
                  ) : (
                    <span>{item.title}</span>
                  )}
                </div>

                <div className="pajara-portfolio-info">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.category}</p>
                  </div>

                  <span>↗</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tentang" className="pajara-section">
        <div className="pajara-container">
          <div className="pajara-about">
            <div>
              <p className="pajara-eyebrow">TENTANG PAJARA</p>

              <h2>
                Bukan sekadar
                <br />
                membuat desain.
              </h2>
            </div>

            <div className="pajara-about-copy">
              <p>
                Pajara Studio hadir untuk membantu kebutuhan visual dengan
                pendekatan yang sederhana, rapi, dan punya arah.
              </p>

              <p>
                Kami percaya desain yang baik bukan hanya terlihat bagus,
                tetapi juga membantu menyampaikan pesan dengan jelas.
              </p>

              <div className="pajara-about-signature">
                <strong>Muhamad Rijik Rifa&apos;i</strong>
                <span>Owner & Founder Pajara Studio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pajara-cta">
        <div className="pajara-container pajara-cta-inner">
          <div>
            <p className="pajara-eyebrow">PUNYA KEBUTUHAN DESAIN?</p>

            <h2>Yuk, mulai dari idenya.</h2>

            <p>
              Ceritakan kebutuhan desainmu kepada Pajara Studio.
            </p>
          </div>

          <a href="/customer" className="pajara-button pajara-button-light">
            Pesan Desain →
          </a>
        </div>
      </section>

      <footer className="pajara-footer">
        <div className="pajara-container">
          <div className="pajara-footer-grid">
            <div>
              <a href="/" className="pajara-brand pajara-brand-footer">
                <span className="pajara-brand-mark">P</span>

                <span>
                  <strong>Pajara</strong>
                  <small>Studio</small>
                </span>
              </a>

              <p>
                Desain yang punya arah.
                <br />
                Berakar di Tanah Pasundan.
              </p>
            </div>

            <div>
              <h3>Navigasi</h3>
              <a href="#layanan">Layanan</a>
              <a href="#portfolio">Portfolio</a>
              <a href="#tentang">Tentang</a>
              <a href="/links">Pajara Links</a>
            </div>

            <div>
              <h3>Mulai</h3>
              <a href="/customer">Pesan Desain</a>
              <a href="/customer/login">Login Customer</a>
            </div>
          </div>

          <div className="pajara-footer-bottom">
            <span>© 2026 Pajara Studio</span>
            <span>Berakar di Tanah Pasundan.</span>
          </div>
        </div>
      </footer>
    </main>
  );
                }
