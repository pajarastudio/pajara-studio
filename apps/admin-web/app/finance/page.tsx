
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const C = {
  background: "#F7F4EE",
  green: "#214D32",
  greenLight: "#2F6B45",
  brown: "#8A6A4A",
  white: "#FFFFFF",
  muted: "#777D75",
  border: "#E7DFD5",
  softGreen: "#EDF4EB",
  softBrown: "#F4EEE6",
  danger: "#A34D3E",
  softDanger: "#FFF1ED",
};

function todayLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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
  const [transactionDate, setTransactionDate] = useState(todayLocal());
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const loadTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from("finance_transactions")
      .select("*")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal memuat transaksi:", error);
      setMessageType("error");
      setMessage("Gagal memuat data keuangan. Coba muat ulang halaman.");
      return false;
    }

    setTransactions((data ?? []) as Transaction[]);
    return true;
  }, []);

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

        if (!cancelled) router.replace("/");
        return;
      }

      setAuthorized(true);

      await loadTransactions();

      if (!cancelled) setLoading(false);
    }

    verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, [router, loadTransactions]);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!authorized || saving) {
      setMessageType("error");
      setMessage("Akses Admin belum terverifikasi.");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isSafeInteger(numericAmount) || numericAmount <= 0) {
      setMessageType("error");
      setMessage("Masukkan nominal rupiah berupa angka bulat yang valid.");
      return;
    }

    if (!category.trim()) {
      setMessageType("error");
      setMessage("Kategori wajib diisi.");
      return;
    }

    if (!transactionDate) {
      setMessageType("error");
      setMessage("Tanggal transaksi wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessageType("error");
        setMessage("Sesi Admin tidak ditemukan. Silakan masuk kembali.");
        router.replace("/");
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
        console.error("Gagal menyimpan transaksi:", error);
        setMessageType("error");
        setMessage(
          "Gagal menyimpan transaksi. Periksa izin tabel Supabase."
        );
        return;
      }

      setAmount("");
      setCategory("");
      setDescription("");
      setType("income");
      setTransactionDate(todayLocal());

      const refreshed = await loadTransactions();

      setMessageType(refreshed ? "success" : "error");
      setMessage(
        refreshed
          ? "Transaksi berhasil ditambahkan."
          : "Transaksi tersimpan, tetapi riwayat gagal diperbarui. Muat ulang halaman."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!authorized || deletingId) return;

    const confirmed = window.confirm(
      "Yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
    );

    if (!confirmed) return;

    setMessage("");
    setDeletingId(id);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessageType("error");
        setMessage("Sesi Admin tidak ditemukan. Silakan masuk kembali.");
        router.replace("/");
        return;
      }

      const { error } = await supabase
        .from("finance_transactions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Gagal menghapus transaksi:", error);
        setMessageType("error");
        setMessage(
          "Gagal menghapus transaksi. Periksa izin tabel Supabase."
        );
        return;
      }

      setTransactions((current) =>
        current.filter((transaction) => transaction.id !== id)
      );

      setMessageType("success");
      setMessage("Transaksi berhasil dihapus.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading && !authorized) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingScreen}>
          <div style={styles.logoMark}>PS</div>
          <div style={{ fontWeight: 800, color: C.green }}>
            Memeriksa akses Admin...
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
            Pajara Studio
          </div>
        </div>
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <main style={styles.page}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .finance-content {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 24px 16px calc(120px + env(safe-area-inset-bottom));
        }

        .finance-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .finance-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .finance-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
          color: ${C.green};
          font-size: 12px;
          font-weight: 800;
        }

        .finance-input {
          width: 100%;
          min-width: 0;
          border: 1px solid #DDD9D1;
          border-radius: 12px;
          padding: 12px;
          background: #FFFFFF;
          color: ${C.green};
          font-family: inherit;
          font-size: 13px;
          outline: none;
          transition: border-color .18s ease, box-shadow .18s ease;
        }

        .finance-input:focus {
          border-color: ${C.greenLight};
          box-shadow: 0 0 0 3px rgba(47,107,69,.10);
        }

        .finance-input:disabled {
          opacity: .65;
        }

        .finance-panel {
          background: ${C.white};
          border: 1px solid ${C.border};
          border-radius: 22px;
          padding: 22px;
          margin-bottom: 22px;
          box-shadow: 0 8px 28px rgba(33,77,50,.045);
        }

        .finance-transaction {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 15px;
          border: 1px solid #EAE5DC;
          border-radius: 16px;
          background: #FFFFFF;
        }

        .finance-transaction-main {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .finance-transaction-end {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }

        .finance-delete {
          border: 1px solid #EADFD8;
          border-radius: 10px;
          padding: 8px 11px;
          color: ${C.danger};
          background: ${C.softDanger};
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .finance-primary {
          width: 100%;
          min-height: 46px;
          border: 0;
          border-radius: 13px;
          padding: 13px 16px;
          background: ${C.green};
          color: #FFFFFF;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: opacity .18s ease, transform .18s ease;
        }

        .finance-primary:hover {
          opacity: .92;
        }

        .finance-primary:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        @media (max-width: 700px) {
          .finance-content {
            padding: 19px 13px calc(120px + env(safe-area-inset-bottom));
          }

          .finance-summary {
            grid-template-columns: 1fr;
            gap: 11px;
          }

          .finance-summary-card {
            display: flex;
            align-items: center;
            gap: 13px;
            padding: 15px !important;
          }

          .finance-summary-icon {
            margin-bottom: 0 !important;
            flex-shrink: 0;
          }

          .finance-summary-info {
            min-width: 0;
            flex: 1;
          }

          .finance-summary-value {
            font-size: 18px !important;
          }

          .finance-panel {
            padding: 17px;
            border-radius: 19px;
          }

          .finance-form-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .finance-transaction {
            align-items: flex-start;
            flex-direction: column;
            gap: 13px;
            padding: 14px;
          }

          .finance-transaction-end {
            width: 100%;
            justify-content: space-between;
            padding-left: 52px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .finance-input,
          .finance-primary {
            transition: none;
          }
        }
      `}</style>

      <header
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #183D27 0%, #214D32 55%, #2F6B45 100%)",
          color: C.white,
          padding: "28px 21px 31px",
          borderRadius: "0 0 28px 28px",
          boxShadow: "0 12px 28px rgba(33,77,50,0.14)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            right: -90,
            top: -125,
            border: "1px solid rgba(255,255,255,0.11)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 145,
            height: 145,
            right: -50,
            top: -85,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1068,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              color: "#D8C5AD",
              fontSize: 10,
              fontWeight: 850,
              letterSpacing: 3,
              marginBottom: 9,
            }}
          >
            PAJARA STUDIO
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(27px, 5vw, 32px)",
              fontWeight: 850,
              letterSpacing: -0.9,
            }}
          >
            Keuangan
          </h1>

          <p
            style={{
              maxWidth: 390,
              margin: "9px 0 0",
              color: "#D9E4DA",
              fontSize: 12,
              lineHeight: 1.8,
            }}
          >
            Pantau pemasukan, pengeluaran, dan saldo Pajara Studio dalam
            satu tempat.
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: 18,
              padding: "8px 11px",
              border: "1px solid rgba(255,255,255,.16)",
              borderRadius: 10,
              background: "rgba(255,255,255,.08)",
              color: "#FFFFFF",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#B9D8B5",
              }}
            />
            Ringkasan keuangan
          </div>
        </div>
      </header>

      <div className="finance-content">
        <section className="finance-summary">
          <SummaryCard
            label="Total Pemasukan"
            value={formatRupiah(totalIncome)}
            icon="↗"
            tone="income"
          />

          <SummaryCard
            label="Total Pengeluaran"
            value={formatRupiah(totalExpense)}
            icon="↘"
            tone="expense"
          />

          <SummaryCard
            label="Saldo Bersih"
            value={formatRupiah(balance)}
            icon="Rp"
            tone="balance"
          />
        </section>

        <section className="finance-panel">
          <div style={{ marginBottom: 20 }}>
            <p style={styles.eyebrow}>CATAT TRANSAKSI</p>

            <h2 style={styles.sectionTitle}>Tambah Transaksi</h2>

            <p style={styles.mutedText}>
              Simpan setiap pemasukan dan pengeluaran agar catatan
              keuangan tetap teratur.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="finance-form-grid">
              <label className="finance-field">
                Jenis Transaksi
                <select
                  className="finance-input"
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "income" | "expense")
                  }
                  disabled={saving}
                >
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </label>

              <label className="finance-field">
                Nominal (Rp)
                <input
                  className="finance-input"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  placeholder="Contoh: 150000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={saving}
                />
              </label>

              <label className="finance-field">
                Kategori
                <input
                  className="finance-input"
                  type="text"
                  placeholder="Contoh: Desain Logo"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  maxLength={100}
                  disabled={saving}
                />
              </label>

              <label className="finance-field">
                Tanggal Transaksi
                <input
                  className="finance-input"
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                  disabled={saving}
                />
              </label>
            </div>

            <label
              className="finance-field"
              style={{ marginTop: 15 }}
            >
              Keterangan
              <textarea
                className="finance-input"
                placeholder="Contoh: Pembayaran desain dari pelanggan"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={1000}
                style={{ resize: "vertical", lineHeight: 1.65 }}
                disabled={saving}
              />
            </label>

            {message && (
              <div
                role="status"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  marginTop: 16,
                  padding: "12px 13px",
                  borderRadius: 12,
                  border:
                    messageType === "success"
                      ? "1px solid #D5E5D2"
                      : "1px solid #EACBC2",
                  background:
                    messageType === "success" ? C.softGreen : C.softDanger,
                  color:
                    messageType === "success" ? C.green : C.danger,
                  fontSize: 12,
                  lineHeight: 1.7,
                  fontWeight: 700,
                  overflowWrap: "anywhere",
                }}
              >
                <span aria-hidden="true">
                  {messageType === "success" ? "✓" : "!"}
                </span>
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              className="finance-primary"
              disabled={saving}
              style={{ marginTop: 17 }}
            >
              {saving ? "Menyimpan transaksi..." : "+ Tambah Transaksi"}
            </button>
          </form>
        </section>

        <section className="finance-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 19,
            }}
          >
            <div>
              <p style={styles.eyebrow}>CATATAN KEUANGAN</p>

              <h2 style={styles.sectionTitle}>Riwayat Transaksi</h2>

              <p style={styles.mutedText}>
                {transactions.length} transaksi tercatat
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setMessage("");
                await loadTransactions();
                setLoading(false);
              }}
              disabled={loading}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 11,
                padding: "9px 12px",
                background: C.white,
                color: C.green,
                fontSize: 11,
                fontWeight: 800,
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Memuat..." : "↻ Muat Ulang"}
            </button>
          </div>

          {loading ? (
            <div style={styles.emptyState}>
              <div style={{ fontWeight: 800, color: C.green }}>
                Memuat transaksi...
              </div>
              <p style={styles.mutedText}>
                Mohon tunggu sebentar.
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div style={styles.emptyState}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  margin: "0 auto 13px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 17,
                  background: C.softGreen,
                  color: C.green,
                  fontSize: 23,
                  fontWeight: 800,
                }}
              >
                Rp
              </div>

              <h3
                style={{
                  margin: "0 0 7px",
                  fontSize: 15,
                  fontWeight: 850,
                  color: C.green,
                }}
              >
                Belum ada transaksi
              </h3>

              <p style={{ ...styles.mutedText, maxWidth: 270, margin: "0 auto" }}>
                Transaksi yang kamu tambahkan akan muncul di bagian ini.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {transactions.map((transaction) => {
                const isIncome = transaction.type === "income";

                return (
                  <article
                    key={transaction.id}
                    className="finance-transaction"
                  >
                    <div className="finance-transaction-main">
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          flex: "0 0 42px",
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 14,
                          background: isIncome ? C.softGreen : C.softBrown,
                          color: isIncome ? C.greenLight : C.brown,
                          fontSize: 19,
                          fontWeight: 900,
                        }}
                      >
                        {isIncome ? "↗" : "↘"}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            color: C.green,
                            fontSize: 13,
                            fontWeight: 850,
                            lineHeight: 1.5,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {transaction.category}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 7,
                            marginTop: 5,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 7px",
                              borderRadius: 7,
                              background: isIncome ? C.softGreen : C.softBrown,
                              color: isIncome ? C.greenLight : C.brown,
                              fontSize: 9,
                              fontWeight: 850,
                            }}
                          >
                            {isIncome ? "PEMASUKAN" : "PENGELUARAN"}
                          </span>

                          <span style={{ color: C.muted, fontSize: 10 }}>
                            {formatDate(transaction.transaction_date)}
                          </span>
                        </div>

                        {transaction.description && (
                          <p
                            style={{
                              margin: "7px 0 0",
                              color: "#737A73",
                              fontSize: 11,
                              lineHeight: 1.7,
                              overflowWrap: "anywhere",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="finance-transaction-end">
                      <strong
                        style={{
                          color: isIncome ? C.greenLight : C.brown,
                          fontSize: 13,
                          fontWeight: 850,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {isIncome ? "+" : "−"}
                        {formatRupiah(Number(transaction.amount))}
                      </strong>

                      <button
                        type="button"
                        className="finance-delete"
                        onClick={() => handleDelete(transaction.id)}
                        disabled={deletingId !== null}
                      >
                        {deletingId === transaction.id
                          ? "Menghapus..."
                          : "Hapus"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            minHeight: 45,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            background: "rgba(255,255,255,.55)",
            color: C.brown,
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Keluar dari Admin
        </button>

        <footer style={{ textAlign: "center", padding: "25px 8px 0" }}>
          <p
            style={{
              margin: 0,
              color: C.green,
              fontSize: 10,
              fontWeight: 850,
              letterSpacing: 2,
            }}
          >
            PAJARA STUDIO
          </p>

          <p style={{ margin: "7px 0 0", color: C.muted, fontSize: 10 }}>
            Berakar di Tanah Pasundan.
          </p>
        </footer>
      </div>

      {/* Navigasi bawah menggunakan BottomNavigation global di layout.tsx */}
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: string;
  tone: "income" | "expense" | "balance";
}) {
  const accent =
    tone === "expense" ? C.brown : C.greenLight;

  const iconBackground =
    tone === "expense" ? C.softBrown : C.softGreen;

  return (
    <div
      className="finance-summary-card"
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 19,
        padding: 18,
        minWidth: 0,
        boxShadow: "0 7px 24px rgba(33,77,50,.045)",
      }}
    >
      <div
        className="finance-summary-icon"
        style={{
          width: 40,
          height: 40,
          borderRadius: 13,
          background: iconBackground,
          color: accent,
          display: "grid",
          placeItems: "center",
          fontSize: 18,
          fontWeight: 900,
          marginBottom: 15,
        }}
      >
        {icon}
      </div>

      <div className="finance-summary-info">
        <div
          style={{
            fontSize: 11,
            color: C.muted,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          {label}
        </div>

        <div
          className="finance-summary-value"
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: C.green,
            letterSpacing: -0.5,
            overflowWrap: "anywhere",
            lineHeight: 1.45,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: C.background,
    color: C.green,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  loadingScreen: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: C.green,
    color: C.white,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    marginBottom: 16,
    boxShadow: "0 8px 24px rgba(33,77,50,0.18)",
  },

  eyebrow: {
    margin: "0 0 7px",
    color: C.brown,
    fontSize: 9,
    fontWeight: 850,
    letterSpacing: 1.8,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 19,
    fontWeight: 850,
    letterSpacing: -0.45,
  },

  mutedText: {
    margin: "6px 0 0",
    color: C.muted,
    fontSize: 12,
    lineHeight: 1.75,
  },

  emptyState: {
    padding: "30px 18px",
    textAlign: "center",
    borderRadius: 16,
    background: C.background,
    border: `1px dashed ${C.border}`,
  },
};
