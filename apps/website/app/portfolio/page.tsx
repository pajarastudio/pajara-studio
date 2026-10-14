"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import "../globals.css";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type PortfolioItem = {
id: string;
title: string;
category: string | null;
description: string | null;
image_path: string;
project_url: string | null;
sort_order: number;
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

export default function PortfolioPage() {
const [items, setItems] = useState<PortfolioItem[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [category, setCategory] = useState("Semua");
const [retry, setRetry] = useState(0);
const [menuOpen, setMenuOpen] = useState(false);

useEffect(() => {
let cancelled = false;

async function loadPortfolio() {
  setLoading(true);
  setError("");

  try {
    const { data, error: queryError } = await supabase
      .from("portfolios")
      .select(
        "id, title, category, description, image_path, project_url, sort_order, created_at"
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Gagal memuat portfolio:", queryError);
      throw new Error(
        `${queryError.message} (kode: ${queryError.code || "tidak tersedia"})`
      );
    }

    if (!cancelled) {
      setItems((data || []) as PortfolioItem[]);
    }
  } catch (err) {
    console.error("Kesalahan halaman portfolio:", err);

    if (!cancelled) {
      setError(
        err instanceof Error
          ? `Portofolio belum dapat dimuat: ${err.message}`
          : "Portofolio belum dapat dimuat. Periksa koneksi dan konfigurasi Supabase."
      );
    }
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
}

void loadPortfolio();

return () => {
  cancelled = true;
};

}, [retry]);

const categories = [
"Semua",
...Array.from(
new Set(
items
.map((item) => item.category?.trim())
.filter((value): value is string => Boolean(value))
)
),
];

const filteredItems =
category === "Semua"
? items
: items.filter((item) => item.category?.trim() === category);

return (
<main className="pajara-site pajara-portfolio-page">
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
        aria-controls="pajara-portfolio-nav-menu"
        onClick={() => setMenuOpen((value) => !value)}
      >
        <MenuIcon open={menuOpen} />
      </button>

      <div
        id="pajara-portfolio-nav-menu"
        className={`pajara-nav-menu${menuOpen ? " is-open" : ""}`}
      >
        <Link href="/" onClick={() => setMenuOpen(false)}>
          Beranda
        </Link>
        <a href="/#layanan" onClick={() => setMenuOpen(false)}>
          Layanan
        </a>
        <a href="/#tentang" onClick={() => setMenuOpen(false)}>
          Tentang
        </a>
        <a href="/#kontak" onClick={() => setMenuOpen(false)}>
          Kontak
        </a>
        <Link
          href="/#kontak"
          className="pajara-nav-button"
          onClick={() => setMenuOpen(false)}
        >
          Diskusikan Proyek
        </Link>
      </div>
    </div>
  </nav>

  <section className="pajara-portfolio-hero">
    <div className="pajara-container">
      <div className="pajara-portfolio-hero-inner">
        <div className="pajara-portfolio-hero-copy">
          <span className="pajara-eyebrow">
            RUANG KREATIF · PAJARA STUDIO
          </span>

          <h1>
            Jelajahi karya,
            <br />
            <span>temukan karakter.</span>
          </h1>

          <p>
            Setiap karya punya cerita, tujuan, dan identitas.
            Temukan eksplorasi visual yang tumbuh bersama
            perjalanan kita.
          </p>

          <div className="pajara-portfolio-hero-meta">
            <span className="pajara-portfolio-meta-dot" />
            <span>
              {items.length} karya dalam koleksi
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className="pajara-section pajara-portfolio-content">
    <div className="pajara-container">
      <div className="pajara-portfolio-section-heading">
        <div>
          <span className="pajara-eyebrow">PILIHAN KARYA</span>
          <h2>Koleksi desain</h2>
          <p>
            Eksplorasi identitas visual yang dirancang dengan
            arah dan karakter.
          </p>
        </div>

        <span className="pajara-portfolio-total">
          {loading ? "MEMUAT..." : `${filteredItems.length} KARYA`}
        </span>
      </div>

      {!loading && !error && items.length > 0 && (
        <div
          className="pajara-portfolio-filters"
          aria-label="Filter kategori karya"
        >
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`pajara-portfolio-filter${
                category === item ? " is-active" : ""
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="pajara-portfolio-state" role="status">
          <span className="pajara-portfolio-loader" />
          <h3>Menyiapkan koleksi karya</h3>
          <p>Sebentar, kami sedang memuat hasil desain.</p>
        </div>
      ) : error ? (
        <div
          className="pajara-portfolio-state pajara-portfolio-error"
          role="alert"
        >
          <span className="pajara-portfolio-state-number">
            PAJARA STUDIO
          </span>
          <h3>Koleksi belum dapat dimuat</h3>
          <p>{error}</p>
          <button
            type="button"
            className="pajara-portfolio-retry"
            onClick={() => setRetry((value) => value + 1)}
          >
            Coba Lagi <ArrowIcon />
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="pajara-portfolio-state">
          <span className="pajara-portfolio-state-number">
            PAJARA STUDIO
          </span>
          <h3>
            {items.length === 0
              ? "Cerita baru sedang disiapkan."
              : "Belum ada karya di kategori ini."}
          </h3>
          <p>
            {items.length === 0
              ? "Koleksi karya akan bertambah seiring perjalanan kreatif kita."
              : "Coba pilih kategori lain untuk menjelajahi koleksi."}
          </p>

          {items.length > 0 && (
            <button
              type="button"
              className="pajara-portfolio-retry"
              onClick={() => setCategory("Semua")}
            >
              Lihat Semua Karya <ArrowIcon />
            </button>
          )}
        </div>
      ) : (
        <div className="pajara-portfolio-grid">
          {filteredItems.map((item, index) => (
            <article
              key={item.id}
              className="pajara-portfolio-card"
              style={{
                animationDelay: `${Math.min(index, 8) * 45}ms`,
              }}
            >
              <div className="pajara-portfolio-image">
                <img
                  src={item.image_path}
                  alt={item.title}
                  loading={index < 3 ? "eager" : "lazy"}
                />

                <span className="pajara-portfolio-image-index">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {item.project_url && (
                  <a
                    className="pajara-portfolio-image-link"
                    href={item.project_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Lihat proyek ${item.title}`}
                  >
                    <ArrowIcon />
                  </a>
                )}
              </div>

              <div className="pajara-portfolio-info">
                <div className="pajara-portfolio-card-topline">
                  <span>
                    {item.category || "Karya Pajara Studio"}
                  </span>
                  <span className="pajara-portfolio-card-number">
                    NO. {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3>{item.title}</h3>

                {item.description && (
                  <p className="pajara-portfolio-description">
                    {item.description}
                  </p>
                )}

                {item.project_url && (
                  <a
                    className="pajara-portfolio-project-link"
                    href={item.project_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Jelajahi proyek <ArrowIcon />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="pajara-portfolio-back-wrap">
        <Link href="/" className="pajara-portfolio-back">
          <span aria-hidden="true">←</span>
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  </section>

  <section className="pajara-portfolio-contact">
    <div className="pajara-container">
      <div className="pajara-portfolio-contact-card">
        <div>
          <span className="pajara-eyebrow">
            PUNYA RENCANA DESAIN?
          </span>
          <h2>Mari wujudkan identitas yang berarti.</h2>
          <p>
            Ceritakan ide Kang/Teh. Kita mulai dari arah yang
            tepat, lalu tumbuh bersama.
          </p>
        </div>

        <Link
          href="/#kontak"
          className="pajara-portfolio-contact-link"
        >
          Diskusikan Proyek <ArrowIcon />
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
