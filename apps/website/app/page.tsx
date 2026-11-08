
"use client";

import { useState } from "react";
import Link from "next/link";
import "./globals.css";

const customerWeb = "https://pajara-customer.pajarastd.workers.dev/";

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

const services = [
  {
    number: "01",
    title: "Logo & Branding",
    description:
      "Jasa desain logo dan branding untuk membangun identitas visual yang kuat, profesional, dan mudah dikenali oleh pelanggan.",
  },
  {
    number: "02",
    title: "Desain Promosi",
    description:
      "Desain poster, brosur, dan materi promosi untuk membantu brand dan UMKM menyampaikan informasi secara menarik.",
  },
  {
    number: "03",
    title: "Desain Social Media",
    description:
      "Desain konten Instagram, feed, dan story dengan visual konsisten sesuai karakter dan identitas brand.",
  },
  {
    number: "04",
    title: "Desain Banner",
    description:
      "Pembuatan desain banner untuk kebutuhan promosi usaha, acara, dan publikasi dengan informasi yang jelas.",
  },
  {
    number: "05",
    title: "Desain Kemasan & Menu",
    description:
      "Desain kemasan produk dan menu usaha untuk memperkuat tampilan visual serta karakter sebuah brand.",
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
      style={{
        display: "block",
        objectFit: "contain",
        maxWidth: "100%",
      }}
    />
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
    >
      {open ? (
        <path
          d="m6 6 12 12M18 6 6 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M4 7h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M4 12h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M4 17h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <main className="pajara-site">
      <nav className="pajara-nav" aria-label="Navigasi utama">
        <div className="pajara-container pajara-navbar-inner">
          <a href="#home" className="pajara-brand" onClick={closeMenu}>
            <Logo className="pajara-navbar-logo-mark" />
            <span className="pajara-brand-name">Pajara Studio</span>
          </a>

          <button
            type="button"
            className="pajara-menu-toggle"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={menuOpen}
            aria-controls="pajara-main-menu"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <MenuIcon open={menuOpen} />
          </button>

          <div
            id="pajara-main-menu"
            className={`pajara-nav pajara-nav-menu${menuOpen ? " is-open" : ""}`}
          >
            <a href="#layanan" onClick={closeMenu}>Layanan</a>
            <a href="#portfolio" onClick={closeMenu}>Portfolio</a>
            <a href="#tentang" onClick={closeMenu}>Tentang</a>
            <a href="#testimoni" onClick={closeMenu}>Testimoni</a>
            <a href="#kontak" onClick={closeMenu}>Kontak</a>
            <a
              href={customerWeb}
              className="pajara-nav-button"
              onClick={closeMenu}
            >
              Pesan Desain
            </a>
          </div>
        </div>
      </nav>

      <section id="home" className="pajara-hero">
        <div className="pajara-container pajara-hero-inner">
          <div className="pajara-hero-copy">
            <span className="pajara-eyebrow">PAJARA STUDIO</span>
            <h1>
              Desain yang
              <br />
              <span>punya arah.</span>
            </h1>
            <p className="pajara-hero-description">
              Pajara Studio membantu brand dan usaha membangun
              visual yang kuat, rapi, dan memiliki karakter.
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
              <Logo className="pajara-hero-logo" />
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
          <span className="pajara-trust-item">IDENTITAS</span>
          <span className="pajara-trust-item">VISUAL</span>
          <span className="pajara-trust-item">STRATEGI</span>
          <span className="pajara-trust-item">KONSISTENSI</span>
        </div>
      </section>

      <section id="layanan" className="pajara-section">
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <span className="pajara-eyebrow">LAYANAN</span>
            <h2>
              Jasa desain grafis
              <br />
              untuk brand dan usaha.
            </h2>
            <p>
              Pajara Studio menyediakan layanan desain logo, branding,
              desain promosi, social media, banner, kemasan, dan menu
              untuk membantu brand membangun identitas visual yang kuat.
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
                <span className="pajara-service-arrow">→</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="pajara-section">
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <span className="pajara-eyebrow">PORTFOLIO</span>
            <h2>
              Beberapa karya
              <br />
              yang sudah dibuat.
            </h2>
            <p>
              Jelajahi berbagai karya dan eksplorasi visual
              dari Pajara Studio.
            </p>
          </div>

          <Link
            href="/portfolio"
            className="pajara-discovery-card"
          >
            <span className="pajara-discovery-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="3.5"
                  y="3.5"
                  width="17"
                  height="17"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M7.5 15.5 11 12l2.5 2.5 3-4 2 2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="8.5" r="1.3" fill="currentColor" />
              </svg>
            </span>

            <span className="pajara-discovery-copy">
              <span className="pajara-discovery-kicker">JELAJAHI KARYA</span>
              <strong>Lihat lebih banyak hasil desain</strong>
              <span className="pajara-discovery-description">
                Temukan karya dan eksplorasi visual lainnya dari Pajara Studio.
              </span>
            </span>

            <span className="pajara-discovery-arrow" aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </section>

      <section id="testimoni" className="pajara-section">
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <span className="pajara-eyebrow">
              TESTIMONI PELANGGAN
            </span>
            <h2>
              Cerita dari
              <br />
              perjalanan kita.
            </h2>
            <p>
              Setiap kepercayaan dan pengalaman pelanggan
              menjadi bagian dari perjalanan Pajara Studio.
            </p>
          </div>

          <Link
            href="/testimonials"
            className="pajara-discovery-card pajara-discovery-card-testimonial"
          >
            <span className="pajara-discovery-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-3.5 2v-5.2A7.5 7.5 0 1 1 20 11.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 10h8M8 13.5h5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <span className="pajara-discovery-copy">
              <span className="pajara-discovery-kicker">CERITA PELANGGAN</span>
              <strong>Lihat lebih banyak testimoni</strong>
              <span className="pajara-discovery-description">
                Simak pengalaman pelanggan yang menjadi bagian dari perjalanan kami.
              </span>
            </span>

            <span className="pajara-discovery-arrow" aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </section>

      <section id="tentang" className="pajara-section">
        <div className="pajara-container">
          <div className="pajara-about-grid">
            <div className="pajara-about-mark">
              <Logo alt="Logo Pajara Studio" />
            </div>
            <div className="pajara-about-content">
              <span className="pajara-about-label">TENTANG PAJARA</span>
              <h2>Berakar di Tanah Pasundan.</h2>
              <div className="pajara-about-text">
                <p>
                  Pajara Studio adalah studio desain grafis
                  yang dibangun dengan satu prinsip sederhana:
                  setiap visual harus memiliki arah.
                </p>
                <p>
                  Kami menggabungkan estetika, fungsi, dan
                  karakter brand untuk menghasilkan desain
                  yang bukan hanya menarik, tetapi juga
                  memiliki tujuan.
                </p>
              </div>
              <div className="pajara-about-signature">Pajara Studio</div>
            </div>
          </div>
        </div>
      </section>

      <section id="founder" className="pajara-section">
        <div className="pajara-container">
          <div className="pajara-founder-card">
            <div className="pajara-founder-heading">
              <span className="pajara-founder-label">THE FOUNDER</span>
              <h3>Muhamad Rijik Rifa&apos;i</h3>
              <p className="pajara-founder-role">
                Founder &amp; Designer Pajara Studio
              </p>
            </div>

            <div className="pajara-founder-info">
              <div>
                <span>Pendidikan</span>
                <strong>SMK Pertiwi Cibungbulang</strong>
              </div>
              <div>
                <span>Bidang</span>
                <strong>Graphic Design &amp; Branding</strong>
              </div>
              <div>
                <span>Keahlian</span>
                <strong>
                  Photoshop, Illustrator, Branding, Layout, Tipografi
                </strong>
              </div>
              <div>
                <span>Fokus</span>
                <strong>
                  Membangun desain yang memiliki karakter,
                  fungsi, dan arah.
                </strong>
              </div>
            </div>

            <div className="pajara-founder-signature">
              “Desain yang punya arah.”
            </div>
          </div>
        </div>
      </section>

      <section id="kontak" className="pajara-cta">
        <div className="pajara-container pajara-cta-inner">
          <div className="pajara-cta-copy">
            <span className="pajara-cta-label">PUNYA PROYEK?</span>
            <h2>
              Mari buat sesuatu
              <br />
              yang punya arah.
            </h2>
            <p>
              Ceritakan kebutuhan desainmu dan mari kita
              bangun visual yang tepat untuk brand-mu.
            </p>
          </div>
          <a href={customerWeb} className="pajara-cta-button">
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
                alt="Logo Pajara Studio"
              />
              <p>Berakar di Tanah Pasundan.</p>
            </div>

            <div className="pajara-footer-links">
              <a
                href="https://pajara-links.pajarastd.workers.dev/"
                target="_blank"
                rel="noreferrer"
              >
                Pajara Links
              </a>
              <a href="#layanan">Layanan</a>
              <a href="#portfolio">Portfolio</a>
              <a href="#tentang">Tentang</a>
              <a href="#testimoni">Testimoni</a>
              <a href="#founder">The Founder</a>
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
              <a href={customerWeb}>Pesan Desain</a>
              <Link href="/portfolio">Semua Portfolio</Link>
              <Link href="/testimonials">Semua Testimoni</Link>
              <Link href="/privacy-policy">Kebijakan Privasi</Link>
              <Link href="/terms">Ketentuan Layanan</Link>
            </div>
          </div>

          <div className="pajara-footer-bottom">
            <span>© 2026 Pajara Studio. All rights reserved.</span>
            <span>Berakar di Tanah Pasundan.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
