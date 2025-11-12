'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  
  return (
    <footer style={{ 
      background: '#FAFAFA',
      borderTop: '1px solid #E5E5E5',
      padding: '3rem 0 2rem',
      marginTop: '4rem'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#0A0A0A'
        }}>
          ZZIK
        </div>
        
        <p style={{ 
          fontSize: '0.875rem',
          color: '#999999'
        }}>
          {t('copyright')}
        </p>
      </div>
    </footer>
  );
}
