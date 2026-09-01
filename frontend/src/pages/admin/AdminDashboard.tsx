import {
  ArrowRight, PackageCheck, ShoppingBag, Trash2, Users,
  CreditCard, LayoutDashboard, Package, ChevronRight, Search,
  Eye, ExternalLink, Plus, LogOut,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth.context';
import * as adminService from '../../services/admin.service';
import * as productService from '../../services/product.service';
import type { Category, Product } from '../../types/product.types';

/* ────────── nav config ────────── */
const navItems = [
  { to: '/admin/dashboard', label: 'Overview',   icon: LayoutDashboard },
  { to: '/admin/orders',    label: 'Orders',     icon: Package },
  { to: '/admin/payments',  label: 'Payments',   icon: CreditCard },
  { to: '/admin/customers', label: 'Customers',  icon: Users },
  { to: '/admin/catalog',   label: 'Catalog',    icon: ShoppingBag },
];

/* ────────── shell ────────── */
function AdminShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={s.pageShell}>
      <div style={s.container}>

        {/* ── Sidebar ── */}
        <aside style={s.sidebar}>
          <div style={s.brandWrap}>
            <div style={s.brandBadge}>
              <img
                src="https://res.cloudinary.com/efjuzuge/image/upload/v1787922904/icon_only.png"
                alt="Clothify"
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }}
              />
            </div>
            <div>
              <p style={s.sideLabel}>Management Suite</p>
              <strong style={s.sideTitle}>Clothify Admin</strong>
            </div>
          </div>

          {/* User quick card */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.06)',
              marginBottom: 18,
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'var(--grad-accent)',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.8rem',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              {(user?.fullName || user?.email || 'A').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName || 'Administrator'}
              </div>
              <div style={{ color: 'var(--accent-3)', fontSize: '0.72rem', fontWeight: 700 }}>
                ● Full Access
              </div>
            </div>
          </div>

          <nav style={s.navList}>
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = to === '/admin/dashboard'
                ? location.pathname === to
                : location.pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  end={to === '/admin/dashboard'}
                  to={to}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ ...s.navItem, ...(isActive ? s.navItemActive : {}) }}>
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    <span>{label}</span>
                    {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                  </div>
                </NavLink>
              );
            })}
          </nav>

          <div style={s.sideFooter}>
            <Link to="/products" style={s.visitStoreBtn}>
              <ShoppingBag size={15} /> Storefront View
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{
                ...s.visitStoreBtn,
                marginTop: 8,
                background: 'rgba(239,68,68,0.12)',
                borderColor: 'rgba(239,68,68,0.25)',
                color: '#fca5a5',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={s.mainPanel}>
          <header style={s.header}>
            <div>
              <p style={s.eyebrow}>Storefront Operations</p>
              <h1 style={s.title}>{title}</h1>
              <p style={s.subtitle}>{subtitle}</p>
            </div>
            <div style={s.headerActions}>
              <Link to="/products" className="btn btn-outline" style={{ fontSize: '0.84rem', padding: '8px 14px' }}>
                <ExternalLink size={14} /> Shop
              </Link>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

/* ────────── Stat Card ────────── */
function StatCard({
  title, value, subtitle, icon: Icon, gradient,
}: {
  title: string; value: string; subtitle: string;
  icon: typeof ShoppingBag; gradient: string;
}) {
  return (
    <div style={{ ...s.statCard, background: gradient }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ ...s.statIcon, background: 'rgba(255,255,255,0.22)' }}>
          <Icon size={20} style={{ color: 'white' }} />
        </div>
        <ArrowRight size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
      </div>
      <div style={s.statValue}>{value}</div>
      <div style={s.statTitle}>{title}</div>
      <div style={s.statSubtitle}>{subtitle}</div>
    </div>
  );
}

/* ────────── Admin Dashboard ────────── */
export function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<{
    totalUsers?: number;
    totalCustomers?: number;
    totalProducts?: number;
    totalOrders?: number;
    recentCustomers?: Array<{ id: string; full_name: string; email: string; role: string; created_at: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await adminService.getSummary();
        if (mounted) setSummary(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <AdminShell title="Dashboard" subtitle={`Welcome back, ${user?.fullName || 'Admin'} 👋`}>

      {/* Stats */}
      <div style={s.statsGrid}>
        <StatCard title="Total Accounts" value={String(summary?.totalUsers ?? 0)} subtitle="Registered user profiles" icon={Users} gradient="linear-gradient(135deg, #1a0a2e 0%, #2d1b69 100%)" />
        <StatCard title="Customers" value={String(summary?.totalCustomers ?? 0)} subtitle="Active shoppers" icon={Users} gradient="linear-gradient(135deg, #e91e8c 0%, #ff6b35 100%)" />
        <StatCard title="Catalog Styles" value={String(summary?.totalProducts ?? 0)} subtitle="Live store products" icon={ShoppingBag} gradient="linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)" />
        <StatCard title="Orders Placed" value={String(summary?.totalOrders ?? 0)} subtitle="Processed store orders" icon={PackageCheck} gradient="linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" />
      </div>

      {/* Lower grid */}
      <div style={s.lowerGrid}>
        <section style={s.card}>
          <h3 style={s.cardTitle}>Quick Navigation</h3>
          <div style={s.quickActions}>
            <Link to="/products" style={s.primaryBtn}><ShoppingBag size={15} /> Store View</Link>
            <Link to="/admin/orders" style={s.secondaryBtn}><Package size={15} /> Orders</Link>
            <Link to="/admin/payments" style={s.secondaryBtn}><CreditCard size={15} /> Payments</Link>
            <Link to="/admin/customers" style={s.secondaryBtn}><Users size={15} /> Customers</Link>
            <Link to="/admin/catalog" style={s.secondaryBtn}><Plus size={15} /> Manage Catalog</Link>
          </div>
        </section>

        <section style={s.card}>
          <h3 style={s.cardTitle}>Admin Profile</h3>
          <div style={s.profileGrid}>
            <div style={s.profileItem}><span style={s.label}>Full Name</span><strong>{user?.fullName || 'Administrator'}</strong></div>
            <div style={s.profileItem}><span style={s.label}>Email Address</span><strong style={{ fontSize: '0.9rem' }}>{user?.email}</strong></div>
            <div style={s.profileItem}><span style={s.label}>Role</span>
              <span style={{ ...s.badge, background: '#ede9fe', color: '#5b21b6' }}>{user?.role}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Recent customers */}
      <section style={{ ...s.card, marginTop: 22 }}>
        <h3 style={s.cardTitle}>Recent Customer Registrations</h3>
        {loading ? (
          <div style={s.emptyBox}>Loading recent signups…</div>
        ) : summary?.recentCustomers?.length ? (
          <div style={s.listWrap}>
            {summary.recentCustomers.map((c) => (
              <div key={c.id} style={s.listItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={s.avatarChip}>{(c.full_name || c.email).slice(0, 2).toUpperCase()}</div>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#1a0a2e' }}>{c.full_name || 'Member'}</strong>
                    <div style={s.muted}>{c.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ ...s.badge, ...s.badgeGreen }}>{c.role}</span>
                  <span style={s.muted}>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={s.emptyBox}>No recent customer signups yet.</div>
        )}
      </section>
    </AdminShell>
  );
}

/* ────────── Admin Orders ────────── */
export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Array<{ id: string; order_number: string; status: string; grand_total: string | number; payment_status: string; payment_method?: string; slipImage?: string | null; created_at: string; customer_name?: string; customer_email?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid' | 'failed' | 'rejected'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await adminService.getOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePaymentDecision = async (orderId: string, status: 'paid' | 'rejected') => {
    setProcessing(orderId);
    try {
      await adminService.updatePaymentStatus(orderId, status);
      await load();
    } finally {
      setProcessing(null);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setProcessing(orderId);
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update order status');
    } finally {
      setProcessing(null);
    }
  };

  const paymentBadge = (ps: string) => {
    const normalized = String(ps || '').toLowerCase();
    if (normalized === 'paid') return { background: '#dcfce7', color: '#166534', label: 'Paid ✓' };
    if (normalized === 'failed' || normalized === 'rejected') return { background: '#fee2e2', color: '#991b1b', label: 'Rejected ✕' };
    return { background: '#fef3c7', color: '#92400e', label: 'Pending Review' };
  };

  const orderStatusBadge = (st: string) => {
    const normalized = String(st || '').toLowerCase();
    if (normalized === 'delivered') return { background: '#dcfce7', color: '#166534', label: 'Delivered 🎉' };
    if (normalized === 'shipped') return { background: '#e0f2fe', color: '#0369a1', label: 'Shipped 🚚' };
    if (normalized === 'processing') return { background: '#fef3c7', color: '#92400e', label: 'Processing 📦' };
    if (normalized === 'confirmed') return { background: '#ede9fe', color: '#6d28d9', label: 'Confirmed ✓' };
    if (normalized === 'cancelled') return { background: '#fee2e2', color: '#991b1b', label: 'Cancelled ✕' };
    return { background: '#f3f4f6', color: '#4b5563', label: 'Pending ⏳' };
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const normalizedPaymentStatus = String(o.payment_status || '').toLowerCase();
      const matchesTab = activeTab === 'all' ||
        (activeTab === 'failed' ? normalizedPaymentStatus === 'failed' || normalizedPaymentStatus === 'rejected' : normalizedPaymentStatus === activeTab);
      const matchesSearch = !searchFilter ||
        o.order_number?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        o.customer_email?.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchFilter]);


  return (
    <AdminShell title="Store Orders" subtitle="Review incoming purchases, customer receipts, and update live order fulfillment tracking.">
      {/* Filters bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'pending', 'paid', 'failed', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tag ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{
                textTransform: 'capitalize',
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: '0.84rem',
              }}
            >
              {tab} ({tab === 'all'
                ? orders.length
                : orders.filter((o) => {
                    const normalized = String(o.payment_status || '').toLowerCase();
                    if (tab === 'failed') return normalized === 'failed' || normalized === 'rejected';
                    return normalized === tab;
                  }).length})
            </button>
          ))}
        </div>

        <div className="auth-input-wrapper" style={{ width: 260 }}>
          <span className="auth-input-icon"><Search size={15} /></span>
          <input
            type="text"
            placeholder="Search order # or customer..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="auth-input-element"
            style={{ minHeight: 38, paddingLeft: 36 }}
          />
        </div>
      </div>

      {loading ? (
        <div style={s.emptyBox}>Loading store orders…</div>
      ) : filteredOrders.length ? (
        <div style={s.tableWrap}>
          <table className="cf-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Fulfillment State</th>
                <th>Bank Slip</th>
                <th>Order Total</th>
                <th>Placed Date</th>
                <th>Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const badgeInfo = paymentBadge(order.payment_status);
                const orderBadge = orderStatusBadge(order.status);
                return (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>
                        {order.order_number}
                      </strong>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.92rem' }}>
                          {order.customer_name || 'Valued Shopper'}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
                          {order.customer_email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', fontWeight: 600 }}>
                        {order.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : '💳 Card / Online'}
                      </span>
                    </td>
                    <td>
                      <span style={{ ...s.badge, background: badgeInfo.background, color: badgeInfo.color }}>
                        {badgeInfo.label}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status || 'pending'}
                        disabled={processing === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 8,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          border: '1.5px solid var(--border)',
                          background: orderBadge.background,
                          color: orderBadge.color,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="confirmed">✓ Confirmed</option>
                        <option value="processing">📦 Processing</option>
                        <option value="shipped">🚚 Shipped</option>
                        <option value="delivered">🎉 Delivered</option>
                        <option value="cancelled">✕ Cancelled</option>
                      </select>
                    </td>
                    <td>
                      {order.slipImage ? (
                        <button
                          type="button"
                          onClick={() => setSelectedSlip(order.slipImage || null)}
                          style={{
                            background: 'var(--accent-soft)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            padding: '4px 10px',
                            color: 'var(--accent)',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                          }}
                        >
                          <Eye size={13} /> View Slip
                        </button>
                      ) : (
                        <span style={s.muted}>—</span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                        LKR {Number(order.grand_total || 0).toLocaleString()}
                      </strong>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {order.payment_status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            style={s.confirmBtn}
                            disabled={processing === order.id}
                            onClick={() => handlePaymentDecision(order.id, 'paid')}
                          >
                            {processing === order.id ? '…' : '✓ Approve'}
                          </button>
                          <button
                            type="button"
                            style={s.rejectBtn}
                            disabled={processing === order.id}
                            onClick={() => handlePaymentDecision(order.id, 'rejected')}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={s.emptyBox}>No orders matching the selected filter criteria.</div>
      )}

      {/* Slip Preview Modal */}
      {selectedSlip && (
        <div className="cf-modal-backdrop" onClick={() => setSelectedSlip(null)}>
          <div className="cf-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="cf-modal-header">
              <h3>Bank Transfer Receipt</h3>
              <button type="button" className="cf-modal-close" onClick={() => setSelectedSlip(null)}>
                ✕
              </button>
            </div>
            <div className="cf-modal-body" style={{ textAlign: 'center' }}>
              <img
                src={selectedSlip}
                alt="Bank Receipt Slip"
                style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 14, objectFit: 'contain', border: '1px solid var(--border)' }}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 18 }}
                onClick={() => setSelectedSlip(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

/* ────────── Admin Customers ────────── */
export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Array<{ id: string; full_name: string | null; email: string; role: string; is_active: boolean; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await adminService.getCustomers();
        if (mounted) setCustomers(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      return !search ||
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.role?.toLowerCase().includes(search.toLowerCase());
    });
  }, [customers, search]);

  return (
    <AdminShell title="Registered Customers" subtitle="Overview of all shoppers and registered client accounts.">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
          Total Accounts: {customers.length}
        </div>
        <div className="auth-input-wrapper" style={{ width: 280 }}>
          <span className="auth-input-icon"><Search size={15} /></span>
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="auth-input-element"
            style={{ minHeight: 38, paddingLeft: 36 }}
          />
        </div>
      </div>

      {loading ? (
        <div style={s.emptyBox}>Loading customer roster…</div>
      ) : filtered.length ? (
        <div style={s.tableWrap}>
          <table className="cf-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Account Role</th>
                <th>Status</th>
                <th>Member Since</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={s.avatarChip}>{(c.full_name || c.email).slice(0, 2).toUpperCase()}</div>
                      <strong style={{ color: 'var(--primary)' }}>{c.full_name || 'Clothify Member'}</strong>
                    </div>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{c.email}</td>
                  <td>
                    <span style={{ ...s.badge, background: c.role === 'admin' ? '#ede9fe' : '#e0f2fe', color: c.role === 'admin' ? '#5b21b6' : '#0369a1' }}>
                      {c.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span style={{ ...s.badge, background: c.is_active ? '#dcfce7' : '#f3f4f6', color: c.is_active ? '#166534' : '#374151' }}>
                      {c.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={s.emptyBox}>No customers match your search query.</div>
      )}
    </AdminShell>
  );
}

/* ────────── Admin Payments ────────── */
export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Array<{ id: string; order_id: string; order_number?: string; customer_name?: string; customer_email?: string; payment_method: string; amount: string | number; status: string; slipImage?: string | null; notes?: string | null; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await adminService.getPayments();
      setPayments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDecision = async (orderId: string, status: 'paid' | 'rejected') => {
    setProcessing(orderId);
    try {
      await adminService.updatePaymentStatus(orderId, status);
      await load();
    } finally {
      setProcessing(null);
    }
  };

  const statusStyle = (st: string) => {
    const normalized = String(st || '').toLowerCase();
    if (normalized === 'paid') return { background: '#dcfce7', color: '#166534', label: 'Paid & Settled' };
    if (normalized === 'failed' || normalized === 'rejected') return { background: '#fee2e2', color: '#991b1b', label: 'Rejected' };
    return { background: '#fef3c7', color: '#92400e', label: 'Under Review' };
  };

  return (
    <AdminShell title="Payment Settlements" subtitle="Verify and reconcile bank transfers, slip deposits, and transactions.">
      {loading ? (
        <div style={s.emptyBox}>Loading payment logs…</div>
      ) : payments.length ? (
        <div style={{ display: 'grid', gap: 18 }}>
          {payments.map((payment) => {
            const badge = statusStyle(payment.status);
            return (
              <div key={payment.id} style={s.paymentCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ ...s.avatarChip, background: 'var(--grad-accent)' }}>
                      {(payment.customer_name || payment.customer_email || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>
                        {payment.order_number || payment.order_id}
                      </strong>
                      <div style={s.muted}>{payment.customer_name || payment.customer_email || 'Shopper'}</div>
                    </div>
                  </div>
                  <span style={{ ...s.badge, background: badge.background, color: badge.color, fontSize: '0.84rem', padding: '6px 14px' }}>
                    {badge.label}
                  </span>
                </div>

                <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, background: 'var(--panel-soft)', padding: 14, borderRadius: 12 }}>
                  <div><span style={s.label}>Payment Method</span><strong>{payment.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Card Payment'}</strong></div>
                  <div><span style={s.label}>Settlement Amount</span><strong style={{ color: 'var(--accent)', fontSize: '1.05rem' }}>LKR {Number(payment.amount || 0).toLocaleString()}</strong></div>
                  <div><span style={s.label}>Date Recorded</span><span style={{ color: 'var(--muted)', fontWeight: 600 }}>{new Date(payment.created_at).toLocaleDateString()}</span></div>
                </div>

                {payment.slipImage && (
                  <div style={{ marginTop: 16 }}>
                    <span style={s.label}>Uploaded Deposit Slip</span>
                    <img
                      src={payment.slipImage}
                      alt="Bank slip"
                      style={{ marginTop: 8, maxWidth: 220, maxHeight: 160, borderRadius: 12, border: '1.5px solid var(--border)', cursor: 'pointer', objectFit: 'cover' }}
                      onClick={() => setSelectedSlip(payment.slipImage || null)}
                    />
                  </div>
                )}

                {(payment.status === 'pending' || payment.status === 'failed') && (
                  <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
                    <button type="button" style={s.confirmBtnLg} disabled={processing === payment.order_id} onClick={() => handleDecision(payment.order_id, 'paid')}>
                      {processing === payment.order_id ? 'Processing…' : '✓ Accept Payment'}
                    </button>
                    <button type="button" style={s.rejectBtnLg} disabled={processing === payment.order_id} onClick={() => handleDecision(payment.order_id, 'rejected')}>
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={s.emptyBox}>No payment submissions currently recorded.</div>
      )}

      {selectedSlip && (
        <div className="cf-modal-backdrop" onClick={() => setSelectedSlip(null)}>
          <div className="cf-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cf-modal-header">
              <h3>Bank Slip Viewer</h3>
              <button type="button" className="cf-modal-close" onClick={() => setSelectedSlip(null)}>✕</button>
            </div>
            <div className="cf-modal-body" style={{ textAlign: 'center' }}>
              <img src={selectedSlip} alt="Receipt" style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 12, objectFit: 'contain' }} />
              <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => setSelectedSlip(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

/* ────────── Admin Catalog ────────── */
export function AdminCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [_categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', brand: '', segment: 'Men', categoryName: 'T-Shirts', price: '', discountPercentage: '0', description: '' });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [variantRows, setVariantRows] = useState<Array<{ size: string; colors: Array<{ color: string; stock: string }> }>>([
    { size: '', colors: [{ color: '', stock: '0' }] },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [updatingPriceId, setUpdatingPriceId] = useState<string | null>(null);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [inventorySegment, setInventorySegment] = useState<'All' | 'Men' | 'Women' | 'Kids'>('All');
  const [inventorySearch, setInventorySearch] = useState('');

  const loadCatalog = async () => {
    try {
      const params: Record<string, unknown> = { limit: 200 };
      const [allProducts, allCategories] = await Promise.all([
        productService.getProducts(params),
        productService.getCategories(),
      ]);
      setProducts(allProducts);
      setCategories(allCategories);
      const nextPriceMap = allProducts.reduce((acc, product) => {
        acc[product.id] = String(Number(product.final_price || product.price || 0));
        return acc;
      }, {} as Record<string, string>);
      setPriceInputs((prev) => ({ ...prev, ...nextPriceMap }));
    } catch (err) {
      console.error('Unable to load catalog', err);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCatalog(); }, []);

  const productCount = useMemo(() => products.length, [products]);

  const filteredInventory = useMemo(() => {
    return products.filter((p) => {
      const seg = String((p as any).segment || '').toLowerCase();
      const matchesSeg = inventorySegment === 'All' || seg === inventorySegment.toLowerCase();
      const searchTerms = inventorySearch.toLowerCase().trim();
      const matchesSearch = !searchTerms ||
        p.name.toLowerCase().includes(searchTerms) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerms)) ||
        (p.category_name && p.category_name.toLowerCase().includes(searchTerms));
      return matchesSeg && matchesSearch;
    });
  }, [products, inventorySegment, inventorySearch]);

  const addVariantSize = () => setVariantRows((prev) => [...prev, { size: '', colors: [{ color: '', stock: '0' }] }]);
  const addVariantColor = (sizeIndex: number) =>
    setVariantRows((prev) => prev.map((row, index) => index === sizeIndex ? { ...row, colors: [...row.colors, { color: '', stock: '0' }] } : row));
  const updateVariantSize = (sizeIndex: number, value: string) =>
    setVariantRows((prev) => prev.map((row, index) => index === sizeIndex ? { ...row, size: value } : row));
  const updateVariantColor = (sizeIndex: number, colorIndex: number, value: string) =>
    setVariantRows((prev) => prev.map((row, index) => index === sizeIndex ? {
      ...row, colors: row.colors.map((cr, ci) => ci === colorIndex ? { ...cr, color: value } : cr),
    } : row));
  const updateVariantStock = (sizeIndex: number, colorIndex: number, value: string) =>
    setVariantRows((prev) => prev.map((row, index) => index === sizeIndex ? {
      ...row, colors: row.colors.map((cr, ci) => ci === colorIndex ? { ...cr, stock: value } : cr),
    } : row));

  const buildVariantPayload = () =>
    variantRows
      .filter((row) => String(row.size).trim())
      .map((row) => ({
        size: row.size.trim(),
        colors: row.colors.filter((cr) => String(cr.color).trim()).map((cr) => ({ color: cr.color.trim(), stockQuantity: Number(cr.stock || 0) })),
      }))
      .filter((row) => row.colors.length > 0)
      .map((row) => ({ size: row.size, colors: row.colors }));

  const handleCreate = async () => {
    if (!form.name.trim()) { alert('Please enter a product name.'); return; }
    const numericPrice = Number(form.price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) { alert('Please enter a valid product price.'); return; }
    const variants = buildVariantPayload();
    if (!variants.length) { alert('Add at least one size and color combination with stock.'); return; }
    setSubmitting(true);
    try {
      const response = await productService.createProduct({
        name: form.name,
        brand: form.brand || 'Clothify',
        segment: form.segment,
        categoryName: form.categoryName,
        description: form.description || 'Admin created product',
        price: numericPrice,
        discountPercentage: Number(form.discountPercentage ?? 0),
        images: imageUrls,
        variants,
      });

      if (response && response.success === false) {
        throw new Error(response.message || 'Unable to add product.');
      }

      setForm({ name: '', brand: '', segment: 'Men', categoryName: 'T-Shirts', price: '', discountPercentage: '0', description: '' });
      setImageUrls([]);
      setVariantRows([{ size: '', colors: [{ color: '', stock: '0' }] }]);

      try {
        await loadCatalog();
      } catch {
        // Keep the success message if the catalog refresh fails after a successful create.
      }

      alert('Product created successfully.');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Unable to add product. Please check the details and try again.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Delete this product?')) return;
    await productService.deleteProduct(productId);
    await loadCatalog();
  };

  const handlePriceUpdate = async (productId: string) => {
    const currentPrice = Number(priceInputs[productId] ?? 0);
    if (!Number.isFinite(currentPrice) || currentPrice <= 0) { alert('Please enter a valid price.'); return; }
    setUpdatingPriceId(productId);
    try {
      await productService.updateProduct(productId, { price: currentPrice, discountPercentage: 0 });
      await loadCatalog();
    } finally {
      setUpdatingPriceId(null);
    }
  };

  return (
    <AdminShell title="Catalog" subtitle="Create, manage, and review products in your storefront.">

      {/* ── Add product form ── */}
      <section style={s.card}>
        <h3 style={s.cardTitle}>Add New Product</h3>
        <div style={s.formGrid}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" style={s.input} />
          <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brand" style={s.input} />
          <select
            value={form.segment}
            onChange={(e) => {
              const seg = e.target.value;
              const defaultCat = seg === 'Women' ? 'Dresses' : 'T-Shirts';
              setForm({ ...form, segment: seg, categoryName: defaultCat });
            }}
            style={s.input}
          >
            <option value="Men">Men's Fashion</option>
            <option value="Women">Women's Fashion</option>
            <option value="Kids">Kids' Collection</option>
          </select>
          <select value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} style={s.input}>
            {form.segment === 'Men' && (
              <>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Shirts">Shirts</option>
                <option value="Jackets">Jackets</option>
                <option value="Jeans">Jeans</option>
                <option value="Trousers">Trousers</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">Accessories</option>
              </>
            )}
            {form.segment === 'Women' && (
              <>
                <option value="Dresses">Dresses</option>
                <option value="Skirts">Skirts</option>
                <option value="Blouses">Blouses</option>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Shirts">Shirts</option>
                <option value="Jackets">Jackets</option>
                <option value="Jeans">Jeans</option>
                <option value="Trousers">Trousers</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">Accessories</option>
              </>
            )}
            {form.segment === 'Kids' && (
              <>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Shirts">Shirts</option>
                <option value="Dresses">Dresses</option>
                <option value="Jackets">Jackets</option>
                <option value="Jeans">Jeans</option>
                <option value="Trousers">Trousers</option>
              </>
            )}
          </select>
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (LKR)" type="number" min="0" step="0.01" style={s.input} />
          <input value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} placeholder="Discount %" type="number" min="0" max="100" step="0.01" style={s.input} />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description" style={{ ...s.input, minHeight: 100, gridColumn: 'span 2', resize: 'vertical' }} />

          {/* Image upload */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: 10, color: '#1a0a2e' }}>Upload Images</label>
            <input
              type="file" accept="image/*" multiple disabled={uploadingImages}
              style={{ padding: '10px', border: '2px dashed #e5e7eb', borderRadius: 12, width: '100%', background: '#f8f4ff', cursor: 'pointer' }}
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                setUploadingImages(true);
                try {
                  const uploader = await import('../../services/upload.service');
                  for (const f of files) {
                    const reader = new FileReader();
                    await new Promise((resolve, reject) => {
                      reader.onload = async () => {
                        try {
                          const url = await uploader.uploadImage(String(reader.result || ''));
                          setImageUrls((prev) => [...prev, url]);
                          resolve(true);
                        } catch (err) { reject(err); }
                      };
                      reader.onerror = () => reject(new Error('File read error'));
                      reader.readAsDataURL(f);
                    });
                  }
                } catch (err: any) {
                  alert(err?.response?.data?.message || err?.message || 'Unable to upload images');
                } finally { setUploadingImages(false); }
              }}
            />
            {uploadingImages && <div style={{ color: '#e91e8c', fontSize: '0.88rem', marginTop: 8 }}>⏳ Uploading images…</div>}
            {imageUrls.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                {imageUrls.map((url, idx) => (
                  <div key={url + idx} style={{ position: 'relative' }}>
                    <img src={url} alt={`preview-${idx}`} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: '2px solid #e5e7eb' }} />
                    <button
                      type="button"
                      onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                      style={{ position: 'absolute', right: -6, top: -6, background: '#fee2e2', border: 'none', borderRadius: 20, width: 22, height: 22, display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#991b1b', fontWeight: 700, fontSize: '0.75rem' }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Size & Color variants */}
        <div style={{ marginTop: 20, border: '1.5px solid #e5e7eb', borderRadius: 14, padding: 18, background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 style={{ margin: 0, color: '#1a0a2e', fontWeight: 700 }}>Size & Color Stock</h4>
            <button type="button" style={s.secondaryBtn} onClick={addVariantSize}>+ Add size</button>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {variantRows.map((row, sizeIndex) => (
              <div key={`size-${sizeIndex}`} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, background: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 12 }}>
                  <input value={row.size} onChange={(e) => updateVariantSize(sizeIndex, e.target.value)} placeholder="Size (e.g. S, M, L, XL)" style={s.input} />
                  <button type="button" style={s.secondaryBtn} onClick={() => addVariantColor(sizeIndex)}>+ Color</button>
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {row.colors.map((colorRow, colorIndex) => (
                    <div key={`color-${sizeIndex}-${colorIndex}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <input value={colorRow.color} onChange={(e) => updateVariantColor(sizeIndex, colorIndex, e.target.value)} placeholder="Color (e.g. Red, Navy)" style={s.input} />
                      <input value={colorRow.stock} onChange={(e) => updateVariantStock(sizeIndex, colorIndex, e.target.value)} placeholder="Stock qty" type="number" min="0" style={s.input} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <button type="button" style={s.primaryBtn} onClick={handleCreate} disabled={submitting}>
            {submitting ? '⏳ Saving…' : '+ Add Product'}
          </button>
        </div>
      </section>

      {/* ── Product list ── */}
      <section style={{ ...s.card, marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={s.cardTitle}>Catalog Inventory ({productCount})</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="auth-input-wrapper" style={{ width: 220 }}>
              <span className="auth-input-icon"><Search size={14} /></span>
              <input
                type="text"
                placeholder="Search styles..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="auth-input-element"
                style={{ minHeight: 36, paddingLeft: 34, fontSize: '0.84rem' }}
              />
            </div>
            <button type="button" style={s.secondaryBtn} onClick={loadCatalog}>↻ Refresh</button>
          </div>
        </div>

        {/* Inventory Segment Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {(['All', 'Men', 'Women', 'Kids'] as const).map((seg) => (
            <button
              key={seg}
              type="button"
              className={`tag ${inventorySegment === seg ? 'active' : ''}`}
              onClick={() => setInventorySegment(seg)}
              style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700 }}
            >
              {seg === 'All' ? '🌟 All Departments' : `${seg}'s`} ({seg === 'All' ? products.length : products.filter((p) => String((p as any).segment || '').toLowerCase() === seg.toLowerCase()).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={s.emptyBox}>Loading catalog…</div>
        ) : filteredInventory.length ? (
          <div style={{ display: 'grid', gap: 14 }}>
            {filteredInventory.map((product) => {
              const thumbnail = product.images?.length ? product.images[0].image_url : undefined;
              const price     = Number(product.final_price || product.price || 0);
              const oldPrice  = Number(product.price || 0);
              const discount  = Math.round(Number(product.discount_percentage || 0));

              return (
                <div key={product.id} style={s.productRow}>
                  <div style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: '#f3f4f6' }}>
                    {thumbnail
                      ? <img src={thumbnail} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#b5aac7', fontSize: '1.5rem' }}>👕</div>}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div>
                        <strong style={{ fontSize: '0.97rem', color: '#1a0a2e' }}>{product.name}</strong>
                        <div style={s.muted}>{product.brand || '—'}</div>
                        <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ ...s.badge, background: '#ede9fe', color: '#5b21b6', fontWeight: 800 }}>{(product as any).segment || 'Women'}</span>
                          <span style={{ ...s.badge, background: '#f0fdf4', color: '#166534' }}>{product.category_name || '—'}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a0a2e' }}>LKR {price.toLocaleString()}</div>
                        {discount > 0
                          ? <div style={{ color: '#e91e8c', fontSize: '0.85rem' }}>-{discount}% · <span style={{ color: '#7c6f8e', textDecoration: 'line-through' }}>LKR {oldPrice.toLocaleString()}</span></div>
                          : <div style={{ color: '#b5aac7', fontSize: '0.82rem' }}>No discount</div>}
                      </div>
                    </div>

                    {/* Variants */}
                    {product.variants?.length ? (
                      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(() => {
                          const grouped: Record<string, any[]> = {};
                          (product.variants || []).forEach((v: any) => {
                            const size = String(v.size || 'N/A');
                            grouped[size] = grouped[size] || [];
                            grouped[size].push(v);
                          });
                          return Object.keys(grouped).map((sizeKey) => (
                            <span key={sizeKey} style={{ background: '#f8f4ff', border: '1px solid #e0d9f0', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600, color: '#4c3a8a' }}>
                              {sizeKey}: {grouped[sizeKey].map((v: any) => `${v.color}(${v.stock_quantity ?? 0})`).join(', ')}
                            </span>
                          ));
                        })()}
                      </div>
                    ) : null}

                    {/* Price update & delete */}
                    <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        value={priceInputs[product.id] ?? String(Number(product.final_price || product.price || 0))}
                        onChange={(e) => setPriceInputs((prev) => ({ ...prev, [product.id]: e.target.value }))}
                        type="number" min="0"
                        style={{ ...s.input, width: 120 }}
                      />
                      <button type="button" style={s.confirmBtn} onClick={() => handlePriceUpdate(product.id)} disabled={updatingPriceId === product.id}>
                        {updatingPriceId === product.id ? '…' : 'Update Price'}
                      </button>
                      <button type="button" style={s.deleteBtn} onClick={() => handleDelete(product.id)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={s.emptyBox}>No products match the selected department or search filter.</div>
        )}
      </section>
    </AdminShell>
  );
}

/* ────────── Styles ────────── */
const s = {
  pageShell: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f4ff 0%, #f0e6ff 100%)',
    padding: '28px 20px 60px',
  } as React.CSSProperties,
  container: {
    maxWidth: 1300,
    margin: '0 auto',
    display: 'flex',
    gap: 26,
    alignItems: 'flex-start',
  } as React.CSSProperties,

  /* Sidebar */
  sidebar: {
    width: 250,
    flexShrink: 0,
    background: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b69 60%, #3d2480 100%)',
    borderRadius: 22,
    padding: '22px 16px',
    boxShadow: '0 20px 50px rgba(26,10,46,0.28)',
    position: 'sticky',
    top: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  } as React.CSSProperties,
  brandWrap: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 } as React.CSSProperties,
  brandBadge: {
    width: 42, height: 42, borderRadius: 12,
    overflow: 'hidden',
    background: 'linear-gradient(135deg,#e91e8c,#ff6b35)',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(233,30,140,0.35)',
  } as React.CSSProperties,
  sideLabel: { margin: 0, fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' } as React.CSSProperties,
  sideTitle: { fontSize: '1.1rem', color: 'white', fontWeight: 800, letterSpacing: '-0.02em' } as React.CSSProperties,
  navList: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 } as React.CSSProperties,
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 14px', borderRadius: 12,
    color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: '0.92rem',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
  navItemActive: {
    background: 'rgba(233,30,140,0.22)',
    color: 'white',
    boxShadow: '0 0 0 1px rgba(233,30,140,0.4)',
  } as React.CSSProperties,
  sideFooter: { marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 18 } as React.CSSProperties,
  visitStoreBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.8)',
    borderRadius: 12, padding: '11px 14px',
    fontWeight: 700, fontSize: '0.88rem',
    transition: 'all 0.2s',
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.15)',
  } as React.CSSProperties,

  /* Main panel */
  mainPanel: {
    flex: 1, background: '#fff',
    borderRadius: 22,
    boxShadow: '0 8px 32px rgba(26,10,46,0.08)',
    padding: '28px 32px 36px',
    minWidth: 0,
  } as React.CSSProperties,
  header: {
    display: 'flex', justifyContent: 'space-between',
    gap: 16, alignItems: 'flex-start', marginBottom: 28,
    paddingBottom: 24, borderBottom: '1px solid #f0e6ff',
  } as React.CSSProperties,
  eyebrow: {
    margin: 0, color: '#e91e8c',
    textTransform: 'uppercase', fontWeight: 800,
    letterSpacing: '0.1em', fontSize: '0.72rem',
  } as React.CSSProperties,
  title: { margin: '8px 0 0', fontSize: 'clamp(1.8rem,3vw,2.4rem)', color: '#1a0a2e', fontWeight: 800, letterSpacing: '-0.03em' } as React.CSSProperties,
  subtitle: { margin: '6px 0 0', color: '#7c6f8e', fontSize: '0.95rem' } as React.CSSProperties,
  headerActions: { display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 } as React.CSSProperties,
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    border: '1.5px solid #f0e6ff',
    background: '#f8f4ff', display: 'grid', placeItems: 'center',
    cursor: 'pointer', color: '#4c3a8a', transition: 'all 0.2s',
  } as React.CSSProperties,
  logoutBtn: {
    border: 'none', borderRadius: 12,
    background: 'linear-gradient(135deg,#1a0a2e,#2d1b69)',
    color: '#fff', fontWeight: 700, padding: '10px 18px',
    cursor: 'pointer', fontSize: '0.9rem',
    boxShadow: '0 4px 14px rgba(26,10,46,0.22)',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  /* Stats */
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 } as React.CSSProperties,
  statCard: { borderRadius: 18, padding: '22px 20px', position: 'relative', overflow: 'hidden' } as React.CSSProperties,
  statIcon: { width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', marginBottom: 20 } as React.CSSProperties,
  statValue: { fontSize: '2.2rem', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: 6 } as React.CSSProperties,
  statTitle: { fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', marginBottom: 4 } as React.CSSProperties,
  statSubtitle: { color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' } as React.CSSProperties,

  /* Lower grid */
  lowerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 } as React.CSSProperties,

  /* Cards */
  card: { background: '#faf8ff', border: '1.5px solid #f0e6ff', borderRadius: 18, padding: '22px 20px' } as React.CSSProperties,
  paymentCard: { background: '#fff', border: '1.5px solid #f0e6ff', borderRadius: 18, padding: '22px 20px', boxShadow: '0 4px 18px rgba(26,10,46,0.06)' } as React.CSSProperties,
  cardTitle: { margin: '0 0 16px', fontSize: '1.1rem', color: '#1a0a2e', fontWeight: 700 } as React.CSSProperties,

  /* Profile */
  profileGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14 } as React.CSSProperties,
  profileItem: { display: 'flex', flexDirection: 'column', gap: 4 } as React.CSSProperties,

  /* Quick actions */
  quickActions: { display: 'flex', flexWrap: 'wrap', gap: 10 } as React.CSSProperties,
  primaryBtn: {
    background: 'linear-gradient(135deg,#e91e8c,#ff6b35)',
    color: '#fff', borderRadius: 12,
    padding: '11px 20px', fontWeight: 700, textDecoration: 'none',
    border: 'none', cursor: 'pointer', fontSize: '0.9rem',
    boxShadow: '0 4px 14px rgba(233,30,140,0.3)',
    transition: 'all 0.22s ease',
    display: 'inline-flex', alignItems: 'center', gap: 8,
  } as React.CSSProperties,
  secondaryBtn: {
    background: '#f8f4ff', color: '#4c3a8a',
    borderRadius: 12, padding: '11px 16px',
    fontWeight: 700, textDecoration: 'none',
    border: '1.5px solid #e0d9f0', cursor: 'pointer',
    fontSize: '0.88rem', transition: 'all 0.2s',
    display: 'inline-flex', alignItems: 'center', gap: 8,
  } as React.CSSProperties,
  confirmBtn: {
    background: 'linear-gradient(135deg,#00d4aa,#00b4d8)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '8px 14px', fontWeight: 700, cursor: 'pointer',
    fontSize: '0.85rem', boxShadow: '0 3px 10px rgba(0,212,170,0.3)',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  confirmBtnLg: {
    background: 'linear-gradient(135deg,#00d4aa,#00b4d8)',
    color: '#fff', border: 'none', borderRadius: 12,
    padding: '11px 20px', fontWeight: 700, cursor: 'pointer',
    fontSize: '0.93rem', boxShadow: '0 4px 14px rgba(0,212,170,0.3)',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  rejectBtn: {
    background: '#fee2e2', color: '#991b1b', border: 'none',
    borderRadius: 10, padding: '8px 14px', fontWeight: 700,
    cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s',
  } as React.CSSProperties,
  rejectBtnLg: {
    background: '#fee2e2', color: '#991b1b', border: 'none',
    borderRadius: 12, padding: '11px 20px', fontWeight: 700,
    cursor: 'pointer', fontSize: '0.93rem', transition: 'all 0.2s',
  } as React.CSSProperties,
  deleteBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: '#fee2e2', color: '#991b1b', border: 'none',
    borderRadius: 10, padding: '8px 14px', fontWeight: 700,
    cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s',
  } as React.CSSProperties,

  /* Lists */
  listWrap: { display: 'flex', flexDirection: 'column', gap: 10 } as React.CSSProperties,
  listItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', borderRadius: 12,
    background: '#fff', border: '1px solid #f0e6ff',
    transition: 'box-shadow 0.2s',
  } as React.CSSProperties,
  avatarChip: {
    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#1a0a2e,#2d1b69)',
    color: 'white', fontWeight: 800, fontSize: '0.75rem',
    display: 'grid', placeItems: 'center',
  } as React.CSSProperties,

  /* Table */
  tableWrap: { overflowX: 'auto', borderRadius: 14, border: '1.5px solid #f0e6ff' } as React.CSSProperties,

  /* Misc */
  muted: { color: '#7c6f8e', fontSize: '0.85rem', marginTop: 2 } as React.CSSProperties,
  label: { display: 'block', color: '#b5aac7', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 } as React.CSSProperties,
  badge: { display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700 } as React.CSSProperties,
  badgeGreen: { background: '#dcfce7', color: '#166534' } as React.CSSProperties,
  emptyBox: {
    padding: '32px 24px', borderRadius: 14,
    background: '#f8f4ff', border: '2px dashed #e0d9f0',
    color: '#7c6f8e', textAlign: 'center', fontSize: '0.95rem',
  } as React.CSSProperties,
  input: {
    width: '100%', padding: '11px 14px', borderRadius: 11,
    border: '1.5px solid #e0d9f0', background: '#fff',
    fontSize: '0.93rem', boxSizing: 'border-box' as const,
    color: '#1a0a2e', transition: 'border-color 0.2s',
    outline: 'none',
  } as React.CSSProperties,
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 } as React.CSSProperties,
  productRow: {
    display: 'flex', gap: 16, alignItems: 'flex-start',
    background: '#fff', border: '1.5px solid #f0e6ff',
    padding: '16px 18px', borderRadius: 14,
    transition: 'box-shadow 0.2s, border-color 0.2s',
  } as React.CSSProperties,
};
