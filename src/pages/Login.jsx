import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/account');
    } catch (err) {
      setError(err.message === 'Firebase: Error (auth/user-not-found).'
        ? 'No account found with this email.'
        : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-margin-edge bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <h1 className="font-bodoni text-headline-lg text-primary mb-2 text-center">Welcome Back</h1>
        <p className="font-hanken text-xs text-on-surface-variant text-center mb-10 uppercase tracking-widest">
          Sign in to manage your orders
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center p-3 mb-6 uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Email</label>
            <input
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-primary/20 pb-2 text-primary focus:outline-none focus:border-secondary transition-colors font-hanken"
            />
          </div>
          <div>
            <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Password</label>
            <input
              type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-primary/20 pb-2 text-primary focus:outline-none focus:border-secondary transition-colors font-hanken"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-white font-hanken text-xs uppercase tracking-widest hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="font-hanken text-xs text-on-surface-variant text-center mt-8">
          Don't have an account?{' '}
          <Link to="/" className="text-secondary underline underline-offset-2">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
