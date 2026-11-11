
"use client";

type CustomerLoadingProps = {
  title: string;
  description: string;
};

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
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
          background:
            radial-gradient(circle at 15% 18%, rgba(47,107,69,.13), transparent 36%),
            radial-gradient(circle at 85% 78%, rgba(138,106,74,.13), transparent 34%),
            #f7f4ee;
          color: #214d32;
          font-family: "DM Sans", Arial, sans-serif;
          text-align: center;
          box-sizing: border-box;
        }

        .pajara-loading-orb {
          position: absolute;
          border: 1px solid rgba(47,107,69,.10);
          border-radius: 50%;
          pointer-events: none;
        }

        .orb-one {
          top: -95px;
          right: -85px;
          width: 270px;
          height: 270px;
        }

        .orb-two {
          bottom: -115px;
          left: -100px;
          width: 310px;
          height: 310px;
        }

        .pajara-loading-glass {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 370px;
          padding: 42px 27px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid rgba(255,255,255,.78);
          border-radius: 27px;
          background: rgba(255,255,255,.48);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          backdrop-filter: blur(24px) saturate(160%);
          box-shadow:
            0 22px 70px rgba(33,77,50,.12),
            inset 0 1px 0 rgba(255,255,255,.85);
          animation: pajaraAppear 650ms ease both;
          box-sizing: border-box;
        }

        .pajara-loading-mark {
          width: 42px;
          height: 42px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(47,107,69,.16);
          border-radius: 14px;
          background: rgba(47,107,69,.07);
        }

        .pajara-loading-mark span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2f6b45;
          box-shadow:
            12px 0 0 #8a6a4a,
            -12px 0 0 #214d32;
          animation: pajaraPulse 1.2s ease-in-out infinite;
        }

        .pajara-loading-title {
          width: 100%;
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 27px;
          font-weight: 500;
          letter-spacing: -.5px;
          line-height: 1.3;
          overflow-wrap: anywhere;
        }

        .pajara-loading-description {
          max-width: 270px;
          margin: 12px 0 0;
          color: #777d73;
          font-size: 12px;
          line-height: 1.9;
          overflow-wrap: break-word;
        }

        .pajara-loading-track {
          width: 155px;
          height: 3px;
          margin-top: 29px;
          overflow: hidden;
          border-radius: 10px;
          background: rgba(47,107,69,.13);
        }

        .pajara-loading-progress {
          width: 40%;
          height: 100%;
          border-radius: 10px;
          background: linear-gradient(90deg,#214d32,#477b50,#8a6a4a);
          animation: pajaraProgress 1.4s ease-in-out infinite;
        }

        .pajara-loading-footer {
          width: 100%;
          margin-top: 25px;
          padding-top: 16px;
          border-top: 1px solid rgba(47,107,69,.13);
          color: #9b978c;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        @keyframes pajaraAppear {
          from { opacity: 0; transform: translateY(13px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes pajaraProgress {
          from { transform: translateX(-110%); }
          to { transform: translateX(260%); }
        }

        @keyframes pajaraPulse {
          0%, 100% { opacity: .55; transform: scale(.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @media (max-width: 380px) {
          .pajara-loading-glass {
            padding: 35px 21px 29px;
          }

          .pajara-loading-title {
            font-size: 24px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pajara-loading-glass,
          .pajara-loading-progress,
          .pajara-loading-mark span {
            animation: none;
          }
        }
      `}</style>

      <div className="pajara-loading-orb orb-one" />
      <div className="pajara-loading-orb orb-two" />

      <div className="pajara-loading-glass">
        <div className="pajara-loading-mark">
          <span />
        </div>

        <h1 className="pajara-loading-title">{title}</h1>

        <p className="pajara-loading-description">
          {description}
        </p>

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
