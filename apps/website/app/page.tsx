export default function Home() {
const services = [
{
title: "Logo & Branding",
description:
"Membangun identitas visual yang kuat dan mudah dikenali.",
},
{
title: "Desain Promosi",
description:
"Visual promosi yang menarik untuk kebutuhan bisnis dan campaign.",
},
{
title: "Social Media",
description:
"Desain feed dan story yang konsisten untuk memperkuat tampilan brand.",
},
{
title: "Banner",
description:
"Banner digital dengan informasi yang jelas dan visual yang profesional.",
},
{
title: "Kemasan & Menu",
description:
"Desain kemasan dan menu yang membantu produk tampil lebih bernilai.",
},
];

const testimonials = [
{
name: "Testimoni Customer",
text: "Testimoni customer Pajara Studio akan ditampilkan di sini.",
},
{
name: "Testimoni Customer",
text: "Kumpulan pengalaman customer akan menjadi bagian dari halaman Pajara.",
},
{
name: "Testimoni Customer",
text: "Testimoni akan dikelola melalui sistem Pajara Studio.",
},
];

return (
<main>
{/* NAVBAR */}
<header className="pajara-navbar">
<div className="pajara-container pajara-navbar-inner">
<a href="#" className="pajara-brand">
<span className="pajara-brand-mark">P</span>
<span>Pajara Studio</span>
</a>

      <nav className="pajara-nav">
        <a href="#layanan">Layanan</a>
        <a href="#portfolio">Portfolio</a>
        <a href="#tentang">Tentang</a>
        <a href="#kontak">Kontak</a>
        <a href="#pesan" className="pajara-nav-cta">
          Pesan Desain
        </a>
      </nav>
    </div>
  </header>

  {/* HERO */}
  <section className="pajara-hero">
    <div className="pajara-container">
      <div className="pajara-hero-content">
        <p className="pajara-eyebrow">
          Studio Desain Grafis
        </p>

        <h1>
          Pajara <span>Studio.</span>
        </h1>

        <p className="pajara-hero-description">
          Membangun identitas visual yang punya arah,
          karakter, dan nilai untuk bisnis yang ingin
          tampil lebih profesional.
        </p>

        <div className="pajara-hero-actions">
          <a
            href="#pesan"
            className="pajara-button pajara-button-primary"
          >
            Pesan Desain
          </a>

          <a
            href="#portfolio"
            className="pajara-button pajara-button-secondary"
          >
            Lihat Portfolio
          </a>
        </div>
      </div>
    </div>
  </section>

  {/* LAYANAN */}
  <section id="layanan" className="pajara-services">
    <div className="pajara-container">
      <p className="pajara-eyebrow">Layanan</p>

      <h2>Desain untuk kebutuhan bisnis.</h2>

      <p className="pajara-section-description">
        Dari identitas brand hingga kebutuhan promosi,
        Pajara membantu bisnis membangun visual yang
        konsisten dan profesional.
      </p>

      <div className="pajara-services-grid">
        {services.map((service) => (
          <article
            key={service.title}
            className="pajara-service-card"
          >
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>

  {/* PORTFOLIO */}
  <section id="portfolio" className="pajara-services">
    <div className="pajara-container">
      <p className="pajara-eyebrow">Portfolio</p>

      <h2>Beberapa karya Pajara.</h2>

      <p className="pajara-section-description">
        Kumpulan karya yang menjadi bagian dari perjalanan
        Pajara Studio dalam membantu bisnis membangun
        visualnya.
      </p>

      <div className="pajara-services-grid">
        <article className="pajara-service-card">
          <h3>Portfolio Pajara</h3>

          <p>
            Karya portfolio akan ditampilkan dari database
            Pajara Studio.
          </p>
        </article>
      </div>
    </div>
  </section>

  {/* TENTANG */}
  <section id="tentang" className="pajara-services">
    <div className="pajara-container">
      <p className="pajara-eyebrow">Tentang Pajara</p>

      <h2>Berakar di Tanah Pasundan.</h2>

      <p className="pajara-section-description">
        Pajara Studio adalah studio desain grafis yang
        membantu bisnis membangun identitas visual,
        materi promosi, dan kebutuhan komunikasi visual
        dengan pendekatan yang profesional dan terarah.
      </p>

      <p className="pajara-section-description">
        Berangkat dari tanah Sunda, Pajara membawa
        semangat untuk menciptakan desain yang tidak
        hanya menarik secara visual, tetapi juga memiliki
        karakter dan tujuan yang jelas.
      </p>
    </div>
  </section>

  {/* TESTIMONI */}
  <section className="pajara-services">
    <div className="pajara-container">
      <p className="pajara-eyebrow">Testimoni</p>

      <h2>Pengalaman bersama Pajara.</h2>

      <p className="pajara-section-description">
        Cerita dan pengalaman customer akan ditampilkan
        di bagian ini.
      </p>

      <div className="pajara-services-grid">
        {testimonials.map((testimonial, index) => (
          <article
            key={`${testimonial.name}-${index}`}
            className="pajara-service-card"
          >
            <h3>{testimonial.name}</h3>
            <p>{testimonial.text}</p>
          </article>
        ))}
      </div>
    </div>
  </section>

  {/* CTA PESAN */}
  <section id="pesan" className="pajara-hero">
    <div className="pajara-container">
      <div className="pajara-hero-content">
        <p className="pajara-eyebrow">Mulai Project</p>

        <h2>Siap membangun visual brand Anda?</h2>

        <p className="pajara-hero-description">
          Sampaikan kebutuhan desain Anda dan mulai
          project bersama Pajara Studio.
        </p>

        <div className="pajara-hero-actions">
          <a
            href="/customer"
            className="pajara-button pajara-button-primary"
          >
            Pesan Desain
          </a>

          <a
            href="#kontak"
            className="pajara-button pajara-button-secondary"
          >
            Hubungi Pajara
          </a>
        </div>
      </div>
    </div>
  </section>

  {/* KONTAK */}
  <section id="kontak" className="pajara-services">
    <div className="pajara-container">
      <p className="pajara-eyebrow">Kontak</p>

      <h2>Terhubung dengan Pajara.</h2>

      <p className="pajara-section-description">
        Untuk pertanyaan, kerja sama, atau kebutuhan
        desain, Anda dapat menghubungi Pajara Studio
        melalui kanal yang tersedia.
      </p>

      <div className="pajara-services-grid">
        <article className="pajara-service-card">
          <h3>WhatsApp</h3>
          <p>Hubungi Pajara Studio untuk kebutuhan project.</p>
        </article>

        <article className="pajara-service-card">
          <h3>Instagram</h3>
          <p>Lihat karya dan aktivitas terbaru Pajara Studio.</p>
        </article>

        <article className="pajara-service-card">
          <h3>TikTok</h3>
          <p>Ikuti konten desain dan perjalanan Pajara Studio.</p>
        </article>
      </div>
    </div>
  </section>

  {/* FOOTER */}
  <footer className="pajara-services">
    <div className="pajara-container">
      <p className="pajara-eyebrow">Pajara Studio</p>

      <p className="pajara-section-description">
        Berakar di Tanah Pasundan.
      </p>

      <p className="pajara-section-description">
        © {new Date().getFullYear()} Pajara Studio. All
        rights reserved.
      </p>
    </div>
  </footer>
</main>

);
        }
