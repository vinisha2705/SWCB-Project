import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Sign-in failed — check your email and password.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center text-xl mb-4">
          🗑️
        </div>
        <h1 className="text-xl font-bold mb-1">SWCB Console</h1>
        <p className="text-sm text-muted mb-6">Sign in to monitor the bot fleet.</p>

        <label className="block text-xs text-muted mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-line rounded-lg px-3 py-2.5 mb-3.5 text-sm"
          placeholder="you@campus.edu"
          required
        />

        <label className="block text-xs text-muted mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface border border-line rounded-lg px-3 py-2.5 mb-3.5 text-sm"
          placeholder="••••••••"
          required
        />

        {error && <p className="text-crit text-xs mb-3">{error}</p>}

        <button className="w-full bg-accent text-bg font-semibold rounded-lg py-3 text-sm">
          Sign in
        </button>
        <p className="text-[11px] text-muted mt-3.5 leading-relaxed">
          Uses Firebase Authentication — create a user in your Firebase console
          (Authentication → Users → Add user) to sign in here.
        </p>
      </form>
    </div>
  );
}
