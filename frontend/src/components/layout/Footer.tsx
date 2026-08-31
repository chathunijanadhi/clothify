import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Share2,
  Globe,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container" style={{ paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 40 }}>
        {/* Top Trust Features */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            padding: '24px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--accent-3)',
                flexShrink: 0,
              }}
            >
              <Truck size={22} />
            </div>
            <div>
              <strong style={{ color: 'white', fontSize: '0.94rem' }}>Free Express Shipping</strong>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>On all orders over $50</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--accent)',
                flexShrink: 0,
              }}
            >
              <RotateCcw size={22} />
            </div>
            <div>
              <strong style={{ color: 'white', fontSize: '0.94rem' }}>30-Day Easy Returns</strong>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>Hassle-free return policy</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--accent-2)',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <strong style={{ color: 'white', fontSize: '0.94rem' }}>100% Secure Checkout</strong>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>256-Bit SSL Encryption</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                display: 'grid',
                placeItems: 'center',
                color: '#fbbf24',
                flexShrink: 0,
              }}
            >
              <Headphones size={22} />
            </div>
            <div>
              <strong style={{ color: 'white', fontSize: '0.94rem' }}>Dedicated Support</strong>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>24/7 Customer Care assistance</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container footer-grid">
        {/* Brand & Mission */}
        <div>
          <div className="footer-brand-badge">
            <img
              src="https://res.cloudinary.com/efjuzuge/image/upload/v1787922904/icon_only.png"
              alt="Clothify logo"
            />
          </div>
          <h3 style={{ marginTop: 0, fontSize: '1.4rem' }}>Clothify</h3>
          <p style={{ lineHeight: 1.7, fontSize: '0.9rem' }}>
            Elevating everyday wardrobes with curated seasonal collections, timeless essentials, and premium craftsmanship.
          </p>
          <div className="social-row">
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
              <Share2 size={17} />
            </a>
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
              <Globe size={17} />
            </a>
            <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noreferrer">
              <MessageSquare size={17} />
            </a>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4>Shop Collections</h4>
          <ul>
            <li><Link to="/products?segment=Women">Women's Fashion</Link></li>
            <li><Link to="/products?segment=Men">Men's Wardrobe</Link></li>
            <li><Link to="/products?segment=Kids">Kids' Collection</Link></li>
            <li><Link to="/products?category=Dresses">Trending Dresses</Link></li>
            <li><Link to="/products?category=Shirts">Premium Shirts</Link></li>
            <li><Link to="/products">New Season Arrivals</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4>Customer Care</h4>
          <ul>
            <li><Link to="/customer/orders">Track My Order</Link></li>
            <li><Link to="/customer/wishlist">Saved Wishlist</Link></li>
            <li><Link to="/customer/cart">Shopping Bag</Link></li>
            <li><Link to="/customer/profile">My Account</Link></li>
            <li><a href="#">Shipping &amp; Delivery</a></li>
            <li><a href="#">Returns &amp; Exchanges</a></li>
          </ul>
        </div>

        {/* Security & Company */}
        <div>
          <h4>About &amp; Security</h4>
          <ul>
            <li><a href="#">About Clothify</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms &amp; Conditions</a></li>
            <li><a href="#">Careers at Clothify</a></li>
          </ul>

          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={14} color="var(--accent-3)" /> Accepted Payment Methods
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                VISA
              </span>
              <span style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                Mastercard
              </span>
              <span style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                AMEX
              </span>
              <span style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                Bank Transfer
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span>© 2026 Clothify Boutique. All rights reserved.</span>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
            Designed with ♥ for modern fashion lovers.
          </span>
        </div>
      </div>
    </footer>
  );
}

