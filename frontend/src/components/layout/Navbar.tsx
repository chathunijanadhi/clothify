import { Menu, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../services/auth.context';

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Shop' },
  { to: '/products?category=Men', label: 'Men' },
  { to: '/products?category=Women', label: 'Women' },
  { to: '/products?category=Kids', label: 'Kids' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

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
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="icon-btn" aria-label="Search">
            <Search size={18} />
          </button>
          <button className="icon-btn" aria-label="Wishlist">
            <Heart size={18} />
          </button>
          <button className="icon-btn" aria-label="Cart">
            <ShoppingBag size={18} />
          </button>

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
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              {label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </header>
  );
}
