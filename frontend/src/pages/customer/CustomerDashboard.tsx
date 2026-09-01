import {
  Heart, ShoppingBag, User, Package, ShoppingCart, Star,
  ChevronRight, Home, LogOut,
  Clock, Truck, Check, Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../../services/auth.context';
import { CartList } from '../../components/cart/CartList';
import { WishlistList } from '../../components/wishlist/WishlistList';
import * as orderService from '../../services/order.service';

/* ───────── nav config ───────── */
const navItems = [
  { to: '/customer/dashboard', label: 'Dashboard',   icon: Home },
  { to: '/customer/profile',   label: 'My Profile',  icon: User },
  { to: '/customer/orders',    label: 'My Orders',   icon: Package },
  { to: '/customer/cart',      label: 'My Cart',     icon: ShoppingCart },
  { to: '/customer/wishlist',  label: 'My Wishlist', icon: Heart },
  { to: '/products',           label: 'Shop All',    icon: ShoppingBag },
];

/* ───────── Sidebar ───────── */
function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <aside style={cs.sidebar}>
      {/* Brand */}
      <div style={cs.brandWrap}>
        <div style={cs.brandBadge}>
          <img
            src="https://res.cloudinary.com/efjuzuge/image/upload/v1787922904/icon_only.png"
            alt="Clothify"
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }}
          />
        </div>
        <div>
          <p style={cs.sideLabel}>Member Portal</p>
          <strong style={cs.sideTitle}>Clothify Club</strong>
        </div>
      </div>

      {/* Avatar Block */}
      <div style={cs.avatarBlock}>
        <div style={cs.avatarCircle}>{initials}</div>
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
              <div style={{ ...cs.navItem, ...(isActive ? cs.navItemActive : {}) }}>
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 12,
            padding: '11px 14px',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.88rem',
            transition: 'all 0.2s',
          }}
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
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
    <Link to={action} style={cs.overviewCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ ...cs.cardIconWrap, background: gradient }}>
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
    <div style={cs.pageShell}>
      <div style={cs.container}>
        <Sidebar />
        <main style={cs.mainPanel}>
          <header style={cs.header}>
            <div>
              <p style={cs.eyebrow}>VIP Member Portal</p>
              <h1 style={cs.title}>Welcome back, {name.split(' ')[0]}! ✨</h1>
            </div>
            <Link to="/products" className="btn btn-primary" style={{ fontSize: '0.86rem', padding: '9px 18px' }}>
              <ShoppingBag size={15} /> Explore Collection
            </Link>
          </header>
          <p style={cs.subtitle}>Manage your orders, saved wishlists, delivery address, and account details in one place.</p>

          {/* Overview cards */}
          <div style={cs.overviewGrid}>
            <OverviewCard title="My Orders"   description="Track packages and purchase history."    icon={Package}     action="/customer/orders"   gradient="linear-gradient(135deg,#1a0a2e,#2d1b69)" />
            <OverviewCard title="Shopping Bag" description="Items currently queued in your cart."    icon={ShoppingCart} action="/customer/cart"     gradient="linear-gradient(135deg,#e91e8c,#ff6b35)" />
            <OverviewCard title="Saved Wishlist" description="Browse saved favorite pieces."       icon={Heart}       action="/customer/wishlist" gradient="linear-gradient(135deg,#7c3aed,#4f46e5)" />
            <OverviewCard title="Profile Details" description="Update your personal details & address." icon={User}    action="/customer/profile"  gradient="linear-gradient(135deg,#00d4aa,#00b4d8)" />
          </div>

          {/* Quick actions */}
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 800 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link to="/products"          style={cs.primaryBtn}>Shop New Arrivals</Link>
              <Link to="/customer/cart"     style={cs.secondaryBtn}>View Cart</Link>
              <Link to="/customer/wishlist" style={cs.secondaryBtn}>View Wishlist</Link>
              <Link to="/customer/orders"   style={cs.secondaryBtn}>Track Orders</Link>
            </div>
          </section>

          {/* Account + highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
            <div style={cs.infoCard}>
              <h3 style={cs.infoCardTitle}>Account Information</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div><span style={cs.label}>Full Name</span><strong style={{ color: 'var(--primary)' }}>{user?.fullName || 'Not configured'}</strong></div>
                <div><span style={cs.label}>Email Address</span><strong style={{ fontSize: '0.88rem', color: 'var(--primary)' }}>{user?.email}</strong></div>
                <div><span style={cs.label}>Phone Number</span><strong style={{ color: 'var(--primary)' }}>{user?.phone || 'Not provided'}</strong></div>
                <div>
                  <span style={cs.label}>Membership Status</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', background: '#ede9fe', color: '#5b21b6', borderRadius: 999, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 800 }}>
                    VIP Clothify Member
                  </span>
                </div>
              </div>
            </div>

            <div style={cs.infoCard}>
              <h3 style={cs.infoCardTitle}>Clothify Member Perks</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: <Star size={17} />, text: '15% Member Discount (Code: WELCOME15)', color: '#f59e0b' },
                  { icon: <Truck size={17} />, text: 'Free Express Delivery on orders over $50', color: '#00d4aa' },
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
    <div style={cs.pageShell}>
      <div style={cs.container}>
        <Sidebar />
        <main style={cs.mainPanel}>
          <header style={cs.header}>
            <div>
              <p style={cs.eyebrow}>Customer Dashboard</p>
              <h1 style={cs.title}>{title}</h1>
            </div>
            <Link to="/customer/dashboard" style={cs.backBtn}>← Dashboard Home</Link>
          </header>
          <p style={cs.subtitle}>{description}</p>
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
        <div style={cs.sectionCard}>
          <h3 style={cs.sectionCardTitle}>Edit Contact Details</h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={cs.label}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--panel)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={cs.label}>Email Address (Read-only)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--panel-soft)', color: 'var(--muted)' }}
              />
            </div>

            <div>
              <label style={cs.label}>Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--panel)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={cs.label}>Default Shipping Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--panel)', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {savedSuccess && (
              <div style={{ color: 'var(--accent-3)', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={16} /> Profile changes saved successfully!
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: 6 }}>
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Overview Summary */}
        <div style={cs.sectionCard}>
          <h3 style={cs.sectionCardTitle}>Membership Summary</h3>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ padding: '14px 16px', background: 'var(--panel)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <span style={cs.label}>Account ID</span>
              <strong style={{ color: 'var(--primary)', fontSize: '0.88rem' }}>{user?.id || 'USR-2026-VIP'}</strong>
            </div>

            <div style={{ padding: '14px 16px', background: 'var(--panel)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <span style={cs.label}>Security Verification</span>
              <strong style={{ color: 'var(--accent-3)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} /> Email Verified &amp; Protected
              </strong>
            </div>

            <div style={{ padding: '14px 16px', background: 'var(--panel)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <span style={cs.label}>Member Benefit Level</span>
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

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await orderService.getMyOrders();
        if (mounted) setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const statusBadge = (ps: string, status?: string) => {
    const normalizedPayment = String(ps || '').toLowerCase();
    const normalizedStatus = String(status || '').toLowerCase();

    if (normalizedPayment === 'paid' || normalizedStatus === 'confirmed' || normalizedStatus === 'processing' || normalizedStatus === 'shipped' || normalizedStatus === 'delivered') {
      return { background: '#dcfce7', color: '#166534', label: '✓ Payment Approved' };
    }
    if (normalizedPayment === 'failed' || normalizedPayment === 'rejected' || normalizedStatus === 'cancelled') {
      return { background: '#fee2e2', color: '#991b1b', label: '✕ Payment Declined' };
    }
    return { background: '#fef3c7', color: '#92400e', label: '⏳ Verification Pending' };
  };

  const getOrderProgress = (order: any) => {
    const status = String(order?.status || '').toLowerCase();
    const paymentStatus = String(order?.payment_status || '').toLowerCase();

    if (status === 'cancelled' || paymentStatus === 'failed' || paymentStatus === 'rejected') {
      return { currentStep: -1, width: '0%', label: 'Order Cancelled' };
    }
    if (status === 'pending' || paymentStatus === 'pending') {
      return { currentStep: 1, width: '25%', label: 'Verification Pending' };
    }
    if (status === 'confirmed' || paymentStatus === 'paid') {
      return { currentStep: 2, width: '50%', label: 'Payment Confirmed' };
    }
    if (status === 'processing') {
      return { currentStep: 3, width: '75%', label: 'Processing' };
    }
    if (status === 'shipped') {
      return { currentStep: 4, width: '100%', label: 'Shipped' };
    }
    if (status === 'delivered') {
      return { currentStep: 5, width: '100%', label: 'Delivered' };
    }

    return { currentStep: 1, width: '25%', label: 'Verification Pending' };
  };

  return (
    <CustomerLayout title="My Orders &amp; Delivery Tracking" description="Track purchases, delivery timelines, and payment receipts.">
      <div style={cs.sectionCard}>
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
                { key: 'placed', label: 'Order Placed', completed: true },
                { key: 'verification', label: progress.currentStep >= 2 ? 'Payment Confirmed' : 'Verification', completed: progress.currentStep >= 2 },
                { key: 'processing', label: 'Processing', completed: progress.currentStep >= 3 },
                { key: 'delivery', label: progress.currentStep >= 4 ? 'Shipped' : 'Delivered', completed: progress.currentStep >= 4 },
              ];

              return (
                <div key={order.id} style={cs.orderCard}>
                  {/* Order header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
                        Order #{order.order_number}
                      </strong>
                      <div style={{ color: 'var(--muted)', fontSize: '0.84rem', marginTop: 3 }}>
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <span style={{ ...cs.badge, background: badge.background, color: badge.color }}>
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
                            {isCompleted ? <Check size={16} /> : index === 0 ? <Check size={16} /> : index === 1 ? <Clock size={16} /> : index === 2 ? <Package size={16} /> : <Truck size={16} />}
                          </div>
                          <span className="order-step-label">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order details grid */}
                  <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, background: 'var(--panel-soft)', padding: 14, borderRadius: 12 }}>
                    <div>
                      <span style={cs.label}>Order Status</span>
                      <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>
                        {order.status || 'pending'}
                      </strong>
                    </div>
                    <div>
                      <span style={cs.label}>Payment Mode</span>
                      <strong style={{ color: 'var(--primary)' }}>
                        {order.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : '💳 Card / Online'}
                      </strong>
                    </div>
                    <div>
                      <span style={cs.label}>Order Grand Total</span>
                      <strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>
                        LKR {Number(order.grand_total || 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={cs.emptyBox}>
            <Package size={40} style={{ color: 'var(--muted)', marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 6px', color: 'var(--primary)' }}>No Orders Placed Yet</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
              When you check out pieces from Clothify, you will be able to track delivery progress here.
            </p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 18, display: 'inline-flex' }}>
              Explore Collection
            </Link>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

/* ───────── Cart Page ───────── */
export function CustomerCartPage() {
  return (
    <CustomerLayout title="My Shopping Bag" description="Review selected items, apply promo codes, and complete your order.">
      <div style={cs.sectionCard}>
        <CartList />
      </div>
    </CustomerLayout>
  );
}

/* ───────── Wishlist Page ───────── */
export function CustomerWishlistPage() {
  return (
    <CustomerLayout title="My Saved Wishlist" description="Keep track of pieces you love and move them directly to your bag.">
      <div style={cs.sectionCard}>
        <WishlistList />
      </div>
    </CustomerLayout>
  );
}


/* ───────── Styles ───────── */
const cs = {
  pageShell: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f4ff 0%, #f0e6ff 100%)',
    padding: '28px 20px 60px',
  } as React.CSSProperties,
  container: {
    maxWidth: 1300, margin: '0 auto',
    display: 'flex', gap: 26, alignItems: 'flex-start',
  } as React.CSSProperties,

  /* Sidebar */
  sidebar: {
    width: 250, flexShrink: 0,
    background: 'linear-gradient(180deg, #e91e8c 0%, #c0156f 40%, #7c1c8a 100%)',
    borderRadius: 22, padding: '22px 16px',
    boxShadow: '0 20px 50px rgba(233,30,140,0.28)',
    position: 'sticky', top: 24,
    display: 'flex', flexDirection: 'column', gap: 0,
    minHeight: 600,
  } as React.CSSProperties,
  brandWrap: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 } as React.CSSProperties,
  brandBadge: {
    width: 40, height: 40, borderRadius: 11,
    overflow: 'hidden', background: 'rgba(255,255,255,0.2)',
    flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
  } as React.CSSProperties,
  sideLabel: { margin: 0, fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em' } as React.CSSProperties,
  sideTitle: { fontSize: '1.05rem', color: 'white', fontWeight: 800 } as React.CSSProperties,
  avatarBlock: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(255,255,255,0.12)', borderRadius: 14,
    padding: '14px 14px', marginBottom: 18,
    border: '1px solid rgba(255,255,255,0.18)',
  } as React.CSSProperties,
  avatarCircle: {
    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(255,255,255,0.25)',
    color: 'white', fontWeight: 900, fontSize: '0.9rem',
    display: 'grid', placeItems: 'center',
    border: '2px solid rgba(255,255,255,0.4)',
  } as React.CSSProperties,
  navItem: {
    display: 'flex', alignItems: 'center', gap: 11,
    padding: '10px 13px', borderRadius: 11,
    color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
  navItemActive: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.3)',
  } as React.CSSProperties,

  /* Main panel */
  mainPanel: {
    flex: 1, background: '#fff',
    borderRadius: 22, boxShadow: '0 8px 32px rgba(26,10,46,0.08)',
    padding: '28px 32px 36px', minWidth: 0,
  } as React.CSSProperties,
  header: {
    display: 'flex', justifyContent: 'space-between', gap: 16,
    alignItems: 'flex-start', marginBottom: 8,
    paddingBottom: 20, borderBottom: '1px solid #f0e6ff',
  } as React.CSSProperties,
  eyebrow: {
    margin: 0, color: '#e91e8c', textTransform: 'uppercase',
    fontWeight: 800, letterSpacing: '0.1em', fontSize: '0.72rem',
  } as React.CSSProperties,
  title: {
    margin: '8px 0 0', fontSize: 'clamp(1.8rem,3vw,2.4rem)',
    color: '#1a0a2e', fontWeight: 800, letterSpacing: '-0.03em',
  } as React.CSSProperties,
  subtitle: { margin: '8px 0 26px', color: '#7c6f8e', fontSize: '0.95rem' } as React.CSSProperties,
  backBtn: {
    display: 'inline-flex', alignItems: 'center',
    background: '#f8f4ff', color: '#4c3a8a',
    border: '1.5px solid #f0e6ff', borderRadius: 12,
    padding: '10px 16px', fontWeight: 700, fontSize: '0.88rem',
    textDecoration: 'none', transition: 'all 0.2s', flexShrink: 0,
  } as React.CSSProperties,

  /* Overview cards */
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
    gap: 16, marginBottom: 28,
  } as React.CSSProperties,
  overviewCard: {
    background: '#fff', border: '1.5px solid #f0e6ff',
    borderRadius: 18, padding: '20px 18px',
    textDecoration: 'none', display: 'block',
    transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
    boxShadow: '0 4px 16px rgba(26,10,46,0.05)',
  } as React.CSSProperties,
  cardIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    display: 'grid', placeItems: 'center',
    boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
  } as React.CSSProperties,

  /* Buttons */
  primaryBtn: {
    background: 'linear-gradient(135deg,#e91e8c,#ff6b35)',
    color: '#fff', borderRadius: 12,
    padding: '12px 20px', fontWeight: 700,
    textDecoration: 'none', border: 'none', cursor: 'pointer',
    fontSize: '0.92rem', boxShadow: '0 4px 14px rgba(233,30,140,0.3)',
    transition: 'all 0.22s', display: 'inline-flex', alignItems: 'center', gap: 8,
  } as React.CSSProperties,
  secondaryBtn: {
    background: '#f8f4ff', color: '#4c3a8a',
    borderRadius: 12, padding: '12px 16px',
    fontWeight: 700, textDecoration: 'none',
    border: '1.5px solid #f0e6ff', cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s',
    display: 'inline-flex', alignItems: 'center', gap: 8,
  } as React.CSSProperties,

  /* Cards */
  infoCard: {
    background: '#faf8ff', border: '1.5px solid #f0e6ff',
    borderRadius: 18, padding: '22px 20px',
  } as React.CSSProperties,
  infoCardTitle: { margin: '0 0 18px', fontSize: '1.05rem', color: '#1a0a2e', fontWeight: 700 } as React.CSSProperties,
  sectionCard: {
    background: '#faf8ff', border: '1.5px solid #f0e6ff',
    borderRadius: 18, padding: '22px 20px',
  } as React.CSSProperties,
  sectionCardTitle: { margin: '0 0 18px', fontSize: '1.1rem', color: '#1a0a2e', fontWeight: 700 } as React.CSSProperties,
  orderCard: {
    background: '#fff', border: '1.5px solid #f0e6ff',
    borderRadius: 14, padding: '18px 20px',
    transition: 'box-shadow 0.2s',
    boxShadow: '0 2px 10px rgba(26,10,46,0.04)',
  } as React.CSSProperties,

  /* Misc */
  badge: { display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700 } as React.CSSProperties,
  label: { display: 'block', color: '#b5aac7', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 } as React.CSSProperties,
  emptyBox: {
    padding: '40px 24px', borderRadius: 14,
    background: '#f8f4ff', border: '2px dashed #f0e6ff',
    color: '#7c6f8e', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  } as React.CSSProperties,
};
