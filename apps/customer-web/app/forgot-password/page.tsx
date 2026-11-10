
"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@pajara/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage(
        "Link reset password sudah dikirim ke email Anda. Silakan cek inbox atau folder spam."
      );
    } catch {
      setError(
        "Terjadi kesalahan. Silakan coba kembali beberapa saat lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-page">
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
            <a href="/login" className="pajara-nav-cta">
              Login
            </a>
          </nav>
        </div>
      </header>

      <section className="forgot-section">
        <div className="pajara-container">
          <div className="forgot-wrapper">
            <div className="forgot-card">
              <div className="forgot-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="27"
                  height="27"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="11"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v3" />
                </svg>
              </div>

              <p className="forgot-eyebrow">
                KEAMANAN AKUN
              </p>

              <h1 className="forgot-title">
                Lupa Password
                <span>Pajara.</span>
              </h1>

              <p className="forgot-description">
                Jangan khawatir, Kang/Teh. Masukkan
                email yang terdaftar di Pajara Studio.
                Kami akan mengirimkan tautan untuk
                membuat password baru.
              </p>

              <form
                onSubmit={handleSubmit}
                className="forgot-form"
              >
                <div className="pajara-form-field">
                  <label htmlFor="forgot-email">
                    Alamat Email
                  </label>

                  <input
                    id="forgot-email"
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

                {error && (
                  <div
                    className="forgot-alert forgot-alert-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {message && (
                  <div
                    className="forgot-alert forgot-alert-success"
                    role="status"
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="pajara-button pajara-button-primary forgot-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="forgot-spinner" />
                      Mengirim Tautan...
                    </>
                  ) : (
                    "Kirim Link Reset Password"
                  )}
                </button>
              </form>

              <div className="forgot-divider" />

              <a
                href="/login"
                className="forgot-back"
              >
                <span aria-hidden="true">←</span>
                Kembali ke Login
              </a>
            </div>

            <p className="forgot-footer">
              PAJARA STUDIO
              <span>DESAIN YANG PUNYA ARAH.</span>
            </p>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .forgot-page {
          min-height: 100vh;
          background: var(--cream);
        }

        .forgot-section {
          min-height: calc(100svh - 80px);
          display: flex;
          align-items: center;
          padding: 48px 0;
        }

        .forgot-wrapper {
          width: 100%;
          max-width: 460px;
          margin: 0 auto;
        }

        .forgot-card {
          padding: 36px;
          border: 1px solid rgba(33, 77, 50, 0.11);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 18px 55px rgba(33, 77, 50, 0.055);
        }

        .forgot-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          border: 1px solid rgba(47, 107, 69, 0.13);
          border-radius: 17px;
          background: rgba(47, 107, 69, 0.07);
          color: var(--green);
        }

        .forgot-eyebrow {
          margin: 0 0 12px;
          color: var(--brown);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.2px;
        }

        .forgot-title {
          margin: 0;
          color: var(--text);
          font-family: Georgia, serif;
          font-size: clamp(29px, 6vw, 37px);
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -1px;
        }

        .forgot-title span {
          display: block;
          color: var(--green);
        }

        .forgot-description {
          margin: 15px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.8;
        }

        .forgot-form {
          display: grid;
          gap: 18px;
          margin-top: 30px;
        }

        .forgot-submit {
          width: 100%;
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 2px;
        }

        .forgot-submit:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .forgot-alert {
          padding: 13px 15px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.7;
        }

        .forgot-alert-error {
          border: 1px solid rgba(160, 50, 50, 0.15);
          background: rgba(160, 50, 50, 0.06);
          color: #8b3030;
        }

        .forgot-alert-success {
          border: 1px solid var(--line);
          background: rgba(47, 107, 69, 0.07);
          color: var(--green-dark);
        }

        .forgot-spinner {
          width: 17px;
          height: 17px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: forgotSpin 0.7s linear infinite;
        }

        .forgot-divider {
          height: 1px;
          margin: 26px 0 20px;
          background: var(--line);
        }

        .forgot-back {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: var(--green);
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .forgot-back:hover {
          opacity: 0.7;
        }

        .forgot-back span {
          font-size: 18px;
        }

        .forgot-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin: 23px 0 0;
          color: var(--green-dark);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .forgot-footer span {
          color: var(--brown);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 1.5px;
        }

        @keyframes forgotSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 600px) {
          .forgot-section {
            min-height: calc(100svh - 80px);
            padding: 32px 0;
          }

          .forgot-wrapper {
            max-width: 440px;
          }

          .forgot-card {
            padding: 27px 23px;
            border-radius: 21px;
          }

          .forgot-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 21px;
          }

          .forgot-description {
            font-size: 13px;
          }

          .forgot-form {
            margin-top: 25px;
            gap: 16px;
          }

          .forgot-divider {
            margin-top: 23px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .forgot-spinner {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
