
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string | null;
  transaction_date: string;
  created_at: string;
};

export default function FinancePage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verifyAdmin() {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (authError || !user) {
        router.replace("/");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles_v2")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();

        if (!cancelled) {
          router.replace("/");
        }

        return;
      }

      setAuthorized(true);
      await loadTransactions();
    }

    verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function loadTransactions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("finance_transactions")
      .select("*")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal memuat transaksi:", error);
      setMessage("Gagal memuat data keuangan.");
      setLoading(false);
      return;
    }

    setTransactions((data || []) as Transaction[]);
    setLoading(false);
  }

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "income")
        .reduce((total, item) => total + Number(item.amount), 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "expense")
        .reduce((total, item) => total + Number(item.amount), 0),
    [transactions]
  );

  const balance = totalIncome - totalExpense;

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!authorized) {
      setMessage("Akses Admin belum terverifikasi.");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setMessage("Masukkan nominal yang valid.");
      return;
    }

    if (!category.trim()) {
      setMessage("Kategori wajib diisi.");
      return;
    }

    if (!transactionDate) {
      setMessage("Tanggal transaksi wajib diisi.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setMessage("Sesi Admin tidak ditemukan. Silakan masuk kembali.");
      setSaving(false);
      router.replace("/");
      return;
    }

    const { error } = await supabase.from("finance_transactions").insert({
      type,
      amount: numericAmount,
      category: category.trim(),
      description: description.trim() || null,
      transaction_date: transactionDate,
      created_by: user.id,
    });

    if (error) {
      console.error("Gagal menyimpan transaksi:", error);
      setMessage("Gagal menyimpan transaksi. Periksa izin tabel Supabase.");
      setSaving(false);
      return;
    }

    setAmount("");
    setCategory("");
    setDescription("");
    setType("income");
    setTransactionDate(new Date().toLocaleDateString("en-CA"));
    setMessage("Transaksi berhasil ditambahkan.");
    setSaving(false);

    await loadTransactions();
  }

  async function handleDelete(id: string) {
    if (!authorized) {
      setMessage("Akses Admin belum terverifikasi.");
      return;
    }

    const confirmed = window.confirm(
      "Yakin ingin menghapus transaksi ini?"
    );

    if (!confirmed) return;

    setMessage("");
    setDeletingId(id);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setMessage("Sesi Admin tidak ditemukan. Silakan masuk kembali.");
      setDeletingId(null);
      router.replace("/");
      return;
    }

    const { error } = await supabase
      .from("finance_transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Gagal menghapus transaksi:", error);
      setMessage("Gagal menghapus transaksi. Periksa izin tabel Supabase.");
      setDeletingId(null);
      return;
    }

    setMessage("Transaksi berhasil dihapus.");
    setDeletingId(null);

    await loadTransactions();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading && !authorized) {
    return (
      <main style={pageStyle}>
        <div style={loadingScreenStyle}>
          <div style={loadingMarkStyle}>PS</div>
          <div style={{ fontWeight: 800, color: "#214d32" }}>
            Memeriksa akses Admin...
          </div>
          <div style={{ fontSize: 12, color: "#727a74", marginTop: 6 }}>
            Pajara Studio
          </div>
        </div>
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <main style={pageStyle}>
      {/* HEADER */}
      <header
        style={{
          background:
            "linear-gradient(135deg, #214d32 0%, #2f6b45 55%, #214d32 100%)",
          color: "#ffffff",
          padding: "22px 20px 24px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 8px 30px rgba(33,77,50,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 170,
            height: 170,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.12)",
            right: -70,
            top: -90,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 70,
            height: 70,
            border: "1px solid rgba(255,255,255,0.10)",
            right: 45,
            bottom: -35,
            transform: "rotate(25deg)",
            borderRadius: 18,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#8a6a4a",
                  display: "inline-block",
                }}
              />

              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "2px",
                }}
              >
                PAJARA STUDIO
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 25,
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Keuangan
            </h1>

            <div
              style={{
                width: 42,
                height: 3,
                background: "#8a6a4a",
                borderRadius: 10,
                marginTop: 9,
              }}
            />
          </div>

          <div
            aria-label="Pajara Studio"
            style={{
              width: 46,
              height: 46,
              borderRadius: 15,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 15,
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            }}
          >
            PS
          </div>
        </div>
      </header>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "22px 16px calc(110px + env(safe-area-inset-bottom))",
        }}
      >
        {/* SUMMARY */}
        <section style={summaryGridStyle}>
          <SummaryCard
            label="Total Pemasukan"
            value={formatRupiah(totalIncome)}
            icon="↗"
          />

          <SummaryCard
            label="Total Pengeluaran"
            value={formatRupiah(totalExpense)}
            icon="↘"
          />

          <SummaryCard
            label="Saldo Bersih"
            value={formatRupiah(balance)}
            icon="Rp"
          />
        </section>

        {/* FORM */}
        <section style={panelStyle}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={sectionTitleStyle}>Tambah Transaksi</h2>

            <p style={mutedTextStyle}>
              Catat pemasukan atau pengeluaran Pajara Studio.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={formGridStyle}>
              <label style={labelStyle}>
                Jenis Transaksi

                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "income" | "expense")
                  }
                  style={inputStyle}
                  disabled={saving}
                >
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </label>

              <label style={labelStyle}>
                Nominal

                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Contoh: 150000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={inputStyle}
                  required
                  disabled={saving}
                />
              </label>

              <label style={labelStyle}>
                Kategori

                <input
                  type="text"
                  placeholder="Contoh: Desain Logo"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={inputStyle}
                  required
                  disabled={saving}
                />
              </label>

              <label style={labelStyle}>
                Tanggal

                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  style={inputStyle}
                  required
                  disabled={saving}
                />
              </label>
            </div>

            <label style={{ ...labelStyle, marginTop: 14 }}>
              Keterangan

              <textarea
                placeholder="Contoh: Pembayaran desain dari pelanggan"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
                disabled={saving}
              />
            </label>

            {message && (
              <div
                role="status"
                style={{
                  marginTop: 14,
                  padding: "11px 13px",
                  borderRadius: 12,
                  background: "#f7f4ee",
                  color: "#214d32",
                  fontSize: 13,
                  fontWeight: 700,
                  overflowWrap: "anywhere",
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                ...primaryButtonStyle,
                marginTop: 16,
                background: saving ? "#8a9a8e" : "#214d32",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Menyimpan..." : "+ Tambah Transaksi"}
            </button>
          </form>
        </section>

        {/* TRANSACTION HISTORY */}
        <section style={panelStyle}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={sectionTitleStyle}>Riwayat Transaksi</h2>

            <p style={mutedTextStyle}>
              Semua pemasukan dan pengeluaran Pajara.
            </p>
          </div>

          {loading ? (
            <div style={emptyStateStyle}>Memuat transaksi...</div>
          ) : transactions.length === 0 ? (
            <div style={emptyStateStyle}>Belum ada transaksi.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {transactions.map((transaction) => (
                <div key={transaction.id} style={transactionCardStyle}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minWidth: 0,
                      flex: "1 1 220px",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        flex: "0 0 40px",
                        borderRadius: 12,
                        background:
                          transaction.type === "income"
                            ? "rgba(47,107,69,0.10)"
                            : "rgba(138,106,74,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        color:
                          transaction.type === "income"
                            ? "#2f6b45"
                            : "#8a6a4a",
                      }}
                    >
                      {transaction.type === "income" ? "↗" : "↘"}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#214d32",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {transaction.category}
                      </div>

                      <div
                        style={{
                          color: "#7b817d",
                          fontSize: 12,
                          marginTop: 3,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {transaction.transaction_date}
                        {transaction.description
                          ? ` • ${transaction.description}`
                          : ""}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong
                      style={{
                        color:
                          transaction.type === "income"
                            ? "#2f6b45"
                            : "#8a6a4a",
                        fontSize: 14,
                      }}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatRupiah(Number(transaction.amount))}
                    </strong>

                    <button
                      type="button"
                      onClick={() => handleDelete(transaction.id)}
                      disabled={deletingId === transaction.id}
                      style={{
                        ...deleteButtonStyle,
                        opacity: deletingId === transaction.id ? 0.6 : 1,
                        cursor:
                          deletingId === transaction.id
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {deletingId === transaction.id
                        ? "Menghapus..."
                        : "Hapus"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* LOGOUT */}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            ...primaryButtonStyle,
            marginTop: 22,
            background: "#8a6a4a",
          }}
        >
          Keluar dari Admin
        </button>
      </div>

      {/* Navbar bawah menggunakan BottomNavigation dari layout.tsx */}
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(33,77,50,0.08)",
        borderRadius: 20,
        padding: 18,
        boxShadow: "0 10px 30px rgba(33,77,50,0.06)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: "#f7f4ee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          color: "#2f6b45",
          marginBottom: 13,
        }}
      >
        {icon}
      </div>

      <div style={{ fontSize: 12, color: "#727a74", marginBottom: 6 }}>
        {label}
      </div>

      <div
        style={{
          fontSize: 19,
          fontWeight: 900,
          color: "#214d32",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f7f4ee",
  color: "#214d32",
  paddingBottom: "calc(100px + env(safe-area-inset-bottom))",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const loadingScreenStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const loadingMarkStyle: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 16,
  background: "#214d32",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  marginBottom: 16,
  boxShadow: "0 8px 24px rgba(33,77,50,0.18)",
};

const summaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 14,
  marginBottom: 22,
};

const panelStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid rgba(33,77,50,0.08)",
  borderRadius: 22,
  padding: 20,
  boxShadow: "0 10px 30px rgba(33,77,50,0.06)",
  marginBottom: 22,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 19,
  fontWeight: 800,
};

const mutedTextStyle: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#6d766f",
  fontSize: 13,
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 14,
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 7,
  fontSize: 12,
  fontWeight: 800,
  color: "#214d32",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #ddd9d1",
  borderRadius: 11,
  padding: "11px 12px",
  background: "#ffffff",
  color: "#214d32",
  outline: "none",
  fontSize: 13,
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  borderRadius: 13,
  padding: "13px 16px",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: 14,
};

const deleteButtonStyle: React.CSSProperties = {
  border: "1px solid #eadfda",
  background: "#fffaf7",
  color: "#8a6a4a",
  borderRadius: 9,
  padding: "7px 10px",
  fontWeight: 700,
  fontSize: 12,
};

const transactionCardStyle: React.CSSProperties = {
  border: "1px solid #e8e5df",
  borderRadius: 15,
  padding: 14,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const emptyStateStyle: React.CSSProperties = {
  padding: 30,
  textAlign: "center",
  color: "#6d766f",
  background: "#f7f4ee",
  borderRadius: 16,
  fontSize: 14,
};
