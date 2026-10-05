export default function AdminHome() {
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
        Pajara Admin
      </h1>

      <p>Tes tombol tanpa JavaScript.</p>

      <a
        href="?clicked=yes"
        style={{
          display: "block",
          width: "100%",
          maxWidth: "400px",
          height: "60px",
          lineHeight: "60px",
          textAlign: "center",
          background: "#2f6b45",
          color: "white",
          borderRadius: "12px",
          textDecoration: "none",
          fontWeight: "bold",
          fontSize: "18px",
          boxSizing: "border-box",
        }}
      >
        TEKAN SAYA
      </a>

      <p style={{ marginTop: "25px" }}>
        Kalau URL berubah menjadi <b>?clicked=yes</b>, berarti sentuhan/link normal.
      </p>
    </main>
  );
}
