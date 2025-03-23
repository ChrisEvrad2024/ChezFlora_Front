import { StorageService } from './StorageService';
import { AuthService } from './AuthService';

// Clé de stockage
const QUOTES_KEY = 'quotes';

// Statuts de devis
export const QUOTE_STATUS = {
  PENDING: 'pending',      // En attente de traitement par l'admin
  PROCESSING: 'processing', // En cours de traitement par l'admin
  SENT: 'sent',           // Devis envoyé au client, en attente de réponse
  ACCEPTED: 'accepted',    // Accepté par le client
  DECLINED: 'declined',    // Refusé par le client
  EXPIRED: 'expired',      // Devis expiré (plus valable)
  CANCELLED: 'cancelled'   // Annulé (par l'admin ou le client)
};

/**
 * Service de gestion des devis personnalisés
 */
export class QuoteService {
  /**
   * Récupère tous les devis de l'utilisateur courant
   * @returns {Array} Liste des devis
   */
  static getUserQuotes() {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return [];
    
    const allQuotes = StorageService.getLocalItem(QUOTES_KEY) || {};
    return allQuotes[currentUser.id] || [];
  }

  /**
   * Récupère tous les devis (pour admin)
   * @returns {Array} Liste de tous les devis
   */
  static getAllQuotes() {
    const allQuotes = StorageService.getLocalItem(QUOTES_KEY) || {};
    const quotes = [];
    
    // Transformer l'objet en tableau
    Object.keys(allQuotes).forEach(userId => {
      const userQuotes = allQuotes[userId] || [];
      userQuotes.forEach(quote => {
        quotes.push({
          ...quote,
          userId
        });
      });
    });
    
    // Trier par date (plus récente d'abord)
    return quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Récupère un devis par son ID
   * @param {string} quoteId ID du devis
   * @returns {Object|null} Devis ou null si non trouvé
   */
  static getQuoteById(quoteId) {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return null;
    
    const allQuotes = StorageService.getLocalItem(QUOTES_KEY) || {};
    const userQuotes = allQuotes[currentUser.id] || [];
    
    return userQuotes.find(quote => quote.id === quoteId) || null;
  }

  /**
   * Récupère un devis par son ID (admin)
   * @param {string} quoteId ID du devis
   * @returns {Object|null} Devis ou null si non trouvé
   */
  static getAnyQuoteById(quoteId) {
    const allQuotes = StorageService.getLocalItem(QUOTES_KEY) || {};
    
    for (const userId in allQuotes) {
      const userQuotes = allQuotes[userId] || [];
      const quote = userQuotes.find(quote => quote.id === quoteId);
      
      if (quote) {
        return {
          ...quote,
          userId
        };
      }
    }
    
    return null;
  }

  /**
   * Récupère les devis par statut
   * @param {string} status Statut des devis à récupérer
   * @returns {Array} Liste des devis filtrés par statut
   */
  static getQuotesByStatus(status) {
    const quotes = this.getAllQuotes();
    return quotes.filter(quote => quote.status === status);
  }

  /**
   * Crée une nouvelle demande de devis
   * @param {Object} quoteData Données du devis
   * @returns {Object|null} Devis créé ou null en cas d'échec
   */
  static createQuote(quoteData) {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return null;

    // Créer l'ID du devis
    const quoteId = `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Créer le nouveau devis
    const newQuote = {
      id: quoteId,
      status: QUOTE_STATUS.PENDING,
      title: quoteData.title || 'Demande de devis',
      eventType: quoteData.eventType,
      eventDate: quoteData.eventDate,
      description: quoteData.description,
      budget: quoteData.budget,
      customerName: `${currentUser.firstName} ${currentUser.lastName}`,
      customerEmail: currentUser.email,
      customerPhone: quoteData.phone,
      address: quoteData.address,
      attachments: quoteData.attachments || [],
      notes: quoteData.notes || '',
      adminNotes: '',
      
      // Partie ajoutée par l'administrateur
      quoteItems: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      validUntil: null,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: QUOTE_STATUS.PENDING,
          date: new Date().toISOString(),
          comment: "Demande de devis créée"
        }
      ]
    };
    
    // Sauvegarder le devis
    const allQuotes = StorageService.getLocalItem(QUOTES_KEY) || {};
    const userQuotes = allQuotes[currentUser.id] || [];
    
    userQuotes.push(newQuote);
    allQuotes[currentUser.id] = userQuotes;
    
    StorageService.setLocalItem(QUOTES_KEY, allQuotes);
    
    return newQuote;
  }

  /**
   * Met à jour un devis existant (admin)
   * @param {string} quoteId ID du devis
   * @param {Object} quoteData Nouvelles données du devis
   * @returns {Object|null} Devis mis à jour ou null en cas d'échec
   */
  static updateQuote(quoteId, quoteData) {
    const quote = this.getAnyQuoteById(quoteId);
    if (!quote) return null;
    
    const allQuotes = StorageService.getLocalItem(QUOTES_KEY) || {};
    const userQuotes = allQuotes[quote.userId] || [];
    const quoteIndex = userQuotes.findIndex(q => q.id === quoteId);
    
    if (quoteIndex === -1) return null;
    
    // Mettre à jour le devis
    const updatedQuote = {
      ...userQuotes[quoteIndex],
      ...quoteData,
      updatedAt: new Date().toISOString()
    };
    
    userQuotes[quoteIndex] = updatedQuote;
    allQuotes[quote.userId] = userQuotes;
    
    StorageService.setLocalItem(QUOTES_KEY, allQuotes);
    
    return updatedQuote;
  }

  /**
   * Met à jour le statut d'un devis
   * @param {string} quoteId ID du devis
   * @param {string} status Nouveau statut
   * @param {string} comment Commentaire optionnel
   * @returns {Object|null} Devis mis à jour ou null en cas d'échec
   */
  static updateQuoteStatus(quoteId, status, comment = "") {
    if (!Object.values(QUOTE_STATUS).includes(status)) {
      throw new Error("Statut invalide");
    }
    
    const quote = this.getAnyQuoteById(quoteId);
    if (!quote) return null;
    
    const allQuotes = StorageService.getLocalItem(QUOTES_KEY) || {};
    const userQuotes = allQuotes[quote.userId] || [];
    const quoteIndex = userQuotes.findIndex(q => q.id === quoteId);
    
    if (quoteIndex === -1) return null;
    
    // Mettre à jour le statut
    userQuotes[quoteIndex].status = status;
    userQuotes[quoteIndex].updatedAt = new Date().toISOString();
    
    // Ajouter à l'historique des statuts
    userQuotes[quoteIndex].statusHistory = userQuotes[quoteIndex].statusHistory || [];
    userQuotes[quoteIndex].statusHistory.push({
      status,
      date: new Date().toISOString(),
      comment: comment || `Statut modifié en "${status}"`
    });
    
    // Sauvegarder
    allQuotes[quote.userId] = userQuotes;
    StorageService.setLocalItem(QUOTES_KEY, allQuotes);
    
    return userQuotes[quoteIndex];
  }

  /**
   * Client: Accepte un devis
   * @param {string} quoteId ID du devis
   * @param {string} comment Commentaire optionnel
   * @returns {Object|null} Devis mis à jour ou null
   */
  static acceptQuote(quoteId, comment = "") {
    return this.updateQuoteStatus(
      quoteId,
      QUOTE_STATUS.ACCEPTED,
      comment || "Devis accepté par le client"
    );
  }

  /**
   * Client: Refuse un devis
   * @param {string} quoteId ID du devis
   * @param {string} reason Raison du refus
   * @returns {Object|null} Devis mis à jour ou null
   */
  static declineQuote(quoteId, reason = "") {
    return this.updateQuoteStatus(
      quoteId,
      QUOTE_STATUS.DECLINED,
      reason || "Devis refusé par le client"
    );
  }

  /**
   * Admin: Envoie un devis au client
   * @param {string} quoteId ID du devis
   * @param {Object} quoteDetails Détails du devis (items, prix, etc.)
   * @returns {Object|null} Devis mis à jour ou null
   */
  static sendQuote(quoteId, quoteDetails) {
    const quote = this.getAnyQuoteById(quoteId);
    if (!quote) return null;
    
    // Calculer la date d'expiration (par défaut: 30 jours)
    const validUntil = quoteDetails.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Mettre à jour les détails du devis
    const updatedQuote = this.updateQuote(quoteId, {
      ...quoteDetails,
      validUntil,
      status: QUOTE_STATUS.SENT
    });
    
    // Ajouter à l'historique
    this.updateQuoteStatus(
      quoteId,
      QUOTE_STATUS.SENT,
      "Devis envoyé au client"
    );
    
    return updatedQuote;
  }

  /**
   * Supprime un devis
   * @param {string} quoteId ID du devis
   * @returns {boolean} Succès ou échec
   */
  static deleteQuote(quoteId) {
    const quote = this.getAnyQuoteById(quoteId);
    if (!quote) return false;
    
    const allQuotes = StorageService.getLocalItem(QUOTES_KEY) || {};
    const userQuotes = allQuotes[quote.userId] || [];
    
    // Filtrer pour supprimer le devis
    const updatedQuotes = userQuotes.filter(q => q.id !== quoteId);
    
    // Si aucun devis n'a été supprimé
    if (updatedQuotes.length === userQuotes.length) return false;
    
    // Sauvegarder les devis mis à jour
    allQuotes[quote.userId] = updatedQuotes;
    StorageService.setLocalItem(QUOTES_KEY, allQuotes);
    
    return true;
  }

  /**
   * Annule un devis
   * @param {string} quoteId ID du devis
   * @param {string} reason Raison de l'annulation
   * @returns {Object|null} Devis annulé ou null
   */
  static cancelQuote(quoteId, reason = "") {
    return this.updateQuoteStatus(
      quoteId,
      QUOTE_STATUS.CANCELLED,
      reason || "Devis annulé"
    );
  }
}