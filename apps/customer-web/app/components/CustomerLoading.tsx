
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
          background: #f7f4ee;
          color: #214d32;
          font-family: "DM Sans", Arial, sans-serif;
          text-align: center;
          box-sizing: border-box;
        }

        .pajara-loading-content {
          width: 100%;
          max-width: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pajara-loading-title {
          margin: 0;
          color: #214d32;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          font-weight: 500;
          line-height: 1.4;
        }

        .pajara-loading-description {
          margin: 9px 0 0;
          color: #777d73;
          font-size: 12px;
          line-height: 1.8;
        }

        .pajara-loading-track {
          width: 135px;
          height: 3px;
          margin-top: 25px;
          overflow: hidden;
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

        @keyframes pajaraLoadingProgress {
          from {
            transform: translateX(-110%);
          }
          to {
            transform: translateX(260%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pajara-loading-progress {
            animation: none;
          }
        }
      `}</style>

      <div className="pajara-loading-content">
        <h1 className="pajara-loading-title">{title}</h1>

        <p className="pajara-loading-description">
          {description}
        </p>

        <div className="pajara-loading-track">
          <div className="pajara-loading-progress" />
        </div>
      </div>
    </main>
  );
}
