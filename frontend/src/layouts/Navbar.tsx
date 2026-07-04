import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Compass, Users, BookOpen, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    // Reset scroll state on route change
    setScrolled(window.scrollY > 20);
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const navLinks = [
    { to: '/explore', label: 'Discover', icon: <Compass size={15} /> },
    { to: '/community', label: 'Community', icon: <Users size={15} /> },
    { to: '/publish', label: 'Publish', icon: <BookOpen size={15} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  // On landing page: transparent until scrolled. On all other pages: always solid white.
  const navBg = isLanding && !scrolled
    ? 'bg-transparent'
    : 'bg-white/97 backdrop-blur-xl shadow-sm border-b border-gray-100';

  // Text/icon colors depend on whether we have a transparent (dark) or white (light) background
  const isDark = isLanding && !scrolled;

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
        <div className="container-max h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border border-[#1B5442]/20">
              <img src="/logo.jpg" alt="SIYP Team Logo" className="w-full h-full object-cover" />
            </div>
            <span
              className={`font-bold text-lg tracking-tight transition-colors ${isDark ? 'text-white' : 'text-[#1A1A2E]'}`}
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              SIYP Team
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? isDark
                      ? 'bg-white/20 text-white'
                      : 'bg-[#1B5442]/10 text-[#1B5442]'
                    : isDark
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-[#1B5442] hover:bg-gray-50'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
                    isDark
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-[#1B5442] hover:bg-[#1B5442]/10'
                  }`}
                >
                  Dashboard
                </Link>
                {user?.role === 'owner' || user?.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
                      isDark
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-[#1B5442] hover:bg-[#1B5442]/10'
                    }`}
                  >
                    Admin
                  </Link>
                ) : null}
                <div className="relative group">
                  <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-[#1B5442] text-white flex items-center justify-center text-xs font-bold overflow-hidden border border-gray-100">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2">
                    <Link to="/profile/edit" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1B5442]">Edit Profile</Link>
                    <button onClick={logout} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left w-full cursor-pointer">Log out</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
                    isDark
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-[#1B5442] hover:bg-[#1B5442]/10'
                  }`}
                >
                  Log in
                </Link>
                <Link to="/register" className="btn-primary text-sm px-5 py-2.5">
                  Get Started →
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? 'text-white' : 'text-[#1A1A2E]'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      <div 
        className={`fixed inset-0 top-[72px] z-30 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Menu */}
      <div
        className={`fixed inset-x-0 top-[72px] z-40 bg-white shadow-xl border-b border-gray-100 transition-all duration-300 md:hidden ${
          mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="container-max py-4 flex flex-col gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive(link.to) ? 'bg-[#1B5442]/10 text-[#1B5442]' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-[#1B5442] font-semibold rounded-lg hover:bg-gray-50">
                  Dashboard
                </Link>
                {user?.role === 'owner' || user?.role === 'admin' ? (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-[#1B5442] font-semibold rounded-lg hover:bg-gray-50">
                    Admin
                  </Link>
                ) : null}
                <Link to="/profile/edit" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-[#1B5442] font-semibold rounded-lg hover:bg-gray-50">
                  Edit Profile
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="px-4 py-3 text-red-600 text-left font-semibold rounded-lg hover:bg-red-50">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-[#1B5442] font-semibold rounded-lg hover:bg-gray-50">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary justify-center">
                  Get Started →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
