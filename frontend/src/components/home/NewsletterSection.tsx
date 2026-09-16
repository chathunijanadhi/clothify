import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    setSubscribed(true);
  };

  return (
    <section className="section-block" style={{ padding: '20px 0' }}>
      <div className="container">
        <div className="monic-newsletter-wrap">
          <h2 className="monic-newsletter-title">
            To subscribe our Email &amp; News Letter for getting latest information
          </h2>

          {subscribed ? (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                borderRadius: 999,
                padding: '12px 28px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 700,
              }}
            >
              <Check size={18} /> Thank you! You are now subscribed to Clothify exclusive drops.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="monic-newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className="monic-newsletter-input"
                placeholder="Search here or enter email..."
                aria-label="Email address"
              />
              <button type="submit" className="monic-newsletter-btn">
                Subscribe <ArrowRight size={14} style={{ display: 'inline', marginLeft: 4 }} />
              </button>
            </form>
          )}

          {error && (
            <div style={{ color: '#FFE4E6', fontSize: '0.8rem', fontWeight: 700, marginTop: 10 }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
