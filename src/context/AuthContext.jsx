import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('edualert_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      setLoading(false);

      if (json.success) {
        const sessionUser = json.data;
        setUser(sessionUser);
        localStorage.setItem('edualert_user', JSON.stringify(sessionUser));
        return { success: true };
      } else {
        setError(json.message);
        return { success: false, message: json.message };
      }
    } catch (err) {
      setLoading(false);
      const msg = 'Error de conexión con el servidor.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async ({ name, email, password, role, department }) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, department }),
      });
      const json = await res.json();
      setLoading(false);

      if (json.success) {
        const sessionUser = json.data;
        setUser(sessionUser);
        localStorage.setItem('edualert_user', JSON.stringify(sessionUser));
        return { success: true };
      } else {
        setError(json.message);
        return { success: false, message: json.message };
      }
    } catch (err) {
      setLoading(false);
      const msg = 'Error de conexión con el servidor.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edualert_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
