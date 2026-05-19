import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gc_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    // Default admin account for the panel
    if (email === 'admin@gamezone.com' && password === 'admin123') {
      const defaultUser = { id: 'admin-1', name: 'Super Admin', email: 'admin@gamezone.com', role: 'Super Admin' };
      setUser(defaultUser);
      localStorage.setItem('gc_active_user', JSON.stringify(defaultUser));
      return { success: true };
    }

    // Checking against local storage for any previously added users (optional)
    const users = JSON.parse(localStorage.getItem('gc_users') || '[]');
    const existingUser = users.find(u => u.email === email && u.password === password);
    
    if (existingUser) {
      const { password, ...userWithoutPassword } = existingUser;
      setUser(userWithoutPassword);
      localStorage.setItem('gc_active_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gc_active_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
