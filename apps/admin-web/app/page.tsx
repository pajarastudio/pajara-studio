"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AdminHome() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin() {
    setMessage("");

    if (!email || !password) {
      setMessage("Email dan password wajib diisi.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setMessage(
        "Konfigurasi Supabase belum terbaca. Periksa Environment Variables."
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient(
        supabaseUrl,
        supabaseKey
      );

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        setMessage("Login gagal: " + error.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setMessage("Login gagal: akun tidak ditemukan.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles_v2")
          .select("role")
          .eq("id", data.user.id)
          .single();

      if (profileError) {
        await supabase.auth.signOut();
        setMessage(
          "Login berhasil, tetapi profil admin tidak ditemukan."
        );
        setLoading(false);
        return;
      }

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        setMessage(
          "Akun ini tidak memiliki akses admin."
        );
        setLoading(false);
        return;
      }

      setMessage("Login admin berhasil. Dashboard siap.");
    } catch (error) {
      console.error(error);

      setMessage(
        "Terjadi kesalahan saat menghubungkan ke Supabase."
      );
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          borderRadius: 22,
          padding: 28,
          border: "1px solid #e8e2d8",
          boxSizing: "border-box",
        }}
      >
        <p
          style={{
            color: "#8a6a4a",
            fontWeight: 700,
            letterSpacing: 1.5,
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          PAJARA STUDIO
        </p>

        <h1
          style={{
            color: "#214d32",
            fontSize: 30,
            margin: "0 0 8px",
          }}
        >
          Admin Login
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: 14,
            lineHeight: 1.5,
            marginBottom: 26,
          }}
        >
          Masuk untuk mengelola pesanan dan operasional
          Pajara Studio.
        </p>

        <input
          type="email"
          placeholder="Email admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          style={{
            width: "100%",
            height: 52,
            border: "1px solid #d8d0c4",
            borderRadius: 14,
            padding: "0 16px",
            boxSizing: "border-box",
            fontSize: 15,
            marginBottom: 14,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
          style={{
            width: "100%",
            height: 52,
            border: "1px solid #d8d0c4",
            borderRadius: 14,
            padding: "0 16px",
            boxSizing: "border-box",
            fontSize: 15,
            marginBottom: 16,
          }}
        />

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            height: 52,
            border: "none",
            borderRadius: 14,
            background: "#2f6b45",
            color: "#ffffff",
            fontSize: 15,
            fontWeight: 800,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Memproses..." : "Masuk sebagai Admin"}
        </button>

        {message && (
          <div
            style={{
              marginTop: 18,
              padding: "12px 14px",
              borderRadius: 12,
              background: "#f7f4ee",
              color: message.includes("berhasil")
                ? "#2f6b45"
                : "#8a3d32",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
