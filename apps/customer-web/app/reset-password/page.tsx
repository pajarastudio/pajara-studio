"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@pajara/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } =
        await supabase.auth.getSession();

      if (
        mounted &&
        data.session
      ) {
        setReady(true);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          setReady(true);
        }
      }
    );

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
      setError(
        "Password baru minimal 6 karakter."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Konfirmasi password tidak cocok."
      );
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
      "Password berhasil diperbarui. Silakan login kembali."
    );
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
            <a href="/">
              Website
            </a>

            <a
              href="/login"
              className="pajara-nav-cta"
            >
              Login
            </a>
          </nav>
        </div>
      </header>

      <section
        style={{
          minHeight:
            "calc(100vh - 80px)",
          display: "flex",
          alignItems: "center",
          padding:
            "64px 0",
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
            <div
              className="pajara-order-detail-card"
            >
              <p className="pajara-eyebrow">
                KEAMANAN AKUN
              </p>

              <h1>
                Reset Password{" "}
                <span>Pajara.</span>
              </h1>

              <p
                style={{
                  marginTop: "12px",
                  color: "var(--muted)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                Buat password baru untuk akun
                Pajara Studio Anda.
              </p>

              {!ready ? (
                <div
                  style={{
                    marginTop: "24px",
                    padding: "18px 20px",
                    borderRadius: "14px",
                    border:
                      "1px solid var(--line)",
                    background:
                      "rgba(47, 107, 69, 0.04)",
                  }}
                >
                  <strong
                    style={{
                      color:
                        "var(--green-dark)",
                    }}
                  >
                    Menunggu sesi pemulihan...
                  </strong>

                  <p
                    style={{
                      margin:
                        "8px 0 0",
                      color:
                        "var(--muted)",
                      fontSize: "14px",
                      lineHeight: 1.7,
                    }}
                  >
                    Buka halaman ini melalui
                    link reset password yang
                    dikirim ke email Anda.
                  </p>
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
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Masukkan password baru"
                      autoComplete="new-password"
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
                      value={
                        confirmPassword
                      }
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Ulangi password baru"
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  {error && (
                    <div
                      style={{
                        padding:
                          "14px 16px",
                        borderRadius:
                          "12px",
                        background:
                          "rgba(160, 50, 50, 0.07)",
                        border:
                          "1px solid rgba(160, 50, 50, 0.15)",
                        color:
                          "#8b3030",
                        fontSize:
                          "14px",
                        lineHeight: 1.6,
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {message && (
                    <div
                      style={{
                        padding:
                          "14px 16px",
                        borderRadius:
                          "12px",
                        background:
                          "rgba(47, 107, 69, 0.07)",
                        border:
                          "1px solid var(--line)",
                        color:
                          "var(--green-dark)",
                        fontSize:
                          "14px",
                        lineHeight: 1.6,
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
                      opacity:
                        loading ? 0.7 : 1,
                    }}
                  >
                    {loading
                      ? "Memperbarui..."
                      : "Simpan Password Baru"}
                  </button>
                </form>
              )}

              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "20px",
                  borderTop:
                    "1px solid var(--line)",
                }}
              >
                <a
                  href="/login"
                  style={{
                    color:
                      "var(--green)",
                    fontSize:
                      "14px",
                    fontWeight: 700,
                  }}
                >
                  ← Kembali ke Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
