import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useEffect, useState } from 'react';
import { useAuth } from '../../services/auth.context';

export function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard');
    }
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!fullName || !email || !password) {
      setError('Please fill required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({ fullName, email, phone, password, confirmPassword });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Join us</p>
          <h1>Create Account</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="Full Name" type="text" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Phone Number" type="tel" placeholder="+94 77 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Password" type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input label="Confirm Password" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {error ? <div className="form-error">{error}</div> : null}
          <Button type="submit">Register</Button>
        </form>

        <div className="auth-links">
          <span>Already have an account?</span>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
