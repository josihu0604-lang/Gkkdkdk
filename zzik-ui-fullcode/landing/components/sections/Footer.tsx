'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  
  return (
    <footer style={{ 
      background: 'oklch(20% 0.01 240)',
      color: 'white',
      padding: '3rem 0',
      borderTop: '1px solid oklch(30% 0.01 240)'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ 
          fontSize: '1.5rem',
          fontWeight: 600,
          letterSpacing: '-0.01em'
        }}>
          ZZIK
        </div>
        <p style={{ 
          opacity: 0.6,
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          {t('copyright')}
        </p>
      </div>
    </footer>
  );
}
