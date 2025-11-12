'use client';

import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');
  
  return (
    <section style={{ 
      padding: "6rem 0 4rem",
      background: "linear-gradient(180deg, oklch(98% 0.01 240) 0%, oklch(100% 0 0) 100%)"
    }}>
      <div className="container" style={{ 
        maxWidth: "800px",
        textAlign: "center",
        display: "grid",
        gap: "1.5rem"
      }}>
        <h1 style={{ 
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          color: "oklch(20% 0.01 240)"
        }}>
          {t('title')}
        </h1>
        <p style={{
          fontSize: "1.125rem",
          lineHeight: 1.6,
          color: "oklch(45% 0.01 240)",
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          {t('subtitle')}
        </p>
        <div style={{ 
          display: "flex", 
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "0.5rem"
        }}>
          <a 
            className="btn" 
            href="#lead"
            style={{
              padding: "0.875rem 2rem",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "0.5rem"
            }}
          >
            {t('cta')}
          </a>
          <a
            className="btn"
            style={{
              padding: "0.875rem 2rem",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "0.5rem",
              background: "transparent",
              color: "oklch(65% 0.20 35)",
              border: "2px solid oklch(90% 0.02 240)",
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
