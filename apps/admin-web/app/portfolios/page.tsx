
"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const BUCKET = "pajara-portfolio";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

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

type Portfolio = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  image_path: string;
  project_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const EMPTY_FORM = {
  title: "",
  category: "",
  description: "",
  project_url: "",
  image_path: "",
  is_featured: false,
  is_active: true,
  sort_order: "0",
};

function isPublicUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function getStoragePath(value: string): string | null {
  if (!value || isPublicUrl(value)) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = value.indexOf(marker);

  if (index >= 0) {
    return decodeURIComponent(value.slice(index + marker.length));
  }

  if (!value.startsWith("/") && !value.includes("://")) {
    return value;
  }

  return null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function PortfoliosAdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

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

    const { data, error: queryError } = await supabase
      .from("portfolios")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (queryError) {
      setError("Gagal memuat portofolio: " + queryError.message);
    } else {
      setPortfolios((data || []) as Portfolio[]);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setMessage("");
    setError("");
    setEditorOpen(true);
  };

  const openEdit = (item: Portfolio) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      category: item.category || "",
      description: item.description || "",
      project_url: item.project_url || "",
      image_path: item.image_path || "",
      is_featured: item.is_featured,
      is_active: item.is_active,
      sort_order: String(item.sort_order ?? 0),
    });
    setSelectedFile(null);
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

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      setError("Pilih file gambar yang valid.");
      return null;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Ukuran gambar maksimal 10 MB.");
      return null;
    }

    setUploading(true);

    const safeName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-");

    const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setError("Upload gambar gagal: " + uploadError.message);
      setUploading(false);
      return null;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    setUploading(false);
    return data.publicUrl;
  };

  const savePortfolio = async () => {
    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError("Judul karya wajib diisi.");
      return;
    }

    if (!form.image_path.trim() && !selectedFile) {
      setError("Gambar karya wajib diunggah atau URL gambar diisi.");
      return;
    }

    if (
      form.project_url.trim() &&
      !/^https?:\/\//i.test(form.project_url.trim())
    ) {
      setError("Tautan proyek harus diawali https:// atau http://.");
      return;
    }

    const order = Number(form.sort_order);

    if (!Number.isInteger(order)) {
      setError("Urutan harus berupa bilangan bulat.");
      return;
    }

    setSaving(true);

    let imagePath = form.image_path.trim();

    if (selectedFile) {
      const uploaded = await uploadImage(selectedFile);

      if (!uploaded) {
        setSaving(false);
        return;
      }

      imagePath = uploaded;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category.trim() || null,
      description: form.description.trim() || null,
      image_path: imagePath,
      project_url: form.project_url.trim() || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
      sort_order: order,
      updated_at: new Date().toISOString(),
    };

    const result = editingId
      ? await supabase
          .from("portfolios")
          .update(payload)
          .eq("id", editingId)
      : await supabase.from("portfolios").insert(payload);

    if (result.error) {
      setError("Gagal menyimpan karya: " + result.error.message);
      setSaving(false);
      return;
    }

    setMessage(
      editingId
        ? "Portofolio berhasil diperbarui."
        : "Portofolio baru berhasil ditambahkan."
    );

    setEditorOpen(false);
    setSelectedFile(null);
    setSaving(false);
    await loadData();
  };

  const toggleActive = async (item: Portfolio) => {
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("portfolios")
      .update({
        is_active: !item.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (updateError) {
      setError("Gagal mengubah status: " + updateError.message);
      return;
    }

    setMessage(
      item.is_active
        ? "Karya berhasil disembunyikan."
        : "Karya berhasil diaktifkan."
    );

    await loadData();
  };

  const toggleFeatured = async (item: Portfolio) => {
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("portfolios")
      .update({
        is_featured: !item.is_featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (updateError) {
      setError("Gagal mengubah unggulan: " + updateError.message);
      return;
    }

    setMessage(
      item.is_featured
        ? "Status unggulan dihapus."
        : "Karya ditandai sebagai unggulan."
    );

    await loadData();
  };

  const deletePortfolio = async (item: Portfolio) => {
    if (
      !window.confirm(
        `Hapus karya "${item.title}" secara permanen? Tindakan ini tidak bisa dibatalkan.`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("portfolios")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      setError("Gagal menghapus karya: " + deleteError.message);
      return;
    }

    const path = getStoragePath(item.image_path);

    if (path) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([path]);

      if (storageError) {
        setMessage(
          "Data karya terhapus, tetapi file gambar gagal dihapus: " +
            storageError.message
        );
      } else {
        setMessage("Karya berhasil dihapus.");
      }
    } else {
      setMessage("Karya berhasil dihapus.");
    }

    await loadData();
  };

  const filtered = portfolios.filter((item) => {
    const term = search.toLowerCase();

    const matchesSearch =
      item.title.toLowerCase().includes(term) ||
      (item.category || "").toLowerCase().includes(term) ||
      (item.description || "").toLowerCase().includes(term);

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && item.is_active) ||
      (filter === "hidden" && !item.is_active) ||
      (filter === "featured" && item.is_featured);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    all: portfolios.length,
    active: portfolios.filter((p) => p.is_active).length,
    hidden: portfolios.filter((p) => !p.is_active).length,
    featured: portfolios.filter((p) => p.is_featured).length,
  };

  if (loading) {
    return (
      <main style={S.page}>
        <div style={S.loading}>Memuat portofolio...</div>
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <main style={S.page}>
      <div style={S.container}>
        <header style={S.header}>
          <div>
            <div style={S.eyebrow}>PAJARA STUDIO · CMS</div>
            <h1 style={S.heading}>Portofolio</h1>
            <p style={S.subtitle}>
              Kelola karya, proyek desain, dan karya unggulan Pajara Studio.
            </p>
          </div>

          <button type="button" onClick={openNew} style={S.primary}>
            + Tambah Karya
          </button>
        </header>

        {message && <div style={S.success}>{message}</div>}
        {error && <div style={S.error}>{error}</div>}

        <section style={S.statsGrid}>
          {[
            { label: "Semua Karya", value: stats.all, key: "all" },
            { label: "Aktif", value: stats.active, key: "active" },
            { label: "Disembunyikan", value: stats.hidden, key: "hidden" },
            { label: "Unggulan", value: stats.featured, key: "featured" },
          ].map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setFilter(item.key)}
              style={{
                ...S.statCard,
                borderColor: filter === item.key ? C.green2 : C.border,
              }}
            >
              <span style={S.statLabel}>{item.label}</span>
              <strong style={S.statNumber}>{item.value}</strong>
            </button>
          ))}
        </section>

        {editorOpen && (
          <section style={S.editor}>
            <div style={S.editorHeader}>
              <div>
                <h2 style={S.sectionTitle}>
                  {editingId ? "Edit Karya" : "Tambah Karya Baru"}
                </h2>
                <p style={S.smallMuted}>
                  Lengkapi detail proyek desain di bawah ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                style={S.close}
              >
                Tutup
              </button>
            </div>

            <label style={S.label}>Judul Karya *</label>
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Contoh: Ayam Goreng Kremes"
              style={S.input}
            />

            <label style={S.label}>Kategori</label>
            <input
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              placeholder="Contoh: Logo & Branding"
              style={S.input}
            />

            <label style={S.label}>Deskripsi Karya</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Ceritakan singkat tentang proyek ini..."
              rows={4}
              style={S.textarea}
            />

            <label style={S.label}>Gambar Karya *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] || null);
                setError("");
              }}
              style={S.fileInput}
            />
            <p style={S.hint}>
              Format gambar umum, maksimal 10 MB. Gambar baru akan menggantikan
              gambar sebelumnya.
            </p>

            {selectedFile && previewUrl ? (
              <div style={S.previewBox}>
                <img
                  src={previewUrl}
                  alt="Pratinjau gambar baru"
                  style={S.preview}
                />
                <span style={S.smallMuted}>{selectedFile.name}</span>
              </div>
            ) : form.image_path ? (
              <div style={S.previewBox}>
                <img
                  src={form.image_path}
                  alt="Gambar portofolio"
                  style={S.preview}
                />
                <span style={S.smallMuted}>Gambar saat ini</span>
              </div>
            ) : null}

            <label style={S.label}>URL Gambar (opsional)</label>
            <input
              value={form.image_path}
              onChange={(e) => {
                updateField("image_path", e.target.value);
                setSelectedFile(null);
              }}
              placeholder="https://..."
              style={S.input}
            />
            <p style={S.hint}>
              Gunakan URL gambar publik jika tidak mengunggah file.
            </p>

            <label style={S.label}>Tautan Proyek (opsional)</label>
            <input
              value={form.project_url}
              onChange={(e) => updateField("project_url", e.target.value)}
              placeholder="https://..."
              style={S.input}
            />

            <label style={S.label}>Urutan Tampilan</label>
            <input
              type="number"
              step="1"
              value={form.sort_order}
              onChange={(e) => updateField("sort_order", e.target.value)}
              style={S.input}
            />
            <p style={S.hint}>Angka lebih kecil ditampilkan lebih dahulu.</p>

            <div style={S.checkList}>
              <label style={S.checkLabel}>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    updateField("is_featured", e.target.checked)
                  }
                />
                <span>
                  <strong>Karya unggulan</strong>
                  <small>Tandai sebagai salah satu karya pilihan.</small>
                </span>
              </label>

              <label style={S.checkLabel}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => updateField("is_active", e.target.checked)}
                />
                <span>
                  <strong>Karya aktif</strong>
                  <small>
                    Karya aktif dapat ditampilkan website setelah integrasi.
                  </small>
                </span>
              </label>
            </div>

            <div style={S.editorActions}>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                style={S.secondary}
                disabled={saving || uploading}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void savePortfolio()}
                style={{
                  ...S.primary,
                  opacity: saving || uploading ? 0.65 : 1,
                }}
                disabled={saving || uploading}
              >
                {uploading
                  ? "Mengunggah gambar..."
                  : saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Karya"}
              </button>
            </div>
          </section>
        )}

        <section style={S.listSection}>
          <div style={S.listHeader}>
            <div>
              <h2 style={S.sectionTitle}>Daftar Karya</h2>
              <p style={S.smallMuted}>{filtered.length} karya ditemukan</p>
            </div>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, kategori, atau deskripsi..."
            style={S.input}
          />

          <div style={S.filterRow}>
            {[
              ["all", "Semua"],
              ["active", "Aktif"],
              ["hidden", "Disembunyikan"],
              ["featured", "Unggulan"],
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
              <div style={S.emptyIcon}>✳</div>
              <h3 style={S.emptyTitle}>Belum ada karya ditemukan</h3>
              <p style={S.smallMuted}>
                Tambahkan karya desain pertama atau ubah kata pencarian.
              </p>
              <button type="button" onClick={openNew} style={S.primary}>
                + Tambah Karya
              </button>
            </div>
          ) : (
            <div style={S.grid}>
              {filtered.map((item) => (
                <article key={item.id} style={S.card}>
                  <div style={S.imageWrap}>
                    <img
                      src={item.image_path}
                      alt={item.title}
                      style={S.cardImage}
                    />
                    <div style={S.badges}>
                      <span
                        style={{
                          ...S.badge,
                          background: item.is_active ? C.softGreen : "#ECECEC",
                          color: item.is_active ? C.green : "#626262",
                        }}
                      >
                        {item.is_active ? "Aktif" : "Disembunyikan"}
                      </span>
                      {item.is_featured && (
                        <span
                          style={{
                            ...S.badge,
                            background: C.softBrown,
                            color: C.brown,
                          }}
                        >
                          Unggulan
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={S.cardBody}>
                    <div style={S.cardCategory}>
                      {item.category || "Tanpa kategori"}
                    </div>
                    <h3 style={S.cardTitle}>{item.title}</h3>
                    {item.description && (
                      <p style={S.cardDescription}>{item.description}</p>
                    )}
                    <div style={S.cardMeta}>
                      Urutan {item.sort_order} · {formatDate(item.created_at)}
                    </div>

                    <div style={S.actions}>
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        style={S.actionButton}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleFeatured(item)}
                        style={S.actionButton}
                      >
                        {item.is_featured
                          ? "Hapus Unggulan"
                          : "Jadikan Unggulan"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleActive(item)}
                        style={S.actionButton}
                      >
                        {item.is_active ? "Sembunyikan" : "Aktifkan"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deletePortfolio(item)}
                        style={S.deleteButton}
                      >
                        Hapus
                      </button>
                    </div>
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
    padding: "28px 16px 100px",
    color: C.text,
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  container: { maxWidth: 1050, margin: "0 auto" },
  loading: { margin: "80px auto", textAlign: "center", color: C.muted },
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
  subtitle: { margin: "10px 0 0", color: C.muted, fontSize: 14, lineHeight: 1.6 },
  primary: {
    border: 0,
    borderRadius: 12,
    background: C.green,
    color: C.white,
    padding: "13px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondary: {
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
    overflowWrap: "anywhere",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
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
  statNumber: { fontSize: 28, color: C.green, fontFamily: "Georgia, serif" },
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
    overflowWrap: "anywhere",
  },
  close: {
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
  fileInput: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    border: `1px dashed ${C.border}`,
    borderRadius: 11,
    background: "#FFFEFC",
    color: C.text,
    fontSize: 13,
  },
  hint: { margin: "6px 0 0", color: C.muted, fontSize: 11, lineHeight: 1.6 },
  previewBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 12,
  },
  preview: {
    width: 110,
    height: 110,
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    objectFit: "cover",
    background: C.bg,
  },
  checkList: { display: "grid", gap: 12, marginTop: 22 },
  checkLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: 11,
    padding: 14,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    background: "#FFFEFC",
    fontSize: 13,
    color: C.text,
  },
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
  listHeader: { marginBottom: 18 },
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
  filterActive: {
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: 14,
  },
  card: {
    minWidth: 0,
    overflow: "hidden",
    border: `1px solid ${C.border}`,
    borderRadius: 15,
    background: "#FFFEFC",
  },
  imageWrap: { position: "relative", background: C.bg, aspectRatio: "4 / 3" },
  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    inset: 0,
    objectFit: "cover",
  },
  badges: {
    position: "absolute",
    left: 10,
    top: 10,
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: { padding: "5px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 },
  cardBody: { padding: 14 },
  cardCategory: { color: C.brown, fontSize: 11, fontWeight: 700, marginBottom: 7 },
  cardTitle: {
    margin: 0,
    color: C.green,
    fontSize: 17,
    lineHeight: 1.4,
    overflowWrap: "anywhere",
  },
  cardDescription: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 1.6,
    margin: "8px 0 0",
    overflowWrap: "anywhere",
  },
  cardMeta: { color: C.muted, fontSize: 10, marginTop: 12 },
  actions: {
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
    padding: "8px 10px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteButton: {
    border: "1px solid #F0D7D7",
    borderRadius: 9,
    background: "#FFF7F7",
    color: C.red,
    padding: "8px 10px",
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
