
"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@pajara/supabase";

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (mounted && data.session) {
        setReady(true);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");

    setMessage(
      "Password berhasil diperbarui. Silakan login kembali menggunakan password baru."
    );
  };

  return (
    <main className="reset-page">
      <style jsx global>{`
        .reset-page {
          min-height: 100vh;
          background: #f7f4ee;
          color: #243b2c;
          font-family: "DM Sans", Arial, sans-serif;
        }

        .reset-page *,
        .reset-page *::before,
        .reset-page *::after {
          box-sizing: border-box;
        }

        .reset-page a,
        .reset-page button {
          -webkit-tap-highlight-color: transparent;
        }

        .reset-container {
          width: min(100% - 32px, 680px);
          margin: 0 auto;
        }

        .reset-header {
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(47, 107, 69, 0.1);
          background: rgba(247, 244, 238, 0.88);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
          backdrop-filter: blur(22px) saturate(160%);
        }

        .reset-header-inner {
          display: flex;
          min-height: 70px;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .reset-brand {
          display: inline-flex;
          min-width: 0;
          align-items: center;
          gap: 10px;
          color: #214d32;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
        }

        .reset-logo {
          display: block;
          width: 39px;
          height: 39px;
          flex: 0 0 39px;
          border-radius: 12px;
          object-fit: cover;
        }

        .reset-menu-button {
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

        .reset-menu-button span {
          display: block;
          width: 17px;
          height: 2px;
          border-radius: 5px;
          background: #214d32;
          transition: all 0.2s ease;
        }

        .reset-menu-button.is-open span:first-child {
          transform: translateY(7px) rotate(45deg);
        }

        .reset-menu-button.is-open span:nth-child(2) {
          opacity: 0;
        }

        .reset-menu-button.is-open span:last-child {
          transform: translateY(-7px) rotate(-45deg);
        }

        .reset-menu {
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
          animation: reset-menu-in 0.18s ease;
        }

        @keyframes reset-menu-in {
          from {
            opacity: 0;
            transform: translate(-50%, -5px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .reset-menu-label {
          margin: 2px 9px 9px;
          color: #999487;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .reset-menu a {
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

        .reset-menu a:hover {
          background: #f1f5ed;
        }

        .reset-menu a span {
          color: #8a6a4a;
        }

        .reset-main {
          display: flex;
          min-height: calc(100vh - 70px);
          align-items: center;
          padding: 55px 0 35px;
        }

        .reset-card-wrap {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
        }

        .reset-card {
          padding: 34px;
          border: 1px solid #e6e5dc;
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 12px 35px rgba(33, 77, 50, 0.04);
        }

        .reset-icon {
          display: flex;
          width: 78px;
          height: 78px;
          align-items: center;
          justify-content: center;
          margin-bottom: 30px;
          border: 1px solid rgba(47, 107, 69, 0.12);
          border-radius: 23px;
          background: #edf3e9;
          color: #2f6b45;
        }

        .reset-eyebrow {
          margin: 0 0 18px;
          color: #8a6a4a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }

        .reset-card h1 {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(29px, 7vw, 36px);
          font-weight: 500;
          letter-spacing: -0.8px;
          line-height: 1.2;
        }

        .reset-card h1 span {
          color: #8a6a4a;
          font-style: italic;
        }

        .reset-description {
          margin: 13px 0 28px;
          color: #777d73;
          font-size: 13px;
          line-height: 1.9;
        }

        .reset-form {
          display: grid;
          gap: 19px;
        }

        .reset-form .pajara-form-field {
          display: grid;
          gap: 9px;
        }

        .reset-form label {
          color: #214d32;
          font-size: 13px;
          font-weight: 700;
        }

        .reset-form input {
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

        .reset-form input:focus {
          border-color: #2f6b45;
          box-shadow: 0 0 0 3px rgba(47, 107, 69, 0.09);
        }

        .reset-form input::placeholder {
          color: #a4a69f;
        }

        .reset-submit {
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

        .reset-submit:hover:not(:disabled) {
          background: #2f6b45;
        }

        .reset-submit:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .reset-message,
        .reset-error,
        .reset-waiting {
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 12px;
          line-height: 1.7;
        }

        .reset-message {
          border: 1px solid rgba(47, 107, 69, 0.15);
          background: rgba(47, 107, 69, 0.07);
          color: #214d32;
        }

        .reset-error {
          border: 1px solid rgba(160, 50, 50, 0.15);
          background: rgba(160, 50, 50, 0.07);
          color: #8b3030;
        }

        .reset-waiting {
          border: 1px solid rgba(47, 107, 69, 0.12);
          background: rgba(47, 107, 69, 0.04);
          color: #777d73;
        }

        .reset-waiting strong {
          display: block;
          color: #214d32;
          font-size: 13px;
        }

        .reset-waiting p {
          margin: 7px 0 0;
        }

        .reset-footer {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 38px;
          margin-bottom: 20px;
          padding-top: 22px;
          border-top: 1px solid #e4ddd1;
        }

        .reset-footer-logo {
          display: block;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          border-radius: 10px;
          background: #fff;
          object-fit: contain;
        }

        .reset-footer-copy {
          min-width: 0;
        }

        .reset-footer-copy strong {
          display: block;
          color: #214d32;
          font-size: 13px;
          line-height: 1.5;
        }

        .reset-footer-copy p {
          margin: 4px 0 0;
          color: #8a6a4a;
          font-size: 11px;
          line-height: 1.5;
        }

        .reset-footer-copy small {
          display: block;
          margin-top: 3px;
          color: #999387;
          font-size: 10px;
          line-height: 1.5;
        }

        @media (max-width: 380px) {
          .reset-container {
            width: calc(100% - 24px);
          }

          .reset-card {
            padding: 25px 21px;
            border-radius: 19px;
          }

          .reset-main {
            padding-top: 35px;
          }

          .reset-icon {
            width: 70px;
            height: 70px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reset-page *,
          .reset-page *::before,
          .reset-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <header className="reset-header">
        <div className="reset-container reset-header-inner">
          <a href="/" className="reset-brand">
            <img
              src={logo}
              alt="Pajara Studio"
              width={39}
              height={39}
              className="reset-logo"
            />
            <span>Pajara Studio</span>
          </a>

          <button
            type="button"
            className={`reset-menu-button ${
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

        {menuOpen && (
          <nav className="reset-menu" aria-label="Navigasi">
            <p className="reset-menu-label">MENU PAJARA STUDIO</p>

            <a href="/" onClick={() => setMenuOpen(false)}>
              Website <span>↗</span>
            </a>

            <a href="/login" onClick={() => setMenuOpen(false)}>
              Login <span>↗</span>
            </a>
          </nav>
        )}
      </header>

      <section className="reset-main">
        <div className="reset-container">
          <div className="reset-card-wrap">
            <div className="reset-card">
              <div className="reset-icon" aria-hidden="true">
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v3" />
                </svg>
              </div>

              <p className="reset-eyebrow">
                KEAMANAN AKUN
              </p>

              <h1>
                Reset Password <span>Pajara.</span>
              </h1>

              <p className="reset-description">
                Perbarui password akun Kang/Teh untuk
                menjaga keamanan dan akses ke layanan
                Pajara Studio.
              </p>

              {!ready ? (
                <div className="reset-waiting">
                  <strong>Menunggu sesi pemulihan...</strong>
                  <p>
                    Buka halaman ini melalui tautan reset
                    password yang dikirim ke email Kang/Teh.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="reset-form"
                >
                  <div className="pajara-form-field">
                    <label htmlFor="password">
                      Password Baru
                    </label>

                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Masukkan password baru"
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </div>

                  <div className="pajara-form-field">
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
                      placeholder="Ulangi password baru"
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </div>

                  {error && (
                    <div className="reset-error" role="alert">
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="reset-message" role="status">
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="reset-submit"
                    disabled={loading}
                  >
                    {loading
                      ? "Memperbarui..."
                      : "Simpan Password Baru"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="reset-container reset-footer">
        <img
          src={logo}
          alt="Logo Pajara Studio"
          width={43}
          height={43}
          className="reset-footer-logo"
        />

        <div className="reset-footer-copy">
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
