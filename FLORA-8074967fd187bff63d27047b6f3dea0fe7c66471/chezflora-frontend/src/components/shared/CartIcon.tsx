
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { getCartItemCount } from '@/lib/cart';

const CartIcon = () => {
  const [itemCount, setItemCount] = useState(0);
  
  useEffect(() => {
    // Update item count when component mounts
    setItemCount(getCartItemCount());
    
    // Listen for storage events to update cart count when cart changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        setItemCount(getCartItemCount());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for updates from the same window
    const handleCartUpdate = () => {
      setItemCount(getCartItemCount());
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Check for updates every 2 seconds (as a fallback)
    const interval = setInterval(() => {
      setItemCount(getCartItemCount());
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      clearInterval(interval);
    };
  }, []);
  
  return (
    <Link to="/cart" className="relative p-2 hover:text-primary transition-colors">
      <ShoppingBag size={20} />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
