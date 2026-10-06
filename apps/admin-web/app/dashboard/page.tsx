"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  const [totalOrders, setTotalOrders] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [processingOrders, setProcessingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

  useEffect(() => {
    async function checkAdmin() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.user) {
        router.replace("/");
        return;
      }

      const user = sessionData.session.user;

      const { data: profile, error: profileError } = await supabase
        .from("profiles_v2")
        .select("role")
        .eq("id", user.id)
        .single();

      if (
        profileError ||
        !profile ||
        profile.role !== "admin"
      ) {
        await supabase.auth.signOut();
        router.replace("/");
        return;
      }

      setAdminEmail(user.email || "");

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("status");

      if (!ordersError && orders) {
        setTotalOrders(orders.length);

        setNewOrders(
          orders.filter((order) => order.status === "pending").length
        );

        setProcessingOrders(
          orders.filter((order) => order.status === "processing").length
        );

        setCompletedOrders(
          orders.filter((order) => order.status === "completed").length
        );
      }

      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f4ee",
          fontFamily: "Arial, sans-serif",
          color: "#214d32",
        }}
      >
        Memuat Dashboard Admin...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          background: "#214d32",
          color: "#ffffff",
          padding: "22px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "25px",
            }}
          >
            PAJARA STUDIO
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              opacity: 0.85,
              fontSize: "14px",
            }}
          >
            Admin Dashboard
          </p>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "28px 20px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "20px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#8a6a4a",
              fontSize: "14px",
            }}
          >
            Selamat datang,
          </p>

          <h2
            style={{
              margin: "6px 0 8px",
              color: "#214d32",
              fontSize: "22px",
            }}
          >
            Admin Pajara
          </h2>

          <p
            style={{
              margin: 0,
              color: "#555",
              fontSize: "14px",
            }}
          >
            {adminEmail}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ margin: 0, color: "#8a6a4a", fontSize: "13px" }}>
              Total Pesanan
            </p>

            <h3
              style={{
                margin: "8px 0 0",
                color: "#214d32",
                fontSize: "28px",
              }}
            >
              {totalOrders}
            </h3>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ margin: 0, color: "#8a6a4a", fontSize: "13px" }}>
              Pesanan Baru
            </p>

            <h3
              style={{
                margin: "8px 0 0",
                color: "#214d32",
                fontSize: "28px",
              }}
            >
              {newOrders}
            </h3>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ margin: 0, color: "#8a6a4a", fontSize: "13px" }}>
              Sedang Diproses
            </p>

            <h3
              style={{
                margin: "8px 0 0",
                color: "#214d32",
                fontSize: "28px",
              }}
            >
              {processingOrders}
            </h3>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ margin: 0, color: "#8a6a4a", fontSize: "13px" }}>
              Selesai
            </p>

            <h3
              style={{
                margin: "8px 0 0",
                color: "#214d32",
                fontSize: "28px",
              }}
            >
              {completedOrders}
            </h3>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "20px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              color: "#214d32",
              fontSize: "19px",
            }}
          >
            Pesanan
          </h2>

          <p
            style={{
              margin: "0 0 16px",
              color: "#777",
              fontSize: "14px",
            }}
          >
            Kelola dan lihat semua pesanan pelanggan.
          </p>

          <button
            type="button"
            onClick={() => router.push("/orders")}
            style={{
              width: "100%",
              height: "48px",
              border: "none",
              borderRadius: "10px",
              background: "#2f6b45",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            Lihat Semua Pesanan
          </button>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "22px",
            marginBottom: "20px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              color: "#214d32",
              fontSize: "19px",
            }}
          >
            Aktivitas Terbaru
          </h2>

          <p
            style={{
              margin: 0,
              color: "#777",
              fontSize: "14px",
            }}
          >
            Belum ada aktivitas terbaru.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            height: "50px",
            border: "none",
            borderRadius: "10px",
            background: "#8a6a4a",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          Keluar dari Admin
        </button>
      </section>
    </main>
  );
}
