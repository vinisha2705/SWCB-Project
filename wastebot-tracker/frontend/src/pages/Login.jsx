import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const friendlyError = (code) => {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists. Try signing in.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/invalid-email': return 'That email address does not look valid.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Incorrect email or password.';
    case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
    default: return 'Something went wrong. Please try again.';
  }
};

export default function Login() {
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setError('');
    setBusy(true);
    try {
      await fn();
      navigate('/');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    run(() => (mode === 'signup' ? signup(name, email, password) : login(email, password)));
  };

  const inputClass =
    'w-full bg-surface border border-line rounded-lg px-3 py-2.5 mb-3.5 text-sm';

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 overflow-y-auto">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center text-xl mb-4">
          🗑️
        </div>
        <h1 className="text-xl font-bold mb-1">SWCB Console</h1>
        <p className="text-sm text-muted mb-6">
          {mode === 'signup' ? 'Create an account to monitor the bot fleet.' : 'Sign in to monitor the bot fleet.'}
        </p>

        {mode === 'signup' && (
          <>
            <label className="block text-xs text-muted mb-1.5">Name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </>
        )}

        <label className="block text-xs text-muted mb-1.5">Email</label>
        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@campus.edu" required />

        <label className="block text-xs text-muted mb-1.5">Password</label>
        <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required />

        {error && <p className="text-crit text-xs mb-3">{error}</p>}

        <button disabled={busy} className="w-full bg-accent text-bg font-semibold rounded-lg py-3 text-sm disabled:opacity-60">
          {mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>

        <div className="flex items-center gap-3 my-4 text-xs text-muted">
          <div className="flex-1 h-px bg-line" /> or <div className="flex-1 h-px bg-line" />
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => run(loginWithGoogle)}
          className="w-full bg-surface border border-line rounded-lg py-3 text-sm font-semibold disabled:opacity-60"
        >
          Continue with Google
        </button>

        <p className="text-xs text-muted mt-5 text-center">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            className="text-accent underline"
            onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); }}
          >
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </form>
    </div>
  );
}