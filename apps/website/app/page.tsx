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
    title: "Ayam Goreng Kremes",
    category: "Desain Promosi",
    image: "/IMG_20261003_200614_720.jpg",
  },
  {
    title: "Samara Coffee",
    category: "Social Media",
    image: "/IMG_20261003_200628_911.jpg",
  },
  {
    title: "Es Teh",
    category: "Desain Promosi",
    image: "/IMG_20261003_200706_317.jpg",
  },
];

const testimonials = [
  {
    name: "Natsu Cibinong",
    text: "Pertama kali, tapi alhamdulillah hasilnya memuaskan, design bagus dan pengerjaan cepat. Koordinasi juga gak susah. Terima kasih.",
  },
  {
    name: "Kebon Jati Keramat",
    text: "Terima kasih banyak ya kak. Kedua kalinya design di sini, suka dengan design-nya dan yang terpenting komunikatif.",
  },
];

const socialLinks = [
  {
    title: "Instagram",
    text: "@pajarastudio.id",
    href: "https://www.instagram.com/pajarastudio.id?stkn=MXU3dngxY2hiOTF0NA==",
  },
  {
    title: "TikTok",
    text: "@pajarastudio.id",
    href: "https://www.tiktok.com/@pajarastudio.id?_r=1&_t=ZS-9AFPJ6qeP0m",
  },
  {
    title: "WhatsApp",
    text: "Hubungi Pajara Studio",
    href: "https://wa.me/message/TBAFLG4D554PC1",
  },
];

const customerWeb = "https://pajara-customer.pajarastd.workers.dev/";
const customerLogin =
  "https://pajara-customer.pajarastd.workers.dev/login";

const logoImage =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

export default function Home() {
  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <img
              src={logoImage}
              alt="Logo Pajara Studio"
              className="pajara-brand-logo"
            />

            <span>
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
              <a href={customerWeb} className="pajara-button">
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
              <span>PAJARA STUDIO</span>
            </div>

            <img
              src={logoImage}
              alt="Logo Pajara Studio"
              className="pajara-hero-logo"
            />

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

      <section
        id="portfolio"
        className="pajara-section pajara-portfolio"
      >
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <div>
              <p className="pajara-eyebrow">PORTFOLIO</p>
              <h2>Beberapa karya Pajara.</h2>
            </div>

            <a href="#kontak" className="pajara-text-link">
              Punya kebutuhan? →
            </a>
          </div>

          <div className="pajara-portfolio-grid">
            {portfolio.map((item) => (
              <article
                className="pajara-portfolio-card"
                key={item.title}
              >
                <div className="pajara-portfolio-image">
                  <img src={item.image} alt={item.title} />
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
                <span className="pajara-eyebrow">
                  OWNER & FOUNDER
                </span>

                <strong>Muhamad Rijik Rifa&apos;i</strong>

                <span>Pajara Studio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="testimoni"
        className="pajara-section pajara-testimonials"
      >
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <div>
              <p className="pajara-eyebrow">TESTIMONI</p>
              <h2>Cerita dari pelanggan.</h2>
            </div>

            <p>
              Beberapa pengalaman pelanggan setelah bekerja bersama Pajara
              Studio.
            </p>
          </div>

          <div className="pajara-testimonial-grid">
            {testimonials.map((testimonial) => (
              <article
                className="pajara-testimonial-card"
                key={testimonial.name}
              >
                <span className="pajara-quote-mark">
                  &ldquo;
                </span>

                <p>{testimonial.text}</p>

                <div className="pajara-testimonial-name">
                  <strong>{testimonial.name}</strong>
                  <span>Pelanggan Pajara Studio</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="kontak" className="pajara-contact-section">
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <div>
              <p className="pajara-eyebrow">HUBUNGI PAJARA</p>
              <h2>Mulai dari idemu.</h2>
            </div>

            <p>
              Ceritakan kebutuhan desainmu dan kita mulai dari sana.
            </p>
          </div>

          <div className="pajara-contact-grid">
            {socialLinks.map((social) => (
              <a
                key={social.title}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pajara-contact-card"
              >
                <div>
                  <span className="pajara-contact-label">
                    {social.title}
                  </span>

                  <strong>{social.text}</strong>
                </div>

                <span className="pajara-contact-arrow">↗</span>
              </a>
            ))}
          </div>

          <div className="pajara-contact-actions">
            <a href={customerWeb} className="pajara-button">
              Pesan Desain
            </a>

            <a href={customerLogin} className="pajara-button-outline">
              Login Customer
            </a>
          </div>
        </div>
      </section>

      <footer className="pajara-footer">
        <div className="pajara-container">
          <div className="pajara-footer-grid">
            <div>
              <a
                href="/"
                className="pajara-brand pajara-brand-footer"
              >
                <img
                  src={logoImage}
                  alt="Logo Pajara Studio"
                  className="pajara-brand-logo"
                />

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
              <a href="#testimoni">Testimoni</a>
              <a href="#kontak">Kontak</a>
            </div>

            <div>
              <h3>Mulai</h3>

              <a href={customerWeb}>Pesan Desain</a>

              <a href={customerLogin}>Login Customer</a>

              <a
                href="https://wa.me/message/TBAFLG4D554PC1"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>

              <a
                href="https://www.instagram.com/pajarastudio.id?stkn=MXU3dngxY2hiOTF0NA=="
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>

              <a
                href="https://www.tiktok.com/@pajarastudio.id?_r=1&_t=ZS-9AFPJ6qeP0m"
                target="_blank"
                rel="noopener noreferrer"
              >
                TikTok
              </a>
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
              }      Pesan Desain
            </a>

            <a
              href="https://pajara-customer.pajarastd.workers.dev/login"
              className="pajara-button-outline"
            >
              Login Customer
            </a>
          </div>
        </div>
      </section>

      <footer className="pajara-footer">
        <div className="pajara-container">
          <div className="pajara-footer-grid">
            <div>
              <a href="/" className="pajara-brand pajara-brand-footer">
                <img
                  src="/755809946_17926162029385149_3739923509439876817_n.jpg"
                  alt="Logo Pajara Studio"
                  className="pajara-brand-logo"
                />

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
              <a href="#testimoni">Testimoni</a>
              <a href="#kontak">Kontak</a>
            </div>

            <div>
              <h3>Mulai</h3>

              <a href="https://pajara-customer.pajarastd.workers.dev/">
                Pesan Desain
              </a>

              <a href="https://pajara-customer.pajarastd.workers.dev/login">
                Login Customer
              </a>

              <a
                href="https://wa.me/message/TBAFLG4D554PC1"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>

              <a
                href="https://www.instagram.com/pajarastudio.id?stkn=MXU3dngxY2hiOTF0NA=="
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>

              <a
                href="https://www.tiktok.com/@pajarastudio.id?_r=1&_t=ZS-9AFPJ6qeP0m"
                target="_blank"
                rel="noopener noreferrer"
              >
                TikTok
              </a>
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
