import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AuthModal({ mode = 'login', required = false, onClose, onModeChange }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const isRegister = mode === 'register';
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !required && onClose) onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

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
      if (onClose) onClose();
      if (required) return;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={!required && onClose ? onClose : undefined}
      role="presentation"
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {!required && onClose && (
          <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        )}
        <form className="auth-form-card" onSubmit={handleSubmit}>
          <div className="auth-form-title" id="auth-modal-title">
            {isRegister ? 'Create account' : 'Welcome back'}
          </div>
          <div className="auth-form-sub">
            {isRegister ? 'Sign up to start managing your aquariums' : 'Sign in to manage your aquariums'}
          </div>

          {error && <div className="form-error auth-form-error">{error}</div>}

          {isRegister && (
            <div className="form-group">
              <label className="form-label auth-label" htmlFor="auth-username">Username</label>
              <input
                className="form-input auth-input"
                id="auth-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label auth-label" htmlFor="auth-email">Email address</label>
            <input
              className="form-input auth-input"
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label auth-label" htmlFor="auth-password">Password</label>
            <input
              className="form-input auth-input"
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="auth-btn" disabled={submitting}>
            {submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in to Aqua Mind'}
          </button>
          <div className="auth-divider">or</div>
          <button
            type="button"
            className="auth-btn-secondary"
            onClick={() => {
              setError('');
              onModeChange(isRegister ? 'login' : 'register');
            }}
          >
            {isRegister ? 'Already have an account? Sign in' : 'Create free account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
