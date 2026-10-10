"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
{
label: "Beranda",
shortLabel: "Home",
href: "/dashboard",
icon: "home",
},
{
label: "Pesanan",
shortLabel: "Pesanan",
href: "/orders/list",
icon: "orders",
},
{
label: "Paket",
shortLabel: "Paket",
href: "/subscriptions",
icon: "package",
},
{
label: "Bayar",
shortLabel: "Bayar",
href: "/payments",
icon: "wallet",
},
{
label: "File",
shortLabel: "File",
href: "/files",
icon: "file",
},
{
label: "Akun",
shortLabel: "Akun",
href: "/account",
icon: "user",
},
] as const;

function NavIcon({ name }: { name: string }) {
const common = {
width: 21,
height: 21,
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
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5" />
      <path d="M9 10h6M9 14h6M9 18h3" />
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

case "wallet":
  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="15" rx="3" />
      <path d="M3 9h18" />
      <path d="M16 14h.01" />
      <path d="M6 5V4a2 2 0 0 1 2-2h10" />
    </svg>
  );

case "file":
  return (
    <svg {...common}>
      <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" />
      <path d="M13 3v7h7M8 15h8M8 18h6" />
    </svg>
  );

default:
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2Z" />
    </svg>
  );

}
}

export default function CustomerBottomNav() {
const pathname = usePathname();

return (
<>
<style jsx global>{`
.pajara-bottom-nav {
position: fixed;
z-index: 1000;
right: 0;
bottom: 0;
left: 0;
display: grid;
grid-template-columns: repeat(6, minmax(0, 1fr));
gap: 2px;
padding: 9px 8px calc(9px + env(safe-area-inset-bottom));
background: rgba(255, 255, 255, 0.97);
border-top: 1px solid rgba(33, 77, 50, 0.12);
box-shadow: 0 -5px 24px rgba(26, 45, 32, 0.07);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
}

    .pajara-bottom-nav__item {
      display: flex;
      min-width: 0;
      min-height: 51px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      border-radius: 13px;
      color: #858b85;
      text-decoration: none;
      font-family: "DM Sans", Arial, sans-serif;
      font-size: 10px;
      font-weight: 500;
      line-height: 1.2;
      transition:
        background 160ms ease,
        color 160ms ease;
      -webkit-tap-highlight-color: transparent;
    }

    .pajara-bottom-nav__item svg {
      flex-shrink: 0;
    }

    .pajara-bottom-nav__item--active {
      color: #2f6b45;
      background: #edf4ee;
      font-weight: 700;
    }

    .pajara-bottom-nav__item:focus-visible {
      outline: 2px solid #2f6b45;
      outline-offset: 2px;
    }

    .pajara-bottom-nav__spacer {
      height: calc(78px + env(safe-area-inset-bottom));
    }

    @media (min-width: 768px) {
      .pajara-bottom-nav {
        right: 50%;
        bottom: 18px;
        left: auto;
        width: min(560px, calc(100% - 40px));
        padding: 10px 12px;
        border: 1px solid rgba(33, 77, 50, 0.12);
        border-radius: 20px;
        transform: translateX(50%);
        box-shadow: 0 8px 35px rgba(26, 45, 32, 0.12);
      }

      .pajara-bottom-nav__item {
        min-height: 55px;
        font-size: 11px;
      }

      .pajara-bottom-nav__spacer {
        height: 95px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .pajara-bottom-nav__item {
        transition: none;
      }
    }
  `}</style>

  <div className="pajara-bottom-nav__spacer" aria-hidden="true" />

  <nav className="pajara-bottom-nav" aria-label="Navigasi Customer">
    {NAV_ITEMS.map((item) => {
      const active =
        pathname === item.href ||
        (item.href !== "/dashboard" &&
          pathname.startsWith(`${item.href}/`));

      return (
        <Link
          key={item.href}
          href={item.href}
          className={`pajara-bottom-nav__item${
            active ? " pajara-bottom-nav__item--active" : ""
          }`}
          aria-current={active ? "page" : undefined}
          aria-label={item.label}
        >
          <NavIcon name={item.icon} />
          <span>{item.shortLabel}</span>
        </Link>
      );
    })}
  </nav>
</>

);
}
