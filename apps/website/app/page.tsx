
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import "./globals.css";

const customerWeb = "https://pajara-customer.pajarastd.workers.dev/";

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

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

type PortfolioItem = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  image_path: string;
  project_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

type TestimonialItem = {
  id: string;
  customer_name: string | null;
  content: string;
  rating: number | null;
  created_at: string;
};

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

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPortfolio() {
      try {
        const { data, error } = await supabase
          .from("portfolios")
          .select(
            "id, title, category, description, image_path, project_url, is_featured, is_active, sort_order"
          )
          .eq("is_active", true)
          .eq("is_featured", true)
          .order("sort_order", { ascending: true })
          .limit(3);

        if (error) {
          console.error("Gagal memuat portfolio:", error.message);
          return;
        }

        if (!cancelled) {
          setPortfolio((data || []) as PortfolioItem[]);
        }
      } catch (error) {
        console.error("Terjadi kesalahan saat memuat portfolio:", error);
      } finally {
        if (!cancelled) setPortfolioLoading(false);
      }
    }

    async function loadTestimonials() {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select(
            "id, customer_name:customer_nam, content, rating, created_at"
          )
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) {
          console.error("Gagal memuat testimoni:", error.message);
          return;
        }

        if (!cancelled) {
          setTestimonials((data || []) as TestimonialItem[]);
        }
      } catch (error) {
        console.error("Terjadi kesalahan saat memuat testimoni:", error);
      } finally {
        if (!cancelled) setTestimonialsLoading(false);
      }
    }

    void loadPortfolio();
    void loadTestimonials();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="pajara-site">
      <nav className="pajara-nav" aria-label="Navigasi utama">
        <div className="pajara-container pajara-navbar-inner">
          <a href="#home" className="pajara-brand">
            <Logo className="pajara-navbar-logo-mark" />
            <span className="pajara-brand-name">Pajara Studio</span>
          </a>

          <div className="pajara-nav">
            <a href="#layanan">Layanan</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#tentang">Tentang</a>
            {!testimonialsLoading && testimonials.length > 0 && (
              <a href="#testimoni">Testimoni</a>
            )}
            <a href="#kontak">Kontak</a>
            <a href={customerWeb} className="pajara-nav-button">
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
              <Logo
                className="pajara-hero-logo"
                alt="Logo Pajara Studio"
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
              Visual yang bekerja
              <br />
              untuk brand.
            </h2>
            <p>
              Setiap desain dibuat dengan tujuan, bukan sekadar
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
              Pilihan karya yang dikelola langsung melalui
              Pajara Admin.
            </p>
          </div>

          {portfolioLoading ? (
            <p>Memuat karya Pajara Studio...</p>
          ) : portfolio.length === 0 ? (
            <p>
              Karya pilihan sedang dipersiapkan. Nantikan
              perjalanan kita berikutnya.
            </p>
          ) : (
            <div className="pajara-portfolio-grid">
              {portfolio.map((item, index) => (
                <article
                  key={item.id}
                  className="pajara-portfolio-card"
                >
                  <div className="pajara-portfolio-image">
                    <img
                      src={item.image_path}
                      alt={item.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="pajara-portfolio-info">
                    <span className="pajara-portfolio-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.category || "Karya Pajara Studio"}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link
              href="/portfolio"
              className="pajara-button pajara-button-secondary"
            >
              Lihat Semua Karya →
            </Link>
          </div>
        </div>
      </section>

      <section id="tentang" className="pajara-section">
        <div className="pajara-container">
          <div className="pajara-about-grid">
            <div className="pajara-about-mark">
              <Logo alt="Logo Pajara Studio" />
            </div>
            <div className="pajara-about-content">
              <span className="pajara-about-label">
                TENTANG PAJARA
              </span>
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
            <div className="pajara-founder-heading">
              <span className="pajara-founder-label">THE FOUNDER</span>
              <h3>Muhamad Rijik Rifa&apos;i</h3>
              <p className="pajara-founder-role">
                Founder &amp; Designer Pajara Studio
              </p>
            </div>

            <div className="pajara-founder-info">
              <div>
                <span>Tanggal Lahir</span>
                <strong>04-03</strong>
              </div>
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
                <span>Domisili</span>
                <strong>Kab. Bogor, Kec. Leuwiliang</strong>
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

      {!testimonialsLoading && testimonials.length > 0 && (
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                gap: 20,
                alignItems: "stretch",
              }}
            >
              {testimonials.map((item) => (
                <article
                  key={item.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "26px 24px",
                    background: "#ffffff",
                    border: "1px solid #e5e0d7",
                    borderRadius: 18,
                    boxShadow: "0 8px 24px rgba(33, 77, 50, 0.05)",
                    minWidth: 0,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      color: "#2f6b45",
                      fontFamily: "Georgia, serif",
                      fontSize: 42,
                      lineHeight: 1,
                      marginBottom: 14,
                    }}
                  >
                    “
                  </span>

                  <p
                    style={{
                      color: "#1f2a23",
                      fontSize: 15,
                      lineHeight: 1.8,
                      margin: "0 0 24px",
                      overflowWrap: "anywhere",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {item.content.length > 170
                      ? `${item.content.slice(0, 170).trimEnd()}…`
                      : item.content}
                  </p>

                  {item.rating !== null && (
                    <div
                      aria-label={`Rating ${item.rating} dari 5`}
                      style={{
                        color: "#8a6a4a",
                        fontSize: 14,
                        letterSpacing: 3,
                        marginBottom: 18,
                      }}
                    >
                      {"★".repeat(Math.max(0, Math.min(5, item.rating)))}
                      {"☆".repeat(
                        5 - Math.max(0, Math.min(5, item.rating))
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 16,
                      borderTop: "1px solid #e5e0d7",
                      width: "100%",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "#214d32",
                        fontSize: 15,
                        marginBottom: 5,
                      }}
                    >
                      {item.customer_name || "Pelanggan Pajara Studio"}
                    </strong>
                    <span
                      style={{
                        display: "block",
                        color: "#6f766f",
                        fontSize: 12,
                      }}
                    >
                      Pelanggan Pajara Studio
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link
                href="/testimonials"
                className="pajara-button pajara-button-secondary"
              >
                Lihat Semua Testimoni →
              </Link>
            </div>
          </div>
        </section>
      )}

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
              <a href="#layanan">Layanan</a>
              <a href="#portfolio">Portfolio</a>
              <a href="#tentang">Tentang</a>
              {!testimonialsLoading && testimonials.length > 0 && (
                <a href="#testimoni">Testimoni</a>
              )}
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
