import { ArrowRight, BriefcaseBusiness, Heart, ShoppingBag, User, Package, ShoppingCart, Star } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react';
import { useAuth } from '../../services/auth.context';
import { CartList } from '../../components/cart/CartList';
import { WishlistList } from '../../components/wishlist/WishlistList';
import * as cartService from '../../services/cart.service';
import * as orderService from '../../services/order.service';

const navItems = [
  { to: '/customer/dashboard', label: 'Customer Dashboard' },
  { to: '/customer/profile', label: 'My Profile' },
  { to: '/customer/orders', label: 'My Orders' },
  { to: '/customer/cart', label: 'My Cart' },
  { to: '/customer/wishlist', label: 'My Wishlist' },
  { to: '/products', label: 'Shop' },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brandWrap}>
        <div style={styles.brandBadge}>F</div>
        <div>
          <p style={styles.sideLabel}>Customer Portal</p>
          <strong style={styles.sideTitle}>Clothify</strong>
        </div>
      </div>

      <nav style={styles.navList}>
        {navItems.map(({ to, label }) => {
          const isActive = location.pathname === to || (to !== '/customer/dashboard' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/customer/dashboard'}
              style={{
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              }}
            >
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div style={styles.sidebarFooter}>
        <Link to="/products" style={styles.sidebarButton}>Continue shopping</Link>
      </div>
    </aside>
  );
}

function OverviewCard({ title, description, icon: Icon, action }: { title: string; description: string; icon: typeof User; action: string }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <div style={styles.iconWrap}><Icon size={22} /></div>
        <span style={styles.badge}>Active</span>
      </div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardText}>{description}</p>
      <Link to={action} style={styles.cardLink}>View details <ArrowRight size={16} /></Link>
    </div>
  );
}

export function CustomerDashboard() {
  const { user, logout } = useAuth();
  const name = user?.fullName || user?.email || 'Customer';

  return (
    <div style={styles.pageShell}>
      <div style={styles.container}>
        <Sidebar />

        <main style={styles.mainPanel}>
          <header style={styles.header}>
            <div>
              <p style={styles.eyebrow}>My account</p>
              <h1 style={styles.title}>Welcome back, {name}!</h1>
            </div>
            <button type="button" style={styles.logoutButton} onClick={logout}>Logout</button>
          </header>

          <p style={styles.subtitle}>Manage your account, orders, wishlist and shopping activity from one place.</p>

          <div style={styles.grid}>
            <OverviewCard title="My Orders" description="View your previous and current orders." icon={Package} action="/customer/orders" />
            <OverviewCard title="My Cart" description="View products currently in your shopping cart." icon={ShoppingCart} action="/customer/cart" />
            <OverviewCard title="My Wishlist" description="View your saved products and favorites." icon={Heart} action="/customer/wishlist" />
            <OverviewCard title="My Profile" description="Manage your personal information and settings." icon={User} action="/customer/profile" />
          </div>

          <section style={styles.quickActionsSection}>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
            <div style={styles.quickActions}>
              <Link to="/products" style={styles.primaryAction}>Continue Shopping</Link>
              <Link to="/customer/cart" style={styles.secondaryAction}>View Cart</Link>
              <Link to="/customer/wishlist" style={styles.secondaryAction}>View Wishlist</Link>
              <Link to="/customer/orders" style={styles.secondaryAction}>View Orders</Link>
            </div>
          </section>

          <section style={styles.summarySection}>
            <div style={styles.summaryInfo}>
              <h3 style={styles.summaryTitle}>Account Information</h3>
              <div style={styles.infoGrid}>
                <div><span style={styles.label}>Name</span><strong>{user?.fullName || 'Not set'}</strong></div>
                <div><span style={styles.label}>Email</span><strong>{user?.email}</strong></div>
                <div><span style={styles.label}>Phone</span><strong>{user?.phone || 'Not provided'}</strong></div>
                <div><span style={styles.label}>Role</span><strong>{user?.role}</strong></div>
              </div>
            </div>
            <div style={styles.summaryInfo}>
              <h3 style={styles.summaryTitle}>Shopping Highlights</h3>
              <div style={styles.highlightList}>
                <div style={styles.highlightItem}><Star size={16} /> Regular offers available</div>
                <div style={styles.highlightItem}><BriefcaseBusiness size={16} /> Order tracking enabled</div>
                <div style={styles.highlightItem}><ShoppingBag size={16} /> Free shipping over selected items</div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export function CustomerProfilePage() {
  const { user } = useAuth();
  return (
    <CustomerSectionLayout title="My Profile" description="Manage your personal information." actionHref="/customer/dashboard">
      <div style={styles.sectionCard}>
        <div style={styles.infoGrid}>
          <div><span style={styles.label}>Full Name</span><strong>{user?.fullName || 'Not set'}</strong></div>
          <div><span style={styles.label}>Email</span><strong>{user?.email}</strong></div>
          <div><span style={styles.label}>Phone</span><strong>{user?.phone || 'Not provided'}</strong></div>
          <div><span style={styles.label}>Role</span><strong>{user?.role}</strong></div>
        </div>
      </div>
    </CustomerSectionLayout>
  );
}

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

  return (
    <CustomerSectionLayout title="My Orders" description="Track your purchases and recent activity." actionHref="/customer/dashboard">
      <div style={styles.sectionCard}>
        {loading ? (
          <p style={styles.emptyState}>Loading your orders…</p>
        ) : orders.length ? (
          <div style={{ display: 'grid', gap: '14px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  <div>
                    <strong>{order.order_number}</strong>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span style={{ ...styles.badge, background: order.payment_status === 'paid' ? '#dcfce7' : order.payment_status === 'failed' ? '#fee2e2' : '#fef3c7', color: order.payment_status === 'paid' ? '#166534' : order.payment_status === 'failed' ? '#991b1b' : '#92400e' }}>
                      {order.payment_status === 'pending' ? 'Awaiting admin approval' : order.payment_status}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div><span style={styles.label}>Status</span><strong>{order.status === 'pending' ? 'Awaiting admin approval' : order.status}</strong></div>
                  <div><span style={styles.label}>Payment Method</span><strong>{order.payment_method || 'Not set'}</strong></div>
                  <div><span style={styles.label}>Total</span><strong>LKR {Number(order.grand_total || 0).toLocaleString()}</strong></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.emptyState}>You have not placed any orders yet.</p>
        )}
      </div>
    </CustomerSectionLayout>
  );
}

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

  useEffect(() => {
    loadCart();
  }, []);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      try {
        // upload to backend -> cloudinary
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
    if (!cart || !cart.items || !cart.items.length) {
      alert('Your cart is empty.');
      return;
    }

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
        ? 'Order placed successfully. Please wait for admin approval before your payment is confirmed.'
        : 'Order placed successfully. Your payment is confirmed.' );
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || error?.message || 'Unable to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <CustomerSectionLayout title="My Cart" description="Review items saved for checkout." actionHref="/customer/dashboard">
      <div style={{ display: 'grid', gap: '20px' }}>
        <div style={styles.sectionCard}>
          {cartLoading ? <p style={styles.emptyState}>Loading cart…</p> : <CartList />}
        </div>

        {!cartLoading && cart && cart.items && cart.items.length ? (
          <div style={styles.sectionCard}>
            <h3 style={styles.cardTitle}>Checkout</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px' }}>Payment method</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                    Card Payment
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <input type="radio" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
                    Bank Transfer
                  </label>
                </div>
              </div>

              {paymentMethod === 'bank_transfer' ? (
                <div>
                  <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px' }}>Upload bank transfer slip</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                  {slipImage ? <img src={slipImage} alt="Transfer slip preview" style={{ marginTop: '12px', maxWidth: '220px', borderRadius: '10px', border: '1px solid #e5e7eb' }} /> : null}
                </div>
              ) : null}

              <div>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px' }}>Order notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note" style={{ width: '100%', minHeight: '90px', borderRadius: '10px', border: '1px solid #d1d5db', resize: 'vertical', padding: '10px' }} />
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>LKR {Number(cart.subtotal || 0).toLocaleString()}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><strong>LKR 250</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}><span>Total</span><strong>LKR {Number((Number(cart.subtotal || 0) + 250)).toLocaleString()}</strong></div>
              </div>

              <button type="button" style={{ ...styles.primaryAction, opacity: placing ? 0.7 : 1 }} onClick={handlePlaceOrder} disabled={placing}>
                {placing ? 'Placing order…' : 'Place Order'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </CustomerSectionLayout>
  );
}

export function CustomerWishlistPage() {
  return (
    <CustomerSectionLayout title="My Wishlist" description="Keep track of your favorite pieces." actionHref="/customer/dashboard">
      <div style={styles.sectionCard}>
        <WishlistList />
      </div>
    </CustomerSectionLayout>
  );
}

function CustomerSectionLayout({ title, description, actionHref, children }: { title: string; description: string; actionHref: string; children: ReactNode }) {
  return (
    <div style={styles.pageShell}>
      <div style={styles.container}>
        <Sidebar />
        <main style={styles.mainPanel}>
          <header style={styles.header}>
            <div>
              <p style={styles.eyebrow}>Customer area</p>
              <h1 style={styles.title}>{title}</h1>
            </div>
            <Link to={actionHref} style={styles.sectionButton}>Back to dashboard</Link>
          </header>
          <p style={styles.subtitle}>{description}</p>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  pageShell: { minHeight: '100vh', background: '#f5f2ee', padding: '32px 20px 60px' },
  container: { maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '28px', alignItems: 'flex-start' },
  sidebar: { width: '260px', background: '#fff', borderRadius: '22px', padding: '18px 16px', boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)', position: 'sticky', top: '24px' },
  brandWrap: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  brandBadge: { width: '42px', height: '42px', borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#fff', background: '#111827', fontWeight: 800 },
  sideLabel: { margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.08em' },
  sideTitle: { fontSize: '1.1rem', color: '#111827' },
  navList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  navLink: { textDecoration: 'none', display: 'block', color: '#1f2937', padding: '10px 12px', borderRadius: '12px', fontWeight: 600 },
  navLinkActive: { background: '#eef2ff', color: '#1d4ed8' },
  sidebarFooter: { marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '18px' },
  sidebarButton: { display: 'inline-flex', justifyContent: 'center', width: '100%', background: '#111827', color: '#fff', textDecoration: 'none', borderRadius: '10px', padding: '11px 12px', fontWeight: 700 },
  mainPanel: { flex: 1, background: '#fff', borderRadius: '22px', boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)', padding: '28px 28px 32px' },
  header: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', marginBottom: '8px' },
  eyebrow: { margin: 0, color: '#d97706', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em', fontSize: '0.76rem' },
  title: { margin: '6px 0 0', fontSize: 'clamp(2rem, 3vw, 2.8rem)', color: '#111827' },
  subtitle: { margin: '0 0 26px', color: '#4b5563', fontSize: '1rem' },
  logoutButton: { border: 'none', borderRadius: '10px', background: '#111827', color: '#fff', fontWeight: 700, padding: '10px 16px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' },
  card: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  iconWrap: { width: '42px', height: '42px', background: '#e0f2fe', borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#0369a1' },
  badge: { background: '#dcfce7', color: '#166534', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, padding: '6px 9px' },
  cardTitle: { margin: 0, fontSize: '1.2rem', color: '#111827' },
  cardText: { margin: 0, color: '#4b5563', lineHeight: 1.6 },
  cardLink: { textDecoration: 'none', color: '#111827', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: 'auto' },
  quickActionsSection: { marginBottom: '28px' },
  sectionTitle: { margin: '0 0 14px', fontSize: '1.4rem', color: '#111827' },
  quickActions: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
  primaryAction: { background: '#111827', color: '#fff', borderRadius: '12px', padding: '12px 18px', fontWeight: 700, textDecoration: 'none' },
  secondaryAction: { background: '#f3f4f6', color: '#111827', borderRadius: '12px', padding: '12px 18px', fontWeight: 700, textDecoration: 'none' },
  summarySection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' },
  summaryInfo: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '20px' },
  summaryTitle: { margin: '0 0 16px', fontSize: '1.15rem', color: '#111827' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' },
  label: { display: 'block', color: '#6b7280', fontSize: '0.75rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  highlightList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  highlightItem: { display: 'flex', alignItems: 'center', gap: '10px', color: '#1f2937', fontWeight: 600 },
  sectionCard: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '20px', marginTop: '18px' },
  emptyState: { margin: 0, color: '#4b5563', fontSize: '1rem' },
  sectionButton: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: '#111827', color: '#fff', borderRadius: '10px', padding: '10px 14px', fontWeight: 700 },
};
