"use client";

import { useState } from "react";

export default function AdminHome() {
  const [clicked, setClicked] = useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#f7f4ee",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#214d32" }}>
        PAJARA STUDIO
      </h1>

      <p>Tes JavaScript Admin.</p>

      <button
        type="button"
        onClick={() => setClicked(true)}
        style={{
          width: "100%",
          maxWidth: "400px",
          height: "60px",
          background: "#2f6b45",
          color: "#ffffff",
          border: "none",
          borderRadius: "12px",
          fontSize: "18px",
          fontWeight: "bold",
          touchAction: "manipulation",
        }}
      >
        TEKAN SAYA
      </button>

      {clicked && (
        <p
          style={{
            marginTop: "20px",
            color: "#214d32",
            fontWeight: "bold",
          }}
        >
          ✅ JAVASCRIPT BERHASIL!
        </p>
      )}
    </main>
  );
}
