import Link from "next/link";

export default function NotFound() {
  return (
    <main className="pajara-site">
      <section className="pajara-section">
        <div className="pajara-container">
          <div
            style={{
              minHeight: "70vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "80px 20px",
            }}
          >
            <div style={{ maxWidth: "620px" }}>
              <span className="pajara-eyebrow">PAJARA STUDIO</span>

              <h1
                style={{
                  fontSize: "clamp(72px, 15vw, 140px)",
                  lineHeight: 0.9,
                  margin: "24px 0",
                  color: "var(--green-dark)",
                }}
              >
                404
              </h1>

              <h2
                style={{
                  fontSize: "clamp(28px, 5vw, 48px)",
                  marginBottom: "18px",
                }}
              >
                Halaman tidak ditemukan.
              </h2>

              <p
                style={{
                  maxWidth: "480px",
                  margin: "0 auto 32px",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                Halaman yang Kang/Teh cari mungkin sudah dipindahkan atau
                alamatnya tidak sesuai.
              </p>

              <Link href="/" className="pajara-button-primary">
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
