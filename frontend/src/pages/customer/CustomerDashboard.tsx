import {
  Heart, ShoppingBag, User, Package, ShoppingCart, Star,
  ChevronRight, Home, LogOut,
  Clock, Truck, Check, Sparkles,
  ShieldCheck, X, Search, Copy, CheckCheck,
  TrendingUp, Mail, Phone, FileText, Award,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, type ReactNode } from 'react';
import { useAuth } from '../../services/auth.context';
import { CartList } from '../../components/cart/CartList';
import { WishlistList } from '../../components/wishlist/WishlistList';
import * as orderService from '../../services/order.service';
import * as cartService from '../../services/cart.service';
import * as wishlistService from '../../services/wishlist.service';
import * as reviewService from '../../services/review.service';
import { Loader } from '../../components/common/Loader';

/* ───────── nav config ───────── */
const navItems = [
  { to: '/customer/dashboard', label: 'Dashboard',   icon: Home },
  { to: '/customer/orders',    label: 'My Orders',   icon: Package },
  { to: '/customer/cart',      label: 'Shopping Bag', icon: ShoppingCart },
  { to: '/customer/wishlist',  label: 'Saved Pieces', icon: Heart },
  { to: '/customer/profile',   label: 'Profile & Perks', icon: User },
  { to: '/products',           label: 'Shop All',    icon: ShoppingBag },
];

/* ───────── Sidebar & Mobile Navigation ───────── */
function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'M';

  return (
    <>
      {/* ── Mobile Horizontal Navigation Tabs ── */}
      <div className="dashboard-mobile-tabs show-on-mobile">
        <div className="dashboard-mobile-tabs-scroll">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/customer/dashboard'
              ? location.pathname === to
              : to !== '/products' && location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/customer/dashboard'}
                className={`dashboard-mobile-tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* ── Desktop Sticky Glass Sidebar ── */}
      <aside className="monic-dash-sidebar hide-on-mobile">
        {/* Brand Banner */}
        <div className="monic-dash-side-brand">
          <div className="monic-dash-brand-icon">
            <Sparkles size={18} color="#C44B2B" />
          </div>
          <div>
            <span className="monic-dash-side-tag">Private Club</span>
            <strong className="monic-dash-side-title">Monic Studio</strong>
          </div>
        </div>

        {/* Member Profile Card */}
        <div className="monic-dash-user-card">
          <div className="monic-dash-avatar">
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="monic-dash-user-name">
              {user?.fullName || 'Valued Member'}
            </div>
            <div className="monic-dash-user-email">
              {user?.email}
            </div>
            <div style={{ marginTop: 6 }}>
              <span className="monic-dash-vip-pill">
                ★ VIP Member
              </span>
            </div>
          </div>
        </div>

        {/* Nav List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/customer/dashboard'
              ? location.pathname === to
              : to !== '/products' && location.pathname.startsWith(to);
            return (
              <NavLink key={to} to={to} end={to === '/customer/dashboard'} style={{ textDecoration: 'none' }}>
                <div className={`monic-dash-nav-btn ${isActive ? 'active' : ''}`}>
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.8 }} />}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(44, 24, 16, 0.08)' }}>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="monic-dash-logout"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

/* ───────── Customer Dashboard (Home) ───────── */
export function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Valued Guest';

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboardData() {
      try {
        const [ordersData, wishlistData, cartData] = await Promise.allSettled([
          orderService.getMyOrders(),
          wishlistService.getWishlist(),
          cartService.getCart(),
        ]);

        if (isMounted) {
          if (ordersData.status === 'fulfilled' && Array.isArray(ordersData.value)) {
            setOrders(ordersData.value);
          }
          if (wishlistData.status === 'fulfilled' && wishlistData.value?.items) {
            setWishlistItems(wishlistData.value.items);
          }
          if (cartData.status === 'fulfilled' && cartData.value) {
            setCartCount(cartData.value.items?.length || 0);
            setCartTotal(Number(cartData.value.subtotal || 0));
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, ord) => sum + Number(ord.grand_total || 0), 0);
  }, [orders]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => {
      const s = String(o.status || '').toLowerCase();
      return s !== 'delivered' && s !== 'cancelled';
    }).length;
  }, [orders]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('WELCOME15');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          {/* Welcome Hero Banner - Concise Executive Summary */}
          <div className="monic-dash-hero">
            <div className="monic-dash-hero-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="monic-live-indicator">
                  <span className="monic-live-dot" /> VIP Active
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700 }}>
                  ● Gold Tier Member
                </span>
              </div>
              <h1 className="monic-dash-title">
                Welcome, <em>{firstName}</em>
              </h1>
              <p className="monic-dash-desc">
                Your wardrobe shipments, saved pieces, and private privileges at a glance.
              </p>
            </div>

            <div className="monic-dash-hero-actions">
              <Link to="/products" className="monic-btn-primary" style={{ fontSize: '0.86rem', padding: '10px 22px' }}>
                <ShoppingBag size={15} /> Shop New In
              </Link>
            </div>
          </div>

          {/* Live Metrics Grid */}
          <div className="monic-dash-stats-grid">
            <div className="monic-dash-stat-card">
              <div className="monic-dash-stat-header">
                <span className="monic-dash-stat-label">Active Orders</span>
                <div className="monic-dash-stat-icon" style={{ background: 'rgba(196, 75, 43, 0.1)', color: '#C44B2B' }}>
                  <Package size={18} />
                </div>
              </div>
              <div className="monic-dash-stat-value">
                {loading ? '—' : activeOrdersCount}
              </div>
              <div className="monic-dash-stat-meta">
                {orders.length} total lifetime {orders.length === 1 ? 'order' : 'orders'}
              </div>
            </div>

            <div className="monic-dash-stat-card">
              <div className="monic-dash-stat-header">
                <span className="monic-dash-stat-label">Saved Pieces</span>
                <div className="monic-dash-stat-icon" style={{ background: 'rgba(212, 165, 116, 0.15)', color: '#A86C32' }}>
                  <Heart size={18} />
                </div>
              </div>
              <div className="monic-dash-stat-value">
                {loading ? '—' : wishlistItems.length}
              </div>
              <div className="monic-dash-stat-meta">
                <Link to="/customer/wishlist" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>
                  View saved items →
                </Link>
              </div>
            </div>

            <div className="monic-dash-stat-card">
              <div className="monic-dash-stat-header">
                <span className="monic-dash-stat-label">Shopping Bag</span>
                <div className="monic-dash-stat-icon" style={{ background: 'rgba(107, 142, 107, 0.15)', color: '#4A6741' }}>
                  <ShoppingCart size={18} />
                </div>
              </div>
              <div className="monic-dash-stat-value">
                {loading ? '—' : `LKR ${cartTotal.toLocaleString()}`}
              </div>
              <div className="monic-dash-stat-meta">
                {cartCount} {cartCount === 1 ? 'garment' : 'garments'} queued in bag
              </div>
            </div>

            <div className="monic-dash-stat-card">
              <div className="monic-dash-stat-header">
                <span className="monic-dash-stat-label">Total Spend</span>
                <div className="monic-dash-stat-icon" style={{ background: 'rgba(196, 75, 43, 0.1)', color: '#C44B2B' }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="monic-dash-stat-value">
                {loading ? '—' : `LKR ${totalSpent.toLocaleString()}`}
              </div>
              <div className="monic-dash-stat-meta">
                Verified member status
              </div>
            </div>
          </div>

          {/* VIP Perk & Promo Voucher Strip */}
          <div className="monic-dash-voucher-strip">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="monic-dash-voucher-icon">
                <Sparkles size={20} color="#C44B2B" />
              </div>
              <div>
                <strong style={{ fontSize: '0.98rem', color: 'var(--primary)', display: 'block' }}>
                  15% Private Member Discount
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                  Use code <strong style={{ color: 'var(--accent)' }}>WELCOME15</strong> at checkout on all designer releases.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="monic-dash-copy-btn"
            >
              {copiedCode ? (
                <>
                  <CheckCheck size={14} color="#166534" /> <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} /> <span>Copy WELCOME15</span>
                </>
              )}
            </button>
          </div>

          {/* Recent Orders Section */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.18rem', color: 'var(--primary)', fontWeight: 800 }}>
                  Recent Orders
                </h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Track current deliveries and garment receipts</span>
              </div>
              <Link to="/customer/orders" className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                View All Orders →
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: '24px 0' }}>
                <Loader size="sm" label="Retrieving order records..." />
              </div>
            ) : orders.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {orders.slice(0, 3).map((order) => {
                  const status = String(order.status || 'pending').toLowerCase();
                  const isDelivered = status === 'delivered';
                  const isShipped = status === 'shipped';

                  return (
                    <div key={order.id} className="monic-order-preview-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                        <div className="monic-order-badge-icon">
                          <Package size={18} color="#C44B2B" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: '0.94rem', color: 'var(--primary)', display: 'block' }}>
                            Order #{order.order_number}
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span className={`badge ${isDelivered ? 'badge-green' : isShipped ? 'badge-blue' : 'badge-amber'}`}>
                          {isDelivered ? '✓ Delivered' : isShipped ? '🚚 Shipped' : '📦 Processing'}
                        </span>
                        <strong style={{ fontSize: '0.94rem', color: 'var(--primary)' }}>
                          LKR {Number(order.grand_total || 0).toLocaleString()}
                        </strong>
                        <Link to="/customer/orders" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                          <ChevronRight size={18} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dashboard-empty-box">
                <Package size={36} style={{ color: 'var(--muted)', marginBottom: 10 }} />
                <h3 style={{ margin: '0 0 6px', color: 'var(--primary)', fontSize: '1.05rem' }}>No orders placed yet</h3>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.86rem', maxWidth: 360 }}>
                  Explore Monic's new arrivals and place your first order with free delivery on orders over LKR 10,000.
                </p>
                <Link to="/products" className="btn btn-primary" style={{ marginTop: 16, fontSize: '0.84rem', padding: '9px 18px' }}>
                  Explore Collection
                </Link>
              </div>
            )}
          </div>

          {/* Member Benefits Grid */}
          <div style={{ marginTop: 28 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.18rem', color: 'var(--primary)', fontWeight: 800 }}>
              VIP Member Benefits
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {[
                { icon: <Truck size={18} />, title: 'Complimentary Express Delivery', desc: 'Free express shipping on all orders exceeding LKR 10,000.', color: '#6B8E6B' },
                { icon: <Star size={18} />, title: 'Exclusive Seasonal Previews', desc: 'Priority access to new catalog releases and private sales.', color: '#D4A574' },
                { icon: <ShieldCheck size={18} />, title: '30-Day Hassle-Free Returns', desc: 'Complimentary exchanges & easy returns with doorstep pickup.', color: '#C44B2B' },
              ].map((perk, i) => (
                <div key={i} className="monic-dash-benefit-card">
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${perk.color}15`, display: 'grid', placeItems: 'center', color: perk.color, marginBottom: 12 }}>
                    {perk.icon}
                  </div>
                  <strong style={{ fontSize: '0.94rem', color: 'var(--primary)', display: 'block', marginBottom: 4 }}>
                    {perk.title}
                  </strong>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                    {perk.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ───────── Layout Wrapper ───────── */
function CustomerLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <p className="dashboard-eyebrow">Customer Portal</p>
              <h1 className="dashboard-title">{title}</h1>
            </div>
            <Link to="/customer/dashboard" className="btn btn-secondary" style={{ fontSize: '0.84rem', padding: '8px 16px', whiteSpace: 'nowrap' }}>
              ← Member Hub
            </Link>
          </header>
          <p className="dashboard-subtitle">{description}</p>
          {children}
        </main>
      </div>
    </div>
  );
}

/* ───────── Orders Page ───────── */
export function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeReviewOrderId, setActiveReviewOrderId] = useState<string | null>(null);
  const [selectedProductForReview, setSelectedProductForReview] = useState<{ id: string; name: string; image?: string; currentRating?: number; currentText?: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  // Invoice modal state
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<any | null>(null);

  const loadOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = !searchQuery || 
        o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items?.some((it: any) => it.product_name?.toLowerCase().includes(searchQuery.toLowerCase()));

      const st = String(o.status || 'pending').toLowerCase();
      const ps = String(o.payment_status || '').toLowerCase();
      
      let matchesFilter = true;
      if (statusFilter === 'processing') {
        matchesFilter = (st === 'processing' || st === 'confirmed' || st === 'pending') && ps !== 'failed';
      } else if (statusFilter === 'shipped') {
        matchesFilter = st === 'shipped';
      } else if (statusFilter === 'delivered') {
        matchesFilter = st === 'delivered';
      } else if (statusFilter === 'cancelled') {
        matchesFilter = st === 'cancelled' || ps === 'failed' || ps === 'rejected';
      }
      return matchesSearch && matchesFilter;
    });
  }, [orders, searchQuery, statusFilter]);

  const statusBadge = (ps: string, status?: string) => {
    const normalizedPayment = String(ps || '').toLowerCase();
    const normalizedStatus = String(status || '').toLowerCase();

    if (normalizedStatus === 'delivered') {
      return { background: '#dcfce7', color: '#166534', label: '🎉 Delivered' };
    }
    if (normalizedStatus === 'shipped') {
      return { background: '#e0f2fe', color: '#0369a1', label: '🚚 Shipped' };
    }
    if (normalizedStatus === 'processing') {
      return { background: '#fef3c7', color: '#92400e', label: '📦 Processing' };
    }
    if (normalizedPayment === 'paid' || normalizedStatus === 'confirmed') {
      return { background: '#dcfce7', color: '#166534', label: '✓ Payment Confirmed' };
    }
    if (normalizedPayment === 'failed' || normalizedPayment === 'rejected' || normalizedStatus === 'cancelled') {
      return { background: '#fee2e2', color: '#991b1b', label: '✕ Cancelled' };
    }
    return { background: '#fef3c7', color: '#92400e', label: '⏳ Verification Pending' };
  };

  const getOrderProgress = (order: any) => {
    const status = String(order?.status || '').toLowerCase();
    const paymentStatus = String(order?.payment_status || '').toLowerCase();

    if (status === 'cancelled' || paymentStatus === 'failed' || paymentStatus === 'rejected') {
      return { currentStep: -1, width: '0%', label: 'Order Cancelled' };
    }
    if (status === 'delivered') {
      return { currentStep: 5, width: '100%', label: 'Delivered' };
    }
    if (status === 'shipped') {
      return { currentStep: 4, width: '80%', label: 'Shipped' };
    }
    if (status === 'processing') {
      return { currentStep: 3, width: '60%', label: 'Processing' };
    }
    if (status === 'confirmed' || (paymentStatus === 'paid' && status !== 'pending')) {
      return { currentStep: 2, width: '40%', label: 'Payment Confirmed' };
    }
    return { currentStep: 1, width: '20%', label: 'Verification Pending' };
  };

  const handleOpenReview = (item: any, orderId: string) => {
    setActiveReviewOrderId(orderId);
    setSelectedProductForReview({
      id: item.product_id,
      name: item.product_name || 'Garment Piece',
      image: item.product_image,
      currentRating: item.user_rating || 5,
      currentText: item.user_review || '',
    });
    setReviewRating(item.user_rating || 5);
    setReviewComment(item.user_review || '');
    setReviewSuccessMsg(null);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedProductForReview?.id) return;
    setSubmittingReview(true);
    try {
      await reviewService.submitReview(selectedProductForReview.id, {
        rating: reviewRating,
        reviewText: reviewComment,
      });
      setReviewSuccessMsg('Your feedback has been published!');
      setTimeout(() => {
        setReviewModalOpen(false);
        setActiveReviewOrderId(null);
        loadOrders();
      }, 1400);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Unable to submit feedback.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <CustomerLayout title="My Orders &amp; Delivery Tracking" description="Track purchases, delivery timelines, and inspect receipt invoices.">
      {/* Search & Filter Header */}
      <div className="monic-order-filters-wrap">
        <div className="monic-order-search-box">
          <Search size={16} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search by order # or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="monic-order-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="monic-order-filter-pills">
          {(['all', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              onClick={() => setStatusFilter(filterKey)}
              className={`monic-order-filter-btn ${statusFilter === filterKey ? 'active' : ''}`}
            >
              {filterKey === 'all' ? 'All Orders' : filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {loading ? (
          <div style={{ padding: '36px 0' }}>
            <Loader size="md" label="Loading orders & tracking..." />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div style={{ display: 'grid', gap: 20 }}>
            {filteredOrders.map((order) => {
              const badge = statusBadge(order.payment_status, order.status);
              const progress = getOrderProgress(order);
              const timelineSteps = [
                { key: 'placed', label: 'Placed', completed: true },
                { key: 'verification', label: progress.currentStep >= 2 ? 'Confirmed' : 'Verified', completed: progress.currentStep >= 2 },
                { key: 'processing', label: 'Processing', completed: progress.currentStep >= 3 },
                { key: 'shipped', label: 'Shipped', completed: progress.currentStep >= 4 },
                { key: 'delivered', label: 'Delivered', completed: progress.currentStep >= 5 },
              ];

              const isEligibleForReview = progress.currentStep >= 5 || String(order.status || '').toLowerCase() === 'delivered';

              return (
                <div key={order.id} className="monic-order-card" style={{ position: 'relative', overflow: 'hidden' }}>
                  {/* Order header */}
                  <div className="monic-order-card-header">
                    <div>
                      <strong style={{ fontSize: '1.08rem', color: 'var(--primary)', letterSpacing: '-0.01em' }}>
                        Order #{order.order_number}
                      </strong>
                      <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 3 }}>
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setInvoiceModalOrder(order)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      >
                        <FileText size={13} /> View Invoice
                      </button>
                      <span className="badge" style={{ background: badge.background, color: badge.color, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800 }}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Timeline Visualizer */}
                  <div className="order-timeline">
                    <div className="order-timeline-bar">
                      <div className="order-timeline-progress" style={{ width: progress.width }} />
                    </div>

                    {timelineSteps.map((step, index) => {
                      const isCurrent = progress.currentStep === index + 1 || (index === 0 && progress.currentStep === 1);
                      const isCompleted = step.completed || progress.currentStep > index + 1 || (index === 0 && progress.currentStep >= 1);

                      return (
                        <div key={step.key} className={`order-timeline-step ${isCompleted ? 'completed' : isCurrent ? 'current' : ''}`}>
                          <div className="order-step-node">
                            {isCompleted ? <Check size={14} /> : index === 0 ? <Check size={14} /> : index === 1 ? <Clock size={14} /> : index === 2 ? <Package size={14} /> : index === 3 ? <Truck size={14} /> : <Sparkles size={14} />}
                          </div>
                          <span className="order-step-label">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Items List */}
                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div style={{ marginTop: 18, borderTop: '1px solid rgba(44, 24, 16, 0.08)', paddingTop: 16 }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Purchased Pieces ({order.items.length})
                      </span>
                      <div style={{ display: 'grid', gap: 10 }}>
                        {order.items.map((item: any, idx: number) => (
                          <div
                            key={item.id || idx}
                            className="monic-order-item-row"
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                              <img
                                src={item.product_image || 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853829/pexels-emrekeshavarz-19607463.jpg'}
                                alt={item.product_name}
                                style={{ width: 52, height: 60, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border)' }}
                              />
                              <div>
                                <strong style={{ fontSize: '0.94rem', color: 'var(--primary)', display: 'block' }}>
                                  {item.product_name}
                                </strong>
                                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
                                  Qty: {item.quantity} {item.size ? `· Size: ${item.size}` : ''} {item.color ? `· Color: ${item.color}` : ''}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.94rem', color: 'var(--primary)' }}>
                                LKR {Number(item.unit_price || 0).toLocaleString()}
                              </strong>

                              {isEligibleForReview && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenReview(item, order.id)}
                                  className="monic-rate-btn"
                                >
                                  <Star size={13} fill="currentColor" />
                                  {item.user_rating ? `Rated ★ ${item.user_rating}` : 'Feedback'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order details summary */}
                  <div className="monic-order-summary-strip">
                    <div>
                      <span className="dashboard-label">Status</span>
                      <strong style={{ color: 'var(--primary)', textTransform: 'capitalize', fontSize: '0.88rem' }}>
                        {order.status || 'pending'}
                      </strong>
                    </div>
                    <div>
                      <span className="dashboard-label">Payment Method</span>
                      <strong style={{ color: 'var(--primary)', fontSize: '0.88rem' }}>
                        {order.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : '💳 Card / Online'}
                      </strong>
                    </div>
                    <div>
                      <span className="dashboard-label">Order Total</span>
                      <strong style={{ color: 'var(--accent)', fontSize: '1.08rem', fontWeight: 900 }}>
                        LKR {Number(order.grand_total || 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* ── In-Card Feedback Popup Overlay directly on top of this order container ── */}
                  {reviewModalOpen && activeReviewOrderId === order.id && selectedProductForReview && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '24px 28px',
                        overflowY: 'auto',
                        animation: 'fadeIn 0.25s ease',
                      }}
                    >
                      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Star size={18} color="var(--accent)" fill="var(--accent)" />
                            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 800 }}>
                              Feedback: {selectedProductForReview.name}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setReviewModalOpen(false);
                              setActiveReviewOrderId(null);
                            }}
                            className="cf-modal-close"
                            title="Close feedback form"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {/* Product Summary */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, background: 'var(--panel-soft)', padding: '8px 12px', borderRadius: 12, border: '1px solid var(--border)' }}>
                          <img
                            src={selectedProductForReview.image || 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853829/pexels-emrekeshavarz-19607463.jpg'}
                            alt={selectedProductForReview.name}
                            style={{ width: 42, height: 48, borderRadius: 8, objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: 'var(--primary)', display: 'block' }}>{selectedProductForReview.name}</strong>
                            <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Delivered Piece · Order #{order.order_number}</span>
                          </div>
                        </div>

                        {/* Star Rating Picker */}
                        <div style={{ textAlign: 'center', margin: '8px 0 14px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                            Your Rating
                          </span>
                          <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'center' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: 2,
                                  color: star <= reviewRating ? '#f59e0b' : '#d1d5db',
                                  transform: star <= reviewRating ? 'scale(1.15)' : 'scale(1)',
                                  transition: 'transform 0.15s ease',
                                }}
                                title={`${star} Star${star > 1 ? 's' : ''}`}
                              >
                                <Star size={26} fill={star <= reviewRating ? '#f59e0b' : 'none'} />
                              </button>
                            ))}
                          </div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
                            {reviewRating === 5 ? '⭐⭐⭐⭐⭐ Exceptional Quality' :
                             reviewRating === 4 ? '⭐⭐⭐⭐ Great Fit & Style' :
                             reviewRating === 3 ? '⭐⭐⭐ Average Experience' :
                             reviewRating === 2 ? '⭐⭐ Below Expectations' : '⭐ Poor'}
                          </div>
                        </div>

                        {/* Feedback Message */}
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>
                            Your Feedback Message
                          </label>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share details about the fabric drape, sizing fit, delivery, and overall satisfaction..."
                            required
                            style={{
                              width: '100%',
                              minHeight: 75,
                              padding: '8px 12px',
                              borderRadius: 12,
                              border: '1.5px solid var(--border)',
                              background: 'var(--panel)',
                              color: 'var(--text)',
                              fontSize: '0.85rem',
                              resize: 'vertical',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        {reviewSuccessMsg && (
                          <div style={{ background: '#dcfce7', color: '#166534', padding: '8px 12px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
                            ✓ {reviewSuccessMsg}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setReviewModalOpen(false);
                              setActiveReviewOrderId(null);
                            }}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '8px 14px', fontSize: '0.84rem' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmitReview}
                            disabled={submittingReview}
                            className="btn btn-primary"
                            style={{ flex: 2, padding: '8px 14px', fontSize: '0.84rem' }}
                          >
                            {submittingReview ? 'Submitting…' : 'Submit Feedback'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-empty-box">
            <Package size={40} style={{ color: 'var(--muted)', marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 6px', color: 'var(--primary)' }}>
              {searchQuery || statusFilter !== 'all' ? 'No Matching Orders' : 'No Orders Placed Yet'}
            </h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem', maxWidth: 400 }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try resetting your search query or changing your status filter.'
                : 'When you place an order, you will be able to track live delivery progress and rate received garments here.'}
            </p>
            {searchQuery || statusFilter !== 'all' ? (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: 16 }}
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Reset Filters
              </button>
            ) : (
              <Link to="/products" className="btn btn-primary" style={{ marginTop: 18 }}>
                Explore Catalog
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Invoice / Order Details Modal ── */}
      {invoiceModalOrder && (
        <div className="cf-modal-backdrop" onClick={() => setInvoiceModalOrder(null)}>
          <div className="cf-modal-box" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="cf-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} color="var(--accent)" />
                <h3 style={{ margin: 0 }}>Order Invoice #{invoiceModalOrder.order_number}</h3>
              </div>
              <button type="button" className="cf-modal-close" onClick={() => setInvoiceModalOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="cf-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18, background: 'var(--panel-soft)', padding: 14, borderRadius: 14 }}>
                <div>
                  <span className="dashboard-label">Order Placed</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.86rem' }}>
                    {new Date(invoiceModalOrder.created_at).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="dashboard-label">Payment Status</span>
                  <strong style={{ color: 'var(--accent-3)', fontSize: '0.86rem', textTransform: 'uppercase' }}>
                    {invoiceModalOrder.payment_status || 'Paid'}
                  </strong>
                </div>
                <div>
                  <span className="dashboard-label">Payment Method</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.86rem' }}>
                    {invoiceModalOrder.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Credit / Debit Card'}
                  </strong>
                </div>
                <div>
                  <span className="dashboard-label">Delivery Status</span>
                  <strong style={{ color: 'var(--accent)', fontSize: '0.86rem', textTransform: 'capitalize' }}>
                    {invoiceModalOrder.status || 'Processing'}
                  </strong>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: 18 }}>
                <span className="dashboard-label" style={{ marginBottom: 8 }}>Itemized Breakdown</span>
                <div style={{ display: 'grid', gap: 8 }}>
                  {invoiceModalOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--panel)', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--primary)', display: 'block' }}>{item.product_name}</strong>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Qty: {item.quantity} · LKR {Number(item.unit_price || 0).toLocaleString()} each</span>
                      </div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>
                        LKR {(Number(item.unit_price || 0) * item.quantity).toLocaleString()}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--muted)' }}>
                  <span>Subtotal</span>
                  <span>LKR {Number(invoiceModalOrder.subtotal || invoiceModalOrder.grand_total || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--muted)' }}>
                  <span>Express Delivery</span>
                  <span style={{ color: '#166534', fontWeight: 700 }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 900, color: 'var(--primary)', borderTop: '1px dashed var(--border)', paddingTop: 8, marginTop: 4 }}>
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--accent)' }}>LKR {Number(invoiceModalOrder.grand_total || 0).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginTop: 20, textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => setInvoiceModalOrder(null)}
                  className="btn btn-primary"
                  style={{ minWidth: 120 }}
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </CustomerLayout>
  );
}

/* ───────── Profile & Perks Page ───────── */
export function CustomerProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('742 Evergreen Terrace, Colombo 03, Sri Lanka');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2600);
  };

  return (
    <CustomerLayout title="My Profile &amp; Member Perks" description="Manage contact details, delivery address, notification preferences, and VIP privileges.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Form Card */}
        <div className="dashboard-section-card">
          <h3 className="dashboard-card-title">Contact &amp; Delivery Details</h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label className="dashboard-label">Full Name</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><User size={15} /></span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="auth-input-element"
                />
              </div>
            </div>

            <div>
              <label className="dashboard-label">Email Address (Protected)</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Mail size={15} /></span>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="auth-input-element"
                  style={{ background: 'var(--panel-soft)', color: 'var(--muted)' }}
                />
              </div>
            </div>

            <div>
              <label className="dashboard-label">Phone Number</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Phone size={15} /></span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="auth-input-element"
                />
              </div>
            </div>

            <div>
              <label className="dashboard-label">Default Delivery Address</label>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="auth-input-element"
                  style={{ minHeight: 80, padding: 12, resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Notification Preferences */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
              <span className="dashboard-label" style={{ marginBottom: 10 }}>Notification Preferences</span>
              <div style={{ display: 'grid', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.86rem', color: 'var(--primary)' }}>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                  />
                  <span>Email order status updates &amp; digital invoices</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.86rem', color: 'var(--primary)' }}>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                  />
                  <span>SMS dispatch alerts &amp; doorstep delivery updates</span>
                </label>
              </div>
            </div>

            {savedSuccess && (
              <div style={{ color: '#166534', background: '#dcfce7', padding: '10px 14px', borderRadius: 10, fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={16} /> Profile changes and preferences saved successfully!
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: 6, minHeight: 46 }}>
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Overview & VIP Status Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="dashboard-section-card">
            <h3 className="dashboard-card-title">VIP Membership Status</h3>
            
            {/* VIP Tier Visual */}
            <div style={{ background: 'linear-gradient(135deg, rgba(196, 75, 43, 0.12) 0%, rgba(212, 165, 116, 0.18) 100%)', border: '1px solid rgba(196, 75, 43, 0.25)', borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={22} color="#C44B2B" />
                  <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>Gold VIP Tier</strong>
                </div>
                <span style={{ background: '#C44B2B', color: 'white', padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800 }}>
                  ACTIVE
                </span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                Enjoy priority warehouse dispatch, 15% VIP member vouchers, and complimentary express doorstep delivery.
              </p>
              <div style={{ width: '100%', height: 6, background: 'rgba(44, 24, 16, 0.1)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #C44B2B, #D4A574)', borderRadius: 999 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)', marginTop: 6 }}>
                <span>Tier Milestone: 85%</span>
                <span>Platinum VIP at LKR 100,000 spend</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ padding: '12px 14px', background: 'var(--panel)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="dashboard-label" style={{ margin: 0 }}>Account ID</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.86rem' }}>{user?.id || 'USR-2026-VIP'}</strong>
                </div>
                <span className="badge badge-blue">Registered Member</span>
              </div>

              <div style={{ padding: '12px 14px', background: 'var(--panel)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="dashboard-label" style={{ margin: 0 }}>Security Shield</span>
                  <strong style={{ color: '#166534', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ShieldCheck size={15} /> Encrypted &amp; Verified
                  </strong>
                </div>
                <span className="badge badge-green">Protected</span>
              </div>
            </div>
          </div>

          <div className="dashboard-section-card">
            <h3 className="dashboard-card-title">Exclusive Member Codes</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-soft)', border: '1.5px dashed rgba(196, 75, 43, 0.3)', padding: '12px 16px', borderRadius: 14 }}>
              <div>
                <strong style={{ color: 'var(--primary)', fontSize: '0.92rem' }}>WELCOME15</strong>
                <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--muted)' }}>15% off all new collections</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('WELCOME15');
                  alert('Code WELCOME15 copied to clipboard!');
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

/* ───────── Cart Page ───────── */
export function CustomerCartPage() {
  return (
    <CustomerLayout title="My Shopping Bag" description="Review selected items, apply promo codes, and complete your order.">
      <div className="dashboard-section-card">
        <CartList />
      </div>
    </CustomerLayout>
  );
}

/* ───────── Wishlist Page ───────── */
export function CustomerWishlistPage() {
  return (
    <CustomerLayout title="My Saved Wishlist" description="Keep track of pieces you love and move them directly to your bag.">
      <WishlistList />
    </CustomerLayout>
  );
}


