'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function LeadForm() {
  const t = useTranslations('cta');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Lead submitted:', email);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const validateEmail = (value: string) => {
    if (!value) {
      setError('');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setError('Please enter a valid email address');
    } else {
      setError('');
    }
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
                <div>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateEmail(e.target.value);
                    }}
                    onBlur={(e) => validateEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className={error ? 'error' : ''}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'email-error' : undefined}
                  />
                  {error && (
                    <p 
                      id="email-error"
                      style={{
                        color: '#E53935',
                        fontSize: '0.875rem',
                        marginTop: '0.5rem',
                        textAlign: 'left'
                      }}
                      role="alert"
                    >
                      {error}
                    </p>
                  )}
                </div>
                
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !!error}
                  aria-busy={isSubmitting}
                  style={{
                    width: "100%",
                    position: 'relative'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" style={{ marginRight: '0.5rem' }} />
                      Submitting...
                    </>
                  ) : (
                    t('button')
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div 
              style={{ 
                fontSize: "1rem",
                fontWeight: 500,
                padding: "1rem 1.5rem",
                background: "#E8F5E9",
                borderRadius: "6px",
                color: "#2E7D32",
                maxWidth: "400px",
                margin: "0 auto",
                border: "1px solid #A5D6A7"
              }}
              role="status"
              aria-live="polite"
            >
              ✓ Thank you! We'll be in touch soon.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
