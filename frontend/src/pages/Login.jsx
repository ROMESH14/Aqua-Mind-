import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '◈', text: 'Real-time water quality monitoring' },
  { icon: '✦', text: 'AI species compatibility advisor' },
  { icon: '◉', text: 'Predictive water quality alerts' },
  { icon: '◷', text: 'Smart maintenance scheduling' },
];

function Login() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(username, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <Link to="/" className="auth-back">← Back to home</Link>

      <div className="auth-left">
        <div className="auth-hero">
          <span className="auth-eyebrow">AI-powered aquarium care</span>
          <Logo size="xl" showTagline />
          <div className="auth-features">
            {features.map((f) => (
              <div key={f.text} className="auth-feature">
                <div className="auth-feature-icon">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-form-card" onSubmit={handleSubmit}>
          <div className="auth-form-title">{isRegister ? 'Create account' : 'Welcome back'}</div>
          <div className="auth-form-sub">
            {isRegister ? 'Sign up to start managing your aquariums' : 'Sign in to manage your aquariums'}
          </div>

          {error && <div className="form-error auth-form-error">{error}</div>}

          {isRegister && (
            <div className="form-group">
              <label className="form-label auth-label" htmlFor="username">Username</label>
              <input className="form-input auth-input" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label auth-label" htmlFor="email">Email address</label>
            <input className="form-input auth-input" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label auth-label" htmlFor="password">Password</label>
            <input className="form-input auth-input" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <button type="submit" className="auth-btn" disabled={submitting}>
            {submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in to Aqua Mind'}
          </button>
          <div className="auth-divider">or</div>
          <button
            type="button"
            className="auth-btn-secondary"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'Already have an account? Sign in' : 'Create free account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
