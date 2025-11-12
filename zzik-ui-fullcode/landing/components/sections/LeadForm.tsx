'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function LeadForm() {
  const t = useTranslations('cta');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Lead submitted:', email);
    setSubmitted(true);
  };

  return (
    <section 
      id="lead" 
      style={{ 
        padding: 'var(--space-24) 0',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container" style={{ maxWidth: 'var(--container-4xl)' }}>
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-600))',
          padding: 'var(--space-16) var(--space-8)',
          borderRadius: 'var(--radius-2xl)',
          color: 'var(--text-inverse)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Radial glow overlay */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, oklch(80% 0.16 290 / 0.4) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none'
          }} />
          
          {/* Grid pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            opacity: 0.5,
            pointerEvents: 'none'
          }} />
          
          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ 
              fontSize: 'clamp(var(--text-2xl), 4vw, var(--text-4xl)',
              fontWeight: 'var(--font-bold)',
              marginBottom: 'var(--space-4)',
              color: 'white',
              letterSpacing: 'var(--tracking-tight)'
            }}>
              {t('title')}
            </h2>
            <p style={{ 
              opacity: 0.95,
              marginBottom: 'var(--space-8)',
              fontSize: 'var(--text-lg)',
              maxWidth: '600px',
              margin: '0 auto var(--space-8)',
              lineHeight: 'var(--leading-relaxed)'
            }}>
              {t('subtitle')}
            </p>
            
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ 
                  display: 'flex',
                  gap: 'var(--space-3)',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ 
                      flex: '1 1 280px',
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-base)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      fontSize: 'var(--text-base)',
                      minWidth: '200px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      color: 'white',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      transition: 'all var(--duration-fast) var(--ease-out)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                  />
                  <button 
                    type="submit"
                    style={{ 
                      background: 'white',
                      color: 'var(--color-primary-600)',
                      padding: 'var(--space-4) var(--space-8)',
                      fontWeight: 'var(--font-semibold)',
                      flexShrink: 0,
                      border: 'none',
                      borderRadius: 'var(--radius-base)',
                      fontSize: 'var(--text-base)',
                      cursor: 'pointer',
                      transition: 'all var(--duration-fast) var(--ease-spring)',
                      boxShadow: 'var(--shadow-lg)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }}
                  >
                    {t('button')}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3.5 8h9m0 0l-3.5-3.5M12.5 8l-3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ 
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                padding: 'var(--space-6)',
                background: 'rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-base)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: 'var(--shadow-md)',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                Thank you! We'll be in touch soon.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
