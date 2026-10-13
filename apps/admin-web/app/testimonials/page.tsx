
"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const C = {
  bg: "#F7F4EE",
  green: "#214D32",
  green2: "#2F6B45",
  brown: "#8A6A4A",
  white: "#FFFFFF",
  text: "#26342A",
  muted: "#777D75",
  border: "#E7DFD5",
  softGreen: "#E7F0E7",
  softBrown: "#F2E8DD",
  red: "#B93838",
};

type Testimonial = {
  id: string;
  customer_id: string | null;
  order_id: string | null;
  customer_name: string;
  content: string;
  rating: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

const EMPTY_FORM = {
  customer_name: "",
  content: "",
  rating: "5",
  is_published: false,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function TestimonialsAdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.replace("/");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles_v2")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      setError("Akses hanya tersedia untuk admin Pajara Studio.");
      setLoading(false);
      return;
    }

    setAuthorized(true);

    const { data, error: queryError } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError("Gagal memuat testimoni: " + queryError.message);
    } else {
      setItems((data || []) as Testimonial[]);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setError("");
    setEditorOpen(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditingId(item.id);
    setForm({
      customer_name: item.customer_name || "",
      content: item.content || "",
      rating: String(item.rating ?? 5),
      is_published: item.is_published,
    });
    setMessage("");
    setError("");
    setEditorOpen(true);
  };

  const updateField = (
    field: keyof typeof EMPTY_FORM,
    value: string | boolean
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveTestimonial = async () => {
    setError("");
    setMessage("");

    if (!form.customer_name.trim()) {
      setError("Nama pelanggan wajib diisi.");
      return;
    }

    if (!form.content.trim()) {
      setError("Isi testimoni wajib diisi.");
      return;
    }

    const rating = Number(form.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Rating harus berupa angka 1 sampai 5.");
      return;
    }

    setSaving(true);

    const payload = {
      customer_name: form.customer_name.trim(),
      content: form.content.trim(),
      rating,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    };

    const result = editingId
      ? await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", editingId)
      : await supabase.from("testimonials").insert(payload);

    if (result.error) {
      setError("Gagal menyimpan testimoni: " + result.error.message);
      setSaving(false);
      return;
    }

    setMessage(
      editingId
        ? "Testimoni berhasil diperbarui."
        : "Testimoni berhasil ditambahkan."
    );
    setEditorOpen(false);
    setSaving(false);
    await loadData();
  };

  const togglePublished = async (item: Testimonial) => {
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("testimonials")
      .update({
        is_published: !item.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (updateError) {
      setError("Gagal mengubah status: " + updateError.message);
      return;
    }

    setMessage(
      item.is_published
        ? "Testimoni berhasil disembunyikan."
        : "Testimoni berhasil diterbitkan."
    );

    await loadData();
  };

  const deleteTestimonial = async (item: Testimonial) => {
    if (
      !window.confirm(
        `Hapus testimoni dari "${item.customer_name}" secara permanen?`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      setError("Gagal menghapus testimoni: " + deleteError.message);
      return;
    }

    setMessage("Testimoni berhasil dihapus.");
    await loadData();
  };

  const filtered = items.filter((item) => {
    const term = search.toLowerCase();

    const matchesSearch =
      item.customer_name.toLowerCase().includes(term) ||
      item.content.toLowerCase().includes(term);

    const matchesFilter =
      filter === "all" ||
      (filter === "published" && item.is_published) ||
      (filter === "hidden" && !item.is_published);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    all: items.length,
    published: items.filter((item) => item.is_published).length,
    hidden: items.filter((item) => !item.is_published).length,
  };

  if (loading) {
    return <main style={S.page}><p>Memuat testimoni...</p></main>;
  }

  if (!authorized) {
    return (
      <main style={S.page}>
        <div style={S.container}>
          <div style={S.error}>{error || "Akses admin diperlukan."}</div>
        </div>
      </main>
    );
  }

  return (
    <main style={S.page}>
      <div style={S.container}>
        <header style={S.header}>
          <div>
            <div style={S.eyebrow}>PAJARA STUDIO · CMS</div>
            <h1 style={S.heading}>Testimoni</h1>
            <p style={S.subtitle}>
              Kelola cerita dan pengalaman pelanggan Pajara Studio.
            </p>
          </div>
          <button type="button" onClick={openNew} style={S.primary}>
            + Tambah Testimoni
          </button>
        </header>

        {message && <div style={S.success}>{message}</div>}
        {error && <div style={S.error}>{error}</div>}

        <section style={S.stats}>
          {[
            { key: "all", label: "Semua", value: stats.all },
            { key: "published", label: "Diterbitkan", value: stats.published },
            { key: "hidden", label: "Disembunyikan", value: stats.hidden },
          ].map((stat) => (
            <button
              key={stat.key}
              type="button"
              onClick={() => setFilter(stat.key)}
              style={{
                ...S.statCard,
                borderColor: filter === stat.key ? C.green2 : C.border,
              }}
            >
              <span style={S.muted}>{stat.label}</span>
              <strong style={S.statNumber}>{stat.value}</strong>
            </button>
          ))}
        </section>

        {editorOpen && (
          <section style={S.panel}>
            <h2 style={S.sectionTitle}>
              {editingId ? "Edit Testimoni" : "Tambah Testimoni"}
            </h2>

            <label style={S.label}>Nama Pelanggan *</label>
            <input
              value={form.customer_name}
              onChange={(e) => updateField("customer_name", e.target.value)}
              placeholder="Contoh: Teh Rina"
              style={S.input}
            />

            <label style={S.label}>Isi Testimoni *</label>
            <textarea
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
              placeholder="Tuliskan pengalaman pelanggan..."
              rows={5}
              style={S.textarea}
            />

            <label style={S.label}>Rating</label>
            <select
              value={form.rating}
              onChange={(e) => updateField("rating", e.target.value)}
              style={S.input}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={String(value)}>
                  {"★".repeat(value)}{"☆".repeat(5 - value)} ({value}/5)
                </option>
              ))}
            </select>

            <label style={S.checkLabel}>
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) =>
                  updateField("is_published", e.target.checked)
                }
              />
              <span>
                <strong>Terbitkan testimoni</strong>
                <small>
                  Testimoni yang diterbitkan dapat ditampilkan di website
                  setelah integrasi publik selesai.
                </small>
              </span>
            </label>

            <div style={S.actions}>
              <button
                type="button"
                style={S.secondary}
                disabled={saving}
                onClick={() => setEditorOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                style={S.primary}
                disabled={saving}
                onClick={() => void saveTestimonial()}
              >
                {saving ? "Menyimpan..." : "Simpan Testimoni"}
              </button>
            </div>
          </section>
        )}

        <section style={S.panel}>
          <h2 style={S.sectionTitle}>Daftar Testimoni</h2>
          <p style={S.muted}>{filtered.length} testimoni ditemukan</p>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau isi testimoni..."
            style={S.input}
          />

          <div style={S.filterRow}>
            {[
              ["all", "Semua"],
              ["published", "Diterbitkan"],
              ["hidden", "Disembunyikan"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                style={{
                  ...S.filterButton,
                  ...(filter === value ? S.filterActive : {}),
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={S.empty}>
              Belum ada testimoni yang sesuai. Tambahkan testimoni baru
              menggunakan tombol di atas.
            </div>
          ) : (
            <div style={S.list}>
              {filtered.map((item) => (
                <article key={item.id} style={S.card}>
                  <div style={S.cardTop}>
                    <div>
                      <h3 style={S.customer}>{item.customer_name}</h3>
                      <div style={S.stars}>
                        {"★".repeat(Math.max(0, Math.min(5, item.rating ?? 0)))}
                        {"☆".repeat(
                          5 - Math.max(0, Math.min(5, item.rating ?? 0))
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        ...S.badge,
                        background: item.is_published
                          ? C.softGreen
                          : "#ECECEC",
                        color: item.is_published ? C.green : C.muted,
                      }}
                    >
                      {item.is_published ? "Diterbitkan" : "Disembunyikan"}
                    </span>
                  </div>

                  <p style={S.content}>{item.content}</p>
                  <p style={S.date}>{formatDate(item.created_at)}</p>

                  <div style={S.actions}>
                    <button
                      type="button"
                      style={S.secondary}
                      onClick={() => openEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      style={S.secondary}
                      onClick={() => void togglePublished(item)}
                    >
                      {item.is_published ? "Sembunyikan" : "Terbitkan"}
                    </button>
                    <button
                      type="button"
                      style={S.delete}
                      onClick={() => void deleteTestimonial(item)}
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer style={S.footer}>
          Pajara Studio · Berakar di Tanah Pasundan.
        </footer>
      </div>
    </main>
  );
}

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    color: C.text,
    padding: "28px 16px 100px",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  container: { maxWidth: 950, margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  eyebrow: {
    color: C.brown,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 2,
    marginBottom: 8,
  },
  heading: {
    margin: 0,
    color: C.green,
    fontFamily: "Georgia, serif",
    fontSize: "clamp(30px, 5vw, 42px)",
  },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 1.6 },
  primary: {
    border: 0,
    borderRadius: 11,
    background: C.green,
    color: C.white,
    padding: "12px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondary: {
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    background: C.white,
    color: C.green,
    padding: "10px 13px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  success: {
    padding: 14,
    marginBottom: 15,
    borderRadius: 12,
    background: C.softGreen,
    color: C.green,
    fontSize: 13,
    overflowWrap: "anywhere",
  },
  error: {
    padding: 14,
    marginBottom: 15,
    borderRadius: 12,
    background: "#FCE8E8",
    color: C.red,
    fontSize: 13,
    overflowWrap: "anywhere",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    border: `1px solid ${C.border}`,
    borderRadius: 15,
    padding: 17,
    background: C.white,
    cursor: "pointer",
  },
  statNumber: { color: C.green, fontSize: 27, fontFamily: "Georgia, serif" },
  muted: { color: C.muted, fontSize: 12, lineHeight: 1.6 },
  panel: {
    border: `1px solid ${C.border}`,
    borderRadius: 17,
    padding: 20,
    background: C.white,
    marginBottom: 22,
  },
  sectionTitle: {
    margin: "0 0 10px",
    color: C.green,
    fontFamily: "Georgia, serif",
    fontSize: 21,
  },
  label: {
    display: "block",
    margin: "17px 0 8px",
    color: C.green,
    fontSize: 12,
    fontWeight: 700,
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    background: "#FFFEFC",
    color: C.text,
    fontSize: 14,
    marginTop: 10,
  },
  textarea: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    background: "#FFFEFC",
    color: C.text,
    fontSize: 14,
    lineHeight: 1.7,
    resize: "vertical",
  },
  checkLabel: {
    display: "flex",
    gap: 11,
    alignItems: "flex-start",
    padding: 14,
    marginTop: 17,
    border: `1px solid ${C.border}`,
    borderRadius: 11,
    fontSize: 13,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 15,
  },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", margin: "15px 0" },
  filterButton: {
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    background: C.white,
    color: C.muted,
    padding: "8px 13px",
    fontSize: 12,
    cursor: "pointer",
  },
  filterActive: {
    borderColor: C.green,
    background: C.softGreen,
    color: C.green,
    fontWeight: 700,
  },
  list: { display: "grid", gap: 13, marginTop: 15 },
  card: {
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: 16,
    background: "#FFFEFC",
    minWidth: 0,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  customer: { margin: 0, color: C.green, fontSize: 16 },
  stars: { color: C.brown, letterSpacing: 2, marginTop: 7, fontSize: 15 },
  badge: {
    padding: "6px 9px",
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
  },
  content: {
    color: C.text,
    fontSize: 13,
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: "14px 0",
  },
  date: { color: C.muted, fontSize: 11 },
  delete: {
    border: "1px solid #F0D7D7",
    borderRadius: 10,
    background: "#FFF7F7",
    color: C.red,
    padding: "10px 13px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  empty: {
    padding: "30px 10px",
    textAlign: "center",
    color: C.muted,
    fontSize: 13,
    lineHeight: 1.7,
  },
  footer: {
    textAlign: "center",
    color: C.muted,
    fontSize: 11,
    paddingTop: 15,
  },
};
