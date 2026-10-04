import Link from "next/link";

export const metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi Pajara Studio.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="pajara-site">
      <section className="pajara-section">
        <div className="pajara-container">
          <div style={{ maxWidth: "820px", margin: "0 auto" }}>
            <span className="pajara-eyebrow">PAJARA STUDIO</span>

            <h1 style={{ marginTop: "24px", marginBottom: "24px" }}>
              Kebijakan Privasi
            </h1>

            <p
              style={{
                color: "var(--muted)",
                lineHeight: 1.8,
                marginBottom: "40px",
              }}
            >
              Pajara Studio menghargai privasi setiap Kang dan Teh yang
              mengunjungi website ini.
            </p>

            <div style={{ lineHeight: 1.8 }}>
              <h2>Informasi yang Dikumpulkan</h2>
              <p>
                Website Pajara Studio pada dasarnya hanya menggunakan informasi
                yang diberikan secara sukarela oleh pengunjung ketika
                menghubungi atau menggunakan layanan Pajara Studio.
              </p>

              <h2>Penggunaan Informasi</h2>
              <p>
                Informasi yang diberikan dapat digunakan untuk merespons
                pertanyaan, memproses permintaan desain, berkomunikasi dengan
                pelanggan, dan menjalankan layanan Pajara Studio.
              </p>

              <h2>Keamanan</h2>
              <p>
                Pajara Studio berupaya menjaga informasi yang diberikan
                pelanggan agar digunakan secara wajar dan sesuai kebutuhan
                layanan.
              </p>

              <h2>Perubahan Kebijakan</h2>
              <p>
                Kebijakan ini dapat diperbarui apabila terdapat perubahan pada
                layanan, teknologi, atau kebutuhan operasional Pajara Studio.
              </p>

              <h2>Kontak</h2>
              <p>
                Untuk pertanyaan mengenai privasi, Kang/Teh dapat menghubungi
                Pajara Studio melalui kanal kontak yang tersedia di website.
              </p>
            </div>

            <div style={{ marginTop: "48px" }}>
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
