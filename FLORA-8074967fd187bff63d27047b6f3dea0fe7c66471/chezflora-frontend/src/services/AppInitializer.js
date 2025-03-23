import { AuthService } from './AuthService';
import { ProductService } from './ProductService';
import { TagService } from './TagService';

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
    
    // D'autres initialisations seront ajoutées plus tard
  }
}