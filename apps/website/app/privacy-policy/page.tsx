
import Link from "next/link";

export const metadata = {
  title: "Kebijakan Privasi | Pajara Studio",
  description:
    "Pelajari bagaimana Pajara Studio mengelola dan menjaga informasi pengunjung serta pelanggan.",
};

const policies = [
  {
    number: "01",
    title: "Informasi yang Dikumpulkan",
    content:
      "Website Pajara Studio pada dasarnya hanya menggunakan informasi yang diberikan secara sukarela oleh pengunjung ketika menghubungi atau menggunakan layanan Pajara Studio.",
  },
  {
    number: "02",
    title: "Penggunaan Informasi",
    content:
      "Informasi yang diberikan dapat digunakan untuk merespons pertanyaan, memproses permintaan desain, berkomunikasi dengan pelanggan, dan menjalankan layanan Pajara Studio.",
  },
  {
    number: "03",
    title: "Keamanan Informasi",
    content:
      "Pajara Studio berupaya menjaga informasi yang diberikan pelanggan agar digunakan secara wajar dan sesuai kebutuhan layanan.",
  },
  {
    number: "04",
    title: "Perubahan Kebijakan",
    content:
      "Kebijakan ini dapat diperbarui apabila terdapat perubahan pada layanan, teknologi, atau kebutuhan operasional Pajara Studio.",
  },
  {
    number: "05",
    title: "Kontak",
    content:
      "Untuk pertanyaan mengenai privasi, Kang/Teh dapat menghubungi Pajara Studio melalui kanal kontak yang tersedia di website.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="pajara-site pajara-legal-page">
      <nav className="pajara-nav" aria-label="Navigasi halaman">
        <div className="pajara-container pajara-navbar-inner">
          <Link href="/" className="pajara-brand">
            <span className="pajara-brand-name">Pajara Studio</span>
          </Link>

          <Link href="/" className="pajara-legal-back">
            <span aria-hidden="true">←</span>
            Kembali ke Beranda
          </Link>
        </div>
      </nav>

      <section className="pajara-legal-hero">
        <div className="pajara-container">
          <div className="pajara-legal-hero-inner">
            <span className="pajara-eyebrow">
              PAJARA STUDIO / INFORMASI
            </span>

            <h1>
              Kebijakan
              <br />
              <span>Privasi.</span>
            </h1>

            <p>
              Privasi dan kepercayaan merupakan bagian penting
              dari perjalanan kita. Halaman ini menjelaskan
              bagaimana informasi pengunjung dan pelanggan
              dikelola oleh Pajara Studio.
            </p>

            <div className="pajara-legal-meta">
              <span>INFORMASI PENGUNJUNG</span>
              <span>PAJARA STUDIO</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pajara-section pajara-legal-content-section">
        <div className="pajara-container">
          <div className="pajara-legal-layout">
            <aside className="pajara-legal-sidebar">
              <span className="pajara-legal-sidebar-label">
                DALAM HALAMAN INI
              </span>

              <a href="#informasi-01">Informasi yang Dikumpulkan</a>
              <a href="#informasi-02">Penggunaan Informasi</a>
              <a href="#informasi-03">Keamanan Informasi</a>
              <a href="#informasi-04">Perubahan Kebijakan</a>
              <a href="#informasi-05">Kontak</a>

              <div className="pajara-legal-sidebar-note">
                <span>PAJARA STUDIO</span>
                <strong>Berakar di Tanah Pasundan.</strong>
              </div>
            </aside>

            <article className="pajara-legal-document">
              <div className="pajara-legal-intro">
                <span className="pajara-eyebrow">PENGANTAR</span>
                <h2>Menjaga kepercayaan, menghargai privasi.</h2>
                <p>
                  Pajara Studio menghargai privasi setiap Kang dan Teh
                  yang mengunjungi website ini. Kami berupaya mengelola
                  informasi secara wajar sesuai kebutuhan layanan.
                </p>
              </div>

              {policies.map((policy) => (
                <section
                  key={policy.number}
                  id={`informasi-${policy.number}`}
                  className="pajara-legal-item"
                >
                  <span className="pajara-legal-number">
                    {policy.number}
                  </span>

                  <div>
                    <h2>{policy.title}</h2>
                    <p>{policy.content}</p>
                  </div>
                </section>
              ))}

              <div className="pajara-legal-closing">
                <span>PAJARA STUDIO</span>
                <p>Desain yang punya arah.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="pajara-legal-footer">
        <div className="pajara-container pajara-legal-footer-inner">
          <div>
            <strong>Pajara Studio</strong>
            <span>Berakar di Tanah Pasundan.</span>
          </div>

          <div className="pajara-legal-footer-links">
            <Link href="/terms">Ketentuan Layanan</Link>
            <Link href="/">Beranda</Link>
          </div>

          <span className="pajara-legal-copyright">
            © 2026 Pajara Studio.
          </span>
        </div>
      </footer>
    </main>
  );
}
