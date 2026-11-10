
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CustomerLoading from "./CustomerLoading";

export default function GlobalCustomerLoading({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsReady(true);
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) return;

      const link = target.closest("a");

      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      const href = link.getAttribute("href");

      if (!href || href.startsWith("#")) return;

      try {
        const destination = new URL(href, window.location.href);

        if (
          destination.origin === window.location.origin &&
          destination.pathname !== window.location.pathname
        ) {
          setIsNavigating(true);
        }
      } catch {
        return;
      }
    };

    const handlePopState = () => {
      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const showLoading = !isReady || isNavigating;

  return (
    <>
      <div
        id="pajara-customer-content"
        style={{
          visibility: showLoading ? "hidden" : "visible",
        }}
      >
        {children}
      </div>

      {showLoading && (
        <CustomerLoading
          title="Menyiapkan Halaman"
          description="Mohon tunggu, Pajara Studio sedang menyiapkan halaman untuk Kang/Teh."
        />
      )}
    </>
  );
}
