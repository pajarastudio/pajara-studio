"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@pajara/supabase";

export default function RegisterPage() {
  const [fullName, setFullName] =
    useState("");
  const [email, setEmail] =
    useState("");
  const [phone, setPhone] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);
  const [message, setMessage] =
    useState("");
  const [error, setError] =
    useState("");

  const handleRegister = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError(
        "Password minimal 6 karakter."
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

    const { error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
          },
        },
      });

    setLoading(false);

    if (signUpError) {
      setError(
        signUpError.message
      );
      return;
    }

    setMessage(
      "Akun berhasil dibuat. Silakan cek email Anda jika verifikasi email diaktifkan."
    );

    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a
            href="/"
            className="pajara-brand"
          >
            <img
              src="/755809946_17926162029385149_3739923509439876817_n.jpg"
              alt="Pajara Studio"
              className="pajara-brand-logo"
            />

            <span>
              Pajara Studio
            </span>
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
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                CUSTOMER REGISTER
              </p>

              <h1>
                Buat akun{" "}
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
                Buat akun untuk mengelola pesanan
                dan project desain Anda.
              </p>

              <form
                onSubmit={handleRegister}
                style={{
                  display: "grid",
                  gap: "18px",
                  marginTop: "28px",
                }}
              >
                <div className="pajara-form-field">
                  <label htmlFor="full-name">
                    Nama Lengkap
                  </label>

                  <input
                    id="full-name"
                    name="full-name"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(
                        event.target.value
                      )
                    }
                    placeholder="Nama lengkap"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="pajara-form-field">
                  <label htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="nama@email.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="pajara-form-field">
                  <label htmlFor="phone">
                    Nomor Aktif
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value
                      )
                    }
                    placeholder="08xxxxxxxxxx"
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="pajara-form-field">
                  <label htmlFor="password">
                    Password
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
                    placeholder="Minimal 6 karakter"
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
                    placeholder="Ulangi password"
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
                    ? "Membuat akun..."
                    : "Buat Akun"}
                </button>
              </form>

              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "20px",
                  borderTop:
                    "1px solid var(--line)",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color:
                      "var(--muted)",
                    fontSize:
                      "14px",
                  }}
                >
                  Sudah punya akun?{" "}
                  <a
                    href="/login"
                    style={{
                      color:
                        "var(--green)",
                      fontWeight: 700,
                    }}
                  >
                    Masuk sekarang
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
