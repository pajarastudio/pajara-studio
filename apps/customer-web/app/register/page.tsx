"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@pajara/supabase";

const LOGO =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
            },
          },
        });

      if (signUpError) throw signUpError;

      setMessage(
        "Akun berhasil dibuat. Silakan cek email Anda jika verifikasi email diaktifkan."
      );

      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat akun."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      {/* NAVBAR */}
      <header className="register-navbar">
        <div className="navbar-inner">
          <a href="/" className="navbar-brand">
            <span className="brand-logo-wrap">
              <img
                src={LOGO}
                alt="Logo Pajara Studio"
                className="brand-logo"
              />
            </span>

            <span className="brand-name">
              Pajara Studio
            </span>
          </a>

          <div className="navbar-actions">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>

          {menuOpen && (
            <>
              <button
                type="button"
                className="menu-overlay"
                aria-label="Tutup menu"
                onClick={() => setMenuOpen(false)}
              />

              <nav className="navbar-dropdown">
                <a href="/" onClick={() => setMenuOpen(false)}>
                  Website
                  <span>↗</span>
                </a>

                <a
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                  <span>→</span>
                </a>
              </nav>
            </>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="register-hero">
        <div className="hero-content">
          <p className="eyebrow">CUSTOMER REGISTRATION</p>

          <h1>
            Mulai perjalanan
            <br />
            bersama <span>Pajara.</span>
          </h1>

          <p className="hero-description">
            Buat akun untuk mengelola pesanan, memantau project,
            dan menyimpan hasil desain Anda dalam satu ruang
            digital Pajara Studio.
          </p>
        </div>
      </section>

      {/* REGISTER FORM */}
      <section className="register-section">
        <div className="register-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">AKUN CUSTOMER</p>

              <h2>Buat Akun</h2>

              <p className="card-description">
                Lengkapi informasi berikut untuk memulai.
              </p>
            </div>

            <div className="card-logo-wrap">
              <img src={LOGO} alt="Pajara Studio" />
            </div>
          </div>

          <form onSubmit={handleRegister}>
            <div className="form-field">
              <label htmlFor="full-name">
                Nama Lengkap
              </label>

              <input
                id="full-name"
                name="full-name"
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Masukkan nama lengkap"
                autoComplete="name"
                maxLength={100}
                required
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="nama@email.com"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">
                Nomor WhatsApp
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="08xxxxxxxxxx"
                autoComplete="tel"
                maxLength={25}
                required
                disabled={loading}
              />

              <small>
                Gunakan nomor yang aktif agar mudah dihubungi
                terkait pesanan.
              </small>
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Minimal 6 karakter"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="confirm-password">
                Konfirmasi Password
              </label>

              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Ulangi password"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="feedback error" role="alert">
                <span className="feedback-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div
                className="feedback success"
                role="status"
              >
                <span className="feedback-icon">✓</span>
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Membuat akun...
                </>
              ) : (
                <>
                  Buat Akun
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="login-prompt">
            <p>
              Sudah punya akun?{" "}
              <a href="/login">Masuk sekarang</a>
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="register-footer">
        <div className="footer-brand">
          <img src={LOGO} alt="Pajara Studio" />

          <div>
            <strong>Pajara Studio</strong>
            <p>Berakar di Tanah Pasundan.</p>
          </div>
        </div>

        <p className="footer-copyright">
          © 2026 Pajara Studio. Desain yang punya arah.
        </p>
      </footer>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          overflow-x: clip;
          background: #f7f4ee;
          color: #26352a;
          font-family: "DM Sans", sans-serif;
        }

        /* NAVBAR */
        .register-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          background: rgba(247, 244, 238, 0.78);
          backdrop-filter: blur(22px) saturate(160%);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
          border-bottom: 1px solid rgba(47, 107, 69, 0.1);
        }

        .navbar-inner {
          position: relative;
          width: 100%;
          max-width: 1120px;
          min-height: 74px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .navbar-brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
          color: #214d32;
          text-decoration: none;
        }

        .brand-logo-wrap {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 12px;
          background: #f1ece6;
          border: 1px solid rgba(47, 107, 69, 0.08);
        }

        .brand-logo {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: inherit;
        }

        .brand-name {
          display: block;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          font-weight: 700;
          line-height: 1.2;
          white-space: nowrap;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
        }

        .menu-toggle {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(33, 77, 50, 0.12);
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.85);
          color: #214d32;
          cursor: pointer;
          transition: background 180ms ease,
            border-color 180ms ease;
        }

        .menu-toggle:hover {
          background: #fff;
          border-color: rgba(47, 107, 69, 0.3);
        }

        .menu-overlay {
          position: fixed;
          inset: 74px 0 0;
          z-index: 51;
          width: 100%;
          border: none;
          background: rgba(25, 39, 29, 0.12);
        }

        .navbar-dropdown {
          position: absolute;
          top: calc(100% + 9px);
          right: 24px;
          z-index: 52;
          width: 220px;
          padding: 8px;
          display: grid;
          gap: 4px;
          border: 1px solid rgba(33, 77, 50, 0.1);
          border-radius: 15px;
          background: #fff;
          box-shadow: 0 16px 40px rgba(33, 77, 50, 0.12);
          animation: menuEnter 180ms ease both;
        }

        .navbar-dropdown a {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 14px;
          border-radius: 10px;
          color: #34483a;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: background 160ms ease;
        }

        .navbar-dropdown a:hover {
          background: #f1f5ef;
          color: #214d32;
        }

        .navbar-dropdown a span {
          color: #8a6a4a;
          font-size: 15px;
        }

        /* HERO */
        .register-hero {
          padding: 68px 22px 38px;
          text-align: center;
        }

        .hero-content {
          max-width: 760px;
          margin: 0 auto;
        }

        .eyebrow {
          margin: 0 0 13px;
          color: #8a6a4a;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
          line-height: 1.6;
        }

        .register-hero h1 {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(36px, 6vw, 56px);
          font-weight: 700;
          line-height: 1.13;
          letter-spacing: -1.3px;
        }

        .register-hero h1 span {
          color: #8a6a4a;
        }

        .hero-description {
          max-width: 650px;
          margin: 24px auto 0;
          color: #777970;
          font-size: 15px;
          line-height: 1.9;
        }

        /* FORM CARD */
        .register-section {
          width: 100%;
          padding: 0 20px 48px;
          box-sizing: border-box;
        }

        .register-card {
          position: relative;
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
          padding: clamp(24px, 5vw, 36px);
          border: 1px solid rgba(33, 77, 50, 0.09);
          border-radius: 26px;
          background: #fff;
          box-shadow: 0 14px 40px rgba(33, 77, 50, 0.045);
          box-sizing: border-box;
        }

        .card-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 34px;
        }

        .card-heading .eyebrow {
          margin-bottom: 8px;
          font-size: 10px;
        }

        .card-heading h2 {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(29px, 5vw, 38px);
          line-height: 1.2;
        }

        .card-description {
          margin: 10px 0 0;
          color: #85847b;
          font-size: 14px;
          line-height: 1.7;
        }

        .card-logo-wrap {
          width: 78px;
          height: 78px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          padding: 10px;
          border: 1px solid rgba(47, 107, 69, 0.08);
          border-radius: 23px;
          background: #f4f6f1;
          box-sizing: border-box;
        }

        .card-logo-wrap img {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 14px;
          object-fit: cover;
        }

        form {
          display: grid;
          gap: 21px;
        }

        .form-field {
          display: grid;
          gap: 9px;
          min-width: 0;
        }

        .form-field label {
          color: #454c43;
          font-size: 13px;
          font-weight: 800;
        }

        .form-field input {
          width: 100%;
          min-height: 58px;
          padding: 0 17px;
          border: 1px solid #e5e3dc;
          border-radius: 16px;
          outline: none;
          background: #f8f7f3;
          color: #26352a;
          font-family: inherit;
          font-size: 14px;
          box-sizing: border-box;
          transition: border-color 180ms ease,
            box-shadow 180ms ease,
            background 180ms ease;
        }

        .form-field input::placeholder {
          color: #a5a49d;
        }

        .form-field input:focus {
          border-color: #82a68a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(47, 107, 69, 0.08);
        }

        .form-field input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .form-field small {
          color: #96958c;
          font-size: 11px;
          line-height: 1.7;
        }

        .feedback {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px 15px;
          border-radius: 13px;
          font-size: 13px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }

        .error {
          border: 1px solid rgba(160, 50, 50, 0.15);
          background: #fbf0ed;
          color: #8b3030;
        }

        .success {
          border: 1px solid rgba(47, 107, 69, 0.14);
          background: #edf5eb;
          color: #285c32;
        }

        .feedback-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.06);
          font-size: 12px;
          font-weight: 800;
        }

        .submit-button {
          width: 100%;
          min-height: 54px;
          margin-top: 3px;
          padding: 13px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
          border-radius: 14px;
          background: #2f6b45;
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: background 180ms ease,
            transform 180ms ease;
        }

        .submit-button:hover:not(:disabled) {
          background: #214d32;
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .submit-button span:not(.button-spinner) {
          font-size: 17px;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 700ms linear infinite;
        }

        .login-prompt {
          margin-top: 27px;
          padding-top: 22px;
          border-top: 1px solid #eeeae3;
          text-align: center;
        }

        .login-prompt p {
          margin: 0;
          color: #777970;
          font-size: 13px;
          line-height: 1.7;
        }

        .login-prompt a {
          color: #2f6b45;
          font-weight: 800;
          text-decoration: none;
        }

        .login-prompt a:hover {
          text-decoration: underline;
        }

        /* FOOTER */
        .register-footer {
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          padding: 0 22px 30px;
          box-sizing: border-box;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .footer-brand img {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 11px;
          object-fit: cover;
        }

        .footer-brand strong {
          display: block;
          color: #214d32;
          font-size: 13px;
        }

        .footer-brand p {
          margin: 4px 0 0;
          color: #8a6a4a;
          font-size: 11px;
        }

        .footer-copyright {
          margin: 20px 0 0;
          padding-top: 15px;
          border-top: 1px solid #e4ddd1;
          color: #999387;
          font-size: 10px;
          line-height: 1.7;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes menuEnter {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .navbar-inner {
            min-height: 68px;
            padding: 0 17px;
          }

          .brand-logo-wrap {
            width: 40px;
            height: 40px;
            border-radius: 11px;
          }

          .brand-name {
            font-size: 16px;
          }

          .menu-toggle {
            width: 42px;
            height: 42px;
            border-radius: 12px;
          }

          .menu-overlay {
            top: 68px;
          }

          .navbar-dropdown {
            right: 17px;
          }

          .register-hero {
            padding: 54px 20px 32px;
          }

          .register-hero h1 {
            font-size: clamp(34px, 9vw, 43px);
            letter-spacing: -0.9px;
          }

          .hero-description {
            margin-top: 20px;
            font-size: 14px;
            line-height: 1.9;
          }

          .register-section {
            padding: 0 15px 38px;
          }

          .register-card {
            border-radius: 23px;
          }

          .card-logo-wrap {
            width: 68px;
            height: 68px;
            border-radius: 20px;
          }

          .form-field input {
            min-height: 56px;
            border-radius: 15px;
          }
        }

        @media (max-width: 360px) {
          .navbar-inner {
            padding: 0 13px;
          }

          .brand-name {
            font-size: 14px;
          }

          .brand-logo-wrap {
            width: 37px;
            height: 37px;
          }

          .card-heading {
            gap: 10px;
          }

          .card-logo-wrap {
            width: 58px;
            height: 58px;
            padding: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
