import { Globe, Share2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">

        <div>
          <div className="footer-brand-badge">
            <img
              src="https://res.cloudinary.com/efjuzuge/image/upload/v1787748753/clothify_3.png"
              alt="Clothify"
            />
          </div>
          <h3 style={{ marginTop: 0 }}>Clothify</h3>
          <p style={{ lineHeight: 1.7 }}>
            Modern essentials for everyday confidence.<br />
            Wear your style, your way.
          </p>
          <div className="social-row">
            <a href="https://instagram.com" aria-label="Instagram"><Share2 size={17} /></a>
            <a href="https://facebook.com" aria-label="Facebook"><Globe size={17} /></a>
            <a href="https://x.com" aria-label="Twitter"><MessageSquare size={17} /></a>
          </div>
        </div>

        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/products?segment=Men">Men</Link></li>
            <li><Link to="/products?segment=Women">Women</Link></li>
            <li><Link to="/products?segment=Kids">Kids</Link></li>
            <li><Link to="/products">New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <h4>Customer Service</h4>
          <ul>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms &amp; Conditions</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          © 2026 Clothify. All rights reserved. Made with ♥ for fashion.
        </div>
      </div>
    </footer>
  );
}
