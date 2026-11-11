
"use client";

import "./CustomerLoading.css";

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
      <div className="pajara-loading-orb pajara-loading-orb-one" />
      <div className="pajara-loading-orb pajara-loading-orb-two" />
      <div className="pajara-loading-orb pajara-loading-orb-three" />

      <div className="pajara-loading-glass">
        <div className="pajara-loading-logo-wrap">
          <img
            src="/755809946_17926162029385149_3739923509439876817_n.jpg"
            alt="Pajara Studio"
            className="pajara-loading-logo"
          />
        </div>

        <p className="pajara-loading-brand">PAJARA STUDIO</p>

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
