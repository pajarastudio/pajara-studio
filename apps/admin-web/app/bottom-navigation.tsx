"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const NAV_ITEMS = [
  { label: "Dashboard", icon: "dashboard", path: "/dashboard" },
  { label: "Pesanan", icon: "orders", path: "/orders" },
  { label: "Portofolio", icon: "portfolio", path: "/portfolios" },
  { label: "Testimoni", icon: "testimonials", path: "/testimonials" },
  { label: "Pajara News", icon: "news", path: "/news" },
  { label: "Notifikasi", icon: "notifications", path: "/notifications" },
  { label: "Keuangan", icon: "finance", path: "/finance" },
];

function NavIcon({ name }: { name: string }) {
  const commonProps = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...commonProps}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
        </svg>
      );

    case "orders":
      return (
        <svg {...commonProps}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 4.5V3.8A1.8 1.8 0 0 1 10.8 2h2.4A1.8 1.8 0 0 1 15 3.8v.7" />
          <path d="M8.5 10h7M8.5 14h7M8.5 18h4" />
        </svg>
      );

    case "portfolio":
      return (
        <svg {...commonProps}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9" r="1.5" />
          <path d="m4 17 5-5 3.5 3.5 2.5-2.5L20 18" />
        </svg>
      );

    case "testimonials":
      return (
        <svg {...commonProps}>
          <path d="M7 18.5 3.5 20l1-4A8.5 8.5 0 1 1 7 18.5Z" />
          <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2.5" />
        </svg>
      );

    case "news":
      return (
        <svg {...commonProps}>
          <path d="M5 4h14a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H6a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Z" />
          <path d="M7 8h4v4H7zM14 8h4M14 11h4M7 15h11M7 18h11" />
        </svg>
      );

    case "notifications":
      return (
        <svg {...commonProps}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "finance":
      return (
        <svg {...commonProps}>
          <rect x="3" y="5" width="18" height="15" rx="2.5" />
          <path d="M3 9h18M15 14h3" />
          <path d="M7 5V3.5h10V5" />
          <circle cx="16.5" cy="14" r=".5" fill="currentColor" />
        </svg>
      );

    default:
      return null;
  }
}

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);
  const [authorized, setAuthorized] = useState(false);

  const loadUnreadCount = useCallback(async (userId: string) => {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (!error) {
      setUnreadCount(count ?? 0);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        if (active) {
          setAuthorized(false);
          setUnreadCount(0);
        }
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles_v2")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (error || profile?.role !== "admin") {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);
      await loadUnreadCount(user.id);
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void checkSession();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadUnreadCount, pathname]);

  useEffect(() => {
    if (!authorized) return;

    const channel = supabase
      .channel("admin-bottom-navigation-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        async () => {
          const { data } = await supabase.auth.getSession();
          const userId = data.session?.user?.id;

          if (userId) {
            await loadUnreadCount(userId);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authorized, loadUnreadCount]);

  const isAuthPage =
    pathname === "/" ||
    pathname === "/reset-password" ||
    pathname === "/forgot-password" ||
    pathname === "/login";

  if (isAuthPage || !authorized) return null;

  return (
    <>
      <nav className="bottom-navigation" aria-label="Navigasi utama">
        <div className="bottom-navigation-inner">
          {NAV_ITEMS.map((item) => {
            const selected =
              pathname === item.path ||
              (item.path !== "/dashboard" &&
                pathname.startsWith(`${item.path}/`));

            return (
              <button
                key={item.path}
                type="button"
                aria-label={item.label}
                aria-current={selected ? "page" : undefined}
                onClick={() => {
                  if (pathname !== item.path) {
                    router.push(item.path);
                  } else if (item.path === "/dashboard") {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }
                }}
                className={`nav-item ${
                  selected ? "nav-item-active" : ""
                }`}
              >
                <span className="nav-icon">
                  <NavIcon name={item.icon} />
                </span>

                <span className="nav-label">{item.label}</span>

                {item.path === "/notifications" && unreadCount > 0 && (
                  <span className="nav-badge">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <style jsx>{`
        .bottom-navigation {
          position: fixed;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 1000;
          padding: 9px 6px
            calc(9px + env(safe-area-inset-bottom));
          border-top: 1px solid rgba(228, 222, 213, 0.85);
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 -6px 26px rgba(33, 77, 50, 0.055);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .bottom-navigation-inner {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 3px;
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
        }

        .nav-item {
          position: relative;
          display: flex;
          min-width: 0;
          min-height: 57px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 6px 1px;
          border: 1px solid transparent;
          border-radius: 13px;
          background: transparent;
          color: #85877f;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition:
            color 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .nav-item:active {
          transform: scale(0.96);
        }

        .nav-item-active {
          border-color: rgba(47, 107, 69, 0.08);
          background: #edf3eb;
          color: #214d32;
        }

        .nav-icon {
          display: flex;
          width: 25px;
          height: 25px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-icon :global(svg) {
          display: block;
          width: 21px;
          height: 21px;
          transition:
            width 0.2s ease,
            height 0.2s ease;
        }

        .nav-item-active .nav-icon :global(svg) {
          width: 22px;
          height: 22px;
          stroke-width: 1.9px;
        }

        .nav-label {
          display: block;
          max-width: 100%;
          overflow: hidden;
          font-size: clamp(8px, 1.8vw, 10px);
          font-weight: 500;
          line-height: 1.25;
          letter-spacing: -0.15px;
          text-align: center;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nav-item-active .nav-label {
          color: #214d32;
          font-weight: 700;
        }

        .nav-badge {
          position: absolute;
          top: 1px;
          right: calc(50% - 19px);
          display: grid;
          min-width: 16px;
          height: 16px;
          place-items: center;
          padding: 0 3px;
          border: 2px solid #fff;
          border-radius: 99px;
          background: #b45e48;
          color: #fff;
          font-size: 8px;
          font-weight: 800;
          line-height: 1;
        }

        .nav-item:focus-visible {
          outline: 2px solid #8a6a4a;
          outline-offset: 2px;
        }

        @media (max-width: 380px) {
          .bottom-navigation {
            padding-right: 3px;
            padding-left: 3px;
          }

          .bottom-navigation-inner {
            gap: 1px;
          }

          .nav-item {
            min-height: 54px;
            gap: 4px;
            padding-right: 0;
            padding-left: 0;
            border-radius: 10px;
          }

          .nav-icon :global(svg) {
            width: 19px;
            height: 19px;
          }

          .nav-item-active .nav-icon :global(svg) {
            width: 20px;
            height: 20px;
          }

          .nav-label {
            font-size: 8px;
            letter-spacing: -0.3px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nav-item,
          .nav-icon :global(svg) {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
