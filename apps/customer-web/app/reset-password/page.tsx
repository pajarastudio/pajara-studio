"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@pajara/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
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
        "Gagal mengubah password. Silakan buka kembali link reset dari email."
      );
      return;
    }

    setMessage(
      "Password berhasil diubah. Anda akan diarahkan ke halaman login."
    );

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-brand-mark">P</span>
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
                style={{
                  minHeight: "50px",
                  padding: "0 16px",
                  border: "1px solid #e7e2d9",
                  borderRadius: "12px",
                  background: "#ffffff",
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
                style={{
                  minHeight: "50px",
                  padding: "0 16px",
                  border: "1px solid #e7e2d9",
                  borderRadius: "12px",
                  background: "#ffffff",
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
            </form>

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
