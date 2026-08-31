import { ArrowRight, Truck, RotateCcw, ShieldCheck, Star, Flame, Sparkles, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const trendingTags = [
  { label: 'Silk Dresses', href: '/products?category=Dresses', hot: true },
  { label: 'Tailored Blazers', href: '/products?category=Shirts', hot: false },
  { label: 'Organic Linen', href: '/products?category=T-Shirts', hot: true },
  { label: 'Wide-Leg Denim', href: '/products?category=Jeans', hot: false },
  { label: 'Resort Wear', href: '/products?category=Skirts', hot: true },
];

export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container hero-grid">

        {/* ── Left copy ── */}
        <div className="hero-copy animate-fade-up">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            ✨ Exclusive 2026 Capsule Collection
          </span>

          <h1>
            Elegance In Every<br />
            <span className="gradient-text">Silhouette</span>
          </h1>

          <p>
            Explore haute couture craftsmanship, sustainable organic linens, and contemporary silhouettes engineered for the modern wardrobe. Elevate your everyday style effortlessly.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1rem' }}>
              Explore 2026 Collection <ArrowRight size={18} />
            </Link>
            <Link to="/products" className="btn btn-secondary" style={{ padding: '16px 26px', fontSize: '0.96rem' }}>
              <ShoppingBag size={17} strokeWidth={2} /> Shop By Category
            </Link>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div>
              <strong>35,000+</strong>
              <span>Discerning Shoppers</span>
            </div>
            <div>
              <strong>500+</strong>
              <span>Exclusive Designs</span>
            </div>
            <div>
              <strong>4.95 / 5★</strong>
              <span>Over 5,200 Reviews</span>
            </div>
          </div>

          {/* ── Trending Now chips ── */}
          <div className="hero-trending">
            <div className="hero-trending-label">
              <Flame size={14} /> Trending Styles
            </div>
            <div className="hero-trending-chips">
              {trendingTags.map((tag) => (
                <Link key={tag.label} to={tag.href} className={`hero-tag ${tag.hot ? 'hero-tag--hot' : ''}`}>
                  {tag.hot && <Sparkles size={12} />}
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Trust row ── */}
          <div className="hero-trust-row">
            <div className="hero-trust-item">
              <Truck size={15} />
              <span>Free Express Delivery</span>
            </div>
            <div className="hero-trust-divider" />
            <div className="hero-trust-item">
              <RotateCcw size={15} />
              <span>30-Day Easy Returns</span>
            </div>
            <div className="hero-trust-divider" />
            <div className="hero-trust-item">
              <ShieldCheck size={15} />
              <span>100% Protected Payment</span>
            </div>
          </div>
        </div>

        {/* ── Right visual ── */}
        <div className="hero-visual">
          <div className="hero-image-panel">
            <img
              src="https://res.cloudinary.com/efjuzuge/image/upload/v1787853264/freestocks-_3Q3tsJ01nc-unsplash_1.jpg"
              alt="Luxury Fashion Model"
            />
          </div>
          <div className="hero-card card-one animate-fade-in delay-300">
            <span>Editor's Selection</span>
            <strong>New Season Drop</strong>
            <span className="hero-card-badge">✨ Trending Now</span>
          </div>
          <div className="hero-card card-two animate-fade-in delay-200">
            <span>Special Member Offer</span>
            <strong>Up to 35% Off</strong>
            <span className="hero-card-badge" style={{ background: 'var(--accent-3-soft)', color: 'var(--accent-3)' }}>
              🏷️ Code: WELCOME15
            </span>
          </div>

          {/* Rating card */}
          <div className="hero-card card-three animate-fade-in delay-100">
            <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <strong style={{ fontSize: '0.86rem', color: 'var(--primary)' }}>4.95 / 5.0 Rating</strong>
            <span>Verified by 5,200+ Shoppers</span>
          </div>
        </div>
      </div>
    </section>
  );
}

