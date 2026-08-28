import { ArrowRight, Truck, RotateCcw, ShieldCheck, Star, Flame, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const trendingTags = [
  { label: 'Summer Dresses', href: '/products?category=Dresses', hot: true },
  { label: 'Linen Shirts', href: '/products?category=Shirts', hot: false },
  { label: 'Wide-leg Jeans', href: '/products?category=Jeans', hot: true },
  { label: 'Blazers', href: '/products?segment=Women', hot: false },
  { label: 'Maxi Skirts', href: '/products?category=Skirts', hot: false },
];

export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container hero-grid">

        {/* ── Left copy ── */}
        <div className="hero-copy animate-fade-up">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            New Season Collection
          </span>
          <h1>
            Wear Your<br />
            <span className="gradient-text">Style</span>
          </h1>
          <p>
            Discover the latest trends and timeless essentials at Clothify.
            Find the perfect pieces to express your style, your way.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/products" className="btn btn-secondary">
              Explore Collection
            </Link>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div>
              <strong>25K+</strong>
              <span>Happy customers</span>
            </div>
            <div>
              <strong>350+</strong>
              <span>Styles available</span>
            </div>
            <div>
              <strong>4.9/5</strong>
              <span>Customer rating</span>
            </div>
          </div>

          {/* ── Trending Now chips ── */}
          <div className="hero-trending">
            <div className="hero-trending-label">
              <Flame size={13} /> Trending Now
            </div>
            <div className="hero-trending-chips">
              {trendingTags.map((tag) => (
                <Link key={tag.label} to={tag.href} className={`hero-tag ${tag.hot ? 'hero-tag--hot' : ''}`}>
                  {tag.hot && <Sparkles size={11} />}
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Trust row ── */}
          <div className="hero-trust-row">
            <div className="hero-trust-item">
              <Truck size={14} />
              <span>Free Delivery</span>
            </div>
            <div className="hero-trust-divider" />
            <div className="hero-trust-item">
              <RotateCcw size={14} />
              <span>Easy Returns</span>
            </div>
            <div className="hero-trust-divider" />
            <div className="hero-trust-item">
              <ShieldCheck size={14} />
              <span>Secure Pay</span>
            </div>
          </div>
        </div>

        {/* ── Right visual ── */}
        <div className="hero-visual">
          <div className="hero-image-panel">
            <img
              src="https://res.cloudinary.com/efjuzuge/image/upload/v1787853264/freestocks-_3Q3tsJ01nc-unsplash_1.jpg"
              alt="Fashion model"
            />
          </div>
          <div className="hero-card card-one animate-fade-in delay-300">
            <span>Today's pick</span>
            <strong>New Arrivals</strong>
            <span className="hero-card-badge">✨ Trending now</span>
          </div>
          <div className="hero-card card-two animate-fade-in delay-200">
            <span>Special offer</span>
            <strong>Up to 40% off</strong>
            <span className="hero-card-badge" style={{ background: 'var(--accent-3-soft)', color: 'var(--accent-3)' }}>
              🏷️ Limited time
            </span>
          </div>

          {/* Rating card */}
          <div className="hero-card card-three animate-fade-in delay-100">
            <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
              {[1,2,3,4,5].map((i) => (
                <Star key={i} size={11} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <strong style={{ fontSize: '0.82rem' }}>4.9 / 5 rating</strong>
            <span>From 2,400+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
