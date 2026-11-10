
"use client";

import "./home.css";
import { useState } from "react";

const logo = "/755809946_17926162029385149_3739923509439876817_n.jpg";

const steps = [
  {
    number: "01",
    title: "Pilih layanan desain",
    description:
      "Tentukan jenis desain yang sesuai dengan kebutuhan bisnis atau proyek Kang/Teh.",
    icon: "✳",
  },
  {
    number: "02",
    title: "Ceritakan ide",
    description:
      "Isi brief, jelaskan kebutuhan desain, dan unggah foto referensi untuk membantu proses kreatif.",
    icon: "↗",
  },
  {
    number: "03",
    title: "Konfirmasi pesanan",
    description:
      "Periksa detail pesanan dan informasi pembayaran sebelum proses desain dimulai.",
    icon: "◷",
  },
  {
    number: "04",
    title: "Pantau sampai selesai",
    description:
      "Pantau perkembangan desain, ikuti proses revisi, dan akses file final melalui akun.",
    icon: "✓",
  },
];

const facilities = [
  {
    number: "01",
    title: "Pantau pesanan",
    description:
      "Lihat status dan perkembangan pesanan desain dalam satu dashboard.",
    icon: "◷",
  },
  {
    number: "02",
    title: "Informasi pembayaran",
    description:
      "Periksa informasi DP, pelunasan, dan status pembayaran pesanan.",
    icon: "↗",
  },
  {
    number: "03",
    title: "Revisi desain",
    description:
      "Ajukan revisi dan pantau perkembangannya melalui akun customer.",
    icon: "✳",
  },
  {
    number: "04",
    title: "File desain final",
    description:
      "Akses file hasil desain yang telah tersedia setelah proses selesai.",
    icon: "↓",
  },
  {
    number: "05",
    title: "Paket langganan",
    description:
      "Lihat dan kelola informasi paket langganan yang tersedia di akun.",
    icon: "◇",
  },
  {
    number: "06",
    title: "Bantuan Pajara",
    description:
      "Hubungi tim Pajara Studio melalui WhatsApp jika membutuhkan bantuan.",
    icon: "↗",
  },
];

export default function CustomerHome() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="pajara-home">
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <img
              src={logo}
              alt="Logo Pajara Studio"
              className="pajara-brand-logo"
            />
            <span>Pajara Studio</span>
          </a>

          <button
            type="button"
            className="pajara-menu-toggle"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? "×" : "☰"}
          </button>

          <nav className={`pajara-nav ${menuOpen ? "is-open" : ""}`}>
            <a href="https://pajara-website.pajarastd.workers.dev/">
              Website
            </a>
            <a href="#cara-order" onClick={() => setMenuOpen(false)}>
              Cara Order
            </a>
            <a href="#fasilitas" onClick={() => setMenuOpen(false)}>
              Fasilitas
            </a>
            <a href="/login" className="pajara-nav-cta">
              Login
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-hero">
        <div className="pajara-container pajara-hero-grid">
          <div className="pajara-hero-content">
            <p className="pajara-eyebrow">Customer Web · Pajara Studio</p>

            <h1>
              Punya ide?
              <br />
              Mari wujudkan
              <br />
              bersama <span>Pajara.</span>
            </h1>

            <p className="pajara-hero-description">
              Tempat Kang/Teh memulai perjalanan desain dengan lebih
              terarah. Pesan layanan, pantau proses, kelola pembayaran,
              hingga mengakses file final dalam satu tempat.
            </p>

            <div className="pajara-hero-actions">
              <a href="/login" className="pajara-button pajara-button-primary">
                Mulai Pesan <span aria-hidden="true">↗</span>
              </a>

              <a
                href="#cara-order"
                className="pajara-button pajara-button-secondary"
              >
                Lihat Cara Order
              </a>
            </div>

            <div className="pajara-hero-note">
              <span className="pajara-note-dot" />
              <span>
                Sudah punya akun?{" "}
                <a
                  href="/login"
                  style={{
                    color: "var(--pajara-green)",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Login di sini
                </a>
              </span>
            </div>
          </div>

          <div
            className="pajara-hero-art"
            aria-label="Identitas visual Pajara Studio"
          >
            <div
              className="pajara-art-shape pajara-art-shape-one"
              aria-hidden="true"
            />

            <div
              className="pajara-art-shape pajara-art-shape-two"
              aria-hidden="true"
            />

            <div
              className="pajara-art-shape pajara-art-shape-three"
              aria-hidden="true"
            />

            <div className="pajara-art-card">
              <span className="pajara-art-card-label">
                Design with direction
              </span>

              <div className="pajara-art-logo-frame">
                <img
                  src={logo}
                  alt="Logo Pajara Studio"
                  className="pajara-art-logo"
                />
              </div>

              <h2>Desain yang punya arah.</h2>

              <p>
                Berakar di Tanah Pasundan.
                <br />
                Bertumbuh bersama setiap ide.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="pajara-trust-strip">
        <div className="pajara-container pajara-trust-inner">
          <div className="pajara-trust-item">
            <strong>Satu tempat</strong>
            <span>Kelola pesanan desain</span>
          </div>

          <div className="pajara-trust-item">
            <strong>Lebih terarah</strong>
            <span>Pantau proses dan status</span>
          </div>

          <div className="pajara-trust-item">
            <strong>Lebih praktis</strong>
            <span>Akses informasi pesanan</span>
          </div>
        </div>
      </div>

      <section id="cara-order" className="pajara-section">
        <div className="pajara-container pajara-reveal">
          <div className="pajara-section-heading">
            <p className="pajara-eyebrow">Mulai dari sini</p>

            <h2>
              Dari ide sederhana
              <br />
              menjadi karya yang berarti.
            </h2>

            <p>
              Proses pemesanan dirancang agar Kang/Teh bisa menyampaikan
              kebutuhan dengan jelas dan mengikuti perkembangan pesanan
              melalui Customer Web.
            </p>
          </div>

          <div className="pajara-steps">
            {steps.map((step) => (
              <article className="pajara-step" key={step.number}>
                <div className="pajara-step-top">
                  <span className="pajara-step-number">{step.number}</span>

                  <span className="pajara-step-icon" aria-hidden="true">
                    {step.icon}
                  </span>
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="fasilitas"
        className="pajara-section pajara-facilities-section"
      >
        <div className="pajara-container pajara-facilities-layout pajara-reveal">
          <div className="pajara-facilities-intro">
            <p className="pajara-eyebrow">Di dalam akunmu</p>

            <h2>Semua kebutuhan desain, lebih mudah dijangkau.</h2>

            <p>
              Customer Web menjadi tempat untuk mengikuti perjalanan
              pesanan, mulai dari informasi order hingga file hasil desain
              yang tersedia.
            </p>

            <a
              href="/register"
              className="pajara-button pajara-button-primary"
            >
              Buat Akun <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="pajara-facilities-list">
            {facilities.map((facility) => (
              <article className="pajara-facility" key={facility.number}>
                <div className="pajara-facility-icon" aria-hidden="true">
                  {facility.icon}
                </div>

                <h3>{facility.title}</h3>
                <p>{facility.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pajara-quote">
        <div className="pajara-container pajara-quote-inner">
          <div>
            <p className="pajara-eyebrow">Mari mulai perjalanan kita</p>

            <h2>
              Ide Kang/Teh layak
              <br />
              diwujudkan dengan <em>arah.</em>
            </h2>

            <p>
              Mulai dengan membuat akun atau masuk ke akun yang sudah
              dimiliki. Setelah masuk, Kang/Teh bisa membuka Dashboard
              dan memilih Pesan Desain.
            </p>
          </div>

          <a href="/login" className="pajara-button pajara-button-primary">
            Mulai Pesan <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <footer className="pajara-footer">
        <div className="pajara-container pajara-footer-inner">
          <div className="pajara-footer-brand">
            <img src={logo} alt="" />
            <span>Pajara Studio</span>
          </div>

          <p>Berakar di Tanah Pasundan.</p>

          <div className="pajara-footer-links">
            <a href="https://pajara-website.pajarastd.workers.dev/">
              Website
            </a>

            <a href="/login">Login</a>
            <a href="/register">Buat Akun</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
