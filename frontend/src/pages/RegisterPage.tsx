import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Check } from 'lucide-react';

const perks = [
  'Discover 10,000+ scholarships & opportunities',
  'Track your applications with our Kanban board',
  'Connect with accepted participants worldwide',
  'Publish your own opportunities for free',
];

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register({ email: form.email, password: form.password, name: form.name });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][passwordStrength];

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1B5442] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#E8A857]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-[#2A7A60]/30 rounded-full blur-3xl" />

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
            Join the Middle East's largest<br />
            <span className="text-[#E8A857]">opportunities community.</span>
          </h2>
          <ul className="flex flex-col gap-3">
            {perks.map(perk => (
              <li key={perk} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E8A857] flex items-center justify-center mt-0.5 shrink-0">
                  <Check size={11} color="#3D2800" strokeWidth={3} />
                </div>
                <span className="text-white/80 text-sm">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-white/30 text-sm">© {new Date().getFullYear()} SIYP Team</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1B5442] transition-colors mb-8 font-medium">
            <ArrowLeft size={15} /> Back to home
          </Link>

          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border border-[#1B5442]/20">
              <img src="/logo.jpg" alt="SIYP Team Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>SIYP Team</span>
          </div>

          <h1 className="text-3xl font-black text-[#1A1A2E] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Create your account
          </h1>
          <p className="text-gray-500 mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1B5442] font-semibold hover:underline">Sign in</Link>
          </p>



          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Mohamed Ahmed"
                  required className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com"
                  required className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={form.password} onChange={handleChange}
                  placeholder="At least 8 characters"
                  required className="input-field pl-10 pr-10"
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B5442]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColor : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'][passwordStrength]}`}>
                    {strengthLabel} password
                  </p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary justify-center w-full py-3.5 mt-2 text-base">
              {loading ? 'Creating Account...' : 'Create Account →'}
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

export default RegisterPage;
