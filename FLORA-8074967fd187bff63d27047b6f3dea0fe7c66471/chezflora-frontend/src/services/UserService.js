import { StorageService } from './StorageService';
import { toast } from 'sonner';

// Clés de stockage
const USERS_KEY = 'users';
const AUDIT_LOGS_KEY = 'audit_logs';

/**
 * Service de gestion des utilisateurs
 */
export class UserService {
  /**
   * Récupère tous les utilisateurs
   * @returns {Array} Liste des utilisateurs
   */
  static getAllUsers() {
    return StorageService.getLocalItem(USERS_KEY) || [];
  }

  /**
   * Récupère un utilisateur par son ID
   * @param {string} userId ID de l'utilisateur
   * @returns {Object|null} Utilisateur ou null si non trouvé
   */
  static getUserById(userId) {
    const users = this.getAllUsers();
    return users.find(user => user.id === userId) || null;
  }

  /**
   * Récupère un utilisateur par son email
   * @param {string} email Email de l'utilisateur
   * @returns {Object|null} Utilisateur ou null si non trouvé
   */
  static getUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Ajoute un nouvel utilisateur
   * @param {Object} userData Données de l'utilisateur
   * @returns {Object|null} Utilisateur créé ou null en cas d'échec
   */
  static createUser(userData) {
    const users = this.getAllUsers();
    
    // Vérifier si l'email existe déjà
    if (this.getUserByEmail(userData.email)) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }
    
    // Créer le nouvel utilisateur
    const newUser = {
      id: userData.id || `user-${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password, // Devrait être déjà haché
      role: userData.role,
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
    };
    
    // Ajouter à la liste
    users.push(newUser);
    StorageService.setLocalItem(USERS_KEY, users);
    
    // Omettre le mot de passe pour le retour
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Met à jour un utilisateur existant
   * @param {string} userId ID de l'utilisateur
   * @param {Object} userData Nouvelles données de l'utilisateur
   * @returns {Object|null} Utilisateur mis à jour ou null en cas d'échec
   */
  static updateUser(userId, userData) {
    const users = this.getAllUsers();
    const index = users.findIndex(user => user.id === userId);
    
    if (index === -1) {
      return null;
    }
    
    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (userData.email && userData.email !== users[index].email) {
      const emailExists = users.some(
        (u, i) => i !== index && u.email.toLowerCase() === userData.email.toLowerCase()
      );
      
      if (emailExists) {
        throw new Error("Un utilisateur avec cet email existe déjà");
      }
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    
    users[index] = updatedUser;
    StorageService.setLocalItem(USERS_KEY, users);
    
    // Omettre le mot de passe pour le retour
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Supprime un utilisateur
   * @param {string} userId ID de l'utilisateur
   * @returns {boolean} Succès ou échec
   */
  static deleteUser(userId) {
    const users = this.getAllUsers();
    const newUsers = users.filter(user => user.id !== userId);
    
    // Vérifier si un utilisateur a été supprimé
    if (newUsers.length === users.length) {
      return false;
    }
    
    StorageService.setLocalItem(USERS_KEY, newUsers);
    return true;
  }

  /**
   * Change le statut d'un utilisateur
   * @param {string} userId ID de l'utilisateur
   * @param {string} status Nouveau statut (active, suspended, locked)
   * @returns {Object|null} Utilisateur mis à jour ou null en cas d'échec
   */
  static changeUserStatus(userId, status) {
    return this.updateUser(userId, { status });
  }

  /**
   * Change le rôle d'un utilisateur
   * @param {string} userId ID de l'utilisateur
   * @param {string} role Nouveau rôle
   * @returns {Object|null} Utilisateur mis à jour ou null en cas d'échec
   */
  static changeUserRole(userId, role) {
    return this.updateUser(userId, { role });
  }

  /**
   * Change le mot de passe d'un utilisateur
   * @param {string} userId ID de l'utilisateur
   * @param {string} newPassword Nouveau mot de passe (déjà haché)
   * @returns {boolean} Succès ou échec
   */
  static changeUserPassword(userId, newPassword) {
    const updated = this.updateUser(userId, { password: newPassword });
    return !!updated;
  }

  /**
   * Récupère tous les journaux d'audit
   * @returns {Array} Liste des journaux d'audit
   */
  static getAuditLogs() {
    return StorageService.getLocalItem(AUDIT_LOGS_KEY) || [];
  }

  /**
   * Ajoute une entrée au journal d'audit
   * @param {Object} logData Données du journal
   * @returns {Object} Entrée du journal ajoutée
   */
  static addAuditLog(logData) {
    const logs = this.getAuditLogs();
    
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...logData,
    };
    
    logs.unshift(newLog); // Ajouter au début pour voir les plus récents en premier
    StorageService.setLocalItem(AUDIT_LOGS_KEY, logs);
    
    return newLog;
  }
}