"use client";

import "./login.css";
import { FormEvent, useState } from "react";
import { supabase } from "@pajara/supabase";

const logo = "/755809946_17926162029385149_3739923509439876817_n.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError("Email atau password tidak sesuai.");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Terjadi kendala saat masuk. Silakan coba kembali.");
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <header className="login-topbar">
        <a href="/" className="login-brand">
          <img src={logo} alt="Pajara Studio" />
          <span>PAJARA STUDIO</span>
        </a>

        <nav className="login-top-links">
          <a href="/">Kembali ke Website</a>
          <a href="/register" className="login-register-link">
            Buat Akun
          </a>
        </nav>
      </header>

      <section className="login-layout">
        <div className="login-editorial">
          <div className="login-editorial-brand">
            <span className="login-brand-mark">P</span>
            <span>Pajara Studio</span>
          </div>

          <div className="login-editorial-copy">
            <p className="login-kicker">YOUR CREATIVE JOURNEY</p>

            <h1>
              Setiap karya punya <em>cerita.</em>
            </h1>

            <p>
              Selamat datang kembali di ruang perjalanan kreatif Pajara
              Studio. Lanjutkan langkah Kang/Teh bersama kami.
            </p>
          </div>

          <div className="login-editorial-bottom">
            Berakar di Tanah Pasundan.
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-form-inner">
            <p className="login-eyebrow">PAJARA CUSTOMER AREA</p>

            <h2>
              Selamat
              <br />
              datang kembali.
            </h2>

            <p className="login-intro">
              Masuk ke akun Kang/Teh untuk melanjutkan perjalanan bersama
              Pajara Studio.
            </p>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="login-field">
                <label htmlFor="login-email">Alamat Email</label>

                <input
                  id="login-email"
                  className="login-input"
                  type="email"
                  placeholder="Masukkan alamat email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="login-password">Password</label>

                <div className="login-input-wrap">
                  <input
                    id="login-password"
                    className="login-input login-password-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                  >
                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              <div className="login-forgot-row">
                <a href="/forgot-password">Lupa password?</a>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk ke Akun
                    <span className="login-submit-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>PERJALANAN KITA</span>
            </div>

            <p className="login-signup">
              Belum memiliki akun?
              <a href="/register">Daftar sekarang</a>
            </p>

            <div className="login-mobile-footer">
              Desain yang punya arah.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
