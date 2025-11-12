'use client';

export default function TrustBar() {
  return (
    <section style={{ 
      padding: '4rem 0',
      background: '#FFFFFF',
      borderTop: '1px solid #E5E5E5'
    }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <p style={{ 
          fontSize: '0.875rem',
          color: '#999999',
          marginBottom: '1.5rem'
        }}>
          Trusted by 500+ local businesses
        </p>
        <div style={{ 
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {['Retail', 'Cafe', 'Restaurant', 'Art', 'Fitness'].map((category) => (
            <span 
              key={category}
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#666666'
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
