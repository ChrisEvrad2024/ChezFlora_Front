import { StorageService } from './StorageService';
import { toast } from 'sonner'; // Utilisation de la bibliothèque de toast existante

// Clés de stockage
const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const AUTH_TOKEN_KEY = 'authToken';

// Rôles disponibles
export const ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin'
};

/**
 * Service d'authentification
 */
export class AuthService {
  /**
   * Initialise les données de base si elles n'existent pas déjà
   */
  static initializeAuthData() {
    // Vérifier si les utilisateurs par défaut existent
    const users = StorageService.getLocalItem(USERS_KEY);
    
    if (!users || users.length === 0) {
      // Utilisateurs par défaut
      const defaultUsers = [
        {
          id: 'client1',
          email: 'client@gmail.com',
          // En production, nous utiliserions un vrai hachage
          // Pour la démonstration, nous encodons simplement le mot de passe
          password: btoa('00000000'), // Encodage Base64 simple
          role: ROLES.CLIENT,
          firstName: 'Client',
          lastName: 'Test',
          createdAt: new Date().toISOString()
        },
        {
          id: 'admin1',
          email: 'admin@gmail.com',
          password: btoa('00000000'),
          role: ROLES.ADMIN,
          firstName: 'Admin',
          lastName: 'Test',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sadmin1',
          email: 'sadmin@gmail.com',
          password: btoa('00000000'),
          role: ROLES.SUPER_ADMIN,
          firstName: 'Super',
          lastName: 'Admin',
          createdAt: new Date().toISOString()
        }
      ];
      
      // Enregistrer les utilisateurs par défaut
      StorageService.setLocalItem(USERS_KEY, defaultUsers);
      console.log('Utilisateurs par défaut initialisés');
    }
  }

  /**
   * Connecte un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Object} - Résultat de la connexion
   */
  // Dans la méthode login
static login(email, password) {
    const users = StorageService.getLocalItem(USERS_KEY) || [];
    
    // Recherche de l'utilisateur par email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Vérifier si l'utilisateur existe et si le mot de passe correspond
    if (user && btoa(password) === user.password) {
      // Créer une copie de l'utilisateur sans le mot de passe
      const { password, ...safeUser } = user;
      
      // Stocker l'utilisateur dans la session
      StorageService.setSessionItem(CURRENT_USER_KEY, safeUser);
      
      // Générer un token (fictif pour cette démonstration)
      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      StorageService.setSessionItem(AUTH_TOKEN_KEY, token);
      
      // Migrer le panier invité vers le panier utilisateur
      // Cette ligne doit être ajoutée
      if (typeof CartService !== 'undefined') {
        CartService.migrateGuestCart();
      }
      
      return { success: true, user: safeUser };
    }
    
    return { 
      success: false, 
      message: user ? 'Mot de passe incorrect' : 'Aucun compte trouvé avec cet email' 
    };
  }

  /**
   * Déconnecte l'utilisateur courant
   */
  static logout() {
    StorageService.removeSessionItem(CURRENT_USER_KEY);
    StorageService.removeSessionItem(AUTH_TOKEN_KEY);
    
    // Optionnel: supprimer aussi le panier en session
    StorageService.removeSessionItem('cart');
    
    return true;
  }

  /**
   * Inscrit un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Object} - Résultat de l'inscription
   */
  static register(userData) {
    const users = StorageService.getLocalItem(USERS_KEY) || [];
    
    // Vérifier si l'email existe déjà
    const emailExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (emailExists) {
      return { success: false, message: 'Un compte existe déjà avec cet email' };
    }
    
    // Créer le nouvel utilisateur
    const newUser = {
      id: `user_${Date.now()}`,
      email: userData.email,
      password: btoa(userData.password), // Encodage simple pour la démonstration
      role: ROLES.CLIENT, // Tous les nouveaux utilisateurs sont des clients
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: new Date().toISOString()
    };
    
    // Ajouter l'utilisateur à la liste
    users.push(newUser);
    StorageService.setLocalItem(USERS_KEY, users);
    
    // Connecter automatiquement
    const { password, ...safeUser } = newUser;
    StorageService.setSessionItem(CURRENT_USER_KEY, safeUser);
    
    // Générer un token
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    StorageService.setSessionItem(AUTH_TOKEN_KEY, token);
    
    return { success: true, user: safeUser };
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   * @returns {Object|null} - Utilisateur connecté ou null
   */
  static getCurrentUser() {
    return StorageService.getSessionItem(CURRENT_USER_KEY);
  }

  /**
   * Vérifie si un utilisateur est connecté
   * @returns {boolean}
   */
  static isAuthenticated() {
    return !!this.getCurrentUser();
  }

  /**
   * Vérifie si l'utilisateur courant a un rôle spécifique
   * @param {string} requiredRole - Rôle requis
   * @returns {boolean}
   */
  static hasRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Super admin a accès à tout
    if (user.role === ROLES.SUPER_ADMIN) return true;
    
    // Admin a accès aux fonctionnalités admin mais pas super admin
    if (user.role === ROLES.ADMIN && requiredRole === ROLES.ADMIN) return true;
    
    // Client a uniquement accès aux fonctionnalités client
    return user.role === requiredRole;
  }

  /**
   * Vérifie si l'utilisateur est un admin ou super admin
   * @returns {boolean}
   */
  static isAdmin() {
    const user = this.getCurrentUser();
    return user && (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN);
  }

  /**
   * Vérifie si l'utilisateur est un super admin
   * @returns {boolean}
   */
  static isSuperAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === ROLES.SUPER_ADMIN;
  }
}