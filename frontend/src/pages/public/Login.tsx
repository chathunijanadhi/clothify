import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  Star,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../../services/auth.context';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const { login, user, firebaseEnabled, firebaseLoginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
    }
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);
    try {
      await firebaseLoginWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google login failed. Please try again.';
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleForgotPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSubmitted(false);
      setForgotEmail('');
    }, 2800);
  }

  return (
    <div className="auth-page-container">
      <div className="auth-split-wrapper">
        {/* ── Left Visual Showcase Side ── */}
        <div className="auth-showcase">
          <img
            src="https://res.cloudinary.com/efjuzuge/image/upload/v1787853264/freestocks-_3Q3tsJ01nc-unsplash_1.jpg"
            alt="Clothify fashion collection"
            className="auth-showcase-bg"
          />
          <div className="auth-showcase-overlay" />

          <div className="auth-showcase-content">
            <div>
              <div className="auth-brand-chip">
                <img
                  src="https://res.cloudinary.com/efjuzuge/image/upload/v1787922904/icon_only.png"
                  alt="Clothify"
                  style={{ width: 22, height: 22, borderRadius: 6, objectFit: 'cover' }}
                />
                <span>Clothify Boutique</span>
              </div>

              <div className="auth-showcase-badge">
                <Sparkles size={13} /> Member Access
              </div>

              <h1 className="auth-showcase-title">Wear Your Style with Confidence</h1>
              <p className="auth-showcase-subtitle">
                Log in to access your curated wardrobe, saved wishlists, and seamless checkout experience.
              </p>

              <div className="auth-perk-list">
                <div className="auth-perk-item">
                  <div className="auth-perk-icon">
                    <Truck size={17} />
                  </div>
                  <div className="auth-perk-text">
                    <strong>Free Express Delivery</strong>
                    <span>Complimentary on orders over $50</span>
                  </div>
                </div>

                <div className="auth-perk-item">
                  <div className="auth-perk-icon">
                    <Sparkles size={17} />
                  </div>
                  <div className="auth-perk-text">
                    <strong>15% Welcome Discount</strong>
                    <span>Use code WELCOME15 at checkout</span>
                  </div>
                </div>

                <div className="auth-perk-item">
                  <div className="auth-perk-icon">
                    <ShoppingBag size={17} />
                  </div>
                  <div className="auth-perk-text">
                    <strong>Cross-Device Cart Sync</strong>
                    <span>Pick up exactly where you left off</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shopper Testimonial */}
            <div className="auth-review-card">
              <div className="auth-review-stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill="#fbbf24" stroke="none" />
                ))}
              </div>
              <p>"Clothify made finding my seasonal essentials so effortless! Fast delivery and great quality."</p>
              <span>— Elena R., Verified Fashion Shopper</span>
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="auth-form-panel">
          {/* Tabs switch */}
          <div className="auth-tabs-nav">
            <button type="button" className="auth-tab-btn active">
              Sign In
            </button>
            <Link to="/register" className="auth-tab-btn">
              Create Account
            </Link>
          </div>

          <div className="auth-header-copy">
            <h2>Welcome Back</h2>
            <p>Enter your credentials to access your Clothify account</p>
          </div>

          {error && (
            <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="auth-field-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="auth-input-element"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-field-group">
              <label htmlFor="login-password">Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="auth-input-element"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-input-action"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="auth-checkbox-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="auth-forgot-link"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Submit Button */}
            <button type="submit" className="auth-primary-btn" disabled={loading || googleLoading}>
              {loading ? (
                <>
                  <span className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In to Clothify <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Firebase Google Auth */}
            {firebaseEnabled && (
              <>
                <div className="auth-divider-line">
                  <span>OR CONTINUE WITH</span>
                </div>

                <button
                  type="button"
                  className="auth-google-btn"
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <>
                      <span className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      Connecting with Google...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
              </>
            )}

            {/* Guest Browsing */}
            <button
              type="button"
              className="auth-guest-btn"
              onClick={() => navigate('/products')}
            >
              <ShoppingBag size={16} /> Continue as Guest Shopper
            </button>
          </form>

          {/* Trust strip */}
          <div className="auth-trust-strip">
            <div className="auth-trust-strip-item">
              <ShieldCheck size={14} color="#00d4aa" /> 256-Bit SSL Secure
            </div>
            <div className="auth-trust-strip-item">
              <Truck size={14} color="#ff6b35" /> Fast Delivery
            </div>
            <div className="auth-trust-strip-item">
              <RotateCcw size={14} color="#e91e8c" /> 30-Day Returns
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="auth-modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="auth-input-action"
              style={{ top: 20, right: 20 }}
              onClick={() => setShowForgotModal(false)}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Lock size={24} />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.4rem', color: 'var(--primary)' }}>Reset Password</h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted)' }}>
                Enter your registered email and we'll send you instructions to reset your password.
              </p>
            </div>

            {forgotSubmitted ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: 'var(--accent-3-soft)',
                  color: '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={20} color="#00d4aa" />
                <span>Reset link sent! Please check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="auth-field-group" style={{ marginBottom: 18 }}>
                  <label htmlFor="forgot-email">Your Email Address</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">
                      <Mail size={18} />
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="auth-input-element"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="auth-primary-btn">
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
