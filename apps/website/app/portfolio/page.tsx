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

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("Semua");
  const [retry, setRetry] = useState(0);

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
    <main className="pajara-site">
      <nav className="pajara-nav" aria-label="Navigasi utama">
        <div className="pajara-container pajara-navbar-inner">
          <Link href="/" className="pajara-brand">
            <img
              src="/755809946_17926162029385149_3739923509439876817_n.jpg"
              alt="Logo Pajara Studio"
              className="pajara-logo pajara-navbar-logo-mark"
            />
            <span className="pajara-brand-name">Pajara Studio</span>
          </Link>

          <div className="pajara-nav">
            <Link href="/">Beranda</Link>
            <a href="/#layanan">Layanan</a>
            <a href="/#tentang">Tentang</a>
            <a href="/#kontak">Kontak</a>
          </div>
        </div>
      </nav>

      <section className="pajara-section">
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <span className="pajara-eyebrow">PORTFOLIO PAJARA</span>
            <h1>
              Karya yang punya
              <br />
              arah dan karakter.
            </h1>
            <p>
              Jelajahi hasil desain Pajara Studio yang dikelola
              langsung melalui Pajara Admin.
            </p>
          </div>

          {!loading && !error && items.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 32,
              }}
            >
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  style={{
                    border: "1px solid #214d32",
                    borderRadius: 999,
                    padding: "10px 18px",
                    cursor: "pointer",
                    background:
                      category === item ? "#214d32" : "transparent",
                    color: category === item ? "#ffffff" : "#214d32",
                    font: "inherit",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div
              role="status"
              style={{ padding: "36px 0", color: "#777d75" }}
            >
              Memuat hasil desain...
            </div>
          ) : error ? (
            <div
              role="alert"
              style={{
                padding: 22,
                border: "1px solid #e7dfd5",
                borderRadius: 16,
                background: "#ffffff",
              }}
            >
              <h2 style={{ color: "#214d32", marginTop: 0 }}>
                Portofolio belum dapat dimuat
              </h2>
              <p
                style={{
                  color: "#777d75",
                  lineHeight: 1.7,
                  overflowWrap: "anywhere",
                }}
              >
                {error}
              </p>
              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: "12px 18px",
                  background: "#214d32",
                  color: "#ffffff",
                  font: "inherit",
                  cursor: "pointer",
                }}
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <p>
              {items.length === 0
                ? "Belum ada karya yang ditampilkan. Nantikan perjalanan kita berikutnya."
                : "Belum ada karya pada kategori ini."}
            </p>
          ) : (
            <div className="pajara-portfolio-grid">
              {filteredItems.map((item, index) => (
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

                      {item.description && <p>{item.description}</p>}

                      {item.project_url && (
                        <a
                          href={item.project_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Lihat proyek →
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div style={{ marginTop: 40 }}>
            <Link
              href="/"
              className="pajara-button pajara-button-secondary"
            >
              ← Kembali ke Beranda
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
