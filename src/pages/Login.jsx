import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { validateEmail as validateEmailDeep } from '../utils/validation';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

const getRateLimit = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('auth_attempts') || '{}');
    if (stored.resetAt && Date.now() > stored.resetAt) {
      localStorage.removeItem('auth_attempts');
      return { count: 0 };
    }
    return stored;
  } catch { return { count: 0 }; }
};

const setRateLimit = () => {
  const data = getRateLimit();
  if (!data.resetAt) {
    data.resetAt = Date.now() + RATE_LIMIT_WINDOW;
  }
  data.count = (data.count || 0) + 1;
  localStorage.setItem('auth_attempts', JSON.stringify(data));
  return data;
};

const getPasswordStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: 'Weak', color: 'text-red-400', bg: 'bg-red-500/20', bar: 'w-1/4 bg-red-500' };
  if (score <= 4) return { label: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/20', bar: 'w-2/4 bg-yellow-500' };
  if (score <= 5) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20', bar: 'w-3/4 bg-blue-500' };
  return { label: 'Strong', color: 'text-green-400', bg: 'bg-green-500/20', bar: 'w-full bg-green-500' };
};

const Login = () => {
  const { login, register, resetPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.state?.register ?? false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const data = getRateLimit();
    if (data.count >= RATE_LIMIT_MAX) {
      const remaining = Math.max(0, data.resetAt - Date.now());
      if (remaining > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRateLimited(true);
        setCooldown(remaining);
      } else {
        localStorage.removeItem('auth_attempts');
      }
    }
  }, []);

  useEffect(() => {
    if (!rateLimited) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, cooldown - 1000);
      if (remaining <= 0) {
        localStorage.removeItem('auth_attempts');
        setRateLimited(false);
        setCooldown(0);
        clearInterval(interval);
      } else {
        setCooldown(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimited, cooldown]);

  const validate = () => {
    const errors = {};
    const emailErr = validateEmailDeep(email);
    if (emailErr) errors.email = emailErr;
    if (!password) errors.password = 'Password is required.';
    if (isRegister) {
      if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
      if (!/[A-Z]/.test(password)) errors.password = 'Password must include an uppercase letter.';
      if (!/[0-9]/.test(password)) errors.password = 'Password must include a number.';
      if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const data = getRateLimit();
    if (data.count >= RATE_LIMIT_MAX) {
      const remaining = Math.max(0, data.resetAt - Date.now());
      if (remaining > 0) {
        setRateLimited(true);
        setCooldown(remaining);
        setError(`Too many attempts. Try again in ${Math.ceil(remaining / 60000)} min.`);
        return;
      }
      localStorage.removeItem('auth_attempts');
    }

    if (!validate()) return;

    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      localStorage.removeItem('auth_attempts');
      navigate('/account');
    } catch (err) {
      setRateLimit();
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Sign in instead.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Account temporarily locked due to too many attempts. Try again later.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const emailErr = validateEmailDeep(email);
    if (emailErr) { setFieldErrors({ email: emailErr }); return; }
    setResetLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setResetSent(true);
      setError('Password reset email sent. Check your inbox.');
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No account found with this email.');
      else setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const strength = isRegister ? getPasswordStrength(password) : null;

  return (
    <div className="min-h-screen pt-32 pb-20 px-margin-edge bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <h1 className="font-bodoni text-headline-lg text-primary mb-2 text-center">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="font-hanken text-xs text-on-surface-variant text-center mb-10 uppercase tracking-widest">
          {isRegister ? 'Register to track your orders' : 'Sign in to manage your orders'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center p-3 mb-6 uppercase tracking-widest">
            {error}
          </div>
        )}

        {rateLimited && (
          <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs text-center p-3 mb-6 uppercase tracking-widest">
            Too many attempts. Try again in {Math.ceil(cooldown / 60000)}:{String(Math.ceil((cooldown % 60000) / 1000)).padStart(2, '0')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Email</label>
            <input
              type="email" required
              value={email} onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({...prev, email: ''})); }}
              className={`w-full bg-transparent border-b pb-2 text-primary focus:outline-none focus:border-secondary transition-colors font-hanken ${fieldErrors.email ? 'border-red-500' : 'border-primary/20'}`}
            />
            {fieldErrors.email && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Password</label>
            <div className={`flex items-center border-b ${fieldErrors.password ? 'border-red-500' : 'border-primary/20'} focus-within:border-secondary transition-colors`}>
              <input
                type={showPassword ? 'text' : 'password'} required
                value={password} onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({...prev, password: ''})); }}
                className="w-full bg-transparent pb-2 text-primary focus:outline-none font-hanken"
              />
              <button type="button" onClick={() => setShowPassword(p => !p)} className="pb-2 text-on-surface-variant hover:text-primary transition-colors" tabIndex={-1}>
                <span className="material-symbols-outlined text-sm">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.password}</p>}
            {!isRegister && !resetSent && (
              <button type="button" onClick={handleResetPassword} disabled={resetLoading} className="font-hanken text-[10px] text-secondary hover:text-primary transition-colors mt-2 underline underline-offset-2 cursor-pointer bg-transparent border-none p-0">
                {resetLoading ? 'Sending...' : 'Forgot Password?'}
              </button>
            )}
            {isRegister && strength && (
              <div className="mt-2 space-y-1">
                <div className="h-1 bg-primary/10 rounded-none overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.bar}`} />
                </div>
                <p className={`text-[9px] uppercase tracking-widest ${strength.color}`}>{strength.label}</p>
              </div>
            )}
          </div>

          {isRegister && (
            <div>
              <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Confirm Password</label>
              <div className={`flex items-center border-b ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-primary/20'} focus-within:border-secondary transition-colors`}>
                <input
                  type={showConfirm ? 'text' : 'password'} required
                  value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(prev => ({...prev, confirmPassword: ''})); }}
                  className="w-full bg-transparent pb-2 text-primary focus:outline-none font-hanken"
                />
                <button type="button" onClick={() => setShowConfirm(p => !p)} className="pb-2 text-on-surface-variant hover:text-primary transition-colors" tabIndex={-1}>
                  <span className="material-symbols-outlined text-sm">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-red-400 text-[10px] mt-1">{fieldErrors.confirmPassword}</p>}
            </div>
          )}

          <button
            type="submit" disabled={loading || rateLimited}
            className="w-full py-4 bg-primary text-white font-hanken text-xs uppercase tracking-widest hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-primary/10"></div></div>
          <div className="relative flex justify-center"><span className="bg-background px-4 text-[10px] text-on-surface-variant uppercase tracking-widest">or continue with</span></div>
        </div>

        <button
          onClick={async () => {
            try {
              setLoading(true);
              await signInWithGoogle();
              localStorage.removeItem('auth_attempts');
              navigate('/account');
            } catch (err) {
              if (err.code !== 'auth/popup-closed-by-user') setError(err.message);
            } finally { setLoading(false); }
          }}
          disabled={loading || rateLimited}
          className="w-full py-3 border border-primary/20 text-primary font-hanken text-xs uppercase tracking-widest hover:bg-primary/5 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>

        <p className="font-hanken text-xs text-on-surface-variant text-center mt-8">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); setFieldErrors({}); setConfirmPassword(''); }}
            className="text-secondary underline underline-offset-2 cursor-pointer bg-transparent border-none p-0 font-hanken text-xs"
          >
            {isRegister ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
