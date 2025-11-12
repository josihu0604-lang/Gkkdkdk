'use client';

import { useTranslations } from 'next-intl';

export default function FeatureGrid() {
  const t = useTranslations('features');
  
  const features = [
    {
      key: 'explore',
      title: t('explore.title'),
      description: t('explore.description'),
    },
    {
      key: 'content',
      title: t('content.title'),
      description: t('content.description'),
    },
    {
      key: 'rewards',
      title: t('rewards.title'),
      description: t('rewards.description'),
    },
    {
      key: 'gamification',
      title: t('gamification.title'),
      description: t('gamification.description'),
    },
  ];

  return (
    <section
      id="features"
      style={{
        padding: "4rem 0",
      }}
    >
      <div className="container" style={{ maxWidth: "1000px" }}>
        <h2 style={{ 
          fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
          fontWeight: 700,
          marginBottom: '3rem',
          textAlign: 'center',
          color: "oklch(20% 0.01 240)"
        }}>
          {t('title')}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {features.map((feature) => (
            <div 
              key={feature.key} 
              style={{
                background: "white",
                border: "1px solid oklch(92% 0.008 240)",
                borderRadius: "0.75rem",
                padding: "1.75rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.08)";
              }}
            >
              <h3 style={{ 
                fontWeight: 600,
                marginBottom: "0.75rem",
                fontSize: "1.125rem",
                color: "oklch(25% 0.01 240)"
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: "oklch(50% 0.01 240)",
                lineHeight: 1.6,
                fontSize: "0.9375rem"
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
