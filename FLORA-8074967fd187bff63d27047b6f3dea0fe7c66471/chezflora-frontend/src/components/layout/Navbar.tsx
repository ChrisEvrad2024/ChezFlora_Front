import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Heart, User, LogOut, Settings } from 'lucide-react';
import { getCartItemCount, clearCart } from '@/lib/cart'; // Importez clearCart
import LanguageSelector from '@/components/shared/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  
  // Utilisation du contexte d'authentification
  const { currentUser, isAuthenticated, logout, isAdmin } = useAuth();

  // Stocker l'ID de l'utilisateur actuel pour détecter les changements
  const [previousUserId, setPreviousUserId] = useState(currentUser?.id || null);

  // Effet pour détecter les changements d'utilisateur et réinitialiser le panier si nécessaire
  useEffect(() => {
    // Si un utilisateur différent se connecte
    if (currentUser?.id && previousUserId !== currentUser.id) {
      // Sauvegarder le panier actuel dans le localStorage spécifique à l'ancien utilisateur
      if (previousUserId) {
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (currentCart.length > 0) {
          localStorage.setItem(`cart_${previousUserId}`, JSON.stringify(currentCart));
        }
      }
      
      // Vérifier si l'utilisateur actuel a un panier sauvegardé
      const savedUserCart = localStorage.getItem(`cart_${currentUser.id}`);
      
      if (savedUserCart) {
        // Restaurer le panier sauvegardé de l'utilisateur
        localStorage.setItem('cart', savedUserCart);
      } else {
        // Sinon, effacer le panier actuel
        clearCart();
      }
      
      // Mettre à jour le compteur
      setCartCount(getCartItemCount());
      
      // Déclencher un événement pour informer les autres composants
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Mettre à jour l'ID de l'utilisateur précédent
      setPreviousUserId(currentUser.id);
    } else if (!currentUser?.id && previousUserId) {
      // Si l'utilisateur se déconnecte, sauvegarder son panier
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (currentCart.length > 0) {
        localStorage.setItem(`cart_${previousUserId}`, JSON.stringify(currentCart));
      }
      
      // Effacer le panier actif
      clearCart();
      setCartCount(0);
      
      // Mettre à jour l'ID précédent
      setPreviousUserId(null);
      
      // Informer les autres composants
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [currentUser, previousUserId]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Update cart count on mount and when localStorage changes
    const updateCartCount = () => {
      setCartCount(getCartItemCount());
    };
    
    updateCartCount();
    
    // Listen for storage events to update cart count when it changes in another tab
    window.addEventListener('storage', updateCartCount);
    
    // Custom event for cart updates within the same tab
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    // Sauvegarder le panier avant la déconnexion
    if (currentUser?.id) {
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (currentCart.length > 0) {
        localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(currentCart));
      }
    }
    
    // Effacer le panier actif
    clearCart();
    
    // Se déconnecter
    logout();
    navigate('/');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'navbar-scrolled py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/"
          className="font-serif text-2xl font-medium tracking-tight"
        >
          ChezFlora
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            Accueil
          </Link>
          <Link 
            to="/catalog" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            Boutique
          </Link>
          <Link 
            to="/wishlist" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            Wishlist
          </Link>
          <Link 
            to="/about" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            À Propos
          </Link>
          <Link 
            to="/blog" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            Blog
          </Link>
          <Link 
            to="/contact" 
            className="text-sm font-medium hover:text-primary transition-colors animate-underline"
          >
            Contact
          </Link>
          
          {/* Bouton Admin conditionnel - affiché uniquement pour les admins */}
          {isAdmin() && (
            <Link 
              to="/admin" 
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors animate-underline"
            >
              Administration
            </Link>
          )}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-2">
          <LanguageSelector />
          <button className="p-2 hover:text-primary transition-colors">
            <Search size={20} />
          </button>
          <Link to="/wishlist" className="p-2 hover:text-primary transition-colors relative">
            <Heart size={20} />
          </Link>
          <Link to="/cart" className="p-2 hover:text-primary transition-colors relative">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          
          {/* Menu utilisateur */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:text-primary transition-colors relative">
                  <User size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium">
                  Bonjour, {currentUser?.firstName}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account" className="cursor-pointer">
                    Mon compte
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/orders" className="cursor-pointer">
                    Mes commandes
                  </Link>
                </DropdownMenuItem>
                {isAdmin() && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Settings size={16} className="mr-2" /> Administration
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut size={16} className="mr-2" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link 
              to="/auth/login" 
              className="p-2 hover:text-primary transition-colors"
            >
              <User size={20} />
            </Link>
          )}
          
          <button 
            className="md:hidden p-2 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 pt-20 px-4">
          <nav className="flex flex-col space-y-6 items-center">
            <Link 
              to="/" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              to="/catalog" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Boutique
            </Link>
            <Link 
              to="/wishlist" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Wishlist
            </Link>
            <Link 
              to="/about" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              À Propos
            </Link>
            <Link 
              to="/blog" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              to="/contact" 
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            {/* Bouton Admin conditionnel pour mobile */}
            {isAdmin() && (
              <Link 
                to="/admin" 
                className="text-lg font-medium text-primary hover:text-primary/80 transition-colors animate-underline"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Administration
              </Link>
            )}
            
            <Link 
              to={isAuthenticated ? "/account" : "/auth/login"}
              className="text-lg font-medium hover:text-primary transition-colors animate-underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {isAuthenticated ? "Mon compte" : "Connexion"}
            </Link>
            
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                className="text-destructive"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut size={16} className="mr-2" /> Déconnexion
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;