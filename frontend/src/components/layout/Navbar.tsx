import {
  Menu,
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  X,
  LayoutDashboard,
  Package,
  LogOut,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../services/auth.context';
import { useCart } from '../../services/cart.context';
import { useWishlist } from '../../services/wishlist.context';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname, location.search]);

  const navigateToShop = (segment?: string, category?: string) => {
    const base = '/products';
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (segment) params.set('segment', segment);
    const qs = params.toString();
    navigate(qs ? `${base}?${qs}` : base);
    setMobileOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setMobileOpen(false);
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  const isActiveNav = (path: string) => {
    if (path === '/' && location.pathname === '/' && !location.search) return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="site-header">
        <div className="container nav-shell">
          {/* Brand */}
          <Link to="/" className="brand" aria-label="Clothify Home">
            <div className="brand-mark">
              <img
                src="https://res.cloudinary.com/efjuzuge/image/upload/v1787922904/icon_only.png"
                alt="Clothify logo"
              />
            </div>
            <span>Clothify</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main navigation">
            <button
              type="button"
              className={`nav-link ${isActiveNav('/') ? 'active' : ''}`}
              onClick={() => navigate('/')}
            >
              Home
            </button>
            <button
              type="button"
              className={`nav-link ${location.pathname === '/products' && !location.search ? 'active' : ''}`}
              onClick={() => navigateToShop()}
            >
              Shop All
            </button>
            <button
              type="button"
              className={`nav-link ${location.search.includes('segment=Men') ? 'active' : ''}`}
              onClick={() => navigateToShop('Men')}
            >
              Men
            </button>
            <button
              type="button"
              className={`nav-link ${location.search.includes('segment=Women') ? 'active' : ''}`}
              onClick={() => navigateToShop('Women')}
            >
              Women
            </button>
            <button
              type="button"
              className={`nav-link ${location.search.includes('segment=Kids') ? 'active' : ''}`}
              onClick={() => navigateToShop('Kids')}
            >
              Kids
            </button>
          </nav>

          {/* Search Bar - Desktop */}
          <form className="nav-search-wrap" onSubmit={handleSearchSubmit}>
            <Search size={16} className="nav-search-icon" />
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search styles, fabrics, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Action Icons & User Dropdown */}
          <div className="nav-actions">
            {/* Wishlist Icon with count badge */}
            <Link
              to={user ? '/customer/wishlist' : '/login'}
              className="icon-btn"
              aria-label="Wishlist"
              title="My Wishlist"
            >
              <Heart size={18} />
              {wishlistCount > 0 && <span className="icon-btn-badge">{wishlistCount}</span>}
            </Link>

            {/* Cart Icon with count badge */}
            <Link
              to={user ? '/customer/cart' : '/login'}
              className="icon-btn"
              aria-label="Shopping Cart"
              title="My Cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="icon-btn-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="user-dropdown-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className="icon-btn user-menu-trigger"
                  style={{
                    width: 'auto',
                    borderRadius: 999,
                    padding: '4px 12px 4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--panel)',
                  }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="User menu"
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--grad-accent)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {initials}
                  </div>
                  <span className="user-menu-name" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {user.fullName ? user.fullName.split(' ')[0] : 'Account'}
                  </span>
                  <ChevronDown size={14} color="var(--muted)" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-name">{user.fullName || 'Valued Member'}</div>
                      <div className="user-dropdown-email">{user.email}</div>
                    </div>

                    {user.role === 'admin' ? (
                      <>
                        <Link
                          to="/admin/dashboard"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                        <Link
                          to="/admin/catalog"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <ShoppingBag size={16} /> Catalog Manager
                        </Link>
                        <Link
                          to="/admin/orders"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Package size={16} /> Manage Orders
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/customer/dashboard"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} /> My Dashboard
                        </Link>
                        <Link
                          to="/customer/orders"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Package size={16} /> My Orders
                        </Link>
                        <Link
                          to="/customer/wishlist"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Heart size={16} /> My Wishlist
                        </Link>
                        <Link
                          to="/customer/profile"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <UserIcon size={16} /> Profile Settings
                        </Link>
                      </>
                    )}

                    <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

                    <button
                      type="button"
                      className="dropdown-link dropdown-link--danger"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-btn">
                <UserIcon size={15} /> Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* -- Mobile Slide-Over Drawer with Backdrop -- */}
      {mobileOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)}>
          <div
            className="mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
          >
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <Link to="/" className="brand" onClick={() => setMobileOpen(false)}>
                <div className="brand-mark">
                  <img
                    src="https://res.cloudinary.com/efjuzuge/image/upload/v1787922904/icon_only.png"
                    alt="Clothify"
                  />
                </div>
                <span>Clothify</span>
              </Link>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 36, height: 36 }}
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Search */}
            <form onSubmit={handleSearchSubmit} className="mobile-drawer-search">
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search styles, brands, collections..."
                  className="auth-input-element"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="auth-input-action"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* Drawer Links */}
            <div className="mobile-drawer-body">
              <div className="mobile-drawer-section-label">Browse Collections</div>

              <button
                type="button"
                className={`mobile-drawer-item ${isActiveNav('/') ? 'active' : ''}`}
                onClick={() => {
                  navigate('/');
                  setMobileOpen(false);
                }}
              >
                <span>Home</span>
                <ChevronRight size={16} className="drawer-arrow" />
              </button>

              <button
                type="button"
                className={`mobile-drawer-item ${location.pathname === '/products' && !location.search ? 'active' : ''}`}
                onClick={() => navigateToShop()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Compass size={18} />
                  <span>Shop All Garments</span>
                </div>
                <ChevronRight size={16} className="drawer-arrow" />
              </button>

              <button
                type="button"
                className={`mobile-drawer-item ${location.search.includes('segment=Men') ? 'active' : ''}`}
                onClick={() => navigateToShop('Men')}
              >
                <span>Men's Fashion</span>
                <span className="drawer-badge">Collection</span>
              </button>

              <button
                type="button"
                className={`mobile-drawer-item ${location.search.includes('segment=Women') ? 'active' : ''}`}
                onClick={() => navigateToShop('Women')}
              >
                <span>Women's Fashion</span>
                <span className="drawer-badge" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>Trending</span>
              </button>

              <button
                type="button"
                className={`mobile-drawer-item ${location.search.includes('segment=Kids') ? 'active' : ''}`}
                onClick={() => navigateToShop('Kids')}
              >
                <span>Kids' Fashion</span>
                <span className="drawer-badge" style={{ background: 'var(--accent-3-soft)', color: 'var(--accent-3)' }}>New</span>
              </button>

              <div className="mobile-drawer-divider" />

              <div className="mobile-drawer-section-label">Account &amp; Orders</div>

              {user ? (
                <>
                  <button
                    type="button"
                    className="mobile-drawer-item"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate(user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Sparkles size={18} color="var(--accent)" />
                      <span>{user.role === 'admin' ? 'Admin Dashboard' : 'My VIP Dashboard'}</span>
                    </div>
                    <ChevronRight size={16} className="drawer-arrow" />
                  </button>

                  <button
                    type="button"
                    className="mobile-drawer-item"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate('/customer/orders');
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Package size={18} />
                      <span>Track Orders</span>
                    </div>
                    <ChevronRight size={16} className="drawer-arrow" />
                  </button>

                  <button
                    type="button"
                    className="mobile-drawer-item"
                    style={{ color: '#ef4444', marginTop: 8 }}
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                      navigate('/');
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </>
              ) : (
                <div style={{ padding: '8px 0' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', minHeight: 46, fontSize: '0.95rem' }}
                    onClick={() => {
                      setMobileOpen(false);
                      navigate('/login');
                    }}
                  >
                    <UserIcon size={16} /> Sign In / Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
