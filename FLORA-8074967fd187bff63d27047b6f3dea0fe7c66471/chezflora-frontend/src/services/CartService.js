import { StorageService } from './StorageService';
import { AuthService } from './AuthService';
import { ProductService } from './ProductService';

// Clés de stockage
const CART_STORAGE_KEY = "cart";
const GUEST_CART_KEY = "guest_cart";

/**
 * Service de gestion du panier
 */
export class CartService {
  /**
   * Récupère le panier actuel
   * @returns {Array} Contenu du panier
   */
  static getCart() {
    const currentUser = AuthService.getCurrentUser();
    
    if (currentUser) {
      // Utilisateur connecté - récupérer depuis le localStorage
      const allCarts = StorageService.getLocalItem(CART_STORAGE_KEY) || {};
      return allCarts[currentUser.id] || [];
    } else {
      // Utilisateur non connecté - récupérer depuis le sessionStorage
      return StorageService.getSessionItem(GUEST_CART_KEY) || [];
    }
  }

  /**
   * Sauvegarde le panier
   * @param {Array} cart Contenu du panier
   */
  static saveCart(cart) {
    const currentUser = AuthService.getCurrentUser();
    
    if (currentUser) {
      // Utilisateur connecté - sauvegarder dans le localStorage
      const allCarts = StorageService.getLocalItem(CART_STORAGE_KEY) || {};
      allCarts[currentUser.id] = cart;
      StorageService.setLocalItem(CART_STORAGE_KEY, allCarts);
    } else {
      // Utilisateur non connecté - sauvegarder dans le sessionStorage
      StorageService.setSessionItem(GUEST_CART_KEY, cart);
    }
    
    // Dispatch de l'événement pour indiquer que le panier a changé
    window.dispatchEvent(new Event('cartUpdated'));
  }

  /**
   * Ajoute un produit au panier
   * @param {Object} product Produit à ajouter
   * @param {number} quantity Quantité à ajouter
   */
  static addToCart(product, quantity = 1) {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Vérifier le stock
      const updatedQuantity = existingItem.quantity + quantity;
      const stock = ProductService.getProductById(product.id)?.stock;
      
      if (stock !== undefined && updatedQuantity > stock) {
        // La quantité dépasserait le stock disponible
        throw new Error(`La quantité demandée dépasse le stock disponible (${stock})`);
      }
      
      // Mettre à jour la quantité
      existingItem.quantity = updatedQuantity;
    } else {
      // Vérifier le stock
      const stock = ProductService.getProductById(product.id)?.stock;
      
      if (stock !== undefined && quantity > stock) {
        // La quantité dépasserait le stock disponible
        throw new Error(`La quantité demandée dépasse le stock disponible (${stock})`);
      }
      
      // Ajouter le produit
      cart.push({
        product,
        quantity
      });
    }
    
    this.saveCart(cart);
    return true;
  }

  /**
   * Supprime un produit du panier
   * @param {string} productId ID du produit à supprimer
   */
  static removeFromCart(productId) {
    const cart = this.getCart();
    const updatedCart = cart.filter(item => item.product.id !== productId);
    
    this.saveCart(updatedCart);
    return true;
  }

  /**
   * Met à jour la quantité d'un produit
   * @param {string} productId ID du produit
   * @param {number} quantity Nouvelle quantité
   */
  static updateCartItemQuantity(productId, quantity) {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    
    const cart = this.getCart();
    const item = cart.find(item => item.product.id === productId);
    
    if (!item) return false;
    
    // Vérifier le stock
    const stock = ProductService.getProductById(productId)?.stock;
    
    if (stock !== undefined && quantity > stock) {
      // La quantité dépasserait le stock disponible
      throw new Error(`La quantité demandée dépasse le stock disponible (${stock})`);
    }
    
    // Mettre à jour la quantité
    item.quantity = quantity;
    this.saveCart(cart);
    
    return true;
  }

  /**
   * Vide le panier
   */
  static clearCart() {
    this.saveCart([]);
    return true;
  }

  /**
   * Calcule le total du panier
   * @returns {number} Total du panier
   */
  static getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  /**
   * Compte le nombre d'articles dans le panier
   * @returns {number} Nombre d'articles
   */
  static getCartItemCount() {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Migre le panier d'un invité vers un utilisateur connecté
   * @returns {boolean} Succès ou échec
   */
  static migrateGuestCart() {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return false;
    
    // Récupérer le panier invité
    const guestCart = StorageService.getSessionItem(GUEST_CART_KEY) || [];
    if (guestCart.length === 0) return true; // Pas de panier à migrer
    
    // Récupérer le panier utilisateur
    const allCarts = StorageService.getLocalItem(CART_STORAGE_KEY) || {};
    const userCart = allCarts[currentUser.id] || [];
    
    // Fusionner les paniers
    const mergedCart = [...userCart];
    
    guestCart.forEach(guestItem => {
      const existingItem = mergedCart.find(item => item.product.id === guestItem.product.id);
      
      if (existingItem) {
        // Produit déjà dans le panier utilisateur - additionner les quantités
        existingItem.quantity += guestItem.quantity;
      } else {
        // Nouveau produit - ajouter au panier
        mergedCart.push(guestItem);
      }
    });
    
    // Sauvegarder le panier fusionné
    allCarts[currentUser.id] = mergedCart;
    StorageService.setLocalItem(CART_STORAGE_KEY, allCarts);
    
    // Supprimer le panier invité
    StorageService.removeSessionItem(GUEST_CART_KEY);
    
    // Dispatch de l'événement pour indiquer que le panier a changé
    window.dispatchEvent(new Event('cartUpdated'));
    
    return true;
  }
}