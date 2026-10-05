"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@pajara/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError(
        "Email atau password tidak sesuai."
      );
      setLoading(false);
      return;
    }

    window.location.href =
      "/dashboard";
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
              href="/register"
              className="pajara-nav-cta"
            >
              Daftar
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
            <div className="pajara-order-detail-card">
              <p className="pajara-eyebrow">
                CUSTOMER LOGIN
              </p>

              <h1>
                Masuk ke{" "}
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
                Kelola pesanan, pembayaran,
                revisi, dan file desain Anda
                dari satu tempat.
              </p>

              <form
                onSubmit={handleLogin}
                style={{
                  display: "grid",
                  gap: "18px",
                  marginTop: "28px",
                }}
              >
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
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                  }}
                >
                  <a
                    href="/forgot-password"
                    style={{
                      color:
                        "var(--green)",
                      fontSize:
                        "13px",
                      fontWeight: 700,
                    }}
                  >
                    Lupa password?
                  </a>
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
                    ? "Memproses..."
                    : "Masuk"}
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
                  Belum punya akun?{" "}
                  <a
                    href="/register"
                    style={{
                      color:
                        "var(--green)",
                      fontWeight: 700,
                    }}
                  >
                    Daftar sekarang
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
