export default function CustomerLogin() {
return (
<main>
<header className="pajara-navbar">
<div className="pajara-container pajara-navbar-inner">
<a href="/" className="pajara-brand">
<span className="pajara-brand-mark">P</span>
<span>Pajara Studio</span>
</a>
</div>
</header>

  <section className="pajara-hero">
    <div className="pajara-container">
      <div className="pajara-hero-content">
        <p className="pajara-eyebrow">
          Customer Login
        </p>

        <h1>
          Selamat datang kembali di{" "}
          <span>Pajara.</span>
        </h1>

        <p className="pajara-hero-description">
          Login untuk melihat pesanan, pembayaran,
          revisi, dan file desain Anda.
        </p>

        <form
          style={{
            maxWidth: "480px",
            marginTop: "32px",
            display: "grid",
            gap: "16px",
          }}
        >
          <input
            type="email"
            placeholder="Email"
            required
            style={{
              minHeight: "50px",
              padding: "0 16px",
              border: "1px solid #e7e2d9",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            required
            style={{
              minHeight: "50px",
              padding: "0 16px",
              border: "1px solid #e7e2d9",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          />

          <button
            type="submit"
            className="pajara-button pajara-button-primary"
          >
            Login
          </button>
        </form>

        <p
          style={{
            marginTop: "24px",
            color: "#6f6f6f",
          }}
        >
          Belum punya akun?{" "}
          <a
            href="/register"
            style={{
              color: "#2f6b45",
              fontWeight: 700,
            }}
          >
            Buat akun
          </a>
        </p>
      </div>
    </div>
  </section>
</main>

);
            }
