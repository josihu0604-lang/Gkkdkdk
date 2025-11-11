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
    <div
      id="features"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}
    >
      <h2 style={{ gridColumn: '1 / -1', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
        {t('title')}
      </h2>
      {features.map((feature) => (
        <div key={feature.key} className="card">
          <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.1rem" }}>
            {feature.title}
          </div>
          <div className="subtitle">{feature.description}</div>
        </div>
      ))}
    </div>
  );
}
