/**
 * LuxHair ZA - Cart Management Module
 * Handles all cart operations: add, remove, update, persist
 * NO UI LOGIC - only cart data management
 */

class CartManager {
    constructor() {
        this.cart = [];
        this.loadCart();
    }

    /**
     * Load cart from localStorage
     */
    loadCart() {
        try {
            const savedCart = localStorage.getItem('cart');
            this.cart = savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            this.cart = [];
        }
    }

    /**
     * Save cart to localStorage
     */
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    /**
     * Add item to cart
     * @param {string} productId - Product ID
     * @param {string} productName - Product name
     * @param {number} productPrice - Product price
     * @param {number} quantity - Quantity (default: 1)
     * @returns {Object} Updated cart item
     */
    addItem(productId, productName, productPrice, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: productId,
                name: productName,
                price: parseFloat(productPrice),
                quantity: quantity
            });
        }
        
        this.saveCart();
        return this.getItem(productId);
    }

    /**
     * Remove item from cart
     * @param {number} index - Item index in cart array
     * @returns {boolean} Success status
     */
    removeItem(index) {
        if (index >= 0 && index < this.cart.length) {
            this.cart.splice(index, 1);
            this.saveCart();
            return true;
        }
        return false;
    }

    /**
     * Remove item by product ID
     * @param {string} productId - Product ID
     * @returns {boolean} Success status
     */
    removeItemById(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        return this.removeItem(index);
    }

    /**
     * Update item quantity
     * @param {string} productId - Product ID
     * @param {number} quantity - New quantity
     * @returns {Object|null} Updated item or null
     */
    updateQuantity(productId, quantity) {
        const item = this.cart.find(i => i.id === productId);
        if (item) {
            item.quantity = Math.max(1, parseInt(quantity));
            this.saveCart();
            return item;
        }
        return null;
    }

    /**
     * Get specific item from cart
     * @param {string} productId - Product ID
     * @returns {Object|null} Cart item or null
     */
    getItem(productId) {
        return this.cart.find(item => item.id === productId) || null;
    }

    /**
     * Get all cart items
     * @returns {Array} All cart items
     */
    getItems() {
        return [...this.cart];
    }

    /**
     * Get cart total count (sum of quantities)
     * @returns {number} Total item count
     */
    getCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    /**
     * Get cart subtotal (sum of all items)
     * @returns {number} Subtotal amount
     */
    getSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    /**
     * Get cart total (can include shipping, tax, etc.)
     * @param {number} shipping - Shipping cost (default: 0)
     * @param {number} tax - Tax amount (default: 0)
     * @returns {number} Total amount
     */
    getTotal(shipping = 0, tax = 0) {
        return this.getSubtotal() + shipping + tax;
    }

    /**
     * Clear entire cart
     */
    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    /**
     * Check if cart is empty
     * @returns {boolean} True if empty
     */
    isEmpty() {
        return this.cart.length === 0;
    }

    /**
     * Get cart summary for checkout
     * @returns {Object} Cart summary
     */
    getSummary() {
        return {
            items: this.getItems(),
            count: this.getCount(),
            subtotal: this.getSubtotal(),
            total: this.getTotal()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}