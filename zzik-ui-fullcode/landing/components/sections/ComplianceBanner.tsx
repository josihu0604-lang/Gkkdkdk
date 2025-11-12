'use client';

export default function ComplianceBanner() {
  return (
    <section style={{ 
      padding: '4rem 0',
      background: '#FAFAFA',
      borderTop: '1px solid #E5E5E5'
    }}>
      <div className="container" style={{ maxWidth: '700px', textAlign: 'center' }}>
        <h3 style={{ 
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '1rem',
          color: '#0A0A0A'
        }}>
          Privacy & Compliance
        </h3>
        
        <p style={{
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          color: '#666666',
          marginBottom: '1.5rem'
        }}>
          GDPR & CCPA compliant. Your data is encrypted and never shared without consent.
        </p>
      </div>
    </section>
  );
}
