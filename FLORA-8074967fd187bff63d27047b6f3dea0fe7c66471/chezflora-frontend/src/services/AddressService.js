import { StorageService } from './StorageService';
import { AuthService } from './AuthService';

// Clé de stockage
const ADDRESSES_KEY = 'user_addresses';

/**
 * Service de gestion des adresses
 */
export class AddressService {
  /**
   * Récupère toutes les adresses de l'utilisateur courant
   * @returns {Array} Liste des adresses
   */
  static getUserAddresses() {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return [];
    
    const allAddresses = StorageService.getLocalItem(ADDRESSES_KEY) || {};
    return allAddresses[currentUser.id] || [];
  }

  /**
   * Récupère une adresse spécifique par son ID
   * @param {string} addressId ID de l'adresse
   * @returns {Object|null} Adresse ou null si non trouvée
   */
  static getAddressById(addressId) {
    const addresses = this.getUserAddresses();
    return addresses.find(address => address.id === addressId) || null;
  }

  /**
   * Récupère les adresses par type (livraison ou facturation)
   * @param {string} type Type d'adresse ('shipping' ou 'billing')
   * @returns {Array} Liste des adresses filtrées
   */
  static getAddressesByType(type) {
    const addresses = this.getUserAddresses();
    return addresses.filter(address => address.type === type);
  }

  /**
   * Récupère l'adresse par défaut d'un certain type
   * @param {string} type Type d'adresse ('shipping' ou 'billing')
   * @returns {Object|null} Adresse par défaut ou null
   */
  static getDefaultAddress(type) {
    const addresses = this.getAddressesByType(type);
    return addresses.find(address => address.isDefault) || null;
  }

  /**
   * Ajoute une nouvelle adresse
   * @param {Object} addressData Données de l'adresse
   * @returns {Object|null} Adresse ajoutée ou null en cas d'échec
   */
  static addAddress(addressData) {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return null;
    
    const allAddresses = StorageService.getLocalItem(ADDRESSES_KEY) || {};
    const userAddresses = allAddresses[currentUser.id] || [];
    
    // Générer un ID si non fourni
    if (!addressData.id) {
      addressData.id = `addr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Si cette adresse est définie par défaut, réinitialiser les autres du même type
    if (addressData.isDefault) {
      userAddresses.forEach(addr => {
        if (addr.type === addressData.type) {
          addr.isDefault = false;
        }
      });
    }
    
    // Si aucune adresse de ce type n'existe, la définir par défaut
    const sameTypeAddresses = userAddresses.filter(addr => addr.type === addressData.type);
    if (sameTypeAddresses.length === 0) {
      addressData.isDefault = true;
    }
    
    // Ajouter à la liste d'adresses
    userAddresses.push(addressData);
    allAddresses[currentUser.id] = userAddresses;
    
    StorageService.setLocalItem(ADDRESSES_KEY, allAddresses);
    return addressData;
  }

  /**
   * Met à jour une adresse existante
   * @param {string} addressId ID de l'adresse
   * @param {Object} addressData Nouvelles données de l'adresse
   * @returns {Object|null} Adresse mise à jour ou null en cas d'échec
   */
  static updateAddress(addressId, addressData) {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return null;
    
    const allAddresses = StorageService.getLocalItem(ADDRESSES_KEY) || {};
    const userAddresses = allAddresses[currentUser.id] || [];
    
    const index = userAddresses.findIndex(addr => addr.id === addressId);
    if (index === -1) return null;
    
    // Si cette adresse est définie par défaut, réinitialiser les autres du même type
    if (addressData.isDefault) {
      userAddresses.forEach(addr => {
        if (addr.id !== addressId && addr.type === userAddresses[index].type) {
          addr.isDefault = false;
        }
      });
    }
    
    // Mettre à jour l'adresse
    const updatedAddress = {
      ...userAddresses[index],
      ...addressData
    };
    
    userAddresses[index] = updatedAddress;
    allAddresses[currentUser.id] = userAddresses;
    
    StorageService.setLocalItem(ADDRESSES_KEY, allAddresses);
    return updatedAddress;
  }

  /**
   * Définit une adresse comme adresse par défaut
   * @param {string} addressId ID de l'adresse
   * @returns {boolean} Succès ou échec
   */
  static setDefaultAddress(addressId) {
    const address = this.getAddressById(addressId);
    if (!address) return false;
    
    return !!this.updateAddress(addressId, { isDefault: true });
  }

  /**
   * Supprime une adresse
   * @param {string} addressId ID de l'adresse
   * @returns {boolean} Succès ou échec
   */
  static deleteAddress(addressId) {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return false;
    
    const allAddresses = StorageService.getLocalItem(ADDRESSES_KEY) || {};
    const userAddresses = allAddresses[currentUser.id] || [];
    
    // Vérifier si l'adresse existe
    const address = userAddresses.find(addr => addr.id === addressId);
    if (!address) return false;
    
    // Supprimer l'adresse
    const updatedAddresses = userAddresses.filter(addr => addr.id !== addressId);
    
    // Si c'était une adresse par défaut, définir une nouvelle adresse par défaut
    if (address.isDefault && updatedAddresses.length > 0) {
      const sameTypeAddresses = updatedAddresses.filter(addr => addr.type === address.type);
      if (sameTypeAddresses.length > 0) {
        sameTypeAddresses[0].isDefault = true;
      }
    }
    
    allAddresses[currentUser.id] = updatedAddresses;
    StorageService.setLocalItem(ADDRESSES_KEY, allAddresses);
    
    return true;
  }
}