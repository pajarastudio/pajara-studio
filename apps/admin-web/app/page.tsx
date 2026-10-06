"use client";

import { useEffect, useState } from "react";

export default function AdminHome() {
  const [status, setStatus] = useState("JavaScript belum terdeteksi");

  useEffect(() => {
    setStatus("✅ JAVASCRIPT REACT BERJALAN");
  }, []);

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

      <h2 style={{ color: "#2f6b45" }}>
        {status}
      </h2>

      <p>
        Tes apakah JavaScript React aktif.
      </p>
    </main>
  );
}
