import type { ReactNode } from "react";

type OrderFilesPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderFiles({
  params,
}: OrderFilesPageProps) {
  const { id } = await params;

  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-brand-mark">P</span>
            <span>Pajara Studio</span>
          </a>

          <nav className="pajara-nav">
            <a href={`/orders/${id}`}>
              Detail Pesanan
            </a>

            <a href="/dashboard" className="pajara-nav-cta">
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-services">
        <div className="pajara-container">
          <p className="pajara-eyebrow">
            File Pesanan
          </p>

          <h1>
            File Pesanan <span>#{id}</span>
          </h1>

          <p className="pajara-section-description">
            Semua file yang berkaitan dengan project Anda
            akan tersedia di halaman ini.
          </p>

          <div className="pajara-services-grid">
            <article className="pajara-service-card">
              <h3>Referensi</h3>
              <p>
                File referensi yang Anda kirimkan saat membuat
                pesanan akan ditampilkan di sini.
              </p>
            </article>

            <article className="pajara-service-card">
              <h3>Preview</h3>
              <p>
                Preview desain dari Pajara Studio akan
                tersedia di bagian ini.
              </p>
            </article>

            <article className="pajara-service-card">
              <h3>Revisi</h3>
              <p>
                File hasil revisi akan ditampilkan sesuai
                perkembangan project.
              </p>
            </article>

            <article className="pajara-service-card">
              <h3>File Final</h3>
              <p>
                File final dapat diakses setelah project
                selesai dan pembayaran telah diselesaikan.
              </p>
            </article>
          </div>

          <section
            style={{
              marginTop: "48px",
              maxWidth: "760px",
            }}
          >
            <p className="pajara-eyebrow">
              File Final
            </p>

            <h2>Hasil akhir project</h2>

            <article
              className="pajara-service-card"
              style={{
                marginTop: "24px",
              }}
            >
              <h3>Belum tersedia</h3>

              <p>
                File final akan muncul di sini setelah
                Pajara Studio menyelesaikan project Anda.
              </p>
            </article>
          </section>

          <div
            style={{
              marginTop: "48px",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <a
              href={`/orders/${id}`}
              className="pajara-button pajara-button-secondary"
            >
              Kembali ke Pesanan
            </a>

            <a
              href="/dashboard"
              className="pajara-button pajara-button-primary"
            >
              Dashboard
            </a>
          </div>
        </div>
      </section>
    </main>
  );
          }
