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
    <div 
      id="lead" 
      style={{ 
        background: 'linear-gradient(135deg, oklch(65% 0.20 35), oklch(48% 0.13 245))',
        padding: '3rem 2rem',
        borderRadius: '1rem',
        color: 'white',
        textAlign: 'center',
        marginBottom: '2rem'
      }}
    >
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        {t('title')}
      </h2>
      <p style={{ opacity: 0.9, marginBottom: '2rem' }}>
        {t('subtitle')}
      </p>
      
      {!submitted ? (
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                flex: 1,
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '1rem'
              }}
            />
            <button 
              type="submit"
              className="btn"
              style={{ 
                background: 'white',
                color: 'oklch(65% 0.20 35)',
                padding: '0.75rem 1.5rem'
              }}
            >
              {t('button')}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          ✅ Thank you! We'll be in touch soon.
        </div>
      )}
    </div>
  );
}
