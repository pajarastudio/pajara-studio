"use client";

import "./globals.css";

const customerWeb = "https://pajara-customer.pajarastd.workers.dev/";

const portfolio = [
  {
    image: "/IMG_20261003_200614_720.jpg",
    title: "Ayam Goreng Kremes",
    category: "Desain Promosi",
  },
  {
    image: "/IMG_20261003_200628_911.jpg",
    title: "Samara Coffee",
    category: "Desain Promosi",
  },
  {
    image: "/IMG_20261003_200706_317.jpg",
    title: "Es Teh",
    category: "Desain Promosi",
  },
];

const services = [
  {
    number: "01",
    title: "Logo & Branding",
    description:
      "Membangun identitas visual yang kuat, mudah dikenali, dan punya arah.",
  },
  {
    number: "02",
    title: "Desain Promosi",
    description:
      "Poster dan materi promosi yang dibuat agar informasi terlihat jelas dan menarik.",
  },
  {
    number: "03",
    title: "Social Media",
    description:
      "Konten visual untuk Instagram dan media sosial yang rapi dan konsisten.",
  },
  {
    number: "04",
    title: "Banner",
    description:
      "Desain banner untuk kebutuhan promosi usaha, kegiatan, maupun acara.",
  },
  {
    number: "05",
    title: "Kemasan & Menu",
    description:
      "Desain kemasan dan menu yang membantu produk terlihat lebih profesional.",
  },
];

export default function Page() {
  return (
    <main className="pajara-site">
      {/* NAVBAR */}
      <header className="pajara-navbar">
        <div className="pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-navbar-logo-mark">
              <img
                src="/755809946_17926162029385149_3739923509439876817_n.jpg"
                alt="Logo Pajara Studio"
              />
            </span>

            <span className="pajara-brand-name">
              <strong>Pajara</strong>
              <small>Studio</small>
            </span>
          </a>

          <nav className="pajara-nav">
            <a href="#layanan">Layanan</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#tentang">Tentang</a>
            <a href="#testimoni">Testimoni</a>
            <a href="#kontak">Kontak</a>
          </nav>

          <a href={customerWeb} className="pajara-nav-button">
            Pesan Desain
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="pajara-hero">
        <div className="pajara-container pajara-hero-grid">
          <div className="pajara-hero-copy">
            <span className="pajara-eyebrow">PAJARA STUDIO</span>

            <h1>
              Desain yang
              <br />
              <span>punya arah.</span>
            </h1>

            <p>
              Kami membantu usaha dan brand membangun visual yang
              lebih rapi, kuat, dan mudah dikenali.
            </p>

            <div className="pajara-hero-actions">
              <a href={customerWeb} className="pajara-button-primary">
                Mulai Pesan Desain
              </a>

              <a href="#portfolio" className="pajara-button-secondary">
                Lihat Portfolio
              </a>
            </div>

            <div className="pajara-hero-note">
              <span></span>
              Berakar di Tanah Pasundan.
            </div>
          </div>

          <div className="pajara-hero-visual">
            <div className="pajara-hero-card">
              <div className="pajara-hero-card-top">
                <span>PAJARA</span>
                <span>STUDIO</span>
              </div>

              <div className="pajara-hero-logo">
                <span>P</span>
              </div>

              <div className="pajara-hero-card-bottom">
                <strong>DESAIN YANG PUNYA ARAH.</strong>
                <small>Berakar di Tanah Pasundan.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="pajara-trust">
        <div className="pajara-container pajara-trust-inner">
          <span>IDENTITAS VISUAL</span>
          <span>DESAIN PROMOSI</span>
          <span>SOCIAL MEDIA</span>
          <span>BRANDING</span>
        </div>
      </section>

      {/* SERVICES */}
      <section id="layanan" className="pajara-section pajara-services">
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <div>
              <span className="pajara-eyebrow">LAYANAN</span>

              <h2>
                Visual yang bekerja
                <br />
                untuk brand kamu.
              </h2>
            </div>

            <p>
              Setiap desain dibuat berdasarkan kebutuhan,
              karakter, dan tujuan komunikasi brand.
            </p>
          </div>

          <div className="pajara-services-grid">
            {services.map((service) => (
              <article
                className="pajara-service-card"
                key={service.number}
              >
                <span className="pajara-service-number">
                  {service.number}
                </span>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <span className="pajara-service-arrow">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section
        id="portfolio"
        className="pajara-section pajara-portfolio"
      >
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <div>
              <span className="pajara-eyebrow">PORTFOLIO</span>

              <h2>
                Beberapa karya
                <br />
                Pajara Studio.
              </h2>
            </div>

            <p>
              Karya yang menjadi bagian dari perjalanan Pajara
              dalam membangun visual untuk berbagai kebutuhan.
            </p>
          </div>

          <div className="pajara-portfolio-grid">
            {portfolio.map((item, index) => (
              <article
                className={`pajara-portfolio-card portfolio-${index + 1}`}
                key={item.title}
              >
                <div className="pajara-portfolio-image">
                  <img
                    src={item.image}
                    alt={item.title}
                  />
                </div>

                <div className="pajara-portfolio-info">
                  <div>
                    <span>{item.category}</span>
                    <h3>{item.title}</h3>
                  </div>

                  <span className="pajara-portfolio-number">
                    0{index + 1}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="tentang"
        className="pajara-section pajara-about"
      >
        <div className="pajara-container pajara-about-grid">
          <div className="pajara-about-mark">
            <div>P</div>
          </div>

          <div className="pajara-about-copy">
            <span className="pajara-eyebrow">
              TENTANG PAJARA
            </span>

            <h2>
              Berakar di Tanah
              <br />
              Pasundan.
            </h2>

            <p>
              Pajara Studio adalah studio desain yang tumbuh dari
              semangat untuk membuat desain yang tidak hanya terlihat
              bagus, tetapi juga punya tujuan.
            </p>

            <p>
              Kami percaya bahwa setiap usaha punya cerita.
              Tugas desain adalah membantu cerita tersebut terlihat
              lebih jelas melalui visual yang tepat.
            </p>

            <div className="pajara-about-signature">
              <strong>Muhamad Rijik Rifa&apos;i</strong>
              <span>Founder & Designer</span>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section
        id="testimoni"
        className="pajara-section pajara-testimonial"
      >
        <div className="pajara-container">
          <div className="pajara-testimonial-label">
            <span className="pajara-eyebrow">TESTIMONI</span>
          </div>

          <div className="pajara-testimonial-content">
            <span className="pajara-quote-mark">&ldquo;</span>

            <blockquote>
              Hasil desainnya sudah sesuai dan tidak ada revisi.
            </blockquote>

            <div className="pajara-testimonial-person">
              <strong>Natsu</strong>
              <span>Client Pajara Studio</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="kontak" className="pajara-cta">
        <div className="pajara-container pajara-cta-inner">
          <div>
            <span className="pajara-eyebrow">
              PUNYA KEBUTUHAN DESAIN?
            </span>

            <h2>
              Mari bikin sesuatu
              <br />
              yang punya arah.
            </h2>
          </div>

          <a href={customerWeb} className="pajara-button-light">
            Pesan Desain →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pajara-footer">
        <div className="pajara-container pajara-footer-top">
          <div className="pajara-footer-brand">
            <div className="pajara-footer-logo">P</div>

            <div>
              <strong>Pajara Studio</strong>
              <span>Berakar di Tanah Pasundan.</span>
            </div>
          </div>

          <div className="pajara-footer-links">
            <a
              href="https://www.instagram.com/pajarastudio.id"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>

            <a
              href="https://www.tiktok.com/@pajarastudio.id"
              target="_blank"
              rel="noreferrer"
            >
              TikTok
            </a>

            <a
              href="https://wa.me/message/TBAFLG4D554PC1"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="pajara-container pajara-footer-bottom">
          <span>
            © 2026 Pajara Studio. Semua hak dilindungi.
          </span>

          <span>Desain yang punya arah.</span>
        </div>
      </footer>
    </main>
  );
}
