'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function LeadForm() {
  const t = useTranslations('cta');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Lead submitted:', email);
    setSubmitted(true);
  };

  return (
    <section 
      id="lead" 
      style={{ 
        padding: "min(10vh, 6rem) 0",
        background: "#FFFFFF"
      }}
    >
      <div className="container" style={{ maxWidth: "600px" }}>
        <div style={{
          textAlign: "center",
          padding: "3rem 2rem",
          background: "#FAFAFA",
          borderRadius: "12px",
          border: "1px solid #E5E5E5"
        }}>
          <h2 style={{ 
            fontSize: "1.75rem",
            fontWeight: 600,
            marginBottom: "0.75rem",
            color: "#0A0A0A",
            letterSpacing: "-0.02em"
          }}>
            {t('title')}
          </h2>
          <p style={{ 
            color: "#666666",
            marginBottom: "2rem",
            fontSize: "1rem",
            lineHeight: 1.6
          }}>
            {t('subtitle')}
          </p>
          
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
              <div style={{ 
                display: "flex",
                gap: "0.5rem",
                flexDirection: "column"
              }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ 
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid #E5E5E5",
                    fontSize: "0.9375rem",
                    background: "white",
                    width: "100%",
                    transition: "border-color 0.15s ease"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#5E6AD2"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#E5E5E5"}
                />
                <button 
                  type="submit"
                  style={{ 
                    background: "#5E6AD2",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    fontWeight: 500,
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.9375rem",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                    width: "100%"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#4E5BBE"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#5E6AD2"}
                >
                  {t('button')}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ 
              fontSize: "1rem",
              fontWeight: 500,
              padding: "1rem",
              background: "#E8F5E9",
              borderRadius: "6px",
              color: "#2E7D32",
              maxWidth: "400px",
              margin: "0 auto"
            }}>
              Thank you! We'll be in touch soon.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
