import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">New Season Collection</span>
          <h1>Style That Defines You</h1>
          <p>Discover the latest fashion collections for every occasion, from everyday essentials to statement pieces.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">Shop Now <ArrowRight size={18} /></Link>
            <Link to="/products" className="btn btn-secondary">Explore Collection</Link>
          </div>
          <div className="stats-row">
            <div><strong>25K+</strong><span>Happy customers</span></div>
            <div><strong>350+</strong><span>Styles available</span></div>
            <div><strong>4.9/5</strong><span>Customer rating</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card card-one">
            <span>Summer Edit</span>
            <strong>Up to 30% off</strong>
          </div>
          <div className="hero-card card-two">
            <span>Fresh Drop</span>
            <strong>Trending now</strong>
          </div>
          <div className="hero-image-panel">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
              alt="Fashion model"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
