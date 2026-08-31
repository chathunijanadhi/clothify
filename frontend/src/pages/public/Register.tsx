import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Gift,
  Star,
  AlertCircle,
  Check,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../services/auth.context';

export function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
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

  // Password strength calculation
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', colorClass: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', colorClass: 'active-weak' };
    if (score === 2) return { score: 2, label: 'Fair', colorClass: 'active-medium' };
    if (score === 3) return { score: 3, label: 'Good', colorClass: 'active-medium' };
    return { score: 4, label: 'Strong', colorClass: 'active-strong' };
  }, [password]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields (Full Name, Email, and Password).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        confirmPassword,
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
            src="https://res.cloudinary.com/efjuzuge/image/upload/v1787853264/freestocks-_3Q3tsJ01nc-unsplash_1.jpg"
            alt="Clothify fashion showcase"
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
                <Gift size={13} /> Welcome Offer
              </div>

              <h1 className="auth-showcase-title">Join The Clothify Club</h1>
              <p className="auth-showcase-subtitle">
                Unlock 15% off your first purchase, personalized fashion recommendations, and member-only drops.
              </p>

              <div className="auth-perk-list">
                <div className="auth-perk-item">
                  <div className="auth-perk-icon">
                    <Sparkles size={17} />
                  </div>
                  <div className="auth-perk-text">
                    <strong>15% OFF First Order</strong>
                    <span>Instant coupon code upon sign-up</span>
                  </div>
                </div>

                <div className="auth-perk-item">
                  <div className="auth-perk-icon">
                    <Truck size={17} />
                  </div>
                  <div className="auth-perk-text">
                    <strong>Free Express Shipping</strong>
                    <span>Exclusive perk on member orders</span>
                  </div>
                </div>

                <div className="auth-perk-item">
                  <div className="auth-perk-icon">
                    <Heart size={17} />
                  </div>
                  <div className="auth-perk-text">
                    <strong>Curated Wishlist & Trends</strong>
                    <span>Save items and get restock notifications</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shopper Community Card */}
            <div className="auth-review-card">
              <div className="auth-review-stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill="#fbbf24" stroke="none" />
                ))}
              </div>
              <p>"Clothify's member perks and seasonal fashion collections are unmatched!"</p>
              <span>— 25,000+ Happy Shoppers Worldwide</span>
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="auth-form-panel">
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
            <h2>Create Your Account</h2>
            <p>Start your fashion journey with Clothify today</p>
          </div>

          {error && (
            <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Row 1: Full Name & Phone */}
            <div className="auth-grid-2col">
              <div className="auth-field-group">
                <label htmlFor="reg-name">Full Name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <UserIcon size={16} />
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

              <div className="auth-field-group">
                <label htmlFor="reg-phone">
                  Phone <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 500 }}>(Optional)</span>
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <Phone size={16} />
                  </span>
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="+94 77 123 4567"
                    className="auth-input-element"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Email Address */}
            <div className="auth-field-group">
              <label htmlFor="reg-email">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Mail size={16} />
                </span>
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className="auth-input-element"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Row 3: Password & Confirm Password */}
            <div className="auth-grid-2col">
              <div className="auth-field-group">
                <label htmlFor="reg-password">Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <Lock size={16} />
                  </span>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 6 chars"
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-field-group">
                <label htmlFor="reg-confirm-password">
                  Confirm
                  {passwordsMatch && (
                    <span style={{ color: '#10b981', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <Check size={12} /> Match
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>
                      Mismatch
                    </span>
                  )}
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <Lock size={16} />
                  </span>
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat pass"
                    className="auth-input-element"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-input-action"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="auth-strength-meter" style={{ marginBottom: 8 }}>
                <div className="auth-strength-bars">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`auth-strength-bar-seg ${strength.score >= step ? strength.colorClass : ''}`}
                    />
                  ))}
                </div>
                <div className="auth-strength-text">
                  <span>Strength: <strong>{strength.label}</strong></span>
                  <span>{password.length >= 6 ? '✓ 6+ chars' : 'Min. 6 chars'}</span>
                </div>
              </div>
            )}

            {/* Agreement & Newsletter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0 12px' }}>
              <label className="auth-checkbox-label" style={{ alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>
                  I agree to Clothify's{' '}
                  <a href="#" style={{ color: 'var(--accent)', fontWeight: 700 }}>Terms & Privacy Policy</a>
                </span>
              </label>

              <label className="auth-checkbox-label" style={{ alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                />
                <span>Send me exclusive 15% discount alerts & VIP fashion drops</span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button type="submit" className="auth-primary-btn" disabled={loading || googleLoading}>
              {loading ? (
                <>
                  <span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Creating account...
                </>
              ) : (
                <>
                  Create Clothify Account <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Firebase Google Auth */}
            {firebaseEnabled && (
              <>
                <div className="auth-divider-line">
                  <span>OR SIGN UP WITH</span>
                </div>

                <button
                  type="button"
                  className="auth-google-btn"
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <>
                      <span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      Connecting with Google...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24">
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
                      Sign up with Google
                    </>
                  )}
                </button>
              </>
            )}
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
    </div>
  );
}
