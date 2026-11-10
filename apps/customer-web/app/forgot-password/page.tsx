
"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@pajara/supabase";
import "./forgot-password.css";

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage(
      "Link reset password sudah dikirim ke email Anda. Silakan cek inbox atau folder spam."
    );
  };

  return (
    <main className="forgot-page">
      <header className="forgot-header">
        <div className="forgot-container forgot-header-inner">
          <a href="/" className="forgot-brand">
            <img
              src={logo}
              alt="Pajara Studio"
              width={39}
              height={39}
              className="forgot-logo"
            />
            <span>Pajara Studio</span>
          </a>

          <div className="forgot-header-actions">
            <button
              type="button"
              className={`forgot-menu-button ${
                menuOpen ? "is-open" : ""
              }`}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="forgot-menu" aria-label="Navigasi">
            <p className="forgot-menu-label">MENU PAJARA STUDIO</p>

            <a href="/" onClick={() => setMenuOpen(false)}>
              Website <span>↗</span>
            </a>

            <a href="/login" onClick={() => setMenuOpen(false)}>
              Login <span>↗</span>
            </a>
          </nav>
        )}
      </header>

      <section className="forgot-main">
        <div className="forgot-container">
          <div className="forgot-card-wrap">
            <div className="forgot-card">
              <p className="forgot-eyebrow">
                KEAMANAN AKUN
              </p>

              <h1>
                Lupa Password <span>Pajara.</span>
              </h1>

              <p className="forgot-description">
                Masukkan email akun Pajara Studio Anda.
                Kami akan mengirimkan link untuk membuat
                password baru.
              </p>

              <form
                onSubmit={handleSubmit}
                className="forgot-form"
              >
                <div className="pajara-form-field">
                  <label htmlFor="email">Email</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Masukkan email Anda"
                    autoComplete="email"
                    required
                  />
                </div>

                {error && (
                  <div className="forgot-error" role="alert">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="forgot-message" role="status">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="forgot-submit"
                  disabled={loading}
                >
                  {loading
                    ? "Mengirim..."
                    : "Kirim Link Reset Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="forgot-container forgot-footer">
        <img
          src={logo}
          alt="Logo Pajara Studio"
          width={43}
          height={43}
          className="forgot-footer-logo"
        />

        <div className="forgot-footer-copy">
          <strong>Pajara Studio</strong>
          <p>Berakar di Tanah Pasundan.</p>
          <small>
            © 2026 Pajara Studio. Desain yang punya arah.
          </small>
        </div>
      </footer>
    </main>
  );
}
