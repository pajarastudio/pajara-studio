"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setMessage(
          "Sesi reset password tidak ditemukan. Silakan minta link reset password baru."
        );
        return;
      }

      setReady(true);
    }

    checkSession();
  }, []);

  async function handleUpdatePassword() {
    if (!password || !confirmPassword) {
      setMessage("Password baru dan konfirmasi wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setLoading(false);
      setMessage("Gagal mengubah password: " + error.message);
      return;
    }

    await supabase.auth.signOut();

    setLoading(false);
    setMessage("Password berhasil dibuat. Mengarahkan ke halaman login...");

    setTimeout(() => {
      router.push("/");
    }, 1500);
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
            Buat Password Baru
          </p>
        </div>

        {!ready ? (
          <p
            style={{
              textAlign: "center",
              color: "#214d32",
              lineHeight: "1.5",
            }}
          >
            Memeriksa sesi reset password...
          </p>
        ) : (
          <>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#214d32",
                fontWeight: "bold",
              }}
            >
              Password Baru
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password baru"
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
              Konfirmasi Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              style={{
                width: "100%",
                height: "50px",
                padding: "0 14px",
                marginBottom: "20px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                boxSizing: "border-box",
                fontSize: "16px",
              }}
            />

            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={loading}
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
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
          </>
        )}

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
