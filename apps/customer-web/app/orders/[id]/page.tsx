type OrderDetailPageProps = {
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

export default async function OrderDetail({
  params,
}: OrderDetailPageProps) {
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
            <a href="/dashboard">Dashboard</a>

            <a href="/order" className="pajara-nav-cta">
              Pesan Desain
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-order-detail">
        <div className="pajara-container">

          <div className="pajara-order-detail-header">
            <p className="pajara-eyebrow">
              DETAIL PESANAN
            </p>

            <h1>
              Pesanan <span>Pajara.</span>
            </h1>

            <p>
              Pantau status project, pembayaran, revisi,
              dan file desain Anda dari satu tempat.
            </p>
          </div>

          <div className="pajara-order-detail-grid">

            <div
              style={{
                display: "grid",
                gap: "20px",
              }}
            >
              <div className="pajara-order-detail-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--brown)",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      ID Pesanan
                    </p>

                    <h2
                      style={{
                        marginTop: "8px",
                        marginBottom: 0,
                      }}
                    >
                      #{id}
                    </h2>
                  </div>

                  <span className="pajara-order-status">
                    Menunggu Konfirmasi
                  </span>
                </div>
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  RINGKASAN
                </p>

                <h2>Informasi Pesanan</h2>

                <div
                  style={{
                    display: "grid",
                    gap: "16px",
                    marginTop: "22px",
                  }}
                >
                  <div
                    style={{
                      paddingBottom: "16px",
                      borderBottom:
                        "1px solid var(--line)",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--muted)",
                      }}
                    >
                      Layanan
                    </p>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color: "var(--green-dark)",
                      }}
                    >
                      Belum ditentukan
                    </strong>
                  </div>

                  <div
                    style={{
                      paddingBottom: "16px",
                      borderBottom:
                        "1px solid var(--line)",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--muted)",
                      }}
                    >
                      Jenis Desain
                    </p>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color: "var(--green-dark)",
                      }}
                    >
                      Menunggu brief
                    </strong>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "var(--muted)",
                      }}
                    >
                      Status Project
                    </p>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color: "var(--green-dark)",
                      }}
                    >
                      Menunggu konfirmasi
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: "20px",
                alignContent: "start",
              }}
            >
              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  AKSES PESANAN
                </p>

                <h2>Kelola Project</h2>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    marginTop: "22px",
                  }}
                >
                  <a
                    href={`/orders/${id}/payment`}
                    className="pajara-button pajara-button-primary"
                    style={{
                      width: "100%",
                    }}
                  >
                    Pembayaran
                  </a>

                  <a
                    href={`/orders/${id}/revision`}
                    className="pajara-button pajara-button-secondary"
                    style={{
                      width: "100%",
                    }}
                  >
                    Revisi
                  </a>

                  <a
                    href={`/orders/${id}/files`}
                    className="pajara-button pajara-button-secondary"
                    style={{
                      width: "100%",
                    }}
                  >
                    File Pesanan
                  </a>
                </div>
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  CATATAN
                </p>

                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                  }}
                >
                  Detail pesanan dan status project akan
                  diperbarui setelah pesanan dikonfirmasi
                  oleh Pajara Studio.
                </p>
              </div>
            </div>

          </div>

          <div
            style={{
              marginTop: "28px",
            }}
          >
            <a
              href="/dashboard"
              style={{
                color: "var(--green)",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              ← Kembali ke Dashboard
            </a>
          </div>

        </div>
      </section>
    </main>
  );
}
