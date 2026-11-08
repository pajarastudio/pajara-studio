"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@pajara/supabase";

export default function AccountPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [initialName, setInitialName] = useState("");
  const [initialPhone, setInitialPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const logo =
    "/755809946_17926162029385149_3739923509439876817_n.jpg";

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "";

      const userPhone = user.user_metadata?.phone || "";

      setUserId(user.id);
      setEmail(user.email || "");
      setFullName(name);
      setPhone(userPhone);
      setInitialName(name);
      setInitialPhone(userPhone);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat informasi akun."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanedName = fullName.trim();
    const cleanedPhone = phone.trim();

    if (!cleanedName) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      const { data, error: updateError } =
        await supabase.auth.updateUser({
          data: {
            full_name: cleanedName,
            phone: cleanedPhone,
          },
        });

      if (updateError) {
        throw updateError;
      }

      if (!data.user) {
        throw new Error("Data akun tidak berhasil diperbarui.");
      }

      setFullName(cleanedName);
      setPhone(cleanedPhone);
      setInitialName(cleanedName);
      setInitialPhone(cleanedPhone);
      setEditing(false);
      setSuccess("Profil berhasil diperbarui.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan perubahan profil."
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    setFullName(initialName);
    setPhone(initialPhone);
    setEditing(false);
    setError("");
    setSuccess("");
  }

  async function handleSignOut() {
    const confirmed = window.confirm(
      "Kamu yakin ingin keluar dari akun Pajara?"
    );

    if (!confirmed) return;

    setSigningOut(true);
    setError("");

    try {
      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal keluar dari akun."
      );
      setSigningOut(false);
    }
  }

  function navigateTo(path: string) {
    setMenuOpen(false);
    router.push(path);
  }

  const initials = fullName.trim()
    ? fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : email.slice(0, 1).toUpperCase() || "P";

  return (
    <main style={styles.page}>
      <nav className="customer-navbar">
        <div className="navbar-inner">
          <button
            type="button"
            className="navbar-brand"
            onClick={() => router.push("/dashboard")}
            aria-label="Pajara Studio - Beranda"
          >
            <Image
              src={logo}
              alt="Logo Pajara Studio"
              width={39}
              height={39}
              unoptimized
              className="navbar-logo"
            />
            <span>Pajara Studio</span>
          </button>

          <div className="navbar-actions">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>

            <button
              type="button"
              className="order-link"
              onClick={() => navigateTo("/order")}
            >
              Pesan Desain <span>↗</span>
            </button>
          </div>

          {menuOpen && (
            <div className="navbar-menu">
              <button onClick={() => navigateTo("/dashboard")}>
                Beranda
              </button>
              <button onClick={() => navigateTo("/orders/list")}>
                Pesanan Saya
              </button>
              <button onClick={() => navigateTo("/subscriptions")}>
                Paket Pajara
              </button>
              <button onClick={() => navigateTo("/payments")}>
                Pembayaran
              </button>
              <button onClick={() => navigateTo("/files")}>
                File Desain
              </button>
              <button onClick={() => navigateTo("/account")}>
                Akun Saya
              </button>
            </div>
          )}
        </div>
      </nav>

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.eyebrow}>PAJARA STUDIO</div>
          <h1 style={styles.title}>Profil Saya</h1>
          <p style={styles.subtitle}>
            Kelola informasi akunmu untuk pengalaman yang lebih
            nyaman bersama Pajara Studio.
          </p>
        </header>

        {error && (
          <div role="alert" style={styles.error}>
            <strong>Ada kendala</strong>
            <p style={styles.message}>{error}</p>
          </div>
        )}

        {success && (
          <div role="status" style={styles.success}>
            <strong>Berhasil</strong>
            <p style={styles.message}>{success}</p>
          </div>
        )}

        {loading ? (
          <div style={styles.loadingCard}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>
              Memuat informasi akun...
            </p>
          </div>
        ) : (
          <>
            <section style={styles.profileHero}>
              <div style={styles.avatar}>{initials}</div>

              <div style={styles.profileIdentity}>
                <span style={styles.memberLabel}>
                  CUSTOMER PAJARA
                </span>
                <h2 style={styles.profileName}>
                  {fullName || "Customer Pajara"}
                </h2>
                <p style={styles.profileEmail}>
                  {email || "Email tidak tersedia"}
                </p>
              </div>

              <div style={styles.verifiedBadge}>
                <span style={styles.verifiedDot} />
                Akun
              </div>
            </section>

            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <div>
                  <div style={styles.sectionEyebrow}>
                    INFORMASI PERSONAL
                  </div>
                  <h2 style={styles.sectionTitle}>
                    Detail Profil
                  </h2>
                </div>

                {!editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setError("");
                      setSuccess("");
                    }}
                    style={styles.editButton}
                  >
                    Edit Profil
                  </button>
                )}
              </div>

              <form onSubmit={saveProfile} style={styles.form}>
                <label style={styles.label} htmlFor="fullName">
                  Nama Lengkap
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Masukkan nama lengkap"
                  disabled={!editing || saving}
                  required
                  maxLength={100}
                  style={{
                    ...styles.input,
                    ...(editing ? styles.inputEditing : {}),
                  }}
                />

                <label style={styles.label} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  style={styles.input}
                />
                <p style={styles.fieldHint}>
                  Email akun ditampilkan sebagai informasi dan tidak
                  bisa diubah dari halaman ini.
                </p>

                <label style={styles.label} htmlFor="phone">
                  Nomor WhatsApp
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Contoh: 08xxxxxxxxxx"
                  disabled={!editing || saving}
                  maxLength={25}
                  style={{
                    ...styles.input,
                    ...(editing ? styles.inputEditing : {}),
                  }}
                />

                {editing && (
                  <div style={styles.formActions}>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={saving}
                      style={styles.cancelButton}
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        ...styles.saveButton,
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                )}
              </form>
            </section>

            <section style={styles.section}>
              <div style={styles.sectionEyebrow}>
                AKTIVITAS AKUN
              </div>
              <h2 style={styles.sectionTitle}>
                Layanan Pajara
              </h2>

              <div style={styles.menuList}>
                <button
                  type="button"
                  onClick={() => router.push("/orders/list")}
                  style={styles.menuItem}
                >
                  <span style={styles.menuIcon}>▤</span>
                  <span style={styles.menuText}>
                    <strong>Pesanan Saya</strong>
                    <small>Lihat status pesanan desain</small>
                  </span>
                  <span style={styles.menuArrow}>→</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/payments")}
                  style={styles.menuItem}
                >
                  <span style={styles.menuIcon}>◇</span>
                  <span style={styles.menuText}>
                    <strong>Pembayaran</strong>
                    <small>Lihat tagihan dan pembayaran</small>
                  </span>
                  <span style={styles.menuArrow}>→</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/files")}
                  style={styles.menuItem}
                >
                  <span style={styles.menuIcon}>▧</span>
                  <span style={styles.menuText}>
                    <strong>File Desain</strong>
                    <small>Buka file final pesananmu</small>
                  </span>
                  <span style={styles.menuArrow}>→</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/subscriptions")}
                  style={styles.menuItem}
                >
                  <span style={styles.menuIcon}>▣</span>
                  <span style={styles.menuText}>
                    <strong>Paket Pajara</strong>
                    <small>Lihat paket mingguan dan bulanan</small>
                  </span>
                  <span style={styles.menuArrow}>→</span>
                </button>
              </div>
            </section>

            <section style={styles.accountCard}>
              <div>
                <h3 style={styles.accountTitle}>Keluar dari Akun</h3>
                <p style={styles.accountDescription}>
                  Akhiri sesi login pada perangkat ini.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
                style={styles.logoutButton}
              >
                {signingOut ? "Memproses..." : "Keluar"}
              </button>
            </section>

            <div style={styles.accountId}>
              ID akun: {userId.slice(0, 8)}…
            </div>

            <footer style={styles.footer}>
              <Image
                src={logo}
                alt="Logo Pajara Studio"
                width={43}
                height={43}
                unoptimized
                style={styles.footerLogo}
              />

              <div>
                <strong style={styles.footerTitle}>
                  Pajara Studio
                </strong>
                <p style={styles.footerText}>
                  Berakar di Tanah Pasundan.
                </p>
                <p style={styles.footerCopyright}>
                  © 2026 Pajara Studio. Desain yang punya arah.
                </p>
              </div>
            </footer>
          </>
        )}
      </div>

      <style jsx>{`
        .customer-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          margin: -30px -18px 30px;
          background: rgba(247, 244, 238, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(47, 107, 69, 0.1);
        }

        .navbar-inner {
          position: relative;
          max-width: 796px;
          min-height: 66px;
          margin: 0 auto;
          padding: 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0;
          border: none;
          background: transparent;
          color: #214d32;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .navbar-logo {
          width: 39px;
          height: 39px;
          object-fit: contain;
          border-radius: 12px;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .menu-toggle {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(33, 77, 50, 0.13);
          border-radius: 12px;
          background: #fff;
          color: #214d32;
          cursor: pointer;
        }

        .order-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 15px;
          border: none;
          border-radius: 12px;
          background: #2f6b45;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .order-link span {
          font-size: 14px;
        }

        .navbar-menu {
          position: absolute;
          top: calc(100% - 1px);
          right: 18px;
          z-index: 60;
          width: 210px;
          padding: 8px;
          display: grid;
          gap: 3px;
          border: 1px solid #e8e2d8;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 12px 30px rgba(33, 77, 50, 0.12);
          animation: fadeUp 180ms ease both;
        }

        .navbar-menu button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 9px;
          background: transparent;
          color: #34483a;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .navbar-menu button:hover {
          background: #f1f5ef;
          color: #214d32;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        button {
          -webkit-tap-highlight-color: transparent;
          transition:
            transform 160ms ease,
            opacity 160ms ease,
            background 160ms ease;
        }

        button:active:not(:disabled) {
          transform: scale(0.985);
        }

        @media (max-width: 480px) {
          .navbar-brand {
            gap: 8px;
            font-size: 13px;
          }

          .navbar-actions {
            gap: 7px;
          }

          .order-link {
            padding: 10px 11px;
            font-size: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "var(--cream, #f7f4ee)",
    padding: "30px 18px 110px",
    color: "var(--text, #1d2a22)",
  },
  container: {
    maxWidth: "760px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "25px",
    animation: "fadeUp 350ms ease both",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.18em",
    color: "var(--brown, #8a6a4a)",
    marginBottom: "8px",
  },
  title: {
    fontFamily: "Georgia, serif",
    fontSize: "clamp(30px, 7vw, 42px)",
    lineHeight: 1.15,
    letterSpacing: "-0.04em",
    color: "var(--green-dark, #214d32)",
    margin: "0 0 10px",
  },
  subtitle: {
    fontSize: "14px",
    lineHeight: 1.8,
    color: "#73766f",
    margin: 0,
    maxWidth: "440px",
  },
  profileHero: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    padding: "23px",
    background:
      "linear-gradient(135deg, #214d32 0%, #2f6b45 75%, #467a56 100%)",
    color: "#fff",
    borderRadius: "22px",
    marginBottom: "32px",
    boxShadow: "0 12px 28px rgba(33,77,50,.11)",
    animation: "fadeUp 400ms ease both",
  },
  avatar: {
    width: "61px",
    height: "61px",
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: "20px",
    background: "#f7f4ee",
    color: "#214d32",
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    fontWeight: 700,
  },
  profileIdentity: {
    flex: "1 1 150px",
    minWidth: 0,
  },
  memberLabel: {
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    color: "rgba(255,255,255,.72)",
  },
  profileName: {
    fontFamily: "Georgia, serif",
    fontSize: "21px",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
    margin: "5px 0",
  },
  profileEmail: {
    color: "rgba(255,255,255,.78)",
    fontSize: "12px",
    overflowWrap: "anywhere",
    margin: 0,
  },
  verifiedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 10px",
    borderRadius: "20px",
    background: "rgba(255,255,255,.13)",
    fontSize: "10px",
    fontWeight: 700,
  },
  verifiedDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#b9dfb9",
  },
  section: {
    marginBottom: "32px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "18px",
  },
  sectionEyebrow: {
    color: "var(--brown, #8a6a4a)",
    fontSize: "10px",
    letterSpacing: "0.14em",
    fontWeight: 800,
    marginBottom: "5px",
  },
  sectionTitle: {
    fontFamily: "Georgia, serif",
    color: "var(--green-dark, #214d32)",
    fontSize: "23px",
    letterSpacing: "-0.025em",
    margin: "0 0 15px",
  },
  editButton: {
    border: "1px solid #dce5da",
    borderRadius: "11px",
    padding: "10px 13px",
    background: "#fff",
    color: "var(--green, #2f6b45)",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    padding: "22px",
    background: "#fff",
    border: "1px solid #e8e2d8",
    borderRadius: "19px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#454c43",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #e5e1d8",
    borderRadius: "11px",
    background: "#f8f7f3",
    color: "#62665e",
    fontSize: "13px",
    padding: "13px 14px",
    outline: "none",
    marginBottom: "18px",
  },
  inputEditing: {
    background: "#fff",
    border: "1px solid #9ab59c",
    color: "#1d2a22",
  },
  fieldHint: {
    fontSize: "11px",
    lineHeight: 1.7,
    color: "#85847b",
    margin: "-11px 0 18px",
  },
  formActions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "3px",
  },
  saveButton: {
    width: "100%",
    border: "none",
    borderRadius: "11px",
    padding: "13px 16px",
    background: "var(--green, #2f6b45)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
  },
  cancelButton: {
    width: "100%",
    border: "1px solid #e5e1d8",
    borderRadius: "11px",
    padding: "12px 16px",
    background: "#fff",
    color: "#65675f",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  menuList: {
    display: "grid",
    gap: "10px",
  },
  menuItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "16px",
    border: "1px solid #e8e2d8",
    borderRadius: "15px",
    background: "#fff",
    textAlign: "left",
    cursor: "pointer",
  },
  menuIcon: {
    width: "42px",
    height: "42px",
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: "13px",
    background: "#edf3ec",
    color: "var(--green, #2f6b45)",
    fontSize: "22px",
  },
  menuText: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  menuArrow: {
    color: "var(--green, #2f6b45)",
    fontSize: "19px",
    fontWeight: 700,
  },
  accountCard: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    padding: "20px",
    border: "1px solid #eadbd5",
    borderRadius: "17px",
    background: "#fffaf8",
  },
  accountTitle: {
    color: "#7f3f32",
    fontSize: "14px",
    margin: "0 0 5px",
  },
  accountDescription: {
    color: "#858079",
    fontSize: "12px",
    lineHeight: 1.7,
    margin: 0,
  },
  logoutButton: {
    border: "1px solid #dfbdb4",
    borderRadius: "10px",
    padding: "10px 16px",
    background: "#fff",
    color: "#8a3d2f",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  accountId: {
    color: "#98958c",
    fontSize: "10px",
    textAlign: "center",
    overflowWrap: "anywhere",
    marginTop: "18px",
  },
  loadingCard: {
    padding: "55px 20px",
    textAlign: "center",
    background: "#fff",
    border: "1px solid #e8e2d8",
    borderRadius: "18px",
  },
  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #dce5da",
    borderTopColor: "var(--green, #2f6b45)",
    borderRadius: "50%",
    margin: "0 auto 13px",
    animation: "spin 800ms linear infinite",
  },
  loadingText: {
    color: "#777970",
    fontSize: "13px",
    margin: 0,
  },
  error: {
    padding: "15px",
    borderRadius: "13px",
    background: "#fff3f0",
    border: "1px solid #ead0c9",
    color: "#8a3d2f",
    fontSize: "13px",
    lineHeight: 1.6,
    marginBottom: "17px",
    overflowWrap: "anywhere",
  },
  success: {
    padding: "15px",
    borderRadius: "13px",
    background: "#edf6eb",
    border: "1px solid #d2e5ce",
    color: "#285c32",
    fontSize: "13px",
    lineHeight: 1.6,
    marginBottom: "17px",
  },
  message: {
    margin: "5px 0 0",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    borderTop: "1px solid #e4ddd1",
    paddingTop: "22px",
    marginTop: "36px",
  },
  footerLogo: {
    width: "43px",
    height: "43px",
    flexShrink: 0,
    objectFit: "contain",
    borderRadius: "10px",
  },
  footerTitle: {
    color: "var(--green-dark, #214d32)",
    fontSize: "13px",
  },
  footerText: {
    margin: "3px 0 0",
    color: "#85847b",
    fontSize: "11px",
  },
  footerCopyright: {
    margin: "4px 0 0",
    color: "#98958c",
    fontSize: "10px",
    lineHeight: 1.5,
  },
};
