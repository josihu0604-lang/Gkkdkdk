'use client';

export default function TrustBar() {
  const categories = ['Retail', 'Cafe', 'Restaurant', 'Art', 'Fitness'];
  
  return (
    <section style={{ 
      padding: '3rem 0',
      borderBottom: '1px solid var(--border-default)'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9375rem',
          marginBottom: '1.5rem',
          fontWeight: 500
        }}>
          Trusted by local businesses
        </p>
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {categories.map((category, i) => (
            <span 
              key={i}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-base)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)'
              }}
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
