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
      className={className}
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

      <section
        id="home"
        className="pajara-hero"
      >
        <div className="pajara-container pajara-hero-grid">
          <div className="pajara-hero-copy">
            <span className="pajara-eyebrow">
              PAJARA STUDIO
            </span>

            <h1>
              Desain yang
              <br />
              punya arah.
            </h1>

            <p>
              Pajara Studio membantu brand dan usaha
              membangun visual yang kuat, rapi, dan
              memiliki karakter.
            </p>

            <div className="pajara-hero-actions">
              <a
                href={customerWeb}
                className="pajara-button-primary"
              >
                Mulai Pesanan
              </a>

              <a
                href="#portfolio"
                className="pajara-button-secondary"
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

      <section className="pajara-trust">
        <div className="pajara-container pajara-trust-inner">
          <span>IDENTITAS</span>
          <span>VISUAL</span>
          <span>STRATEGI</span>
          <span>KONSISTENSI</span>
        </div>
      </section>

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
              <div
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
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section
        id="tentang"
        className="pajara-section"
      >
        <div className="pajara-container">
          <div className="pajara-about-grid">
            <div className="pajara-about-mark">
              <Logo alt="Pajara Studio" />
            </div>

            <div className="pajara-about-copy">
              <span className="pajara-eyebrow">
                TENTANG PAJARA
              </span>

              <h2>
                Berakar di Tanah Pasundan.
              </h2>

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

              <div className="pajara-about-signature">
                Pajara Studio
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pajara-section">
        <div className="pajara-container">
          <div className="pajara-founder-card">
            <div className="pajara-section-heading">
              <span className="pajara-eyebrow">
                THE FOUNDER
              </span>

              <h2>
                Muhamad Rijik Rifa'i.
              </h2>

              <p>
                Founder & Designer Pajara Studio
              </p>
            </div>

            <div className="pajara-about-copy">
              <p>
                <strong>Tanggal Lahir</strong>
                <br />
                04-03
              </p>

              <p>
                <strong>Pendidikan</strong>
                <br />
                SMK PERTIWI CIBUNGBULANG
              </p>

              <p>
                <strong>Bidang</strong>
                <br />
                GRAPHIC DESIGN & BRANDING
              </p>

              <p>
                <strong>Keahlian</strong>
                <br />
                Photoshop, Illustrator, Branding,
                Layout, Tipografi
              </p>

              <p>
                <strong>Domisili</strong>
                <br />
                Kab. Bogor, Kec. Leuwiliang
              </p>

              <p>
                <strong>Fokus</strong>
                <br />
                Membangun desain yang memiliki
                karakter, fungsi, dan arah.
              </p>

              <div className="pajara-about-signature">
                “Desain yang punya arah.”
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <section
        id="kontak"
        className="pajara-cta"
      >
        <div className="pajara-container pajara-cta-inner">
          <span className="pajara-eyebrow">
            PUNYA PROYEK?
          </span>

          <h2>
            Mari buat sesuatu
            <br />
            yang punya arah.
          </h2>

          <a
            href={customerWeb}
            className="pajara-button-light"
          >
            Pesan Desain
          </a>
        </div>
      </section>

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
              <a
                href="#layanan"
              >
                Layanan
              </a>

              <a
                href="#portfolio"
              >
                Portfolio
              </a>

              <a
                href="#tentang"
              >
                Tentang
              </a>

              <a
                href="#testimoni"
              >
                Testimoni
              </a>

              <a
                href="#kontak"
              >
                Kontak
              </a>

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

              <a
                href={customerWeb}
              >
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
