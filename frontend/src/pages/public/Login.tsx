import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useState } from 'react';
import { useAuth } from '../../services/auth.context';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Welcome back</p>
          <h1>Login</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error ? <div className="form-error">{error}</div> : null}
          <Button type="submit">Login</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/')}>Continue as guest</Button>
        </form>

        <div className="auth-links">
          <a href="#">Forgot password?</a>
          <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
}
