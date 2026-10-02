type OrderPageProps = {
params: {
id: string;
};
};

export default function OrderDetail({
params,
}: OrderPageProps) {
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

  <section className="pajara-services">
    <div className="pajara-container">
      <p className="pajara-eyebrow">
        Detail Pesanan
      </p>

      <h1>
        Pesanan <span>#{params.id}</span>
      </h1>

      <p className="pajara-section-description">
        Informasi lengkap mengenai pesanan desain Anda
        akan ditampilkan di halaman ini.
      </p>

      <div className="pajara-services-grid">
        <article className="pajara-service-card">
          <h3>Status Pesanan</h3>

          <p>
            Menunggu konfirmasi dari Pajara Studio.
          </p>
        </article>

        <article className="pajara-service-card">
          <h3>Layanan</h3>

          <p>
            Informasi layanan yang dipesan akan
            ditampilkan di sini.
          </p>
        </article>

        <article className="pajara-service-card">
          <h3>Deadline</h3>

          <p>
            Deadline pesanan akan ditampilkan setelah
            pesanan dikonfirmasi.
          </p>
        </article>

        <article className="pajara-service-card">
          <h3>Total Pembayaran</h3>

          <p>
            Informasi total, DP, dan sisa pembayaran
            akan ditampilkan di sini.
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
          Brief
        </p>

        <h2>
          Kebutuhan Desain
        </h2>

        <p className="pajara-section-description">
          Brief pesanan akan ditampilkan di bagian ini
          setelah data diambil dari database.
        </p>
      </section>

      <section
        style={{
          marginTop: "48px",
          maxWidth: "760px",
        }}
      >
        <p className="pajara-eyebrow">
          Revisi
        </p>

        <h2>
          Catatan Revisi
        </h2>

        <p className="pajara-section-description">
          Riwayat revisi dan catatan dari admin akan
          muncul di sini.
        </p>
      </section>

      <section
        style={{
          marginTop: "48px",
          maxWidth: "760px",
        }}
      >
        <p className="pajara-eyebrow">
          File
        </p>

        <h2>
          File Pesanan
        </h2>

        <p className="pajara-section-description">
          File referensi, preview, revisi, dan file final
          akan tersedia di bagian ini sesuai status pesanan.
        </p>
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
          href="/dashboard"
          className="pajara-button pajara-button-secondary"
        >
          Kembali ke Dashboard
        </a>

        <a
          href="/order"
          className="pajara-button pajara-button-primary"
        >
          Pesan Lagi
        </a>
      </div>
    </div>
  </section>
</main>

);
  }
