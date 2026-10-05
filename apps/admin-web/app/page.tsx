"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function AdminHome() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

    const { data: profile, error: profileError } = await supabase
      .from("profiles_v2")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setLoading(false);

    if (profileError || profile?.role !== "admin") {
      await supabase.auth.signOut();
      setMessage("Akun ini tidak memiliki akses admin.");
      return;
    }

    setMessage("Login admin berhasil. Dashboard siap.");
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
          Masuk untuk mengelola pesanan dan operasional Pajara Studio.
        </p>

        <input
          type="email"
          placeholder="Email admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            if (e.key === "Enter") handleLogin();
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
          <p
            style={{
              marginTop: 18,
              color: message.includes("berhasil") ? "#2f6b45" : "#a33",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
