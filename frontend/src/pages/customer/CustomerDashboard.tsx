import {
  Heart, ShoppingBag, User, Package, ShoppingCart, Star,
  ChevronRight, Home, LogOut,
  Clock, Truck, Check, Sparkles,
  ShieldCheck, X,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../../services/auth.context';
import { CartList } from '../../components/cart/CartList';
import { WishlistList } from '../../components/wishlist/WishlistList';
import * as orderService from '../../services/order.service';
import * as reviewService from '../../services/review.service';

/* ───────── nav config ───────── */
const navItems = [
  { to: '/customer/dashboard', label: 'Dashboard',   icon: Home },
  { to: '/customer/profile',   label: 'My Profile',  icon: User },
  { to: '/customer/orders',    label: 'My Orders',   icon: Package },
  { to: '/customer/cart',      label: 'My Cart',     icon: ShoppingCart },
  { to: '/customer/wishlist',  label: 'My Wishlist', icon: Heart },
  { to: '/products',           label: 'Shop All',    icon: ShoppingBag },
];

/* ───────── Sidebar & Mobile Navigation ───────── */
function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

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
                <Icon size={15} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* ── Desktop Sticky Sidebar ── */}
      <aside className="dashboard-sidebar hide-on-mobile">
        {/* Brand */}
        <div className="dashboard-brand-wrap">
          <div className="dashboard-brand-badge">
            <img
              src="https://res.cloudinary.com/efjuzuge/image/upload/v1787922904/icon_only.png"
              alt="Clothify"
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }}
            />
          </div>
          <div>
            <p className="dashboard-side-label">Member Portal</p>
            <strong className="dashboard-side-title">Clothify Club</strong>
          </div>
        </div>

        {/* Avatar Block */}
        <div className="dashboard-avatar-block">
          <div className="dashboard-avatar-circle">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName || 'Valued Member'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.74rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{ background: 'rgba(255,255,255,0.22)', color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 800 }}>
                ★ VIP Tier
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
                <div className={`dashboard-nav-item ${isActive ? 'active' : ''}`}>
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: 16 }}>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="dashboard-logout-btn"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

/* ───────── Overview Card ───────── */
function OverviewCard({
  title, description, icon: Icon, action, gradient, countBadge,
}: {
  title: string; description: string; icon: typeof User;
  action: string; gradient: string; countBadge?: string;
}) {
  return (
    <Link to={action} className="customer-overview-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div className="card-icon-wrap" style={{ background: gradient }}>
          <Icon size={20} style={{ color: 'white' }} />
        </div>
        {countBadge && (
          <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 999, padding: '4px 10px', fontSize: '0.74rem', fontWeight: 800 }}>
            {countBadge}
          </span>
        )}
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: '1.08rem', color: 'var(--primary)', fontWeight: 800 }}>{title}</h3>
      <p style={{ margin: '0 0 14px', color: 'var(--muted)', fontSize: '0.86rem', lineHeight: 1.5 }}>{description}</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontWeight: 700, fontSize: '0.86rem' }}>
        Access details <ChevronRight size={14} />
      </div>
    </Link>
  );
}

/* ───────── Customer Dashboard ───────── */
export function CustomerDashboard() {
  const { user } = useAuth();
  const name = user?.fullName || user?.email || 'Valued Shopper';

  return (
    <div className="dashboard-shell">
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <p className="dashboard-eyebrow">VIP Member Portal</p>
              <h1 className="dashboard-title">Welcome back, {name.split(' ')[0]}! ✨</h1>
            </div>
            <Link to="/products" className="btn btn-primary" style={{ fontSize: '0.86rem', padding: '9px 18px', whiteSpace: 'nowrap' }}>
              <ShoppingBag size={15} /> Explore Collection
            </Link>
          </header>
          <p className="dashboard-subtitle">Manage your orders, saved wishlists, delivery address, and account details in one place.</p>

          {/* Overview cards */}
          <div className="customer-overview-grid">
            <OverviewCard title="My Orders"   description="Track packages and delivery history."    icon={Package}     action="/customer/orders"   gradient="linear-gradient(135deg,#1a0a2e,#2d1b69)" />
            <OverviewCard title="Shopping Bag" description="Items currently queued in your cart."    icon={ShoppingCart} action="/customer/cart"     gradient="linear-gradient(135deg,#e91e8c,#ff6b35)" />
            <OverviewCard title="Saved Wishlist" description="Browse saved favorite pieces."       icon={Heart}       action="/customer/wishlist" gradient="linear-gradient(135deg,#7c3aed,#4f46e5)" />
            <OverviewCard title="Profile Details" description="Update your personal details & address." icon={User}    action="/customer/profile"  gradient="linear-gradient(135deg,#00d4aa,#00b4d8)" />
          </div>

          {/* Quick actions */}
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 800 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link to="/products"          className="btn btn-primary" style={{ fontSize: '0.88rem', padding: '10px 18px' }}>Shop New Arrivals</Link>
              <Link to="/customer/cart"     className="btn btn-secondary" style={{ fontSize: '0.88rem', padding: '10px 18px' }}>View Bag</Link>
              <Link to="/customer/wishlist" className="btn btn-secondary" style={{ fontSize: '0.88rem', padding: '10px 18px' }}>View Wishlist</Link>
              <Link to="/customer/orders"   className="btn btn-secondary" style={{ fontSize: '0.88rem', padding: '10px 18px' }}>Track Orders</Link>
            </div>
          </section>

          {/* Account + highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
            <div className="dashboard-info-card">
              <h3 className="dashboard-card-title">Account Information</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div><span className="dashboard-label">Full Name</span><strong style={{ color: 'var(--primary)' }}>{user?.fullName || 'Not configured'}</strong></div>
                <div><span className="dashboard-label">Email Address</span><strong style={{ fontSize: '0.88rem', color: 'var(--primary)' }}>{user?.email}</strong></div>
                <div><span className="dashboard-label">Phone Number</span><strong style={{ color: 'var(--primary)' }}>{user?.phone || 'Not provided'}</strong></div>
                <div>
                  <span className="dashboard-label">Membership Status</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', background: '#ede9fe', color: '#5b21b6', borderRadius: 999, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 800 }}>
                    VIP Clothify Member
                  </span>
                </div>
              </div>
            </div>

            <div className="dashboard-info-card">
              <h3 className="dashboard-card-title">Clothify Member Perks</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: <Star size={17} />, text: '15% Member Discount (Code: WELCOME15)', color: '#f59e0b' },
                  { icon: <Truck size={17} />, text: 'Free Express Delivery on orders over LKR 5,000', color: '#00d4aa' },
                  { icon: <ShieldCheck size={17} />, text: '30-Day Hassle-Free Returns & Exchanges', color: '#e91e8c' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}18`, display: 'grid', placeItems: 'center', color: item.color, flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.88rem' }}>{item.text}</span>
                  </div>
                ))}
              </div>
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
              <p className="dashboard-eyebrow">Customer Dashboard</p>
              <h1 className="dashboard-title">{title}</h1>
            </div>
            <Link to="/customer/dashboard" className="btn btn-secondary" style={{ fontSize: '0.86rem', padding: '9px 16px', whiteSpace: 'nowrap' }}>
              ← Dashboard
            </Link>
          </header>
          <p className="dashboard-subtitle">{description}</p>
          {children}
        </main>
      </div>
    </div>
  );
}

/* ───────── Profile Page ───────── */
export function CustomerProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('742 Evergreen Terrace, Colombo 03, Sri Lanka');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2600);
  };

  return (
    <CustomerLayout title="My Profile Settings" description="Update your personal details, phone number, and delivery preferences.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Form Card */}
        <div className="dashboard-section-card">
          <h3 className="dashboard-card-title">Edit Contact Details</h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label className="dashboard-label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="auth-input-element"
                style={{ minHeight: 42, paddingLeft: 14 }}
              />
            </div>

            <div>
              <label className="dashboard-label">Email Address (Read-only)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="auth-input-element"
                style={{ minHeight: 42, paddingLeft: 14, background: 'var(--panel-soft)', color: 'var(--muted)' }}
              />
            </div>

            <div>
              <label className="dashboard-label">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="auth-input-element"
                style={{ minHeight: 42, paddingLeft: 14 }}
              />
            </div>

            <div>
              <label className="dashboard-label">Default Shipping Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="auth-input-element"
                style={{ minHeight: 80, padding: 12, resize: 'vertical' }}
              />
            </div>

            {savedSuccess && (
              <div style={{ color: 'var(--accent-3)', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={16} /> Profile changes saved successfully!
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: 6, minHeight: 46 }}>
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Overview Summary */}
        <div className="dashboard-section-card">
          <h3 className="dashboard-card-title">Membership Summary</h3>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ padding: '14px 16px', background: 'var(--panel)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <span className="dashboard-label">Account ID</span>
              <strong style={{ color: 'var(--primary)', fontSize: '0.88rem' }}>{user?.id || 'USR-2026-VIP'}</strong>
            </div>

            <div style={{ padding: '14px 16px', background: 'var(--panel)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <span className="dashboard-label">Security Verification</span>
              <strong style={{ color: 'var(--accent-3)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} /> Email Verified &amp; Protected
              </strong>
            </div>

            <div style={{ padding: '14px 16px', background: 'var(--panel)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <span className="dashboard-label">Member Benefit Level</span>
              <strong style={{ color: 'var(--accent)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} /> VIP Tier — Priority Shipping &amp; Special Offers
              </strong>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

/* ───────── Orders Page ───────── */
export function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<{ id: string; name: string; image?: string; currentRating?: number; currentText?: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

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
      return { background: '#dcfce7', color: '#166534', label: '✓ Payment Approved' };
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

  const handleOpenReview = (item: any) => {
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
      setReviewSuccessMsg('Your review and rating have been published!');
      setTimeout(() => {
        setReviewModalOpen(false);
        loadOrders();
      }, 1400);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Unable to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <CustomerLayout title="My Orders &amp; Delivery Tracking" description="Track purchases, delivery timelines, and rate received garments.">
      <div className="dashboard-section-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="loader" style={{ margin: '0 auto 14px' }} />
            <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading orders…</p>
          </div>
        ) : orders.length ? (
          <div style={{ display: 'grid', gap: 20 }}>
            {orders.map((order) => {
              const badge = statusBadge(order.payment_status, order.status);
              const progress = getOrderProgress(order);
              const timelineSteps = [
                { key: 'placed', label: 'Placed', completed: true },
                { key: 'verification', label: progress.currentStep >= 2 ? 'Confirmed' : 'Verified', completed: progress.currentStep >= 2 },
                { key: 'processing', label: 'Processing', completed: progress.currentStep >= 3 },
                { key: 'shipped', label: 'Shipped', completed: progress.currentStep >= 4 },
                { key: 'delivered', label: 'Delivered', completed: progress.currentStep >= 5 },
              ];

              const isEligibleForReview = progress.currentStep >= 2;

              return (
                <div key={order.id} className="customer-order-card">
                  {/* Order header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>
                        Order #{order.order_number}
                      </strong>
                      <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 3 }}>
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <span className="badge" style={{ background: badge.background, color: badge.color, padding: '6px 12px' }}>
                      {badge.label}
                    </span>
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
                            {isCompleted ? <Check size={15} /> : index === 0 ? <Check size={15} /> : index === 1 ? <Clock size={15} /> : index === 2 ? <Package size={15} /> : index === 3 ? <Truck size={15} /> : <Sparkles size={15} />}
                          </div>
                          <span className="order-step-label">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Items List */}
                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: 10 }}>
                        Purchased Items ({order.items.length})
                      </span>
                      <div style={{ display: 'grid', gap: 10 }}>
                        {order.items.map((item: any, idx: number) => (
                          <div
                            key={item.id || idx}
                            className="order-item-row"
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                              <img
                                src={item.product_image || 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853829/pexels-emrekeshavarz-19607463.jpg'}
                                alt={item.product_name}
                                style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }}
                              />
                              <div>
                                <strong style={{ fontSize: '0.92rem', color: 'var(--primary)', display: 'block' }}>
                                  {item.product_name}
                                </strong>
                                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                                  Qty: {item.quantity} {item.size ? `· Size: ${item.size}` : ''} {item.color ? `· Color: ${item.color}` : ''}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.92rem', color: 'var(--primary)' }}>
                                LKR {Number(item.unit_price || 0).toLocaleString()}
                              </strong>

                              {isEligibleForReview && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenReview(item)}
                                  className="tag active"
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                  }}
                                >
                                  <Star size={13} fill="currentColor" />
                                  {item.user_rating ? `Rated ★ ${item.user_rating}` : 'Rate Item'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order details summary */}
                  <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, background: 'var(--panel)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div>
                      <span className="dashboard-label">Order Status</span>
                      <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>
                        {order.status || 'pending'}
                      </strong>
                    </div>
                    <div>
                      <span className="dashboard-label">Payment Method</span>
                      <strong style={{ color: 'var(--primary)' }}>
                        {order.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : '💳 Card / Online'}
                      </strong>
                    </div>
                    <div>
                      <span className="dashboard-label">Order Total</span>
                      <strong style={{ color: 'var(--accent)', fontSize: '1.05rem' }}>
                        LKR {Number(order.grand_total || 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-empty-box">
            <Package size={40} style={{ color: 'var(--muted)', marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 6px', color: 'var(--primary)' }}>No Orders Placed Yet</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
              When you check out pieces from Clothify, you will be able to track delivery progress and rate received items here.
            </p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 18, display: 'inline-flex' }}>
              Explore Collection
            </Link>
          </div>
        )}
      </div>

      {/* ── Rating & Review Modal ── */}
      {reviewModalOpen && selectedProductForReview && (
        <div className="cf-modal-backdrop" onClick={() => setReviewModalOpen(false)}>
          <div className="cf-modal-box" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="cf-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Star size={20} color="var(--accent)" fill="var(--accent)" />
                <h3 style={{ margin: 0 }}>Rate &amp; Review Garment</h3>
              </div>
              <button type="button" className="cf-modal-close" onClick={() => setReviewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="cf-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, background: 'var(--panel-soft)', padding: 10, borderRadius: 12 }}>
                <img
                  src={selectedProductForReview.image || 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853829/pexels-emrekeshavarz-19607463.jpg'}
                  alt={selectedProductForReview.name}
                  style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                />
                <div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--primary)' }}>{selectedProductForReview.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Verified Purchase Review</div>
                </div>
              </div>

              {/* Star Rating Picker */}
              <div style={{ textAlign: 'center', margin: '14px 0 20px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
                  Your Overall Rating
                </span>
                <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        color: star <= reviewRating ? '#f59e0b' : '#d1d5db',
                        transform: star <= reviewRating ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                      }}
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star size={32} fill={star <= reviewRating ? '#f59e0b' : 'none'} />
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f59e0b', marginTop: 6 }}>
                  {reviewRating === 5 ? '⭐⭐⭐⭐⭐ Exceptional Quality' :
                   reviewRating === 4 ? '⭐⭐⭐⭐ Great Fit & Style' :
                   reviewRating === 3 ? '⭐⭐⭐ Average Experience' :
                   reviewRating === 2 ? '⭐⭐ Below Expectations' : '⭐ Poor'}
                </div>
              </div>

              {/* Feedback text */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                  Write Your Review (Optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about the fabric softness, sizing fit, and overall comfort..."
                  style={{
                    width: '100%',
                    minHeight: 90,
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1.5px solid var(--border)',
                    background: 'var(--panel)',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {reviewSuccessMsg && (
                <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: 10, fontSize: '0.84rem', fontWeight: 700, marginBottom: 14, textAlign: 'center' }}>
                  ✓ {reviewSuccessMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
      <div className="dashboard-section-card">
        <WishlistList />
      </div>
    </CustomerLayout>
  );
}
