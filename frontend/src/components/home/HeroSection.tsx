import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">New Season Collection</span>
          <h1>Wear Your Style</h1>
          <p>Discover the latest trends and timeless essentials at Clothify. Find the perfect pieces to express your style, your way.</p>
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
          <div className="hero-card card-two">
            <span>Fresh Drop</span>
            <strong>Trending now</strong>
          </div>
          <div className="hero-image-panel">
            <img
              src="https://res.cloudinary.com/efjuzuge/image/upload/v1787853264/freestocks-_3Q3tsJ01nc-unsplash_1.jpg"
              alt="Fashion model"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
