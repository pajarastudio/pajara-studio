"use client";

import Link from "next/link";
import "./globals.css";

const customerWeb =
  "https://pajara-customer.pajarastd.workers.dev/";

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

const services = [
  {
    number: "01",
    title: "Logo & Branding",
    description:
      "Membangun identitas visual yang kuat, jelas, dan mudah dikenali.",
  },
  {
    number: "02",
    title: "Desain Promosi",
    description:
      "Materi promosi yang menarik perhatian dan tetap punya arah.",
  },
  {
    number: "03",
    title: "Social Media",
    description:
      "Visual social media yang konsisten, rapi, dan sesuai karakter brand.",
  },
  {
    number: "04",
    title: "Banner",
    description:
      "Banner informatif dengan hierarki visual yang jelas dan profesional.",
  },
  {
    number: "05",
    title: "Kemasan & Menu",
    description:
      "Desain kemasan dan menu yang membantu produk tampil lebih meyakinkan.",
  },
];

const portfolio = [
  {
    number: "01",
    title: "Ayam Goreng Kremes",
    category: "Desain Promosi",
    image: "/IMG_20261003_200614_720.jpg",
  },
  {
    number: "02",
    title: "Samara Coffee",
    category: "Social Media",
    image: "/IMG_20261003_200628_911.jpg",
  },
  {
    number: "03",
    title: "Es Teh",
    category: "Desain Promosi",
    image: "/IMG_20261003_200706_317.jpg",
  },
];

function Logo({
  className = "",
  alt = "Logo Pajara Studio",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={logo}
      alt={alt}
      className={`pajara-logo ${className}`}
    />
  );
}

export default function Home() {
  return (
    <main className="pajara-site">
      <nav
        className="pajara-nav"
        aria-label="Navigasi utama"
      >
        <div className="pajara-container pajara-navbar-inner">
          <a href="#home" className="pajara-brand">
            <Logo className="pajara-navbar-logo-mark" />

            <span className="pajara-brand-name">
              Pajara Studio
            </span>
          </a>

          <div className="pajara-nav">
            <a href="#layanan">Layanan</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#tentang">Tentang</a>
            <a href="#testimoni">Testimoni</a>
            <a href="#kontak">Kontak</a>

            <a
              href={customerWeb}
              className="pajara-nav-button"
            >
              Pesan Desain
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        id="home"
        className="pajara-hero"
      >
        <div className="pajara-container pajara-hero-inner">
          <div className="pajara-hero-copy">
            <span className="pajara-eyebrow">
              PAJARA STUDIO
            </span>

            <h1>
              Desain yang
              <br />
              <span>punya arah.</span>
            </h1>

            <p className="pajara-hero-description">
              Pajara Studio membantu brand dan usaha
              membangun visual yang kuat, rapi, dan
              memiliki karakter.
            </p>

            <div className="pajara-hero-actions">
              <a
                href={customerWeb}
                className="pajara-button pajara-button-primary"
              >
                Mulai Pesanan
              </a>

              <a
                href="#portfolio"
                className="pajara-button pajara-button-secondary"
              >
                Lihat Portfolio
              </a>
            </div>

            <p className="pajara-hero-note">
              Berakar di Tanah Pasundan.
            </p>
          </div>

          <div className="pajara-hero-visual">
            <div className="pajara-hero-card">
              <div className="pajara-hero-card-top">
                <span>01</span>
                <span>DESIGN STUDIO</span>
              </div>

              <Logo
                className="pajara-hero-logo"
                alt="Pajara Studio"
              />

              <div className="pajara-hero-card-bottom">
                <span>PAJARA STUDIO</span>
                <span>EST. 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="pajara-trust">
        <div className="pajara-container pajara-trust-inner">
          <span className="pajara-trust-item">
            IDENTITAS
          </span>

          <span className="pajara-trust-item">
            VISUAL
          </span>

          <span className="pajara-trust-item">
            STRATEGI
          </span>

          <span className="pajara-trust-item">
            KONSISTENSI
          </span>
        </div>
      </section>

      {/* LAYANAN */}
      <section
        id="layanan"
        className="pajara-section"
      >
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <span className="pajara-eyebrow">
              LAYANAN
            </span>

            <h2>
              Visual yang bekerja
              <br />
              untuk brand.
            </h2>

            <p>
              Setiap desain dibuat dengan tujuan,
              bukan sekadar terlihat bagus.
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

                <span className="pajara-service-arrow">
                  →
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section
        id="portfolio"
        className="pajara-section"
      >
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <span className="pajara-eyebrow">
              PORTFOLIO
            </span>

            <h2>
              Beberapa karya
              <br />
              yang sudah dibuat.
            </h2>
          </div>

          <div className="pajara-portfolio-grid">
            {portfolio.map((item) => (
              <article
                key={item.number}
                className="pajara-portfolio-card"
              >
                <div className="pajara-portfolio-image">
                  <img
                    src={item.image}
                    alt={item.title}
                  />
                </div>

                <div className="pajara-portfolio-info">
                  <span className="pajara-portfolio-number">
                    {item.number}
                  </span>

                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.category}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TENTANG */}
      <section
        id="tentang"
        className="pajara-section"
      >
        <div className="pajara-container">
          <div className="pajara-about-grid">
            <div className="pajara-about-mark">
              <Logo alt="Logo Pajara Studio" />
            </div>

            <div className="pajara-about-content">
              <span className="pajara-about-label">
                TENTANG PAJARA
              </span>

              <h2>
                Berakar di Tanah Pasundan.
              </h2>

              <div className="pajara-about-text">
                <p>
                  Pajara Studio adalah studio desain
                  grafis yang dibangun dengan satu
                  prinsip sederhana: setiap visual
                  harus memiliki arah.
                </p>

                <p>
                  Kami menggabungkan estetika, fungsi,
                  dan karakter brand untuk menghasilkan
                  desain yang bukan hanya menarik,
                  tetapi juga memiliki tujuan.
                </p>
              </div>

              <div className="pajara-about-signature">
                Pajara Studio
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="pajara-section">
        <div className="pajara-container">
          <div className="pajara-founder-card">
            <div className="pajara-founder-heading">
              <span className="pajara-founder-label">
                THE FOUNDER
              </span>

              <h3>
                Muhamad Rijik Rifa'i
              </h3>

              <p className="pajara-founder-role">
                Founder & Designer Pajara Studio
              </p>
            </div>

            <div className="pajara-founder-info">
              <div>
                <span>Tanggal Lahir</span>
                <strong>04-03</strong>
              </div>

              <div>
                <span>Pendidikan</span>
                <strong>
                  SMK Pertiwi Cibungbulang
                </strong>
              </div>

              <div>
                <span>Bidang</span>
                <strong>
                  Graphic Design & Branding
                </strong>
              </div>

              <div>
                <span>Keahlian</span>
                <strong>
                  Photoshop, Illustrator, Branding,
                  Layout, Tipografi
                </strong>
              </div>

              <div>
                <span>Domisili</span>
                <strong>
                  Kab. Bogor, Kec. Leuwiliang
                </strong>
              </div>

              <div>
                <span>Fokus</span>
                <strong>
                  Membangun desain yang memiliki
                  karakter, fungsi, dan arah.
                </strong>
              </div>
            </div>

            <div className="pajara-founder-signature">
              “Desain yang punya arah.”
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONI — JANGAN DIUBAH */}
      <section
        id="testimoni"
        className="pajara-section"
      >
        <div className="pajara-container">
          <div className="pajara-testimonial">
            <div className="pajara-testimonial-content">
              <span className="pajara-testimonial-label">
                TESTIMONI
              </span>

              <span className="pajara-quote-mark">
                “
              </span>

              <p>
                Tidak ada revisi.
              </p>

              <div className="pajara-testimonial-person">
                <strong>Natsu</strong>
                <span>
                  Client — Pajara Studio
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="kontak"
        className="pajara-cta"
      >
        <div className="pajara-container pajara-cta-inner">
          <div className="pajara-cta-copy">
            <span className="pajara-cta-label">
              PUNYA PROYEK?
            </span>

            <h2>
              Mari buat sesuatu
              <br />
              yang punya arah.
            </h2>

            <p>
              Ceritakan kebutuhan desainmu dan
              mari kita bangun visual yang tepat
              untuk brand-mu.
            </p>
          </div>

          <a
            href={customerWeb}
            className="pajara-cta-button"
          >
            Pesan Desain
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pajara-footer">
        <div className="pajara-container">
          <div className="pajara-footer-top">
            <div className="pajara-footer-brand">
              <Logo
                className="pajara-footer-logo"
                alt="Pajara Studio"
              />

              <p>
                Berakar di Tanah Pasundan.
              </p>
            </div>

            <div className="pajara-footer-links">
              <a href="#layanan">Layanan</a>
              <a href="#portfolio">Portfolio</a>
              <a href="#tentang">Tentang</a>
              <a href="#testimoni">Testimoni</a>
              <a href="#kontak">Kontak</a>

              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>

              <a
                href="https://tiktok.com/"
                target="_blank"
                rel="noreferrer"
              >
                TikTok
              </a>

              <a href={customerWeb}>
                Pesan Desain
              </a>

              <Link href="/privacy-policy">
                Kebijakan Privasi
              </Link>

              <Link href="/terms">
                Ketentuan Layanan
              </Link>
            </div>
          </div>

          <div className="pajara-footer-bottom">
            <span>
              © 2026 Pajara Studio. All rights reserved.
            </span>

            <span>
              Berakar di Tanah Pasundan.
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
