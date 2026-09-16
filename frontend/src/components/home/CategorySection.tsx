import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CategorySection() {
  return (
    <section className="section-block" style={{ padding: '48px 0' }}>
      <div className="container">
        {/* Top Header Row */}
        <div className="monic-section-top-row">
          <div>
            <h2 className="monic-section-title">Shop By Categories</h2>
            <p className="monic-section-sub">
              Discover premium fashion clothing for men, women &amp; kids. Fresh styles curated for every occasion.
            </p>
          </div>
          <Link to="/products" className="monic-view-all-link">
            View all Categories <ArrowRight size={15} />
          </Link>
        </div>

        {/* Monic 3-Column Mosaic Grid */}
        <div className="monic-category-grid">
          {/* Left Tall Card: Mens Wear */}
          <Link
            to="/products?segment=Men"
            className="monic-cat-card monic-cat-card-tall"
          >
            <img src="/images/mens-wear.jpg" alt="Men's Wear" />
            <div className="monic-cat-overlay-btn">
              <span>Mens Wear</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Middle Column: Kids on top, Accessories & Sneakers on bottom */}
          <div className="monic-category-col-center">
            {/* Top: Kids Wear */}
            <Link
              to="/products?segment=Kids"
              className="monic-cat-card"
            >
              <img src="/images/kids-wear.jpg" alt="Kids Wear" />
              <div className="monic-cat-overlay-btn">
                <span>Kids Wear</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* Bottom Row Split: Accessories & Sneakers */}
            <div className="monic-category-row-split">
              <Link
                to="/products?category=Shirts"
                className="monic-cat-card"
              >
                <img src="/images/accessories.jpg" alt="Accessories" />
                <div className="monic-cat-overlay-btn">
                  <span>Accessories</span>
                </div>
              </Link>

              <Link
                to="/products?category=Jeans"
                className="monic-cat-card"
              >
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"
                  alt="Sneakers"
                />
                <div className="monic-cat-overlay-btn">
                  <span>Sneakers</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Tall Card: Womens Wear */}
          <Link
            to="/products?segment=Women"
            className="monic-cat-card monic-cat-card-tall"
          >
            <img src="/images/womens-wear.jpg" alt="Women's Wear" />
            <div className="monic-cat-overlay-btn">
              <span>Womens Wear</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
