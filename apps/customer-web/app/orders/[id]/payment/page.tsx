type PaymentPageProps = {
params: {
id: string;
};
};

export default function OrderPayment({
params,
}: PaymentPageProps) {
return (
<main>
<header className="pajara-navbar">
<div className="pajara-container pajara-navbar-inner">
<a href="/" className="pajara-brand">
<span className="pajara-brand-mark">P</span>
<span>Pajara Studio</span>
</a>

      <nav className="pajara-nav">
        <a href={`/orders/${params.id}`}>
          Detail Pesanan
        </a>

        <a
          href="/dashboard"
          className="pajara-nav-cta"
        >
          Dashboard
        </a>
      </nav>
    </div>
  </header>

  <section className="pajara-services">
    <div className="pajara-container">
      <p className="pajara-eyebrow">
        Pembayaran
      </p>

      <h1>
        Pembayaran Pesanan{" "}
        <span>#{params.id}</span>
      </h1>

      <p className="pajara-section-description">
        Kelola pembayaran pesanan Anda melalui halaman
        ini.
      </p>

      <div className="pajara-services-grid">
        <article className="pajara-service-card">
          <h3>Total Pesanan</h3>

          <p>
            Total biaya pesanan akan ditampilkan setelah
            pesanan dikonfirmasi.
          </p>
        </article>

        <article className="pajara-service-card">
          <h3>DP</h3>

          <p>
            Jumlah DP yang perlu dibayarkan akan
            ditampilkan di sini.
          </p>
        </article>

        <article className="pajara-service-card">
          <h3>Sisa Pembayaran</h3>

          <p>
            Sisa pembayaran akan dihitung berdasarkan
            pembayaran yang telah diverifikasi.
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
          Metode Pembayaran
        </p>

        <h2>
          Pilih metode pembayaran
        </h2>

        <div
          style={{
            marginTop: "24px",
            display: "grid",
            gap: "16px",
          }}
        >
          <label
            style={{
              display: "block",
              padding: "20px",
              border: "1px solid #e7e2d9",
              borderRadius: "16px",
              background: "#ffffff",
            }}
          >
            <input
              type="radio"
              name="payment-method"
              value="manual"
              defaultChecked
            />{" "}
            <strong>Pembayaran Manual</strong>

            <p
              style={{
                margin: "10px 0 0 24px",
                color: "#6f6f6f",
              }}
            >
              Transfer sesuai instruksi Pajara,
              kemudian upload bukti pembayaran.
            </p>
          </label>

          <label
            style={{
              display: "block",
              padding: "20px",
              border: "1px solid #e7e2d9",
              borderRadius: "16px",
              background: "#ffffff",
            }}
          >
            <input
              type="radio"
              name="payment-method"
              value="gateway"
            />{" "}
            <strong>Payment Gateway</strong>

            <p
              style={{
                margin: "10px 0 0 24px",
                color: "#6f6f6f",
              }}
            >
              Pembayaran otomatis melalui payment
              gateway jika tersedia.
            </p>
          </label>
        </div>
      </section>

      <section
        style={{
          marginTop: "48px",
          maxWidth: "760px",
        }}
      >
        <p className="pajara-eyebrow">
          Bukti Pembayaran
        </p>

        <h2>
          Upload bukti pembayaran
        </h2>

        <input
          type="file"
          accept="image/*,.pdf"
          style={{
            width: "100%",
            marginTop: "20px",
          }}
        />

        <p
          style={{
            marginTop: "10px",
            color: "#6f6f6f",
            fontSize: "14px",
          }}
        >
          Untuk pembayaran manual, upload bukti
          transfer setelah melakukan pembayaran.
        </p>
      </section>

      <div
        style={{
          marginTop: "40px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <button
          type="button"
          className="pajara-button pajara-button-primary"
        >
          Kirim Pembayaran
        </button>

        <a
          href={`/orders/${params.id}`}
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
