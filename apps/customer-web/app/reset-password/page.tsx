
"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@pajara/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [ready, setReady] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setReady(true);
        setCheckingSession(false);
        setError("");
      }
    });

    const checkSession = async () => {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      if (data.session) {
        setReady(true);
      } else if (sessionError) {
        setError("Sesi pemulihan tidak dapat diperiksa. Silakan buka kembali link dari email.");
      }

      setCheckingSession(false);
    };

    checkSession();

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

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setPassword("");
      setConfirmPassword("");

      setMessage(
        "Password berhasil diperbarui. Silakan login kembali menggunakan password baru."
      );
    } catch {
      setError(
        "Terjadi kesalahan saat memperbarui password. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
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

      <section
        style={{
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          alignItems: "center",
          padding: "64px 0",
        }}
      >
        <div className="pajara-container">
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                KEAMANAN AKUN
              </p>

              <h1>
                Reset Password <span>Pajara.</span>
              </h1>

              <p
                style={{
                  marginTop: "12px",
                  color: "var(--muted)",
                  fontSize: "14px",
                  lineHeight: 1.8,
                }}
              >
                Perbarui password akun Kang/Teh untuk
                menjaga keamanan dan akses ke layanan
                Pajara Studio.
              </p>

              {checkingSession ? (
                <div
                  style={{
                    marginTop: "28px",
                    padding: "22px",
                    borderRadius: "16px",
                    border: "1px solid var(--line)",
                    background: "rgba(47, 107, 69, 0.04)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      margin: "0 auto 14px",
                      border: "3px solid rgba(47, 107, 69, 0.15)",
                      borderTopColor: "var(--green)",
                      borderRadius: "50%",
                      animation: "pajaraResetSpin 0.8s linear infinite",
                    }}
                  />

                  <strong style={{ color: "var(--green-dark)" }}>
                    Memeriksa Sesi
                  </strong>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "var(--muted)",
                      fontSize: "13px",
                      lineHeight: 1.7,
                    }}
                  >
                    Mohon tunggu, kami sedang memeriksa
                    akses pemulihan akun Kang/Teh.
                  </p>
                </div>
              ) : !ready ? (
                <div
                  style={{
                    marginTop: "28px",
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid rgba(160, 50, 50, 0.15)",
                    background: "rgba(160, 50, 50, 0.05)",
                  }}
                >
                  <strong style={{ color: "#8b3030" }}>
                    Sesi Pemulihan Tidak Ditemukan
                  </strong>

                  <p
                    style={{
                      margin: "9px 0 0",
                      color: "var(--muted)",
                      fontSize: "13px",
                      lineHeight: 1.8,
                    }}
                  >
                    {error ||
                      "Silakan buka halaman ini melalui link reset password yang dikirim ke email Kang/Teh."}
                  </p>

                  <a
                    href="/forgot-password"
                    className="pajara-button pajara-button-primary"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "18px",
                      textDecoration: "none",
                    }}
                  >
                    Minta Link Reset Baru
                  </a>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  style={{
                    display: "grid",
                    gap: "18px",
                    marginTop: "28px",
                  }}
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
                    <div
                      role="alert"
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        background: "rgba(160, 50, 50, 0.07)",
                        border: "1px solid rgba(160, 50, 50, 0.15)",
                        color: "#8b3030",
                        fontSize: "13px",
                        lineHeight: 1.7,
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {message && (
                    <div
                      role="status"
                      style={{
                        padding: "14px 16px",
                        borderRadius: "12px",
                        background: "rgba(47, 107, 69, 0.07)",
                        border: "1px solid var(--line)",
                        color: "var(--green-dark)",
                        fontSize: "13px",
                        lineHeight: 1.7,
                      }}
                    >
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="pajara-button pajara-button-primary"
                    disabled={loading}
                    style={{
                      width: "100%",
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "wait" : "pointer",
                    }}
                  >
                    {loading
                      ? "Memperbarui Password..."
                      : "Simpan Password Baru"}
                  </button>
                </form>
              )}

              <div
                style={{
                  marginTop: "26px",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--line)",
                }}
              >
                <a
                  href="/login"
                  style={{
                    color: "var(--green)",
                    fontSize: "14px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  ← Kembali ke Login
                </a>
              </div>
            </div>

            <p
              style={{
                marginTop: "20px",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: "11px",
                letterSpacing: "1.5px",
                fontWeight: 600,
              }}
            >
              DESAIN YANG PUNYA ARAH.
            </p>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes pajaraResetSpin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
