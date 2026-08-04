import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const routeForRole = (role) => {
  if (role === 'Admin') return '/admin';
  if (role === 'Security') return '/security';
  if (role === 'Employee') return '/host';
  return '/visitor';
};

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      navigate(routeForRole(data.user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Visitor Pass Management</p>
        <h1>Sign in</h1>
        <p className="muted">Use the demo credentials from the seed script after setup.</p>
        <form onSubmit={submit} className="stack">
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {error && <div className="notice error">{error}</div>}
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/visitor-register">Visitor registration</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
