import { ArrowRight, Bell, PackageCheck, ShoppingBag, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/auth.context';
import * as adminService from '../../services/admin.service';
import * as productService from '../../services/product.service';
import type { Category, Product } from '../../types/product.types';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/catalog', label: 'Catalog' },
];

function AdminShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div style={styles.pageShell}>
      <div style={styles.container}>
        <aside style={styles.sidebar}>
          <div style={styles.brandWrap}>
            <div style={styles.brandBadge}>F</div>
            <div>
              <p style={styles.sidebarLabel}>Admin panel</p>
              <strong style={styles.sidebarTitle}>Clothify</strong>
            </div>
          </div>

          <nav style={styles.navList}>
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                end={to === '/admin/dashboard'}
                to={to}
                style={({ isActive }) => ({
                  ...styles.navItem,
                  ...(isActive || (location.pathname.startsWith(to) && to !== '/admin/dashboard') ? styles.navItemActive : {}),
                })}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main style={styles.mainPanel}>
          <header style={styles.header}>
            <div>
              <p style={styles.eyebrow}>Administration</p>
              <h1 style={styles.title}>{title}</h1>
              <p style={styles.subtitle}>{subtitle}</p>
            </div>
            <div style={styles.headerActions}>
              <button type="button" style={styles.iconButton} aria-label="Notifications">
                <Bell size={18} />
              </button>
              <button type="button" style={styles.logoutButton} onClick={logout}>Logout</button>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<{ totalUsers?: number; totalCustomers?: number; totalProducts?: number; totalOrders?: number; recentCustomers?: Array<{ id: string; full_name: string; email: string; role: string; created_at: string }> } | null>(null);
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
    <AdminShell title="Admin Dashboard" subtitle={`Welcome, ${user?.fullName || 'Admin'}`}>
      <div style={styles.statsGrid}>
        <StatCard title="Total Users" value={String(summary?.totalUsers ?? 0)} subtitle="All registered accounts" icon={Users} />
        <StatCard title="Customers" value={String(summary?.totalCustomers ?? 0)} subtitle="Active customer accounts" icon={Users} />
        <StatCard title="Products" value={String(summary?.totalProducts ?? 0)} subtitle="Published catalog items" icon={ShoppingBag} />
        <StatCard title="Orders" value={String(summary?.totalOrders ?? 0)} subtitle="Lifetime store orders" icon={PackageCheck} />
      </div>

      <div style={styles.lowerGrid}>
        <section style={styles.cardBlock}>
          <h3 style={styles.cardTitle}>Quick Access</h3>
          <div style={styles.quickActions}>
            <Link to="/products" style={styles.primaryAction}>View Store</Link>
            <Link to="/admin/orders" style={styles.secondaryAction}>Manage Orders</Link>
            <Link to="/admin/payments" style={styles.secondaryAction}>Manage Payments</Link>
            <Link to="/admin/customers" style={styles.secondaryAction}>Manage Customers</Link>
            <Link to="/admin/catalog" style={styles.secondaryAction}>Manage Catalog</Link>
          </div>
        </section>

        <section style={styles.cardBlock}>
          <h3 style={styles.cardTitle}>Admin Profile</h3>
          <div style={styles.profileRow}><strong>Name:</strong> {user?.fullName || 'Admin'}</div>
          <div style={styles.profileRow}><strong>Email:</strong> {user?.email}</div>
          <div style={styles.profileRow}><strong>Role:</strong> {user?.role}</div>
        </section>
      </div>

      <section style={{ ...styles.cardBlock, marginTop: '24px' }}>
        <h3 style={styles.cardTitle}>Recent Customers</h3>
        {loading ? (
          <div style={styles.emptyBox}>Loading recent customers…</div>
        ) : (summary?.recentCustomers?.length ? (
          <div style={styles.listWrap}>
            {summary.recentCustomers.map((customer) => (
              <div key={customer.id} style={styles.listItem}>
                <div>
                  <strong>{customer.full_name || 'Unnamed customer'}</strong>
                  <div style={styles.muted}>{customer.email}</div>
                </div>
                <span style={styles.badge}>{customer.role}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyBox}>No recent customer signups yet.</div>
        ))}
      </section>
    </AdminShell>
  );
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Array<{ id: string; order_number: string; status: string; grand_total: string | number; payment_status: string; payment_method?: string; slipImage?: string | null; created_at: string; customer_name?: string; customer_email?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await adminService.getOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePaymentDecision = async (orderId: string, status: 'paid' | 'rejected') => {
    setProcessing(orderId);
    try {
      await adminService.updatePaymentStatus(orderId, status);
      await load();
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AdminShell title="Orders" subtitle="Review recent purchases and payment status.">
      {loading ? (
        <div style={styles.emptyBox}>Loading orders…</div>
      ) : orders.length ? (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Slip</th>
                <th>Total</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.customer_name || order.customer_email || 'Unknown customer'}</td>
                  <td><span style={styles.badge}>{order.status}</span></td>
                  <td>{order.payment_method || 'card'} / {order.payment_status}</td>
                  <td>
                    {order.slipImage ? (
                      <a href={order.slipImage} target="_blank" rel="noreferrer">View slip</a>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td>LKR {Number(order.grand_total || 0).toLocaleString()}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    {order.payment_status === 'pending' && order.slipImage ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" style={{ ...styles.primaryAction, padding: '8px 10px', fontSize: '0.8rem' }} disabled={processing === order.id} onClick={() => handlePaymentDecision(order.id, 'paid')}>
                          {processing === order.id ? 'Processing…' : 'Confirm'}
                        </button>
                        <button type="button" style={{ ...styles.deleteButton, padding: '8px 10px', fontSize: '0.8rem' }} disabled={processing === order.id} onClick={() => handlePaymentDecision(order.id, 'rejected')}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.emptyBox}>No orders have been placed yet. Once customers check out, they will appear here.</div>
      )}
    </AdminShell>
  );
}

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Array<{ id: string; full_name: string | null; email: string; role: string; is_active: boolean; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <AdminShell title="Customers" subtitle="Manage registered customer accounts.">
      {loading ? (
        <div style={styles.emptyBox}>Loading customers…</div>
      ) : customers.length ? (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.full_name || 'Unnamed customer'}</td>
                  <td>{customer.email}</td>
                  <td>{customer.role}</td>
                  <td><span style={{ ...styles.badge, background: customer.is_active ? '#dcfce7' : '#f3f4f6', color: customer.is_active ? '#166534' : '#374151' }}>{customer.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.emptyBox}>There are no registered customers yet.</div>
      )}
    </AdminShell>
  );
}

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Array<{ id: string; order_id: string; order_number?: string; customer_name?: string; customer_email?: string; payment_method: string; amount: string | number; status: string; slipImage?: string | null; notes?: string | null; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await adminService.getPayments();
      setPayments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDecision = async (orderId: string, status: 'paid' | 'rejected') => {
    setProcessing(orderId);
    try {
      await adminService.updatePaymentStatus(orderId, status);
      await load();
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AdminShell title="Payments" subtitle="Review uploaded bank transfer slips and decide whether to approve the payment.">
      {loading ? (
        <div style={styles.emptyBox}>Loading payment records…</div>
      ) : payments.length ? (
        <div style={{ display: 'grid', gap: '18px' }}>
          {payments.map((payment) => (
            <div key={payment.id} style={styles.cardBlock}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <strong>{payment.order_number || payment.order_id}</strong>
                  <div style={styles.muted}>{payment.customer_name || payment.customer_email || 'Unknown customer'}</div>
                </div>
                <span style={{ ...styles.badge, background: payment.status === 'paid' ? '#dcfce7' : payment.status === 'failed' ? '#fee2e2' : '#fef3c7', color: payment.status === 'paid' ? '#166534' : payment.status === 'failed' ? '#991b1b' : '#92400e' }}>{payment.status}</span>
              </div>

              <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div><span style={styles.label}>Method</span><strong>{payment.payment_method}</strong></div>
                <div><span style={styles.label}>Amount</span><strong>LKR {Number(payment.amount || 0).toLocaleString()}</strong></div>
                <div><span style={styles.label}>Date</span><strong>{new Date(payment.created_at).toLocaleDateString()}</strong></div>
              </div>

              {payment.notes ? <div style={{ marginTop: '14px' }}><span style={styles.label}>Customer note</span><div>{payment.notes}</div></div> : null}

              {payment.slipImage ? (
                <div style={{ marginTop: '14px' }}>
                  <span style={styles.label}>Uploaded slip</span>
                  <div style={{ marginTop: '10px' }}>
                    <img src={payment.slipImage} alt="Bank slip" style={{ maxWidth: '300px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#fff' }} />
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '12px' }}>No slip image uploaded.</div>
              )}

              {payment.status === 'pending' || payment.status === 'failed' ? (
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" style={{ ...styles.primaryAction, padding: '10px 14px' }} disabled={processing === payment.order_id} onClick={() => handleDecision(payment.order_id, 'paid')}>
                    {processing === payment.order_id ? 'Processing…' : 'Accept Payment'}
                  </button>
                  <button type="button" style={{ ...styles.deleteButton, padding: '10px 14px' }} disabled={processing === payment.order_id} onClick={() => handleDecision(payment.order_id, 'rejected')}>
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyBox}>No payment submissions yet.</div>
      )}
    </AdminShell>
  );
}

export function AdminCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', brand: '', segment: 'All', categoryName: 'All', price: '', discountPercentage: '0', description: '' });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [variantRows, setVariantRows] = useState<Array<{ size: string; colors: Array<{ color: string; stock: string }> }>>([
    { size: '', colors: [{ color: '', stock: '0' }] },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [updatingPriceId, setUpdatingPriceId] = useState<string | null>(null);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});

  const loadCatalog = async () => {
    try {
      const params: Record<string, unknown> = { limit: 200 };
      if (form.segment && form.segment !== 'All') params.segment = form.segment;
      if (form.categoryName && form.categoryName !== 'All') params.category = form.categoryName;

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const productCount = useMemo(() => products.length, [products]);

  const addVariantSize = () => {
    setVariantRows((prev) => [...prev, { size: '', colors: [{ color: '', stock: '0' }] }]);
  };

  const addVariantColor = (sizeIndex: number) => {
    setVariantRows((prev) => prev.map((row, index) => index === sizeIndex ? { ...row, colors: [...row.colors, { color: '', stock: '0' }] } : row));
  };

  const updateVariantSize = (sizeIndex: number, value: string) => {
    setVariantRows((prev) => prev.map((row, index) => index === sizeIndex ? { ...row, size: value } : row));
  };

  const updateVariantColor = (sizeIndex: number, colorIndex: number, value: string) => {
    setVariantRows((prev) => prev.map((row, index) => index === sizeIndex ? {
      ...row,
      colors: row.colors.map((colorRow, innerIndex) => innerIndex === colorIndex ? { ...colorRow, color: value } : colorRow),
    } : row));
  };

  const updateVariantStock = (sizeIndex: number, colorIndex: number, value: string) => {
    setVariantRows((prev) => prev.map((row, index) => index === sizeIndex ? {
      ...row,
      colors: row.colors.map((colorRow, innerIndex) => innerIndex === colorIndex ? { ...colorRow, stock: value } : colorRow),
    } : row));
  };

  const buildVariantPayload = () => {
    return variantRows
      .filter((row) => String(row.size).trim())
      .map((row) => ({
        size: row.size.trim(),
        colors: row.colors
          .filter((colorRow) => String(colorRow.color).trim())
          .map((colorRow) => ({
            color: colorRow.color.trim(),
            stockQuantity: Number(colorRow.stock || 0),
          })),
      }))
      .filter((row) => row.colors.length > 0)
      .map((row) => ({ size: row.size, colors: row.colors }));
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      alert('Please enter a product name.');
      return;
    }
    const numericPrice = Number(form.price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      alert('Please enter a valid product price.');
      return;
    }
    const variants = buildVariantPayload();
    if (!variants.length) {
      alert('Add at least one size and color combination with stock before creating the product.');
      return;
    }
    setSubmitting(true);
    try {
      await productService.createProduct({
        name: form.name,
        brand: form.brand || 'Clothify',
        segment: form.segment,
        categoryName: form.categoryName,
        description: form.description || 'Admin created product',
        price: numericPrice,
        discountPercentage: Number(form.discountPercentage ?? 0),
        images: imageUrls,
        // keep backward-compatible string input removed; we now use uploaded images array
        variants,
      });
      setForm({ name: '', brand: '', segment: 'Men', categoryName: 'T-Shirts', price: '', discountPercentage: '0', description: '' });
      setImageUrls([]);
      setVariantRows([{ size: '', colors: [{ color: '', stock: '0' }] }]);
      await loadCatalog();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Unable to add product. Please check the details and try again.');
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
    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      alert('Please enter a valid price.');
      return;
    }
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
      <section style={styles.cardBlock}>
        <h3 style={styles.cardTitle}>Add New Product</h3>
        <div style={styles.productFormGrid}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" style={styles.input} />
          <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brand" style={styles.input} />
          <select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} style={styles.input}>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>

          <select value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} style={styles.input}>
            {/* fixed category types for the second filter */}
            <option value="T-Shirts">T-Shirts</option>
            <option value="Shirts">Shirts</option>
            <option value="Dresses">Dresses</option>
            <option value="Jackets">Jackets</option>
            <option value="Jeans">Jeans</option>
            <option value="Trousers">Trousers</option>
            <option value="Skirts">Skirts</option>
            <option value="Blouses">Blouses</option>
          </select>
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" type="number" min="0" step="0.01" style={styles.input} />
          <input
            value={form.discountPercentage}
            onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
            placeholder="Discount %"
            type="number"
            min="0"
            max="100"
            step="0.01"
            style={styles.input}
          />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" style={{ ...styles.input, minHeight: '100px' }} />
          <div style={{ display: 'grid', gap: '8px', gridColumn: 'span 2' }}>
            <div>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px' }}>Upload images</label>
              <input type="file" accept="image/*" multiple disabled={uploadingImages} onChange={async (e) => {
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
                  console.error('Upload error', err);
                                  const serverMessage = err?.response?.data?.message || err?.message || 'Unable to upload images';
                                  alert(serverMessage);
                                } finally { setUploadingImages(false); }
              }} />
              {uploadingImages ? <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Uploading images…</div> : null}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {imageUrls.map((url, idx) => (
                <div key={url + idx} style={{ position: 'relative' }}>
                  <img src={url} alt={`preview-${idx}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <button type="button" onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))} style={{ position: 'absolute', right: -6, top: -6, background: '#fee2e2', border: 'none', borderRadius: 12, padding: '4px 6px', cursor: 'pointer' }}>x</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '18px', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0 }}>Size & Color Stock</h4>
            <button type="button" style={{ ...styles.secondaryAction, padding: '8px 12px' }} onClick={addVariantSize}>Add size</button>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {variantRows.map((row, sizeIndex) => (
              <div key={`size-${sizeIndex}`} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px', background: '#f9fafb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '10px' }}>
                  <input value={row.size} onChange={(e) => updateVariantSize(sizeIndex, e.target.value)} placeholder="Size (e.g. S, M, L)" style={styles.input} />
                  <button type="button" style={{ ...styles.secondaryAction, padding: '10px 12px' }} onClick={() => addVariantColor(sizeIndex)}>Add color</button>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {row.colors.map((colorRow, colorIndex) => (
                    <div key={`color-${sizeIndex}-${colorIndex}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input value={colorRow.color} onChange={(e) => updateVariantColor(sizeIndex, colorIndex, e.target.value)} placeholder="Color" style={styles.input} />
                      <input value={colorRow.stock} onChange={(e) => updateVariantStock(sizeIndex, colorIndex, e.target.value)} placeholder="Stock" type="number" min="0" style={styles.input} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button type="button" style={styles.primaryAction} onClick={handleCreate} disabled={submitting}>{submitting ? 'Saving…' : 'Add Product'}</button>
        </div>
      </section>

      <section style={{ ...styles.cardBlock, marginTop: '24px' }}>
        <h3 style={styles.cardTitle}>Catalog Inventory ({productCount})</h3>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', margin: '12px 0 18px' }}>
          <button type="button" style={{ ...styles.primaryAction, padding: '10px 12px' }} onClick={() => loadCatalog()}>Refresh</button>
        </div>

        {loading ? (
          <div style={styles.emptyBox}>Loading catalog…</div>
        ) : products.length ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {products.map((product) => {
              const variantSummary = formatVariantInventory(product.variants ?? []);
              const thumbnail = product.images && product.images.length ? product.images[0].image_url : undefined;
              const price = Number(product.final_price || product.price || 0);
              const oldPrice = Number(product.price || 0);
              const discount = Math.round(Number(product.discount_percentage || 0));

              return (
                <div key={product.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#fff', border: '1px solid #e5e7eb', padding: '12px', borderRadius: 12 }}>
                  <div style={{ width: 90, height: 90, flexShrink: 0 }}>
                    {thumbnail ? <img src={thumbnail} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : <div style={{ width: '100%', height: '100%', background: '#f3f4f6', borderRadius: 8 }} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '1rem' }}>{product.name}</strong>
                        <div style={styles.muted}>{product.brand || '—'}</div>
                        <div style={{ marginTop: 6 }}><span style={styles.badge}>{product.segment || '—'}</span> <span style={{ marginLeft: 8, color: '#6b7280' }}>{product.category_name || '—'}</span></div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>LKR {price.toLocaleString()}</div>
                        {discount > 0 ? <div style={{ color: '#ef4444' }}>-{discount}% <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>LKR {oldPrice.toLocaleString()}</span></div> : <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>No discount</div>}
                      </div>
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ minWidth: 240 }}>
                        <div style={styles.label}>Variants</div>
                       {product.variants && product.variants.length ? (
                         <div style={{ display: 'grid', gap: 8 }}>
                           {(() => {
                             const grouped: Record<string, any[]> = {};
                             (product.variants || []).forEach((v: any) => {
                               const size = String(v.size || 'N/A');
                               grouped[size] = grouped[size] || [];
                               grouped[size].push(v);
                             });
                             return Object.keys(grouped).map((sizeKey) => (
                               <div key={`${product.id}-size-${sizeKey}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                 <div style={{ fontWeight: 700, minWidth: 60 }}>{sizeKey}</div>
                                 <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                   {grouped[sizeKey].map((v: any) => (
                                     <div key={`${product.id}-${sizeKey}-${v.color}`} style={{ background: '#eef2ff', padding: '6px 8px', borderRadius: 8 }}>
                                       {v.color}: <strong>{v.stock_quantity ?? v.stock ?? 0}</strong>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             ));
                           })()}
                         </div>
                       ) : <div style={{ color: '#6b7280' }}>No variants</div>}
                      </div>

                      <div>
                        <div style={styles.label}>Stock</div>
                        <div><strong>{product.stock_quantity ?? 0}</strong></div>
                      </div>

                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          value={priceInputs[product.id] ?? String(Number(product.final_price || product.price || 0))}
                          onChange={(e) => setPriceInputs((prev) => ({ ...prev, [product.id]: e.target.value }))}
                          type="number"
                          min="0"
                          style={{ ...styles.input, width: '110px' }}
                        />
                        <button type="button" style={{ ...styles.primaryAction, padding: '8px 12px' }} onClick={() => handlePriceUpdate(product.id)} disabled={updatingPriceId === product.id}>
                          {updatingPriceId === product.id ? 'Saving…' : 'Update'}
                        </button>

                        <button type="button" style={styles.deleteButton} onClick={() => handleDelete(product.id)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.emptyBox}>No products found. Add your first product above.</div>
        )}
      </section>
    </AdminShell>
  );
}

function formatVariantInventory(variants: Array<{ size?: string; color?: string; stock_quantity?: number | string }> = []) {
  if (!variants.length) return [] as Array<{ label: string; stock: string }>;

  const grouped = new Map<string, number>();
  variants.forEach((variant) => {
    const size = String(variant.size ?? 'N/A').trim() || 'N/A';
    const color = String(variant.color ?? 'N/A').trim() || 'N/A';
    const stock = Number(variant.stock_quantity ?? 0);
    const key = `${size} / ${color}`;
    grouped.set(key, (grouped.get(key) ?? 0) + stock);
  });

  return Array.from(grouped.entries()).map(([label, stock]) => ({ label, stock: String(stock) }));
}

function StatCard({ title, value, subtitle, icon: Icon }: { title: string; value: string; subtitle: string; icon: typeof ShoppingBag }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statHeader}>
        <div style={styles.statIcon}><Icon size={20} /></div>
        <span style={styles.statTitle}>{title}</span>
      </div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statSubtitle}>{subtitle}</div>
      <div style={styles.statArrow}><ArrowRight size={16} /></div>
    </div>
  );
}

const styles = {
  pageShell: { minHeight: '100vh', background: '#f5f2ee', padding: '32px 20px 60px' },
  container: { maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '28px', alignItems: 'flex-start' },
  sidebar: { width: '260px', background: '#fff', borderRadius: '22px', padding: '18px 16px', boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)', position: 'sticky', top: '24px' },
  brandWrap: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  brandBadge: { width: '42px', height: '42px', borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#fff', background: '#111827', fontWeight: 800 },
  sidebarLabel: { margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.08em' },
  sidebarTitle: { fontSize: '1.1rem', color: '#111827' },
  navList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  navItem: { color: '#1f2937', textDecoration: 'none', display: 'block', padding: '10px 12px', borderRadius: '12px', fontWeight: 600 },
  navItemActive: { background: '#eef2ff', color: '#1d4ed8' },
  mainPanel: { flex: 1, background: '#fff', borderRadius: '22px', boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)', padding: '28px 28px 32px' },
  header: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', marginBottom: '18px' },
  eyebrow: { margin: 0, color: '#d97706', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em', fontSize: '0.76rem' },
  title: { margin: '6px 0 0', fontSize: 'clamp(2rem, 3vw, 2.8rem)', color: '#111827' },
  subtitle: { margin: '6px 0 0', color: '#4b5563', fontSize: '1rem' },
  headerActions: { display: 'flex', gap: '12px', alignItems: 'center' },
  iconButton: { width: '42px', height: '42px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', display: 'grid', placeItems: 'center', cursor: 'pointer' },
  logoutButton: { border: 'none', borderRadius: '10px', background: '#111827', color: '#fff', fontWeight: 700, padding: '10px 16px', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px', marginBottom: '24px' },
  statCard: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '18px', position: 'relative' },
  statHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  statIcon: { width: '38px', height: '38px', display: 'grid', placeItems: 'center', background: '#e0f2fe', color: '#0369a1', borderRadius: '12px' },
  statTitle: { fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280' },
  statValue: { fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: '8px' },
  statSubtitle: { color: '#4b5563' },
  statArrow: { position: 'absolute', right: '18px', bottom: '18px', color: '#111827' },
  lowerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' },
  cardBlock: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '20px' },
  cardTitle: { margin: '0 0 14px', fontSize: '1.15rem', color: '#111827' },
  quickActions: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
  primaryAction: { background: '#111827', color: '#fff', borderRadius: '12px', padding: '12px 18px', fontWeight: 700, textDecoration: 'none', border: 'none', cursor: 'pointer' },
  secondaryAction: { background: '#e5e7eb', color: '#111827', borderRadius: '12px', padding: '12px 18px', fontWeight: 700, textDecoration: 'none' },
  profileRow: { marginBottom: '10px', color: '#374151' },
  listWrap: { display: 'flex', flexDirection: 'column', gap: '12px' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '12px', background: '#fff', border: '1px solid #e5e7eb' },
  muted: { color: '#6b7280', marginTop: '4px', fontSize: '0.9rem' },
  label: { display: 'block', color: '#4b5563', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' },
  badge: { display: 'inline-flex', alignItems: 'center', padding: '5px 10px', borderRadius: '999px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 700 },
  emptyBox: { padding: '20px', borderRadius: '12px', background: '#fff', border: '1px dashed #d1d5db', color: '#4b5563' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', background: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' },
  productFormGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' },
  deleteButton: { display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', padding: '8px 10px', cursor: 'pointer', fontWeight: 700 },
} as const;
