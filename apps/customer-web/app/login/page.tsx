"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@pajara/supabase";

export default function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleLogin = async (
event: FormEvent<HTMLFormElement>
) => {
event.preventDefault();

if (loading) return;

setLoading(true);
setError("");

try {
  const { error: loginError } =
    await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

  if (loginError) {
    setError("Email atau password tidak sesuai.");
    setLoading(false);
    return;
  }

  window.location.href = "/dashboard";
} catch {
  setError(
    "Terjadi kendala saat masuk. Silakan coba kembali."
  );
  setLoading(false);
}

};

return (
<main className="login-page">
<style>{`
.login-page {
--login-green: #2f6b45;
--login-forest: #214d32;
--login-earth: #8a6a4a;
--login-cream: #f7f4ee;
--login-white: #ffffff;
--login-ink: #20372a;
--login-muted: #77796f;
--login-line: #e5e1d8;

      min-height: 100vh;
      background: var(--login-cream);
      color: var(--login-ink);
      overflow: hidden;
      font-family: var(--font-dm-sans, Arial, sans-serif);
    }

    .login-page * {
      box-sizing: border-box;
    }

    .login-topbar {
      width: 100%;
      max-width: 1440px;
      min-height: 82px;
      margin: 0 auto;
      padding: 18px 6%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      animation: loginFadeDown .65s ease both;
    }

    .login-brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--login-forest);
      font-size: 15px;
      font-weight: 800;
      letter-spacing: .09em;
    }

    .login-brand img {
      width: 43px;
      height: 43px;
      object-fit: cover;
      border-radius: 12px;
    }

    .login-top-links {
      display: flex;
      align-items: center;
      gap: 25px;
      font-size: 13px;
    }

    .login-top-links a {
      color: var(--login-ink);
      text-decoration: none;
      transition: color .2s ease;
    }

    .login-top-links a:hover {
      color: var(--login-green);
    }

    .login-top-links .login-register-link {
      padding: 11px 18px;
      border: 1px solid rgba(47,107,69,.25);
      border-radius: 999px;
      color: var(--login-forest);
      font-weight: 700;
      transition:
        background .25s ease,
        color .25s ease,
        transform .25s ease;
    }

    .login-top-links .login-register-link:hover {
      background: var(--login-forest);
      color: white;
      transform: translateY(-2px);
    }

    .login-layout {
      width: calc(100% - 12%);
      max-width: 1280px;
      min-height: min(690px, calc(100vh - 120px));
      margin: 12px auto 46px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: var(--login-white);
      border: 1px solid rgba(65,76,54,.07);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 24px 70px rgba(36,49,34,.07);
      animation: loginFadeUp .75s .08s ease both;
    }

    .login-editorial {
      position: relative;
      isolation: isolate;
      min-height: 620px;
      padding: clamp(30px, 4.3vw, 64px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      color: var(--login-cream);
      background:
        radial-gradient(ellipse at 100% 0%, rgba(123,151,91,.35), transparent 42%),
        linear-gradient(145deg, #214d32 0%, #173a27 58%, #10291c 100%);
    }

    .login-editorial::before {
      content: "";
      position: absolute;
      z-index: -1;
      width: 380px;
      height: 380px;
      top: 19%;
      right: -190px;
      border: 1px solid rgba(247,244,238,.15);
      border-radius: 48% 52% 61% 39% / 40% 44% 56% 60%;
      transform: rotate(-25deg);
      animation: loginShapeFloat 13s ease-in-out infinite alternate;
    }

    .login-editorial::after {
      content: "";
      position: absolute;
      z-index: -1;
      width: 300px;
      height: 300px;
      right: -100px;
      bottom: -150px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8a6a4a, #c4ad8b);
      opacity: .85;
      animation: loginShapeFloat 10s ease-in-out infinite alternate-reverse;
    }

    .login-editorial-brand {
      display: inline-flex;
      align-items: center;
      gap: 11px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: .15em;
      text-transform: uppercase;
      animation: loginFadeUp .7s .2s ease both;
    }

    .login-brand-mark {
      width: 35px;
      height: 35px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(247,244,238,.45);
      border-radius: 11px;
      font-family: Georgia, serif;
      font-size: 22px;
      font-weight: 400;
    }

    .login-editorial-copy {
      position: relative;
      z-index: 1;
      max-width: 460px;
      padding: 60px 0;
      animation: loginFadeUp .8s .25s ease both;
    }

    .login-kicker {
      margin: 0 0 19px;
      color: #d2d9c9;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .2em;
      text-transform: uppercase;
    }

    .login-editorial-copy h1 {
      margin: 0;
      max-width: 450px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(43px, 5vw, 68px);
      font-weight: 400;
      letter-spacing: -.055em;
      line-height: 1.05;
    }

    .login-editorial-copy h1 em {
      color: #d6c2a2;
      font-weight: 400;
    }

    .login-editorial-copy > p:last-child {
      max-width: 340px;
      margin: 24px 0 0;
      color: rgba(247,244,238,.8);
      font-size: 14px;
      line-height: 1.9;
    }

    .login-editorial-bottom {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(247,244,238,.78);
      font-size: 11px;
      letter-spacing: .035em;
    }

    .login-editorial-bottom::before {
      content: "";
      width: 30px;
      height: 1px;
      flex-shrink: 0;
      background: #d6c2a2;
    }

    .login-form-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(30px, 5vw, 76px);
      background:
        radial-gradient(ellipse at 100% 100%, rgba(247,244,238,.75), transparent 40%),
        #fff;
    }

    .login-form-inner {
      width: 100%;
      max-width: 390px;
      animation: loginFadeUp .75s .22s ease both;
    }

    .login-mobile-brand {
      display: none;
    }

    .login-eyebrow {
      margin: 0 0 14px;
      color: var(--login-green);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .2em;
    }

    .login-form-inner h2 {
      margin: 0;
      color: var(--login-forest);
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(34px, 3.4vw, 45px);
      font-weight: 400;
      letter-spacing: -.045em;
      line-height: 1.15;
    }

    .login-intro {
      margin: 14px 0 0;
      color: var(--login-muted);
      font-size: 13px;
      line-height: 1.85;
    }

    .login-form {
      display: grid;
      gap: 19px;
      margin-top: 32px;
    }

    .login-field {
      display: grid;
      gap: 9px;
    }

    .login-field label {
      color: #344538;
      font-size: 12px;
      font-weight: 700;
    }

    .login-input-wrap {
      position: relative;
    }

    .login-input {
      width: 100%;
      min-height: 49px;
      padding: 13px 15px;
      border: 1px solid #deded5;
      border-radius: 10px;
      outline: none;
      background: #fff;
      color: var(--login-ink);
      font: inherit;
      font-size: 13px;
      transition:
        border-color .22s ease,
        box-shadow .22s ease,
        background .22s ease;
    }

    .login-input::placeholder {
      color: #a2a197;
    }

    .login-input:focus {
      border-color: var(--login-green);
      box-shadow: 0 0 0 4px rgba(47,107,69,.09);
      background: #fffefa;
    }

    .login-password-input {
      padding-right: 75px;
    }

    .login-password-toggle {
      position: absolute;
      top: 50%;
      right: 12px;
      transform: translateY(-50%);
      padding: 7px 5px;
      border: 0;
      background: transparent;
      color: var(--login-green);
      font: inherit;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }

    .login-forgot-row {
      display: flex;
      justify-content: flex-end;
      margin-top: -6px;
    }

    .login-forgot-row a,
    .login-signup a {
      color: var(--login-green);
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      text-underline-offset: 4px;
    }

    .login-forgot-row a:hover,
    .login-signup a:hover {
      text-decoration: underline;
    }

    .login-error {
      padding: 13px 14px;
      border: 1px solid rgba(160,50,50,.16);
      border-radius: 10px;
      background: rgba(160,50,50,.06);
      color: #8b3030;
      font-size: 12px;
      line-height: 1.7;
      animation: loginFadeUp .25s ease both;
    }

    .login-submit {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      min-height: 51px;
      margin-top: 2px;
      padding: 14px 20px;
      border: 1px solid var(--login-forest);
      border-radius: 10px;
      background: var(--login-forest);
      color: #fff;
      font: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition:
        background .22s ease,
        box-shadow .22s ease,
        transform .22s ease;
    }

    .login-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      background: var(--login-green);
      box-shadow: 0 9px 22px rgba(33,77,50,.17);
    }

    .login-submit:active:not(:disabled) {
      transform: translateY(0) scale(.99);
    }

    .login-submit:disabled {
      cursor: wait;
      opacity: .7;
    }

    .login-submit-arrow {
      display: inline-block;
      transition: transform .22s ease;
    }

    .login-submit:hover:not(:disabled) .login-submit-arrow {
      transform: translateX(4px);
    }

    .login-spinner {
      width: 15px;
      height: 15px;
      border: 2px solid rgba(255,255,255,.4);
      border-top-color: white;
      border-radius: 50%;
      animation: loginSpin .7s linear infinite;
    }

    .login-divider {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 25px 0 20px;
      color: #9a9a90;
      font-size: 11px;
    }

    .login-divider::before,
    .login-divider::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--login-line);
    }

    .login-signup {
      margin: 25px 0 0;
      color: var(--login-muted);
      font-size: 12px;
      line-height: 1.8;
      text-align: center;
    }

    .login-signup a {
      margin-left: 4px;
    }

    .login-mobile-footer {
      display: none;
    }

    @keyframes loginFadeUp {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes loginFadeDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes loginShapeFloat {
      from {
        transform: translate3d(0, 0, 0) rotate(-25deg);
      }
      to {
        transform: translate3d(-14px, -17px, 0) rotate(-12deg);
      }
    }

    @keyframes loginSpin {
      to { transform: rotate(360deg); }
    }

    @media (min-width: 1440px) {
      .login-layout {
        min-height: 690px;
      }
    }

    @media (max-width: 900px) {
      .login-layout {
        width: calc(100% - 8%);
      }

      .login-editorial {
        padding: 34px;
      }

      .login-form-panel {
        padding: 35px;
      }

      .login-editorial-copy h1 {
        font-size: clamp(38px, 5.5vw, 52px);
      }
    }

    @media (max-width: 680px) {
      .login-page {
        min-height: 100svh;
        overflow: auto;
      }

      .login-topbar {
        min-height: 72px;
        padding: 15px 21px;
      }

      .login-brand {
        gap: 9px;
        font-size: 12px;
      }

      .login-brand img {
        width: 36px;
        height: 36px;
        border-radius: 10px;
      }

      .login-top-links {
        gap: 13px;
        font-size: 12px;
      }

      .login-top-links > a:first-child {
        display: none;
      }

      .login-top-links .login-register-link {
        padding: 9px 13px;
      }

      .login-layout {
        display: block;
        width: 100%;
        min-height: calc(100svh - 72px);
        margin: 0;
        border: 0;
        border-radius: 0;
        box-shadow: none;
        background: var(--login-cream);
        animation: loginFadeUp .55s ease both;
      }

      .login-editorial {
        display: none;
      }

      .login-form-panel {
        min-height: calc(100svh - 72px);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 28px 24px 35px;
        background:
          radial-gradient(ellipse at 100% 0%, rgba(47,107,69,.07), transparent 36%),
          var(--login-cream);
      }

      .login-form-inner {
        max-width: 420px;
        padding-top: 4px;
        animation: loginFadeUp .65s .08s ease both;
      }

      .login-mobile-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 39px;
        color: var(--login-forest);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: .13em;
      }

      .login-mobile-brand img {
        width: 38px;
        height: 38px;
        object-fit: cover;
        border-radius: 11px;
      }

      .login-eyebrow {
        margin-bottom: 12px;
        font-size: 9px;
      }

      .login-form-inner h2 {
        font-size: 39px;
      }

      .login-intro {
        max-width: 330px;
        margin-top: 12px;
        font-size: 13px;
      }

      .login-form {
        gap: 18px;
        margin-top: 28px;
      }

      .login-input {
        min-height: 51px;
        font-size: 16px;
      }

      .login-submit {
        min-height: 52px;
      }

      .login-divider {
        margin-top: 22px;
      }

      .login-signup {
        margin-top: 24px;
      }

      .login-mobile-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        margin-top: 42px;
        color: #7b806f;
        font-size: 10px;
      }

      .login-mobile-footer::before {
        content: "";
        width: 22px;
        height: 1px;
        background: var(--login-earth);
      }
    }

    @media (max-width: 360px) {
      .login-topbar {
        padding-right: 15px;
        padding-left: 15px;
      }

      .login-brand {
        font-size: 11px;
      }

      .login-top-links {
        gap: 8px;
      }

      .login-form-panel {
        padding-right: 19px;
        padding-left: 19px;
      }

      .login-mobile-brand {
        margin-bottom: 31px;
      }

      .login-form-inner h2 {
        font-size: 35px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .login-page *,
      .login-page *::before,
      .login-page *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: .01ms !important;
      }
    }
  `}</style>

  <header className="login-topbar">
    <a href="/" className="login-brand">
      <img
        src="/755809946_17926162029385149_3739923509439876817_n.jpg"
        alt="Logo Pajara Studio"
      />
      <span>PAJARA STUDIO</span>
    </a>

    <nav className="login-top-links" aria-label="Navigasi utama">
      <a href="/">Website</a>
      <a href="/register" className="login-register-link">
        Buat Akun <span aria-hidden="true">↗</span>
      </a>
    </nav>
  </header>

  <section className="login-layout">
    <aside className="login-editorial">
      <div className="login-editorial-brand">
        <span className="login-brand-mark" aria-hidden="true">P</span>
        <span>Pajara Studio</span>
      </div>

      <div className="login-editorial-copy">
        <p className="login-kicker">Ruang kerja kreatifmu</p>
        <h1>
          Desain
          <br />
          punya <em>arah.</em>
        </h1>
        <p>
          Kelola pesanan desain, pembayaran,
          revisi, hingga file final dalam satu
          tempat. Semua perjalanan desainmu,
          lebih terarah bersama Pajara.
        </p>
      </div>

      <div className="login-editorial-bottom">
        Berakar di Tanah Pasundan.
      </div>
    </aside>

    <section className="login-form-panel">
      <div className="login-form-inner">
        <div className="login-mobile-brand">
          <img
            src="/755809946_17926162029385149_3739923509439876817_n.jpg"
            alt="Logo Pajara Studio"
          />
          <span>PAJARA STUDIO</span>
        </div>

        <p className="login-eyebrow">CUSTOMER WEB</p>

        <h2>Selamat datang.</h2>

        <p className="login-intro">
          Masuk untuk melanjutkan perjalanan
          desainmu bersama Pajara.
        </p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              className="login-input"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
              placeholder="nama@email.com"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <input
                id="password"
                name="password"
                className="login-input login-password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError("");
                }}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? "Sembunyikan" : "Lihat"}
              </button>
            </div>
          </div>

          <div className="login-forgot-row">
            <a href="/forgot-password">Lupa password?</a>
          </div>

          {error && (
            <div className="login-error" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner" aria-hidden="true" />
                Memproses...
              </>
            ) : (
              <>
                Masuk ke akun
                <span className="login-submit-arrow" aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>Mulai perjalanan desainmu</span>
        </div>

        <p className="login-signup">
          Belum punya akun?
          <a href="/register">Buat Akun</a>
        </p>

        <div className="login-mobile-footer">
          Berakar di Tanah Pasundan.
        </div>
      </div>
    </section>
  </section>
</main>

);
}
