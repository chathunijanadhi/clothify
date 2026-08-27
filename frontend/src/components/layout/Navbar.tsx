import { Menu, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../services/auth.context';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigateToShop = (segment?: string, category?: string) => {
    const base = '/products';
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (segment) params.set('segment', segment);
    const qs = params.toString();
    navigate(qs ? `${base}?${qs}` : base);
  };

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link to="/" className="brand" aria-label="Home">
          <div className="brand-mark"><img
              src="https://res.cloudinary.com/efjuzuge/image/upload/v1787748753/clothify_3.png"
              alt="Fashion model"
            /></div>
          <span>Clothify</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <button type="button" className="nav-link" onClick={() => navigate('/')}>Home</button>
          <button type="button" className="nav-link" onClick={() => navigateToShop()}>Shop</button>
          <button type="button" className="nav-link" onClick={() => navigateToShop('Men')}>Men</button>
          <button type="button" className="nav-link" onClick={() => navigateToShop('Women')}>Women</button>
          <button type="button" className="nav-link" onClick={() => navigateToShop('Kids')}>Kids</button>
        </nav>

        {/* spacer pushes the action buttons to the far right to avoid overlap with brand/nav */}
        <div style={{ flex: 1 }} />

        <div className="nav-actions">
          <button className="icon-btn" aria-label="Search">
            <Search size={18} />
          </button>
          <Link to="/customer/wishlist" className="icon-btn" aria-label="Wishlist">
            <Heart size={18} />
          </Link>
          <Link to="/customer/cart" className="icon-btn" aria-label="Cart">
            <ShoppingBag size={18} />
          </Link>

          {user ? (
            <div className="auth-actions">
              <span className="user-label">Hello, {user.fullName ?? user.email}</span>
              <Link to={user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard'} className="login-btn">
                Dashboard
              </Link>
              <button className="logout-btn" onClick={() => logout()}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              <User size={16} /> Login
            </Link>
          )}

          <button className="mobile-menu-btn" aria-label="Toggle menu" onClick={() => setMobileOpen((current) => !current)}>
            <Menu size={20} />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="mobile-nav container">
          <button type="button" className="mobile-nav-link" onClick={() => { setMobileOpen(false); navigate('/'); }}>Home</button>
          <button type="button" className="mobile-nav-link" onClick={() => { setMobileOpen(false); navigateToShop(); }}>Shop</button>
          <button type="button" className="mobile-nav-link" onClick={() => { setMobileOpen(false); navigateToShop('Men'); }}>Men</button>
          <button type="button" className="mobile-nav-link" onClick={() => { setMobileOpen(false); navigateToShop('Women'); }}>Women</button>
          <button type="button" className="mobile-nav-link" onClick={() => { setMobileOpen(false); navigateToShop('Kids'); }}>Kids</button>
        </div>
      ) : null}
    </header>
  );
}
