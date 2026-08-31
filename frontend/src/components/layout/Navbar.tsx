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
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../services/auth.context';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const { user, logout } = useAuth();
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

  // Fetch cart & wishlist count on user change or navigation
  useEffect(() => {
    let mounted = true;
    async function loadCounts() {
      if (!user) {
        setCartCount(0);
        setWishlistCount(0);
        return;
      }
      try {
        const { getCart } = await import('../../services/cart.service');
        const cart = await getCart();
        if (mounted && cart?.items) {
          setCartCount(cart.items.length);
        }
      } catch {
        // guest or non-critical
      }
      try {
        const { getWishlist } = await import('../../services/wishlist.service');
        const wishlist = await getWishlist();
        if (mounted && wishlist?.items) {
          setWishlistCount(wishlist.items.length);
        }
      } catch {
        // non-critical
      }
    }
    loadCounts();
    return () => {
      mounted = false;
    };
  }, [user, location.pathname]);

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
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
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
            className={`nav-link ${isActiveNav('/') && !location.search ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            Home
          </button>
          <button
            type="button"
            className={`nav-link ${location.pathname === '/products' && !location.search.includes('segment') ? 'active' : ''}`}
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

        {/* Search Bar */}
        <form className="nav-search-wrap" onSubmit={handleSearchSubmit}>
          <Search size={16} className="nav-search-icon" />
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search styles, brands..."
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
                className="icon-btn"
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
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'var(--grad-accent)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {initials}
                </div>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)' }}>
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
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-nav container" style={{ display: 'flex', paddingBottom: 20 }}>
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: 12 }}>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search Clothify styles..."
                className="auth-input-element"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => {
              setMobileOpen(false);
              navigate('/');
            }}
          >
            Home
          </button>
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => navigateToShop()}
          >
            Shop All Collections
          </button>
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => navigateToShop('Men')}
          >
            Men's Fashion
          </button>
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => navigateToShop('Women')}
          >
            Women's Fashion
          </button>
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => navigateToShop('Kids')}
          >
            Kids' Fashion
          </button>

          {user ? (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
              <button
                type="button"
                className="mobile-nav-link"
                onClick={() => {
                  setMobileOpen(false);
                  navigate(user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
                }}
              >
                <Sparkles size={16} /> Account Dashboard
              </button>
              <button
                type="button"
                className="mobile-nav-link"
                style={{ color: '#ef4444' }}
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              className="mobile-nav-link"
              style={{ background: 'var(--grad-accent)', color: 'white', fontWeight: 800 }}
              onClick={() => {
                setMobileOpen(false);
                navigate('/login');
              }}
            >
              Sign In / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
}

