import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/api';
import { ROUTES, STORAGE_KEYS, USER_ROLES } from '../config/constants';

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      authService.getCurrentUser()
        .then(response => {
          setUser(response.user);
        })
        .catch(() => {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { token, user } = response;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    setUser(user);
    return {
      ...response,
      redirectTo: user.role === USER_ROLES.HR ? ROUTES.HR_DASHBOARD : ROUTES.EMPLOYEE_DASHBOARD
    };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setUser(null);
    return ROUTES.LOGIN;
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth, AuthProvider }; 