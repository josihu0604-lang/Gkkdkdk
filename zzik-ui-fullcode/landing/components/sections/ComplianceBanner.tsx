'use client';

export default function ComplianceBanner() {
  return (
    <section style={{ 
      padding: 'var(--space-16) 0',
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-default)'
    }}>
      <div className="container" style={{ maxWidth: 'var(--container-4xl)' }}>
        <div style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-base)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--color-success-500)',
            borderRadius: 'var(--radius-full)',
            marginBottom: 'var(--space-6)'
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v2m0 10v2M3.05 3.05l1.415 1.415m7.07 7.07l1.415 1.415M1 8h2m10 0h2M3.05 12.95l1.415-1.415m7.07-7.07l1.415-1.415" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="3" stroke="white" strokeWidth="1.5"/>
            </svg>
            <span style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-wide)'
            }}>
              Verified & Secure
            </span>
          </div>
          
          <h3 style={{ 
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-semibold)',
            marginBottom: 'var(--space-4)',
            color: 'var(--text-primary)',
            letterSpacing: 'var(--tracking-tight)'
          }}>
            Privacy & Compliance
          </h3>
          
          <p style={{
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--text-secondary)',
            maxWidth: '700px',
            margin: '0 auto var(--space-6)'
          }}>
            We are committed to GDPR & CCPA compliance. Your data is securely encrypted 
            and never shared with third parties without explicit consent.
          </p>
          
          <div style={{
            display: 'flex',
            gap: 'var(--space-6)',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {[
              { label: 'GDPR Compliant', icon: '🇪🇺' },
              { label: 'CCPA Ready', icon: '🇺🇸' },
              { label: '256-bit Encryption', icon: '🔐' },
              { label: 'ISO 27001', icon: '✓' }
            ].map((item, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-base)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--text-secondary)'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
