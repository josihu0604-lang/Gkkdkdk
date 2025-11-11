'use client';

import { useTranslations } from 'next-intl';
import Button from "@/components/ui/Button";

export default function Hero() {
  const t = useTranslations('hero');
  
  return (
    <section style={{ padding: "4rem 0" }}>
      <div className="container" style={{ display: "grid", gap: "1.25rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          {t('title')}
        </h1>
        <p className="subtitle">
          {t('subtitle')}
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <a className="btn" href="#lead">
            {t('cta')}
          </a>
          <a
            className="btn"
            style={{
              background: "transparent",
              color: "oklch(65% 0.20 35)",
              border: "1px solid oklch(65% 0.20 35)",
            }}
            href="#features"
          >
            {t('watchDemo')}
          </a>
        </div>
      </div>
    </section>
  );
}
