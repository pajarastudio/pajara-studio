import Image from "next/image";

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

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
      "Membangun identitas visual yang kuat, mudah dikenali, dan sesuai karakter usaha.",
  },
  {
    number: "02",
    title: "Desain Promosi",
    description:
      "Desain poster, banner, dan materi promosi yang menarik perhatian dan punya arah.",
  },
  {
    number: "03",
    title: "Social Media",
    description:
      "Konten visual untuk Instagram yang rapi, konsisten, dan sesuai kebutuhan brand.",
  },
  {
    number: "04",
    title: "Banner",
    description:
      "Visual banner yang jelas, profesional, dan tetap nyaman dilihat.",
  },
  {
    number: "05",
    title: "Kemasan & Menu",
    description:
      "Desain kemasan dan menu yang membantu produk tampil lebih menarik.",
  },
];

const customerWeb = "https://pajara-customer.pajarastd.workers.dev/";

export default function Home() {
  return (
    <main className="pajara-site">
      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <header className="pajara-navbar">
        <div className="pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-navbar-logo-mark">
              <img src={logo} alt="Logo Pajara Studio" />
            </span>

            <span className="pajara-brand-name">
              <strong>Pajara</strong>
              <small>Studio</small>
            </span>
          </a>

          <nav className="pajara-nav-links">
            <a href="#layanan">Layanan</a>
            <a href="#portfolio">Portofolio</a>
            <a href="#tentang">Tentang</a>
            <a href={customerWeb}>Pesan Desain</a>
          </nav>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="pajara-hero">
        <div className="pajara-container pajara-hero-grid">
          <div className="pajara-hero-copy">
            <span className="pajara-eyebrow">
              Pajara Studio — Graphic Design
            </span>

            <h1>
              Desain yang
              <br />
              <span>punya arah.</span>
            </h1>

            <p>
              Kami membantu UMKM dan bisnis membangun tampilan visual yang
              lebih profesional, menarik, dan sesuai dengan karakter usahanya.
            </p>

            <div className="pajara-hero-actions">
              <a href={customerWeb} className="pajara-btn pajara-btn-primary">
                Pesan Desain
              </a>

              <a href="#portfolio" className="pajara-btn pajara-btn-outline">
                Lihat Portofolio
              </a>
            </div>

            <div className="pajara-hero-note">
              <span className="pajara-dot" />
              Berakar di Tanah Pasundan.
            </div>
          </div>

          <div className="pajara-hero-card">
            <div className="pajara-hero-card-logo">
              <img src={logo} alt="Logo Pajara Studio" />
            </div>

            <div className="pajara-hero-card-content">
              <span>PAJARA STUDIO</span>

              <h2>Desain yang punya arah.</h2>

              <p>
                Visual yang bukan hanya terlihat bagus, tapi juga punya tujuan.
              </p>
            </div>

            <div className="pajara-hero-card-footer">
              <span>Branding</span>
              <span>Promosi</span>
              <span>Social Media</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST
      ====================================================== */}
      <section className="pajara-trust">
        <div className="pajara-container pajara-trust-inner">
          <div className="pajara-trust-text">
            <span>UNTUK USAHA YANG INGIN TUMBUH</span>
          </div>

          <div className="pajara-trust-items">
            <span>UMKM</span>
            <span>Brand Lokal</span>
            <span>Bisnis</span>
            <span>Personal Brand</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ====================================================== */}
      <section id="layanan" className="pajara-section pajara-services">
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <div>
              <span className="pajara-section-label">LAYANAN</span>

              <h2>
                Visual yang
                <br />
                <span>sesuai kebutuhan.</span>
              </h2>
            </div>

            <p>
              Setiap desain dibuat berdasarkan kebutuhan, karakter, dan tujuan
              dari usaha yang kamu jalankan.
            </p>
          </div>

          <div className="pajara-services-list">
            {services.map((service) => (
              <article
                className="pajara-service-item"
                key={service.number}
              >
                <span className="pajara-service-number">
                  {service.number}
                </span>

                <div className="pajara-service-main">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>

                <span className="pajara-service-arrow">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          PORTFOLIO
      ====================================================== */}
      <section id="portfolio" className="pajara-section pajara-portfolio">
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <div>
              <span className="pajara-section-label">PORTOFOLIO</span>

              <h2>
                Beberapa karya
                <br />
                <span>Pajara Studio.</span>
              </h2>
            </div>

            <p>
              Setiap karya menjadi bagian dari perjalanan Pajara dalam
              menciptakan desain yang punya fungsi dan karakter.
            </p>
          </div>

          <div className="pajara-portfolio-grid">
            {portfolio.map((item, index) => (
              <article
                className={`pajara-portfolio-card ${
                  index === 0 ? "featured" : ""
                }`}
                key={item.title}
              >
                <div className="pajara-portfolio-image">
                  <img src={item.image} alt={item.title} />
                </div>

                <div className="pajara-portfolio-info">
                  <div>
                    <span>{item.category}</span>
                    <h3>{item.title}</h3>
                  </div>

                  <span className="pajara-portfolio-arrow">↗</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT
      ====================================================== */}
      <section id="tentang" className="pajara-section pajara-about">
        <div className="pajara-container pajara-about-grid">
          <div className="pajara-about-mark">
            <div className="pajara-about-logo">
              <img src={logo} alt="Logo Pajara Studio" />
            </div>
          </div>

          <div className="pajara-about-content">
            <span className="pajara-section-label">TENTANG PAJARA</span>

            <h2>
              Berakar di Tanah
              <br />
              <span>Pasundan.</span>
            </h2>

            <p>
              Pajara Studio adalah studio desain grafis yang hadir untuk
              membantu usaha dan brand membangun identitas visual yang lebih
              kuat.
            </p>

            <p>
              Kami percaya desain bukan sekadar membuat sesuatu terlihat bagus.
              Desain harus punya tujuan, menyampaikan pesan, dan membantu
              sebuah usaha bergerak lebih jauh.
            </p>

            <div className="pajara-about-signature">
              <strong>Muhamad Rijik Rifa&apos;i</strong>
              <span>Founder &amp; Designer</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TESTIMONIAL
      ====================================================== */}
      <section className="pajara-section pajara-testimonial">
        <div className="pajara-container">
          <div className="pajara-testimonial-inner">
            <div className="pajara-testimonial-mark">
              <span>“</span>
            </div>

            <div className="pajara-testimonial-content">
              <span className="pajara-section-label">KATA CLIENT</span>

              <blockquote>
                Hasil desainnya sudah sesuai dan tidak ada revisi.
              </blockquote>

              <div className="pajara-testimonial-person">
                <strong>Natsu</strong>
                <span>Client Pajara Studio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}
      <section className="pajara-cta">
        <div className="pajara-container pajara-cta-inner">
          <div className="pajara-cta-logo">
            <img src={logo} alt="Logo Pajara Studio" />
          </div>

          <div className="pajara-cta-content">
            <span className="pajara-section-label">MULAI SEKARANG</span>

            <h2>
              Punya ide?
              <br />
              <span>Mari kita wujudkan.</span>
            </h2>

            <p>
              Ceritakan kebutuhan desainmu. Kami bantu dari ide sampai menjadi
              visual yang siap digunakan.
            </p>

            <a href={customerWeb} className="pajara-btn pajara-btn-light">
              Pesan Desain
              <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="pajara-footer">
        <div className="pajara-container">
          <div className="pajara-footer-top">
            <a href="/" className="pajara-footer-brand">
              <span className="pajara-footer-logo">
                <img src={logo} alt="Logo Pajara Studio" />
              </span>

              <span>
                <strong>Pajara</strong>
                <small>Studio</small>
              </span>
            </a>

            <div className="pajara-footer-links">
              <a href="#layanan">Layanan</a>
              <a href="#portfolio">Portofolio</a>
              <a href="#tentang">Tentang</a>
              <a href={customerWeb}>Pesan Desain</a>
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
