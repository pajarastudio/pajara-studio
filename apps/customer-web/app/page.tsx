export default function CustomerHome() {
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
            <a href="/">Website</a>

            <a
              href="/login"
              className="pajara-nav-cta"
            >
              Login
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-hero">
        <div className="pajara-container">
          <div className="pajara-hero-content">
            <p className="pajara-eyebrow">
              Customer Web
            </p>

            <h1>
              Pesan desain bersama{" "}
              <span>Pajara.</span>
            </h1>

            <p className="pajara-hero-description">
              Kelola pesanan desain, pembayaran,
              revisi, hingga file final dalam satu
              tempat.
            </p>

            <div className="pajara-hero-actions">
              <a
                href="/register"
                className="pajara-button pajara-button-primary"
              >
                Buat Akun
              </a>

              <a
                href="/login"
                className="pajara-button pajara-button-secondary"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
