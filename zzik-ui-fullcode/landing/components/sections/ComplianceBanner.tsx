'use client';

export default function ComplianceBanner() {
  return (
    <section style={{ padding: '3rem 0' }}>
      <div style={{ 
        background: 'var(--bg-subtle)',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem',
          fontWeight: 600,
          marginBottom: '0.75rem',
          color: 'var(--text-primary)'
        }}>
          Privacy & Compliance
        </h3>
        <p style={{
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          fontSize: '0.9375rem'
        }}>
          GDPR/PIPL compliant. Location data encrypted and stored securely. 
          No personal data shared without consent.
        </p>
      </div>
    </section>
  );
}
