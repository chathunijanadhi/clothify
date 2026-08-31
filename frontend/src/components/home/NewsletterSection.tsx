import { useState } from 'react';
import { Sparkles, Check, Send } from 'lucide-react';

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
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-box">
          <div>
            <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} /> Exclusive VIP Club
            </span>
            <h2>Get Style Inspiration &amp;<br />Secret Private Sales</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 10, fontSize: '0.95rem', lineHeight: 1.6 }}>
              Join 25,000+ fashion insiders. Receive curated trend forecasts, new collection drops, and a 15% welcome voucher.
            </p>
          </div>

          <div>
            {subscribed ? (
              <div
                style={{
                  background: 'rgba(0,212,170,0.15)',
                  border: '1.5px solid rgba(0,212,170,0.4)',
                  borderRadius: 16,
                  padding: '20px 24px',
                  color: 'white',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00d4aa', fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>
                  <Check size={20} /> You're on the VIP list!
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)' }}>
                  Use code <strong style={{ color: '#00d4aa', letterSpacing: '0.05em' }}>STYLE15</strong> at checkout for 15% off your next purchase.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="newsletter-form" style={{ flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 10, width: '100%', flexWrap: 'wrap' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className="input"
                    placeholder="Enter your email address..."
                    aria-label="Email address"
                    style={{ flex: 1, minWidth: 220 }}
                  />
                  <button type="submit" className="newsletter-subscribe-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Subscribe <Send size={15} />
                  </button>
                </div>
                {error && (
                  <div style={{ color: '#ff6b9d', fontSize: '0.82rem', fontWeight: 700, paddingLeft: 4 }}>
                    {error}
                  </div>
                )}
                <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', paddingLeft: 4 }}>
                  🔒 No spam, ever. Unsubscribe anytime with a single click.
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
