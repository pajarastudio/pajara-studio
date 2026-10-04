"use client";

import "./globals.css";

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

const customerWeb = "https://pajara-customer.pajarastd.workers.dev/";

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

const portfolio = [
  {
    image: "/IMG_20261003_200614_720.jpg",
    category: "DESAIN PROMOSI",
    title: "Ayam Goreng Kremes",
  },
  {
    image: "/IMG_20261003_200628_911.jpg",
    category: "SOCIAL MEDIA",
    title: "Samara Coffee",
  },
  {
    image: "/IMG_20261003_200706_317.jpg",
    category: "DESAIN PROMOSI",
    title: "Es Teh",
  },
];

export default function Home() {
  return (
    <main>
      {/* =========================
          NAVBAR
          ========================= */}
      <header className="pajara-navbar">
        <div className="pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-navbar-logo-mark">
              <img
                src={logo}
                alt="Logo Pajara Studio"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "inherit",
                  display: "block",
                }}
              />
            </span>

            <span className="pajara-brand-name">
              <strong>Pajara</strong>
              <small>Studio</small>
            </span>
          </a>

          <nav className="pajara-nav">
            <a href="#layanan" className="pajara-nav-button">
              Layanan
            </a>
            <a href="#portfolio" className="pajara-nav-button">
              Portfolio
            </a>
            <a href="#tentang" className="pajara-nav-button">
              Tentang
            </a>
            <a href="#testimoni" className="pajara-nav-button">
              Testimoni
            </a>
            <a href="#kontak" className="pajara-nav-button">
              Kontak
            </a>
          </nav>

          <a
            href={customerWeb}
            className="pajara-button-primary"
            target="_blank"
            rel="noreferrer"
          >
            Pesan Desain
          </a>
        </div>
      </header>

      {/* =========================
          HERO
          ========================= */}
      <section className="pajara-hero">
        <div className="pajara-hero-grid">
          <div className="pajara-hero-copy">
            <div className="pajara-eyebrow">PAJARA STUDIO</div>

            <h1>
              Desain yang
              <br />
              <em>punya arah.</em>
            </h1>

            <p>
              Kami membantu usaha dan brand membangun visual yang lebih rapi,
              kuat, dan mudah dikenali.
            </p>

            <div className="pajara-hero-actions">
              <a
                href={customerWeb}
                className="pajara-button-primary"
                target="_blank"
                rel="noreferrer"
              >
                Mulai Pesan Desain
              </a>

              <a
                href="#portfolio"
                className="pajara-button-secondary"
              >
                Lihat Portfolio
              </a>
            </div>

            <div className="pajara-hero-note">
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
                <img
                  src={logo}
                  alt="Pajara Studio"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>

              <div className="pajara-hero-card-bottom">
                <strong>DESAIN YANG PUNYA ARAH.</strong>
                <span>Berakar di Tanah Pasundan.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          TRUST
          ========================= */}
      <section className="pajara-trust">
        <div className="pajara-trust-inner">
          <span>IDENTITAS VISUAL</span>
          <span>DESAIN PROMOSI</span>
          <span>SOCIAL MEDIA</span>
          <span>BRANDING</span>
        </div>
      </section>

      {/* =========================
          SERVICES
          ========================= */}
      <section
        id="layanan"
        className="pajara-section pajara-services"
      >
        <div className="pajara-section-heading">
          <div>
            <div className="pajara-eyebrow">LAYANAN</div>

            <h2>
              Visual yang
              <br />
              <em>punya arah.</em>
            </h2>
          </div>

          <p>
            Setiap desain dibuat dengan tujuan yang jelas, bukan sekadar
            terlihat bagus.
          </p>
        </div>

        <div className="pajara-services-grid">
          {services.map((service) => (
            <article
              key={service.number}
              className="pajara-service-card"
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
      </section>

      {/* =========================
          PORTFOLIO
          ========================= */}
      <section
        id="portfolio"
        className="pajara-section pajara-portfolio"
      >
        <div className="pajara-section-heading">
          <div>
            <div className="pajara-eyebrow">PORTFOLIO</div>

            <h2>
              Beberapa karya
              <br />
              <em>yang sudah dibuat.</em>
            </h2>
          </div>

          <p>
            Sebuah proses kecil untuk membangun pengalaman dan karya yang
            terus berkembang bersama Pajara Studio.
          </p>
        </div>

        <div className="pajara-portfolio-grid">
          {portfolio.map((item, index) => (
            <article
              key={item.title}
              className={`pajara-portfolio-card portfolio-${index + 1}`}
            >
              <div className="pajara-portfolio-image">
                <img
                  src={item.image}
                  alt={item.title}
                  loading={index === 0 ? "eager" : "lazy"}
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
      </section>

      {/* =========================
          ABOUT
          ========================= */}
      <section
        id="tentang"
        className="pajara-section pajara-about"
      >
        <div className="pajara-about-grid">
          <div className="pajara-about-mark">
            <div>
              <img
                src={logo}
                alt="Logo Pajara Studio"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          </div>

          <div className="pajara-about-copy">
            <div className="pajara-eyebrow">TENTANG PAJARA</div>

            <h2>
              Berakar di Tanah
              <br />
              <em>Pasundan.</em>
            </h2>

            <p>
              Pajara Studio adalah studio desain yang hadir untuk membantu
              usaha dan brand membangun identitas visual yang lebih rapi,
              profesional, dan mudah dikenali.
            </p>

            <p>
              Kami percaya desain bukan hanya tentang tampilan. Desain yang
              baik harus punya tujuan, menyampaikan pesan, dan membantu
              sebuah usaha bergerak lebih jauh.
            </p>

            <div className="pajara-about-signature">
              <strong>Muhamad Rijik Rifa&apos;i</strong>
              <span>Founder &amp; Designer</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          TESTIMONIAL
          ========================= */}
      <section
        id="testimoni"
        className="pajara-section pajara-testimonial"
      >
        <div className="pajara-testimonial-content">
          <div className="pajara-testimonial-label">
            TESTIMONI
          </div>

          <span className="pajara-quote-mark">&ldquo;</span>

          <blockquote>
            Hasil desainnya sudah sesuai dan tidak ada revisi.
          </blockquote>

          <div className="pajara-testimonial-person">
            <strong>Natsu</strong>
            <span>Client Pajara Studio</span>
          </div>
        </div>
      </section>

      {/* =========================
          CTA
          ========================= */}
      <section className="pajara-cta" id="kontak">
        <div className="pajara-cta-inner">
          <div>
            <div className="pajara-eyebrow">
              PUNYA KEBUTUHAN DESAIN?
            </div>

            <h2>
              Mari bikin sesuatu
              <br />
              <em>yang punya arah.</em>
            </h2>
          </div>

          <a
            href={customerWeb}
            className="pajara-button-light"
            target="_blank"
            rel="noreferrer"
          >
            Pesan Desain →
          </a>
        </div>
      </section>

      {/* =========================
          FOOTER
          ========================= */}
      <footer className="pajara-footer">
        <div className="pajara-footer-top">
          <div className="pajara-footer-brand">
            <div className="pajara-footer-logo">
              <img
                src={logo}
                alt="Logo Pajara Studio"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            <div>
              <strong>Pajara Studio</strong>
              <span>Berakar di Tanah Pasundan.</span>
            </div>
          </div>

          <div className="pajara-footer-links">
            <a
              href="https://www.instagram.com/pajarastudio.co/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>

            <a
              href="https://www.tiktok.com/@pajarastudio.co"
              target="_blank"
              rel="noreferrer"
            >
              TikTok
            </a>

            <a
              href={customerWeb}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="pajara-footer-bottom">
          <span>© 2026 Pajara Studio. Semua hak dilindungi.</span>
          <span>Desain yang punya arah.</span>
        </div>
      </footer>
    </main>
  );
}
