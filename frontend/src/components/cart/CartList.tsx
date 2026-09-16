import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  Upload,
} from 'lucide-react';
import * as cartService from '../../services/cart.service';
import * as orderService from '../../services/order.service';
import * as uploadService from '../../services/upload.service';
import { useAuth } from '../../services/auth.context';
import { useCart } from '../../services/cart.context';

export function CartList() {
  const { user, loading: authLoading } = useAuth();
  const { reload: reloadGlobalCart } = useCart();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');
  const [slipFile, setSlipFile] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
      reloadGlobalCart();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait until auth state is resolved before fetching
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    load();
  }, [authLoading, user]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'WELCOME15') {
      setDiscountApplied(true);
      setActionError(null);
    } else {
      setActionError('Invalid promo code. Try WELCOME15 for 15% off.');
    }
  };

  const handleCheckout = async () => {
    setActionError(null);
    if (!cart || !cart.items || !cart.items.length) return;
    setCheckingOut(true);

    try {
      if (paymentMethod === 'bank_transfer' && !slipFile) {
        setActionError('Please upload your bank deposit slip before completing checkout.');
        setCheckingOut(false);
        return;
      }

      let slipImage: string | null = null;
      if (paymentMethod === 'bank_transfer' && slipFile) {
        slipImage = await uploadService.uploadImage(slipFile);
        if (!slipImage) {
          throw new Error('Could not upload the bank slip. Try a smaller JPG or PNG.');
        }
      }

      const payload: {
        paymentMethod: 'card' | 'bank_transfer';
        slipImage?: string | null;
        items: Array<{ productId: string; quantity: number; variantId?: string | null; unitPrice: number }>;
      } = {
        paymentMethod,
        slipImage,
        items: cart.items.map((item: any) => ({
          productId: item.product_id,
          quantity: item.quantity,
          variantId: item.variant_id ?? null,
          unitPrice: Number(item.price_at_time || 0),
        })),
      };

      const newOrder = await orderService.createOrder(payload);
      await cartService.clearCart();
      setOrderSuccess(newOrder?.order_number || 'ORD-SUCCESS');
    } catch (err: any) {
      console.error(err);
      setActionError(err?.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="loader" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading shopping bag...</p>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div
        style={{
          background: 'var(--panel)',
          borderRadius: 24,
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px solid var(--border)',
          maxWidth: 520,
          margin: '20px auto',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--accent-3-soft)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 18px',
            color: 'var(--accent-3)',
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--primary)', margin: '0 0 10px' }}>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: 24 }}>
          Thank you for your purchase. Your order number is <strong>{orderSuccess}</strong>.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/customer/orders')}
          >
            View My Orders
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || !cart.items.length) {
    return (
      <div
        style={{
          background: 'var(--panel)',
          borderRadius: 24,
          padding: '60px 24px',
          textAlign: 'center',
          border: '1px solid var(--border)',
          margin: '20px 0',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--panel-soft)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 18px',
            color: 'var(--muted)',
          }}
        >
          <ShoppingBag size={30} />
        </div>
        <h3 style={{ fontSize: '1.35rem', color: 'var(--primary)', margin: '0 0 8px' }}>Your Shopping Bag is Empty</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
          Explore our latest seasonal collections and discover pieces that define your personal style.
        </p>
        <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          Discover Catalog <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const rawSubtotal = Number(cart.subtotal || 0);
  const discountAmount = discountApplied ? Math.round(rawSubtotal * 0.15) : 0;
  const grandTotal = Math.max(0, rawSubtotal - discountAmount);

  return (
    <div className="cart-layout-grid">
      {/* ── Left Items List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            Shopping Bag ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
          </h2>
          <button
            type="button"
            onClick={async () => {
              await cartService.clearCart();
              await load();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Trash2 size={13} /> Clear Bag
          </button>
        </div>

        {/* Free shipping progress bar */}
        {(() => {
          const threshold = 10000;
          const progress = Math.min(100, Math.round((rawSubtotal / threshold) * 100));
          const qualified = rawSubtotal >= threshold;

          return (
            <div
              style={{
                background: qualified ? 'rgba(107, 142, 107, 0.12)' : 'var(--panel)',
                border: `1.5px solid ${qualified ? 'var(--accent-3)' : 'var(--border)'}`,
                borderRadius: 14,
                padding: '14px 18px',
                marginBottom: 6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8, color: qualified ? 'var(--accent-3)' : 'var(--primary)' }}>
                <span>
                  {qualified ? '🎉 You unlocked FREE Express Delivery!' : `Add LKR ${(threshold - rawSubtotal).toLocaleString()} more for FREE Express Delivery`}
                </span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: qualified ? 'var(--accent-3)' : 'var(--grad-accent)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          );
        })()}

        {cart.items.map((item: any) => {
          const itemPrice = Number(item.price_at_time || 0);
          const lineTotal = itemPrice * item.quantity;
          const imageSrc = item.product_image || 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853264/freestocks-_3Q3tsJ01nc-unsplash_1.jpg';

          return (
            <div
              key={item.id}
              className="cart-item-card"
            >
              {/* Product Thumbnail */}
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: 'var(--panel-soft)',
                  flexShrink: 0,
                }}
              >
                <img
                  src={imageSrc}
                  alt={item.product_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Product Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  to={`/products/${item.product_id}`}
                  style={{
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: 'var(--primary)',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  {item.product_name}
                </Link>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                  {item.variant_size && (
                    <span style={{ fontSize: '0.74rem', background: 'var(--panel-soft)', padding: '2px 8px', borderRadius: 6, fontWeight: 700, color: 'var(--muted)' }}>
                      Size: {item.variant_size}
                    </span>
                  )}
                  {item.variant_color && (
                    <span style={{ fontSize: '0.74rem', background: 'var(--panel-soft)', padding: '2px 8px', borderRadius: 6, fontWeight: 700, color: 'var(--muted)' }}>
                      Color: {item.variant_color}
                    </span>
                  )}
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--accent)' }}>
                    LKR {itemPrice.toLocaleString()}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="quantity-box" style={{ padding: '2px 8px' }}>
                    <button
                      type="button"
                      onClick={async () => {
                        await cartService.updateItem(item.id, Math.max(1, item.quantity - 1));
                        await load();
                      }}
                      disabled={item.quantity <= 1}
                      style={{ width: 22, height: 22 }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '0.86rem', minWidth: 20 }}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        await cartService.updateItem(item.id, item.quantity + 1);
                        await load();
                      }}
                      style={{ width: 22, height: 22 }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>
                    Total: LKR {lineTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Remove Action */}
              <button
                type="button"
                onClick={async () => {
                  await cartService.removeItem(item.id);
                  await load();
                }}
                className="icon-btn"
                style={{ width: 34, height: 34, color: '#ef4444', borderColor: 'transparent' }}
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Right Summary & Checkout ── */}
      <div>
        <div className="cart-summary-box">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', margin: '0 0 16px' }}>
            Order Summary
          </h3>

          {/* Promo Code Form */}
          <form onSubmit={handleApplyPromo} style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
              Promotional Voucher
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="auth-input-wrapper" style={{ flex: 1 }}>
                <span className="auth-input-icon">
                  <Tag size={15} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. WELCOME15"
                  className="auth-input-element"
                  style={{ minHeight: 40 }}
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-outline" style={{ padding: '0 16px', fontSize: '0.85rem' }}>
                Apply
              </button>
            </div>
            {discountApplied && (
              <p style={{ fontSize: '0.78rem', color: 'var(--accent-3)', fontWeight: 700, marginTop: 4 }}>
                ✓ 15% VIP discount applied!
              </p>
            )}
          </form>

          {/* Payment Method Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
              Payment Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                className={`choice-pill ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 40 }}
              >
                <CreditCard size={15} /> Card / Online
              </button>
              <button
                type="button"
                className={`choice-pill ${paymentMethod === 'bank_transfer' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('bank_transfer')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 40 }}
              >
                <Building2 size={15} /> Bank Transfer
              </button>
            </div>

            {paymentMethod === 'bank_transfer' && (
              <div style={{ marginTop: 12, padding: 12, background: 'var(--panel-soft)', borderRadius: 12, fontSize: '0.8rem' }}>
                <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--primary)' }}>
                  Bank: Clothify Boutique PLC (Acc: 1092837465)
                </p>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 }}>
                  <Upload size={14} /> Upload Deposit Slip (JPG / PNG)
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setSlipFile(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                {slipFile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <img
                      src={slipFile}
                      alt="Bank Slip Preview"
                      style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }}
                    />
                    <div>
                      <span style={{ display: 'block', color: 'var(--accent-3)', fontWeight: 700, fontSize: '0.78rem' }}>
                        ✓ Bank slip attached
                      </span>
                      <button
                        type="button"
                        onClick={() => setSlipFile(null)}
                        style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div style={{ display: 'grid', gap: 10, paddingBottom: 16, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--muted)' }}>
              <span>Subtotal</span>
              <span>LKR {rawSubtotal.toLocaleString()}</span>
            </div>

            {discountApplied && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--accent-3)', fontWeight: 700 }}>
                <span>Discount (15%)</span>
                <span>- LKR {discountAmount.toLocaleString()}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--muted)' }}>
              <span>Standard Express Shipping</span>
              <span style={{ color: 'var(--accent-3)', fontWeight: 700 }}>FREE</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>Estimated Total</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)' }}>
              LKR {grandTotal.toLocaleString()}
            </span>
          </div>

          {actionError && (
            <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <AlertCircle size={16} />
              <span>{actionError}</span>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', minHeight: 48, fontSize: '1rem', fontWeight: 800 }}
            onClick={handleCheckout}
            disabled={checkingOut || (paymentMethod === 'bank_transfer' && !slipFile)}
          >
            {checkingOut ? (
              <>
                <span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing Order...
              </>
            ) : (
              <>
                Complete Checkout <ArrowRight size={17} />
              </>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, color: 'var(--muted)', fontSize: '0.76rem' }}>
            <ShieldCheck size={14} color="var(--accent-3)" /> 256-Bit SSL Encrypted &amp; Guaranteed Safe Checkout
          </div>
        </div>
      </div>
    </div>
  );
}

