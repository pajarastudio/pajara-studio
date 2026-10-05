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
              Detail Pesanan
            </p>

            <h1>
              Pesanan <span>Pajara.</span>
            </h1>

            <p>
              Pantau status project, pembayaran, revisi,
              dan file desain Anda dari satu halaman.
            </p>
          </div>

          <div className="pajara-order-detail-grid">

            <div className="pajara-order-detail-card">
              <p className="pajara-dashboard-label">
                Informasi Pesanan
              </p>

              <h2>Detail Project</h2>

              <div
                style={{
                  display: "grid",
                  gap: "18px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--brown)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    ID Pesanan
                  </p>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color: "var(--green-dark)",
                      fontSize: "16px",
                    }}
                  >
                    {id}
                  </strong>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--brown)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Layanan
                  </p>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color: "var(--green-dark)",
                      fontSize: "16px",
                    }}
                  >
                    Desain Promosi
                  </strong>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--brown)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Status
                  </p>

                  <div style={{ marginTop: "8px" }}>
                    <span className="pajara-order-status">
                      Menunggu Konfirmasi
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pajara-order-detail-card">
              <p className="pajara-dashboard-label">
                Menu Pesanan
              </p>

              <h2>Akses Project</h2>

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
