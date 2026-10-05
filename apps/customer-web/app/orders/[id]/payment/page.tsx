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
            <span className="pajara-brand-mark">P</span>
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
              PEMBAYARAN
            </p>

            <h1>
              Pembayaran <span>Pajara.</span>
            </h1>

            <p>
              Lihat informasi pembayaran dan status
              pembayaran project Anda.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1.4fr) minmax(280px, 0.6fr)",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "20px",
              }}
            >
              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  RINGKASAN
                </p>

                <h2>Detail Pembayaran</h2>

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
                      Total Project
                    </span>

                    <strong
                      style={{
                        color: "var(--green-dark)",
                        fontSize: "14px",
                      }}
                    >
                      Menunggu konfirmasi
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
                      Status Pembayaran
                    </span>

                    <span className="pajara-order-status">
                      Belum Dibayar
                    </span>
                  </div>
                </div>
              </div>

              <div className="pajara-order-detail-card">
                <p className="pajara-eyebrow">
                  METODE
                </p>

                <h2>Pilih Pembayaran</h2>

                <div
                  style={{
                    display: "grid",
                    gap: "14px",
                    marginTop: "22px",
                  }}
                >
                  <div
                    style={{
                      padding: "18px",
                      border: "1px solid var(--line)",
                      borderRadius: "14px",
                      background:
                        "rgba(47, 107, 69, 0.04)",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "var(--green-dark)",
                        marginBottom: "6px",
                      }}
                    >
                      Pembayaran Manual
                    </strong>

                    <p
                      style={{
                        margin: 0,
                        color: "var(--muted)",
                        fontSize: "14px",
                        lineHeight: 1.7,
                      }}
                    >
                      Pembayaran melalui rekening atau
                      metode yang diberikan oleh Pajara
                      Studio.
                    </p>
                  </div>

                  <div
                    style={{
                      padding: "18px",
                      border: "1px solid var(--line)",
                      borderRadius: "14px",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "var(--green-dark)",
                        marginBottom: "6px",
                      }}
                    >
                      Payment Gateway
                    </strong>

                    <p
                      style={{
                        margin: 0,
                        color: "var(--muted)",
                        fontSize: "14px",
                        lineHeight: 1.7,
                      }}
                    >
                      Pembayaran otomatis melalui payment
                      gateway akan tersedia setelah project
                      dikonfirmasi.
                    </p>
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
                  STATUS
                </p>

                <h2>Belum Dibayar</h2>

                <p
                  style={{
                    marginTop: "14px",
                    marginBottom: 0,
                    color: "var(--muted)",
                    fontSize: "14px",
                    lineHeight: 1.7,
                  }}
                >
                  Pembayaran dapat dilakukan setelah
                  detail project dan nominal dikonfirmasi
                  oleh Pajara Studio.
                </p>

                <div
                  style={{
                    marginTop: "22px",
                    paddingTop: "20px",
                    borderTop:
                      "1px solid var(--line)",
                  }}
                >
                  <a
                    href={`/orders/${id}`}
                    className="pajara-button pajara-button-secondary"
                    style={{
                      width: "100%",
                    }}
                  >
                    Kembali ke Detail
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
                    color: "var(--muted)",
                    fontSize: "14px",
                    lineHeight: 1.7,
                  }}
                >
                  Jangan melakukan pembayaran sebelum
                  mendapatkan nominal dan instruksi resmi
                  dari Pajara Studio.
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
              href={`/orders/${id}`}
              style={{
                color: "var(--green)",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              ← Kembali ke Pesanan
            </a>
          </div>

        </div>
      </section>
    </main>
  );
}
