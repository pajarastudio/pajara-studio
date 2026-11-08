"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@pajara/supabase";
import CustomerBottomNav from "./CustomerBottomNav";

const HIDDEN_PATHS = new Set([
  "/",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/signup",
  "/register",
]);

export default function CustomerNavigation() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (mounted) {
        setIsAuthenticated(!!data.session);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (
    !pathname ||
    HIDDEN_PATHS.has(pathname) ||
    !isAuthenticated
  ) {
    return null;
  }

  return <CustomerBottomNav />;
}
