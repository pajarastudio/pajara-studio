type FilesPageProps = {
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

export default async function FilesPage({
  params,
}: FilesPageProps) {
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
              FILE PROJECT
            </p>

            <h1>
              File <span>Pajara.</span>
            </h1>

            <p>
              Akses file desain project Anda setelah
              project selesai dan file final tersedia.
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
                    Belum Selesai
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
                    File Tersedia
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

            {/* FILE FINAL */}
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                FILE FINAL
              </p>

              <h2>
                File Desain Anda
              </h2>

              <div
                style={{
                  marginTop: "24px",
                  padding: "28px 22px",
                  borderRadius: "16px",
                  border:
                    "1px dashed var(--line)",
                  background:
                    "rgba(47, 107, 69, 0.04)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    margin: "0 auto 16px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "rgba(47, 107, 69, 0.1)",
                    color: "var(--green-dark)",
                    fontSize: "18px",
                    fontWeight: 800,
                  }}
                >
                  P
                </div>

                <h3
                  style={{
                    margin: 0,
                    color: "var(--green-dark)",
                  }}
                >
                  Belum Ada File Final
                </h3>

                <p
                  style={{
                    margin: "10px auto 0",
                    maxWidth: "520px",
                    color: "var(--muted)",
                    fontSize: "14px",
                    lineHeight: 1.7,
                  }}
                >
                  File desain final akan tersedia di sini
                  setelah project selesai dan Pajara
                  Studio mengunggah file untuk Anda.
                </p>
              </div>
            </div>

            {/* INFORMASI DOWNLOAD */}
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                INFORMASI FILE
              </p>

              <h2>
                Download File
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
                    File Desain
                  </strong>

                  <p
                    style={{
                      margin: 0,
                      color: "var(--muted)",
                      fontSize: "14px",
                      lineHeight: 1.7,
                    }}
                  >
                    File final dapat diunduh setelah
                    project diselesaikan dan file tersedia.
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
                    Format File
                  </strong>

                  <p
                    style={{
                      margin: 0,
                      color: "var(--muted)",
                      fontSize: "14px",
                      lineHeight: 1.7,
                    }}
                  >
                    Format file akan disesuaikan dengan
                    kebutuhan project dan kesepakatan
                    bersama.
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
                File final aman di satu tempat
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
                Setelah project selesai, file final akan
                ditempatkan di halaman ini agar Anda dapat
                mengaksesnya kembali dengan mudah.
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
