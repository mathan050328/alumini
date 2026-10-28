import { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    const data = response.data;
    localStorage.setItem('accessToken', data.accessToken);
    const userData = {
      id: data.userId,
      rollNumber: data.rollNumber || null,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      profilePictureUrl: data.profilePictureUrl || null,
      passwordChanged: data.passwordChanged ?? true,
      isEmailVerified: data.isEmailVerified ?? false,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const register = async (userData) => {
    const response = await registerUser(userData);
    return response.data;
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const hasRole = (role) => {
    if (!user?.role || !role) return false;
    const cleanUserRole = String(user.role).replace(/^ROLE_/, '').toUpperCase();
    const cleanTargetRole = String(role).replace(/^ROLE_/, '').toUpperCase();
    return cleanUserRole === cleanTargetRole;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated, hasRole, checkAuth: () => !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
