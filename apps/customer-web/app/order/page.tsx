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

  <section className="pajara-services">
    <div className="pajara-container">
      <p className="pajara-eyebrow">
        Pesan Desain
      </p>

      <h1>
        Mulai project bersama <span>Pajara.</span>
      </h1>

      <p className="pajara-section-description">
        Isi brief berikut dengan informasi yang jelas
        agar Pajara dapat memahami kebutuhan desain Anda.
      </p>

      <form
        style={{
          maxWidth: "760px",
          marginTop: "40px",
          display: "grid",
          gap: "20px",
        }}
      >
        <div>
          <label htmlFor="service">
            Layanan
          </label>

          <select
            id="service"
            name="service"
            required
            style={{
              width: "100%",
              minHeight: "50px",
              marginTop: "8px",
              padding: "0 16px",
              border: "1px solid #e7e2d9",
              borderRadius: "12px",
              background: "#ffffff",
            }}
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

        <div>
          <label htmlFor="design-type">
            Jenis Desain
          </label>

          <input
            id="design-type"
            name="design-type"
            type="text"
            placeholder="Contoh: Feed Instagram"
            required
            style={{
              width: "100%",
              minHeight: "50px",
              marginTop: "8px",
              padding: "0 16px",
              border: "1px solid #e7e2d9",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          />
        </div>

        <div>
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
            style={{
              width: "100%",
              minHeight: "50px",
              marginTop: "8px",
              padding: "0 16px",
              border: "1px solid #e7e2d9",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          />
        </div>

        <div>
          <label htmlFor="brief">
            Brief Desain
          </label>

          <textarea
            id="brief"
            name="brief"
            rows={7}
            placeholder="Jelaskan kebutuhan desain, isi teks, ukuran, konsep, target audiens, dan informasi penting lainnya."
            required
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "16px",
              border: "1px solid #e7e2d9",
              borderRadius: "12px",
              background: "#ffffff",
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <label htmlFor="notes">
            Catatan Tambahan
          </label>

          <textarea
            id="notes"
            name="notes"
            rows={5}
            placeholder="Tambahkan catatan atau permintaan khusus jika ada."
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "16px",
              border: "1px solid #e7e2d9",
              borderRadius: "12px",
              background: "#ffffff",
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <label htmlFor="deadline">
            Deadline / Target Selesai
          </label>

          <input
            id="deadline"
            name="deadline"
            type="date"
            style={{
              width: "100%",
              minHeight: "50px",
              marginTop: "8px",
              padding: "0 16px",
              border: "1px solid #e7e2d9",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          />
        </div>

        <div>
          <label htmlFor="reference">
            Referensi Desain
          </label>

          <input
            id="reference"
            name="reference"
            type="file"
            accept="image/*,.pdf"
            multiple
            style={{
              width: "100%",
              marginTop: "8px",
            }}
          />

          <p
            style={{
              marginTop: "8px",
              color: "#6f6f6f",
              fontSize: "14px",
            }}
          >
            Upload referensi atau contoh desain yang
            dapat membantu menjelaskan kebutuhan Anda.
          </p>
        </div>

        <div>
          <label htmlFor="payment-type">
            Pembayaran
          </label>

          <select
            id="payment-type"
            name="payment-type"
            required
            style={{
              width: "100%",
              minHeight: "50px",
              marginTop: "8px",
              padding: "0 16px",
              border: "1px solid #e7e2d9",
              borderRadius: "12px",
              background: "#ffffff",
            }}
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

        <button
          type="submit"
          className="pajara-button pajara-button-primary"
        >
          Kirim Pesanan
        </button>
      </form>
    </div>
  </section>
</main>

);
  }
