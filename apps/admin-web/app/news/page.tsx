
"use client";

import { useCallback, useEffect, useState } from "react";
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

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image: string | null;
  category_id: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
};

const EMPTY_FORM = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  cover_image: "",
  category_id: "",
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDate(value: string | null) {
  if (!value) return "Belum diterbitkan";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: Article["status"]) {
  if (status === "published") return "Terbit";
  if (status === "archived") return "Diarsipkan";
  return "Draf";
}

export default function NewsAdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
      await supabase.auth.signOut();
      router.replace("/");
      return;
    }

    setAuthorized(true);

    const [articleResult, categoryResult] = await Promise.all([
      supabase
        .from("news_articles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("news_categories")
        .select("id, name, slug")
        .order("name", { ascending: true }),
    ]);

    if (articleResult.error) {
      setError(
        "Artikel gagal dimuat: " + articleResult.error.message
      );
    } else {
      setArticles((articleResult.data || []) as Article[]);
    }

    if (categoryResult.error) {
      setError(
        "Kategori gagal dimuat: " + categoryResult.error.message
      );
    } else {
      setCategories((categoryResult.data || []) as Category[]);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openNewArticle = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setError("");
    setEditorOpen(true);
  };

  const openEditArticle = (article: Article) => {
    setEditingId(article.id);
    setForm({
      title: article.title || "",
      slug: article.slug || "",
      summary: article.summary || "",
      content: article.content || "",
      cover_image: article.cover_image || "",
      category_id: article.category_id || "",
    });
    setMessage("");
    setError("");
    setEditorOpen(true);
  };

  const updateField = (
    field: keyof typeof EMPTY_FORM,
    value: string
  ) => {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "title" && !editingId) {
        next.slug = makeSlug(value);
      }

      return next;
    });
  };

  const saveArticle = async (
    targetStatus: "draft" | "published"
  ) => {
    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError("Judul artikel wajib diisi.");
      return;
    }

    if (!form.content.trim()) {
      setError("Isi artikel wajib diisi.");
      return;
    }

    const slug = makeSlug(form.slug || form.title);

    if (!slug) {
      setError("Slug artikel tidak valid.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      router.replace("/");
      return;
    }

    const { data: existing } = await supabase
      .from("news_articles")
      .select("published_at")
      .eq("id", editingId || "00000000-0000-0000-0000-000000000000")
      .maybeSingle();

    const payload = {
      title: form.title.trim(),
      slug,
      summary: form.summary.trim(),
      content: form.content.trim(),
      cover_image: form.cover_image.trim() || null,
      category_id: form.category_id || null,
      status: targetStatus,
      author_id: user.id,
      published_at:
        targetStatus === "published"
          ? existing?.published_at || new Date().toISOString()
          : null,
      updated_at: new Date().toISOString(),
    };

    const result = editingId
      ? await supabase
          .from("news_articles")
          .update(payload)
          .eq("id", editingId)
      : await supabase.from("news_articles").insert(payload);

    if (result.error) {
      setError("Gagal menyimpan artikel: " + result.error.message);
      setSaving(false);
      return;
    }

    setMessage(
      targetStatus === "published"
        ? "Artikel berhasil diterbitkan."
        : "Draf artikel berhasil disimpan."
    );
    setEditorOpen(false);
    setSaving(false);
    await loadData();
  };

  const changeStatus = async (
    article: Article,
    status: Article["status"]
  ) => {
    const question =
      status === "published"
        ? "Terbitkan artikel ini?"
        : status === "archived"
          ? "Arsipkan artikel ini?"
          : "Kembalikan artikel ini menjadi draf?";

    if (!window.confirm(question)) return;

    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("news_articles")
      .update({
        status,
        published_at:
          status === "published"
            ? article.published_at || new Date().toISOString()
            : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id);

    if (updateError) {
      setError("Gagal mengubah status: " + updateError.message);
      return;
    }

    setMessage("Status artikel berhasil diperbarui.");
    await loadData();
  };

  const deleteArticle = async (article: Article) => {
    if (
      !window.confirm(
        `Hapus artikel "${article.title}" secara permanen?`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("news_articles")
      .delete()
      .eq("id", article.id);

    if (deleteError) {
      setError("Gagal menghapus artikel: " + deleteError.message);
      return;
    }

    setMessage("Artikel berhasil dihapus.");
    await loadData();
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.slug.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || article.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    all: articles.length,
    draft: articles.filter((a) => a.status === "draft").length,
    published: articles.filter((a) => a.status === "published").length,
    archived: articles.filter((a) => a.status === "archived").length,
  };

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loading}>Memuat Pajara News...</div>
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>PAJARA STUDIO · CMS</div>
            <h1 style={styles.heading}>Pajara News</h1>
            <p style={styles.subtitle}>
              Kelola artikel, edukasi, dan berita Pajara Studio.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewArticle}
            style={styles.primaryButton}
          >
            + Tulis Artikel
          </button>
        </header>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <section style={styles.statsGrid}>
          {[
            { label: "Semua Artikel", value: stats.all, filter: "all" },
            { label: "Draf", value: stats.draft, filter: "draft" },
            {
              label: "Sudah Terbit",
              value: stats.published,
              filter: "published",
            },
            {
              label: "Diarsipkan",
              value: stats.archived,
              filter: "archived",
            },
          ].map((item) => (
            <button
              key={item.filter}
              type="button"
              onClick={() => setStatusFilter(item.filter)}
              style={{
                ...styles.statCard,
                borderColor:
                  statusFilter === item.filter ? C.green2 : C.border,
              }}
            >
              <span style={styles.statLabel}>{item.label}</span>
              <strong style={styles.statNumber}>{item.value}</strong>
            </button>
          ))}
        </section>

        {editorOpen && (
          <section style={styles.editor}>
            <div style={styles.editorHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  {editingId ? "Edit Artikel" : "Artikel Baru"}
                </h2>
                <p style={styles.smallMuted}>
                  Isi informasi artikel sebelum menyimpan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                style={styles.closeButton}
              >
                Tutup
              </button>
            </div>

            <label style={styles.label}>Judul Artikel *</label>
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Contoh: Mengenal Identitas Visual Brand"
              style={styles.input}
            />

            <label style={styles.label}>Slug URL</label>
            <input
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="mengenal-identitas-visual-brand"
              style={styles.input}
            />
            <p style={styles.hint}>
              Alamat artikel nantinya menggunakan slug ini.
            </p>

            <label style={styles.label}>Kategori</label>
            <select
              value={form.category_id}
              onChange={(e) =>
                updateField("category_id", e.target.value)
              }
              style={styles.input}
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label style={styles.label}>URL Gambar Sampul</label>
            <input
              value={form.cover_image}
              onChange={(e) =>
                updateField("cover_image", e.target.value)
              }
              placeholder="https://..."
              style={styles.input}
            />
            <p style={styles.hint}>
              Unggah gambar dan integrasi penyimpanan akan kita kerjakan
              pada tahap berikutnya.
            </p>

            <label style={styles.label}>Ringkasan Artikel</label>
            <textarea
              value={form.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="Ringkasan singkat untuk kartu artikel..."
              rows={3}
              style={styles.textarea}
            />

            <label style={styles.label}>Isi Artikel *</label>
            <textarea
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
              placeholder="Tulis isi artikel di sini..."
              rows={10}
              style={styles.textarea}
            />

            <div style={styles.editorActions}>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveArticle("draft")}
                style={styles.secondaryButton}
              >
                {saving ? "Menyimpan..." : "Simpan Draf"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveArticle("published")}
                style={styles.primaryButton}
              >
                {saving ? "Menyimpan..." : "Terbitkan"}
              </button>
            </div>
          </section>
        )}

        <section style={styles.listSection}>
          <div style={styles.listHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Daftar Artikel</h2>
              <p style={styles.smallMuted}>
                {filteredArticles.length} artikel ditemukan
              </p>
            </div>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau slug artikel..."
            style={styles.searchInput}
          />

          <div style={styles.filterRow}>
            {[
              ["all", "Semua"],
              ["draft", "Draf"],
              ["published", "Terbit"],
              ["archived", "Arsip"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                style={{
                  ...styles.filterButton,
                  ...(statusFilter === value
                    ? styles.filterButtonActive
                    : {}),
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredArticles.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>✎</div>
              <h3 style={styles.emptyTitle}>Belum ada artikel</h3>
              <p style={styles.smallMuted}>
                Buat artikel pertama untuk mulai mengisi Pajara News.
              </p>
              <button
                type="button"
                onClick={openNewArticle}
                style={styles.primaryButton}
              >
                Tulis Artikel Pertama
              </button>
            </div>
          ) : (
            <div style={styles.articleList}>
              {filteredArticles.map((article) => (
                <article key={article.id} style={styles.articleCard}>
                  <div style={styles.articleMain}>
                    {article.cover_image ? (
                      <img
                        src={article.cover_image}
                        alt=""
                        style={styles.cover}
                      />
                    ) : (
                      <div style={styles.coverPlaceholder}>PN</div>
                    )}

                    <div style={styles.articleInfo}>
                      <div style={styles.articleTopline}>
                        <span
                          style={{
                            ...styles.status,
                            ...(article.status === "published"
                              ? styles.statusPublished
                              : article.status === "archived"
                                ? styles.statusArchived
                                : styles.statusDraft),
                          }}
                        >
                          {statusLabel(article.status)}
                        </span>
                        <span style={styles.date}>
                          {formatDate(
                            article.status === "published"
                              ? article.published_at
                              : article.created_at
                          )}
                        </span>
                      </div>

                      <h3 style={styles.articleTitle}>
                        {article.title}
                      </h3>
                      <p style={styles.articleSlug}>/{article.slug}</p>
                      {article.summary && (
                        <p style={styles.summary}>{article.summary}</p>
                      )}
                    </div>
                  </div>

                  <div style={styles.articleActions}>
                    <button
                      type="button"
                      onClick={() => openEditArticle(article)}
                      style={styles.actionButton}
                    >
                      Edit
                    </button>

                    {article.status !== "published" && (
                      <button
                        type="button"
                        onClick={() =>
                          void changeStatus(article, "published")
                        }
                        style={styles.actionButtonGreen}
                      >
                        Terbitkan
                      </button>
                    )}

                    {article.status === "published" && (
                      <button
                        type="button"
                        onClick={() =>
                          void changeStatus(article, "draft")
                        }
                        style={styles.actionButton}
                      >
                        Jadikan Draf
                      </button>
                    )}

                    {article.status !== "archived" && (
                      <button
                        type="button"
                        onClick={() =>
                          void changeStatus(article, "archived")
                        }
                        style={styles.actionButton}
                      >
                        Arsip
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void deleteArticle(article)}
                      style={styles.deleteButton}
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer style={styles.footer}>
          Pajara News · Berakar di Tanah Pasundan.
        </footer>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    padding: "28px 16px 100px",
    color: C.text,
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  container: { maxWidth: 1050, margin: "0 auto" },
  loading: {
    maxWidth: 1050,
    margin: "80px auto",
    textAlign: "center",
    color: C.muted,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 26,
  },
  eyebrow: {
    color: C.brown,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 2,
    marginBottom: 9,
  },
  heading: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "clamp(30px, 5vw, 42px)",
    color: C.green,
    letterSpacing: -1,
  },
  subtitle: {
    margin: "10px 0 0",
    color: C.muted,
    fontSize: 14,
    lineHeight: 1.6,
  },
  primaryButton: {
    border: 0,
    borderRadius: 12,
    background: C.green,
    color: C.white,
    padding: "13px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    background: C.white,
    color: C.green,
    padding: "13px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  success: {
    padding: 14,
    marginBottom: 16,
    borderRadius: 12,
    background: C.softGreen,
    color: C.green,
    fontSize: 13,
  },
  error: {
    padding: 14,
    marginBottom: 16,
    borderRadius: 12,
    background: "#FCE8E8",
    color: C.red,
    fontSize: 13,
    overflowWrap: "anywhere",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
    padding: 18,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    background: C.white,
    textAlign: "left",
    cursor: "pointer",
  },
  statLabel: { fontSize: 12, color: C.muted },
  statNumber: {
    fontSize: 28,
    color: C.green,
    fontFamily: "Georgia, serif",
  },
  editor: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  editorHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    margin: 0,
    color: C.green,
    fontSize: 20,
    fontFamily: "Georgia, serif",
  },
  smallMuted: {
    margin: "7px 0 0",
    fontSize: 12,
    lineHeight: 1.6,
    color: C.muted,
  },
  closeButton: {
    border: `1px solid ${C.border}`,
    background: C.white,
    color: C.text,
    borderRadius: 10,
    padding: "9px 12px",
    cursor: "pointer",
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: C.green,
    margin: "17px 0 8px",
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: `1px solid ${C.border}`,
    borderRadius: 11,
    background: "#FFFEFC",
    color: C.text,
    fontSize: 14,
    outlineColor: C.green2,
  },
  textarea: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: `1px solid ${C.border}`,
    borderRadius: 11,
    background: "#FFFEFC",
    color: C.text,
    fontSize: 14,
    lineHeight: 1.7,
    resize: "vertical",
    outlineColor: C.green2,
  },
  hint: { margin: "6px 0 0", color: C.muted, fontSize: 11 },
  editorActions: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 22,
  },
  listSection: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    padding: 20,
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: `1px solid ${C.border}`,
    borderRadius: 11,
    background: "#FFFEFC",
    fontSize: 14,
    outlineColor: C.green2,
  },
  filterRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    margin: "14px 0 18px",
  },
  filterButton: {
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    background: C.white,
    color: C.muted,
    padding: "8px 13px",
    fontSize: 12,
    cursor: "pointer",
  },
  filterButtonActive: {
    borderColor: C.green,
    background: C.softGreen,
    color: C.green,
    fontWeight: 700,
  },
  empty: {
    padding: "38px 12px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    background: C.softBrown,
    color: C.brown,
    display: "grid",
    placeItems: "center",
    fontSize: 27,
  },
  emptyTitle: {
    margin: 0,
    color: C.green,
    fontFamily: "Georgia, serif",
    fontSize: 21,
  },
  articleList: { display: "flex", flexDirection: "column", gap: 12 },
  articleCard: {
    padding: 14,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    background: "#FFFEFC",
  },
  articleMain: {
    display: "flex",
    alignItems: "flex-start",
    gap: 13,
    minWidth: 0,
  },
  cover: {
    width: 76,
    height: 76,
    borderRadius: 10,
    objectFit: "cover",
    flexShrink: 0,
    background: C.bg,
  },
  coverPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    background: C.softGreen,
    color: C.green,
    fontFamily: "Georgia, serif",
    fontWeight: 700,
  },
  articleInfo: { minWidth: 0, flex: 1 },
  articleTopline: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  status: {
    padding: "5px 9px",
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
  },
  statusPublished: { background: C.softGreen, color: C.green },
  statusDraft: { background: C.softBrown, color: C.brown },
  statusArchived: { background: "#ECECEC", color: "#626262" },
  date: { color: C.muted, fontSize: 10 },
  articleTitle: {
    margin: 0,
    color: C.green,
    fontSize: 16,
    lineHeight: 1.4,
    overflowWrap: "anywhere",
  },
  articleSlug: {
    margin: "5px 0 0",
    color: C.brown,
    fontSize: 11,
    overflowWrap: "anywhere",
  },
  summary: {
    margin: "8px 0 0",
    color: C.muted,
    fontSize: 12,
    lineHeight: 1.6,
    overflowWrap: "anywhere",
  },
  articleActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
    paddingTop: 12,
    borderTop: `1px solid ${C.border}`,
  },
  actionButton: {
    border: `1px solid ${C.border}`,
    borderRadius: 9,
    background: C.white,
    color: C.text,
    padding: "8px 11px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  },
  actionButtonGreen: {
    border: `1px solid ${C.green}`,
    borderRadius: 9,
    background: C.softGreen,
    color: C.green,
    padding: "8px 11px",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  },
  deleteButton: {
    border: "1px solid #F0D7D7",
    borderRadius: 9,
    background: "#FFF7F7",
    color: C.red,
    padding: "8px 11px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    padding: "28px 10px 0",
    color: C.muted,
    fontSize: 11,
  },
};
