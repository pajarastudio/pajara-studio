
"use client";

import { useEffect, useState } from "react";
import CustomerLoading from "./components/CustomerLoading";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {children}

      {isLoading && (
        <CustomerLoading
          title="Menyiapkan Halaman"
          description="Mohon tunggu, Pajara Studio sedang menyiapkan halaman untuk Kang/Teh."
        />
      )}
    </>
  );
}
