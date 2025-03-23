import { StorageService } from './StorageService';
import { ProductService } from './ProductService';

// Clés de stockage
const TAGS_KEY = 'tags';
const PRODUCT_TAGS_KEY = 'product_tags';

/**
 * Service de gestion des tags
 */
export class TagService {
  /**
   * Initialise les données de base des tags si elles n'existent pas déjà
   */
  static initializeTagData() {
    // Vérifier si les tags existent
    const tags = StorageService.getLocalItem(TAGS_KEY);
    
    if (!tags || tags.length === 0) {
      // Tags par défaut
      const defaultTags = [
        {
          id: 'promotion',
          name: 'Promotion',
          description: 'Produits en promotion',
          color: '#ef4444', // Rouge
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'new',
          name: 'Nouveau',
          description: 'Nouveaux produits',
          color: '#3b82f6', // Bleu
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'bestseller',
          name: 'Meilleures ventes',
          description: 'Produits les plus vendus',
          color: '#f59e0b', // Orange
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'eco-friendly',
          name: 'Éco-responsable',
          description: 'Produits respectueux de l\'environnement',
          color: '#22c55e', // Vert
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Enregistrer les tags par défaut
      StorageService.setLocalItem(TAGS_KEY, defaultTags);
      console.log('Tags par défaut initialisés');
    }

    // Vérifier si les relations produit-tag existent
    const productTags = StorageService.getLocalItem(PRODUCT_TAGS_KEY);
    
    if (!productTags) {
      // Initialiser avec des relations pour les produits existants
      const products = ProductService.getAllProducts();
      const initialProductTags = {};
      
      // Assigner quelques tags aux produits existants
      if (products.length > 0) {
        // Premier produit: Nouveau + Meilleures ventes
        if (products[0]?.id) {
          initialProductTags[products[0].id] = ['new', 'bestseller'];
        }
        
        // Deuxième produit: Promotion
        if (products[1]?.id) {
          initialProductTags[products[1].id] = ['promotion'];
        }
        
        // Troisième produit: Éco-responsable
        if (products[2]?.id) {
          initialProductTags[products[2].id] = ['eco-friendly'];
        }
      }
      
      StorageService.setLocalItem(PRODUCT_TAGS_KEY, initialProductTags);
      console.log('Relations produit-tag initialisées');
    }
  }

  /**
   * Récupère tous les tags
   * @returns {Array} Liste des tags
   */
  static getAllTags() {
    return StorageService.getLocalItem(TAGS_KEY) || [];
  }

  /**
   * Récupère un tag par son ID
   * @param {string} id ID du tag
   * @returns {Object|null} Tag ou null si non trouvé
   */
  static getTagById(id) {
    const tags = this.getAllTags();
    return tags.find(tag => tag.id === id) || null;
  }

  /**
   * Ajoute un nouveau tag
   * @param {Object} tagData Données du tag
   * @returns {Object} Tag ajouté
   */
  static addTag(tagData) {
    const tags = this.getAllTags();
    
    // Générer un ID si non fourni
    if (!tagData.id) {
      // Créer un slug à partir du nom
      const slug = tagData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
        .replace(/[\s_-]+/g, '-') // Remplacer les espaces par des tirets
        .replace(/^-+|-+$/g, ''); // Supprimer les tirets au début et à la fin
      
      tagData.id = slug || `tag-${Date.now()}`;
    }
    
    // Ajouter les timestamps
    tagData.createdAt = new Date().toISOString();
    tagData.updatedAt = new Date().toISOString();
    
    // Ajouter le tag à la liste
    tags.push(tagData);
    StorageService.setLocalItem(TAGS_KEY, tags);
    
    return tagData;
  }

  /**
   * Met à jour un tag existant
   * @param {string} id ID du tag
   * @param {Object} tagData Nouvelles données du tag
   * @returns {Object|null} Tag mis à jour ou null si non trouvé
   */
  static updateTag(id, tagData) {
    const tags = this.getAllTags();
    const index = tags.findIndex(tag => tag.id === id);
    
    if (index === -1) return null;
    
    // Mettre à jour les données du tag
    const updatedTag = {
      ...tags[index],
      ...tagData,
      updatedAt: new Date().toISOString()
    };
    
    tags[index] = updatedTag;
    StorageService.setLocalItem(TAGS_KEY, tags);
    
    return updatedTag;
  }

  /**
   * Supprime un tag
   * @param {string} id ID du tag
   * @returns {boolean} Succès ou échec
   */
  static deleteTag(id) {
    const tags = this.getAllTags();
    const newTags = tags.filter(tag => tag.id !== id);
    
    // Vérifier si un tag a été supprimé
    if (newTags.length === tags.length) return false;
    
    StorageService.setLocalItem(TAGS_KEY, newTags);
    
    // Supprimer également les associations de ce tag avec les produits
    const productTags = this.getAllProductTags();
    const updatedProductTags = {};
    
    // Pour chaque produit, supprimer le tag de la liste des tags associés
    Object.keys(productTags).forEach(productId => {
      const productTagsList = productTags[productId].filter(tagId => tagId !== id);
      if (productTagsList.length > 0) {
        updatedProductTags[productId] = productTagsList;
      }
    });
    
    StorageService.setLocalItem(PRODUCT_TAGS_KEY, updatedProductTags);
    
    return true;
  }

  /**
   * Récupère toutes les associations produit-tag
   * @returns {Object} Associations produit-tag
   */
  static getAllProductTags() {
    return StorageService.getLocalItem(PRODUCT_TAGS_KEY) || {};
  }

  /**
   * Récupère les tags d'un produit
   * @param {string} productId ID du produit
   * @returns {Array} Tags associés au produit
   */
  static getProductTags(productId) {
    const productTags = this.getAllProductTags();
    const tagIds = productTags[productId] || [];
    const allTags = this.getAllTags();
    
    // Retourne les objets tag complets
    return allTags.filter(tag => tagIds.includes(tag.id));
  }

  /**
   * Récupère les produits associés à un tag
   * @param {string} tagId ID du tag
   * @returns {Array} Produits associés au tag
   */
  static getProductsByTag(tagId) {
    const productTags = this.getAllProductTags();
    const productIds = Object.keys(productTags).filter(productId => 
      productTags[productId].includes(tagId)
    );
    
    const allProducts = ProductService.getAllProducts();
    
    // Retourne les objets produit complets
    return allProducts.filter(product => productIds.includes(product.id));
  }

  /**
   * Attribue des tags à un produit
   * @param {string} productId ID du produit
   * @param {Array} tagIds IDs des tags à attribuer
   * @returns {Array} Liste des tags attribués
   */
  static setProductTags(productId, tagIds) {
    const productTags = this.getAllProductTags();
    
    // Mettre à jour les tags du produit
    productTags[productId] = tagIds;
    
    StorageService.setLocalItem(PRODUCT_TAGS_KEY, productTags);
    
    return tagIds;
  }

  /**
   * Ajoute un tag à un produit
   * @param {string} productId ID du produit
   * @param {string} tagId ID du tag
   * @returns {boolean} Succès ou échec
   */
  static addTagToProduct(productId, tagId) {
    const productTags = this.getAllProductTags();
    const currentTags = productTags[productId] || [];
    
    // Vérifier si le tag est déjà attribué
    if (currentTags.includes(tagId)) {
      return false;
    }
    
    // Ajouter le tag
    productTags[productId] = [...currentTags, tagId];
    
    StorageService.setLocalItem(PRODUCT_TAGS_KEY, productTags);
    
    return true;
  }

  /**
   * Retire un tag d'un produit
   * @param {string} productId ID du produit
   * @param {string} tagId ID du tag
   * @returns {boolean} Succès ou échec
   */
  static removeTagFromProduct(productId, tagId) {
    const productTags = this.getAllProductTags();
    const currentTags = productTags[productId] || [];
    
    // Vérifier si le tag est attribué
    if (!currentTags.includes(tagId)) {
      return false;
    }
    
    // Retirer le tag
    productTags[productId] = currentTags.filter(id => id !== tagId);
    
    // Si plus aucun tag, supprimer l'entrée
    if (productTags[productId].length === 0) {
      delete productTags[productId];
    }
    
    StorageService.setLocalItem(PRODUCT_TAGS_KEY, productTags);
    
    return true;
  }

  /**
   * Recherche des tags
   * @param {string} query Terme de recherche
   * @returns {Array} Tags correspondants
   */
  static searchTags(query) {
    if (!query) return this.getAllTags();
    
    const tags = this.getAllTags();
    const searchTerm = query.toLowerCase();
    
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm) ||
      tag.description.toLowerCase().includes(searchTerm)
    );
  }
}