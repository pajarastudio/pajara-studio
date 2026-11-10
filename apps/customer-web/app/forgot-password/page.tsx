
"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@pajara/supabase";

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
      <style jsx global>{`
        .forgot-page {
          min-height: 100vh;
          background: #f7f4ee;
          color: #243b2c;
          font-family: "DM Sans", Arial, sans-serif;
        }

        .forgot-page *,
        .forgot-page *::before,
        .forgot-page *::after {
          box-sizing: border-box;
        }

        .forgot-page a,
        .forgot-page button {
          -webkit-tap-highlight-color: transparent;
        }

        .forgot-container {
          width: min(100% - 32px, 680px);
          margin: 0 auto;
        }

        .forgot-header {
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(47, 107, 69, 0.1);
          background: rgba(247, 244, 238, 0.88);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
          backdrop-filter: blur(22px) saturate(160%);
        }

        .forgot-header-inner {
          display: flex;
          min-height: 70px;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .forgot-brand {
          display: inline-flex;
          min-width: 0;
          align-items: center;
          gap: 10px;
          color: #214d32;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
        }

        .forgot-logo {
          display: block;
          width: 39px;
          height: 39px;
          flex: 0 0 39px;
          border-radius: 12px;
          object-fit: cover;
        }

        .forgot-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .forgot-menu-button {
          display: flex;
          width: 42px;
          height: 42px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: 1px solid rgba(47, 107, 69, 0.2);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.55);
          cursor: pointer;
        }

        .forgot-menu-button span {
          display: block;
          width: 17px;
          height: 2px;
          border-radius: 5px;
          background: #214d32;
          transition: all 0.2s ease;
        }

        .forgot-menu-button.is-open span:first-child {
          transform: translateY(7px) rotate(45deg);
        }

        .forgot-menu-button.is-open span:nth-child(2) {
          opacity: 0;
        }

        .forgot-menu-button.is-open span:last-child {
          transform: translateY(-7px) rotate(-45deg);
        }

        .forgot-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          width: min(680px, calc(100% - 32px));
          padding: 13px;
          border: 1px solid rgba(47, 107, 69, 0.12);
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 12px 35px rgba(33, 77, 50, 0.12);
          transform: translateX(-50%);
          animation: forgot-menu-in 0.18s ease;
        }

        @keyframes forgot-menu-in {
          from {
            opacity: 0;
            transform: translate(-50%, -5px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .forgot-menu-label {
          margin: 2px 9px 9px;
          color: #999487;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .forgot-menu a {
          display: flex;
          min-height: 43px;
          align-items: center;
          justify-content: space-between;
          padding: 10px 11px;
          border-radius: 9px;
          color: #214d32;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
        }

        .forgot-menu a:hover {
          background: #f1f5ed;
        }

        .forgot-menu a span {
          color: #8a6a4a;
        }

        .forgot-main {
          display: flex;
          min-height: calc(100vh - 70px);
          align-items: center;
          padding: 55px 0 35px;
        }

        .forgot-card-wrap {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
        }

        .forgot-card {
          padding: 34px;
          border: 1px solid #e6e5dc;
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 12px 35px rgba(33, 77, 50, 0.04);
        }

        .forgot-eyebrow {
          margin: 0 0 18px;
          color: #8a6a4a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }

        .forgot-card h1 {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(29px, 7vw, 36px);
          font-weight: 500;
          letter-spacing: -0.8px;
          line-height: 1.2;
        }

        .forgot-card h1 span {
          color: #8a6a4a;
          font-style: italic;
        }

        .forgot-description {
          margin: 13px 0 28px;
          color: #777d73;
          font-size: 13px;
          line-height: 1.9;
        }

        .forgot-form {
          display: grid;
          gap: 18px;
        }

        .forgot-form .pajara-form-field {
          display: grid;
          gap: 9px;
        }

        .forgot-form label {
          color: #214d32;
          font-size: 13px;
          font-weight: 700;
        }

        .forgot-form input {
          width: 100%;
          min-height: 52px;
          padding: 13px 15px;
          border: 1px solid #e6e5dc;
          border-radius: 13px;
          outline: none;
          background: #fff;
          color: #243b2c;
          font: inherit;
          font-size: 13px;
          transition: border 0.2s ease, box-shadow 0.2s ease;
        }

        .forgot-form input:focus {
          border-color: #2f6b45;
          box-shadow: 0 0 0 3px rgba(47, 107, 69, 0.09);
        }

        .forgot-form input::placeholder {
          color: #a4a69f;
        }

        .forgot-submit {
          display: flex;
          width: 100%;
          min-height: 52px;
          align-items: center;
          justify-content: center;
          padding: 13px 17px;
          border: 0;
          border-radius: 12px;
          background: #214d32;
          color: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s ease, opacity 0.2s ease;
        }

        .forgot-submit:hover:not(:disabled) {
          background: #2f6b45;
        }

        .forgot-submit:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .forgot-message {
          padding: 14px 16px;
          border: 1px solid rgba(47, 107, 69, 0.15);
          border-radius: 12px;
          background: rgba(47, 107, 69, 0.07);
          color: #214d32;
          font-size: 12px;
          line-height: 1.7;
        }

        .forgot-error {
          padding: 14px 16px;
          border: 1px solid rgba(160, 50, 50, 0.15);
          border-radius: 12px;
          background: rgba(160, 50, 50, 0.07);
          color: #8b3030;
          font-size: 12px;
          line-height: 1.7;
        }

        .forgot-footer {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 38px;
          margin-bottom: 20px;
          padding-top: 22px;
          border-top: 1px solid #e4ddd1;
        }

        .forgot-footer-logo {
          display: block;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          border-radius: 10px;
          background: #fff;
          object-fit: contain;
        }

        .forgot-footer-copy {
          min-width: 0;
        }

        .forgot-footer-copy strong {
          display: block;
          color: #214d32;
          font-size: 13px;
          line-height: 1.5;
        }

        .forgot-footer-copy p {
          margin: 4px 0 0;
          color: #8a6a4a;
          font-size: 11px;
          line-height: 1.5;
        }

        .forgot-footer-copy small {
          display: block;
          margin-top: 3px;
          color: #999387;
          font-size: 10px;
          line-height: 1.5;
        }

        @media (max-width: 380px) {
          .forgot-container {
            width: calc(100% - 24px);
          }

          .forgot-card {
            padding: 25px 21px;
            border-radius: 19px;
          }

          .forgot-main {
            padding-top: 35px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .forgot-page *,
          .forgot-page *::before,
          .forgot-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

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
