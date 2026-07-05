import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage('Your password has been successfully reset.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.detail || 'Failed to reset password');
      }
    } catch (err: any) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    const p = password;
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
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="max-w-md w-full mx-auto">
          {message ? (
             <div className="text-center">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
               </div>
               <h2 className="text-2xl font-black text-[#1A1A2E] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Password Reset!</h2>
               <p className="text-gray-500 mb-8">{message}</p>
               <Link to="/login" className="btn-primary inline-flex justify-center w-full py-3.5">
                 Return to Login
               </Link>
             </div>
          ) : (
            <>
              <h1 className="text-3xl font-black text-[#1A1A2E] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Set new password
              </h1>
              <p className="text-gray-500 mb-8">
                Please enter your new password below.
              </p>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      disabled={!token}
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
                  
                  {/* Password strength */}
                  {password && (
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

                <button type="submit" disabled={loading || !token} className="btn-primary justify-center w-full py-3.5 mt-2 text-base disabled:opacity-70">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
