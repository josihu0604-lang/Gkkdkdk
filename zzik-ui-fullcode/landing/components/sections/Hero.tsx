'use client';

import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');
  
  return (
    <section style={{ 
      padding: "min(12vh, 8rem) 0 min(10vh, 6rem)",
      background: '#FFFFFF'
    }}>
      <div className="container" style={{ 
        maxWidth: "760px",
        textAlign: "center"
      }}>
        <h1 style={{ 
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: "#0A0A0A",
          marginBottom: "1.5rem"
        }}>
          {t('title')}
        </h1>
        
        <p style={{
          fontSize: "1.125rem",
          lineHeight: 1.6,
          color: "#666666",
          marginBottom: "2.5rem",
          maxWidth: "600px",
          margin: "0 auto 2.5rem"
        }}>
          {t('subtitle')}
        </p>
        
        <div style={{ 
          display: "flex", 
          gap: "0.75rem",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <a 
            className="btn btn-primary" 
            href="#lead"
          >
            {t('cta')}
          </a>
          <a
            className="btn-secondary"
            href="#features"
          >
            {t('watchDemo')}
          </a>
        </div>
      </div>
    </section>
  );
}
