import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [showAlert, setShowAlert] = useState(false);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setRedirect(true);
      }, 3000); // Wait 3 seconds so they can read the message
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
        <div className="animate-pulse-ring w-12 h-12 rounded-full bg-[#1B5442] opacity-50"></div>
      </div>
    );
  }

  if (showAlert && !redirect) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7F4] p-5 text-center">
        <ShieldAlert size={48} className="text-[#E8A857] mb-4" />
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Access Restricted</h2>
        <p className="text-gray-500 mb-6">Sorry, but you have to sign up or log in to access this feature.</p>
        <p className="text-sm text-gray-400">Redirecting to login...</p>
      </div>
    );
  }

  if (!isAuthenticated || redirect) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
