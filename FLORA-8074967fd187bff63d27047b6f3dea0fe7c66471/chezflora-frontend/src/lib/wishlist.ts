
// Wishlist management utility functions

// Define wishlist item type
export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

// Get wishlist from localStorage
export const getWishlist = (): WishlistItem[] => {
  const wishlist = localStorage.getItem('wishlist');
  return wishlist ? JSON.parse(wishlist) : [];
};

// Add product to wishlist
export const addToWishlist = (item: WishlistItem): void => {
  const wishlist = getWishlist();
  // Check if product already exists in wishlist
  if (!wishlist.some(product => product.id === item.id)) {
    localStorage.setItem('wishlist', JSON.stringify([...wishlist, item]));
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('wishlistUpdated'));
  }
};

// Remove product from wishlist
export const removeFromWishlist = (id: string): void => {
  const wishlist = getWishlist();
  localStorage.setItem('wishlist', JSON.stringify(wishlist.filter(item => item.id !== id)));
  // Dispatch a custom event to notify other components
  window.dispatchEvent(new Event('wishlistUpdated'));
};

// Check if product is in wishlist
export const isInWishlist = (id: string): boolean => {
  const wishlist = getWishlist();
  return wishlist.some(item => item.id === id);
};

// Clear all items from wishlist
export const clearWishlist = (): void => {
  localStorage.setItem('wishlist', JSON.stringify([]));
  // Dispatch a custom event to notify other components
  window.dispatchEvent(new Event('wishlistUpdated'));
};

// Get wishlist item count
export const getWishlistCount = (): number => {
  return getWishlist().length;
};
