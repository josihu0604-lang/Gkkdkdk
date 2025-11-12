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
        padding: '4rem 0',
      }}
    >
      <div className="container" style={{ maxWidth: '700px' }}>
        <div style={{
          background: 'linear-gradient(135deg, oklch(65% 0.20 35) 0%, oklch(48% 0.13 245) 100%)',
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-xl)',
          color: 'white',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            marginBottom: '0.75rem',
            color: 'white'
          }}>
            {t('title')}
          </h2>
          <p style={{ 
            opacity: 0.95,
            marginBottom: '2rem',
            fontSize: '1.0625rem',
            maxWidth: '500px',
            margin: '0 auto 2rem'
          }}>
            {t('subtitle')}
          </p>
          
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ maxWidth: '450px', margin: '0 auto' }}>
              <div style={{ 
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ 
                    flex: '1 1 250px',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-base)',
                    border: 'none',
                    fontSize: '1rem',
                    minWidth: '200px'
                  }}
                />
                <button 
                  type="submit"
                  className="btn"
                  style={{ 
                    background: 'white',
                    color: 'oklch(65% 0.20 35)',
                    padding: '0.875rem 2rem',
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  {t('button')}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ 
              fontSize: '1.125rem',
              fontWeight: 600,
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-base)',
              backdropFilter: 'blur(10px)'
            }}>
              Thank you! We'll be in touch soon.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
