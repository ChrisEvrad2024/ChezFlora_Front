import { StorageService } from './StorageService';
import { AuthService } from './AuthService';
import { CartService } from './CartService';
import { AddressService } from './AddressService';
import { ProductService } from './ProductService';

// Clé de stockage
const ORDERS_KEY = 'orders';

// Statuts de commande
export const ORDER_STATUS = {
  PENDING: 'pending',         // En attente de paiement
  PROCESSING: 'processing',   // En cours de traitement
  SHIPPED: 'shipped',         // Expédiée
  DELIVERED: 'delivered',     // Livrée
  CANCELLED: 'cancelled'      // Annulée
};

/**
 * Service de gestion des commandes
 */
export class OrderService {
  /**
   * Récupère toutes les commandes de l'utilisateur courant
   * @returns {Array} Liste des commandes
   */
  static getUserOrders() {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return [];
    
    const allOrders = StorageService.getLocalItem(ORDERS_KEY) || {};
    return allOrders[currentUser.id] || [];
  }

  /**
   * Récupère toutes les commandes (pour admin)
   * @returns {Array} Liste de toutes les commandes
   */
  static getAllOrders() {
    const allOrders = StorageService.getLocalItem(ORDERS_KEY) || {};
    const orders = [];
    
    // Transformer l'objet en tableau
    Object.keys(allOrders).forEach(userId => {
      const userOrders = allOrders[userId] || [];
      userOrders.forEach(order => {
        orders.push({
          ...order,
          userId
        });
      });
    });
    
    // Trier par date (plus récente d'abord)
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Récupère une commande par son ID
   * @param {string} orderId ID de la commande
   * @returns {Object|null} Commande ou null si non trouvée
   */
  static getOrderById(orderId) {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return null;
    
    const allOrders = StorageService.getLocalItem(ORDERS_KEY) || {};
    const userOrders = allOrders[currentUser.id] || [];
    
    return userOrders.find(order => order.id === orderId) || null;
  }

  /**
   * Récupère une commande par son ID (admin)
   * @param {string} orderId ID de la commande
   * @returns {Object|null} Commande ou null si non trouvée
   */
  static getAnyOrderById(orderId) {
    const allOrders = StorageService.getLocalItem(ORDERS_KEY) || {};
    
    for (const userId in allOrders) {
      const userOrders = allOrders[userId] || [];
      const order = userOrders.find(order => order.id === orderId);
      
      if (order) {
        return {
          ...order,
          userId
        };
      }
    }
    
    return null;
  }

  /**
   * Crée une nouvelle commande
   * @param {Object} orderData Données de la commande
   * @returns {Object|null} Commande créée ou null en cas d'échec
   */
  static createOrder(orderData) {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return null;
    
    // Récupérer le panier actuel
    const cart = CartService.getCart();
    if (cart.length === 0) {
      throw new Error("Le panier est vide");
    }
    
    // Vérifier les adresses
    const shippingAddress = orderData.shippingAddressId ? 
      AddressService.getAddressById(orderData.shippingAddressId) : null;
    
    const billingAddress = orderData.billingAddressId ? 
      AddressService.getAddressById(orderData.billingAddressId) : null;
    
    if (!shippingAddress || !billingAddress) {
      throw new Error("Les adresses de livraison et de facturation sont requises");
    }
    
    // Vérifier les stocks
    for (const item of cart) {
      const product = ProductService.getProductById(item.product.id);
      
      if (product && product.stock !== undefined && item.quantity > product.stock) {
        throw new Error(`Stock insuffisant pour "${product.name}"`);
      }
    }
    
    // Créer l'ID de commande
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Créer la nouvelle commande
    const newOrder = {
      id: orderId,
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : null
      })),
      shippingAddress: {
        id: shippingAddress.id,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone
      },
      billingAddress: {
        id: billingAddress.id,
        firstName: billingAddress.firstName,
        lastName: billingAddress.lastName,
        addressLine1: billingAddress.addressLine1,
        addressLine2: billingAddress.addressLine2,
        city: billingAddress.city,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country,
        phone: billingAddress.phone
      },
      status: ORDER_STATUS.PENDING,
      paymentMethod: orderData.paymentMethod,
      subtotal: CartService.getCartTotal(),
      shippingCost: orderData.shippingCost || 0,
      total: CartService.getCartTotal() + (orderData.shippingCost || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: ORDER_STATUS.PENDING,
          date: new Date().toISOString(),
          comment: "Commande créée"
        }
      ]
    };
    
    // Mettre à jour les stocks
    for (const item of cart) {
      const product = ProductService.getProductById(item.product.id);
      
      if (product && product.stock !== undefined) {
        ProductService.updateProductStock(product.id, product.stock - item.quantity);
      }
    }
    
    // Sauvegarder la commande
    const allOrders = StorageService.getLocalItem(ORDERS_KEY) || {};
    const userOrders = allOrders[currentUser.id] || [];
    
    userOrders.push(newOrder);
    allOrders[currentUser.id] = userOrders;
    
    StorageService.setLocalItem(ORDERS_KEY, allOrders);
    
    // Vider le panier
    CartService.clearCart();
    
    return newOrder;
  }

  /**
   * Met à jour le statut d'une commande (admin)
   * @param {string} orderId ID de la commande
   * @param {string} status Nouveau statut
   * @param {string} comment Commentaire optional
   * @returns {Object|null} Commande mise à jour ou null
   */
  static updateOrderStatus(orderId, status, comment = "") {
    if (!Object.values(ORDER_STATUS).includes(status)) {
      throw new Error("Statut invalide");
    }
    
    const order = this.getAnyOrderById(orderId);
    if (!order) return null;
    
    const allOrders = StorageService.getLocalItem(ORDERS_KEY) || {};
    const userOrders = allOrders[order.userId] || [];
    const orderIndex = userOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return null;
    
    // Mettre à jour le statut
    userOrders[orderIndex].status = status;
    userOrders[orderIndex].updatedAt = new Date().toISOString();
    
    // Ajouter à l'historique des statuts
    userOrders[orderIndex].statusHistory = userOrders[orderIndex].statusHistory || [];
    userOrders[orderIndex].statusHistory.push({
      status,
      date: new Date().toISOString(),
      comment: comment || `Statut modifié en "${status}"`
    });
    
    // Si la commande est annulée, remettre les produits en stock
    if (status === ORDER_STATUS.CANCELLED) {
      for (const item of userOrders[orderIndex].items) {
        const product = ProductService.getProductById(item.productId);
        
        if (product && product.stock !== undefined) {
          ProductService.updateProductStock(product.id, product.stock + item.quantity);
        }
      }
    }
    
    // Sauvegarder
    allOrders[order.userId] = userOrders;
    StorageService.setLocalItem(ORDERS_KEY, allOrders);
    
    return userOrders[orderIndex];
  }

  /**
   * Annule une commande
   * @param {string} orderId ID de la commande
   * @param {string} reason Raison de l'annulation
   * @returns {Object|null} Commande annulée ou null
   */
  static cancelOrder(orderId, reason = "") {
    return this.updateOrderStatus(
      orderId,
      ORDER_STATUS.CANCELLED,
      reason || "Commande annulée par le client"
    );
  }
}