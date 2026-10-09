
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { label: "Home", href: "/dashboard", icon: "home" },
  { label: "Pesanan", href: "/orders", icon: "orders" },
  { label: "Paket", href: "/subscriptions", icon: "package" },
  { label: "Pembayaran", href: "/payments", icon: "payment" },
  { label: "File", href: "/files", icon: "files" },
  { label: "Akun", href: "/account", icon: "account" },
];

function MenuIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v12h14V9M9 21v-7h6v7" />
        </svg>
      );
    case "orders":
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h3" />
        </svg>
      );
    case "package":
      return (
        <svg {...common}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" />
        </svg>
      );
    case "payment":
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M3 10h18M7 15h4" />
        </svg>
      );
    case "files":
      return (
        <svg {...common}>
          <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" />
          <path d="M13 3v7h7M8 14h8M8 18h6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
  }
}

export default function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="customer-bottom-nav" aria-label="Navigasi utama">
        {menus.map((menu) => {
          const active =
            pathname === menu.href ||
            (menu.href !== "/dashboard" &&
              pathname.startsWith(`${menu.href}/`));

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`customer-bottom-nav__item${
                active ? " is-active" : ""
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="customer-bottom-nav__icon">
                <MenuIcon name={menu.icon} />
              </span>
              <span className="customer-bottom-nav__label">
                {menu.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <style jsx global>{`
        .customer-bottom-nav {
          position: fixed;
          z-index: 1000;
          left: 50%;
          bottom: max(12px, env(safe-area-inset-bottom));
          transform: translateX(-50%);
          width: min(620px, calc(100% - 24px));
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          align-items: center;
          gap: 2px;
          padding: 9px 5px;
          border: 1px solid rgba(33, 77, 50, 0.12);
          border-radius: 23px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 12px 38px rgba(25, 52, 35, 0.16);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .customer-bottom-nav__item {
          position: relative;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 1px 6px;
          border-radius: 15px;
          color: #788078;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
          transition:
            color 180ms ease,
            background 180ms ease,
            transform 180ms ease;
        }

        .customer-bottom-nav__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 31px;
          height: 27px;
          border-radius: 10px;
          transition:
            background 180ms ease,
            transform 180ms ease;
        }

        .customer-bottom-nav__label {
          max-width: 100%;
          font-family: "DM Sans", sans-serif;
          font-size: 9px;
          font-weight: 600;
          line-height: 1.2;
          text-align: center;
          white-space: nowrap;
        }

        .customer-bottom-nav__item.is-active {
          color: #2f6b45;
          background: #f1f6f0;
        }

        .customer-bottom-nav__item.is-active
          .customer-bottom-nav__icon {
          background: #e1eee1;
          transform: translateY(-2px);
        }

        .customer-bottom-nav__item:active {
          transform: scale(0.94);
        }

        @media (min-width: 700px) {
          .customer-bottom-nav {
            bottom: 20px;
            padding: 10px 8px;
          }

          .customer-bottom-nav__label {
            font-size: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .customer-bottom-nav__item,
          .customer-bottom-nav__icon {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
