"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const NAV_ITEMS = [
  { label: "Dashboard", icon: "⌂", path: "/dashboard" },
  { label: "Pesanan", icon: "▤", path: "/orders" },
  { label: "Notifikasi", icon: "♧", path: "/notifications" },
  { label: "Keuangan", icon: "Rp", path: "/finance" },
];

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
        .single();

      if (!active) return;

      if (error || profile?.role !== "admin") {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);
      await loadUnreadCount(user.id);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkSession();
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
                <span
                  className={`nav-icon ${
                    item.path === "/finance" ? "nav-icon-rp" : ""
                  }`}
                >
                  {item.icon}
                </span>

                <span className="nav-label">{item.label}</span>

                {item.path === "/notifications" &&
                  unreadCount > 0 && (
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
          padding: 8px 12px
            calc(8px + env(safe-area-inset-bottom));
          border-top: 1px solid rgba(228, 222, 213, 0.95);
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 -8px 28px rgba(33, 77, 50, 0.07);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .bottom-navigation-inner {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 5px;
          width: 100%;
          max-width: 620px;
          margin: 0 auto;
        }

        .nav-item {
          position: relative;
          display: flex;
          min-width: 0;
          min-height: 54px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 6px 2px;
          border: none;
          border-radius: 14px;
          background: transparent;
          color: #777d75;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .nav-item-active {
          background: #eaf1e9;
          color: #214d32;
        }

        .nav-icon {
          font-size: 21px;
          font-weight: 800;
          line-height: 1;
        }

        .nav-icon-rp {
          font-size: 13px;
        }

        .nav-label {
          font-size: 9px;
          font-weight: 700;
          line-height: 1.2;
          white-space: nowrap;
        }

        .nav-item-active .nav-label {
          font-weight: 900;
        }

        .nav-badge {
          position: absolute;
          top: 2px;
          right: calc(50% - 21px);
          display: grid;
          place-items: center;
          min-width: 15px;
          height: 15px;
          padding: 0 3px;
          border: 2px solid #fff;
          border-radius: 99px;
          background: #b45e48;
          color: #fff;
          font-size: 8px;
          font-weight: 900;
        }

        .nav-item:focus-visible {
          outline: 2px solid #8a6a4a;
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .nav-item {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
