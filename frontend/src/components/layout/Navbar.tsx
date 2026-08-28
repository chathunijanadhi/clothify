import { Menu, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link to="/" className="brand" aria-label="Home">
          <div className="brand-mark">
            <img
              src="https://res.cloudinary.com/efjuzuge/image/upload/v1787922904/icon_only.png"
              alt="Clothify logo"
            />
          </div>
          <span>Clothify</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <button type="button" className="nav-link" onClick={() => navigate('/')}>Home</button>
          <button type="button" className="nav-link" onClick={() => navigateToShop()}>Shop</button>
          <button type="button" className="nav-link" onClick={() => navigateToShop('Men')}>Men</button>
          <button type="button" className="nav-link" onClick={() => navigateToShop('Women')}>Women</button>
          <button type="button" className="nav-link" onClick={() => navigateToShop('Kids')}>Kids</button>
        </nav>

        <div style={{ flex: 1 }} />

        <div className="nav-actions">
          <button className="icon-btn" aria-label="Search">
            <Search size={17} />
          </button>
          <Link to="/customer/wishlist" className="icon-btn" aria-label="Wishlist">
            <Heart size={17} />
          </Link>
          <Link to="/customer/cart" className="icon-btn" aria-label="Cart">
            <ShoppingBag size={17} />
          </Link>

          {user ? (
            <div className="auth-actions">
              {/* Avatar chip */}
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard'}
                aria-label="Dashboard"
                style={{
                  width: 38, height: 38,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e91e8c 0%, #ff6b35 100%)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(233,30,140,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                title={`Dashboard — ${user.fullName ?? user.email}`}
              >
                {initials}
              </Link>
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard'}
                className="login-btn"
                style={{ fontSize: '0.86rem', padding: '9px 16px' }}
              >
                Dashboard
              </Link>
              <button className="logout-btn" onClick={() => logout()}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              <User size={15} /> Login
            </Link>
          )}

          <button
            className="mobile-menu-btn"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((c) => !c)}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-nav container">
          <button type="button" className="mobile-nav-link" onClick={() => { setMobileOpen(false); navigate('/'); }}>Home</button>
          <button type="button" className="mobile-nav-link" onClick={() => { setMobileOpen(false); navigateToShop(); }}>Shop</button>
          <button type="button" className="mobile-nav-link" onClick={() => { setMobileOpen(false); navigateToShop('Men'); }}>Men</button>
          <button type="button" className="mobile-nav-link" onClick={() => { setMobileOpen(false); navigateToShop('Women'); }}>Women</button>
          <button type="button" className="mobile-nav-link" onClick={() => { setMobileOpen(false); navigateToShop('Kids'); }}>Kids</button>
          {user && (
            <button type="button" className="mobile-nav-link" onClick={() => { setMobileOpen(false); logout(); }}>Logout</button>
          )}
        </div>
      )}
    </header>
  );
}
