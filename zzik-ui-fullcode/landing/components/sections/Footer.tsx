'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  
  return (
    <footer style={{ 
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-default)',
      padding: 'var(--space-16) 0 var(--space-12)',
      marginTop: 'var(--space-32)'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-8)'
      }}>
        {/* Logo */}
        <div style={{ 
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)',
          letterSpacing: 'var(--tracking-tighter)',
          background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ZZIK
        </div>
        
        {/* Links */}
        <nav style={{
          display: 'flex',
          gap: 'var(--space-8)',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {['About', 'Features', 'Privacy', 'Terms', 'Contact'].map((link) => (
            <a 
              key={link}
              href={`#${link.toLowerCase()}`}
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color var(--duration-fast) var(--ease-out)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              {link}
            </a>
          ))}
        </nav>
        
        {/* Copyright */}
        <div style={{
          paddingTop: 'var(--space-8)',
          borderTop: '1px solid var(--border-default)',
          width: '100%',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)'
          }}>
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
