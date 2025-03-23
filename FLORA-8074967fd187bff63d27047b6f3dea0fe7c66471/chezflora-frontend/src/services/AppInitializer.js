import { AuthService } from './AuthService';
import { ProductService } from './ProductService';
import { TagService } from './TagService';
import { BlogService } from './BlogService';

/**
 * Service d'initialisation de l'application
 */
export class AppInitializer {
  /**
   * Initialise toutes les données par défaut de l'application
   */
  static initialize() {
    console.log('Initialisation de l\'application...');
    
    // Initialiser les données d'authentification
    AuthService.initializeAuthData();
    
    // Initialiser les données des produits
    ProductService.initializeProductData();
    
    // Initialiser les données des tags
    TagService.initializeTagData();
    
    // Initialiser les données du blog
    BlogService.initializeBlogData();
    
    // Vérifier si des articles programmés doivent être publiés
    BlogService.publishScheduledPosts();
    
    // D'autres initialisations seront ajoutées plus tard
    
    // Mettre en place des intervalles de vérification pour certaines données
    setupTimedChecks();
  }
}

/**
 * Configure les vérifications périodiques pour certaines fonctionnalités
 */
function setupTimedChecks() {
  // Vérifier les articles programmés toutes les minutes
  setInterval(() => {
    const publishedCount = BlogService.publishScheduledPosts();
    if (publishedCount > 0) {
      console.log(`${publishedCount} article(s) programmé(s) publié(s) automatiquement`);
    }
  }, 60000); // 60 secondes
}