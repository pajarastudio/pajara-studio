
"use client";

import { useEffect, useRef, useState } from "react";

const logo = "/755809946_17926162029385149_3739923509439876817_n.jpg";

const steps = [
  {
    number: "01",
    title: "Pilih layanan desain",
    description:
      "Tentukan jenis desain yang sesuai dengan kebutuhan bisnis atau proyek Kang/Teh.",
    icon: "✳",
  },
  {
    number: "02",
    title: "Ceritakan ide",
    description:
      "Isi brief, jelaskan kebutuhan desain, dan unggah foto referensi untuk membantu proses kreatif.",
    icon: "↗",
  },
  {
    number: "03",
    title: "Konfirmasi pesanan",
    description:
      "Periksa detail pesanan dan informasi pembayaran sebelum proses desain dimulai.",
    icon: "◷",
  },
  {
    number: "04",
    title: "Pantau sampai selesai",
    description:
      "Pantau perkembangan desain, ikuti proses revisi, dan akses file final melalui akun.",
    icon: "✓",
  },
];

const facilities = [
  {
    number: "01",
    title: "Pantau pesanan",
    description:
      "Lihat status dan perkembangan pesanan desain dalam satu dashboard.",
    icon: "◷",
  },
  {
    number: "02",
    title: "Informasi pembayaran",
    description:
      "Periksa informasi DP, pelunasan, dan status pembayaran pesanan.",
    icon: "↗",
  },
  {
    number: "03",
    title: "Revisi desain",
    description:
      "Ajukan revisi dan pantau perkembangannya melalui akun customer.",
    icon: "✳",
  },
  {
    number: "04",
    title: "File desain final",
    description:
      "Akses file hasil desain yang telah tersedia setelah proses selesai.",
    icon: "↓",
  },
  {
    number: "05",
    title: "Paket langganan",
    description:
      "Lihat dan kelola informasi paket langganan yang tersedia di akun.",
    icon: "◇",
  },
  {
    number: "06",
    title: "Bantuan Pajara",
    description:
      "Hubungi tim Pajara Studio melalui WhatsApp jika membutuhkan bantuan.",
    icon: "↗",
  },
];

export default function CustomerHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState<number[]>([]);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setVisible([0, 1, 2, 3]);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.revealIndex
            );

            setVisible((current) =>
              current.includes(index) ? current : [...current, index]
            );

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="pajara-home">
      <style jsx global>{`
        :root {
          --pajara-green: #2f6b45;
          --pajara-deep: #214d32;
          --pajara-brown: #8a6a4a;
          --pajara-cream: #f7f4ee;
          --pajara-ink: #252a25;
          --pajara-muted: #70766f;
          --pajara-line: rgba(33, 77, 50, 0.13);
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
          scroll-padding-top: 88px;
        }

        body {
          margin: 0;
          background: var(--pajara-cream);
        }

        .pajara-home {
          min-height: 100vh;
          overflow: hidden;
          color: var(--pajara-ink);
          background: var(--pajara-cream);
          font-family: "DM Sans", "Segoe UI", sans-serif;
        }

        .pajara-container {
          width: min(1120px, calc(100% - 48px));
          margin-inline: auto;
        }

        .pajara-navbar {
          position: sticky;
          top: 0;
          z-index: 30;
          background: rgba(247, 244, 238, 0.92);
          border-bottom: 1px solid var(--pajara-line);
          backdrop-filter: blur(16px);
        }

        .pajara-navbar-inner {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .pajara-brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: var(--pajara-deep);
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.5px;
          text-decoration: none;
        }

        .pajara-brand-logo {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 12px;
        }

        .pajara-nav {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .pajara-nav a {
          color: var(--pajara-ink);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: color 180ms ease;
        }

        .pajara-nav a:hover {
          color: var(--pajara-green);
        }

        .pajara-nav .pajara-nav-cta {
          padding: 11px 18px;
          color: white;
          background: var(--pajara-green);
          border-radius: 999px;
          transition:
            background 180ms ease,
            transform 180ms ease;
        }

        .pajara-nav .pajara-nav-cta:hover {
          color: white;
          background: var(--pajara-deep);
          transform: translateY(-1px);
        }

        .pajara-menu-toggle {
          display: none;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--pajara-line);
          border-radius: 12px;
          background: transparent;
          color: var(--pajara-deep);
          font-size: 22px;
          cursor: pointer;
        }

        .pajara-hero {
          position: relative;
          padding: 94px 0 86px;
          background:
            radial-gradient(
              circle at 85% 18%,
              rgba(138, 106, 74, 0.1),
              transparent 26%
            ),
            radial-gradient(
              circle at 7% 90%,
              rgba(47, 107, 69, 0.09),
              transparent 27%
            );
        }

        .pajara-hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          gap: 66px;
        }

        .pajara-hero-content {
          position: relative;
          z-index: 2;
          animation: pajara-rise 700ms ease both;
        }

        .pajara-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin: 0 0 22px;
          color: var(--pajara-green);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2.4px;
          text-transform: uppercase;
        }

        .pajara-eyebrow::before {
          width: 25px;
          height: 1px;
          background: var(--pajara-brown);
          content: "";
        }

        .pajara-hero h1 {
          max-width: 620px;
          margin: 0;
          color: var(--pajara-deep);
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(43px, 5.7vw, 70px);
          font-weight: 500;
          line-height: 1.08;
          letter-spacing: -2.8px;
        }

        .pajara-hero h1 span {
          color: var(--pajara-brown);
          font-style: italic;
        }

        .pajara-hero-description {
          max-width: 465px;
          margin: 23px 0 0;
          color: var(--pajara-muted);
          font-size: 15px;
          line-height: 1.95;
        }

        .pajara-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 32px;
        }

        .pajara-button {
          display: inline-flex;
          min-height: 49px;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 0 23px;
          border: 1px solid transparent;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition:
            transform 180ms ease,
            background 180ms ease,
            border-color 180ms ease;
        }

        .pajara-button:hover {
          transform: translateY(-2px);
        }

        .pajara-button-primary {
          color: white;
          background: var(--pajara-green);
        }

        .pajara-button-primary:hover {
          background: var(--pajara-deep);
        }

        .pajara-button-secondary {
          color: var(--pajara-deep);
          border-color: var(--pajara-line);
          background: rgba(255, 255, 255, 0.4);
        }

        .pajara-button-secondary:hover {
          border-color: var(--pajara-green);
          background: white;
        }

        .pajara-hero-note {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 27px;
          color: var(--pajara-muted);
          font-size: 11px;
          line-height: 1.7;
        }

        .pajara-note-dot {
          width: 7px;
          height: 7px;
          flex: 0 0 7px;
          border-radius: 50%;
          background: var(--pajara-green);
          box-shadow: 0 0 0 4px rgba(47, 107, 69, 0.1);
        }

        /* HERO ART — PAJARA FLOATING IDENTITY */

        .pajara-hero-art {
          position: relative;
          isolation: isolate;
          min-height: 410px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pajara-rise 850ms 100ms ease both;
        }

        .pajara-art-card {
          position: relative;
          z-index: 3;
          width: min(100%, 300px);
          padding: 28px;
          overflow: hidden;
          color: white;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(255, 255, 255, 0.1),
              transparent 35%
            ),
            linear-gradient(145deg, #285b3b, var(--pajara-deep) 72%);
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 24px;
          box-shadow:
            0 32px 70px rgba(33, 77, 50, 0.2),
            0 8px 20px rgba(33, 77, 50, 0.08);
          transform: rotate(-3deg);
          animation: pajara-float 5s ease-in-out infinite;
          will-change: transform;
        }

        .pajara-art-card::before {
          position: absolute;
          top: 0;
          right: 24px;
          width: 1px;
          height: 100%;
          background: rgba(255, 255, 255, 0.06);
          content: "";
          pointer-events: none;
        }

        .pajara-art-card::after {
          position: absolute;
          top: -76px;
          right: -68px;
          width: 185px;
          height: 185px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 50%;
          box-shadow:
            0 0 0 18px rgba(255, 255, 255, 0.025),
            0 0 0 38px rgba(255, 255, 255, 0.02);
          content: "";
          pointer-events: none;
        }

        .pajara-art-card-label {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #d7dfd5;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        .pajara-art-card-label::before {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c8ad8f;
          box-shadow: 0 0 0 4px rgba(200, 173, 143, 0.12);
          content: "";
        }

        .pajara-art-logo-frame {
          position: relative;
          z-index: 2;
          display: flex;
          width: 86px;
          height: 86px;
          align-items: center;
          justify-content: center;
          margin: 34px 0 26px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.48);
          border-radius: 24px;
          background: rgba(247, 244, 238, 0.96);
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.12),
            inset 0 0 0 4px rgba(255, 255, 255, 0.38);
          transform: rotate(-2deg);
          transition:
            transform 350ms ease,
            box-shadow 350ms ease;
        }

        .pajara-art-logo {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pajara-art-card:hover .pajara-art-logo-frame {
          transform: rotate(0deg) scale(1.04);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.17);
        }

        .pajara-art-card h2 {
          position: relative;
          z-index: 2;
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 29px;
          font-weight: 400;
          line-height: 1.18;
          letter-spacing: -0.7px;
        }

        .pajara-art-card p {
          position: relative;
          z-index: 2;
          margin: 10px 0 0;
          color: #d7dfd5;
          font-size: 11px;
          line-height: 1.8;
        }

        /* Lapisan abstrak seperti lembar desain yang bertumpuk */

        .pajara-art-shape {
          position: absolute;
          display: block;
          pointer-events: none;
          transform-origin: center;
          will-change: transform;
        }

        .pajara-art-shape-one {
          z-index: 1;
          top: 52px;
          right: 24px;
          width: 235px;
          height: 290px;
          border: 1px solid rgba(138, 106, 74, 0.35);
          border-radius: 36px 13px 36px 13px;
          background: linear-gradient(
            145deg,
            rgba(200, 173, 143, 0.28),
            rgba(200, 173, 143, 0.05)
          );
          transform: rotate(12deg);
          animation: pajara-sheet-one 7s ease-in-out infinite;
        }

        .pajara-art-shape-two {
          z-index: 2;
          top: 72px;
          left: 14px;
          width: 210px;
          height: 255px;
          border: 1px solid rgba(47, 107, 69, 0.2);
          border-radius: 12px 34px 12px 34px;
          background: linear-gradient(
            155deg,
            rgba(47, 107, 69, 0.12),
            rgba(47, 107, 69, 0.025)
          );
          transform: rotate(-13deg);
          animation: pajara-sheet-two 8s ease-in-out infinite;
        }

        .pajara-art-shape-three {
          z-index: 0;
          right: 32px;
          bottom: 31px;
          width: 130px;
          height: 115px;
          border: 1px solid rgba(138, 106, 74, 0.4);
          border-radius: 9px 30px 9px 30px;
          background: linear-gradient(
            135deg,
            rgba(138, 106, 74, 0.16),
            rgba(138, 106, 74, 0.035)
          );
          transform: rotate(24deg);
          animation: pajara-sheet-three 6s ease-in-out infinite;
        }

        .pajara-art-shape-one::before,
        .pajara-art-shape-two::before,
        .pajara-art-shape-three::before {
          position: absolute;
          top: 18px;
          right: 18px;
          left: 18px;
          height: 1px;
          background: rgba(138, 106, 74, 0.32);
          content: "";
        }

        .pajara-art-shape-two::before {
          background: rgba(47, 107, 69, 0.27);
        }

        .pajara-art-shape-three::before {
          background: rgba(138, 106, 74, 0.4);
        }

        .pajara-art-shape-one::after,
        .pajara-art-shape-two::after {
          position: absolute;
          top: 30px;
          right: 18px;
          width: 34px;
          height: 34px;
          border: 1px solid currentColor;
          border-radius: 50%;
          color: rgba(138, 106, 74, 0.45);
          content: "";
        }

        .pajara-art-shape-two::after {
          color: rgba(47, 107, 69, 0.35);
        }

        .pajara-trust-strip {
          border-top: 1px solid var(--pajara-line);
          border-bottom: 1px solid var(--pajara-line);
          background: rgba(255, 255, 255, 0.27);
        }

        .pajara-trust-inner {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          padding-block: 23px;
        }

        .pajara-trust-item {
          padding: 5px 20px;
          text-align: center;
        }

        .pajara-trust-item + .pajara-trust-item {
          border-left: 1px solid var(--pajara-line);
        }

        .pajara-trust-item strong {
          display: block;
          color: var(--pajara-deep);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 19px;
          font-weight: 500;
        }

        .pajara-trust-item span {
          display: block;
          margin-top: 5px;
          color: var(--pajara-muted);
          font-size: 10px;
          line-height: 1.6;
        }

        .pajara-section {
          padding: 94px 0;
        }

        .pajara-section-heading {
          max-width: 600px;
          margin-bottom: 39px;
        }

        .pajara-section-heading .pajara-eyebrow {
          margin-bottom: 15px;
        }

        .pajara-section-heading h2 {
          margin: 0;
          color: var(--pajara-deep);
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(32px, 4vw, 47px);
          font-weight: 500;
          line-height: 1.17;
          letter-spacing: -1.4px;
        }

        .pajara-section-heading > p:last-child {
          max-width: 510px;
          margin: 15px 0 0;
          color: var(--pajara-muted);
          font-size: 13px;
          line-height: 1.9;
        }

        .pajara-steps {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
        }

        .pajara-step {
          min-height: 245px;
          padding: 24px 21px;
          border: 1px solid var(--pajara-line);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.4);
          transition:
            transform 220ms ease,
            border-color 220ms ease,
            box-shadow 220ms ease;
        }

        .pajara-step:hover {
          transform: translateY(-5px);
          border-color: rgba(47, 107, 69, 0.36);
          box-shadow: 0 16px 40px rgba(33, 77, 50, 0.06);
        }

        .pajara-step-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .pajara-step-number {
          color: var(--pajara-brown);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .pajara-step-icon {
          display: flex;
          width: 39px;
          height: 39px;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: var(--pajara-green);
          background: rgba(47, 107, 69, 0.08);
          font-size: 19px;
        }

        .pajara-step h3 {
          margin: 0 0 10px;
          color: var(--pajara-deep);
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.3px;
        }

        .pajara-step p {
          margin: 0;
          color: var(--pajara-muted);
          font-size: 11px;
          line-height: 1.9;
        }

        .pajara-facilities-section {
          background: #eeece4;
        }

        .pajara-facilities-layout {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          align-items: start;
          gap: 72px;
        }

        .pajara-facilities-intro {
          position: sticky;
          top: 115px;
        }

        .pajara-facilities-intro h2 {
          margin: 0;
          color: var(--pajara-deep);
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(33px, 4vw, 47px);
          font-weight: 500;
          line-height: 1.18;
          letter-spacing: -1.4px;
        }

        .pajara-facilities-intro > p {
          margin: 18px 0 24px;
          color: var(--pajara-muted);
          font-size: 13px;
          line-height: 1.95;
        }

        .pajara-facilities-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .pajara-facility {
          min-height: 190px;
          padding: 22px;
          border: 1px solid rgba(33, 77, 50, 0.12);
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.45);
          transition:
            transform 200ms ease,
            background 200ms ease;
        }

        .pajara-facility:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.82);
        }

        .pajara-facility-icon {
          display: flex;
          width: 37px;
          height: 37px;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          border-radius: 12px;
          color: white;
          background: var(--pajara-green);
          font-size: 16px;
        }

        .pajara-facility h3 {
          margin: 0 0 8px;
          color: var(--pajara-deep);
          font-size: 13px;
          font-weight: 800;
        }

        .pajara-facility p {
          margin: 0;
          color: var(--pajara-muted);
          font-size: 11px;
          line-height: 1.85;
        }

        .pajara-quote {
          padding: 73px 0;
          color: white;
          background: var(--pajara-deep);
        }

        .pajara-quote-inner {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 36px;
        }

        .pajara-quote .pajara-eyebrow {
          color: #d3dfd0;
        }

        .pajara-quote h2 {
          max-width: 680px;
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(34px, 4.6vw, 54px);
          font-weight: 400;
          line-height: 1.17;
          letter-spacing: -1.4px;
        }

        .pajara-quote h2 em {
          color: #c8ad8f;
          font-weight: 400;
        }

        .pajara-quote p {
          max-width: 550px;
          margin: 16px 0 0;
          color: #d2dbd0;
          font-size: 12px;
          line-height: 1.9;
        }

        .pajara-quote .pajara-button-primary {
          flex-shrink: 0;
          color: var(--pajara-deep);
          background: var(--pajara-cream);
        }

        .pajara-quote .pajara-button-primary:hover {
          background: white;
        }

        .pajara-footer {
          padding: 26px 0;
          background: var(--pajara-cream);
        }

        .pajara-footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .pajara-footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--pajara-deep);
          font-size: 12px;
          font-weight: 800;
        }

        .pajara-footer-brand img {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          object-fit: cover;
        }

        .pajara-footer p {
          margin: 0;
          color: var(--pajara-muted);
          font-size: 10px;
          line-height: 1.7;
        }

        .pajara-footer-links {
          display: flex;
          gap: 17px;
        }

        .pajara-footer-links a {
          color: var(--pajara-muted);
          font-size: 11px;
          text-decoration: none;
        }

        .pajara-footer-links a:hover {
          color: var(--pajara-green);
        }

        .pajara-reveal {
          opacity: 0;
          transform: translateY(18px);
          transition:
            opacity 650ms ease,
            transform 650ms ease;
        }

        .pajara-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .pajara-reveal-delay-1 {
          transition-delay: 90ms;
        }

        .pajara-reveal-delay-2 {
          transition-delay: 180ms;
        }

        .pajara-reveal-delay-3 {
          transition-delay: 270ms;
        }

        @keyframes pajara-rise {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pajara-float {
          0%,
          100% {
            translate: 0 0;
          }

          50% {
            translate: 0 -9px;
          }
        }

        @keyframes pajara-sheet-one {
          0%,
          100% {
            transform: rotate(12deg) translate(0, 0);
          }

          50% {
            transform: rotate(15deg) translate(5px, -8px);
          }
        }

        @keyframes pajara-sheet-two {
          0%,
          100% {
            transform: rotate(-13deg) translate(0, 0);
          }

          50% {
            transform: rotate(-9deg) translate(-5px, 7px);
          }
        }

        @keyframes pajara-sheet-three {
          0%,
          100% {
            transform: rotate(24deg) translate(0, 0);
          }

          50% {
            transform: rotate(19deg) translate(4px, -6px);
          }
        }

        @media (max-width: 900px) {
          .pajara-hero {
            padding: 70px 0;
          }

          .pajara-hero-grid {
            grid-template-columns: 1fr 0.85fr;
            gap: 28px;
          }

          .pajara-hero h1 {
            font-size: clamp(40px, 6vw, 58px);
          }

          .pajara-hero-art {
            min-height: 340px;
          }

          .pajara-art-card {
            width: 260px;
            padding: 23px;
          }

          .pajara-art-shape-one {
            top: 39px;
            right: 8px;
            width: 195px;
            height: 245px;
          }

          .pajara-art-shape-two {
            top: 55px;
            left: 0;
            width: 175px;
            height: 220px;
          }

          .pajara-art-shape-three {
            right: 10px;
            bottom: 23px;
            width: 105px;
            height: 95px;
          }

          .pajara-steps {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pajara-facilities-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .pajara-facilities-intro {
            position: static;
          }

          .pajara-section {
            padding: 72px 0;
          }
        }

        @media (max-width: 600px) {
          .pajara-container {
            width: calc(100% - 36px);
          }

          .pajara-navbar-inner {
            min-height: 66px;
          }

          .pajara-brand {
            gap: 9px;
            font-size: 14px;
          }

          .pajara-brand-logo {
            width: 35px;
            height: 35px;
            border-radius: 10px;
          }

          .pajara-menu-toggle {
            display: inline-flex;
          }

          .pajara-nav {
            position: absolute;
            top: calc(100% + 1px);
            right: 0;
            left: 0;
            display: none;
            align-items: stretch;
            flex-direction: column;
            gap: 0;
            padding: 8px 18px 17px;
            border-bottom: 1px solid var(--pajara-line);
            background: var(--pajara-cream);
          }

          .pajara-nav.is-open {
            display: flex;
            animation: pajara-rise 180ms ease both;
          }

          .pajara-nav a {
            padding: 14px 4px;
          }

          .pajara-nav .pajara-nav-cta {
            margin-top: 5px;
            padding: 13px 18px;
            text-align: center;
          }

          .pajara-hero {
            padding: 57px 0 47px;
          }

          .pajara-hero-grid {
            grid-template-columns: 1fr;
            gap: 25px;
          }

          .pajara-eyebrow {
            margin-bottom: 17px;
            font-size: 9px;
            letter-spacing: 2px;
          }

          .pajara-hero h1 {
            max-width: 470px;
            font-size: clamp(42px, 12vw, 57px);
            line-height: 1.08;
            letter-spacing: -1.9px;
          }

          .pajara-hero-description {
            margin-top: 17px;
            font-size: 13px;
            line-height: 1.9;
          }

          .pajara-hero-actions {
            gap: 9px;
            margin-top: 25px;
          }

          .pajara-button {
            min-height: 46px;
            padding: 0 18px;
            font-size: 12px;
          }

          .pajara-hero-note {
            margin-top: 20px;
            font-size: 10px;
          }

          .pajara-hero-art {
            min-height: 330px;
            margin-top: 4px;
          }

          .pajara-art-card {
            width: 245px;
            padding: 23px;
            border-radius: 21px;
          }

          .pajara-art-logo-frame {
            width: 75px;
            height: 75px;
            margin: 27px 0 22px;
            border-radius: 21px;
          }

          .pajara-art-card h2 {
            font-size: 26px;
          }

          .pajara-art-shape-one {
            top: 34px;
            right: 5px;
            width: 190px;
            height: 245px;
          }

          .pajara-art-shape-two {
            top: 51px;
            left: 1px;
            width: 165px;
            height: 218px;
          }

          .pajara-art-shape-three {
            right: 7px;
            bottom: 17px;
            width: 95px;
            height: 82px;
          }

          .pajara-trust-inner {
            grid-template-columns: 1fr;
            padding-block: 8px;
          }

          .pajara-trust-item {
            padding: 14px 8px;
          }

          .pajara-trust-item + .pajara-trust-item {
            border-top: 1px solid var(--pajara-line);
            border-left: 0;
          }

          .pajara-trust-item strong {
            font-size: 18px;
          }

          .pajara-trust-item span {
            font-size: 10px;
          }

          .pajara-section {
            padding: 62px 0;
          }

          .pajara-section-heading {
            margin-bottom: 27px;
          }

          .pajara-section-heading h2,
          .pajara-facilities-intro h2 {
            font-size: 35px;
            letter-spacing: -1px;
          }

          .pajara-section-heading > p:last-child,
          .pajara-facilities-intro > p {
            font-size: 12px;
          }

          .pajara-steps {
            grid-template-columns: 1fr;
            gap: 11px;
          }

          .pajara-step {
            min-height: auto;
            padding: 20px;
          }

          .pajara-step-top {
            margin-bottom: 21px;
          }

          .pajara-step h3 {
            font-size: 14px;
          }

          .pajara-step p {
            font-size: 11px;
          }

          .pajara-facilities-list {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .pajara-facility {
            min-height: auto;
            padding: 19px;
          }

          .pajara-facility-icon {
            margin-bottom: 15px;
          }

          .pajara-quote {
            padding: 58px 0;
          }

          .pajara-quote-inner {
            grid-template-columns: 1fr;
            gap: 26px;
          }

          .pajara-quote h2 {
            font-size: 39px;
            letter-spacing: -1px;
          }

          .pajara-quote p {
            font-size: 12px;
          }

          .pajara-quote .pajara-button {
            justify-self: start;
          }

          .pajara-footer-inner {
            align-items: flex-start;
            flex-direction: column;
            gap: 15px;
          }

          .pajara-footer-links {
            gap: 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .pajara-reveal {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <header className="pajara-navbar">
        <div className="pajara-container pajara-navbar-inner">
          <a href="/" className="pajara-brand">
            <img
              src={logo}
              alt="Logo Pajara Studio"
              className="pajara-brand-logo"
            />
            <span>Pajara Studio</span>
          </a>

          <button
            type="button"
            className="pajara-menu-toggle"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? "×" : "☰"}
          </button>

          <nav className={`pajara-nav ${menuOpen ? "is-open" : ""}`}>
            <a href="https://pajara-website.pajarastd.workers.dev/">
              Website
            </a>
            <a href="#cara-order" onClick={() => setMenuOpen(false)}>
              Cara Order
            </a>
            <a href="#fasilitas" onClick={() => setMenuOpen(false)}>
              Fasilitas
            </a>
            <a href="/login" className="pajara-nav-cta">
              Login
            </a>
          </nav>
        </div>
      </header>

      <section className="pajara-hero">
        <div className="pajara-container pajara-hero-grid">
          <div className="pajara-hero-content">
            <p className="pajara-eyebrow">Customer Web · Pajara Studio</p>

            <h1>
              Punya ide?
              <br />
              Mari wujudkan
              <br />
              bersama <span>Pajara.</span>
            </h1>

            <p className="pajara-hero-description">
              Tempat Kang/Teh memulai perjalanan desain dengan lebih
              terarah. Pesan layanan, pantau proses, kelola pembayaran,
              hingga mengakses file final dalam satu tempat.
            </p>

            <div className="pajara-hero-actions">
              <a href="/login" className="pajara-button pajara-button-primary">
                Mulai Pesan <span aria-hidden="true">↗</span>
              </a>
              <a
                href="#cara-order"
                className="pajara-button pajara-button-secondary"
              >
                Lihat Cara Order
              </a>
            </div>

            <div className="pajara-hero-note">
              <span className="pajara-note-dot" />
              <span>
                Sudah punya akun?{" "}
                <a
                  href="/login"
                  style={{
                    color: "var(--pajara-green)",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Login di sini
                </a>
              </span>
            </div>
          </div>

          <div
            className="pajara-hero-art"
            aria-label="Identitas visual Pajara Studio"
          >
            <div className="pajara-art-shape pajara-art-shape-one" aria-hidden="true" />
            <div className="pajara-art-shape pajara-art-shape-two" aria-hidden="true" />
            <div className="pajara-art-shape pajara-art-shape-three" aria-hidden="true" />

            <div className="pajara-art-card">
              <span className="pajara-art-card-label">
                Design with direction
              </span>

              <div className="pajara-art-logo-frame">
                <img
                  src={logo}
                  alt="Logo Pajara Studio"
                  className="pajara-art-logo"
                />
              </div>

              <h2>Desain yang punya arah.</h2>
              <p>
                Berakar di Tanah Pasundan.
                <br />
                Bertumbuh bersama setiap ide.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="pajara-trust-strip">
        <div className="pajara-container pajara-trust-inner">
          <div className="pajara-trust-item">
            <strong>Satu tempat</strong>
            <span>Kelola pesanan desain</span>
          </div>
          <div className="pajara-trust-item">
            <strong>Lebih terarah</strong>
            <span>Pantau proses dan status</span>
          </div>
          <div className="pajara-trust-item">
            <strong>Lebih praktis</strong>
            <span>Akses informasi pesanan</span>
          </div>
        </div>
      </div>

      <section
        id="cara-order"
        className="pajara-section"
        ref={(element) => {
          sectionRefs.current[0] = element;
        }}
        data-reveal-index={0}
      >
        <div
          className={`pajara-container pajara-reveal ${
            visible.includes(0) ? "is-visible" : ""
          }`}
        >
          <div className="pajara-section-heading">
            <p className="pajara-eyebrow">Mulai dari sini</p>
            <h2>
              Dari ide sederhana
              <br />
              menjadi karya yang berarti.
            </h2>
            <p>
              Proses pemesanan dirancang agar Kang/Teh bisa menyampaikan
              kebutuhan dengan jelas dan mengikuti perkembangan pesanan
              melalui Customer Web.
            </p>
          </div>

          <div className="pajara-steps">
            {steps.map((step, index) => (
              <article
                className={`pajara-step pajara-reveal pajara-reveal-delay-${Math.min(
                  index,
                  3
                )} ${visible.includes(0) ? "is-visible" : ""}`}
                key={step.number}
              >
                <div className="pajara-step-top">
                  <span className="pajara-step-number">{step.number}</span>
                  <span className="pajara-step-icon" aria-hidden="true">
                    {step.icon}
                  </span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="fasilitas"
        className="pajara-section pajara-facilities-section"
        ref={(element) => {
          sectionRefs.current[1] = element;
        }}
        data-reveal-index={1}
      >
        <div
          className={`pajara-container pajara-facilities-layout pajara-reveal ${
            visible.includes(1) ? "is-visible" : ""
          }`}
        >
          <div className="pajara-facilities-intro">
            <p className="pajara-eyebrow">Di dalam akunmu</p>
            <h2>Semua kebutuhan desain, lebih mudah dijangkau.</h2>
            <p>
              Customer Web menjadi tempat untuk mengikuti perjalanan
              pesanan, mulai dari informasi order hingga file hasil desain
              yang tersedia.
            </p>
            <a
              href="/register"
              className="pajara-button pajara-button-primary"
            >
              Buat Akun <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="pajara-facilities-list">
            {facilities.map((facility, index) => (
              <article
                className={`pajara-facility pajara-reveal pajara-reveal-delay-${index % 3} ${
                  visible.includes(1) ? "is-visible" : ""
                }`}
                key={facility.number}
              >
                <div className="pajara-facility-icon" aria-hidden="true">
                  {facility.icon}
                </div>
                <h3>{facility.title}</h3>
                <p>{facility.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pajara-quote">
        <div className="pajara-container pajara-quote-inner">
          <div>
            <p className="pajara-eyebrow">Mari mulai perjalanan kita</p>
            <h2>
              Ide Kang/Teh layak
              <br />
              diwujudkan dengan <em>arah.</em>
            </h2>
            <p>
              Mulai dengan membuat akun atau masuk ke akun yang sudah
              dimiliki. Setelah masuk, Kang/Teh bisa membuka Dashboard
              dan memilih Pesan Desain.
            </p>
          </div>

          <a href="/login" className="pajara-button pajara-button-primary">
            Mulai Pesan <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <footer className="pajara-footer">
        <div className="pajara-container pajara-footer-inner">
          <div className="pajara-footer-brand">
            <img src={logo} alt="" />
            <span>Pajara Studio</span>
          </div>

          <p>Berakar di Tanah Pasundan.</p>

          <div className="pajara-footer-links">
            <a href="https://pajara-website.pajarastd.workers.dev/">
              Website
            </a>
            <a href="/login">Login</a>
            <a href="/register">Buat Akun</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
