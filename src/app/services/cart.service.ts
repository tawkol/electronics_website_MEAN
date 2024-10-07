import { Injectable } from '@angular/core';

export type Product = {
  _id: number;
  name: string;
  price: number;
  img_urls: string;
  description: string;
  category: string[];
};
export type CartProduct = Product & { quantity: number };

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cart: CartProduct[] = this.getCartFromLocalStorage();

  // Helper function to get the cart from localStorage
  private getCartFromLocalStorage(): CartProduct[] {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }

  // Helper function to save the cart to localStorage
  private saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  // Add product to cart
  addToCart(product: Product): void {
    const existingProduct = this.cart.find((item) => item._id === product._id);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      const cartProduct: CartProduct = { ...product, quantity: 1 };
      this.cart.push(cartProduct);
    }
    this.saveCartToLocalStorage();
  }

  // Get all cart items
  getCart(): CartProduct[] {
    return this.cart;
  }

  // Get total items (for displaying in the navbar, etc.)
  getCartItemCount(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Increment product quantity by ID
  incrementProduct(id: number): void {
    const product = this.cart.find((item) => item._id === id);
    if (product) {
      product.quantity++;
      this.saveCartToLocalStorage();
    }
  }

  // Decrement product quantity by ID
  decrementProduct(id: number): void {
    const product = this.cart.find((item) => item._id === id);
    if (product) {
      product.quantity--;
      if (product.quantity <= 0) {
        this.deleteProduct(product);
      }
      this.saveCartToLocalStorage();
    }
  }

  // Remove a product from the cart
  deleteProduct(product: Product): void {
    this.cart = this.cart.filter((item) => item._id !== product._id);
    this.saveCartToLocalStorage();
  }

  // Get the total price of all products in the cart
  getTotal(): number {
    return this.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }
}
