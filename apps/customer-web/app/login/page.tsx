"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@pajara/supabase";

export default function CustomerLogin() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function handleLogin(
event: FormEvent<HTMLFormElement>
) {
event.preventDefault();

setError("");
setLoading(true);

const { error: loginError } =
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

setLoading(false);

if (loginError) {
  setError(
    "Email atau password salah. Silakan periksa kembali."
  );
  return;
}

router.push("/dashboard");

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
          Customer Login
        </p>

        <h1>
          Selamat datang kembali di{" "}
          <span>Pajara.</span>
        </h1>

        <p className="pajara-hero-description">
          Login untuk melihat pesanan, pembayaran,
          revisi, dan file desain Anda.
        </p>

        <form
          onSubmit={handleLogin}
          style={{
            maxWidth: "480px",
            marginTop: "32px",
            display: "grid",
            gap: "16px",
          }}
        >
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

          <button
            type="submit"
            className="pajara-button pajara-button-primary"
            disabled={loading}
            style={{
              border: "none",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Login..." : "Login"}
          </button>
        </form>

        <p
          style={{
            marginTop: "24px",
            color: "#6f6f6f",
          }}
        >
          Belum punya akun?{" "}
          <a
            href="/register"
            style={{
              color: "#2f6b45",
              fontWeight: 700,
            }}
          >
            Buat akun
          </a>
        </p>
      </div>
    </div>
  </section>
</main>

);
}
