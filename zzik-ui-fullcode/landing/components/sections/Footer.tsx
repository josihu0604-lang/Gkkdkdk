'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  
  return (
    <footer style={{ 
      background: 'oklch(12% 0.004 240)',
      color: 'white',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>ZZIK</span>
      </div>
      <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>
        {t('copyright')}
      </p>
    </footer>
  );
}
