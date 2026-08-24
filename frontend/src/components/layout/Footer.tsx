import { Globe, MessageCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>FashionHub</h3>
          <p>Modern essentials for everyday confidence.</p>
          <div className="social-row">
            <a href="https://instagram.com" aria-label="Instagram"><Globe size={18} /></a>
            <a href="https://facebook.com" aria-label="Facebook"><MessageCircle size={18} /></a>
            <a href="https://x.com" aria-label="Twitter"><Send size={18} /></a>
          </div>
        </div>

        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/products?category=Men">Men</Link></li>
            <li><Link to="/products?category=Women">Women</Link></li>
            <li><Link to="/products?category=Kids">Kids</Link></li>
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
            <li><a href="#">Terms & Conditions</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">© 2026 FashionHub. All rights reserved.</div>
    </footer>
  );
}
