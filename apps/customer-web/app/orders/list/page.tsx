"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@pajara/supabase";

type Order = {
id: string;
order_code: string;
service_name: string | null;
design_type: string | null;
quantity: number | null;
status: string | null;
deadline: string | null;
created_at: string | null;
};

const COLORS = {
green: "#2f6b45",
darkGreen: "#214d32",
brown: "#8a6a4a",
cream: "#f7f4ee",
white: "#ffffff",
text: "#243329",
muted: "#778078",
border: "rgba(33,77,50,.10)",
};

function statusLabel(status: string | null) {
const labels: Record<string, string> = {
pending: "Pesanan Baru",
waiting_dp: "Menunggu DP",
processing: "Sedang Diproses",
revision: "Dalam Revisi",
waiting_payment: "Menunggu Pelunasan",
completed: "Selesai",
cancelled: "Dibatalkan",
};

return status ? labels[status] || status : "Menunggu";
}

function statusStyle(status: string | null) {
if (status === "completed") {
return { background: "#e7f4e9", color: "#246338", dot: "#3a8950" };
}

if (status === "cancelled") {
return { background: "#fbe9e7", color: "#a33e35", dot: "#c34c43" };
}

if (status === "revision") {
return { background: "#fff1d8", color: "#94601c", dot: "#c78b2d" };
}

if (status === "waiting_payment" || status === "waiting_dp") {
return { background: "#fff3df", color: "#95621d", dot: "#c78b2d" };
}

if (status === "processing") {
return { background: "#e7efff", color: "#365c9b", dot: "#5079bb" };
}

return { background: "#edf3ed", color: "#456b4d", dot: "#6e9775" };
}

function formatDate(value: string | null) {
if (!value) return "Belum ditentukan";

const date = new Date(value);
if (Number.isNaN(date.getTime())) return "Belum ditentukan";

return date.toLocaleDateString("id-ID", {
day: "numeric",
month: "short",
year: "numeric",
});
}

function formatCount(count: number) {
return "${count} ${count === 1 ? "pesanan" : "pesanan"}";
}

export default function OrderListPage() {
const router = useRouter();
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [filter, setFilter] = useState("all");

const loadOrders = useCallback(async () => {
setLoading(true);
setError("");

try {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    setError("Sesi Anda tidak ditemukan. Silakan login kembali.");
    return;
  }

  const { data, error: queryError } = await supabase
    .from("orders")
    .select(
      "id, order_code, service_name, design_type, quantity, status, deadline, created_at"
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (queryError) {
    console.error("Gagal memuat daftar pesanan:", queryError);
    setError("Pesanan gagal dimuat. Periksa koneksi lalu coba kembali.");
    return;
  }

  setOrders((data || []) as Order[]);
} catch (err) {
  console.error("Kesalahan saat memuat pesanan:", err);
  setError("Terjadi kendala koneksi. Silakan coba kembali.");
} finally {
  setLoading(false);
}

}, []);

useEffect(() => {
let mounted = true;

async function fetchOrders() {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!mounted) return;

    if (authError || !user) {
      setError("Sesi Anda tidak ditemukan. Silakan login kembali.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("orders")
      .select(
        "id, order_code, service_name, design_type, quantity, status, deadline, created_at"
      )
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (!mounted) return;

    if (queryError) {
      console.error("Gagal memuat daftar pesanan:", queryError);
      setError("Pesanan gagal dimuat. Periksa koneksi lalu coba kembali.");
    } else {
      setOrders((data || []) as Order[]);
    }
  } catch (err) {
    if (mounted) {
      console.error("Kesalahan saat memuat pesanan:", err);
      setError("Terjadi kendala koneksi. Silakan coba kembali.");
    }
  } finally {
    if (mounted) setLoading(false);
  }
}

fetchOrders();

return () => {
  mounted = false;
};

}, []);

const activeOrders = orders.filter(
(order) => !["completed", "cancelled"].includes(order.status || "")
);

const completedOrders = orders.filter(
(order) => order.status === "completed"
);

const filteredOrders =
filter === "active"
? orders.filter(
(order) =>
!["completed", "cancelled"].includes(order.status || "")
)
: filter === "completed"
? completedOrders
: orders;

return (
<main className="order-page">
<style jsx>{`
.order-page {
min-height: 100vh;
background: ${COLORS.cream};
color: ${COLORS.text};
padding: 24px 16px 36px;
font-family: "DM Sans", Arial, sans-serif;
}

    .order-container {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
    }

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      margin-bottom: 24px;
      color: ${COLORS.green};
      border: 0;
      background: transparent;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }

    .eyebrow {
      margin: 0 0 9px;
      color: ${COLORS.brown};
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.2em;
    }

    .page-title {
      margin: 0;
      font-family: Georgia, serif;
      font-size: clamp(32px, 7vw, 43px);
      font-weight: 500;
      letter-spacing: -1.2px;
      line-height: 1.15;
    }

    .page-title span {
      color: ${COLORS.green};
      font-style: italic;
    }

    .subtitle {
      margin: 12px 0 25px;
      max-width: 450px;
      color: ${COLORS.muted};
      font-size: 13px;
      line-height: 1.8;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 27px;
    }

    .summary-card {
      min-width: 0;
      padding: 15px 12px;
      border: 1px solid ${COLORS.border};
      border-radius: 17px;
      background: ${COLORS.white};
      box-shadow: 0 5px 18px rgba(33, 77, 50, 0.035);
    }

    .summary-number {
      display: block;
      margin-bottom: 6px;
      color: ${COLORS.darkGreen};
      font-family: Georgia, serif;
      font-size: 27px;
      line-height: 1;
    }

    .summary-label {
      display: block;
      color: ${COLORS.muted};
      font-size: 10px;
      line-height: 1.5;
    }

    .section-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }

    .section-title {
      margin: 0;
      font-family: Georgia, serif;
      font-size: 23px;
      font-weight: 500;
    }

    .count-label {
      color: ${COLORS.muted};
      font-size: 11px;
    }

    .filters {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 2px 0 14px;
      scrollbar-width: none;
    }

    .filters::-webkit-scrollbar {
      display: none;
    }

    .filter-button {
      flex-shrink: 0;
      padding: 10px 15px;
      border: 1px solid ${COLORS.border};
      border-radius: 30px;
      background: ${COLORS.white};
      color: ${COLORS.muted};
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }

    .filter-button.active {
      background: ${COLORS.darkGreen};
      border-color: ${COLORS.darkGreen};
      color: white;
    }

    .order-list {
      display: grid;
      gap: 13px;
    }

    .order-card {
      display: block;
      width: 100%;
      padding: 19px;
      border: 1px solid ${COLORS.border};
      border-radius: 19px;
      background: ${COLORS.white};
      color: ${COLORS.text};
      text-align: left;
      box-shadow: 0 6px 23px rgba(33, 77, 50, 0.035);
      cursor: pointer;
      transition:
        transform 160ms ease,
        box-shadow 160ms ease;
      -webkit-tap-highlight-color: transparent;
    }

    .order-card:active {
      transform: scale(0.99);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .order-code {
      margin: 0 0 8px;
      color: ${COLORS.brown};
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.09em;
      overflow-wrap: anywhere;
    }

    .service-title {
      margin: 0 0 6px;
      font-family: Georgia, serif;
      font-size: 20px;
      font-weight: 500;
      line-height: 1.3;
      overflow-wrap: anywhere;
    }

    .design-type {
      margin: 0;
      color: ${COLORS.muted};
      font-size: 12px;
      line-height: 1.6;
    }

    .status {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      gap: 6px;
      max-width: 48%;
      padding: 8px 10px;
      border-radius: 30px;
      font-size: 10px;
      font-weight: 800;
      line-height: 1.3;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      flex-shrink: 0;
      border-radius: 50%;
    }

    .card-divider {
      height: 1px;
      margin: 17px 0 13px;
      background: ${COLORS.border};
    }

    .card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .detail-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      color: ${COLORS.muted};
      font-size: 11px;
      line-height: 1.7;
    }

    .detail-link {
      flex-shrink: 0;
      color: ${COLORS.green};
      font-size: 11px;
      font-weight: 800;
    }

    .state-card {
      padding: 30px 22px;
      border: 1px solid ${COLORS.border};
      border-radius: 20px;
      background: ${COLORS.white};
      text-align: center;
      box-shadow: 0 7px 25px rgba(33, 77, 50, 0.04);
    }

    .state-icon {
      display: grid;
      width: 56px;
      height: 56px;
      place-items: center;
      margin: 0 auto 17px;
      border-radius: 18px;
      background: #edf4ee;
      color: ${COLORS.green};
      font-size: 26px;
    }

    .state-title {
      margin: 0 0 9px;
      font-family: Georgia, serif;
      font-size: 23px;
      font-weight: 500;
    }

    .state-description {
      margin: 0 auto 19px;
      max-width: 360px;
      color: ${COLORS.muted};
      font-size: 12px;
      line-height: 1.8;
    }

    .primary-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 45px;
      padding: 0 19px;
      border: 0;
      border-radius: 13px;
      background: ${COLORS.green};
      color: white;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
    }

    .secondary-button {
      margin-top: 12px;
      padding: 10px 16px;
      border: 1px solid ${COLORS.border};
      border-radius: 12px;
      background: white;
      color: ${COLORS.green};
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .loading-line {
      height: 13px;
      margin: 12px 0;
      border-radius: 8px;
      background: #e9eee8;
      animation: pulse 1.2s ease-in-out infinite alternate;
    }

    @keyframes pulse {
      from {
        opacity: 0.5;
      }
      to {
        opacity: 1;
      }
    }

    @media (max-width: 420px) {
      .order-page {
        padding-right: 13px;
        padding-left: 13px;
      }

      .summary {
        gap: 7px;
      }

      .summary-card {
        padding: 13px 9px;
        border-radius: 14px;
      }

      .summary-number {
        font-size: 24px;
      }

      .summary-label {
        font-size: 9px;
      }

      .order-card {
        padding: 16px;
      }

      .card-top {
        flex-direction: column;
      }

      .status {
        max-width: 100%;
      }

      .card-bottom {
        align-items: flex-start;
      }

      .detail-meta {
        flex-direction: column;
        gap: 3px;
      }

      .detail-link {
        margin-top: 3px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .order-card,
      .loading-line {
        animation: none;
        transition: none;
      }
    }
  `}</style>

  <div className="order-container">
    <button
      type="button"
      className="back-button"
      onClick={() => router.push("/dashboard")}
    >
      <span aria-hidden="true">←</span> Kembali ke Beranda
    </button>

    <header>
      <p className="eyebrow">PAJARA STUDIO · CUSTOMER SPACE</p>
      <h1 className="page-title">
        Pesanan <span>Saya.</span>
      </h1>
      <p className="subtitle">
        Setiap desain punya prosesnya sendiri. Pantau perkembangan
        pesananmu dengan mudah, dari awal hingga selesai.
      </p>
    </header>

    {!loading && !error && (
      <section className="summary" aria-label="Ringkasan pesanan">
        <div className="summary-card">
          <span className="summary-number">{orders.length}</span>
          <span className="summary-label">Total Pesanan</span>
        </div>
        <div className="summary-card">
          <span className="summary-number">{activeOrders.length}</span>
          <span className="summary-label">Dalam Proses</span>
        </div>
        <div className="summary-card">
          <span className="summary-number">{completedOrders.length}</span>
          <span className="summary-label">Selesai</span>
        </div>
      </section>
    )}

    <section>
      <div className="section-heading">
        <h2 className="section-title">Daftar Pesanan</h2>
        {!loading && !error && (
          <span className="count-label">
            {formatCount(filteredOrders.length)}
          </span>
        )}
      </div>

      {!loading && !error && orders.length > 0 && (
        <div className="filters" aria-label="Filter pesanan">
          <button
            type="button"
            className={`filter-button ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
          >
            Semua
          </button>
          <button
            type="button"
            className={`filter-button ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
            aria-pressed={filter === "active"}
          >
            Dalam Proses
          </button>
          <button
            type="button"
            className={`filter-button ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
            aria-pressed={filter === "completed"}
          >
            Selesai
          </button>
        </div>
      )}

      {loading ? (
        <div className="state-card">
          <div className="state-icon">✳</div>
          <h3 className="state-title">Menyiapkan pesananmu</h3>
          <p className="state-description">
            Sebentar, kami sedang mengambil data pesanan.
          </p>
          <div className="loading-line" />
          <div className="loading-line" />
          <div className="loading-line" />
        </div>
      ) : error ? (
        <div className="state-card">
          <div className="state-icon">!</div>
          <h3 className="state-title">Belum bisa memuat data</h3>
          <p className="state-description">{error}</p>
          {error.includes("Sesi") ? (
            <button
              type="button"
              className="primary-button"
              onClick={() => router.push("/login")}
            >
              Login Kembali
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={loadOrders}
            >
              Coba Lagi
            </button>
          )}
        </div>
      ) : orders.length === 0 ? (
        <div className="state-card">
          <div className="state-icon">✳</div>
          <h3 className="state-title">Perjalanan desainmu dimulai di sini</h3>
          <p className="state-description">
            Belum ada pesanan untuk saat ini. Saat kamu memesan desain,
            semua informasi dan perkembangannya akan tampil di halaman ini.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => router.push("/order")}
          >
            <span aria-hidden="true">＋</span> Pesan Desain
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="state-card">
          <div className="state-icon">✳</div>
          <h3 className="state-title">Belum ada pesanan di kategori ini</h3>
          <p className="state-description">
            Coba pilih kategori lain untuk melihat pesananmu.
          </p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setFilter("all")}
          >
            Tampilkan Semua
          </button>
        </div>
      ) : (
        <div className="order-list">
          {filteredOrders.map((order) => {
            const status = statusStyle(order.status);

            return (
              <button
                key={order.id}
                type="button"
                className="order-card"
                onClick={() =>
                  router.push(
                    `/orders?id=${encodeURIComponent(order.id)}`
                  )
                }
                aria-label={`Lihat detail pesanan ${order.order_code}`}
              >
                <div className="card-top">
                  <div>
                    <p className="order-code">ORDER #{order.order_code}</p>
                    <h3 className="service-title">
                      {order.service_name || "Pesanan Desain"}
                    </h3>
                    <p className="design-type">
                      {order.design_type || "Jenis desain belum ditentukan"}
                    </p>
                  </div>

                  <span
                    className="status"
                    style={{
                      background: status.background,
                      color: status.color,
                    }}
                  >
                    <span
                      className="status-dot"
                      style={{ background: status.dot }}
                    />
                    {statusLabel(order.status)}
                  </span>
                </div>

                <div className="card-divider" />

                <div className="card-bottom">
                  <div className="detail-meta">
                    <span>
                      ◇ {order.quantity || 1} desain
                    </span>
                    <span>
                      Tenggat: {formatDate(order.deadline)}
                    </span>
                  </div>
                  <span className="detail-link">Detail ↗</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>

    <p
      style={{
        margin: "27px 0 0",
        color: COLORS.muted,
        fontSize: 10,
        lineHeight: 1.8,
        textAlign: "center",
      }}
    >
      PAJARA STUDIO
      <br />
      Berakar di Tanah Pasundan.
    </p>
  </div>
</main>

);
}
