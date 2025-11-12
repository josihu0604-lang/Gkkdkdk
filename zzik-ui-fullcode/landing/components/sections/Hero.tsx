'use client';

import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');
  
  return (
    <section style={{ 
      position: 'relative',
      padding: "8rem 0 6rem",
      background: `
        radial-gradient(ellipse 80% 50% at 50% -20%, oklch(97% 0.04 290), transparent),
        linear-gradient(180deg, var(--bg-base) 0%, var(--bg-surface) 100%)
      `,
      overflow: 'hidden'
    }}>
      {/* Subtle grid background (Linear style) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(var(--border-default) 1px, transparent 1px),
          linear-gradient(90deg, var(--border-default) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
        opacity: 0.3,
        pointerEvents: 'none'
      }} />
      
      {/* Radial glow effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, oklch(70% 0.16 290 / 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />
      
      <div className="container" style={{ 
        maxWidth: "var(--container-4xl)",
        textAlign: "center",
        display: "grid",
        gap: "var(--space-8)",
        position: 'relative',
        zIndex: 1
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              background: 'var(--color-success-500)',
              borderRadius: '50%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            Now Available in Beta
          </span>
        </div>
        
        <h1 style={{ 
          fontSize: "clamp(var(--text-3xl), 6vw, var(--text-5xl))",
          fontWeight: 'var(--font-bold)',
          lineHeight: 'var(--leading-tight)',
          letterSpacing: 'var(--tracking-tighter)',
          color: 'var(--text-primary)',
          margin: '0 auto',
          maxWidth: '900px'
        }}>
          {t('title')}
        </h1>
        
        <p style={{
          fontSize: 'clamp(var(--text-lg), 2vw, var(--text-xl))',
          lineHeight: 'var(--leading-relaxed)',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: "0 auto"
        }}>
          {t('subtitle')}
        </p>
        
        <div style={{ 
          display: "flex", 
          gap: "var(--space-4)",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "var(--space-2)"
        }}>
          <a 
            className="btn" 
            href="#lead"
            style={{
              padding: "var(--space-4) var(--space-8)",
              fontSize: "var(--text-base)",
              fontWeight: 'var(--font-semibold)',
              borderRadius: "var(--radius-base)",
              background: 'var(--interactive-default)',
              color: 'var(--text-inverse)',
              boxShadow: 'var(--shadow-md)',
              transition: 'all var(--duration-fast) var(--ease-spring)'
            }}
          >
            {t('cta')}
          </a>
          <a
            className="btn-secondary"
            style={{
              padding: "var(--space-4) var(--space-8)",
              fontSize: "var(--text-base)",
              fontWeight: 'var(--font-semibold)',
              borderRadius: "var(--radius-base)",
              background: "transparent",
              color: 'var(--text-primary)',
              border: "1px solid var(--border-default)",
              boxShadow: 'var(--shadow-xs)',
              transition: 'all var(--duration-fast) var(--ease-spring)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              textDecoration: 'none'
            }}
            href="#features"
          >
            {t('watchDemo')}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.6 }}>
              <path d="M3.5 8h9m0 0l-3.5-3.5M12.5 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
        
        {/* Trust indicators */}
        <div style={{
          marginTop: 'var(--space-12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)'
        }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--text-tertiary)',
            fontWeight: 'var(--font-medium)'
          }}>
            Trusted by local businesses
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--space-8)',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
            opacity: 0.4
          }}>
            {['Retail', 'Cafe', 'Restaurant', 'Fitness'].map((category) => (
              <span key={category} style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--text-secondary)'
              }}>
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  );
}
