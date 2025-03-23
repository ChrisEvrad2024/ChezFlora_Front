
import { Product } from "@/types/product";

const CART_STORAGE_KEY = "cart";

export interface CartItem {
  product: Product;
  quantity: number;
}

export function getCart(): CartItem[] {
  try {
    const cartString = localStorage.getItem(CART_STORAGE_KEY);
    return cartString ? JSON.parse(cartString) : [];
  } catch (error) {
    console.error("Failed to parse cart from localStorage:", error);
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
}

export function addToCart(product: Product, quantity: number = 1): void {
  const cart = getCart();
  const existingItemIndex = cart.findIndex((item) => item.product.id === product.id);

  if (existingItemIndex !== -1) {
    // If item already exists, update the quantity
    cart[existingItemIndex].quantity += quantity;
  } else {
    // If item doesn't exist, add it to the cart
    cart.push({ product, quantity });
  }

  saveCart(cart);
}

export function removeFromCart(productId: string): void {
  const cart = getCart();
  const updatedCart = cart.filter((item) => item.product.id !== productId);
  saveCart(updatedCart);
}

export function updateCartItemQuantity(productId: string, quantity: number): void {
  const cart = getCart();
  const updatedCart = cart.map((item) => {
    if (item.product.id === productId) {
      return { ...item, quantity };
    }
    return item;
  });
  saveCart(updatedCart);
}

export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
}

export function getCartTotal(): number {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
}

export function getCartItemCount(): number {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// Maintain backwards compatibility
export const addItemToCart = addToCart;
export const removeItemFromCart = removeFromCart;
