
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { label: "Home", href: "/dashboard", icon: "home" },
  { label: "Pesanan", href: "/orders/list", icon: "orders" },
  { label: "Paket", href: "/subscriptions", icon: "package" },
  { label: "Pembayaran", href: "/payments", icon: "payment" },
  { label: "File", href: "/files", icon: "files" },
  { label: "Akun", href: "/account", icon: "account" },
];

function MenuIcon({
  name,
  active,
}: {
  name: string;
  active: boolean;
}) {
  const common = {
    width: 23,
    height: 23,
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
          <path d="M5 9v11h14V9" />
          <path d="M9 20v-7h6v7" />
        </svg>
      );

    case "orders":
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="2.5" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );

    case "package":
      return (
        <svg {...common}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 8 9 5 9-5" />
          <path d="M3 8v9l9 5 9-5V8" />
          <path d="M12 13v9" />
        </svg>
      );

    case "payment":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M3 10h18M7 15h4" />
        </svg>
      );

    case "files":
      return (
        <svg {...common}>
          <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" />
          <path d="M13 3v7h7M8 14h8M8 17h6" />
        </svg>
      );

    case "account":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

export default function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="pajara-bottom-nav" aria-label="Navigasi utama">
        {menus.map((menu) => {
          const active =
            pathname === menu.href ||
            (menu.href !== "/dashboard" &&
              pathname.startsWith(`${menu.href}/`));

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`pajara-bottom-nav-item ${
                active ? "is-active" : ""
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="pajara-bottom-nav-icon">
                <MenuIcon name={menu.icon} active={active} />
              </span>
              <span className="pajara-bottom-nav-label">
                {menu.label}
              </span>
              <span className="pajara-bottom-nav-indicator" />
            </Link>
          );
        })}
      </nav>

      <style jsx global>{`
        .pajara-bottom-nav {
          position: fixed;
          z-index: 1000;
          left: 50%;
          bottom: max(12px, env(safe-area-inset-bottom));
          transform: translateX(-50%);
          width: min(680px, calc(100% - 24px));
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          align-items: center;
          padding: 9px 7px 7px;
          border: 1px solid rgba(33, 77, 50, 0.12);
          border-radius: 23px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 12px 40px rgba(25, 48, 32, 0.16);
          -webkit-backdrop-filter: blur(18px);
          backdrop-filter: blur(18px);
        }

        .pajara-bottom-nav-item {
          position: relative;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 5px 1px 7px;
          border-radius: 15px;
          color: #7a817b;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
          transition:
            color 180ms ease,
            background 180ms ease;
        }

        .pajara-bottom-nav-item.is-active {
          color: #2f6b45;
          background: #f0f5ef;
        }

        .pajara-bottom-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 28px;
          transform: translateY(0);
          transition: transform 200ms ease;
        }

        .pajara-bottom-nav-item.is-active .pajara-bottom-nav-icon {
          transform: translateY(-2px);
          animation: pajara-nav-pop 260ms ease both;
        }

        .pajara-bottom-nav-label {
          display: block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: "DM Sans", sans-serif;
          font-size: 10px;
          line-height: 1.3;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .pajara-bottom-nav-item.is-active .pajara-bottom-nav-label {
          font-weight: 800;
        }

        .pajara-bottom-nav-indicator {
          position: absolute;
          bottom: 1px;
          width: 0;
          height: 3px;
          border-radius: 10px;
          background: #2f6b45;
          transition: width 200ms ease;
        }

        .pajara-bottom-nav-item.is-active
          .pajara-bottom-nav-indicator {
          width: 15px;
        }

        .pajara-bottom-nav-item:active .pajara-bottom-nav-icon {
          transform: scale(0.9);
        }

        @keyframes pajara-nav-pop {
          0% {
            transform: translateY(2px) scale(0.92);
          }
          65% {
            transform: translateY(-3px) scale(1.06);
          }
          100% {
            transform: translateY(-2px) scale(1);
          }
        }

        @media (max-width: 360px) {
          .pajara-bottom-nav {
            width: calc(100% - 16px);
            padding: 8px 4px 6px;
            border-radius: 19px;
          }

          .pajara-bottom-nav-item {
            gap: 3px;
          }

          .pajara-bottom-nav-icon {
            transform: scale(0.92);
          }

          .pajara-bottom-nav-label {
            font-size: 9px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pajara-bottom-nav-item,
          .pajara-bottom-nav-icon,
          .pajara-bottom-nav-indicator {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
