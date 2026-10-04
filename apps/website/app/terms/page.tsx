import Link from "next/link";

export const metadata = {
  title: "Ketentuan Layanan",
  description: "Ketentuan layanan Pajara Studio.",
};

export default function TermsPage() {
  return (
    <main className="pajara-site">
      <section className="pajara-section">
        <div className="pajara-container">
          <div style={{ maxWidth: "820px", margin: "0 auto" }}>
            <span className="pajara-eyebrow">PAJARA STUDIO</span>

            <h1 style={{ marginTop: "24px", marginBottom: "24px" }}>
              Ketentuan Layanan
            </h1>

            <p
              style={{
                color: "var(--muted)",
                lineHeight: 1.8,
                marginBottom: "40px",
              }}
            >
              Ketentuan dasar penggunaan layanan desain Pajara Studio.
            </p>

            <div style={{ lineHeight: 1.8 }}>
              <h2>Ruang Lingkup Layanan</h2>
              <p>
                Pajara Studio menyediakan layanan desain grafis seperti logo,
                branding, desain promosi, social media, banner, kemasan, dan
                menu sesuai kesepakatan dengan pelanggan.
              </p>

              <h2>Brief dan Proses Pengerjaan</h2>
              <p>
                Pengerjaan desain dilakukan berdasarkan brief dan informasi
                yang telah disepakati. Perubahan besar pada brief dapat
                memengaruhi waktu dan biaya pengerjaan.
              </p>

              <h2>Revisi</h2>
              <p>
                Revisi mengikuti jumlah dan ketentuan yang telah disepakati
                pada awal pemesanan.
              </p>

              <h2>Pembayaran</h2>
              <p>
                Ketentuan pembayaran, termasuk uang muka dan pelunasan,
                mengikuti kesepakatan pada setiap pesanan.
              </p>

              <h2>File Final</h2>
              <p>
                File final diberikan setelah proses pengerjaan dan pembayaran
                selesai sesuai kesepakatan.
              </p>

              <h2>Portofolio</h2>
              <p>
                Pajara Studio dapat menampilkan hasil desain sebagai portofolio
                apabila telah mendapatkan izin dari pelanggan atau sesuai
                kesepakatan yang berlaku.
              </p>

              <h2>Perubahan Ketentuan</h2>
              <p>
                Ketentuan layanan dapat diperbarui seiring perkembangan layanan
                Pajara Studio.
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
