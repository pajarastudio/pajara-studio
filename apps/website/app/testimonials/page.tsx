"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import "../globals.css";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Testimonial = {
id: string;
customer_name: string | null;
content: string;
rating: number | null;
created_at: string;
};

function MenuIcon({ open }: { open: boolean }) {
return (
<svg
width="22"
height="22"
viewBox="0 0 24 24"
fill="none"
aria-hidden="true"
>
{open ? (
<path
d="M6 6l12 12M18 6L6 18"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
/>
) : (
<path
d="M4 7h16M4 12h16M4 17h16"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
/>
)}
</svg>
);
}

function ArrowIcon() {
return (
<svg
width="18"
height="18"
viewBox="0 0 24 24"
fill="none"
aria-hidden="true"
>
<path
d="M5 12h14M13 5l7 7-7 7"
stroke="currentColor"
strokeWidth="1.7"
strokeLinecap="round"
strokeLinejoin="round"
/>
</svg>
);
}

export default function TestimonialsPage() {
const [items, setItems] = useState<Testimonial[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [menuOpen, setMenuOpen] = useState(false);

const loadTestimonials = useCallback(async () => {
setLoading(true);
setError("");

try {
  const { data, error: queryError } = await supabase
    .from("testimonials")
    .select("id, customer_name, content, rating, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (queryError) {
    console.error("Gagal memuat testimoni:", queryError);
    setError(queryError.message);
    return;
  }

  setItems((data || []) as Testimonial[]);
} catch (err) {
  console.error("Kesalahan memuat testimoni:", err);
  setError(
    err instanceof Error
      ? err.message
      : "Terjadi kesalahan saat memuat testimoni."
  );
} finally {
  setLoading(false);
}

}, []);

useEffect(() => {
void loadTestimonials();
}, [loadTestimonials]);

return (
<main className="pajara-site pajara-testimonials-page">
<nav className="pajara-nav" aria-label="Navigasi utama">
<div className="pajara-container pajara-navbar-inner">
<Link
href="/"
className="pajara-brand"
onClick={() => setMenuOpen(false)}
>
<img
src="/755809946_17926162029385149_3739923509439876817_n.jpg"
alt="Logo Pajara Studio"
className="pajara-logo pajara-navbar-logo-mark"
/>
<span className="pajara-brand-name">Pajara Studio</span>
</Link>

      <button
        type="button"
        className="pajara-menu-toggle"
        aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
        aria-expanded={menuOpen}
        aria-controls="pajara-testimonials-nav-menu"
        onClick={() => setMenuOpen((value) => !value)}
      >
        <MenuIcon open={menuOpen} />
      </button>

      <div
        id="pajara-testimonials-nav-menu"
        className={`pajara-nav-menu${menuOpen ? " is-open" : ""}`}
      >
        <Link href="/" onClick={() => setMenuOpen(false)}>
          Beranda
        </Link>
        <Link
          href="/portfolio"
          onClick={() => setMenuOpen(false)}
        >
          Portfolio
        </Link>
        <a
          href="/#tentang"
          onClick={() => setMenuOpen(false)}
        >
          Tentang
        </a>
        <Link
          href="/#kontak"
          className="pajara-nav-button"
          onClick={() => setMenuOpen(false)}
        >
          Pesan Desain
        </Link>
      </div>
    </div>
  </nav>

  <section className="pajara-testimonials-hero">
    <div className="pajara-container">
      <div className="pajara-testimonials-hero-inner">
        <span className="pajara-eyebrow">
          CERITA PELANGGAN · PAJARA STUDIO
        </span>

        <h1>
          Perjalanan kita,
          <br />
          <span>dari sudut pandang mereka.</span>
        </h1>

        <p>
          Di balik setiap desain, ada cerita dan kepercayaan.
          Dengarkan pengalaman pelanggan yang telah menjadi
          bagian dari perjalanan Pajara Studio.
        </p>

        <div className="pajara-testimonials-hero-meta">
          <span className="pajara-testimonials-meta-dot" />
          <span>
            {items.length}{" "}
            {items.length === 1 ? "cerita pelanggan" : "cerita pelanggan"}
          </span>
        </div>
      </div>
    </div>
  </section>

  <section className="pajara-section pajara-testimonials-content">
    <div className="pajara-container">
      <div className="pajara-testimonials-section-heading">
        <div>
          <span className="pajara-eyebrow">SUARA MEREKA</span>
          <h2>Cerita yang berarti</h2>
          <p>
            Setiap pengalaman adalah bagian dari perjalanan
            kita untuk terus bertumbuh.
          </p>
        </div>

        <span className="pajara-testimonials-total">
          {loading ? "MEMUAT..." : `${items.length} CERITA`}
        </span>
      </div>

      {loading ? (
        <div className="pajara-testimonials-state" role="status">
          <span className="pajara-testimonials-loader" />
          <h3>Menyiapkan cerita pelanggan</h3>
          <p>Sebentar, kami sedang memuat testimoni.</p>
        </div>
      ) : error ? (
        <div
          className="pajara-testimonials-state"
          role="alert"
        >
          <span className="pajara-testimonials-state-label">
            PAJARA STUDIO
          </span>
          <h3>Testimoni belum dapat dimuat</h3>
          <p>{error}</p>
          <button
            type="button"
            className="pajara-testimonials-retry"
            onClick={() => void loadTestimonials()}
          >
            Coba Lagi <ArrowIcon />
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="pajara-testimonials-state">
          <span className="pajara-testimonials-state-label">
            CERITA PELANGGAN
          </span>
          <h3>Cerita baru segera hadir.</h3>
          <p>
            Belum ada testimoni yang dipublikasikan atau
            dapat diakses oleh website. Nantikan cerita
            berikutnya dari perjalanan kita.
          </p>
        </div>
      ) : (
        <div className="pajara-testimonials-grid">
          {items.map((item, index) => {
            const rating =
              item.rating === null
                ? null
                : Math.max(0, Math.min(5, item.rating));

            return (
              <article
                key={item.id}
                className="pajara-testimonial-card"
                style={{
                  animationDelay: `${Math.min(index, 8) * 45}ms`,
                }}
              >
                <div className="pajara-testimonial-card-top">
                  <span className="pajara-testimonial-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span
                    className="pajara-testimonial-quote"
                    aria-hidden="true"
                  >
                    “
                  </span>
                </div>

                {rating !== null && (
                  <div
                    className="pajara-testimonial-rating"
                    aria-label={`Rating ${rating} dari 5`}
                  >
                    {Array.from({ length: 5 }, (_, star) => (
                      <span
                        key={star}
                        className={
                          star < rating
                            ? "is-filled"
                            : "is-empty"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}

                <p className="pajara-testimonial-content">
                  {item.content}
                </p>

                <div className="pajara-testimonial-divider" />

                <div className="pajara-testimonial-customer">
                  <span className="pajara-testimonial-avatar">
                    {(item.customer_name || "P")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <div className="pajara-testimonial-customer-info">
                    <strong>
                      {item.customer_name || "Pelanggan Pajara"}
                    </strong>
                    <span>Client Pajara Studio</span>
                  </div>

                  <span
                    className="pajara-testimonial-customer-mark"
                    aria-hidden="true"
                  >
                    P.
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="pajara-testimonials-back-wrap">
        <Link
          href="/"
          className="pajara-testimonials-back"
        >
          <span aria-hidden="true">←</span>
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  </section>

  <section className="pajara-testimonials-contact">
    <div className="pajara-container">
      <div className="pajara-testimonials-contact-card">
        <div>
          <span className="pajara-eyebrow">
            SEKARANG GILIRAN KANG/TEH
          </span>
          <h2>Mari mulai cerita baru bersama.</h2>
          <p>
            Punya ide desain untuk dikembangkan? Mari diskusikan
            kebutuhan dan arah visual yang tepat untuk proyekmu.
          </p>
        </div>

        <Link
          href="/#kontak"
          className="pajara-testimonials-contact-link"
        >
          Pesan Desain <ArrowIcon />
        </Link>
      </div>
    </div>
  </section>

  <footer className="pajara-footer">
    <div className="pajara-container">
      <div className="pajara-footer-bottom">
        <span>© 2026 Pajara Studio. All rights reserved.</span>
        <span>Berakar di Tanah Pasundan.</span>
      </div>
    </div>
  </footer>
</main>

);
}
