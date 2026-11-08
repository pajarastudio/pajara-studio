
import Link from "next/link";

export const metadata = {
  title: "Ketentuan Layanan | Pajara Studio",
  description:
    "Pelajari ketentuan penggunaan layanan desain dan pemesanan di Pajara Studio.",
};

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

const terms = [
  {
    number: "01",
    title: "Ruang Lingkup Layanan",
    content:
      "Pajara Studio menyediakan layanan desain grafis yang mencakup logo dan branding, desain promosi, social media, banner, kemasan, serta menu. Setiap layanan dikerjakan berdasarkan kebutuhan dan kesepakatan antara Pajara Studio dan pelanggan.",
  },
  {
    number: "02",
    title: "Brief dan Proses Pengerjaan",
    content:
      "Pengerjaan desain dilakukan berdasarkan brief, informasi, dan referensi yang diberikan pelanggan melalui proses pemesanan. Pelanggan diharapkan memberikan informasi yang jelas dan sesuai kebutuhan. Perubahan besar pada brief setelah pengerjaan dimulai dapat memengaruhi waktu dan biaya pengerjaan.",
  },
  {
    number: "03",
    title: "Revisi Desain",
    content:
      "Revisi diberikan sesuai jumlah dan ketentuan yang berlaku pada layanan atau paket yang dipilih. Permintaan perubahan di luar ketentuan revisi dapat dikenakan biaya tambahan setelah dikomunikasikan dan disetujui oleh pelanggan.",
  },
  {
    number: "04",
    title: "Pembayaran",
    content:
      "Ketentuan pembayaran mengikuti jenis layanan dan kesepakatan pada setiap pesanan. Untuk layanan desain satuan, pembayaran dilakukan dengan uang muka sebesar 50% sebelum pengerjaan dimulai dan pelunasan sebelum file final diberikan. Untuk paket tertentu, pembayaran dapat diwajibkan secara penuh di awal sesuai informasi pemesanan.",
  },
  {
    number: "05",
    title: "File Final dan Hasil Desain",
    content:
      "File final diberikan setelah proses pengerjaan selesai dan kewajiban pembayaran telah dipenuhi. Format serta jenis file yang diterima mengikuti layanan dan kesepakatan pemesanan. File pratinjau atau desain ber-watermark bukan merupakan file final.",
  },
  {
    number: "06",
    title: "Portofolio",
    content:
      "Pajara Studio dapat menggunakan hasil desain sebagai bagian dari portofolio atau materi promosi dengan memperhatikan izin pelanggan dan kesepakatan yang berlaku. Permintaan khusus terkait publikasi hasil desain dapat disampaikan sebelum atau selama proses pemesanan.",
  },
  {
    number: "07",
    title: "Perubahan dan Pembatalan Pesanan",
    content:
      "Permintaan perubahan atau pembatalan pesanan perlu dikomunikasikan kepada Pajara Studio. Penanganannya mempertimbangkan tahap pengerjaan, pekerjaan yang telah dilakukan, serta kesepakatan antara kedua pihak.",
  },
  {
    number: "08",
    title: "Perubahan Ketentuan",
    content:
      "Pajara Studio dapat memperbarui ketentuan layanan apabila terdapat perubahan pada layanan, proses operasional, atau kebutuhan lainnya. Ketentuan terbaru akan ditampilkan melalui halaman ini.",
  },
  {
    number: "09",
    title: "Kontak",
    content:
      "Apabila terdapat pertanyaan atau hal yang belum dipahami mengenai ketentuan layanan, Kang/Teh dapat menghubungi Pajara Studio melalui kanal kontak yang tersedia di website.",
  },
];

export default function TermsPage() {
  return (
    <main className="pajara-site pajara-legal-page">
      <nav className="pajara-nav" aria-label="Navigasi halaman">
        <div className="pajara-container pajara-navbar-inner">
          <Link href="/" className="pajara-brand">
            <img
              src={logo}
              alt="Logo Pajara Studio"
              className="pajara-logo pajara-navbar-logo-mark"
              style={{
                display: "block",
                objectFit: "contain",
                maxWidth: "100%",
              }}
            />
            <span className="pajara-brand-name">Pajara Studio</span>
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
              Ketentuan
              <br />
              <span>Layanan.</span>
            </h1>

            <p>
              Setiap perjalanan kreatif dimulai dengan kesepahaman.
              Halaman ini menjelaskan ketentuan dasar penggunaan
              layanan desain Pajara Studio.
            </p>

            <div className="pajara-legal-meta">
              <span>INFORMASI LAYANAN</span>
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

              {terms.map((term) => (
                <a
                  key={term.number}
                  href={`#ketentuan-${term.number}`}
                >
                  {term.title}
                </a>
              ))}

              <div className="pajara-legal-sidebar-note">
                <span>PAJARA STUDIO</span>
                <strong>Berakar di Tanah Pasundan.</strong>
              </div>
            </aside>

            <article className="pajara-legal-document">
              <div className="pajara-legal-intro">
                <span className="pajara-eyebrow">PENGANTAR</span>
                <h2>Membangun kerja sama dengan kesepahaman.</h2>
                <p>
                  Dengan menggunakan layanan Pajara Studio, Kang dan Teh
                  diharapkan memahami ketentuan yang berlaku. Ketentuan ini
                  dibuat untuk membantu proses kerja sama berjalan lebih
                  jelas, nyaman, dan terarah.
                </p>
              </div>

              {terms.map((term) => (
                <section
                  key={term.number}
                  id={`ketentuan-${term.number}`}
                  className="pajara-legal-item"
                >
                  <span className="pajara-legal-number">
                    {term.number}
                  </span>

                  <div>
                    <h2>{term.title}</h2>
                    <p>{term.content}</p>
                  </div>
                </section>
              ))}

              <div className="pajara-legal-closing">
                <span>PAJARA STUDIO</span>
                <p>Desain yang punya arah.</p>
              </div>
            </article>
          </div>

          <div className="pajara-legal-back-card">
            <div>
              <span className="pajara-legal-back-kicker">
                PAJARA STUDIO
              </span>
              <h2>Kembali menjelajahi Pajara.</h2>
              <p>
                Lanjutkan perjalananmu dan temukan informasi lainnya
                melalui halaman utama Pajara Studio.
              </p>
            </div>

            <Link href="/" className="pajara-legal-back-button">
              <span aria-hidden="true">←</span>
              Kembali ke Beranda
            </Link>
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
            <Link href="/privacy-policy">Kebijakan Privasi</Link>
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
