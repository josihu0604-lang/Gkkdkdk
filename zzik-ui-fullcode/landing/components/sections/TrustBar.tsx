'use client';

export default function TrustBar() {
  const logos = ['🏪', '☕', '🍜', '🎨', '🏋️'];
  
  return (
    <div style={{ textAlign: 'center', padding: '2rem 0', borderBottom: '1px solid #eee' }}>
      <p className="subtitle" style={{ marginBottom: '1rem' }}>
        Trusted by local businesses
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '2rem' }}>
        {logos.map((logo, i) => (
          <span key={i}>{logo}</span>
        ))}
      </div>
    </div>
  );
}
