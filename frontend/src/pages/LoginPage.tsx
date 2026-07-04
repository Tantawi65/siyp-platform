import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1B5442] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 dot-grid opacity-30" />
        {/* Glow orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#2A7A60]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-[#E8A857]/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border border-white/30 group-hover:scale-105 transition-transform">
              <img src="/logo.jpg" alt="SIYP Team Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>SIYP Team</span>
          </Link>
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <h2 className="text-4xl font-black text-white leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Welcome back.<br />
            <span className="text-[#E8A857]">Great opportunities</span><br />
            are waiting.
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            Log in to explore thousands of scholarships, fellowships, and internships curated for you.
          </p>

          {/* Stats chips */}
          <div className="flex flex-wrap gap-3">
            {[
              { val: '10k+', label: 'Opportunities' },
              { val: '50k+', label: 'Members' },
              { val: '120+', label: 'Countries' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="font-black text-white text-base" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.val}</span>
                <span className="text-white/60 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-sm">© {new Date().getFullYear()} SIYP Team</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="max-w-md w-full mx-auto">
          {/* Back link */}
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1B5442] transition-colors mb-8 font-medium">
            <ArrowLeft size={15} /> Back to home
          </Link>

          {/* Logo (mobile only) */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border border-[#1B5442]/20">
              <img src="/logo.jpg" alt="SIYP Team Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>SIYP Team</span>
          </div>

          <h1 className="text-3xl font-black text-[#1A1A2E] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Sign in
          </h1>
          <p className="text-gray-500 mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1B5442] font-semibold hover:underline">
              Sign up free
            </Link>
          </p>



          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-[#1A1A2E]">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#1B5442] hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B5442]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary justify-center w-full py-3.5 mt-2 text-base">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to our{' '}
            <Link to="/terms-of-service" className="text-[#1B5442] hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy-policy" className="text-[#1B5442] hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
