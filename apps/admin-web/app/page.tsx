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
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ color: "#214d32" }}>
        Pajara Admin Test
      </h1>

      <p style={{ color: "#555" }}>
        Tes apakah tombol JavaScript bisa bekerja.
      </p>

      <button
        type="button"
        onClick={() => setClicked(true)}
        style={{
          display: "block",
          width: "100%",
          maxWidth: "400px",
          height: "60px",
          marginTop: "30px",
          padding: "0 20px",
          background: "#2f6b45",
          color: "#ffffff",
          border: "0",
          borderRadius: "12px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer",
          touchAction: "manipulation",
          position: "relative",
          zIndex: 9999,
        }}
      >
        TEKAN SAYA
      </button>

      {clicked && (
        <p
          style={{
            marginTop: "25px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#2f6b45",
          }}
        >
          ✅ JAVASCRIPT BERHASIL!
        </p>
      )}
    </main>
  );
}
