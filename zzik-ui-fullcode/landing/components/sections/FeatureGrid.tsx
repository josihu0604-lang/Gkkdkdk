'use client';

import { useTranslations } from 'next-intl';

export default function FeatureGrid() {
  const t = useTranslations('features');
  
  const features = [
    {
      key: 'explore',
      title: t('explore.title'),
      description: t('explore.description'),
      gradient: 'linear-gradient(135deg, oklch(97% 0.04 290), oklch(96% 0.03 240))',
      iconColor: 'oklch(60% 0.20 290)'
    },
    {
      key: 'content',
      title: t('content.title'),
      description: t('content.description'),
      gradient: 'linear-gradient(135deg, oklch(96% 0.03 240), oklch(96% 0.04 145))',
      iconColor: 'oklch(55% 0.22 240)'
    },
    {
      key: 'rewards',
      title: t('rewards.title'),
      description: t('rewards.description'),
      gradient: 'linear-gradient(135deg, oklch(96% 0.04 145), oklch(97% 0.03 80))',
      iconColor: 'oklch(65% 0.20 145)'
    },
    {
      key: 'gamification',
      title: t('gamification.title'),
      description: t('gamification.description'),
      gradient: 'linear-gradient(135deg, oklch(97% 0.03 80), oklch(97% 0.04 290))',
      iconColor: 'oklch(70% 0.18 80)'
    },
  ];

  return (
    <section
      id="features"
      style={{
        padding: "var(--space-24) 0",
        background: 'var(--bg-base)',
        position: 'relative'
      }}
    >
      <div className="container" style={{ maxWidth: "var(--container-6xl)" }}>
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-16)',
          maxWidth: 'var(--container-3xl)',
          margin: '0 auto var(--space-16)'
        }}>
          <span style={{
            display: 'inline-block',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-base)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-4)'
          }}>
            Features
          </span>
          <h2 style={{ 
            fontSize: 'clamp(var(--text-2xl), 4vw, var(--text-4xl))',
            fontWeight: 'var(--font-bold)',
            marginBottom: 'var(--space-4)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--text-primary)'
          }}>
            {t('title')}
          </h2>
          <p style={{
            fontSize: 'var(--text-lg)',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Everything you need to build engaging local experiences
          </p>
        </div>
        
        {/* Feature Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {features.map((feature, index) => (
            <div 
              key={feature.key}
              className="card"
              style={{
                background: 'var(--bg-surface-raised)',
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-8)",
                transition: "all var(--duration-base) var(--ease-spring)",
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-base)',
                animationDelay: `${index * 100}ms`,
                animation: 'slideUp 0.5s var(--ease-spring) both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "var(--shadow-xl)";
                e.currentTarget.style.borderColor = "var(--border-hover)";
                const bg = e.currentTarget.querySelector('.card-gradient') as HTMLElement;
                if (bg) bg.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-base)";
                e.currentTarget.style.borderColor = "var(--border-default)";
                const bg = e.currentTarget.querySelector('.card-gradient') as HTMLElement;
                if (bg) bg.style.opacity = '0.5';
              }}
            >
              {/* Gradient background overlay */}
              <div 
                className="card-gradient"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: feature.gradient,
                  opacity: 0.5,
                  transition: 'opacity var(--duration-base) var(--ease-out)',
                  pointerEvents: 'none'
                }} 
              />
              
              {/* Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-base)',
                background: `linear-gradient(135deg, ${feature.iconColor}, transparent)`,
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-6)',
                position: 'relative',
                zIndex: 1,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: feature.iconColor,
                  borderRadius: '50%',
                  opacity: 0.3
                }} />
              </div>
              
              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ 
                  fontWeight: 'var(--font-semibold)',
                  marginBottom: "var(--space-3)",
                  fontSize: "var(--text-xl)",
                  color: "var(--text-primary)",
                  letterSpacing: 'var(--tracking-tight)'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: "var(--text-secondary)",
                  lineHeight: 'var(--leading-relaxed)',
                  fontSize: "var(--text-base)"
                }}>
                  {feature.description}
                </p>
              </div>
              
              {/* Hover arrow indicator */}
              <div style={{
                position: 'absolute',
                bottom: 'var(--space-6)',
                right: 'var(--space-6)',
                opacity: 0,
                transform: 'translateX(-8px)',
                transition: 'all var(--duration-base) var(--ease-spring)',
                pointerEvents: 'none',
                zIndex: 1
              }}
              className="card-arrow"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke={feature.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .card:hover .card-arrow {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}</style>
    </section>
  );
}
