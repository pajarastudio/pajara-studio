type RevisionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return [
    {
      id: "demo",
    },
  ];
}

export default async function RevisionPage({
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
            <a href="/dashboard">Dashboard</a>

            <a
              href="/order"
              className="pajara-nav-cta"
            >
              Pesan Desain
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-order-detail">
        <div className="pajara-container">

          <div className="pajara-order-detail-header">
            <p className="pajara-eyebrow">
              REVISI PROJECT
            </p>

            <h1>
              Revisi <span>Pajara.</span>
            </h1>

            <p>
              Sampaikan catatan revisi agar Pajara dapat
              memahami perubahan yang Anda inginkan.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: "24px",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >

            {/* RINGKASAN */}
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                RINGKASAN
              </p>

              <h2>Informasi Project</h2>

              <div
                style={{
                  display: "grid",
                  gap: "18px",
                  marginTop: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                    paddingBottom: "18px",
                    borderBottom:
                      "1px solid var(--line)",
                  }}
                >
                  <span
                    style={{
                      color: "var(--muted)",
                      fontSize: "14px",
                    }}
                  >
                    ID Pesanan
                  </span>

                  <strong
                    style={{
                      color: "var(--green-dark)",
                      fontSize: "14px",
                    }}
                  >
                    #{id}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                    paddingBottom: "18px",
                    borderBottom:
                      "1px solid var(--line)",
                  }}
                >
                  <span
                    style={{
                      color: "var(--muted)",
                      fontSize: "14px",
                    }}
                  >
                    Status Project
                  </span>

                  <span className="pajara-order-status">
                    Menunggu Revisi
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                  }}
                >
                  <span
                    style={{
                      color: "var(--muted)",
                      fontSize: "14px",
                    }}
                  >
                    Jumlah Revisi
                  </span>

                  <strong
                    style={{
                      color: "var(--green-dark)",
                      fontSize: "14px",
                    }}
                  >
                    Belum ada
                  </strong>
                </div>
              </div>
            </div>

            {/* CATATAN REVISI */}
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                CATATAN REVISI
              </p>

              <h2>
                Sampaikan Perubahan
              </h2>

              <p
                style={{
                  marginTop: "10px",
                  color: "var(--muted)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                Jelaskan bagian desain yang ingin
                diperbaiki dengan informasi yang jelas.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "18px",
                  marginTop: "24px",
                }}
              >
                <div className="pajara-form-field">
                  <label htmlFor="revision">
                    Catatan Revisi
                  </label>

                  <textarea
                    id="revision"
                    name="revision"
                    rows={7}
                    placeholder="Contoh: ubah warna background menjadi hijau Pajara, perbesar logo, dan rapikan posisi teks."
                  />
                </div>

                <div className="pajara-form-field">
                  <label htmlFor="revision-reference">
                    Referensi Tambahan
                  </label>

                  <input
                    id="revision-reference"
                    name="revision-reference"
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                  />

                  <p className="pajara-form-help">
                    Upload gambar atau file referensi jika
                    diperlukan.
                  </p>
                </div>
              </div>
            </div>

            {/* PANDUAN */}
            <div
              className="pajara-order-detail-card"
              style={{
                background: "var(--green-dark)",
                color: "var(--white)",
              }}
            >
              <p
                className="pajara-eyebrow"
                style={{
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                PANDUAN
              </p>

              <h3
                style={{
                  marginTop: "12px",
                  color: "var(--white)",
                }}
              >
                Agar revisi lebih mudah diproses
              </h3>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                Jelaskan bagian yang ingin diubah,
                alasan perubahan, dan hasil yang
                diharapkan. Semakin jelas catatannya,
                semakin mudah proses revisi dilakukan.
              </p>
            </div>

            {/* ACTION */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                paddingTop: "4px",
              }}
            >
              <a
                href={`/orders/${id}`}
                style={{
                  color: "var(--green)",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                ← Kembali ke Pesanan
              </a>

              <button
                type="button"
                className="pajara-button pajara-button-primary"
              >
                Kirim Revisi
              </button>
            </div>

          </div>

        </div>
      </section>
    </main>
  );
}
