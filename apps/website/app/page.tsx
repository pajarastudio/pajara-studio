"use client";

import "./globals.css";

const customerWeb = "https://pajara-customer.pajarastd.workers.dev/";

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

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

function Logo({
  className,
  alt = "Logo Pajara Studio",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={logo}
      alt={alt}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}

export default function Home() {
  return (
    <main className="pajara-site">
      {/* NAVBAR */}
      <header className="pajara-navbar">
        <div className="pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-navbar-logo-mark">
              <Logo />
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

          <a
            href={customerWeb}
            className="pajara-nav-button"
            target="_blank"
            rel="noreferrer"
          >
            Pesan Desain
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="pajara-hero">
        <div className="pajara-container">
          <div className="pajara-hero-grid">
            <div className="pajara-hero-copy">
              <span className="pajara-eyebrow">PAJARA STUDIO</span>

              <h1>
                Desain yang
                <br />
                <span>punya arah.</span>
              </h1>

              <p>
                Kami membantu usaha dan brand membangun visual yang lebih
                rapi, kuat, dan mudah dikenali.
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
                <span />
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
                  <Logo />
                </div>

                <div className="pajara-hero-card-bottom">
                  <strong>DESAIN YANG PUNYA ARAH.</strong>
                  <small>Berakar di Tanah Pasundan.</small>
                </div>
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
      <section
        className="pajara-section pajara-services"
        id="layanan"
      >
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <div>
              <span className="pajara-eyebrow">LAYANAN</span>

              <h2>
                Visual yang
                <br />
                bekerja untukmu.
              </h2>
            </div>

            <p>
              Setiap desain dibuat dengan tujuan yang jelas, bukan hanya
              sekadar terlihat bagus.
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

                <span className="pajara-service-arrow">↗</span>

                <h3>{service.title}</h3>

                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section
        className="pajara-section pajara-portfolio"
        id="portfolio"
      >
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <div>
              <span className="pajara-eyebrow">PORTFOLIO</span>

              <h2>
                Karya yang
                <br />
                punya arah.
              </h2>
            </div>

            <p>
              Beberapa karya yang telah dibuat untuk membantu usaha
              tampil lebih rapi, kuat, dan mudah dikenali.
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
        className="pajara-section pajara-about"
        id="tentang"
      >
        <div className="pajara-container">
          <div className="pajara-about-grid">
            <div className="pajara-about-mark">
              <div>
                <Logo />
              </div>
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
                Pajara Studio hadir sebagai studio desain yang berangkat
                dari tanah Pasundan, membantu usaha dan brand membangun
                identitas visual yang punya arah.
              </p>

              <p>
                Kami percaya desain bukan hanya tentang tampilan. Desain
                harus mampu menyampaikan pesan, membangun kepercayaan,
                dan membantu sebuah usaha tumbuh.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE FOUNDER */}
      <section
        className="pajara-section pajara-about"
        id="founder"
      >
        <div className="pajara-container">
          <div className="pajara-founder-card">
            <div className="pajara-about-grid">
              <div className="pajara-about-mark">
                <div>
                  <Logo />
                </div>
              </div>

              <div className="pajara-about-copy">
                <span className="pajara-eyebrow">
                  THE FOUNDER
                </span>

                <h2>
                  Muhamad Rijik
                  <br />
                  Rifa&apos;i.
                </h2>

                <p>
                  Founder &amp; Designer Pajara Studio yang menjadikan
                  desain sebagai ruang untuk terus belajar, berkarya,
                  dan berkembang.
                </p>

                <div className="pajara-about-signature">
                  <strong>PROFIL</strong>
                  <span>TANGGAL LAHIR — 04-03</span>
                  <span>POSISI — FOUNDER &amp; DESIGNER</span>
                  <span>PENDIDIKAN — SMK PERTIWI CIBUNGBULANG</span>
                  <span>BIDANG — GRAPHIC DESIGN &amp; BRANDING</span>
                  <span>
                    KEAHLIAN — PHOTOSHOP, ILLUSTRATOR, BRANDING,
                    LAYOUT, TIPOGRAFI
                  </span>
                  <span>
                    DOMISILI — KAB. BOGOR, KEC. LEUWILIANG
                  </span>
                </div>

                <p>
                  Fokus membangun identitas visual yang rapi, relevan,
                  dan memiliki arah untuk membantu usaha dan brand
                  tampil lebih profesional.
                </p>

                <div className="pajara-about-signature">
                  <strong>&ldquo;Desain yang punya arah.&rdquo;</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section
        className="pajara-section pajara-testimonial"
        id="testimoni"
      >
        <div className="pajara-container">
          <div>
            <span className="pajara-testimonial-label">
              TESTIMONI
            </span>
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
      <section className="pajara-cta" id="kontak">
        <div className="pajara-container">
          <div className="pajara-cta-inner">
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

            <a
              href={customerWeb}
              className="pajara-button-light"
              target="_blank"
              rel="noreferrer"
            >
              Pesan Desain →
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pajara-footer">
        <div className="pajara-container">
          <div className="pajara-footer-top">
            <div className="pajara-footer-brand">
              <div className="pajara-footer-logo">
                <Logo />
              </div>

              <div>
                <strong>Pajara Studio</strong>
                <span>Berakar di Tanah Pasundan.</span>
              </div>
            </div>

            <div className="pajara-footer-links">
              <a
                href="https://instagram.com/pajarastudio.co"
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
            <span>
              © 2026 Pajara Studio. Semua hak dilindungi.
            </span>

            <span>Desain yang punya arah.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
