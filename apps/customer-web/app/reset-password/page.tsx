
"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@pajara/supabase";
import "./reset-password.css";

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
