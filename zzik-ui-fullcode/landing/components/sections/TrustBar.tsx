'use client';

export default function TrustBar() {
  const categories = [
    { name: 'Retail', count: '200+' },
    { name: 'Cafe', count: '150+' },
    { name: 'Restaurant', count: '180+' },
    { name: 'Art', count: '120+' },
    { name: 'Fitness', count: '90+' }
  ];

  return (
    <section style={{ 
      padding: 'var(--space-16) 0',
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-default)',
      borderBottom: '1px solid var(--border-default)'
    }}>
      <div className="container">
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-8)'
        }}>
          <p style={{ 
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wide)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-2)'
          }}>
            Trusted By
          </p>
          <h3 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text-primary)',
            letterSpacing: 'var(--tracking-tight)'
          }}>
            500+ Local Businesses
          </h3>
        </div>
        
        <div style={{ 
          display: 'flex',
          gap: 'var(--space-6)',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {categories.map((category, index) => (
            <div 
              key={category.name}
              style={{
                padding: 'var(--space-4) var(--space-6)',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-base)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--text-secondary)',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all var(--duration-fast) var(--ease-spring)',
                cursor: 'pointer',
                animationDelay: `${index * 50}ms`,
                animation: 'fadeIn 0.5s var(--ease-out) both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
            >
              <span style={{ 
                fontWeight: 'var(--font-bold)', 
                color: 'var(--text-primary)',
                marginRight: 'var(--space-2)'
              }}>
                {category.count}
              </span>
              <span>{category.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
