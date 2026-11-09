
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanedName = fullName.trim();
    const cleanedEmail = email.trim();
    const cleanedPhone = phone.trim();

    if (!cleanedName) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

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
          email: cleanedEmail,
          password,
          options: {
            data: {
              full_name: cleanedName,
              phone: cleanedPhone,
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

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
          : "Pendaftaran gagal. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <nav className="register-navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <Image
              src={LOGO}
              alt="Logo Pajara Studio"
              width={40}
              height={40}
              priority
              unoptimized
              className="navbar-logo"
            />
            <span>Pajara Studio</span>
          </Link>

          <div className="navbar-actions">
            <Link href="/" className="website-link">
              Website
            </Link>
            <Link href="/login" className="login-link">
              Login <span>↗</span>
            </Link>
          </div>
        </div>
      </nav>

      <section className="register-section">
        <div className="register-container">
          <div className="register-intro">
            <p className="eyebrow">CUSTOMER REGISTRATION</p>

            <h1>
              Mulai perjalanan
              <br />
              bersama <span>Pajara.</span>
            </h1>

            <p className="intro-description">
              Buat akun untuk mengelola pesanan, memantau
              project, dan menyimpan hasil desain Anda
              dalam satu ruang digital Pajara Studio.
            </p>
          </div>

          <div className="register-card">
            <div className="card-heading">
              <div>
                <p className="card-eyebrow">AKUN CUSTOMER</p>
                <h2>Buat Akun</h2>
                <p className="card-description">
                  Lengkapi informasi berikut untuk memulai.
                </p>
              </div>

              <div className="card-mark">
                <Image
                  src={LOGO}
                  alt="Pajara Studio"
                  width={43}
                  height={43}
                  unoptimized
                />
              </div>
            </div>

            <form onSubmit={handleRegister}>
              <div className="form-grid">
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
                  <label htmlFor="email">
                    Email
                  </label>
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
                  <span className="field-hint">
                    Gunakan nomor yang aktif agar mudah
                    dihubungi terkait pesanan.
                  </span>
                </div>

                <div className="form-field">
                  <label htmlFor="password">
                    Password
                  </label>
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
                    placeholder="Masukkan ulang password"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="feedback error-feedback" role="alert">
                  <span className="feedback-icon">!</span>
                  <p>{error}</p>
                </div>
              )}

              {message && (
                <div className="feedback success-feedback" role="status">
                  <span className="feedback-icon">✓</span>
                  <p>{message}</p>
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
                    <span>↗</span>
                  </>
                )}
              </button>
            </form>

            <div className="card-footer">
              <p>
                Sudah punya akun?{" "}
                <Link href="/login">Masuk sekarang</Link>
              </p>
            </div>
          </div>

          <div className="register-note">
            <span className="note-line" />
            <p>
              Berakar di Tanah Pasundan.
              <span> Desain yang punya arah.</span>
            </p>
            <span className="note-line" />
          </div>
        </div>
      </section>

      <footer className="page-footer">
        © 2026 Pajara Studio. All rights reserved.
      </footer>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          background: #f7f4ee;
          color: #26352a;
          font-family: "DM Sans", sans-serif;
          overflow-x: clip;
        }

        .register-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          border-bottom: 1px solid rgba(47, 107, 69, 0.1);
          background: rgba(247, 244, 238, 0.72);
          backdrop-filter: blur(22px) saturate(160%);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
        }

        .navbar-inner {
          width: 100%;
          max-width: 1120px;
          min-height: 74px;
          padding: 0 20px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-sizing: border-box;
        }

        .navbar-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
        }

        .navbar-logo {
          display: block;
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 12px;
          object-fit: cover;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .website-link {
          color: #68736a;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
        }

        .login-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 17px;
          border-radius: 11px;
          background: #2f6b45;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: background 180ms ease;
        }

        .login-link:hover {
          background: #214d32;
        }

        .register-section {
          width: 100%;
          padding: 58px 20px 55px;
          box-sizing: border-box;
        }

        .register-container {
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
        }

        .register-intro {
          margin-bottom: 27px;
          text-align: center;
        }

        .eyebrow,
        .card-eyebrow {
          margin: 0 0 11px;
          color: #8a6a4a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .register-intro h1 {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(34px, 7vw, 45px);
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -1px;
        }

        .register-intro h1 span {
          color: #8a6a4a;
        }

        .intro-description {
          max-width: 420px;
          margin: 15px auto 0;
          color: #74786f;
          font-size: 13px;
          line-height: 1.9;
        }

        .register-card {
          padding: clamp(22px, 5vw, 34px);
          border: 1px solid rgba(33, 77, 50, 0.1);
          border-radius: 23px;
          background: #fff;
          box-shadow: 0 15px 45px rgba(33, 77, 50, 0.055);
          box-sizing: border-box;
        }

        .card-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 27px;
        }

        .card-eyebrow {
          margin-bottom: 7px;
          font-size: 9px;
          letter-spacing: 1.7px;
        }

        .card-heading h2 {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 27px;
          font-weight: 600;
        }

        .card-description {
          margin: 7px 0 0;
          color: #85877f;
          font-size: 12px;
          line-height: 1.7;
        }

        .card-mark {
          width: 53px;
          height: 53px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1px solid #e8eee6;
          border-radius: 16px;
          background: #f5f7f2;
        }

        .card-mark :global(img) {
          width: 37px;
          height: 37px;
          border-radius: 10px;
          object-fit: cover;
        }

        .form-grid {
          display: grid;
          gap: 19px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .form-field label {
          color: #414b42;
          font-size: 12px;
          font-weight: 800;
        }

        .form-field input {
          width: 100%;
          min-height: 49px;
          padding: 0 15px;
          border: 1px solid #e5e2da;
          border-radius: 12px;
          outline: none;
          background: #f9f8f5;
          color: #26352a;
          font-family: inherit;
          font-size: 13px;
          box-sizing: border-box;
          transition:
            border-color 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease;
        }

        .form-field input::placeholder {
          color: #a19f96;
        }

        .form-field input:focus {
          border-color: #719778;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(47, 107, 69, 0.08);
        }

        .form-field input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .field-hint {
          color: #929187;
          font-size: 10px;
          line-height: 1.7;
        }

        .feedback {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-top: 20px;
          padding: 13px 14px;
          border-radius: 12px;
          font-size: 12px;
          line-height: 1.7;
        }

        .feedback p {
          margin: 0;
          overflow-wrap: anywhere;
        }

        .feedback-icon {
          width: 19px;
          height: 19px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 800;
        }

        .error-feedback {
          border: 1px solid rgba(161, 59, 50, 0.15);
          background: #fbf0ed;
          color: #963e34;
        }

        .error-feedback .feedback-icon {
          background: #f1dcd7;
        }

        .success-feedback {
          border: 1px solid rgba(47, 107, 69, 0.15);
          background: #eff5ed;
          color: #285b38;
        }

        .success-feedback .feedback-icon {
          background: #dcebd9;
        }

        .submit-button {
          width: 100%;
          min-height: 51px;
          margin-top: 25px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
          border-radius: 12px;
          background: #2f6b45;
          color: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition:
            background 180ms ease,
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

        .button-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 700ms linear infinite;
        }

        .card-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #eeeae3;
          text-align: center;
        }

        .card-footer p {
          margin: 0;
          color: #777b73;
          font-size: 12px;
          line-height: 1.8;
        }

        .card-footer a {
          color: #2f6b45;
          font-weight: 800;
          text-decoration: none;
        }

        .card-footer a:hover {
          text-decoration: underline;
        }

        .register-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 30px;
        }

        .register-note p {
          margin: 0;
          color: #8a6a4a;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 11px;
          text-align: center;
        }

        .register-note p span {
          color: #9a9a8e;
        }

        .note-line {
          width: 25px;
          height: 1px;
          background: #dcd4c7;
        }

        .page-footer {
          padding: 18px 20px 25px;
          border-top: 1px solid #e8e1d6;
          color: #99958b;
          font-size: 10px;
          text-align: center;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 480px) {
          .navbar-inner {
            min-height: 68px;
            padding: 0 15px;
          }

          .navbar-brand {
            gap: 8px;
            font-size: 14px;
          }

          .navbar-logo {
            width: 38px;
            height: 38px;
            min-width: 38px;
          }

          .navbar-actions {
            gap: 13px;
          }

          .website-link {
            font-size: 11px;
          }

          .login-link {
            min-height: 39px;
            padding: 0 13px;
            font-size: 11px;
          }

          .register-section {
            padding: 42px 15px 40px;
          }

          .register-intro {
            margin-bottom: 23px;
          }

          .register-card {
            border-radius: 20px;
          }
        }

        @media (max-width: 360px) {
          .navbar-inner {
            padding: 0 12px;
          }

          .navbar-brand {
            font-size: 13px;
          }

          .navbar-logo {
            width: 34px;
            height: 34px;
            min-width: 34px;
          }

          .navbar-actions {
            gap: 9px;
          }

          .website-link {
            font-size: 10px;
          }

          .login-link {
            padding: 0 11px;
            font-size: 10px;
          }

          .register-note {
            gap: 7px;
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
