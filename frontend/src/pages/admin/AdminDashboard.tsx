import {
  LayoutDashboard, Package, CreditCard, Users, ShoppingBag,
  TrendingUp, Plus, Search, Trash2, Eye, ExternalLink, LogOut,
  ChevronRight, Sparkles, X, FileText, MessageSquare, Star, CheckCircle2,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth.context';
import * as adminService from '../../services/admin.service';
import * as productService from '../../services/product.service';
import * as uploadService from '../../services/upload.service';
import type { Category, Product } from '../../types/product.types';

/* ────────── nav config ────────── */
const navItems = [
  { to: '/admin/dashboard', label: 'Overview',      icon: LayoutDashboard },
  { to: '/admin/orders',    label: 'Orders & Tracking', icon: Package },
  { to: '/admin/payments',  label: 'Payments',      icon: CreditCard },
  { to: '/admin/customers', label: 'Customers',     icon: Users },
  { to: '/admin/catalog',   label: 'Catalog & Stock', icon: ShoppingBag },
  { to: '/admin/reviews',   label: 'Reviews & Feedback', icon: MessageSquare },
];

/* ────────── Admin Sidebar ────────── */
function AdminSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'AD';

  return (
    <>
      {/* ── Mobile Horizontal Navigation Tabs ── */}
      <div className="dashboard-mobile-tabs show-on-mobile">
        <div className="dashboard-mobile-tabs-scroll">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/admin/dashboard'
              ? location.pathname === to
              : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                end={to === '/admin/dashboard'}
                to={to}
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
            <span className="monic-dash-side-tag">Executive Suite</span>
            <strong className="monic-dash-side-title">Monic Studio Admin</strong>
          </div>
        </div>

        {/* User Card */}
        <div className="monic-dash-user-card">
          <div className="monic-dash-avatar" style={{ background: 'linear-gradient(135deg, #8B2E14 0%, #C44B2B 100%)' }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="monic-dash-user-name">
              {user?.fullName || 'Administrator'}
            </div>
            <div className="monic-dash-user-email">
              {user?.email}
            </div>
            <div style={{ marginTop: 6 }}>
              <span className="monic-dash-vip-pill" style={{ background: '#dcfce7', color: '#166534' }}>
                ● Full Admin Access
              </span>
            </div>
          </div>
        </div>

        {/* Nav List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/admin/dashboard'
              ? location.pathname === to
              : location.pathname.startsWith(to);
            return (
              <NavLink key={to} end={to === '/admin/dashboard'} to={to} style={{ textDecoration: 'none' }}>
                <div className={`monic-dash-nav-btn ${isActive ? 'active' : ''}`}>
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.8 }} />}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(44, 24, 16, 0.08)', display: 'grid', gap: 8 }}>
          <Link
            to="/products"
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <ExternalLink size={14} /> View Storefront
          </Link>

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

/* ────────── Admin Shell ────────── */
function AdminShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <div className="dashboard-container">
        <AdminSidebar />
        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <p className="dashboard-eyebrow">Storefront Management</p>
              <h1 className="dashboard-title">{title}</h1>
              <p className="dashboard-subtitle">{subtitle}</p>
            </div>
            <Link to="/products" className="btn btn-secondary" style={{ fontSize: '0.84rem', padding: '8px 16px', whiteSpace: 'nowrap' }}>
              <ExternalLink size={14} /> Shop Catalog
            </Link>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

/* ────────── Overview Dashboard ────────── */
export function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<{
    totalUsers?: number;
    totalCustomers?: number;
    totalProducts?: number;
    totalOrders?: number;
    recentCustomers?: Array<{ id: string; full_name: string; email: string; role: string; created_at: string }>;
  } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [sumData, ordData] = await Promise.allSettled([
          adminService.getSummary(),
          adminService.getOrders(),
        ]);
        if (mounted) {
          if (sumData.status === 'fulfilled') setSummary(sumData.value);
          if (ordData.status === 'fulfilled') setOrders(ordData.value || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => String(o.payment_status || '').toLowerCase() === 'paid')
      .reduce((sum, o) => sum + Number(o.grand_total || 0), 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => {
      const ps = String(o.payment_status || '').toLowerCase();
      const st = String(o.status || '').toLowerCase();
      return ps === 'pending' || st === 'pending' || st === 'processing';
    }).length;
  }, [orders]);

  return (
    <AdminShell title="Store Executive Dashboard" subtitle={`Operations summary for ${user?.fullName ? user.fullName.split(' ')[0] : 'Administrator'}.`}>
      {/* Admin Hero Header - Concise Executive Summary */}
      <div className="monic-dash-hero">
        <div className="monic-dash-hero-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="monic-live-indicator">
              <span className="monic-live-dot" /> Live Store Stream
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700 }}>
              ● Real-Time Metrics
            </span>
          </div>
          <h1 className="monic-dash-title">
            Store Operations <em>&amp; Summary</em>
          </h1>
          <p className="monic-dash-desc">
            Revenue velocity, order fulfillment queue, payment audits, and catalog inventory at a glance.
          </p>
        </div>

        <div className="monic-dash-hero-actions">
          <Link to="/admin/catalog" className="monic-btn-primary" style={{ fontSize: '0.86rem', padding: '10px 22px' }}>
            <Plus size={15} /> Add Product
          </Link>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="monic-dash-stats-grid">
        <div className="monic-dash-stat-card">
          <div className="monic-dash-stat-header">
            <span className="monic-dash-stat-label">Total Revenue</span>
            <div className="monic-dash-stat-icon" style={{ background: 'rgba(107, 142, 107, 0.15)', color: '#4A6741' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="monic-dash-stat-value">
            {loading ? '—' : `LKR ${totalRevenue.toLocaleString()}`}
          </div>
          <div className="monic-dash-stat-meta">
            Settled orders revenue
          </div>
        </div>

        <div className="monic-dash-stat-card">
          <div className="monic-dash-stat-header">
            <span className="monic-dash-stat-label">Orders Placed</span>
            <div className="monic-dash-stat-icon" style={{ background: 'rgba(196, 75, 43, 0.1)', color: '#C44B2B' }}>
              <Package size={18} />
            </div>
          </div>
          <div className="monic-dash-stat-value">
            {loading ? '—' : String(summary?.totalOrders ?? orders.length)}
          </div>
          <div className="monic-dash-stat-meta">
            <span style={{ color: pendingOrdersCount > 0 ? '#C44B2B' : 'var(--muted)', fontWeight: 700 }}>
              {pendingOrdersCount} pending fulfillment
            </span>
          </div>
        </div>

        <div className="monic-dash-stat-card">
          <div className="monic-dash-stat-header">
            <span className="monic-dash-stat-label">Registered Members</span>
            <div className="monic-dash-stat-icon" style={{ background: 'rgba(212, 165, 116, 0.15)', color: '#A86C32' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="monic-dash-stat-value">
            {loading ? '—' : String(summary?.totalCustomers ?? summary?.totalUsers ?? 0)}
          </div>
          <div className="monic-dash-stat-meta">
            Active shopper roster
          </div>
        </div>

        <div className="monic-dash-stat-card">
          <div className="monic-dash-stat-header">
            <span className="monic-dash-stat-label">Catalog Styles</span>
            <div className="monic-dash-stat-icon" style={{ background: 'rgba(196, 75, 43, 0.1)', color: '#C44B2B' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="monic-dash-stat-value">
            {loading ? '—' : String(summary?.totalProducts ?? 0)}
          </div>
          <div className="monic-dash-stat-meta">
            <Link to="/admin/catalog" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>
              Manage inventory →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Operation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 24 }}>
        <div className="dashboard-section-card">
          <h3 className="dashboard-card-title">Quick Operations</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link to="/admin/orders" className="btn btn-primary" style={{ fontSize: '0.86rem', padding: '9px 16px' }}>
              <Package size={14} /> Process Orders
            </Link>
            <Link to="/admin/payments" className="btn btn-secondary" style={{ fontSize: '0.86rem', padding: '9px 16px' }}>
              <CreditCard size={14} /> Audit Slips
            </Link>
            <Link to="/admin/catalog" className="btn btn-secondary" style={{ fontSize: '0.86rem', padding: '9px 16px' }}>
              <Plus size={14} /> Add Product
            </Link>
            <Link to="/admin/customers" className="btn btn-secondary" style={{ fontSize: '0.86rem', padding: '9px 16px' }}>
              <Users size={14} /> View Roster
            </Link>
          </div>
        </div>

        <div className="dashboard-section-card">
          <h3 className="dashboard-card-title">Admin Account Profile</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Administrator</span>
              <strong style={{ color: 'var(--primary)' }}>{user?.fullName || 'Full Access Admin'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Email Address</span>
              <strong style={{ color: 'var(--primary)' }}>{user?.email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Permission Tier</span>
              <span className="badge badge-green">Superuser</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Customer Registrations */}
      <div className="dashboard-section-card">
        <h3 className="dashboard-card-title">Recent Client Registrations</h3>
        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div className="loader" style={{ margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>Loading recent signups…</p>
          </div>
        ) : summary?.recentCustomers?.length ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {summary.recentCustomers.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: 'var(--panel-soft)',
                  border: '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {(c.full_name || c.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.94rem', color: 'var(--primary)', display: 'block' }}>
                      {c.full_name || 'Clothify Member'}
                    </strong>
                    <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{c.email}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="badge badge-blue">{c.role.toUpperCase()}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-box">
            <Users size={34} style={{ color: 'var(--muted)', marginBottom: 8 }} />
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.88rem' }}>No recent customer registrations recorded.</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

/* ────────── Fulfillment Steps ────────── */
const FULFILLMENT_STEPS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

/* ────────── Admin Orders Page ────────── */
export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Array<{ id: string; order_number: string; status: string; grand_total: string | number; payment_status: string; payment_method?: string; slipImage?: string | null; created_at: string; customer_name?: string; customer_email?: string; items?: any[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid' | 'failed' | 'rejected'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<any | null>(null);

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
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update payment status');
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
    if (normalized === 'confirmed') return { background: 'var(--accent-soft)', color: 'var(--primary)', label: 'Confirmed ✓' };
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
    <AdminShell title="Store Order Management" subtitle="Review incoming purchases, inspect bank slip receipts, and update live fulfillment steps.">
      {/* Search & Filter Header */}
      <div className="monic-order-filters-wrap" style={{ marginBottom: 20 }}>
        <div className="monic-order-search-box">
          <Search size={16} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search order # or customer..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="monic-order-search-input"
          />
          {searchFilter && (
            <button
              type="button"
              onClick={() => setSearchFilter('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="monic-order-filter-pills">
          {(['all', 'pending', 'paid', 'failed', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`monic-order-filter-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all' ? 'All Orders' : tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'all'
                ? orders.length
                : orders.filter((o) => {
                    const normalized = String(o.payment_status || '').toLowerCase();
                    if (tab === 'failed') return normalized === 'failed' || normalized === 'rejected';
                    return normalized === tab;
                  }).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div className="loader" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading store orders…</p>
        </div>
      ) : filteredOrders.length ? (
        <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--panel)' }}>
          <table className="cf-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Client</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Fulfillment Tracking</th>
                <th>Receipt Slip</th>
                <th>Total</th>
                <th>Date</th>
                <th>Audit Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const badgeInfo = paymentBadge(order.payment_status);
                const orderBadge = orderStatusBadge(order.status);
                return (
                  <tr key={order.id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => setInvoiceModalOrder(order)}
                        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--accent)', fontWeight: 800, textAlign: 'left' }}
                        title="View Invoice"
                      >
                        {order.order_number}
                      </button>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                          {order.customer_name || 'Valued Shopper'}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.76rem' }}>
                          {order.customer_email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontSize: '0.84rem', fontWeight: 600 }}>
                        {order.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : '💳 Card / Online'}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: badgeInfo.background, color: badgeInfo.color }}>
                        {badgeInfo.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ minWidth: 160 }}>
                        <select
                          value={order.status || 'pending'}
                          disabled={processing === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '7px 10px',
                            borderRadius: 10,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            border: '1.5px solid var(--border)',
                            background: orderBadge.background,
                            color: orderBadge.color,
                            cursor: 'pointer',
                          }}
                        >
                          {FULFILLMENT_STEPS.map((step) => (
                            <option key={step.value} value={step.value}>
                              {step.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      {order.slipImage ? (
                        <button
                          type="button"
                          onClick={() => setSelectedSlip(order.slipImage || null)}
                          style={{
                            background: 'var(--panel-soft)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            padding: '3px 8px',
                            color: 'var(--accent)',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <img
                            src={order.slipImage}
                            alt="Slip"
                            style={{ width: 28, height: 28, borderRadius: 5, objectFit: 'cover' }}
                          />
                          <Eye size={12} /> View
                        </button>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                          {order.payment_method === 'bank_transfer' ? 'No slip' : '—'}
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontSize: '0.92rem' }}>
                        LKR {Number(order.grand_total || 0).toLocaleString()}
                      </strong>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {order.payment_status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.76rem', borderRadius: 8 }}
                            disabled={processing === order.id}
                            onClick={() => handlePaymentDecision(order.id, 'paid')}
                          >
                            {processing === order.id ? '…' : '✓ Approve'}
                          </button>
                          <button
                            type="button"
                            style={{ padding: '6px 10px', fontSize: '0.76rem', borderRadius: 8, background: '#fee2e2', color: '#991b1b', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                            disabled={processing === order.id}
                            onClick={() => handlePaymentDecision(order.id, 'rejected')}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setInvoiceModalOrder(order)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.76rem', borderRadius: 8 }}
                        >
                          Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="dashboard-empty-box">
          <Package size={36} style={{ color: 'var(--muted)', marginBottom: 10 }} />
          <h3 style={{ margin: '0 0 6px', color: 'var(--primary)' }}>No Matching Orders</h3>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.86rem' }}>Try clearing filters or search terms.</p>
        </div>
      )}

      {/* Slip Preview Modal */}
      {selectedSlip && (
        <div className="cf-modal-backdrop" onClick={() => setSelectedSlip(null)}>
          <div className="cf-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="cf-modal-header">
              <h3>Bank Transfer Deposit Slip</h3>
              <button type="button" className="cf-modal-close" onClick={() => setSelectedSlip(null)}>✕</button>
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
                style={{ width: '100%', marginTop: 16 }}
                onClick={() => setSelectedSlip(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceModalOrder && (
        <div className="cf-modal-backdrop" onClick={() => setInvoiceModalOrder(null)}>
          <div className="cf-modal-box" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="cf-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} color="var(--accent)" />
                <h3 style={{ margin: 0 }}>Invoice #{invoiceModalOrder.order_number}</h3>
              </div>
              <button type="button" className="cf-modal-close" onClick={() => setInvoiceModalOrder(null)}>✕</button>
            </div>
            <div className="cf-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, background: 'var(--panel-soft)', padding: 12, borderRadius: 12 }}>
                <div>
                  <span className="dashboard-label">Customer</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.86rem' }}>{invoiceModalOrder.customer_name || 'Shopper'}</strong>
                </div>
                <div>
                  <span className="dashboard-label">Email</span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{invoiceModalOrder.customer_email || '—'}</span>
                </div>
                <div>
                  <span className="dashboard-label">Payment Method</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.86rem' }}>{invoiceModalOrder.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Card'}</strong>
                </div>
                <div>
                  <span className="dashboard-label">Payment Status</span>
                  <strong style={{ color: 'var(--accent-3)', fontSize: '0.86rem', textTransform: 'uppercase' }}>{invoiceModalOrder.payment_status}</strong>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <span className="dashboard-label" style={{ marginBottom: 6 }}>Purchased Items</span>
                <div style={{ display: 'grid', gap: 8 }}>
                  {invoiceModalOrder.items?.map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--panel)', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--primary)' }}>{item.product_name}</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Qty: {item.quantity} · LKR {Number(item.unit_price || 0).toLocaleString()} each</div>
                      </div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>LKR {(Number(item.unit_price || 0) * item.quantity).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>Grand Total</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent)' }}>LKR {Number(invoiceModalOrder.grand_total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

/* ────────── Admin Customers Page ────────── */
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
    <AdminShell title="Registered Customer Roster" subtitle="Overview of all shoppers, client profiles, and verified member tiers.">
      <div className="monic-order-filters-wrap" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
          Total Accounts: {customers.length}
        </div>
        <div className="monic-order-search-box">
          <Search size={16} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="monic-order-search-input"
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div className="loader" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading customer roster…</p>
        </div>
      ) : filtered.length ? (
        <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--panel)' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        {(c.full_name || c.email).slice(0, 2).toUpperCase()}
                      </div>
                      <strong style={{ color: 'var(--primary)', fontSize: '0.92rem' }}>{c.full_name || 'Clothify Member'}</strong>
                    </div>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{c.email}</td>
                  <td>
                    <span className={`badge ${c.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                      {c.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.is_active ? 'badge-green' : 'badge-amber'}`}>
                      {c.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="dashboard-empty-box">
          <Users size={36} style={{ color: 'var(--muted)', marginBottom: 10 }} />
          <h3 style={{ margin: '0 0 6px', color: 'var(--primary)' }}>No Customers Found</h3>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.86rem' }}>No clients matched your query.</p>
        </div>
      )}
    </AdminShell>
  );
}

/* ────────── Admin Payments Page ────────── */
export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Array<{ id: string; order_id: string; order_number?: string; customer_name?: string; customer_email?: string; payment_method: string; amount: string | number; status: string; slipImage?: string | null; notes?: string | null; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<'all' | 'bank_transfer' | 'card'>('all');

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

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (methodFilter === 'all') return true;
      return p.payment_method === methodFilter;
    });
  }, [payments, methodFilter]);

  return (
    <AdminShell title="Payment Settlements &amp; Bank Slips" subtitle="Verify and reconcile bank transfers, deposit slips, and transaction logs.">
      <div className="monic-order-filters-wrap" style={{ marginBottom: 20 }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)' }}>
          Settlements ({filteredPayments.length})
        </span>

        <div className="monic-order-filter-pills">
          {(['all', 'bank_transfer', 'card'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              className={`monic-order-filter-btn ${methodFilter === tab ? 'active' : ''}`}
              onClick={() => setMethodFilter(tab)}
            >
              {tab === 'all' ? 'All Methods' : tab === 'bank_transfer' ? '🏦 Bank Transfers' : '💳 Cards'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div className="loader" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading payment logs…</p>
        </div>
      ) : filteredPayments.length ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredPayments.map((payment) => {
            const badge = statusStyle(payment.status);
            return (
              <div key={payment.id} className="monic-order-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                      }}
                    >
                      {(payment.customer_name || payment.customer_email || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>
                        {payment.order_number || payment.order_id}
                      </strong>
                      <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{payment.customer_name || payment.customer_email || 'Shopper'}</div>
                    </div>
                  </div>
                  <span className="badge" style={{ background: badge.background, color: badge.color, fontSize: '0.82rem', padding: '6px 14px' }}>
                    {badge.label}
                  </span>
                </div>

                <div className="monic-order-summary-strip" style={{ marginTop: 16 }}>
                  <div><span className="dashboard-label">Method</span><strong style={{ color: 'var(--primary)' }}>{payment.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : '💳 Card Payment'}</strong></div>
                  <div><span className="dashboard-label">Amount</span><strong style={{ color: 'var(--accent)', fontSize: '1.05rem' }}>LKR {Number(payment.amount || 0).toLocaleString()}</strong></div>
                  <div><span className="dashboard-label">Timestamp</span><span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '0.85rem' }}>{new Date(payment.created_at).toLocaleDateString()}</span></div>
                </div>

                {payment.slipImage ? (
                  <div style={{ marginTop: 16 }}>
                    <span className="dashboard-label" style={{ marginBottom: 6 }}>Attached Bank Slip</span>
                    <img
                      src={payment.slipImage}
                      alt="Bank slip"
                      style={{ maxWidth: 200, maxHeight: 140, borderRadius: 12, border: '1.5px solid var(--border)', cursor: 'pointer', objectFit: 'cover' }}
                      onClick={() => setSelectedSlip(payment.slipImage || null)}
                    />
                  </div>
                ) : payment.payment_method === 'bank_transfer' ? (
                  <div style={{ marginTop: 14, color: '#92400e', fontWeight: 700, fontSize: '0.82rem' }}>
                    No bank slip was uploaded.
                  </div>
                ) : null}

                {(payment.status === 'pending' || payment.status === 'failed') && (
                  <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                      disabled={processing === payment.order_id}
                      onClick={() => handleDecision(payment.order_id, 'paid')}
                    >
                      {processing === payment.order_id ? 'Processing…' : '✓ Accept Payment'}
                    </button>
                    <button
                      type="button"
                      style={{ padding: '8px 16px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 999, fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
                      disabled={processing === payment.order_id}
                      onClick={() => handleDecision(payment.order_id, 'rejected')}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="dashboard-empty-box">
          <CreditCard size={36} style={{ color: 'var(--muted)', marginBottom: 10 }} />
          <h3 style={{ margin: '0 0 6px', color: 'var(--primary)' }}>No Payment Logs</h3>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.86rem' }}>No settlement records found.</p>
        </div>
      )}

      {selectedSlip && (
        <div className="cf-modal-backdrop" onClick={() => setSelectedSlip(null)}>
          <div className="cf-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
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

/* ────────── Admin Catalog Page ────────── */
export function AdminCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setCategories] = useState<Category[]>([]);
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
      await loadCatalog();
      alert('Product created successfully.');
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Unable to add product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to remove this garment from the catalog?')) return;
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
    <AdminShell title="Storefront Catalog &amp; Inventory" subtitle="Upload new garment pieces, manage stock variants, and update price tags.">
      {/* ── Add product form ── */}
      <div className="dashboard-section-card" style={{ marginBottom: 24 }}>
        <h3 className="dashboard-card-title">Add New Garment to Catalog</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div>
            <label className="dashboard-label">Product Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Silk Linen Relaxed Shirt" className="auth-input-element" />
          </div>
          <div>
            <label className="dashboard-label">Brand Label</label>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Clothify Boutique" className="auth-input-element" />
          </div>
          <div>
            <label className="dashboard-label">Department Segment</label>
            <select
              value={form.segment}
              onChange={(e) => {
                const seg = e.target.value;
                const defaultCat = seg === 'Women' ? 'Dresses' : 'T-Shirts';
                setForm({ ...form, segment: seg, categoryName: defaultCat });
              }}
              className="auth-input-element"
            >
              <option value="Men">Men's Department</option>
              <option value="Women">Women's Department</option>
              <option value="Kids">Kids' Department</option>
            </select>
          </div>
          <div>
            <label className="dashboard-label">Category</label>
            <select value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} className="auth-input-element">
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
          </div>
          <div>
            <label className="dashboard-label">Price (LKR)</label>
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="8500" type="number" min="0" step="0.01" className="auth-input-element" />
          </div>
          <div>
            <label className="dashboard-label">Discount % (Optional)</label>
            <input value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} placeholder="0" type="number" min="0" max="100" className="auth-input-element" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="dashboard-label">Editorial Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Artisan crafted tailored garment with breathable texture..." className="auth-input-element" style={{ minHeight: 80, padding: 12, resize: 'vertical' }} />
          </div>

          {/* Image Upload Area */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="dashboard-label">Product Imagery</label>
            <input
              type="file" accept="image/*" multiple disabled={uploadingImages}
              style={{ padding: '12px', border: '2px dashed var(--border)', borderRadius: 14, width: '100%', background: 'var(--panel-soft)', cursor: 'pointer' }}
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                setUploadingImages(true);
                try {
                  for (const f of files) {
                    const reader = new FileReader();
                    await new Promise((resolve, reject) => {
                      reader.onload = async () => {
                        try {
                          const url = await uploadService.uploadImage(String(reader.result || ''));
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
            {uploadingImages && <div style={{ color: 'var(--accent)', fontSize: '0.84rem', marginTop: 8 }}>⏳ Uploading high-res images…</div>}
            {imageUrls.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                {imageUrls.map((url, idx) => (
                  <div key={url + idx} style={{ position: 'relative' }}>
                    <img src={url} alt={`preview-${idx}`} style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
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

        {/* Size & Color Matrix */}
        <div style={{ marginTop: 20, border: '1px solid var(--border)', borderRadius: 16, padding: 18, background: 'var(--panel-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 style={{ margin: 0, color: 'var(--primary)', fontWeight: 800 }}>Size &amp; Color Variants</h4>
            <button type="button" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={addVariantSize}>
              + Add Size Group
            </button>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {variantRows.map((row, sizeIndex) => (
              <div key={`size-${sizeIndex}`} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 14, background: 'var(--panel)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 12 }}>
                  <input value={row.size} onChange={(e) => updateVariantSize(sizeIndex, e.target.value)} placeholder="Size (e.g. S, M, L, XL)" className="auth-input-element" />
                  <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => addVariantColor(sizeIndex)}>+ Color</button>
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {row.colors.map((colorRow, colorIndex) => (
                    <div key={`color-${sizeIndex}-${colorIndex}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <input value={colorRow.color} onChange={(e) => updateVariantColor(sizeIndex, colorIndex, e.target.value)} placeholder="Color (e.g. Terracotta, Sand, Olive)" className="auth-input-element" />
                      <input value={colorRow.stock} onChange={(e) => updateVariantStock(sizeIndex, colorIndex, e.target.value)} placeholder="Stock qty" type="number" min="0" className="auth-input-element" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button type="button" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.92rem' }} onClick={handleCreate} disabled={submitting}>
            {submitting ? '⏳ Publishing Product…' : '+ Publish Product to Store'}
          </button>
        </div>
      </div>

      {/* ── Product List ── */}
      <div className="dashboard-section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <h3 className="dashboard-card-title" style={{ margin: 0 }}>Inventory Catalog ({filteredInventory.length})</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="monic-order-search-box">
              <Search size={14} color="var(--muted)" />
              <input
                type="text"
                placeholder="Search styles..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="monic-order-search-input"
              />
            </div>
            <button type="button" className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={loadCatalog}>↻ Refresh</button>
          </div>
        </div>

        {/* Inventory Segment Tabs */}
        <div className="monic-order-filter-pills" style={{ marginBottom: 18 }}>
          {(['All', 'Men', 'Women', 'Kids'] as const).map((seg) => (
            <button
              key={seg}
              type="button"
              className={`monic-order-filter-btn ${inventorySegment === seg ? 'active' : ''}`}
              onClick={() => setInventorySegment(seg)}
            >
              {seg === 'All' ? '🌟 All Departments' : `${seg}'s`} ({seg === 'All' ? products.length : products.filter((p) => String((p as any).segment || '').toLowerCase() === seg.toLowerCase()).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div className="loader" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading catalog…</p>
          </div>
        ) : filteredInventory.length ? (
          <div style={{ display: 'grid', gap: 14 }}>
            {filteredInventory.map((product) => {
              const thumbnail = product.images?.length ? product.images[0].image_url : undefined;
              const price     = Number(product.final_price || product.price || 0);
              const oldPrice  = Number(product.price || 0);
              const discount  = Math.round(Number(product.discount_percentage || 0));

              return (
                <div key={product.id} className="monic-order-card" style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ width: 84, height: 104, flexShrink: 0, borderRadius: 12, overflow: 'hidden', background: 'var(--panel-soft)', border: '1px solid var(--border)' }}>
                    {thumbnail ? (
                      <img src={thumbnail} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: '1.5rem' }}>👕</div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div>
                        <strong style={{ fontSize: '1.02rem', color: 'var(--primary)' }}>{product.name}</strong>
                        <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 2 }}>{product.brand || 'Clothify Boutique'}</div>
                        <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span className="badge badge-purple">{(product as any).segment || 'Women'}</span>
                          <span className="badge badge-green">{product.category_name || 'Garment'}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>LKR {price.toLocaleString()}</div>
                        {discount > 0 ? (
                          <div style={{ color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 700 }}>
                            -{discount}% · <span style={{ color: 'var(--muted)', textDecoration: 'line-through' }}>LKR {oldPrice.toLocaleString()}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Price Update & Delete Row */}
                    <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>Price (LKR):</span>
                        <input
                          value={priceInputs[product.id] ?? String(Number(product.final_price || product.price || 0))}
                          onChange={(e) => setPriceInputs((prev) => ({ ...prev, [product.id]: e.target.value }))}
                          type="number" min="0"
                          className="auth-input-element"
                          style={{ width: 110, minHeight: 34, padding: '4px 10px', fontSize: '0.86rem' }}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                        onClick={() => handlePriceUpdate(product.id)}
                        disabled={updatingPriceId === product.id}
                      >
                        {updatingPriceId === product.id ? '…' : 'Update Price'}
                      </button>
                      <button
                        type="button"
                        style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 999, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-empty-box">
            <ShoppingBag size={36} style={{ color: 'var(--muted)', marginBottom: 10 }} />
            <h3 style={{ margin: '0 0 6px', color: 'var(--primary)' }}>No Products Match</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.86rem' }}>Try clearing your search query or department filter.</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

/* ────────── Reviews & Feedback Moderation Page ────────── */
export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllReviews();
      setReviews(data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleFeatured = async (review: any) => {
    setActionLoadingId(review.id);
    const newStatus = !review.isFeatured;

    if (newStatus && reviews.filter((r) => r.isFeatured && r.id !== review.id).length >= 3) {
      alert('You can select a maximum of 3 reviews to feature on the Home Page. Please unfeature one before selecting another.');
      setActionLoadingId(null);
      return;
    }

    try {
      await adminService.toggleFeaturedReview(review.id, newStatus);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, isFeatured: newStatus } : r))
      );
      setToastMsg(
        newStatus
          ? `Review by "${review.userName}" is now featured on the Home Page!`
          : `Review by "${review.userName}" removed from Home Page.`
      );
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update feature status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteReview = async (reviewId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete the review from ${userName}?`)) {
      return;
    }
    setActionLoadingId(reviewId);
    try {
      await adminService.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setToastMsg('Review deleted successfully.');
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete review');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (ratingFilter !== 'all' && r.rating !== Number(ratingFilter)) {
        return false;
      }
      if (featuredFilter === 'featured' && !r.isFeatured) {
        return false;
      }
      if (featuredFilter === 'not_featured' && r.isFeatured) {
        return false;
      }
      if (search) {
        const query = search.toLowerCase();
        const matchName = String(r.userName || '').toLowerCase().includes(query);
        const matchEmail = String(r.userEmail || '').toLowerCase().includes(query);
        const matchText = String(r.reviewText || '').toLowerCase().includes(query);
        const matchProd = String(r.productName || '').toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchText && !matchProd) return false;
      }
      return true;
    });
  }, [reviews, ratingFilter, featuredFilter, search]);

  const featuredCount = reviews.filter((r) => r.isFeatured).length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <AdminShell
      title="Customer Reviews & Feedback Curation"
      subtitle="Inspect customer ratings, moderate feedback, and choose which customer reviews are showcased on the Home Page."
    >
      <div className="dashboard-content-stack">
        {/* KPI Row */}
        <div className="dashboard-metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="dashboard-metric-card">
            <span className="dashboard-metric-label">Total Feedbacks</span>
            <span className="dashboard-metric-val">{reviews.length}</span>
            <span className="dashboard-metric-sub">Across products & store</span>
          </div>
          <div className="dashboard-metric-card">
            <span className="dashboard-metric-label">Featured on Home (Max 3)</span>
            <span className="dashboard-metric-val" style={{ color: 'var(--accent)' }}>{featuredCount} / 3</span>
            <span className="dashboard-metric-sub">Displaying on homepage</span>
          </div>
          <div className="dashboard-metric-card">
            <span className="dashboard-metric-label">Average Customer Score</span>
            <span className="dashboard-metric-val" style={{ color: '#166534' }}>★ {avgRating}</span>
            <span className="dashboard-metric-sub">Out of 5.0 stars</span>
          </div>
          <div className="dashboard-metric-card">
            <span className="dashboard-metric-label">5-Star Testimonials</span>
            <span className="dashboard-metric-val" style={{ color: '#f59e0b' }}>
              {reviews.filter((r) => r.rating === 5).length}
            </span>
            <span className="dashboard-metric-sub">Top tier satisfaction</span>
          </div>
        </div>

        {toastMsg && (
          <div style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 14, padding: '12px 18px', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} /> {toastMsg}
          </div>
        )}

        {/* Filters and search bar */}
        <div className="dashboard-section-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 260 }}>
              <div className="auth-input-wrapper" style={{ flex: 1 }}>
                <span className="auth-input-icon"><Search size={15} /></span>
                <input
                  type="text"
                  placeholder="Search reviews by customer, comment, or garment..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="auth-input-element"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="auth-input-element"
                style={{ width: 'auto', padding: '8px 14px', fontSize: '0.84rem' }}
              >
                <option value="all">All Visibility</option>
                <option value="featured">Featured on Home Only</option>
                <option value="not_featured">Not Featured</option>
              </select>

              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="auth-input-element"
                style={{ width: 'auto', padding: '8px 14px', fontSize: '0.84rem' }}
              >
                <option value="all">All Star Ratings</option>
                <option value="5">5 Stars Only</option>
                <option value="4">4 Stars Only</option>
                <option value="3">3 Stars Only</option>
                <option value="2">2 Stars Only</option>
                <option value="1">1 Star Only</option>
              </select>

              <button
                type="button"
                onClick={loadReviews}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.84rem' }}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="dashboard-section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="dashboard-card-title" style={{ margin: 0 }}>
              Customer Feedbacks ({filteredReviews.length})
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              Click <strong>"Feature on Home"</strong> to choose reviews shown on the Home Page customer review section.
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '50px 0', textAlign: 'center' }}>
              <div className="loader" style={{ margin: '0 auto 14px' }} />
              <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading customer feedback...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="dashboard-empty-box">
              <MessageSquare size={36} style={{ color: 'var(--muted)', marginBottom: 10 }} />
              <h3 style={{ margin: '0 0 6px', color: 'var(--primary)' }}>No Reviews Found</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.86rem' }}>
                No feedback records match your current filter criteria.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {filteredReviews.map((rev) => {
                const isWorking = actionLoadingId === rev.id;
                return (
                  <div
                    key={rev.id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: 16,
                      border: `1.5px solid ${rev.isFeatured ? 'rgba(196, 75, 43, 0.35)' : 'var(--border)'}`,
                      background: rev.isFeatured ? 'rgba(196, 75, 43, 0.03)' : 'var(--panel)',
                      boxShadow: rev.isFeatured ? '0 4px 18px rgba(196, 75, 43, 0.08)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                            {rev.userName}
                          </strong>
                          {rev.userEmail && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                              ({rev.userEmail})
                            </span>
                          )}
                          {rev.isVerified && (
                            <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                              ✓ Verified Buyer
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < rev.rating ? '#F59E0B' : 'none'}
                                color={i < rev.rating ? '#F59E0B' : '#d1d5db'}
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                            · Focus: <strong>{rev.productName || rev.feedbackType}</strong>
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                            · {new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(rev)}
                          disabled={isWorking}
                          style={{
                            padding: '7px 16px',
                            borderRadius: 999,
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            border: rev.isFeatured ? '1px solid #166534' : '1px solid var(--border)',
                            background: rev.isFeatured ? '#166534' : 'var(--panel-soft)',
                            color: rev.isFeatured ? '#ffffff' : 'var(--primary)',
                            boxShadow: rev.isFeatured ? '0 2px 8px rgba(22, 101, 52, 0.25)' : 'none',
                          }}
                        >
                          {rev.isFeatured ? (
                            <>
                              ★ Featured on Home Page
                            </>
                          ) : (
                            <>
                              ☆ Feature on Home
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev.id, rev.userName)}
                          disabled={isWorking}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'pointer',
                          }}
                          title="Delete review"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Headline */}
                    {rev.title && (
                      <h4 style={{ margin: '0 0 6px', fontSize: '0.94rem', color: 'var(--primary)', fontWeight: 700 }}>
                        {rev.title}
                      </h4>
                    )}

                    {/* Comment */}
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6, background: 'var(--panel-soft)', padding: '10px 14px', borderRadius: 10 }}>
                      "{rev.reviewText}"
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}



