"use client";

import { useRouter } from "next/navigation";

const menus = [
  {
    number: "01",
    title: "Pesanan Satuan",
    description: "Kelola pesanan desain dengan sistem pembayaran per pesanan.",
    href: "/orders/satuan",
    icon: "M",
    color: "green",
  },
  {
    number: "02",
    title: "Pesanan Paket",
    description: "Kelola pesanan yang menggunakan kuota paket mingguan atau bulanan.",
    href: "/orders/paket",
    icon: "P",
    color: "purple",
  },
  {
    number: "03",
    title: "Konfirmasi Pembayaran Paket",
    description: "Periksa bukti pembayaran pembelian dan perpanjangan paket.",
    href: "/orders/konfirmasi-paket",
    icon: "K",
    color: "brown",
  },
  {
    number: "04",
    title: "Konfirmasi Pembayaran Satuan",
    description: "Kelola konfirmasi pembayaran DP dan pelunasan pesanan satuan.",
    href: "/orders/konfirmasi-satuan",
    icon: "S",
    color: "green",
  },
  {
    number: "05",
    title: "Konfirmasi Pembayaran Revisi",
    description: "Periksa pembayaran pembelian kuota revisi tambahan.",
    href: "/orders/konfirmasi-revisi",
    icon: "R",
    color: "brown",
  },
];

export default function OrdersPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 pb-32 pt-5 sm:px-6 sm:pt-7 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#214d32] via-[#2f6b45] to-[#365f43] p-5 text-white shadow-[0_12px_32px_rgba(33,77,50,0.15)] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-5 h-32 w-32 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-white/[0.04]" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
              <span className="h-2 w-2 rounded-full bg-[#c7dfbd]" />
              Pajara Admin
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Kelola Pesanan
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              Pilih kategori untuk mengelola pesanan desain dan konfirmasi
              pembayaran customer.
            </p>
          </div>
        </header>

        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#66836b]">
            Manajemen Pesanan
          </p>
          <h2 className="mt-1 text-xl font-bold text-[#214d32] sm:text-2xl">
            Pilih Menu
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Semua pengelolaan pesanan kini dipisahkan berdasarkan kategori.
          </p>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {menus.map((menu) => {
            const colors = {
              green: {
                icon: "bg-[#edf4ed] text-[#2f6b45]",
                number: "text-[#2f6b45]",
                hover: "group-hover:border-[#b9ceb9]",
              },
              purple: {
                icon: "bg-purple-50 text-purple-700",
                number: "text-purple-600",
                hover: "group-hover:border-purple-200",
              },
              brown: {
                icon: "bg-[#f5f0e9] text-[#8a6a4a]",
                number: "text-[#8a6a4a]",
                hover: "group-hover:border-[#d8c5ac]",
              },
            }[menu.color];

            return (
              <button
                key={menu.href}
                type="button"
                onClick={() => router.push(menu.href)}
                className={`group w-full rounded-3xl border border-[#e8e5dc] bg-white p-5 text-left shadow-[0_4px_24px_rgba(33,77,50,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(33,77,50,0.08)] ${colors.hover}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${colors.icon}`}>
                    {menu.icon}
                  </div>

                  <span className={`font-mono text-xs font-semibold ${colors.number}`}>
                    {menu.number}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold leading-snug text-[#214d32]">
                  {menu.title}
                </h3>

                <p className="mt-2 min-h-10 text-sm leading-relaxed text-gray-500">
                  {menu.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-[#f0eee8] pt-4">
                  <span className="text-sm font-semibold text-[#2f6b45]">
                    Buka halaman
                  </span>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5 text-[#2f6b45] transition-transform group-hover:translate-x-1"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </div>
              </button>
            );
          })}
        </section>

        <footer className="mt-10 border-t border-[#e5e2d9] pt-5 text-center">
          <p className="text-xs font-medium tracking-wide text-gray-400">
            PAJARA STUDIO
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Desain yang punya arah.
          </p>
        </footer>
      </div>
    </main>
  );
}
