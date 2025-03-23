/*
* Ce service devrait être placé dans:
* /src/services/NewsletterService.js
*/

import { StorageService } from './StorageService';

// Clé de stockage
const NEWSLETTER_SUBSCRIBERS_KEY = 'newsletter_subscribers';

/**
 * Service de gestion des abonnements à la newsletter
 */
export class NewsletterService {
  /**
   * Récupère tous les abonnés à la newsletter
   * @returns {Array} Liste des emails des abonnés
   */
  static getAllSubscribers() {
    return StorageService.getLocalItem(NEWSLETTER_SUBSCRIBERS_KEY) || [];
  }

  /**
   * Vérifie si un email est déjà abonné
   * @param {string} email Email à vérifier
   * @returns {boolean} True si l'email est déjà abonné, false sinon
   */
  static isSubscribed(email) {
    const subscribers = this.getAllSubscribers();
    return subscribers.includes(email.toLowerCase());
  }

  /**
   * Ajoute un nouvel abonné à la newsletter
   * @param {string} email Email de l'abonné
   * @returns {boolean} Succès ou échec
   */
  static addSubscriber(email) {
    // Vérifier si l'email est valide
    if (!email || !email.includes('@')) {
      throw new Error("Email invalide");
    }
    
    // Normaliser l'email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Vérifier si l'abonné existe déjà
    if (this.isSubscribed(normalizedEmail)) {
      return false; // Déjà abonné
    }
    
    // Ajouter l'abonné
    const subscribers = this.getAllSubscribers();
    subscribers.push(normalizedEmail);
    
    // Sauvegarder
    return StorageService.setLocalItem(NEWSLETTER_SUBSCRIBERS_KEY, subscribers);
  }

  /**
   * Supprime un abonné de la newsletter
   * @param {string} email Email de l'abonné à supprimer
   * @returns {boolean} Succès ou échec
   */
  static removeSubscriber(email) {
    // Normaliser l'email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Vérifier si l'abonné existe
    if (!this.isSubscribed(normalizedEmail)) {
      return false; // Pas abonné
    }
    
    // Supprimer l'abonné
    const subscribers = this.getAllSubscribers();
    const updatedSubscribers = subscribers.filter(e => e !== normalizedEmail);
    
    // Sauvegarder
    return StorageService.setLocalItem(NEWSLETTER_SUBSCRIBERS_KEY, updatedSubscribers);
  }

  /**
   * Exporte la liste des abonnés (pour admin)
   * @returns {string} Données CSV
   */
  static exportSubscribersCSV() {
    const subscribers = this.getAllSubscribers();
    
    // Créer l'en-tête CSV
    let csv = "Email,DateAbonnement\n";
    
    // Ajouter chaque abonné
    subscribers.forEach(email => {
      // Nous n'avons pas de date d'abonnement stockée, donc on utilise la date actuelle
      csv += `${email},${new Date().toISOString()}\n`;
    });
    
    return csv;
  }
}