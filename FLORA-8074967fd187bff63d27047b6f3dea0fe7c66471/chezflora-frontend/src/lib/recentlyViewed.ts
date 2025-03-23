
import { Product } from "@/types/product";

const RECENTLY_VIEWED_KEY = "recentlyViewed";

export function getRecentlyViewed(): Product[] {
  try {
    const recentlyViewed = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return recentlyViewed ? JSON.parse(recentlyViewed) : [];
  } catch (error) {
    console.error("Failed to parse recently viewed products from localStorage:", error);
    return [];
  }
}

export function addToRecentlyViewed(product: Product) {
  const recentlyViewed = getRecentlyViewed();
  
  // Check if the product is already in the list
  const existingIndex = recentlyViewed.findIndex((p) => p.id === product.id);
  
  if (existingIndex !== -1) {
    // If it exists, remove it to move it to the front
    recentlyViewed.splice(existingIndex, 1);
  }
  
  // Add the product to the beginning of the list
  recentlyViewed.unshift(product);

  // Limit the list to a maximum of 5 products
  const limitedRecentlyViewed = recentlyViewed.slice(0, 5);
  
  try {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(limitedRecentlyViewed));
  } catch (error) {
    console.error("Failed to save recently viewed product to localStorage:", error);
  }
}

// Maintain backwards compatibility
export const getRecentlyViewedProducts = getRecentlyViewed;
export const addRecentlyViewedProduct = addToRecentlyViewed;
