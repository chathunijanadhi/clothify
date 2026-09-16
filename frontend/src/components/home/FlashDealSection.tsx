import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Copy, Check } from 'lucide-react';

export function FlashDealSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText('WELCOME15');
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <section className="section-block" style={{ padding: '36px 0' }}>
      <div className="container">
        {/* Section Heading */}
        <div className="monic-section-header">
          <h2 className="monic-section-title">Best Offers</h2>
          <p className="monic-section-sub">
            Curated seasonal promotions with unbeatable discounts on top quality apparel.
          </p>
        </div>

        {/* 2 Best Offers Banners */}
        <div className="monic-offers-grid">
          {/* Banner 1: Summer Collection */}
          <Link
            to="/products?category=Dresses"
            className="monic-offer-card monic-offer-card-summer"
          >
            <img
              src="/images/summer-banner.jpg"
              alt="Summer Collection"
              className="monic-offer-bg-img"
            />
            <div className="monic-offer-content">
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#C44B2B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                New Season Drop
              </span>
              <h3>Summer Collection</h3>
              <p>Discover breezy linens &amp; warm tones.</p>
              <span className="monic-btn-primary" style={{ padding: '8px 20px', fontSize: '0.84rem' }}>
                Shop Now <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          {/* Banner 2: Up to 40% OFF */}
          <Link
            to="/products"
            className="monic-offer-card monic-offer-card-discount"
          >
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80"
              alt="40% OFF Items"
              className="monic-offer-bg-img"
            />
            <div className="monic-offer-content">
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#854D0E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Limited Time Promo
              </span>
              <h3>Up to 40% OFF</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 16px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
                  Code: <strong style={{ color: 'var(--primary)' }}>WELCOME15</strong>
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  style={{
                    background: copied ? '#6B8E6B' : '#C44B2B',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <span className="monic-btn-primary" style={{ padding: '8px 20px', fontSize: '0.84rem' }}>
                See All <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
