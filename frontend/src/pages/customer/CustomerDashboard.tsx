import {
  Heart, ShoppingBag, User, Package, ShoppingCart, Star,
  BriefcaseBusiness, ChevronRight, Home, LogOut,
} from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { useAuth } from '../../services/auth.context';
import { CartList } from '../../components/cart/CartList';
import { WishlistList } from '../../components/wishlist/WishlistList';
import * as cartService from '../../services/cart.service';
import * as orderService from '../../services/order.service';

/* ───────── nav config ───────── */
const navItems = [
  { to: '/customer/dashboard', label: 'Dashboard',   icon: Home },
  { to: '/customer/profile',   label: 'My Profile',  icon: User },
  { to: '/customer/orders',    label: 'My Orders',   icon: Package },
  { to: '/customer/cart',      label: 'My Cart',     icon: ShoppingCart },
  { to: '/customer/wishlist',  label: 'My Wishlist', icon: Heart },
  { to: '/products',           label: 'Shop',        icon: ShoppingBag },
];

/* ───────── Sidebar ───────── */
function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <aside style={cs.sidebar}>
      {/* Brand */}
      <div style={cs.brandWrap}>
        <div style={cs.brandBadge}>
          <img src="https://res.cloudinary.com/efjuzuge/image/upload/v1787748753/clothify_3.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <p style={cs.sideLabel}>Customer Portal</p>
          <strong style={cs.sideTitle}>Clothify</strong>
        </div>
      </div>

      {/* Avatar */}
      <div style={cs.avatarBlock}>
        <div style={cs.avatarCircle}>{initials}</div>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{user?.fullName || 'Customer'}</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>{user?.email}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/customer/dashboard'
            ? location.pathname === to
            : to !== '/products' && location.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} end={to === '/customer/dashboard'} style={{ textDecoration: 'none' }}>
              <div style={{ ...cs.navItem, ...(isActive ? cs.navItemActive : {}) }}>
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span>{label}</span>
                {isActive && <ChevronRight size={13} style={{ marginLeft: 'auto' }} />}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
        <button
          type="button"
          onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 11, padding: '10px 14px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s' }}
        >
          <LogOut size={15} /> Logout
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ ...cs.cardIconWrap, background: gradient }}>
          <Icon size={20} style={{ color: 'white' }} />
        </div>
        {countBadge && (
          <span style={{ background: 'rgba(233,30,140,0.1)', color: '#e91e8c', borderRadius: 999, padding: '4px 10px', fontSize: '0.72rem', fontWeight: 800 }}>
            {countBadge}
          </span>
        )}
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#1a0a2e', fontWeight: 700 }}>{title}</h3>
      <p style={{ margin: '0 0 16px', color: '#7c6f8e', fontSize: '0.88rem', lineHeight: 1.6 }}>{description}</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#e91e8c', fontWeight: 700, fontSize: '0.88rem' }}>
        View details <ChevronRight size={14} />
      </div>
    </Link>
  );
}

/* ───────── Customer Dashboard ───────── */
export function CustomerDashboard() {
  const { user } = useAuth();
  const name = user?.fullName || user?.email || 'Customer';

  return (
    <div style={cs.pageShell}>
      <div style={cs.container}>
        <Sidebar />
        <main style={cs.mainPanel}>
          <header style={cs.header}>
            <div>
              <p style={cs.eyebrow}>My Account</p>
              <h1 style={cs.title}>Welcome back, {name.split(' ')[0]}! 👋</h1>
            </div>
          </header>
          <p style={cs.subtitle}>Manage your account, orders, wishlist and shopping activity from one place.</p>

          {/* Overview cards */}
          <div style={cs.overviewGrid}>
            <OverviewCard title="My Orders"   description="View your previous and current orders."    icon={Package}     action="/customer/orders"   gradient="linear-gradient(135deg,#1a0a2e,#2d1b69)" />
            <OverviewCard title="My Cart"     description="View products currently in your cart."     icon={ShoppingCart} action="/customer/cart"     gradient="linear-gradient(135deg,#e91e8c,#ff6b35)" />
            <OverviewCard title="My Wishlist" description="View your saved favourites."                icon={Heart}       action="/customer/wishlist" gradient="linear-gradient(135deg,#7c3aed,#4f46e5)" />
            <OverviewCard title="My Profile"  description="Manage your personal information."          icon={User}        action="/customer/profile"  gradient="linear-gradient(135deg,#00d4aa,#00b4d8)" />
          </div>

          {/* Quick actions */}
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '1.2rem', color: '#1a0a2e', fontWeight: 700 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link to="/products"          style={cs.primaryBtn}>Continue Shopping</Link>
              <Link to="/customer/cart"     style={cs.secondaryBtn}>View Cart</Link>
              <Link to="/customer/wishlist" style={cs.secondaryBtn}>View Wishlist</Link>
              <Link to="/customer/orders"   style={cs.secondaryBtn}>View Orders</Link>
            </div>
          </section>

          {/* Account + highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
            <div style={cs.infoCard}>
              <h3 style={cs.infoCardTitle}>Account Information</h3>
              <div style={{ display: 'grid', gap: 14 }}>
                <div><span style={cs.label}>Full Name</span><strong>{user?.fullName || 'Not set'}</strong></div>
                <div><span style={cs.label}>Email</span><strong style={{ fontSize: '0.9rem' }}>{user?.email}</strong></div>
                <div><span style={cs.label}>Phone</span><strong>{user?.phone || 'Not provided'}</strong></div>
                <div>
                  <span style={cs.label}>Account Type</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', background: '#ede9fe', color: '#5b21b6', borderRadius: 999, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 800 }}>
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            <div style={cs.infoCard}>
              <h3 style={cs.infoCardTitle}>Shopping Highlights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: <Star size={17} />, text: 'Regular offers available', color: '#f59e0b' },
                  { icon: <BriefcaseBusiness size={17} />, text: 'Order tracking enabled', color: '#8b5cf6' },
                  { icon: <ShoppingBag size={17} />, text: 'Free shipping over selected items', color: '#e91e8c' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}18`, display: 'grid', placeItems: 'center', color: item.color, flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.92rem' }}>{item.text}</span>
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
              <p style={cs.eyebrow}>Customer Area</p>
              <h1 style={cs.title}>{title}</h1>
            </div>
            <Link to="/customer/dashboard" style={cs.backBtn}>← Dashboard</Link>
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
  return (
    <CustomerLayout title="My Profile" description="Manage your personal information and settings.">
      <div style={cs.sectionCard}>
        <h3 style={cs.sectionCardTitle}>Personal Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 }}>
          {[
            { label: 'Full Name', value: user?.fullName || 'Not set' },
            { label: 'Email Address', value: user?.email },
            { label: 'Phone Number', value: user?.phone || 'Not provided' },
            { label: 'Account Role', value: user?.role },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '16px 18px', background: '#f8f4ff', borderRadius: 12, border: '1px solid #f0e6ff' }}>
              <span style={cs.label}>{label}</span>
              <strong style={{ color: '#1a0a2e', fontSize: '0.95rem' }}>{value}</strong>
            </div>
          ))}
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

  const statusStyle = (ps: string) => {
    if (ps === 'paid')     return { background: '#dcfce7', color: '#166534' };
    if (ps === 'rejected') return { background: '#fee2e2', color: '#991b1b' };
    return { background: '#fef3c7', color: '#92400e' };
  };

  return (
    <CustomerLayout title="My Orders" description="Track your purchases and recent activity.">
      <div style={cs.sectionCard}>
        {loading ? (
          <p style={{ color: '#7c6f8e', textAlign: 'center', padding: 32 }}>Loading your orders…</p>
        ) : orders.length ? (
          <div style={{ display: 'grid', gap: 14 }}>
            {orders.map((order) => (
              <div key={order.id} style={cs.orderCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#1a0a2e' }}>{order.order_number}</strong>
                    <div style={{ color: '#7c6f8e', fontSize: '0.85rem', marginTop: 3 }}>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <span style={{ ...cs.badge, ...statusStyle(order.payment_status) }}>
                    {order.payment_status === 'pending' ? '⏳ Awaiting approval' : order.payment_status === 'paid' ? '✓ Paid' : '✕ Rejected'}
                  </span>
                </div>
                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
                  <div>
                    <span style={cs.label}>Order Status</span>
                    <strong style={{ color: '#1a0a2e' }}>{order.status === 'pending' ? 'Awaiting approval' : order.status}</strong>
                  </div>
                  <div>
                    <span style={cs.label}>Payment Method</span>
                    <strong>{order.payment_method || 'Not set'}</strong>
                  </div>
                  <div>
                    <span style={cs.label}>Grand Total</span>
                    <strong style={{ color: '#e91e8c', fontSize: '1.05rem' }}>LKR {Number(order.grand_total || 0).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={cs.emptyBox}>
            <Package size={40} style={{ color: '#e0d9f0', marginBottom: 12 }} />
            <p style={{ margin: 0, color: '#7c6f8e', fontWeight: 600 }}>You haven't placed any orders yet.</p>
            <Link to="/products" style={{ ...cs.primaryBtn, marginTop: 16, display: 'inline-flex' }}>Start Shopping</Link>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

/* ───────── Cart Page ───────── */
export function CustomerCartPage() {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [cart, setCart] = useState<any>(null);
  const [cartLoading, setCartLoading] = useState(true);

  const loadCart = async () => {
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, []);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      try {
        const { uploadImage } = await import('../../services/upload.service');
        const url = await uploadImage(dataUrl);
        setSlipImage(url);
      } catch (err) {
        console.error('Upload failed', err);
        alert('Unable to upload image. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceOrder = async () => {
    if (!cart?.items?.length) { alert('Your cart is empty.'); return; }
    if (paymentMethod === 'bank_transfer' && !slipImage) {
      alert('Please upload your bank transfer slip before placing the order.');
      return;
    }
    try {
      setPlacing(true);
      await orderService.createOrder({
        paymentMethod,
        slipImage: paymentMethod === 'bank_transfer' ? slipImage : null,
        notes,
        items: cart.items.map((item: any) => ({
          productId: item.product_id,
          quantity: Number(item.quantity || 0),
          variantId: item.variant_id ?? null,
          unitPrice: Number(item.price_at_time || 0),
        })),
      });
      alert(paymentMethod === 'bank_transfer'
        ? 'Order placed! Please wait for admin approval before your payment is confirmed.'
        : 'Order placed successfully. Your payment is confirmed.');
      window.location.reload();
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Unable to place order');
    } finally {
      setPlacing(false);
    }
  };

  const radioStyle = (selected: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
    border: `2px solid ${selected ? '#e91e8c' : '#f0e6ff'}`,
    background: selected ? 'rgba(233,30,140,0.06)' : '#fff',
    transition: 'all 0.2s', fontWeight: 600, color: '#1a0a2e',
  } as React.CSSProperties);

  return (
    <CustomerLayout title="My Cart" description="Review items and complete your checkout.">
      <div style={{ display: 'grid', gap: 20 }}>
        <div style={cs.sectionCard}>
          {cartLoading ? <p style={{ color: '#7c6f8e', padding: 20 }}>Loading cart…</p> : <CartList />}
        </div>

        {!cartLoading && cart?.items?.length ? (
          <div style={cs.sectionCard}>
            <h3 style={cs.sectionCardTitle}>Checkout</h3>
            <div style={{ display: 'grid', gap: 20 }}>

              {/* Payment method */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: 12, color: '#1a0a2e' }}>Payment Method</label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <label style={radioStyle(paymentMethod === 'card')}>
                    <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{ accentColor: '#e91e8c' }} />
                    💳 Card Payment
                  </label>
                  <label style={radioStyle(paymentMethod === 'bank_transfer')}>
                    <input type="radio" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} style={{ accentColor: '#e91e8c' }} />
                    🏦 Bank Transfer
                  </label>
                </div>
              </div>

              {paymentMethod === 'bank_transfer' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: 10, color: '#1a0a2e' }}>Upload Bank Transfer Slip</label>
                  <input
                    type="file" accept="image/*" onChange={handleImageUpload}
                    style={{ padding: 12, border: '2px dashed #e0d9f0', borderRadius: 12, width: '100%', background: '#f8f4ff', cursor: 'pointer' }}
                  />
                  {slipImage && (
                    <img src={slipImage} alt="Transfer slip preview" style={{ marginTop: 14, maxWidth: 220, borderRadius: 12, border: '2px solid #f0e6ff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: 10, color: '#1a0a2e' }}>Order Notes <span style={{ color: '#b5aac7', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions…"
                  style={{ width: '100%', minHeight: 90, borderRadius: 12, border: '1.5px solid #f0e6ff', resize: 'vertical', padding: '12px 14px', background: '#f8f4ff', color: '#1a0a2e', fontSize: '0.93rem', fontFamily: 'inherit', boxSizing: 'border-box' as const }}
                />
              </div>

              {/* Totals */}
              <div style={{ background: '#f8f4ff', border: '1.5px solid #f0e6ff', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: '#7c6f8e' }}>
                  <span>Subtotal</span>
                  <strong style={{ color: '#1a0a2e' }}>LKR {Number(cart.subtotal || 0).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, color: '#7c6f8e' }}>
                  <span>Shipping</span>
                  <strong style={{ color: '#1a0a2e' }}>LKR 250</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#1a0a2e', borderTop: '1.5px solid #f0e6ff', paddingTop: 14 }}>
                  <span>Total</span>
                  <span style={{ color: '#e91e8c' }}>LKR {(Number(cart.subtotal || 0) + 250).toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                style={{ ...cs.primaryBtn, width: '100%', justifyContent: 'center', opacity: placing ? 0.7 : 1, fontSize: '1rem', padding: '14px 24px' }}
                onClick={handlePlaceOrder}
                disabled={placing}
              >
                {placing ? '⏳ Placing order…' : '🛍️ Place Order'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </CustomerLayout>
  );
}

/* ───────── Wishlist Page ───────── */
export function CustomerWishlistPage() {
  return (
    <CustomerLayout title="My Wishlist" description="Keep track of your favorite pieces.">
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
