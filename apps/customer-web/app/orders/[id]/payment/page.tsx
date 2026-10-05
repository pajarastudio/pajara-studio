type PaymentPageProps = {
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

export default async function PaymentPage({
  params,
}: PaymentPageProps) {
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
              PEMBAYARAN
            </p>

            <h1>
              Pembayaran <span>Pajara.</span>
            </h1>

            <p>
              Kelola informasi pembayaran project Anda
              dengan mudah dan aman.
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

            {/* DETAIL PEMBAYARAN */}
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                DETAIL PEMBAYARAN
              </p>

              <h2>
                Informasi Pesanan
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
                    Layanan
                  </span>

                  <strong
                    style={{
                      color: "var(--green-dark)",
                      fontSize: "14px",
                    }}
                  >
                    Belum ditentukan
                  </strong>
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
                    Total
                  </span>

                  <strong
                    style={{
                      color: "var(--green-dark)",
                      fontSize: "16px",
                    }}
                  >
                    Menunggu konfirmasi
                  </strong>
                </div>
              </div>
            </div>

            {/* METODE */}
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                METODE PEMBAYARAN
              </p>

              <h2>
                Pilih Pembayaran
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  marginTop: "24px",
                }}
              >
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    border:
                      "1px solid var(--line)",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: "var(--green-dark)",
                      marginBottom: "7px",
                    }}
                  >
                    DP 50%
                  </strong>

                  <p
                    style={{
                      margin: 0,
                      color: "var(--muted)",
                      fontSize: "14px",
                      lineHeight: 1.7,
                    }}
                  >
                    Pembayaran awal sebesar 50%
                    sebelum project mulai dikerjakan.
                  </p>
                </div>

                <div
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    border:
                      "1px solid var(--line)",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: "var(--green-dark)",
                      marginBottom: "7px",
                    }}
                  >
                    Full / Lunas
                  </strong>

                  <p
                    style={{
                      margin: 0,
                      color: "var(--muted)",
                      fontSize: "14px",
                      lineHeight: 1.7,
                    }}
                  >
                    Pembayaran penuh sesuai total
                    project yang telah disepakati.
                  </p>
                </div>
              </div>
            </div>

            {/* STATUS */}
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                STATUS
              </p>

              <h2>
                Menunggu Pembayaran
              </h2>

              <div
                style={{
                  marginTop: "22px",
                  padding: "18px 20px",
                  borderRadius: "14px",
                  background:
                    "rgba(47, 107, 69, 0.05)",
                  border:
                    "1px solid var(--line)",
                }}
              >
                <span className="pajara-order-status">
                  Belum Dibayar
                </span>

                <p
                  style={{
                    margin: "12px 0 0",
                    color: "var(--muted)",
                    fontSize: "14px",
                    lineHeight: 1.7,
                  }}
                >
                  Detail pembayaran akan diperbarui
                  setelah pesanan dikonfirmasi oleh
                  Pajara Studio.
                </p>
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
                Pembayaran aman dan terarah
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
                Pajara Studio akan memberikan informasi
                pembayaran sesuai detail project dan
                kesepakatan yang telah dibuat.
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
