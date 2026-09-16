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
  const [scrolled, setScrolled] = useState(false);

  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container nav-shell">
          {/* Brand */}
          <Link to="/" className="brand" aria-label="Clothify Home">
            <div className="brand-mark">
              <img
                src="https://res.cloudinary.com/efjuzuge/image/upload/v1787922904/icon_only.png"
                alt="Clothify logo"
              />
            </div>
            <div className="brand-info">
              <span className="brand-title">Cloth<span>ify</span></span>
              <span className="brand-subtitle">Colombo &bull; Est. 2026</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main navigation">
            <button
              type="button"
              className={`nav-link ${location.pathname === '/products' && !location.search.includes('segment=') ? 'active' : ''}`}
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
            {searchQuery && (
              <button
                type="button"
                className="nav-search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
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
                    padding: '4px 14px 4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(196, 75, 43, 0.18)',
                  }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="User menu"
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: 'var(--grad-accent)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 2px 8px rgba(196, 75, 43, 0.3)',
                    }}
                  >
                    {initials}
                  </div>
                  <span className="user-menu-name" style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
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
                      <span className={`user-dropdown-role-badge ${user.role === 'admin' ? 'admin' : 'vip'}`}>
                        {user.role === 'admin' ? '⚡ Administrator' : '★ VIP Member'}
                      </span>
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
                          to="/admin/orders"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Package size={16} /> Orders &amp; Fulfillment
                        </Link>
                        <Link
                          to="/admin/catalog"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <ShoppingBag size={16} /> Catalog &amp; Inventory
                        </Link>
                        <Link
                          to="/admin/customers"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Compass size={16} /> Customer Directory
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/customer/dashboard"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} /> Member Hub
                        </Link>
                        <Link
                          to="/customer/orders"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Package size={16} /> Order Tracking
                        </Link>
                        <Link
                          to="/customer/wishlist"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Heart size={16} /> Saved Pieces
                        </Link>
                        <Link
                          to="/customer/profile"
                          className="dropdown-link"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <UserIcon size={16} /> Contact &amp; Address
                        </Link>
                      </>
                    )}

                    <div style={{ height: 1, background: 'rgba(196, 75, 43, 0.1)', margin: '4px 0' }} />

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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/login" className="nav-signin-btn">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="monic-btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.86rem' }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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
                <div className="brand-info">
                  <span className="brand-title">Cloth<span>ify</span></span>
                  <span className="brand-subtitle">Colombo &bull; Est. 2026</span>
                </div>
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
                className={`mobile-drawer-item ${location.pathname === '/products' && !location.search.includes('segment=') ? 'active' : ''}`}
                onClick={() => navigateToShop()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Compass size={18} />
                  <span>Shop All</span>
                </div>
                <ChevronRight size={16} className="drawer-arrow" />
              </button>

              <button
                type="button"
                className={`mobile-drawer-item ${location.search.includes('segment=Men') ? 'active' : ''}`}
                onClick={() => navigateToShop('Men')}
              >
                <span>Men</span>
                <ChevronRight size={16} className="drawer-arrow" />
              </button>

              <button
                type="button"
                className={`mobile-drawer-item ${location.search.includes('segment=Women') ? 'active' : ''}`}
                onClick={() => navigateToShop('Women')}
              >
                <span>Women</span>
                <ChevronRight size={16} className="drawer-arrow" />
              </button>

              <button
                type="button"
                className={`mobile-drawer-item ${location.search.includes('segment=Kids') ? 'active' : ''}`}
                onClick={() => navigateToShop('Kids')}
              >
                <span>Kids</span>
                <ChevronRight size={16} className="drawer-arrow" />
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
                    <UserIcon size={16} /> Sign In
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
