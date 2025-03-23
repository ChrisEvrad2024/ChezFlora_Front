import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/AuthService';

// Création du contexte d'authentification
const AuthContext = createContext();

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * Fournisseur du contexte d'authentification
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  /**
   * Connecte un utilisateur
   */
  const login = async (email, password) => {
    const result = AuthService.login(email, password);
    if (result.success) {
      setCurrentUser(result.user);
    }
    return result;
  };

  /**
   * Déconnecte l'utilisateur
   */
  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  /**
   * Inscrit un nouvel utilisateur
   */
  const register = async (userData) => {
    const result = AuthService.register(userData);
    if (result.success) {
      setCurrentUser(result.user);
    }
    return result;
  };

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  const hasRole = (role) => {
    return AuthService.hasRole(role);
  };

  /**
   * Vérifie si l'utilisateur est admin ou super admin
   */
  const isAdmin = () => {
    return AuthService.isAdmin();
  };

  /**
   * Vérifie si l'utilisateur est super admin
   */
  const isSuperAdmin = () => {
    return AuthService.isSuperAdmin();
  };

  // Valeur du contexte
  const value = {
    currentUser,
    login,
    logout,
    register,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};