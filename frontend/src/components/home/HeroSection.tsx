import { ArrowRight, Truck, RotateCcw, CreditCard, Headphones, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="monic-hero-section">
      <div className="container">
        <div className="monic-hero-grid">
          {/* Left Text Column */}
          <div className="animate-fade-up">
            <span className="monic-pill-badge">
              <Sparkles size={14} /> Your new season starts here
            </span>

            <h1 className="monic-hero-title">
              Upgrade Your <em>Style</em> With<br />
              New <span className="highlight-orange">Season Trends</span>
            </h1>

            <p className="monic-hero-subtitle">
              Discover premium fashion clothing for men &amp; women. Fresh arrivals every week with exclusive discounts.
            </p>

            <div>
              <Link to="/products" className="monic-btn-primary">
                Shop Now <ArrowRight size={18} />
              </Link>
            </div>

            {/* Customer review badge */}
            <div className="monic-hero-reviews">
              <div className="monic-avatar-stack">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
                  alt="Customer"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
                  alt="Customer"
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"
                  alt="Customer"
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="#F59E0B" color="#F59E0B" />
                  ))}
                  <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)', marginLeft: 4 }}>4.9/5</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>
                  1,500+ Customer Reviews
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="monic-hero-model-wrap animate-fade-in delay-200">
            <div className="monic-hero-slab">
              <img
                src="/images/hero-model.jpg"
                alt="New Season Fashion Model"
                className="monic-hero-model-img"
              />
            </div>
          </div>
        </div>

        {/* 4 Feature Trust Strip below hero */}
        <div className="monic-trust-bar animate-fade-up delay-300">
          <div className="monic-trust-item">
            <div className="monic-trust-icon">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4>Money Guarantee</h4>
              <p>Within 30 days for any exchange</p>
            </div>
          </div>

          <div className="monic-trust-item">
            <div className="monic-trust-icon">
              <Truck size={20} />
            </div>
            <div>
              <h4>Free Shipping</h4>
              <p>Free shipping for orders over LKR 10,000</p>
            </div>
          </div>

          <div className="monic-trust-item">
            <div className="monic-trust-icon">
              <CreditCard size={20} />
            </div>
            <div>
              <h4>Flexible Payment</h4>
              <p>Pay with multiple credit cards</p>
            </div>
          </div>

          <div className="monic-trust-item">
            <div className="monic-trust-icon">
              <Headphones size={20} />
            </div>
            <div>
              <h4>Online Support</h4>
              <p>24 hours a day, 7 days a week</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
