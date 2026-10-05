"use client";

import { useState } from "react";

export default function AdminHome() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleTest() {
    setMessage("TOMBOL BERHASIL DIKLIK.");
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
          }}
        >
          PAJARA STUDIO
        </p>

        <h1
          style={{
            color: "#214d32",
            fontSize: 30,
          }}
        >
          Admin Login
        </h1>

        <p style={{ color: "#666", fontSize: 14 }}>
          Tes interaksi tombol Admin Pajara.
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
          onClick={handleTest}
          style={{
            width: "100%",
            height: 52,
            border: "none",
            borderRadius: 14,
            background: "#2f6b45",
            color: "#ffffff",
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          TES TOMBOL
        </button>

        {message && (
          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 12,
              background: "#f7f4ee",
              color: "#2f6b45",
              fontWeight: 700,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
