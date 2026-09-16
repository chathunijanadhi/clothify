import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  Star,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../services/auth.context';

export function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, user, firebaseEnabled, firebaseLoginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
    }
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms & Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword: password,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
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
      const message = err instanceof Error ? err.message : 'Google sign-up failed. Please try again.';
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="auth-page-container">
      <div className="auth-split-wrapper">
        {/* ── Left Visual Showcase Side ── */}
        <div className="auth-showcase">
          <img
            src="/images/hero-model.jpg"
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

              <h1 className="auth-showcase-title">Join The Clothify Club</h1>
              <p className="auth-showcase-subtitle">
                Create an account to access curated collections, saved wishlists, and exclusive offers.
              </p>

              <div className="auth-perk-list">
                <div className="auth-perk-item">
                  <div className="auth-perk-icon">
                    <Truck size={17} />
                  </div>
                  <div className="auth-perk-text">
                    <strong>Free Express Delivery</strong>
                    <span>Complimentary on orders over LKR 10,000</span>
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
              <p>"Creating an account was so seamless! Fast delivery and great clothing quality."</p>
              <span>— Elena R., Verified Fashion Shopper</span>
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="auth-form-panel">
          <Link to="/" className="auth-home-link" aria-label="Back to Clothify home">
            <img
              src="https://res.cloudinary.com/efjuzuge/image/upload/v1787922904/icon_only.png"
              alt=""
            />
            Clothify
          </Link>

          {/* Tabs switch */}
          <div className="auth-tabs-nav">
            <Link to="/login" className="auth-tab-btn">
              Sign In
            </Link>
            <button type="button" className="auth-tab-btn active">
              Create Account
            </button>
          </div>

          <div className="auth-header-copy">
            <h2>Create Account</h2>
            <p>Join Clothify to start your shopping journey</p>
          </div>

          {error && (
            <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div className="auth-field-group">
              <label htmlFor="reg-name">Full Name</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <UserIcon size={18} />
                </span>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="auth-input-element"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="auth-field-group">
              <label htmlFor="reg-email">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password">Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="•••••••• (Min. 6 chars)"
                  className="auth-input-element"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

            {/* Terms checkbox */}
            <div className="auth-checkbox-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>
                  I agree to Clothify's <a href="#" style={{ color: 'var(--accent)', fontWeight: 600 }}>Terms & Privacy Policy</a>
                </span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button type="submit" className="auth-primary-btn" disabled={loading || googleLoading}>
              {loading ? (
                <>
                  <span className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
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
              <ShoppingBag size={16} /> Continue shopping as guest
            </button>
          </form>

          {/* Trust strip */}
          <div className="auth-trust-strip">
            <div className="auth-trust-strip-item">
              <ShieldCheck size={14} color="var(--accent-3)" /> SSL Secure
            </div>
            <div className="auth-trust-strip-item">
              <Truck size={14} color="var(--primary)" /> Fast Delivery
            </div>
            <div className="auth-trust-strip-item">
              <RotateCcw size={14} color="var(--accent)" /> 30-Day Returns
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

