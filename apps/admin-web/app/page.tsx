"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setMessage("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);
      setMessage("Login gagal: " + error.message);
      return;
    }

    if (!data.user) {
      setLoading(false);
      setMessage("Login gagal. Akun tidak ditemukan.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles_v2")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setLoading(false);
      setMessage("Profil admin tidak ditemukan.");
      return;
    }

    if (profile.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setMessage("Akun ini bukan akun admin.");
      return;
    }

    setLoading(false);
    setMessage("Login admin berhasil.");
  }

  async function handleResetPassword() {
    if (!email) {
      setMessage("Masukkan email admin terlebih dahulu.");
      return;
    }

    setResetLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo:
          "https://pajara-admin.pajarastd.workers.dev/reset-password",
      },
    );

    setResetLoading(false);

    if (error) {
      setMessage("Gagal mengirim reset password: " + error.message);
      return;
    }

    setMessage(
      "Email reset password sudah dikirim. Silakan cek Gmail Anda.",
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f7f4ee",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          padding: "32px 24px",
          borderRadius: "18px",
          boxSizing: "border-box",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1
            style={{
              margin: 0,
              color: "#214d32",
              fontSize: "28px",
            }}
          >
            PAJARA STUDIO
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#8a6a4a",
              fontSize: "15px",
            }}
          >
            Admin Login
          </p>
        </div>

        <label
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#214d32",
            fontWeight: "bold",
          }}
        >
          Email Admin
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Masukkan email admin"
          style={{
            width: "100%",
            height: "50px",
            padding: "0 14px",
            marginBottom: "18px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            boxSizing: "border-box",
            fontSize: "16px",
          }}
        />

        <label
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#214d32",
            fontWeight: "bold",
          }}
        >
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password"
          style={{
            width: "100%",
            height: "50px",
            padding: "0 14px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            boxSizing: "border-box",
            fontSize: "16px",
          }}
        />

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading || resetLoading}
          style={{
            display: "block",
            width: "100%",
            height: "54px",
            border: "none",
            borderRadius: "10px",
            background: loading ? "#8a9f91" : "#2f6b45",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          {loading ? "Memproses..." : "Masuk sebagai Admin"}
        </button>

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={loading || resetLoading}
          style={{
            display: "block",
            width: "100%",
            marginTop: "14px",
            border: "none",
            background: "transparent",
            color: "#8a6a4a",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          {resetLoading ? "Mengirim..." : "Lupa Password?"}
        </button>

        {message && (
          <p
            style={{
              marginTop: "18px",
              padding: "12px",
              borderRadius: "10px",
              background: "#f7f4ee",
              color: "#214d32",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
