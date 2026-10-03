type RevisionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderRevision({
  params,
}: RevisionPageProps) {
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
            Revisi
          </p>

          <h1>
            Revisi Pesanan <span>#{id}</span>
          </h1>

          <p className="pajara-section-description">
            Sampaikan perubahan yang diperlukan pada desain
            melalui halaman ini.
          </p>

          <section
            style={{
              marginTop: "48px",
              maxWidth: "760px",
            }}
          >
            <p className="pajara-eyebrow">
              Riwayat
            </p>

            <h2>Riwayat Revisi</h2>

            <article
              className="pajara-service-card"
              style={{
                marginTop: "24px",
              }}
            >
              <h3>Belum ada revisi</h3>

              <p>
                Riwayat revisi dari pesanan ini akan
                ditampilkan setelah proses revisi dimulai.
              </p>
            </article>
          </section>

          <section
            style={{
              marginTop: "48px",
              maxWidth: "760px",
            }}
          >
            <p className="pajara-eyebrow">
              Kirim Revisi
            </p>

            <h2>Catatan Revisi</h2>

            <textarea
              rows={7}
              placeholder="Jelaskan bagian desain yang ingin diubah..."
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "16px",
                border: "1px solid #e7e2d9",
                borderRadius: "12px",
                background: "#ffffff",
                resize: "vertical",
              }}
            />

            <div
              style={{
                marginTop: "20px",
              }}
            >
              <label htmlFor="revision-file">
                Upload referensi revisi
              </label>

              <input
                id="revision-file"
                type="file"
                accept="image/*,.pdf"
                multiple
                style={{
                  width: "100%",
                  marginTop: "10px",
                }}
              />

              <p
                style={{
                  marginTop: "8px",
                  color: "#6f6f6f",
                  fontSize: "14px",
                }}
              >
                Anda dapat mengunggah gambar atau file
                pendukung untuk menjelaskan revisi.
              </p>
            </div>

            <button
              type="button"
              className="pajara-button pajara-button-primary"
              style={{
                marginTop: "24px",
              }}
            >
              Kirim Revisi
            </button>
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
          </div>
        </div>
      </section>
    </main>
  );
}
