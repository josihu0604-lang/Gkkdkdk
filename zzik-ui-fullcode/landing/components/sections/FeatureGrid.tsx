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
        padding: "min(10vh, 6rem) 0",
        background: "#FAFAFA"
      }}
    >
      <div className="container" style={{ maxWidth: "1100px" }}>
        <h2 style={{ 
          fontSize: "2rem",
          fontWeight: 600,
          marginBottom: "3rem",
          textAlign: "center",
          color: "#0A0A0A",
          letterSpacing: "-0.02em"
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
                border: "1px solid #E5E5E5",
                borderRadius: "8px",
                padding: "2rem 1.5rem",
                transition: "border-color 0.15s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#D0D0D0"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E5E5E5"}
            >
              <h3 style={{ 
                fontWeight: 600,
                marginBottom: "0.5rem",
                fontSize: "1.125rem",
                color: "#0A0A0A"
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: "#666666",
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
