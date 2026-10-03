type RevisionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderRevision({
  params,
}: RevisionPageProps) {
  const { id } = await params;

  return (
    <main>
      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <span className="pajara-brand-mark">P</span>
            <span>Pajara Studio</span>
          </a>

          <nav className="pajara-nav">
            <a href={`/orders/${id}`}>
              Detail Pesanan
            </a>

            <a href="/dashboard" className="pajara-nav-cta">
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-services">
        <div className="pajara-container">
          <p className="pajara-eyebrow">
            Revisi
          </p>

          <h1>
            Revisi Pesanan <span>#{id}</span>
          </h1>

          <p className="pajara-section-description">
            Sampaikan perubahan yang diperlukan pada desain
            melalui halaman ini.
          </p>

          <section
            style={{
              marginTop: "48px",
              maxWidth: "760px",
            }}
          >
            <p className="pajara-eyebrow">
              Riwayat
            </p>

            <h2>Riwayat Revisi</h2>

            <article
              className="pajara-service-card"
              style={{
               
