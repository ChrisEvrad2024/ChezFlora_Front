import { StorageService } from './StorageService';

// Clés de stockage
const PRODUCTS_KEY = 'products';
const CATEGORIES_KEY = 'categories';

/**
 * Service de gestion des produits
 */
export class ProductService {
  /**
   * Initialise les données de base des produits si elles n'existent pas déjà
   */
  static initializeProductData() {
    // Vérifier si les catégories existent
    const categories = StorageService.getLocalItem(CATEGORIES_KEY);
    
    if (!categories || categories.length === 0) {
      // Catégories par défaut avec hiérarchie
      const defaultCategories = [
        {
          id: 'fresh-flowers',
          name: 'Fleurs Fraîches',
          description: 'Des fleurs fraîchement coupées pour illuminer votre intérieur.',
          parentId: null, // Catégorie principale
          order: 1
        },
        {
          id: 'roses',
          name: 'Roses',
          description: 'Élégantes et romantiques',
          parentId: 'fresh-flowers', // Sous-catégorie de Fleurs Fraîches
          order: 1
        },
        {
          id: 'tulips',
          name: 'Tulipes',
          description: 'Colorées et joyeuses',
          parentId: 'fresh-flowers', // Sous-catégorie de Fleurs Fraîches
          order: 2
        },
        {
          id: 'bouquets',
          name: 'Bouquets',
          description: 'Compositions florales magnifiquement arrangées pour toutes les occasions.',
          parentId: null, // Catégorie principale
          order: 2
        },
        {
          id: 'wedding-bouquets',
          name: 'Bouquets de mariée',
          description: 'Spécial pour votre grand jour',
          parentId: 'bouquets', // Sous-catégorie de Bouquets
          order: 1
        },
        {
          id: 'potted-plants',
          name: 'Plantes en Pot',
          description: 'Des plantes en pot pour apporter de la verdure à votre espace de vie.',
          parentId: null, // Catégorie principale
          order: 3
        },
        {
          id: 'floral-decor',
          name: 'Décoration Florale',
          description: 'Éléments décoratifs floraux pour embellir votre maison ou événement.',
          parentId: null, // Catégorie principale
          order: 4
        }
      ];
      
      // Enregistrer les catégories par défaut
      StorageService.setLocalItem(CATEGORIES_KEY, defaultCategories);
      console.log('Catégories par défaut initialisées');
    }

    // Vérifier si les produits existent
    const products = StorageService.getLocalItem(PRODUCTS_KEY);
    
    if (!products || products.length === 0) {
      // Quelques produits par défaut
      const defaultProducts = [
        {
          id: 'elegance-rose-bouquet',
          name: 'Bouquet Élégance Rose',
          description: 'Un bouquet raffiné de roses roses et blanches, parfait pour exprimer votre amour ou votre admiration.',
          price: 59.99,
          stock: 15,
          images: [
            'https://images.unsplash.com/photo-1537530360953-3b8b369e01fe?q=80&w=2070',
            'https://images.unsplash.com/photo-1594654281947-7114da78db59?q=80&w=1974'
          ],
          category: 'roses', // Maintenant utilisez la sous-catégorie
          popular: true,
          featured: true,
          sku: 'BQT-ROSE-001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'spring-harmony',
          name: 'Harmonie Printanière',
          description: 'Une explosion de couleurs printanières avec un mélange de tulipes, jonquilles et renoncules.',
          price: 49.99,
          stock: 8,
          images: [
            'https://images.unsplash.com/photo-1613539246066-78db6f03a16f?q=80&w=1974',
            'https://images.unsplash.com/photo-1546842931-886c185b4c8c?q=80&w=2085'
          ],
          category: 'tulips', // Sous-catégorie
          popular: true,
          featured: false,
          sku: 'BQT-SPRING-002',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'zen-orchid',
          name: 'Orchidée Zen',
          description: 'Une magnifique orchidée blanche en pot, symbole d\'élégance et de pureté.',
          price: 69.99,
          stock: 5,
          images: [
            'https://images.unsplash.com/photo-1524598171347-abf62dfd6694?q=80&w=1974',
            'https://images.unsplash.com/photo-1594663358079-4a39ff4f4ef4?q=80&w=1974'
          ],
          category: 'potted-plants',
          popular: true,
          featured: true,
          sku: 'PLT-ORCH-001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'wedding-bliss',
          name: 'Bouquet Mariage Félicité',
          description: 'Un élégant bouquet de mariage avec des roses blanches et des touches de verdure.',
          price: 89.99,
          stock: 3,
          images: [
            'https://images.unsplash.com/photo-1562348709-e8311c71594f?q=80&w=1974',
          ],
          category: 'wedding-bouquets',
          popular: true,
          featured: false,
          sku: 'WED-BQT-001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Enregistrer les produits par défaut
      StorageService.setLocalItem(PRODUCTS_KEY, defaultProducts);
      console.log('Produits par défaut initialisés');
    }
  }

  /**
   * Récupère tous les produits
   * @returns {Array} Liste des produits
   */
  static getAllProducts() {
    return StorageService.getLocalItem(PRODUCTS_KEY) || [];
  }

  /**
   * Récupère un produit par son ID
   * @param {string} id ID du produit
   * @returns {Object|null} Produit ou null si non trouvé
   */
  static getProductById(id) {
    const products = this.getAllProducts();
    return products.find(product => product.id === id) || null;
  }

  /**
   * Récupère les produits d'une catégorie
   * @param {string} categoryId ID de la catégorie
   * @param {boolean} includeSubcategories Inclure les produits des sous-catégories
   * @returns {Array} Produits de la catégorie
   */
  static getProductsByCategory(categoryId, includeSubcategories = true) {
    const products = this.getAllProducts();
    
    if (!includeSubcategories) {
      // Retourner uniquement les produits de cette catégorie spécifique
      return products.filter(product => product.category === categoryId);
    }
    
    // Récupérer toutes les sous-catégories de cette catégorie
    const subcategoriesIds = this.getSubcategoryIds(categoryId);
    
    // Inclure la catégorie principale et ses sous-catégories
    const allCategoryIds = [categoryId, ...subcategoriesIds];
    
    // Filtrer les produits qui appartiennent à l'une de ces catégories
    return products.filter(product => allCategoryIds.includes(product.category));
  }
  
  /**
   * Récupère toutes les sous-catégories d'une catégorie (récursivement)
   * @param {string} categoryId ID de la catégorie parente
   * @returns {Array<string>} Liste des IDs des sous-catégories
   */
  static getSubcategoryIds(categoryId) {
    const categories = this.getAllCategories();
    const directChildren = categories.filter(cat => cat.parentId === categoryId).map(cat => cat.id);
    
    // Récupérer récursivement les sous-catégories des enfants directs
    const descendantIds = directChildren.flatMap(childId => this.getSubcategoryIds(childId));
    
    // Retourner toutes les sous-catégories (enfants directs + descendants)
    return [...directChildren, ...descendantIds];
  }

  /**
   * Récupère les produits populaires
   * @param {number} limit Limite de produits à récupérer
   * @returns {Array} Produits populaires
   */
  static getPopularProducts(limit = 0) {
    const products = this.getAllProducts();
    const popularProducts = products.filter(product => product.popular);
    
    return limit > 0 ? popularProducts.slice(0, limit) : popularProducts;
  }

  /**
   * Récupère les produits en vedette
   * @param {number} limit Limite de produits à récupérer
   * @returns {Array} Produits en vedette
   */
  static getFeaturedProducts(limit = 0) {
    const products = this.getAllProducts();
    const featuredProducts = products.filter(product => product.featured);
    
    return limit > 0 ? featuredProducts.slice(0, limit) : featuredProducts;
  }

  /**
   * Ajoute un nouveau produit
   * @param {Object} productData Données du produit
   * @returns {Object} Produit ajouté
   */
  static addProduct(productData) {
    const products = this.getAllProducts();
    
    // Générer un ID si non fourni
    if (!productData.id) {
      productData.id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Ajouter les timestamps
    productData.createdAt = new Date().toISOString();
    productData.updatedAt = new Date().toISOString();
    
    // Ajouter le produit à la liste
    products.push(productData);
    StorageService.setLocalItem(PRODUCTS_KEY, products);
    
    return productData;
  }

  /**
   * Met à jour un produit existant
   * @param {string} id ID du produit
   * @param {Object} productData Nouvelles données du produit
   * @returns {Object|null} Produit mis à jour ou null si non trouvé
   */
  static updateProduct(id, productData) {
    const products = this.getAllProducts();
    const index = products.findIndex(product => product.id === id);
    
    if (index === -1) return null;
    
    // Mettre à jour les données du produit
    const updatedProduct = {
      ...products[index],
      ...productData,
      updatedAt: new Date().toISOString()
    };
    
    products[index] = updatedProduct;
    StorageService.setLocalItem(PRODUCTS_KEY, products);
    
    return updatedProduct;
  }

  /**
   * Supprime un produit
   * @param {string} id ID du produit
   * @returns {boolean} Succès ou échec
   */
  static deleteProduct(id) {
    const products = this.getAllProducts();
    const newProducts = products.filter(product => product.id !== id);
    
    // Vérifier si un produit a été supprimé
    if (newProducts.length === products.length) return false;
    
    StorageService.setLocalItem(PRODUCTS_KEY, newProducts);
    return true;
  }

  /**
   * Recherche des produits
   * @param {string} query Terme de recherche
   * @returns {Array} Produits correspondants
   */
  static searchProducts(query) {
    if (!query) return this.getAllProducts();
    
    const products = this.getAllProducts();
    const searchTerm = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.sku?.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Met à jour le stock d'un produit
   * @param {string} id ID du produit
   * @param {number} newStock Nouveau niveau de stock
   * @returns {Object|null} Produit mis à jour ou null si non trouvé
   */
  static updateProductStock(id, newStock) {
    return this.updateProduct(id, { stock: newStock });
  }

  // --- Gestion des catégories ---

  /**
   * Récupère toutes les catégories
   * @returns {Array} Liste des catégories
   */
  static getAllCategories() {
    return StorageService.getLocalItem(CATEGORIES_KEY) || [];
  }

  /**
   * Récupère uniquement les catégories principales (sans parent)
   * @returns {Array} Liste des catégories principales
   */
  static getMainCategories() {
    const categories = this.getAllCategories();
    return categories.filter(category => !category.parentId).sort((a, b) => a.order - b.order);
  }

  /**
   * Récupère les sous-catégories directes d'une catégorie
   * @param {string} parentId ID de la catégorie parente
   * @returns {Array} Liste des sous-catégories
   */
  static getChildCategories(parentId) {
    const categories = this.getAllCategories();
    return categories.filter(category => category.parentId === parentId).sort((a, b) => a.order - b.order);
  }

  /**
   * Récupère une catégorie par son ID
   * @param {string} id ID de la catégorie
   * @returns {Object|null} Catégorie ou null si non trouvée
   */
  static getCategoryById(id) {
    const categories = this.getAllCategories();
    return categories.find(category => category.id === id) || null;
  }

  /**
   * Récupère le chemin complet d'une catégorie (avec parents)
   * @param {string} categoryId ID de la catégorie
   * @returns {Array} Chemin complet (du parent au plus bas niveau)
   */
  static getCategoryPath(categoryId) {
    const categories = this.getAllCategories();
    const path = [];
    let currentId = categoryId;
    
    // Construire le chemin en remontant l'arborescence
    while (currentId) {
      const category = categories.find(cat => cat.id === currentId);
      if (!category) break;
      
      path.unshift(category);
      currentId = category.parentId;
    }
    
    return path;
  }

  /**
   * Ajoute une nouvelle catégorie
   * @param {Object} categoryData Données de la catégorie
   * @returns {Object} Catégorie ajoutée
   */
  static addCategory(categoryData) {
    const categories = this.getAllCategories();
    
    // Générer un ID si non fourni
    if (!categoryData.id) {
      // Créer un slug à partir du nom
      const slug = categoryData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
        .replace(/[\s_-]+/g, '-') // Remplacer les espaces par des tirets
        .replace(/^-+|-+$/g, ''); // Supprimer les tirets au début et à la fin
      
      categoryData.id = slug || `cat-${Date.now()}`;
    }
    
    // Définir l'ordre si non fourni
    if (categoryData.order === undefined) {
      // Trouver le plus grand ordre parmi les catégories du même niveau
      const siblings = categories.filter(cat => cat.parentId === categoryData.parentId);
      const maxOrder = siblings.reduce((max, cat) => Math.max(max, cat.order || 0), 0);
      categoryData.order = maxOrder + 1;
    }
    
    // Ajouter la catégorie à la liste
    categories.push(categoryData);
    StorageService.setLocalItem(CATEGORIES_KEY, categories);
    
    return categoryData;
  }

  /**
   * Met à jour une catégorie existante
   * @param {string} id ID de la catégorie
   * @param {Object} categoryData Nouvelles données de la catégorie
   * @returns {Object|null} Catégorie mise à jour ou null si non trouvée
   */
  static updateCategory(id, categoryData) {
    const categories = this.getAllCategories();
    const index = categories.findIndex(category => category.id === id);
    
    if (index === -1) return null;
    
    // Vérifier qu'on ne crée pas de boucle (un parent ne peut pas être son propre descendant)
    if (categoryData.parentId) {
      let parentId = categoryData.parentId;
      while (parentId) {
        if (parentId === id) {
          // Boucle détectée, annuler le changement de parent
          delete categoryData.parentId;
          break;
        }
        const parent = categories.find(cat => cat.id === parentId);
        if (!parent) break;
        parentId = parent.parentId;
      }
    }
    
    // Mettre à jour les données de la catégorie
    const updatedCategory = {
      ...categories[index],
      ...categoryData
    };
    
    categories[index] = updatedCategory;
    StorageService.setLocalItem(CATEGORIES_KEY, categories);
    
    return updatedCategory;
  }

  /**
   * Supprime une catégorie
   * @param {string} id ID de la catégorie
   * @param {boolean} reassignProducts Réattribuer les produits à la catégorie parente
   * @returns {boolean} Succès ou échec
   */
  static deleteCategory(id, reassignProducts = false) {
    const categories = this.getAllCategories();
    const categoryToDelete = categories.find(cat => cat.id === id);
    
    if (!categoryToDelete) return false;
    
    // Récupérer les sous-catégories
    const childCategories = categories.filter(cat => cat.parentId === id);
    
    // Vérifier s'il y a des produits dans cette catégorie
    const productsInCategory = this.getProductsByCategory(id, false);
    
    if (productsInCategory.length > 0 && !reassignProducts) {
      // Ne pas supprimer si des produits y sont associés et qu'on ne veut pas les réattribuer
      return false;
    }
    
    // Option 1: Réattribuer les produits à la catégorie parente
    if (reassignProducts && productsInCategory.length > 0) {
      const parentId = categoryToDelete.parentId || 'uncategorized';
      
      // Mettre à jour les produits
      const products = this.getAllProducts();
      const updatedProducts = products.map(product => {
        if (product.category === id) {
          return { ...product, category: parentId };
        }
        return product;
      });
      
      // Sauvegarder les produits mis à jour
      StorageService.setLocalItem(PRODUCTS_KEY, updatedProducts);
    }
    
    // Mettre à jour les sous-catégories pour qu'elles pointent vers le parent de la catégorie supprimée
    const updatedCategories = categories
      .filter(cat => cat.id !== id) // Supprimer la catégorie
      .map(cat => {
        if (cat.parentId === id) {
          // Réattribuer les sous-catégories au parent de la catégorie supprimée
          return { ...cat, parentId: categoryToDelete.parentId || null };
        }
        return cat;
      });
    
    StorageService.setLocalItem(CATEGORIES_KEY, updatedCategories);
    
    return true;
  }

  /**
   * Réorganise les catégories
   * @param {string} categoryId ID de la catégorie à déplacer
   * @param {number} newOrder Nouvel ordre
   * @param {string|null} newParentId Nouvel ID parent (ou null pour catégorie principale)
   * @returns {boolean} Succès ou échec
   */
  static reorderCategory(categoryId, newOrder, newParentId = null) {
    const categories = this.getAllCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) return false;
    
    // Mettre à jour la catégorie
    const updatedCategory = {
      ...categories[categoryIndex],
      order: newOrder,
      parentId: newParentId
    };
    
    categories[categoryIndex] = updatedCategory;
    
    // Réordonner les autres catégories du même niveau si nécessaire
    const siblings = categories.filter(cat => 
      cat.id !== categoryId && cat.parentId === newParentId
    );
    
    // Trier les frères/sœurs par ordre
    const sortedSiblings = siblings.sort((a, b) => a.order - b.order);
    
    // Réattribuer les ordres pour éviter les conflits
    let currentOrder = 1;
    const reorderedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return updatedCategory;
      }
      
      if (cat.parentId === newParentId) {
        if (currentOrder === newOrder) currentOrder++;
        
        const reorderedCat = { ...cat, order: currentOrder++ };
        return reorderedCat;
      }
      
      return cat;
    });
    
    StorageService.setLocalItem(CATEGORIES_KEY, reorderedCategories);
    return true;
  }
}