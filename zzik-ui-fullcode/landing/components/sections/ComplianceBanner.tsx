'use client';

export default function ComplianceBanner() {
  return (
    <div style={{ 
      background: 'oklch(97% 0.01 240)', 
      padding: '1.5rem', 
      borderRadius: '0.75rem',
      marginBottom: '2rem'
    }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        🔒 Privacy & Compliance
      </h3>
      <p className="subtitle">
        GDPR/PIPL compliant. Location data encrypted and stored securely. 
        No personal data shared without consent.
      </p>
    </div>
  );
}
