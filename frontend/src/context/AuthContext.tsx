import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id?: number;
  email: string;
  role: string;
  avatar_url?: string;
  name?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If token exists, we could fetch user profile here to verify and get role.
    // For now, we will decode from token or fetch `/api/profiles/me` if implemented.
    // Let's just trust the token and fetch user details if needed.
    const fetchProfile = async (storedUser: any) => {
      try {
        const res = await fetch('/api/profiles/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const profile = await res.json();
          const updatedUser = { ...storedUser, avatar_url: profile.avatar_url, name: profile.name };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          setUser(storedUser);
        }
      } catch (e) {
        setUser(storedUser);
      }
    };

    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        fetchProfile(parsed);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoading(false);
  }, [token]);

  const login = async (credentials: any) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Login failed');
    }
    const data = await res.json();
    const token = data.access_token;
    const returnedUser = data.user || { email: credentials.email, role: 'user' };
    
    localStorage.setItem('token', token);
    
    // Fetch profile right after login
    try {
      const profileRes = await fetch('/api/profiles/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        returnedUser.avatar_url = profile.avatar_url;
        returnedUser.name = profile.name;
      }
    } catch (e) {}

    localStorage.setItem('user', JSON.stringify(returnedUser));
    setToken(token);
    setUser(returnedUser);
  };

  const register = async (userData: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Registration failed');
    }
    // After successful registration, automatically log in
    await login({ email: userData.email, password: userData.password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
