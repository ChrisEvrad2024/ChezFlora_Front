/**
 * Service de gestion du stockage (localStorage, sessionStorage et IndexedDB)
 */
export class StorageService {
    // ==================== LocalStorage ====================

    /**
     * Récupère une valeur depuis localStorage
     * @param {string} key - Clé de stockage
     * @returns {any} - Valeur décodée ou null
     */
    static getLocalItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Erreur lors de la récupération de ${key} depuis localStorage`, error);
            return null;
        }
    }

    /**
     * Enregistre une valeur dans localStorage
     * @param {string} key - Clé de stockage
     * @param {any} value - Valeur à stocker
     * @returns {boolean} - Succès ou échec
     */
    static setLocalItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Erreur lors de l'enregistrement de ${key} dans localStorage`, error);
            return false;
        }
    }

    /**
     * Supprime une entrée du localStorage
     * @param {string} key - Clé à supprimer
     */
    static removeLocalItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Erreur lors de la suppression de ${key} dans localStorage`, error);
            return false;
        }
    }

    // ==================== SessionStorage ====================

    /**
     * Récupère une valeur depuis sessionStorage
     * @param {string} key - Clé de stockage
     * @returns {any} - Valeur décodée ou null
     */
    static getSessionItem(key) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Erreur lors de la récupération de ${key} depuis sessionStorage`, error);
            return null;
        }
    }

    /**
     * Enregistre une valeur dans sessionStorage
     * @param {string} key - Clé de stockage
     * @param {any} value - Valeur à stocker
     * @returns {boolean} - Succès ou échec
     */
    static setSessionItem(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Erreur lors de l'enregistrement de ${key} dans sessionStorage`, error);
            return false;
        }
    }

    /**
     * Supprime une entrée du sessionStorage
     * @param {string} key - Clé à supprimer
     */
    static removeSessionItem(key) {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Erreur lors de la suppression de ${key} dans sessionStorage`, error);
            return false;
        }
    }

    // ==================== IndexedDB ====================
    // Cette partie sera implémentée plus tard pour les données volumineuses
}