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
            <img
              src="/755809946_17926162029385149_3739923509439876817_n.jpg"
              alt="Pajara Studio"
              className="pajara-brand-logo"
            />

            <span>Pajara Studio</span>
          </a>

          <nav className="pajara-nav">
            <a href="/dashboard">
              Dashboard
            </a>

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
              Sampaikan catatan revisi Anda agar project
              dapat disesuaikan dengan kebutuhan.
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

              <h2>
                Informasi Project
              </h2>

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
                    Menunggu Konfirmasi
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
                    Revisi
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

              <div
                style={{
                  display: "grid",
                  gap: "18px",
                  marginTop: "24px",
                }}
              >
                <div className="pajara-form-field">
                  <label htmlFor="revision">
                    Detail Revisi
                  </label>

                  <textarea
                    id="revision"
                    name="revision"
                    rows={8}
                    placeholder="Jelaskan bagian desain yang ingin diubah, ditambahkan, atau diperbaiki."
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
                    Upload referensi tambahan jika
                    diperlukan untuk menjelaskan revisi.
                  </p>
                </div>
              </div>
            </div>

            {/* PANDUAN */}
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                PANDUAN
              </p>

              <h2>
                Agar Revisi Lebih Jelas
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  marginTop: "22px",
                }}
              >
                <div
                  style={{
                    padding: "18px 20px",
                    borderRadius: "14px",
                    border:
                      "1px solid var(--line)",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: "var(--green-dark)",
                      marginBottom: "6px",
                    }}
                  >
                    Jelaskan bagian yang diubah
                  </strong>

                  <p
                    style={{
                      margin: 0,
                      color: "var(--muted)",
                      fontSize: "14px",
                      lineHeight: 1.7,
                    }}
                  >
                    Sebutkan elemen desain yang ingin
                    disesuaikan agar proses revisi lebih
                    terarah.
                  </p>
                </div>

                <div
                  style={{
                    padding: "18px 20px",
                    borderRadius: "14px",
                    border:
                      "1px solid var(--line)",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: "var(--green-dark)",
                      marginBottom: "6px",
                    }}
                  >
                    Gunakan referensi bila perlu
                  </strong>

                  <p
                    style={{
                      margin: 0,
                      color: "var(--muted)",
                      fontSize: "14px",
                      lineHeight: 1.7,
                    }}
                  >
                    Referensi visual dapat membantu Pajara
                    memahami arah revisi yang diinginkan.
                  </p>
                </div>
              </div>
            </div>

            {/* CATATAN */}
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
                  color:
                    "rgba(255,255,255,0.65)",
                }}
              >
                CATATAN
              </p>

              <h3
                style={{
                  marginTop: "12px",
                  color: "var(--white)",
                }}
              >
                Revisi tetap mengikuti brief project
              </h3>

              <p
                style={{
                  margin: "12px 0 0",
                  color:
                    "rgba(255,255,255,0.78)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                Pajara Studio akan menyesuaikan revisi
                berdasarkan brief dan kesepakatan project.
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

              <a
                href="/dashboard"
                className="pajara-button pajara-button-secondary"
              >
                Dashboard
              </a>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
