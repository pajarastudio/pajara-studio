
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
  customer_nam: string | null;
  content: string;
  rating: number | null;
  created_at: string;
};

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTestimonials = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("testimonials")
        .select("id, customer_nam, content, rating, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error(
          "Gagal memuat testimoni:",
          queryError.message,
          queryError.code,
          queryError.details
        );
        setError(queryError.message);
        return;
      }

      setItems(
        (data || []).map((item) => ({
          id: item.id,
          customer_nam: item.customer_nam || null,
          content: item.content || "",
          rating: item.rating ?? null,
          created_at: item.created_at,
        }))
      );
    } catch (err) {
      console.error("Kesalahan memuat testimoni:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTestimonials();
  }, [loadTestimonials]);

  return (
    <main className="pajara-site">
      <nav className="pajara-nav" aria-label="Navigasi utama">
        <div className="pajara-container pajara-navbar-inner">
          <Link href="/" className="pajara-brand">
            <span className="pajara-brand-name">Pajara Studio</span>
          </Link>

          <div className="pajara-nav">
            <Link href="/">Beranda</Link>
            <Link href="/portfolio">Portfolio</Link>
            <a href="/#kontak" className="pajara-nav-button">
              Pesan Desain
            </a>
          </div>
        </div>
      </nav>

      <section className="pajara-section">
        <div className="pajara-container">
          <div className="pajara-section-heading">
            <span className="pajara-eyebrow">CERITA PELANGGAN</span>

            <h1 className="testimonial-page-title">
              Perjalanan kita,
              <br />
              dari sudut pandang mereka.
            </h1>

            <p>
              Setiap proyek memiliki cerita. Berikut pengalaman
              pelanggan yang telah bekerja bersama Pajara Studio.
            </p>
          </div>

          {loading ? (
            <div className="testimonial-empty">
              <p>Memuat testimoni pelanggan...</p>
            </div>
          ) : error ? (
            <div className="testimonial-empty">
              <h2>Testimoni belum dapat dimuat.</h2>
              <p>
                {error}
              </p>
              <button
                type="button"
                className="pajara-button pajara-button-secondary"
                onClick={() => void loadTestimonials()}
              >
                Coba Lagi
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="testimonial-empty">
              <span className="pajara-eyebrow">TESTIMONI</span>
              <h2>Cerita baru segera hadir.</h2>
              <p>
                Belum ada testimoni yang dipublikasikan atau
                dapat diakses oleh website.
              </p>
            </div>
          ) : (
            <div className="testimonial-page-grid">
              {items.map((item, index) => (
                <article
                  key={item.id}
                  className="testimonial-page-card"
                >
                  <div className="testimonial-page-card-top">
                    <span className="testimonial-page-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="testimonial-page-quote"
                      aria-hidden="true"
                    >
                      “
                    </span>
                  </div>

                  <p className="testimonial-page-content">
                    {item.content}
                  </p>

                  {item.rating !== null && (
                    <div
                      aria-label={`Rating ${item.rating} dari 5`}
                      style={{
                        color: "#8a6a4a",
                        letterSpacing: 3,
                        marginBottom: 20,
                      }}
                    >
                      {"★".repeat(
                        Math.max(0, Math.min(5, item.rating))
                      )}
                      {"☆".repeat(
                        5 - Math.max(0, Math.min(5, item.rating))
                      )}
                    </div>
                  )}

                  <div className="testimonial-page-divider" />

                  <div className="testimonial-page-person">
                    <span className="testimonial-page-avatar">
                      {(item.customer_nam || "P")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <div>
                      <h2>
                        {item.customer_nam || "Pelanggan Pajara"}
                      </h2>
                      <span>Client Pajara Studio</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="testimonial-page-back">
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
            <span>© 2026 Pajara Studio.</span>
            <span>Berakar di Tanah Pasundan.</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .testimonial-page-title {
          margin: 0;
          color: var(--green-dark);
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(38px, 6vw, 68px);
          font-weight: 600;
          line-height: 1.08;
          letter-spacing: -2px;
        }

        .testimonial-page-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .testimonial-page-card {
          min-width: 0;
          padding: 30px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--white);
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .testimonial-page-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .testimonial-page-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .testimonial-page-number {
          color: var(--brown);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .testimonial-page-quote {
          color: var(--green);
          font-family: "Playfair Display", Georgia, serif;
          font-size: 56px;
          line-height: 0.8;
        }

        .testimonial-page-content {
          margin: 24px 0 30px;
          color: var(--text);
          font-family: "Playfair Display", Georgia, serif;
          font-size: 22px;
          line-height: 1.55;
          overflow-wrap: anywhere;
          white-space: pre-line;
        }

        .testimonial-page-divider {
          height: 1px;
          background: var(--line);
        }

        .testimonial-page-person {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 22px;
        }

        .testimonial-page-avatar {
          display: grid;
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          place-items: center;
          border-radius: 50%;
          background: #eaf1e9;
          color: var(--green-dark);
          font-family: "Playfair Display", Georgia, serif;
          font-size: 20px;
          font-weight: 700;
        }

        .testimonial-page-person h2 {
          margin: 0 0 4px;
          color: var(--text);
          font-size: 14px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .testimonial-page-person div > span {
          color: var(--muted);
          font-size: 11px;
        }

        .testimonial-empty {
          padding: 42px 24px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--white);
          text-align: center;
          overflow-wrap: anywhere;
        }

        .testimonial-empty h2 {
          color: var(--green-dark);
          font-family: "Playfair Display", Georgia, serif;
        }

        .testimonial-empty p {
          color: var(--muted);
          line-height: 1.7;
        }

        .testimonial-empty button {
          margin-top: 12px;
        }

        .testimonial-page-back {
          margin-top: 36px;
          text-align: center;
        }

        @media (max-width: 700px) {
          .testimonial-page-grid {
            grid-template-columns: 1fr;
          }

          .testimonial-page-card {
            padding: 24px;
          }

          .testimonial-page-content {
            font-size: 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .testimonial-page-card {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
