import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('vp-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vp-token') || '');

  useEffect(() => {
    if (user) localStorage.setItem('vp-user', JSON.stringify(user));
    else localStorage.removeItem('vp-user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('vp-token', token);
    else localStorage.removeItem('vp-token');
  }, [token]);

  const login = ({ user: nextUser, token: nextToken }) => {
    setUser(nextUser);
    setToken(nextToken);
  };

  const logout = () => {
    setUser(null);
    setToken('');
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
