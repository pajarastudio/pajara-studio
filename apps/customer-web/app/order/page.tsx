export default function CreateOrder() {
  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-brand-mark">P</span>
            <span>Pajara Studio</span>
          </a>

          <nav className="pajara-nav">
            <a href="/dashboard">Dashboard</a>

            <a href="/" className="pajara-nav-cta">
              Website
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-order">
        <div className="pajara-container">
          <div className="pajara-order-header">
            <p className="pajara-eyebrow">
              Pesan Desain
            </p>

            <h1>
              Mulai project bersama{" "}
              <span>Pajara.</span>
            </h1>

            <p>
              Isi brief berikut dengan informasi yang
              jelas agar Pajara dapat memahami kebutuhan
              desain Anda.
            </p>
          </div>

          <form className="pajara-order-form">
            <div className="pajara-form-section">
              <div className="pajara-form-section-heading">
                <span>01</span>

                <div>
                  <h2>Detail Pesanan</h2>
                  <p>
                    Tentukan layanan dan kebutuhan utama
                    project Anda.
                  </p>
                </div>
              </div>

              <div className="pajara-form-grid">
                <div className="pajara-form-field">
                  <label htmlFor="service">
                    Layanan
                  </label>

                  <select
                    id="service"
                    name="service"
                    required
                  >
                    <option value="">
                      Pilih layanan
                    </option>

                    <option value="logo">
                      Logo & Branding
                    </option>

                    <option value="promosi">
                      Desain Promosi
                    </option>

                    <option value="social-media">
                      Social Media
                    </option>

                    <option value="banner">
                      Banner
                    </option>

                    <option value="kemasan-menu">
                      Kemasan & Menu
                    </option>
                  </select>
                </div>

                <div className="pajara-form-field">
                  <label htmlFor="design-type">
                    Jenis Desain
                  </label>

                  <input
                    id="design-type"
                    name="design-type"
                    type="text"
                    placeholder="Contoh: Feed Instagram"
                    required
                  />
                </div>

                <div className="pajara-form-field">
                  <label htmlFor="quantity">
                    Jumlah Desain
                  </label>

                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    defaultValue="1"
                    required
                  />
                </div>

                <div className="pajara-form-field">
                  <label htmlFor="deadline">
                    Deadline / Target Selesai
                  </label>

                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                  />
                </div>
              </div>
            </div>

            <div className="pajara-form-section">
              <div className="pajara-form-section-heading">
                <span>02</span>

                <div>
                  <h2>Brief Desain</h2>
                  <p>
                    Jelaskan konsep dan informasi yang
                    perlu diketahui Pajara.
                  </p>
                </div>
              </div>

              <div className="pajara-form-field">
                <label htmlFor="brief">
                  Brief Desain
                </label>

                <textarea
                  id="brief"
                  name="brief"
                  rows={7}
                  placeholder="Jelaskan kebutuhan desain, isi teks, ukuran, konsep, target audiens, dan informasi penting lainnya."
                  required
                />
              </div>

              <div className="pajara-form-field">
                <label htmlFor="notes">
                  Catatan Tambahan
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows={5}
                  placeholder="Tambahkan catatan atau permintaan khusus jika ada."
                />
              </div>
            </div>

            <div className="pajara-form-section">
              <div className="pajara-form-section-heading">
                <span>03</span>

                <div>
                  <h2>Referensi</h2>
                  <p>
                    Tambahkan contoh visual jika tersedia.
                  </p>
                </div>
              </div>

              <div className="pajara-form-field">
                <label htmlFor="reference">
                  Referensi Desain
                </label>

                <input
                  id="reference"
                  name="reference"
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                />

                <p className="pajara-form-help">
                  Upload referensi atau contoh desain yang
                  dapat membantu menjelaskan kebutuhan Anda.
                </p>
              </div>
            </div>

            <div className="pajara-form-section">
              <div className="pajara-form-section-heading">
                <span>04</span>

                <div>
                  <h2>Pembayaran</h2>
                  <p>
                    Pilih skema pembayaran untuk project
                    Anda.
                  </p>
                </div>
              </div>

              <div className="pajara-form-field">
                <label htmlFor="payment-type">
                  Pembayaran
                </label>

                <select
                  id="payment-type"
                  name="payment-type"
                  required
                >
                  <option value="">
                    Pilih metode pembayaran
                  </option>

                  <option value="dp">
                    DP
                  </option>

                  <option value="full">
                    Full / Lunas
                  </option>
                </select>
              </div>
            </div>

            <div className="pajara-order-submit">
              <div>
                <strong>Siap mengirim pesanan?</strong>

                <p>
                  Pastikan informasi yang Anda masukkan
                  sudah sesuai sebelum dikirim.
                </p>
              </div>

              <button
                type="submit"
                className="pajara-button pajara-button-primary"
              >
                Kirim Pesanan
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
