"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@pajara/supabase";

export default function CustomerRegister() {
const [fullName, setFullName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

async function handleRegister(
event: FormEvent<HTMLFormElement>
) {
event.preventDefault();

setError("");
setMessage("");

if (password !== confirmPassword) {
  setError("Password dan konfirmasi password tidak sama.");
  return;
}

if (password.length < 6) {
  setError("Password minimal 6 karakter.");
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
  setError(signUpError.message);
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
          Customer Register
        </p>

        <h1>
          Mulai project bersama{" "}
          <span>Pajara.</span>
        </h1>

        <p className="pajara-hero-description">
          Buat akun untuk memesan desain dan mengelola
          project Anda bersama Pajara Studio.
        </p>

        <form
          onSubmit={handleRegister}
          style={{
            maxWidth: "480px",
            marginTop: "32px",
            display: "grid",
            gap: "16px",
          }}
        >
          <input
            type="text"
            placeholder="Nama lengkap"
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
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
            type="tel"
            placeholder="Nomor WhatsApp aktif"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
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
            placeholder="Password"
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
            placeholder="Konfirmasi password"
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
            {loading ? "Membuat akun..." : "Buat Akun"}
          </button>
        </form>

        <p
          style={{
            marginTop: "24px",
            color: "#6f6f6f",
          }}
        >
          Sudah punya akun?{" "}
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
