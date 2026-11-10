"use client";

import "./register.css";
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
              <label htmlFor="full-name">Nama Lengkap</label>

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
              <label htmlFor="phone">Nomor WhatsApp</label>

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
              <div className="feedback success" role="status">
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
    </main>
  );
}
