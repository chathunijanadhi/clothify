import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/auth.context';
import { useCart } from '../../services/cart.context';
import { useWishlist } from '../../services/wishlist.context';

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  // Hide on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  if (isAuthPage) return null;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' && !location.search;
    if (path === '/products') return location.pathname === '/products';
    return location.pathname.startsWith(path);
  };

  const accountLink = user
    ? user.role === 'admin'
      ? '/admin/dashboard'
      : '/customer/dashboard'
    : '/login';

  const isAccountActive =
    location.pathname.startsWith('/customer') ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/login';

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <Link
        to="/"
        className={`mobile-bottom-nav-item ${isActive('/') ? 'active' : ''}`}
        aria-label="Home"
      >
        <div className="mobile-bottom-nav-icon">
          <Home size={20} />
        </div>
        <span>Home</span>
      </Link>

      <Link
        to="/products"
        className={`mobile-bottom-nav-item ${isActive('/products') ? 'active' : ''}`}
        aria-label="Shop Catalog"
      >
        <div className="mobile-bottom-nav-icon">
          <Compass size={20} />
        </div>
        <span>Shop</span>
      </Link>

      <Link
        to={user ? '/customer/wishlist' : '/login'}
        className={`mobile-bottom-nav-item ${isActive('/customer/wishlist') ? 'active' : ''}`}
        aria-label="Wishlist"
      >
        <div className="mobile-bottom-nav-icon">
          <Heart size={20} />
          {wishlistCount > 0 && <span className="mobile-nav-badge">{wishlistCount}</span>}
        </div>
        <span>Wishlist</span>
      </Link>

      <Link
        to={user ? '/customer/cart' : '/login'}
        className={`mobile-bottom-nav-item ${isActive('/customer/cart') ? 'active' : ''}`}
        aria-label="Shopping Cart"
      >
        <div className="mobile-bottom-nav-icon">
          <ShoppingBag size={20} />
          {cartCount > 0 && <span className="mobile-nav-badge">{cartCount}</span>}
        </div>
        <span>Bag</span>
      </Link>

      <Link
        to={accountLink}
        className={`mobile-bottom-nav-item ${isAccountActive ? 'active' : ''}`}
        aria-label="My Account"
      >
        <div className="mobile-bottom-nav-icon">
          {user ? (
            <div className="mobile-nav-avatar">
              {(user.fullName || user.email || 'U').slice(0, 1).toUpperCase()}
            </div>
          ) : (
            <User size={20} />
          )}
        </div>
        <span>{user ? 'Account' : 'Sign In'}</span>
      </Link>
    </nav>
  );
}
