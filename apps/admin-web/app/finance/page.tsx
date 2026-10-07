"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [message, setMessage] = useState("");

  async function loadTransactions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("finance_transactions")
      .select("*")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Gagal memuat data keuangan.");
      setLoading(false);
      return;
    }

    setTransactions((data || []) as Transaction[]);
    setLoading(false);
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((item) => item.type === "income")
      .reduce((total, item) => total + Number(item.amount), 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((item) => item.type === "expense")
      .reduce((total, item) => total + Number(item.amount), 0);
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setMessage("Masukkan nominal yang valid.");
      return;
    }

    if (!category.trim()) {
      setMessage("Kategori wajib diisi.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Sesi admin tidak ditemukan.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("finance_transactions")
      .insert({
        type,
        amount: numericAmount,
        category: category.trim(),
        description: description.trim() || null,
        transaction_date: transactionDate,
        created_by: user.id,
      });

    if (error) {
      console.error(error);
      setMessage("Gagal menyimpan transaksi.");
      setSaving(false);
      return;
    }

    setAmount("");
    setCategory("");
    setDescription("");
    setType("income");
    setTransactionDate(new Date().toISOString().split("T")[0]);

    setMessage("Transaksi berhasil ditambahkan.");
    setSaving(false);

    await loadTransactions();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Yakin ingin menghapus transaksi ini?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("finance_transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage("Gagal menghapus transaksi.");
      return;
    }

    setMessage("Transaksi berhasil dihapus.");
    await loadTransactions();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        color: "#214d32",
        paddingBottom: 90,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
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
          padding: "22px 16px",
        }}
      >
        {/* SUMMARY */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
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
        <section
          style={{
            background: "#ffffff",
            border: "1px solid rgba(33,77,50,0.08)",
            borderRadius: 22,
            padding: 20,
            boxShadow: "0 10px 30px rgba(33,77,50,0.06)",
            marginBottom: 22,
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 19,
                fontWeight: 800,
              }}
            >
              Tambah Transaksi
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#6d766f",
                fontSize: 13,
              }}
            >
              Catat pemasukan atau pengeluaran Pajara Studio.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14,
              }}
            >
              <label style={labelStyle}>
                Jenis Transaksi

                <select
                  value={type}
                  onChange={(e) =>
                    setType(
                      e.target.value as "income" | "expense"
                    )
                  }
                  style={inputStyle}
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
                  placeholder="Contoh: 150000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={inputStyle}
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
                />
              </label>

              <label style={labelStyle}>
                Tanggal

                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) =>
                    setTransactionDate(e.target.value)
                  }
                  style={inputStyle}
                />
              </label>
            </div>

            <label
              style={{
                ...labelStyle,
                marginTop: 14,
              }}
            >
              Keterangan

              <textarea
                placeholder="Contoh: Pembayaran desain dari pelanggan"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </label>

            {message && (
              <div
                style={{
                  marginTop: 14,
                  padding: "11px 13px",
                  borderRadius: 12,
                  background: "#f7f4ee",
                  color: "#214d32",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: 16,
                width: "100%",
                border: 0,
                borderRadius: 13,
                padding: "13px 16px",
                background: saving ? "#8a9a8e" : "#214d32",
                color: "#ffffff",
                fontWeight: 800,
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: 14,
              }}
            >
              {saving ? "Menyimpan..." : "+ Tambah Transaksi"}
            </button>
          </form>
        </section>

        {/* TRANSACTIONS */}
        <section
          style={{
            background: "#ffffff",
            border: "1px solid rgba(33,77,50,0.08)",
            borderRadius: 22,
            padding: 20,
            boxShadow: "0 10px 30px rgba(33,77,50,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 19,
                  fontWeight: 800,
                }}
              >
                Riwayat Transaksi
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#6d766f",
                  fontSize: 13,
                }}
              >
                Semua pemasukan dan pengeluaran Pajara.
              </p>
            </div>
          </div>

          {loading ? (
            <div
              style={{
                padding: 30,
                textAlign: "center",
                color: "#6d766f",
              }}
            >
              Memuat transaksi...
            </div>
          ) : transactions.length === 0 ? (
            <div
              style={{
                padding: 35,
                textAlign: "center",
                background: "#f7f4ee",
                borderRadius: 16,
                color: "#6d766f",
                fontSize: 14,
              }}
            >
              Belum ada transaksi.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    border: "1px solid #e8e5df",
                    borderRadius: 15,
                    padding: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
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

                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#214d32",
                        }}
                      >
                        {transaction.category}
                      </div>

                      <div
                        style={{
                          color: "#7b817d",
                          fontSize: 12,
                          marginTop: 3,
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
                      gap: 12,
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
                      {formatRupiah(
                        Number(transaction.amount)
                      )}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(transaction.id)
                      }
                      style={{
                        border: "1px solid #eadfda",
                        background: "#fffaf7",
                        color: "#8a6a4a",
                        borderRadius: 9,
                        padding: "7px 10px",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      Hapus
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
            marginTop: 22,
            width: "100%",
            border: 0,
            borderRadius: 13,
            padding: "13px 16px",
            background: "#8a6a4a",
            color: "#ffffff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Keluar dari Admin
        </button>
      </div>

      {/* BOTTOM NAV */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.97)",
          borderTop: "1px solid #e8e5df",
          boxShadow: "0 -8px 25px rgba(33,77,50,0.08)",
          padding:
            "8px 10px calc(8px + env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 5,
          }}
        >
          <NavItem
            label="Dashboard"
            icon="⌂"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          />

          <NavItem
            label="Pesanan"
            icon="▣"
            onClick={() => {
              window.location.href = "/orders";
            }}
          />

          <NavItem
            label="Notifikasi"
            icon="●"
            onClick={() => {
              window.location.href = "/dashboard#notifikasi";
            }}
          />

          <NavItem
            label="Keuangan"
            icon="Rp"
            active
            onClick={() => {
              window.location.href = "/finance";
            }}
          />
        </div>
      </nav>
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

      <div
        style={{
          fontSize: 12,
          color: "#727a74",
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 19,
          fontWeight: 900,
          color: "#214d32",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function NavItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 0,
        background: active ? "#f7f4ee" : "transparent",
        color: active ? "#214d32" : "#737b76",
        borderRadius: 12,
        padding: "8px 5px",
        cursor: "pointer",
        fontWeight: active ? 800 : 600,
      }}
    >
      <div
        style={{
          fontSize: 17,
          fontWeight: 900,
          marginBottom: 2,
        }}
      >
        {icon}
      </div>

      <div style={{ fontSize: 10 }}>{label}</div>
    </button>
  );
}

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
