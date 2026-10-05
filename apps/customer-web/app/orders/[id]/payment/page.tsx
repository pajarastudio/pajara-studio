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
                "minmax(0, 1.35fr) minmax(280px, 0.65fr)",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* LEFT */}
            <div
              style={{
                display: "grid",
                gap: "24px",
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
                      alignItems: "center",
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
                  METODE PEMBAYARAN
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
                      padding: "20px",
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
                        marginBottom: "7px",
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
                      padding: "20px",
                      border: "1px solid var(--line)",
                      borderRadius: "14px",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "var(--green-dark)",
                        marginBottom: "7px",
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

            {/* RIGHT */}
            <aside
              style={{
                display: "grid",
                gap: "24px",
                alignContent: "start",
              }}
            >
              {/* STATUS */}
              <div
                className="pajara-order-detail-card"
                style={{
                  borderTop:
                    "3px solid var(--green)",
                }}
              >
                <p className="pajara-eyebrow">
                  STATUS PEMBAYARAN
                </p>

                <div
                  style={{
                    marginTop: "18px",
                    padding: "18px",
                    borderRadius: "14px",
                    background:
                      "rgba(47, 107, 69, 0.06)",
                    border:
                      "1px solid rgba(47, 107, 69, 0.12)",
                  }}
                >
                  <span
                    className="pajara-order-status"
                    style={{
                      display: "inline-flex",
                    }}
                  >
                    Belum Dibayar
                  </span>

                  <h2
                    style={{
                      marginTop: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    Menunggu Pembayaran
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "var(--muted)",
                      fontSize: "14px",
                      lineHeight: 1.7,
                    }}
                  >
                    Pembayaran dapat dilakukan setelah
                    detail project dan nominal dikonfirmasi
                    oleh Pajara Studio.
                  </p>
                </div>

                <a
                  href={`/orders/${id}`}
                  className="pajara-button pajara-button-secondary"
                  style={{
                    width: "100%",
                    marginTop: "18px",
                  }}
                >
                  Kembali ke Detail
                </a>
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
                    color: "rgba(255,255,255,0.65)",
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
                  Perhatikan sebelum membayar
                </h3>

                <p
                  style={{
                    margin: "12px 0 0",
                    color: "rgba(255,255,255,0.78)",
                    fontSize: "14px",
                    lineHeight: 1.7,
                  }}
                >
                  Jangan melakukan pembayaran sebelum
                  mendapatkan nominal dan instruksi resmi
                  dari Pajara Studio.
                </p>
              </div>
            </aside>
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
