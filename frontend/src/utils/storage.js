import { STORAGE_KEYS } from '../config/constants';

export const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

export const setToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

export const removeToken = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

export const getUserRole = () => {
  return localStorage.getItem(STORAGE_KEYS.USER_ROLE);
};

export const setUserRole = (role) => {
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
};

export const removeUserRole = () => {
  localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
};

export const clearAuth = () => {
  removeToken();
  removeUserRole();
};

export const isAuthenticated = () => {
  return !!getToken() && !!getUserRole();
}; 