
"use client";

type CustomerLoadingProps = {
  title: string;
  description: string;
};

const logo =
  "/755809946_17926162029385149_3739923509439876817_n.jpg";

export default function CustomerLoading({
  title,
  description,
}: CustomerLoadingProps) {
  return (
    <main className="pajara-loading-screen">
      <style jsx>{`
        .pajara-loading-screen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 15% 18%,
              rgba(47, 107, 69, 0.13),
              transparent 36%
            ),
            radial-gradient(
              circle at 85% 78%,
              rgba(138, 106, 74, 0.13),
              transparent 34%
            ),
            #f7f4ee;
          color: #214d32;
          font-family: "DM Sans", Arial, sans-serif;
          text-align: center;
          box-sizing: border-box;
        }

        .pajara-loading-screen *,
        .pajara-loading-screen *::before,
        .pajara-loading-screen *::after {
          box-sizing: border-box;
        }

        .pajara-loading-orb {
          position: absolute;
          border: 1px solid rgba(47, 107, 69, 0.10);
          border-radius: 50%;
          pointer-events: none;
        }

        .pajara-loading-orb-one {
          top: -95px;
          right: -85px;
          width: 270px;
          height: 270px;
        }

        .pajara-loading-orb-two {
          bottom: -115px;
          left: -100px;
          width: 310px;
          height: 310px;
        }

        .pajara-loading-orb-three {
          top: 18%;
          left: -45px;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.15);
          filter: blur(2px);
        }

        .pajara-loading-glass {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 370px;
          min-width: 0;
          padding: 38px 27px 35px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.78);
          border-radius: 27px;
          background: rgba(255, 255, 255, 0.48);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          backdrop-filter: blur(24px) saturate(160%);
          box-shadow:
            0 22px 70px rgba(33, 77, 50, 0.12),
            0 5px 18px rgba(33, 77, 50, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.85);
          animation: pajaraLoadingAppear 650ms ease both;
        }

        .pajara-loading-logo-wrap {
          position: relative;
          flex: 0 0 94px;
          width: 94px;
          min-width: 94px;
          max-width: 94px;
          height: 94px;
          min-height: 94px;
          max-height: 94px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          margin: 0 0 25px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 23px;
          background: rgba(255, 255, 255, 0.76);
          box-shadow:
            0 9px 26px rgba(33, 77, 50, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        .pajara-loading-screen img.pajara-loading-logo {
          display: block;
          flex: 0 0 100%;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          height: 100%;
          min-height: 0;
          max-height: 100%;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 15px;
          object-fit: contain;
          object-position: center;
        }

        .pajara-loading-brand {
          display: block;
          width: 100%;
          margin: 0 0 10px;
          color: #8a6a4a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 3px;
          line-height: 1.5;
        }

        .pajara-loading-title {
          display: block;
          width: 100%;
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 29px;
          font-weight: 500;
          letter-spacing: -0.8px;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .pajara-loading-description {
          display: block;
          width: 100%;
          max-width: 270px;
          margin: 12px 0 0;
          color: #777d73;
          font-size: 12px;
          font-weight: 400;
          line-height: 1.9;
          overflow-wrap: break-word;
        }

        .pajara-loading-track {
          flex: 0 0 3px;
          width: 155px;
          height: 3px;
          overflow: hidden;
          margin-top: 31px;
          border-radius: 10px;
          background: rgba(47, 107, 69, 0.13);
        }

        .pajara-loading-progress {
          width: 40%;
          height: 100%;
          border-radius: 10px;
          background: linear-gradient(
            90deg,
            #214d32,
            #477b50,
            #8a6a4a
          );
          animation: pajaraLoadingProgress 1.4s ease-in-out infinite;
        }

        .pajara-loading-footer {
          position: static;
          display: block;
          width: 100%;
          margin-top: 27px;
          padding-top: 17px;
          border-top: 1px solid rgba(47, 107, 69, 0.13);
          color: #9b978c;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          line-height: 1.5;
        }

        @keyframes pajaraLoadingAppear {
          from {
            opacity: 0;
            transform: translateY(13px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pajaraLoadingProgress {
          0% {
            transform: translateX(-110%);
          }
          100% {
            transform: translateX(260%);
          }
        }

        @media (max-width: 380px) {
          .pajara-loading-glass {
            padding: 32px 21px 30px;
            border-radius: 23px;
          }

          .pajara-loading-title {
            font-size: 26px;
          }

          .pajara-loading-logo-wrap {
            flex-basis: 84px;
            width: 84px;
            min-width: 84px;
            max-width: 84px;
            height: 84px;
            min-height: 84px;
            max-height: 84px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pajara-loading-glass,
          .pajara-loading-progress {
            animation: none;
          }
        }
      `}</style>

      <div className="pajara-loading-orb pajara-loading-orb-one" />
      <div className="pajara-loading-orb pajara-loading-orb-two" />
      <div className="pajara-loading-orb pajara-loading-orb-three" />

      <div className="pajara-loading-glass">
        <div className="pajara-loading-logo-wrap">
          <img
            src={logo}
            alt="Pajara Studio"
            className="pajara-loading-logo"
            width={78}
            height={78}
          />
        </div>

        <p className="pajara-loading-brand">PAJARA STUDIO</p>

        <h1 className="pajara-loading-title">{title}</h1>

        <p className="pajara-loading-description">{description}</p>

        <div className="pajara-loading-track">
          <div className="pajara-loading-progress" />
        </div>

        <div className="pajara-loading-footer">
          DESAIN YANG PUNYA ARAH.
        </div>
      </div>
    </main>
  );
}
