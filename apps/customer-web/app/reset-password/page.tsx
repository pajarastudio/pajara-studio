"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@pajara/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [checkingSession, setCheckingSession] = useState(true);
  const [ready, setReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkResetSession() {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      setCheckingSession(false);

      if (sessionError || !data.session) {
        setError(
          "Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link reset baru."
        );
        setReady(false);
        return;
      }

      setReady(true);
    }

    checkResetSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          setCheckingSession(false);
          setReady(true);
          setError("");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!ready) {
      setError(
        "Sesi reset password belum siap. Silakan buka kembali link dari email."
      );
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Password dan konfirmasi password tidak sama."
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
      setError(
        `Supabase: ${updateError.message} (code: ${
          updateError.status ?? "unknown"
        })`
      );
      return;
    }

    setMessage(
      "Password berhasil diubah. Anda akan diarahkan ke halaman login."
    );

    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-brand-mark">
              P
            </span>

            <span>Pajara Studio</span>
          </a>
        </div>
      </header>

      <section className="pajara-hero">
        <div className="pajara-container">
          <div className="pajara-hero-content">
            <p className="pajara-eyebrow">
              Reset Password
            </p>

            <h1>
              Buat password baru di{" "}
              <span>Pajara.</span>
            </h1>

            <p className="pajara-hero-description">
              Masukkan password baru untuk mengamankan
              akun Customer Anda.
            </p>

            {checkingSession ? (
              <div
                style={{
                  maxWidth: "480px",
                  marginTop: "32px",
                  padding: "20px",
                  border: "1px solid var(--line)",
                  borderRadius: "16px",
                  background: "var(--white)",
                  color: "var(--muted)",
                }}
              >
                Memeriksa link reset password...
              </div>
            ) : (
              <form
                onSubmit={handleResetPassword}
                style={{
                  maxWidth: "480px",
                  marginTop: "32px",
                  display: "grid",
                  gap: "16px",
                }}
              >
                <input
                  type="password"
                  placeholder="Password baru"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  disabled={!ready || loading}
                  style={{
                    minHeight: "50px",
                    padding: "0 16px",
                    border:
                      "1px solid rgba(33, 77, 50, 0.16)",
                    borderRadius: "12px",
                    background: "#ffffff",
                    color: "#1d2a22",
                    opacity: !ready ? 0.6 : 1,
                  }}
                />

                <input
                  type="password"
                  placeholder="Konfirmasi password baru"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  required
                  disabled={!ready || loading}
                  style={{
                    minHeight: "50px",
                    padding: "0 16px",
                    border:
                      "1px solid rgba(33, 77, 50, 0.16)",
                    borderRadius: "12px",
                    background: "#ffffff",
                    color: "#1d2a22",
                    opacity: !ready ? 0.6 : 1,
                  }}
                />

                {error && (
                  <p
                    style={{
                      margin: 0,
                      color: "#b42318",
                      lineHeight: 1.5,
                    }}
                  >
                    {error}
                  </p>
                )}

                {message && (
                  <p
                    style={{
                      margin: 0,
                      color: "#2f6b45",
                      lineHeight: 1.5,
                    }}
                  >
                    {message}
                  </p>
                )}

                {ready && (
                  <button
                    type="submit"
                    className="pajara-button pajara-button-primary"
                    disabled={loading}
                    style={{
                      border: "none",
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading
                      ? "Menyimpan..."
                      : "Simpan Password Baru"}
                  </button>
                )}
              </form>
            )}

            <p
              style={{
                marginTop: "24px",
                color: "#6f6f6f",
              }}
            >
              Kembali ke{" "}
              <a
                href="/login"
                style={{
                  color: "#2f6b45",
                  fontWeight: 700,
                }}
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
