export default function AdminHome() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
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

        <h1 style={{ color: "#214d32", fontSize: 32 }}>
          Admin Dashboard
        </h1>

        <p style={{ color: "#666" }}>
          Kelola pesanan dan operasional Pajara Studio.
        </p>

        <section
          style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: 24,
            marginTop: 30,
            border: "1px solid #e8e2d8",
          }}
        >
          <h2 style={{ color: "#214d32" }}>
            Selamat datang di Pajara Admin
          </h2>

          <p style={{ color: "#666" }}>
            Dashboard admin sedang disiapkan.
          </p>
        </section>
      </div>
    </main>
  );
}
